# Production deployment

The supported self-hosted production shape is one application image plus one
persistent data volume. The image runs the public web server, the private API,
and an embedded PostgreSQL 15 server. The volume stores PostgreSQL data,
uploaded assets, the authentication secret, and
runtime logs.

## Release reference

GitHub publishes three references for a release commit:

- `sha-<12-character-commit>` for every `main` build;
- `X.Y.Z` for a matching `vX.Y.Z` Git tag;
- the mutable convenience tag `latest`.

Production must record the image digest and deploy either that digest directly
or the matching `sha-*` tag after verifying its digest. Do not use `latest` as a
rollback reference.

```bash
docker buildx imagetools inspect \
  zerostwo/i-remember.fr:sha-eeb33b14cd1e
```

For a digest-pinned `docker run`, the image reference has this shape:

```text
zerostwo/i-remember.fr@sha256:<verified-manifest-digest>
```

## Compose deployment

Create a deployment `.env` from `.env.example`, then set at least:

```dotenv
DOCKERHUB_IMAGE=zerostwo/i-remember.fr
# Replace with the published tag for the exact commit.
TAG=sha-0123456789ab
I_REMEMBER_HOST_PORT=7892
I_REMEMBER_CANONICAL_URL=https://songqi.org
I_REMEMBER_OWNER_NAME="Songqi Duan"
I_REMEMBER_OWNER_ALTERNATE_NAME="段松岐"
I_REMEMBER_DEFAULT_LANGUAGE=en
I_REMEMBER_ANONYMOUS_SUBMISSIONS=false
```

Leave `AUTH_SECRET` empty on a new deployment. The entrypoint generates a
random secret and persists it as `/var/opt/i-remember.fr/auth-secret`. If an
operator supplies `AUTH_SECRET`, the entrypoint persists it and later refuses
to start if the environment value differs from the persisted value. This
prevents accidental token and two-factor-encryption key rotation.

Validate and start the selected image:

```bash
docker compose config --quiet
docker compose pull app
docker compose up -d --no-build app
docker compose ps
```

Compose publishes only `127.0.0.1:${I_REMEMBER_HOST_PORT:-7892}` and uses
`restart: unless-stopped`. Its health check requires PostgreSQL, the private API,
and the public web process to be ready.

Verify locally before enabling public traffic:

```bash
curl --fail --show-error http://127.0.0.1:7892/readyz
curl --fail --show-error http://127.0.0.1:7892/version
docker compose exec -T app /usr/local/bin/i-remember-healthcheck
```

Create the first administrator at `/admin/setup` before opening the public
route, then enable two-factor authentication. Setup requires a password of at
least eight characters, is rate limited, and is disabled by the database once
the first user exists.

Review **Settings → Site** after installation or upgrade. Set the public domain,
site description, and owner identity for this deployment. See [search engine setup](seo.md)
for sitemap submission and indexing checks. Saved database settings override initial
environment defaults.

## Domain, reverse proxy, and TLS

The application port must remain loopback-only. Put a managed reverse proxy or
Cloudflare Tunnel in front of `http://127.0.0.1:7892` and configure:

- the intended apex and/or `www` DNS records;
- valid TLS with HTTP-to-HTTPS redirect;
- HSTS after HTTPS has been verified;
- request-body and request-time limits;
- trusted proxy IP handling at exactly one boundary;
- rate limits for login, setup, uploads, and anonymous writes.

The single-image topology sets `API_TRUST_PROXY=true` because the API listens
on loopback and receives API traffic only from the built-in web proxy. That web
proxy must discard client-supplied forwarding headers and set
`X-Forwarded-For`, `X-Forwarded-Host`, and `X-Forwarded-Proto` from its trusted
connection context. Do not set `API_TRUST_PROXY=true` if you expose the API
directly or place it behind a proxy that preserves untrusted client
`X-Forwarded-*` values.

When a TLS reverse proxy or tunnel connects to the built-in web listener over
loopback, set `I_REMEMBER_TRUST_PROXY=true` only if that proxy replaces
client-supplied `X-Forwarded-For` with its verified visitor address. Compose
maps `host.docker.internal` to the host gateway and supplies it through
`I_REMEMBER_TRUSTED_PROXY_PEERS`; custom topologies must list their exact
trusted IPs or resolvable peer names instead. The web layer accepts the first
syntactically valid IP only from loopback or that allowlist, discards the rest
of the forwarding chain, and rebuilds the headers passed to the private API.
Keep trust disabled for direct access or any proxy that appends to untrusted
client headers. The trusted edge should still enforce coarse abuse limits.

Before launch, verify the public hostname returns this application's `/version`
and `/readyz`, not a parked domain or another service. Keep the origin port
closed to the LAN/WAN unless direct access is an explicit requirement.

## Backups

The built-in backup command creates a sensitive, checksum-protected bundle
containing:

- a custom-format `pg_dump`;
- uploaded assets;
- the persisted `auth-secret`;
- a JSON manifest and SHA-256 checksums.

Pause or block public/admin writes while the command runs so database and asset
state do not change between the logical dump and filesystem archive.

```bash
mkdir -p backups
chmod 700 backups

container_id="$(docker compose ps -q app)"
backup_name="i-remember-$(date -u +%Y%m%dT%H%M%SZ).tar.gz"
container_backup="/var/opt/i-remember.fr/.backup-export/$backup_name"

docker exec "$container_id" \
  i-remember-backup "$container_backup"
docker cp \
  "$container_id:$container_backup" \
  "./backups/$backup_name"
docker exec "$container_id" rm -f "$container_backup"
chmod 600 "./backups/$backup_name"
```

Copy the bundle off the Docker host and apply encrypted retention appropriate
for authentication material and user content. Do not treat the admin JSON
export or a live copy of the PostgreSQL data directory as a database backup.

## Blue-green restore

Restore only into a new, empty volume. The restore command intentionally refuses
a non-empty target; it never overwrites the active production volume.

```bash
image_ref="zerostwo/i-remember.fr@sha256:<verified-manifest-digest>"
backup_path="$PWD/backups/i-remember-YYYYmmddTHHMMSSZ.tar.gz"

docker volume create i-remember-restore
docker run --rm \
  --entrypoint /usr/local/bin/i-remember-restore \
  -v i-remember-restore:/var/opt/i-remember.fr \
  -v "$backup_path:/restore/backup.tar.gz:ro" \
  "$image_ref" \
  /restore/backup.tar.gz
```

Start a candidate on a different loopback port and test it before switching the
reverse proxy:

```bash
docker run -d \
  --name i-remember-restore-verify \
  -p 127.0.0.1:7894:7890 \
  -v i-remember-restore:/var/opt/i-remember.fr \
  "$image_ref"

curl --fail --show-error http://127.0.0.1:7894/readyz
curl --fail --show-error http://127.0.0.1:7894/version
```

Also verify administrator login and 2FA, representative memory URLs, search,
and uploaded images. Only then switch traffic. Keep the prior volume and image
digest unchanged until the rollback window closes.

## PostgreSQL upgrades

The image is pinned to PostgreSQL 15 and refuses to start a data directory with
a different major version. Do not replace the physical `postgres/` directory
across major versions. Upgrade through a verified logical backup and blue-green
restore using an image designed for the target PostgreSQL major.

Prisma migrations run at container startup. Take a verified backup before every
release containing schema changes, and keep migrations backward-compatible
during the rollback window.

## Monitoring and logs

Alert on:

- Docker health becoming `unhealthy` or repeated container restarts;
- `/version` differing from the recorded release;
- backup age and restore-drill failures;
- volume free space and growth of `postgres/`, `assets/`, and `logs/`;
- PostgreSQL recovery, migration errors, HTTP 5xx/429, and failed logins;
- TLS certificate expiry and tunnel/origin reachability.

Docker JSON logs rotate at 10 MiB with five files under Compose. The persistent
files below still need host-level rotation and retention:

- `logs/startup.log`;
- `logs/app.log`;
- `logs/postgres.log`.

### Long-form request capacity

Memory and page bodies have no character-count limit. Both the public submission
proxy and the API use `API_MAX_CONTENT_JSON_BODY_BYTES` (default 16777216 bytes,
configurable from 256 KiB through 64 MiB) for content writes. Other JSON endpoints
retain the smaller standard budget. Requests above the transport budget receive
HTTP 413 without saving truncated text. Allow the same request size in any outer
reverse proxy; URL-encoded public submissions include encoding overhead.

## Tencent host with existing PostgreSQL

The `Deploy Tencent` workflow automatically builds `main` pushes on GitHub's
AMD64 runner and pushes one image to GitHub Container Registry. A restricted
SSH command tells `remember.aflyblue.cn` to pull the immutable image digest. It does not build on the 2 GB server and does
not require DockerHub credentials. Manual dispatch is also limited to `main`.
A superseded queued commit is skipped before transfer.

This deployment deliberately bypasses the image's embedded PostgreSQL entrypoint.
The root-owned files under `docker/tencent/` are installed at `/opt/i-remember`;
`external-entrypoint.sh` uses the existing PostgreSQL 18 instance on loopback.
`run.sh` retains the current persistent data, loopback listeners, memory limits,
restart policy, authentication secret, and Docker log rotation. Repository
changes to these host scripts require separately updating their installed copies;
ordinary application code and Dockerfile changes deploy automatically.

The only Actions secret is `TENCENT_DEPLOY_SSH_KEY`, an Ed25519 private key
created exclusively for this repository. Its server-side authorized key has a
forced command, `restrict`, and no PTY, forwarding, agent forwarding, or arbitrary
shell access. It accepts only a commit SHA and a GHCR image digest. The workflow pins the server's existing Ed25519 host key. Database
credentials, the authentication secret, and administrator passwords stay on the
server and are never sent to Actions or committed. The workflow grants its
job-scoped `GITHUB_TOKEN` package-write permission for GHCR publishing; the
server uses that same short-lived token via SSH stdin and a temporary Docker
config only for pulling the image. That config is removed after the pull or on
failure. No personal access token or permanent registry login is installed.

The host deployment script:

1. Serializes deployments, pulls an immutable GHCR digest, and checks AMD64
   architecture plus source/revision image labels.
2. Calls the existing `/opt/i-remember/backup.sh` before running migrations.
3. Retains the old stopped container, starts the new image with the existing
   external-database settings, and waits for application/Docker health and HTTPS.
4. Restores the prior application container if startup or verification fails.
   It does **not** reverse database migrations. New schema migrations must remain
   backward compatible for application rollback to work safely.
5. Records `/opt/i-remember/deployed-revision`, keeps one rollback container, and
   removes only obsolete rollback containers/images belonging to this deployment.

Check releases using:

```sh
ssh fly-tencent 'cat /opt/i-remember/deployed-revision'
ssh fly-tencent 'docker inspect --format "{{.State.Health.Status}}" i-remember'
ssh fly-tencent 'docker logs --tail 100 i-remember'
```

The original `Docker` workflow remains the repository's optional DockerHub
verification/publishing pipeline. Its DockerHub publish job runs only when the repository variable
`ENABLE_DOCKERHUB_PUBLISH=true` is set, and requires `DOCKERHUB_TOKEN`. Source
verification still runs normally; Tencent deployment does not depend on the
optional DockerHub publisher.
Backups remain under `/opt/i-remember/backups` and need disk-space monitoring and
an operator-selected retention/off-host backup policy.


## Configurable media storage

Open **Settings → Storage** as the owner and select **Application server (local)**,
**Alibaba Cloud OSS**, or **Cloudflare R2**. Local storage remains the default.
No database migration or new SDK dependency is needed.

For OSS, enter the bucket's region (for example `cn-hangzhou`), bucket name,
AccessKey ID and AccessKey Secret. The application uses the regional public
endpoint and [OSS V4 signing](https://www.alibabacloud.com/help/en/oss/developer-reference/recommend-to-use-signature-version-4).
For R2, enter the 32-character Cloudflare Account ID, bucket, S3 Access Key ID
and Secret Access Key. It uses the default account S3 endpoint and region `auto`
([R2 S3 API](https://developers.cloudflare.com/r2/api/s3/api/)). Jurisdiction-specific
R2 endpoints are not currently supported. Give the key read, write and delete
permission only for the intended bucket/prefix. The application does not create
buckets or change their access policies.

**Object prefix** is an optional folder inside the bucket. Leave **Public media
URL** empty for a private bucket: the application signs cloud requests and streams
media through existing site URLs, including Range and HEAD for playback. An
optional HTTPS public/CDN base URL redirects media requests to that domain; enable
GET/HEAD CORS for this site's origin at the provider. The connection test verifies
signed bucket operations, not your public domain or its CORS configuration.
For publicly served media, configure equivalent noindex/noimageindex response
headers at your CDN. Server-proxied media retains the site's noindex headers.

**Test connection** uploads, reads back and deletes a uniquely named small object
under `<prefix>/connection-tests/`; it does not activate settings. **Save storage**
repeats that check and activates only a working configuration. Blank credential
inputs retain saved credentials for the selected provider. Credentials never come
back in settings/API responses. All storage endpoints require an owner session,
and writes also enforce same-origin and rate limits.

Uploads still pass through the application's media processing/privacy filters.
After image conversion, crop generation or audio/video/Live Photo processing,
completed bytes are transferred to the selected bucket and removed locally only
after cloud upload and the durable media index succeed. Temporary processing
space is still required. Small JSON manifests stay local for crop/media metadata.
Cloud transfer failures leave staged files available and do not report a successful
upload. No automatic migration or deletion of existing local/cloud media occurs.
Existing objects retain their original provider/profile even after switching to
local storage or another bucket. Rotating credentials for the same bucket also
updates its historical profiles. Preserve access to previously used buckets.

The application stores encrypted configuration in
`<I_REMEMBER_DATA_DIR>/object-storage.enc.json` and per-media indexes under
`<I_REMEMBER_DATA_DIR>/object-storage-index/`. Files use mode 0600; encryption uses
a separate AES-256-GCM key derived from the persisted `AUTH_SECRET`. Keep that
secret unchanged. These files are outside public upload paths, shared by the API
and web processes, and must be included in backups. Tencent's existing whole-data
backup already includes them. The built-in backup adds `storage-state.tar.gz`
when needed (bundle v3); the new restore supports v2 and v3. Older images cannot
restore v3 bundles. Bucket objects themselves are not downloaded into the backup:
use object versioning/retention or an off-site bucket backup as appropriate.

An empty local configuration still produces the existing v2 backup format. The
admin JSON content export is not a backup of bucket files, cloud credentials or
media indexes. Do not remove cloud configuration/index files when rolling back
an application image.

### Direct media URLs

When OSS is selected, API responses and rendered content use the configured public media domain plus object prefix and key directly. If the domain is blank, the bucket’s public OSS endpoint is used. R2 uses its configured public/custom domain, or the private proxy when blank. Existing local files retain their website URLs. Public buckets/domains must permit anonymous image GET with CORS for the website (including WebGL/canvas); the application does not change bucket ACLs or CORS rules. Editor submissions resolve known cloud object URLs back to stable internal media identities, preserving usage tracking and deletion. Existing database records need no migration.
