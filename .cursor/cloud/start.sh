#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/ensure-dockerd.sh"

ensure_dockerd
devcontainer up

echo "start.sh completed"
