#!/usr/bin/env bash
#
# Cloud Agent start phase (runs on every boot).
#
# Brings up the .devcontainer docker-compose stack (picms + postgres + dbgate)
# and runs the repo's postCreateCommand (bun run setup && bun run build) the
# first time the container is created. Must be idempotent and must terminate.
set -euo pipefail

# --- Ensure the Docker daemon is running --------------------------------------
# The docs suggest `sudo service docker start`, but the default Cloud Agent image
# has no init system (no systemd/SysV), so `service` can't start Docker. Launch
# dockerd directly and wait until it's ready instead.
if ! sudo docker info >/dev/null 2>&1; then
	sudo nohup dockerd >/tmp/dockerd.log 2>&1 &
	for _ in $(seq 1 30); do sudo docker info >/dev/null 2>&1 && break; sleep 1; done
fi

# --- Docker socket access without sudo ----------------------------------------
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

# --- Bring up the devcontainer stack + run postCreate (setup + build) ---------
devcontainer up --workspace-folder "$PWD"

echo "start.sh completed; use the 'picms-dev' terminal for the dev servers"
