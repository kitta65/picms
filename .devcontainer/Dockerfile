# https://mcr.microsoft.com/en-us/artifact/mar/devcontainers/base/about
FROM mcr.microsoft.com/devcontainers/base:2-noble

# SSOT
ARG BUN_VERSION=1.3.14

USER vscode

ENV XDG_DATA_HOME=/home/vscode/.local/share

# NOTE: since bun.completion.bash is not auto loaded, it is required to rename
RUN mkdir -p $XDG_DATA_HOME/bash-completion/completions && \
    curl -fsSL https://bun.com/install | bash -s "bun-v${BUN_VERSION}" && \
    mv $XDG_DATA_HOME/bash-completion/completions/bun.completion.bash $XDG_DATA_HOME/bash-completion/completions/bun.bash
