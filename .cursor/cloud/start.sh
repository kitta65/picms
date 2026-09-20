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
# On a cold first boot the repo's postCreate (bun run setup && bun run build) can
# fail because drizzle-kit push races the postgres container becoming ready. If
# `devcontainer up` reports failure, reconcile setup + build with a short retry
# (the container is already created, so we just re-run once postgres is ready).
if ! devcontainer up --workspace-folder "$PWD"; then
	echo "devcontainer up failed (postgres may not have been ready for postCreate); reconciling..."
	ok=false
	for attempt in $(seq 1 6); do
		if devcontainer exec --workspace-folder "$PWD" bash -lc 'bun run setup && bun run build'; then
			ok=true
			break
		fi
		echo "setup + build retry $attempt failed; waiting for postgres..."
		sleep 5
	done
	if ! $ok; then
		echo "setup + build still failing after retries" >&2
		exit 1
	fi
fi

echo "start.sh completed; use the 'picms-dev' terminal for the dev servers"
