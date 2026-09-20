#!/usr/bin/env bash
#
# Cloud Agent install phase.
#
# This repository's development environment is defined by .devcontainer
# (a docker-compose stack: picms + postgres + dbgate). Cursor Cloud Agents
# don't consume devcontainer.json directly, so this script prepares the VM to
# run that same stack via the devcontainer CLI, matching .github/workflows/ci.yml.
#
# It only installs durable, idempotent state. Running containers are not part
# of the install snapshot, so start.sh still starts dockerd and `devcontainer
# up`. Image layers in /var/lib/docker *are* snapshotted, and so is the
# workspace bun cache (.cache/bun, node_modules) written by `bun run setup`.
set -euo pipefail

CLOUD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=ensure-dockerd.sh
source "$CLOUD_DIR/ensure-dockerd.sh"

export DEBIAN_FRONTEND=noninteractive

# --- Disable Husky git hooks for the agent ------------------------------------
# The repo's pre-commit hook runs `bun run lint`/`test`, which need the
# devcontainer database. Cloud Agents commit from the VM shell, so disable
# hooks environment-wide via HUSKY=0 (see .husky/_/h). This is a login-shell
# system profile so it applies to the agent's shells.
echo 'export HUSKY=0' | sudo tee /etc/profile.d/husky.sh >/dev/null

# --- Docker for nested containers ---------------------------------------------
# The commands in this block follow the official nested-Docker guidance so they
# can be reviewed against the docs verbatim:
# https://cursor.com/docs/cloud-agent/setup#running-docker
# (Differences from the docs' Dockerfile snippet: everything is run with `sudo`
# and guarded for idempotency since this is an install script, not an image
# build; the docs' Ubuntu-user block is omitted because the default Cloud Agent
# image already provides the `ubuntu` user with passwordless sudo.)
if ! command -v docker >/dev/null 2>&1; then
	# Install Docker
	sudo install -m 0755 -d /etc/apt/keyrings
	curl --retry 3 --retry-delay 5 -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
	sudo chmod a+r /etc/apt/keyrings/docker.gpg
	echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
	sudo apt-get update
	sudo apt-get install -y \
		docker-ce=5:28.5.2-1~ubuntu.24.04~noble \
		docker-ce-cli=5:28.5.2-1~ubuntu.24.04~noble \
		containerd.io \
		docker-buildx-plugin \
		docker-compose-plugin

	# fuse-overlayfs storage driver.
	# (--force-conf* is the one addition to the docs: it keeps the existing
	# /etc/fuse.conf without the interactive dpkg prompt that would otherwise
	# abort this non-tty install. The docs' image base has no such conffile.)
	sudo apt-get install -y \
		-o Dpkg::Options::=--force-confold \
		-o Dpkg::Options::=--force-confdef \
		fuse-overlayfs
	sudo mkdir -p /etc/docker
	printf '%s\n' '{' '  "storage-driver": "fuse-overlayfs"' '}' | sudo tee /etc/docker/daemon.json > /dev/null

	# iptables-legacy backend
	sudo apt-get install -y iptables
	sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
	sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy

	# Let the agent user run Docker
	sudo groupadd -f docker
	sudo usermod -aG docker "$USER"
fi

# --- devcontainer CLI ---------------------------------------------------------
# Install unpinned, but only versions at least 7 days old, mirroring the repo's
# supply-chain policy (bunfig.toml's minimumReleaseAge) and CI's
# `npm install --min-release-age=7`. We install with bun (the repo's package
# manager, same version as .devcontainer/Dockerfile) because the image's npm is
# too old for `--min-release-age`; bun applies minimumReleaseAge to global
# installs read from ~/.bunfig.toml.
if ! command -v devcontainer >/dev/null 2>&1; then
	if ! command -v bun >/dev/null 2>&1; then
		export BUN_INSTALL="$HOME/.bun"
		curl -fsSL https://bun.com/install | bash -s "bun-v1.3.14"
	fi
	export PATH="$HOME/.bun/bin:$PATH"
	[ -f "$HOME/.bunfig.toml" ] \
		|| printf '[install]\nminimumReleaseAge = 604800 # 7 days; see bunfig.toml\n' > "$HOME/.bunfig.toml"
	bun install -g @devcontainers/cli
	sudo ln -sf "$HOME/.bun/bin/devcontainer" /usr/local/bin/devcontainer
fi

# --- Nested images + bun cache for the Environment Build snapshot -------------
# `devcontainer up` builds picms (Playwright, features) and starts postgres.
# Skip postCreate here so install owns `bun run setup` (drizzle needs the DB).
# BUN_INSTALL_CACHE_DIR is the bind-mounted workspace .cache/bun.
# Then `down` (no --volumes): processes must not linger, images/volumes stay.
# start.sh brings the stack back and runs postCreate (setup && build).
ensure_dockerd
with_docker_group devcontainer up --workspace-folder "$PWD" --skip-post-create
with_docker_group devcontainer exec --workspace-folder "$PWD" bun run setup
with_docker_group docker compose -p "$(basename "$PWD")_devcontainer" down

echo "install.sh completed"
