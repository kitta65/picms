# https://mcr.microsoft.com/en-us/artifact/mar/devcontainers/base/about
FROM mcr.microsoft.com/devcontainers/base:2-noble

USER vscode

ENV XDG_DATA_HOME=/home/vscode/.local/share

COPY .bun-version /tmp/.bun-version

# NOTE: since bun.completion.bash is not auto loaded, it is required to rename
RUN mkdir -p $XDG_DATA_HOME/bash-completion/completions && \
    curl -fsSL https://bun.com/install | bash -s "bun-v$(cat /tmp/.bun-version)" && \
    mv $XDG_DATA_HOME/bash-completion/completions/bun.completion.bash $XDG_DATA_HOME/bash-completion/completions/bun.bash
