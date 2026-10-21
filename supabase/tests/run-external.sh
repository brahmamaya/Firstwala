#!/bin/bash
# CI runner: needs a PostgreSQL superuser connection in PGHOST/PGPORT/PGUSER/PGPASSWORD (e.g. a service container).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
P="psql -X -q -v ON_ERROR_STOP=1"
$P -d postgres -c "drop database if exists t" -c "create database t" >/dev/null
$P -d t -f "$HERE/stub_supabase.sql"
echo "== schema applied twice (must be re-runnable)"
$P -d t -f "$HERE/../schema.sql" 2>&1 | grep -v NOTICE || true
$P -d t -f "$HERE/../schema.sql" 2>&1 | grep -v NOTICE || true
echo "== security suite"
$P -d t -f "$HERE/security_suite.sql" 2>&1 | sed 's/^psql:[^ ]* //' | grep -E "PASS|FAIL|ERROR|ALL SECURITY|^===" | sed 's/^NOTICE:  //' | tee /tmp/suite.out
grep -q "ALL SECURITY CHECKS PASSED" /tmp/suite.out
echo "== stress / fuzz"
$P -d postgres -c "drop database if exists t" -c "create database t" >/dev/null
$P -d t -f "$HERE/stub_supabase.sql"; $P -d t -f "$HERE/../schema.sql" 2>&1 | grep -v NOTICE || true
(cd "$HERE/stress" && npm ci --silent && node stress.js)
