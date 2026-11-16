#!/bin/bash
set -euo pipefail
cd /opt/i-remember
image="$(cat image-id)"
docker run -d --name i-remember --init --network host \
 --user 1000:1000 --restart unless-stopped --memory 768m --memory-swap 1024m --cpus 1.5 \
 --security-opt no-new-privileges:true --cap-drop ALL \
 --log-driver json-file --log-opt max-size=10m --log-opt max-file=5 \
 --env-file /opt/i-remember/.env \
 -v /opt/i-remember/data:/var/opt/i-remember.fr \
 -v /opt/i-remember/external-entrypoint.sh:/external-entrypoint.sh:ro \
 --health-cmd 'node -e "Promise.all([7890,7892].map(p=>fetch(\"http://127.0.0.1:\"+p+\"/readyz\",{signal:AbortSignal.timeout(3000)}).then(r=>{if(!r.ok)throw Error(r.status)}))).catch(()=>process.exit(1))"' \
 --health-interval 30s --health-timeout 8s --health-start-period 60s --health-retries 3 \
 --entrypoint /bin/sh "$image" /external-entrypoint.sh
