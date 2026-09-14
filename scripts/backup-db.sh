#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

mkdir -p backups
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
file="backups/tracker-${stamp}.dump"

pg_dump --format=custom --no-owner --file="$file" "$DATABASE_URL"
echo "Wrote $file"
