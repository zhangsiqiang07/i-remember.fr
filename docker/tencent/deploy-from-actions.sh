#!/bin/bash
# Installed root-owned on the server; the CI key can invoke only this command.
set -euo pipefail
umask 077
base=/opt/i-remember
read -ra command <<< "${SSH_ORIGINAL_COMMAND:-}"
operation=${command[0]:-}
revision=${command[1]:-}
digest=${command[2]:-}
if [[ ! "$revision" =~ ^[a-f0-9]{40}$ || ! "$digest" =~ ^sha256:[a-f0-9]{64}$ ]]; then
  echo 'Expected a commit and registry digest' >&2
  exit 64
fi
cache="$base/.image-transfer/image.tar"
if [[ "$operation" == upload ]]; then
  # Only the single fixed image cache can be received; no arbitrary rsync paths/options.
  [[ ${#command[@]} -ge 7 && ${#command[@]} -le 10 ]]
  [[ ${command[3]} == --server && ${command[-2]} == . && ${command[-1]} == image.tar ]]
  for argument in "${command[@]:4:${#command[@]}-6}"; do
    case "$argument" in
      --partial|--protocol=31|--timeout=180|--stats) ;;
      -cze.*) [[ "$argument" =~ ^-cze\.[iLsfxCIvu]+$ ]] ;;
      *) echo 'Unexpected rsync option' >&2; exit 64 ;;
    esac
  done
elif [[ "$operation" != deploy || ${#command[@]} != 3 ]]; then
  echo 'Expected: deploy <commit> <registry-digest>' >&2
  exit 64
fi
exec 9>"$base/deploy.lock"
flock -w 900 9 || { echo 'Another deployment is still running' >&2; exit 75; }
if [[ "$operation" == upload ]]; then
  install -d -m 700 "$base/.image-transfer"
  [[ ! -L "$cache" && ! -d "$cache" ]]
  if [[ ! -f "$cache" ]]; then
    # Seed rsync from the running image so the first release also sends only changes.
    docker save "$(cat "$base/image-id")" > "$cache.seed"
    mv "$cache.seed" "$cache"
  fi
  rsync "${command[@]:3:${#command[@]}-4}" "$cache"
  exit 0
fi
registry_auth=""
archive=""
old_container=""
old_image=""
committed=0
replaced=0
cleanup() {
  result=$?
  trap - EXIT INT TERM
  [[ -z "$registry_auth" ]] || rm -rf -- "$registry_auth"
  [[ -z "$archive" ]] || rm -f -- "$archive"
  if [[ "$replaced" == 1 && "$committed" != 1 ]]; then
    echo 'Candidate failed; restoring the previous application container' >&2
    docker rm -f i-remember >/dev/null 2>&1 || true
    printf '%s\n' "$old_image" > "$base/image-id"
    docker rename "$old_container" i-remember
    docker start i-remember >/dev/null
    echo 'Application rolled back. Database migrations are not automatically reversed.' >&2
  fi
  exit "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
# Read a bounded protocol header; the remaining stdin is the image archive.
IFS= read -r -n 65536 transport_header
[[ ${#transport_header} -lt 65536 ]] || { echo 'Oversized transport header' >&2; exit 64; }
if [[ "$transport_header" == image-archive-v1\ * || "$transport_header" == cached-image-v1\ * ]]; then
  read -r protocol image_id archive_sha archive_size archive_manifest extra <<< "$transport_header"
  [[ "$image_id" =~ ^sha256:[a-f0-9]{64}$ && "$archive_sha" =~ ^[a-f0-9]{64}$ && "$archive_size" =~ ^[0-9]{1,10}$ && -z "$extra" ]]
  archive=$(mktemp "$base/.image-archive.XXXXXX")
  if [[ "$protocol" == cached-image-v1 ]]; then
    [[ -f "$cache" && ! -L "$cache" ]]
    python3 "$base/receive-image.py" "$revision" "$digest" "$image_id" "$archive_sha" "$archive_size" "$archive_manifest" "$archive" < "$cache"
  else
    python3 "$base/receive-image.py" "$revision" "$digest" "$image_id" "$archive_sha" "$archive_size" "$archive_manifest" "$archive"
  fi
  docker load --input "$archive"
  image=$(docker image inspect --format '{{.Id}}' "$image_id")
  rm -f -- "$archive"
  archive=""
else
  # Compatibility for already queued jobs: ephemeral registry credentials only.
  registry_auth=$(mktemp -d "$base/.registry-auth.XXXXXX")
  image_ref="ghcr.io/zhangsiqiang07/i-remember.fr@$digest"
  printf '%s\n' "$transport_header" | docker --config "$registry_auth" login ghcr.io --username zhangsiqiang07 --password-stdin
  timeout 1200 docker --config "$registry_auth" pull "$image_ref"
  image=$(docker image inspect --format '{{.Id}}' "$image_ref")
  rm -rf -- "$registry_auth"
  registry_auth=""
fi
[[ $(docker image inspect --format '{{.Architecture}}' "$image") == amd64 ]]
[[ $(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image") == "$revision" ]]
[[ $(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.source"}}' "$image") == https://github.com/zhangsiqiang07/i-remember.fr ]]
old_image=$(cat "$base/image-id")
if [[ "$old_image" == "$image" ]]; then
  echo "Already running image for $revision"
  exit 0
fi
# Back up before Prisma applies forward migrations using the persisted DATABASE_URL.
"$base/backup.sh"
old_container="i-remember-rollback-$(date +%s)"
docker stop --time 30 i-remember >/dev/null
docker rename i-remember "$old_container"
replaced=1
printf '%s\n' "$image" > "$base/image-id"
"$base/run.sh"
ready=0
for attempt in $(seq 1 60); do
  state=$(docker inspect --format '{{.State.Status}}' i-remember)
  if [[ "$state" == running ]] && curl --fail --silent --max-time 5 http://127.0.0.1:7890/readyz >/dev/null; then
    health=$(docker inspect --format '{{.State.Health.Status}}' i-remember)
    if [[ "$health" == healthy ]]; then ready=1; break; fi
  fi
  sleep 2
done
if [[ "$ready" != 1 ]]; then
  docker logs --tail 60 i-remember >&2
  exit 1
fi
curl --fail --silent --show-error --max-time 15 https://remember.aflyblue.cn/readyz
curl --fail --silent --show-error --max-time 15 https://remember.aflyblue.cn/version
previous=""
[[ ! -f "$base/previous-container" ]] || previous=$(cat "$base/previous-container")
printf '%s\n' "$old_container" > "$base/previous-container"
printf '%s\n' "$revision" > "$base/deployed-revision"
committed=1
# Only remove the superseded rollback container created by this script.
if [[ "$previous" =~ ^i-remember-rollback-[0-9]+$ && "$previous" != "$old_container" ]]; then
  obsolete_image=$(docker inspect --format '{{.Image}}' "$previous" 2>/dev/null || true)
  docker rm "$previous" >/dev/null 2>&1 || true
  if [[ "$obsolete_image" =~ ^sha256:[a-f0-9]{64}$ && "$obsolete_image" != "$image" && "$obsolete_image" != "$old_image" ]]; then
    if [[ -z $(docker ps -aq --filter "ancestor=$obsolete_image") ]]; then
      docker image rm "$obsolete_image" >/dev/null 2>&1 || true
    fi
  fi
fi
printf '\nDeployed %s using %s\n' "$revision" "$image"
