#!/bin/bash
# Starts a throwaway Postgres with the schema and runs stress.js (needs: PostgreSQL server binaries, node, `npm i` in this folder).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; SCHEMA="${SCHEMA:-$HERE/../../schema.sql}"
BIN="$(ls -d /usr/lib/postgresql/*/bin | tail -1)"; PORT=5548
WORK="$(mktemp -d)"; chmod 755 "$WORK"; chown postgres "$WORK" 2>/dev/null || true; D="$WORK/data"
su postgres -c "$BIN/initdb -D $D -A trust >/dev/null && $BIN/pg_ctl -D $D -o '-p $PORT -k /tmp -c max_connections=200' -l $WORK/pg.log -w start >/dev/null"
trap 'su postgres -c "$BIN/pg_ctl -D $D -m immediate stop >/dev/null" 2>/dev/null; rm -rf "$WORK"' EXIT
P="psql -h /tmp -p $PORT -U postgres -X -q -v ON_ERROR_STOP=1"
$P -d postgres -c "create database t" >/dev/null
$P -d t -f "$HERE/../stub_supabase.sql"; $P -d t -f "$SCHEMA" 2>&1 | grep -v NOTICE || true
ROOT="$HERE/../../.."; SAMPLES="$WORK/samples"
node "$ROOT/tools/series-import.js" patterns | $P -d t
node "$ROOT/tools/series-import.js" sample "$SAMPLES" >/dev/null && node "$ROOT/tools/series-import.js" sql "$SAMPLES" --publish | $P -d t
PGPORT=$PORT node "$HERE/stress.js"
