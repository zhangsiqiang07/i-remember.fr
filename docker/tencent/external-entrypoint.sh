#!/bin/sh
set -eu
export AUTH_SECRET="$(cat /var/opt/i-remember.fr/auth-secret)"
cd /app/packages/database
./node_modules/.bin/prisma migrate deploy --schema prisma/schema.prisma
cd /app
api_pid=''
web_pid=''
stop() { trap - TERM INT EXIT; [ -z "$api_pid" ] || kill "$api_pid" 2>/dev/null || true; [ -z "$web_pid" ] || kill "$web_pid" 2>/dev/null || true; wait || true; }
trap stop TERM INT EXIT
node apps/api/dist/server.js &
api_pid=$!
node server.mjs &
web_pid=$!
while kill -0 "$api_pid" 2>/dev/null && kill -0 "$web_pid" 2>/dev/null; do sleep 2; done
exit 1
