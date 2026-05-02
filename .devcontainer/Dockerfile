# https://mcr.microsoft.com/en-us/artifact/mar/devcontainers/base/about
FROM mcr.microsoft.com/devcontainers/base:2-noble

USER vscode

COPY .bun-version /tmp/.bun-version
RUN curl -fsSL https://bun.com/install | bash -s "bun-v$(cat /tmp/.bun-version)"
