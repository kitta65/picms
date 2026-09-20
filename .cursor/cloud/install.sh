#!/usr/bin/env bash
#
# Cloud Agent install phase.
#
# This repository's development environment is defined by .devcontainer
# (a docker-compose stack: picms + postgres + dbgate). Cursor Cloud Agents
# don't consume devcontainer.json directly, so this script prepares the VM to
# run that same stack via the devcontainer CLI, matching .github/workflows/ci.yml.
#
# It only installs durable, idempotent state. Bringing the stack up happens in
# start.sh (per boot), because containers are not part of the install snapshot.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

# --- Disable Husky git hooks for the agent ------------------------------------
# The repo's pre-commit hook runs `bun run lint`/`test`, which need the
# devcontainer database. Cloud Agents commit from the VM shell, so disable
# hooks environment-wide via HUSKY=0 (see .husky/_/h). This is a login-shell
# system profile so it applies to the agent's shells.
echo 'export HUSKY=0' | sudo tee /etc/profile.d/husky.sh >/dev/null

# --- Docker engine + compose + nested-container helpers -----------------------
if ! command -v docker >/dev/null 2>&1; then
	sudo apt-get update -qq
	# --force-confold/--force-confdef keep existing conffiles (e.g. /etc/fuse.conf)
	# without the interactive prompt that would otherwise abort a non-tty install.
	sudo apt-get install -y -qq \
		-o Dpkg::Options::=--force-confold \
		-o Dpkg::Options::=--force-confdef \
		docker.io docker-compose-v2 fuse-overlayfs iptables uidmap
fi

# fuse-overlayfs is the storage driver that works for Docker nested inside the
# Cloud Agent VM (overlay2 is not usable on the VM's filesystem).
sudo mkdir -p /etc/docker
if [ ! -s /etc/docker/daemon.json ]; then
	echo '{ "storage-driver": "fuse-overlayfs" }' | sudo tee /etc/docker/daemon.json >/dev/null
fi
grep -q '^user_allow_other' /etc/fuse.conf 2>/dev/null \
	|| echo user_allow_other | sudo tee -a /etc/fuse.conf >/dev/null

# Let the agent user talk to the docker socket.
sudo groupadd -f docker
sudo usermod -aG docker "$USER" || true

# --- devcontainer CLI (pinned to the version used in CI) ----------------------
if ! command -v devcontainer >/dev/null 2>&1; then
	if ! command -v npm >/dev/null 2>&1; then
		export NVM_DIR="$HOME/.nvm"
		# shellcheck disable=SC1091
		[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
	fi
	npm install -g @devcontainers/cli@0.87.0
	DC="$(npm prefix -g)/bin/devcontainer"
	[ -x "$DC" ] && sudo ln -sf "$DC" /usr/local/bin/devcontainer
fi

# Starting dockerd and bringing the stack up is start.sh's responsibility
# (per-boot runtime state), so nothing Docker-runtime happens here.
echo "install.sh completed"
