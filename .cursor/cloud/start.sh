#!/usr/bin/env bash
#
# Cloud Agent start phase (runs on every boot).
#
# Brings up the .devcontainer docker-compose stack (picms + postgres + dbgate)
# and runs the repo's postCreateCommand (bun run setup && bun run build) the
# first time the container is created. Must be idempotent and must terminate.
set -euo pipefail

# --- Ensure the Docker daemon is running --------------------------------------
if ! sudo docker info >/dev/null 2>&1; then
	sudo nohup dockerd >/tmp/dockerd.log 2>&1 &
	for _ in $(seq 1 30); do sudo docker info >/dev/null 2>&1 && break; sleep 1; done
fi

# --- Nested-container networking ----------------------------------------------
# Docker programs its rules via nftables, but the VM ships an iptables-legacy
# FORWARD chain whose default policy is DROP, which silently blocks
# container-to-container traffic (e.g. picms -> postgres). Allow forwarding.
sudo iptables-legacy -P FORWARD ACCEPT 2>/dev/null || true

# --- Docker socket access without sudo ----------------------------------------
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

# --- Bring up the devcontainer stack + run postCreate (setup + build) ---------
devcontainer up --workspace-folder "$PWD"

echo "start.sh completed; use the 'picms-dev' terminal for the dev servers"
