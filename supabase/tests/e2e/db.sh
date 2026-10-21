#!/bin/bash
# Throwaway Postgres on :5545 with stubbed Supabase roles + the real schema.sql and seed.sql (run as root; uses the postgres OS user).
HERE="$(cd "$(dirname "$0")" && pwd)"; T="$HERE/.."
BIN="$(ls -d /usr/lib/postgresql/*/bin | tail -1)"; D=/tmp/ps-e2e-pg
su postgres -c "$BIN/pg_ctl -D $D stop -m immediate" >/dev/null 2>&1; rm -rf $D; mkdir -p $D; chown postgres $D
su postgres -c "$BIN/initdb -D $D -A trust >/dev/null && $BIN/pg_ctl -D $D -o '-p 5545 -k /tmp' -l /tmp/ps-e2e-pg.log -w start >/dev/null" || exit 1
P="psql -h /tmp -p 5545 -U postgres -v ON_ERROR_STOP=1 -q"
$P -d postgres -c "create database t" >/dev/null
$P -d t -f "$T/stub_supabase.sql"; $P -d t -f "$T/../schema.sql" 2>&1 | grep -v NOTICE; $P -d t -f "$T/../seed.sql" 2>&1 | grep -v NOTICE
echo "db ready"
