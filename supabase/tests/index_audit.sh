#!/bin/bash
# Index audit: fills a throwaway database with realistic volumes and checks (EXPLAIN) that every hot query uses an index.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; SCHEMA="${SCHEMA:-$HERE/../schema.sql}"
ROOT="$HERE/../.."
if [ -n "${PGHOST:-}" ]; then            # CI: use the service container
  P="psql -X -q -v ON_ERROR_STOP=1"; WORK="$(mktemp -d)"
  $P -d postgres -c "drop database if exists ia" -c "create database ia" >/dev/null; DB=ia
else
  BIN="$(ls -d /usr/lib/postgresql/*/bin | tail -1)"; PORT=5549
  WORK="$(mktemp -d)"; chmod 755 "$WORK"; chown postgres "$WORK" 2>/dev/null || true; D="$WORK/data"
  su postgres -c "$BIN/initdb -D $D -A trust >/dev/null && $BIN/pg_ctl -D $D -o '-p $PORT -k /tmp' -l $WORK/pg.log -w start >/dev/null"
  trap 'su postgres -c "$BIN/pg_ctl -D $D -m immediate stop >/dev/null" 2>/dev/null; rm -rf "$WORK"' EXIT
  P="psql -h /tmp -p $PORT -U postgres -X -q -v ON_ERROR_STOP=1"
  $P -d postgres -c "create database t" >/dev/null; DB=t
fi
$P -d $DB -f "$HERE/stub_supabase.sql"; $P -d $DB -f "$SCHEMA" 2>&1 | grep -v NOTICE || true
SAMPLES="$WORK/samples"
node "$ROOT/tools/series-import.js" patterns | $P -d $DB
node "$ROOT/tools/series-import.js" sample "$SAMPLES" >/dev/null && node "$ROOT/tools/series-import.js" sql "$SAMPLES" --publish | $P -d $DB
$P -d $DB -f "$HERE/index_audit.sql"
