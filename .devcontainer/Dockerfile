# https://mcr.microsoft.com/en-us/artifact/mar/devcontainers/base/about
FROM mcr.microsoft.com/devcontainers/base:2-noble

USER vscode

# ----- deno  -----

# see https://docs.deno.com/runtime/getting_started/installation/
ENV DENO_INSTALL=/home/vscode/.deno

# NOTE: i use fixed version, instead of `https://deno.land/install.sh`
RUN curl -fsSL https://deno.land/x/install@v0.3.3/install.sh | sh -s -- -y

# SSOT. this version is also used in CI
RUN ${DENO_INSTALL}/bin/deno upgrade --version 2.8.1

RUN ${DENO_INSTALL}/bin/deno completions bash >> $HOME/.bashrc
