#!/usr/bin/env sh
set -eu

STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p /backups
pg_dump "$DATABASE_URL" > "/backups/baby-enxoval-$STAMP.sql"
