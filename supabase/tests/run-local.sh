#!/bin/bash
# Runs the security suite on a throwaway local Postgres (needs the PostgreSQL server binaries; run as root or a user that can su to postgres).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; SCHEMA="$HERE/../schema.sql"
BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1)"; PORT=5547
WORK="$(mktemp -d)"; chmod 755 "$WORK"; chown postgres "$WORK" 2>/dev/null || true; D="$WORK/data"
su postgres -c "$BIN/initdb -D $D -A trust >/dev/null && $BIN/pg_ctl -D $D -o '-p $PORT -k /tmp' -l $WORK/pg.log -w start >/dev/null"
trap 'su postgres -c "$BIN/pg_ctl -D $D -m immediate stop >/dev/null" 2>/dev/null; rm -rf "$WORK"' EXIT
P="psql -h /tmp -p $PORT -U postgres -X -q -v ON_ERROR_STOP=1"
$P -d postgres -c "create database t" >/dev/null
$P -d t -f "$HERE/stub_supabase.sql"
echo "== schema (applied twice to prove it is re-runnable)"
$P -d t -f "$SCHEMA" 2>&1 | grep -v NOTICE || true
$P -d t -f "$SCHEMA" 2>&1 | grep -v NOTICE || true
echo "== security suite"
$P -d t -f "$HERE/security_suite.sql" 2>&1 | sed 's/^psql:[^ ]* //' | grep -E "PASS|FAIL|ERROR|ALL SECURITY|^===" | sed "s/^NOTICE:  //"
