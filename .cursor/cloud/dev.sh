#!/usr/bin/env bash
#
# Long-running dev servers, shown as the "picms-dev" terminal.
#
# Runs the repo's parallel dev servers inside the devcontainer with hot reload:
#   - API/main server on PICMS_PORT_MAIN (9001)
#   - web server on     PICMS_PORT_WEB  (9003)
# Both are reachable from the VM at the picms container's IP, e.g.
#   docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \
#     workspace_devcontainer-picms-1
set -euo pipefail

sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

exec devcontainer exec --workspace-folder "$PWD" bash -lc 'bun run dev'
