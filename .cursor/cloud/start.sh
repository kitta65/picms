#!/usr/bin/env bash
#
# Cloud Agent start phase (runs on every boot).
#
# Brings up the .devcontainer docker-compose stack (picms + postgres + dbgate)
# and runs the repo's postCreateCommand (bun run setup && bun run build) the
# first time the container is created. Images should already exist from
# install.sh; this step must still run because containers are not snapshotted.
# Must be idempotent and must terminate.
set -euo pipefail

CLOUD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=ensure-dockerd.sh
source "$CLOUD_DIR/ensure-dockerd.sh"

ensure_dockerd
devcontainer up --workspace-folder "$PWD"

echo "start.sh completed; use the 'picms-dev' terminal for the dev servers"
