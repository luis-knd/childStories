#!/usr/bin/env bash
set -euo pipefail

readonly PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! docker info >/dev/null 2>&1; then
  printf '%s\n' 'Docker no está disponible. Inicia el daemon y vuelve a intentarlo.' >&2
  exit 1
fi

mkdir -p "${PROJECT_ROOT}/artifacts" "${PROJECT_ROOT}/.android-signing"
cd "${PROJECT_ROOT}"

docker compose run --build --rm \
  -e "HOST_UID=$(id -u)" \
  -e "HOST_GID=$(id -g)" \
  android-builder "$@"
