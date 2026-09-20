#!/usr/bin/env bash
# Shared by install.sh and start.sh. Sourced, not executed on its own.
#
# The docs suggest `sudo service docker start`, but Cloud Agent VMs have no
# init system (PID 1 is tini, not systemd/SysV), so `service` cannot start
# Docker. Launch dockerd directly and wait until the API is ready.

ensure_dockerd() {
	if sudo docker info >/dev/null 2>&1; then
		return 0
	fi
	sudo nohup dockerd >/tmp/dockerd.log 2>&1 &
	for _ in $(seq 1 30); do
		if sudo docker info >/dev/null 2>&1; then
			return 0
		fi
		sleep 1
	done
	echo "dockerd did not become ready within 30s; see /tmp/dockerd.log" >&2
	return 1
}

# usermod -aG docker does not apply to the current shell. After a first-time
# Docker install in install.sh, talk to the daemon via sg so the client is
# in the docker group.
with_docker_group() {
	if docker info >/dev/null 2>&1; then
		"$@"
		return
	fi
	sg docker -c "$(printf '%q ' "$@")"
}
