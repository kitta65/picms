#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/ensure-dockerd.sh"

# see also https://askubuntu.com/questions/972516/debian-frontend-environment-variable
export DEBIAN_FRONTEND=noninteractive

# disable husky (prefer cursor hooks for agents)
echo 'export HUSKY=0' | sudo tee /etc/profile.d/husky.sh >/dev/null

# enable docker https://cursor.com/docs/cloud-agent/setup#running-docker
if ! command -v docker >/dev/null 2>&1; then
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

	# --force-confold and --force-confdef are specified to avoid dpkg prompt
	sudo apt-get install -y \
		-o Dpkg::Options::=--force-confold \
		-o Dpkg::Options::=--force-confdef \
		fuse-overlayfs
	sudo mkdir -p /etc/docker
	printf '%s\n' '{' '  "storage-driver": "fuse-overlayfs"' '}' | sudo tee /etc/docker/daemon.json > /dev/null

	sudo apt-get install -y iptables
	sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
	sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy

	sudo groupadd -f docker
	sudo usermod -aG docker "$USER"
fi

# enable devcontainer CLI
if ! command -v devcontainer >/dev/null 2>&1; then
	# NOTE: since pre-installed npm is too old and does not support --min-release-age options, do not unpin the version
	npm install -g @devcontainers/cli@0.87.0
	sudo ln -sf "$(npm prefix -g)/bin/devcontainer" /usr/local/bin/devcontainer
fi

# prewarm
ensure_dockerd
sg docker -c "devcontainer up"
sg docker -c "devcontainer exec bun run setup"
sg docker -c "docker compose -p '$(basename "$PWD")_devcontainer' down"

echo "install.sh completed"
