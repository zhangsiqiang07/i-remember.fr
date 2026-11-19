import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { createReadStream, readFileSync } from "node:fs";
import { access, mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();
const encode = (value) => encodeURIComponent(value).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const pathEncode = (value) => value.split("/").map(encode).join("/");
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode, code: "object_storage_error" });
export function storageKey(value) {
  const key = String(value || "");
  if (!key || key.length > 1024 || /[\\\x00-\x1f%]/.test(key) || key.split("/").some(p => !p || p.startsWith("."))) throw fail("Invalid storage key");
  return key;
}
function groupFor(key) { return storageKey(key).split("/").slice(0, 2).join("/"); }
function encryptionKey() {
  if (!process.env.AUTH_SECRET) throw fail("The server authentication secret is required to save storage settings", 503);
  return createHash("sha256").update("object-storage\0" + process.env.AUTH_SECRET).digest();
}
async function atomicJson(path, value) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try { await writeFile(temporary, JSON.stringify(value), { mode: 0o600, flag: "wx" }); await rename(temporary, path); }
  finally { await rm(temporary, { force: true }); }
}
async function jsonFile(path, fallback) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return fallback; throw fail("Storage configuration or media index cannot be read", 503); }
}
function protect(value) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const content = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
  return { version: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), content: content.toString("base64") };
}
function unprotect(value) {
  try {
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(value.iv, "base64"));
    decipher.setAuthTag(Buffer.from(value.tag, "base64"));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(value.content, "base64")), decipher.final()]).toString());
  } catch { throw fail("Storage settings cannot be decrypted with this server's authentication secret", 503); }
}
export function validateStorageProfile(input, previous = {}) {
  const provider = String(input.provider || "local");
  if (!["local", "oss", "r2"].includes(provider)) throw fail("Choose local storage, Alibaba Cloud OSS or Cloudflare R2");
  if (provider === "local") return { provider };
  const text = (key) => String(input[key] ?? "").trim();
  const bucket = text("bucket"), region = provider === "r2" ? "auto" : text("region"), accountId = provider === "r2" ? text("accountId") : "";
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) throw fail("Bucket must be 3–63 lowercase letters, numbers or hyphens");
  if (provider === "oss" && !/^[a-z]{2,}(?:-[a-z0-9]+)+$/.test(region)) throw fail("Enter an OSS region such as cn-hangzhou");
  if (provider === "r2" && !/^[a-f0-9]{32}$/.test(accountId)) throw fail("R2 Account ID must contain 32 hexadecimal characters");
  const same = previous.provider === provider;
  const accessKeyId = text("accessKeyId") || (same ? previous.accessKeyId : "");
  const accessKeySecret = text("accessKeySecret") || (same ? previous.accessKeySecret : "");
  if (!accessKeyId || !accessKeySecret || accessKeyId.length > 256 || accessKeySecret.length > 512 || /[\x00-\x20]/.test(accessKeyId + accessKeySecret)) throw fail("Enter the storage Access Key ID and Secret Access Key");
  const prefix = text("prefix").replace(/^\/+|\/+$/g, "");
  if (prefix) storageKey(prefix);
  let publicBaseUrl = text("publicBaseUrl").replace(/\/+$/, "");
  if (publicBaseUrl) {
    let url; try { url = new URL(publicBaseUrl); } catch { throw fail("Public media URL must be a valid HTTPS URL"); }
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw fail("Public media URL must use HTTPS without credentials, query or fragment");
    publicBaseUrl = url.href.replace(/\/+$/, "");
  }
  return { provider, bucket, region, accountId, accessKeyId, accessKeySecret, prefix, publicBaseUrl };
}
function publicProfile(profile) {
  const { accessKeyId, accessKeySecret } = profile;
  const visible = { ...profile }; delete visible.accessKeyId; delete visible.accessKeySecret; delete visible.id;
  return { ...visible, accessKeyId: "", accessKeySecret: "", hasAccessKeyId: Boolean(accessKeyId), hasAccessKeySecret: Boolean(accessKeySecret) };
}

// OSS V4 and AWS SigV4 deliberately use their respective canonical URI/header rules.
export function signObjectRequest(profile, method, key, headers = {}, now = new Date()) {
  const oss = profile.provider === "oss", region = profile.provider === "r2" ? "auto" : profile.region, name = storageKey([profile.prefix, key].filter(Boolean).join("/"));
  const url = new URL(oss ? `https://${profile.bucket}.oss-${profile.region}.aliyuncs.com/${pathEncode(name)}` : `https://${profile.accountId}.r2.cloudflarestorage.com/${profile.bucket}/${pathEncode(name)}`);
  const date = now.toISOString().replace(/[:-]|\.\d{3}/g, ""), day = date.slice(0, 8);
  const signed = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v).trim().replace(/\s+/g, " ")]));
  signed[oss ? "x-oss-date" : "x-amz-date"] = date;
  signed[oss ? "x-oss-content-sha256" : "x-amz-content-sha256"] = "UNSIGNED-PAYLOAD";
  if (!oss) signed.host = url.host;
  const names = Object.keys(signed).filter(k => !oss || k === "content-type" || k === "content-md5" || k.startsWith("x-oss-")).sort();
  const canonicalHeaders = names.map(k => `${k}:${signed[k]}\n`).join("");
  const signedNames = oss ? "" : names.join(";");
  const canonicalUri = oss ? `/${pathEncode(profile.bucket)}/${pathEncode(name)}` : url.pathname;
  const canonical = [method, canonicalUri, "", canonicalHeaders, signedNames, "UNSIGNED-PAYLOAD"].join("\n");
  const algorithm = oss ? "OSS4-HMAC-SHA256" : "AWS4-HMAC-SHA256", service = oss ? "oss" : "s3", suffix = oss ? "aliyun_v4_request" : "aws4_request";
  const scope = `${day}/${region}/${service}/${suffix}`;
  let signing = hmac((oss ? "aliyun_v4" : "AWS4") + profile.accessKeySecret, day);
  for (const part of [region, service, suffix]) signing = hmac(signing, part);
  const signature = hmac(signing, `${algorithm}\n${date}\n${scope}\n${hash(canonical)}`).toString("hex");
  signed.authorization = `${algorithm} Credential=${profile.accessKeyId}/${scope},${oss ? "" : ` SignedHeaders=${signedNames},`} Signature=${signature}`;
  delete signed.host;
  return { url, headers: signed, canonical };
}
export function createObjectClient(profile, transport = fetch) {
  async function request(method, key, { body, contentType, range, noOverwrite = false, contentLength, timeoutMs = 600000 } = {}) {
    const headers = {};
    if (contentType) headers["content-type"] = contentType;
    if (contentLength !== undefined) headers["content-length"] = String(contentLength);
    if (range) headers.range = range;
    if (noOverwrite) headers[profile.provider === "oss" ? "x-oss-forbid-overwrite" : "if-none-match"] = profile.provider === "oss" ? "true" : "*";
    const signed = signObjectRequest(profile, method, key, headers);
    let response;
    try { response = await transport(signed.url, { method, headers: signed.headers, body, ...(body && typeof body.pipe === "function" ? { duplex: "half" } : {}), redirect: "manual", signal: AbortSignal.timeout(timeoutMs) }); }
    catch { throw fail("Cloud storage is unreachable. Check the region/account and server network.", 502); }
    if (!response.ok && !(method === "GET" && response.status === 416)) {
      await response.body?.cancel().catch(() => {});
      if (response.status === 409 || response.status === 412) throw Object.assign(fail("A file already uses this storage key", 409), { code: "EEXIST" });
      throw fail(`Cloud storage rejected ${method} (${response.status}). Check bucket permissions and credentials.`, 502);
    }
    return response;
  }
  return { request };
}
const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".zip": "application/zip", ".json": "application/json" };
async function fileType(path) {
  const file = await open(path, "r");
  try { const bytes = Buffer.alloc(12); await file.read(bytes, 0, 12, 0); if (bytes.subarray(0, 3).toString() === "GIF") return "image/gif"; if (bytes[0] === 255 && bytes[1] === 216) return "image/jpeg"; return types[extname(path)] || "application/octet-stream"; }
  finally { await file.close(); }
}
export function createMediaStorage(options = {}) {
  const root = () => options.rootDir || process.env.STORAGE_PATH || resolve(".revival-storage");
  const data = () => options.dataDir || process.env.I_REMEMBER_DATA_DIR || resolve(".revival-data");
  const configPath = () => join(data(), "object-storage.enc.json");
  const indexPath = (group) => join(data(), "object-storage-index", `${storageKey(group)}.json`);
  const locks = new Map();
  async function locked(group, fn) {
    const previous = locks.get(group) || Promise.resolve();
    const next = previous.catch(() => {}).then(fn); locks.set(group, next);
    try { return await next; } finally { if (locks.get(group) === next) locks.delete(group); }
  }
  async function config() { const value = await jsonFile(configPath(), null); return value ? unprotect(value) : { active: null, profiles: {} }; }
  const client = (profile) => createObjectClient(profile, options.fetch || fetch);
  async function location(key) {
    const marker = await jsonFile(indexPath(groupFor(key)), null);
    if (!marker?.files[key]) return null;
    const settings = await config(), profile = settings.profiles[marker.profileId];
    if (!profile) throw fail("The original storage profile for this media is missing", 503);
    return { marker, profile, info: marker.files[key] };
  }
  // Keep database identities stable; expose the object's own public domain at
  // response boundaries, and resolve those URLs back on editor submissions.
  function rewriteUrls(text, toInternal = false) {
    if (!String(text).includes(toInternal ? "https://" : "/uploads/")) return text;
    const raw = (() => { try { return JSON.parse(readFileSync(configPath(), "utf8")); } catch (error) { if (error.code === "ENOENT") return null; throw error; } })();
    if (!raw) return text;
    const value = unprotect(raw), markers = new Map();
    const baseFor = profile => profile.publicBaseUrl || (profile.provider === "oss" ? `https://${profile.bucket}.oss-${profile.region}.aliyuncs.com` : "");
    const markerFor = key => {
      const group = groupFor(key);
      if (!markers.has(group)) {
        try { markers.set(group, JSON.parse(readFileSync(indexPath(group), "utf8"))); }
        catch (error) { if (error.code !== "ENOENT") throw error; markers.set(group, null); }
      }
      return markers.get(group);
    };
    return String(text).replace(/https?:\/\/[^\s<>"'\\()]+|\/uploads\/(?:admin|posts|tmp)\/[^\s<>"'\\()]+/g, original => {
      const suffix = original.match(/[?#].*$/)?.[0] || "", path = original.slice(0, original.length - suffix.length);
      try {
        if (toInternal) {
          for (const profile of Object.values(value.profiles)) {
            const base = baseFor(profile); if (!base) continue;
            const prefix = `${base}/${pathEncode(profile.prefix || "")}`.replace(/\/+$/, "") + "/";
            if (!path.startsWith(prefix)) continue;
            const key = storageKey(decodeURIComponent(path.slice(prefix.length))), marker = markerFor(key);
            if (marker?.profileId === profile.id && marker.files[key]) return `${url(key)}${suffix}`;
          }
          return original;
        }
        if (!path.startsWith("/uploads/")) return original;
        let key = storageKey(decodeURIComponent(path.slice(9)).replace(/^tmp\//, "posts/"));
        const marker = markerFor(key), profile = value.profiles[marker?.profileId];
        if (!profile || !baseFor(profile)) return original;
        // Legacy cards requested a virtual square; the processed preview exists in the bucket.
        if (!marker.files[key] && key.endsWith("/square.jpg")) key = key.replace(/square\.jpg$/, "resized.jpg");
        return marker.files[key] ? `${baseFor(profile)}/${pathEncode([profile.prefix, key].filter(Boolean).join("/"))}${suffix}` : original;
      } catch (error) { if (error.code === "object_storage_error") return original; throw error; }
    });
  }
  function url(key) { return `${(process.env.STORAGE_PUBLIC_BASE_URL || "/uploads").replace(/\/+$/, "")}/${storageKey(key)}`; }
  async function settings(provider) {
    if (provider && !["local", "oss", "r2"].includes(provider)) throw fail("Unknown storage provider");
    const value = await config();
    const profile = provider ? Object.values(value.profiles).filter(p => p.provider === provider).at(-1) : value.profiles[value.active];
    return publicProfile(profile || { provider: provider || "local" });
  }
  async function candidate(input) {
    const value = await config();
    const previous = Object.values(value.profiles).filter(p => p.provider === input.provider).at(-1);
    return validateStorageProfile(input, previous);
  }
  async function save(input) {
    return locked("configuration", async () => {
      const profile = await candidate(input), value = await config();
      if (profile.provider === "local") value.active = null;
      else {
        // Credential rotations apply to historical profiles in the same bucket.
        for (const old of Object.values(value.profiles)) {
          if (["provider", "bucket", "region", "accountId"].every(k => old[k] === profile[k])) Object.assign(old, { accessKeyId: profile.accessKeyId, accessKeySecret: profile.accessKeySecret, publicBaseUrl: profile.publicBaseUrl });
        }
        const id = randomUUID(); value.profiles[id] = { ...profile, id }; value.active = id;
      }
      await atomicJson(configPath(), protect(value)); return settings();
    });
  }
  async function test(input) {
    const profile = await candidate(input);
    if (profile.provider === "local") { await mkdir(root(), { recursive: true }); await access(root(), 2); return { ok: true, message: "Local media directory is writable" }; }
    const key = `connection-tests/${randomUUID()}.txt`, content = `storage-test-${randomUUID()}`, remote = client(profile);
    let created = false;
    try {
      await remote.request("PUT", key, { body: content, contentType: "text/plain", noOverwrite: true, timeoutMs: 8000 }); created = true;
      const result = await remote.request("GET", key, { timeoutMs: 8000 });
      if (await result.text() !== content) throw fail("Cloud storage read-back did not match the test upload", 502);
    } finally { if (created) await remote.request("DELETE", key, { timeoutMs: 8000 }); }
    return { ok: true, message: "Upload, read-back and deletion succeeded" };
  }
  async function flushDirectory(group) {
    return locked(group, async () => {
      const marker = await jsonFile(indexPath(group), null), value = await config();
      const profile = value.profiles[marker?.profileId || value.active];
      if (!profile) { if (marker) throw fail("Original media storage profile is missing", 503); return; }
      const next = marker || { version: 1, profileId: profile.id, files: {} };
      const folder = join(root(), storageKey(group));
      const names = await readdir(folder).catch(error => { if (error.code === "ENOENT") return []; throw error; });
      const completed = [];
      try {
        for (const name of names) {
          if (name.startsWith(".") || name.endsWith(".json")) continue;
          const key = storageKey(`${group}/${name}`), path = join(folder, name), info = await stat(path);
          if (!info.isFile()) continue;
          if (!next.files[key]) {
            const contentType = await fileType(path);
            const response = await client(profile).request("PUT", key, { body: createReadStream(path), contentType, contentLength: info.size, noOverwrite: true });
            await response.body?.cancel();
            next.files[key] = { contentType, size: info.size }; completed.push(key);
          }
        }
        await atomicJson(indexPath(group), next);
      } catch (error) {
        for (const key of completed) await client(profile).request("DELETE", key).catch(() => {});
        throw error;
      }
      // Only sanitized completed media leaves the processing directory; JSON manifests stay.
      for (const key of Object.keys(next.files)) await rm(join(root(), key), { force: true });
    });
  }
  async function upload(key, body, uploadOptions = {}) {
    storageKey(key);
    return locked(groupFor(key), async () => {
      const value = await config(), marker = await jsonFile(indexPath(groupFor(key)), null);
      const profile = value.profiles[marker?.profileId || value.active];
      if (marker && !profile) throw fail("Original media storage profile is missing", 503);
      if (await location(key)) throw Object.assign(fail("A file already uses this storage key", 409), { code: "EEXIST" });
      if (!profile) {
        const path = join(root(), key); await mkdir(dirname(path), { recursive: true }); await writeFile(path, body, { flag: "wx" }); return url(key);
      }
      if (await location(key) || await access(join(root(), key)).then(() => true, () => false)) throw Object.assign(fail("A file already uses this storage key", 409), { code: "EEXIST" });
      await client(profile).request("PUT", key, { body, contentType: uploadOptions.contentType, noOverwrite: true });
      try { await atomicJson(indexPath(groupFor(key)), { version: 1, profileId: profile.id, files: { ...marker?.files, [key]: { contentType: uploadOptions.contentType || "application/octet-stream", size: Buffer.byteLength(body) } } }); }
      catch (error) { await client(profile).request("DELETE", key).catch(() => {}); throw error; }
      return url(key);
    });
  }
  async function remove(key) {
    const group = groupFor(key);
    return locked(group, async () => {
      const marker = await jsonFile(indexPath(group), null);
      if (marker) {
        const profile = (await config()).profiles[marker.profileId];
        if (!profile) throw fail("Original media storage profile is missing", 503);
        const keys = Object.keys(marker.files).filter(k => k === key || k.startsWith(`${key}/`));
        for (const object of keys) { await client(profile).request("DELETE", object); delete marker.files[object]; }
        if (Object.keys(marker.files).length) await atomicJson(indexPath(group), marker); else await rm(indexPath(group), { force: true });
      }
      await rm(join(root(), storageKey(key)), { force: true, recursive: true });
    });
  }
  async function read(key) {
    const remote = await location(key);
    if (!remote) return null;
    if (remote.info.size > 64 * 1024 * 1024) throw fail("Image exceeds processing capacity", 413);
    const response = await client(remote.profile).request("GET", key);
    const chunks = []; let size = 0;
    for await (const chunk of response.body || []) { size += chunk.length; if (size > 64 * 1024 * 1024) throw fail("Image exceeds processing capacity", 413); chunks.push(Buffer.from(chunk)); }
    return { data: Buffer.concat(chunks), mimeType: remote.info.contentType };
  }
  async function serve(req, res) {
    if (!["GET", "HEAD"].includes(req.method)) return false;
    let path;
    try { path = decodeURIComponent(new URL(req.url, "http://local").pathname); } catch { return false; }
    const base = (process.env.STORAGE_PUBLIC_BASE_URL || "/uploads").replace(/\/+$/, "");
    const prefix = path.startsWith(base + "/") ? base : /^\/uploads\/(?:posts|tmp)\//.test(path) ? "/uploads" : null;
    if (!prefix) return false;
    let key = path.slice(prefix.length + 1).replace(/^tmp\//, "posts/");
    try { key = storageKey(key); } catch { return false; }
    const remote = await location(key); if (!remote) return false;
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noimageindex");
    if (remote.profile.publicBaseUrl) {
      res.statusCode = 302; res.setHeader("Location", `${remote.profile.publicBaseUrl}/${pathEncode([remote.profile.prefix, key].filter(Boolean).join("/"))}`); res.setHeader("Cache-Control", "no-store"); res.end(); return true;
    }
    const response = await client(remote.profile).request(req.method, key, { range: req.headers.range });
    res.statusCode = response.status;
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) { const value = response.headers.get(name); if (value) res.setHeader(name, value); }
    const contentType = Object.values(types).includes(remote.info.contentType) ? remote.info.contentType : "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (contentType === "application/octet-stream") res.setHeader("Content-Disposition", "attachment");
    res.setHeader("Cache-Control", "public, max-age=3600");
    if (key.endsWith("/live-photo.zip")) res.setHeader("Content-Disposition", 'attachment; filename="Live Photo.zip"');
    if (req.method === "HEAD" || !response.body) res.end(); else await pipeline(Readable.fromWeb(response.body), res);
    return true;
  }
  return { settings, save, test, upload, rewriteUrls, delete: remove, getUrl: url, flushDirectory, read, serve, async exists(key) { return Boolean(await location(key)) || access(join(root(), storageKey(key))).then(() => true, () => false); } };
}
