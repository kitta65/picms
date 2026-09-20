#!/usr/bin/env bash

# NOTE:
# the docs suggest `sudo service docker start` but it does not work
# https://cursor.com/docs/cloud-agent/setup#startup-commands
ensure_dockerd() {
	if sudo docker info >/dev/null 2>&1; then
		return 0
	fi
	sudo nohup dockerd &

	# wait for docker to start
	for _ in $(seq 1 30); do
		if sudo docker info >/dev/null 2>&1; then
			return 0
		fi
		sleep 1
	done
	echo "dockerd did not become ready within 30s" >&2
	return 1
}
