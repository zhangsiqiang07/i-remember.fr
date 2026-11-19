import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, mkdir, access, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { createMediaStorage, signObjectRequest, validateStorageProfile } from "./object-storage.js";

const directory = await mkdtemp(join(tmpdir(), "object-storage-test-"));
const previousSecret = process.env.AUTH_SECRET;
const previousPublicBase = process.env.STORAGE_PUBLIC_BASE_URL;
process.env.AUTH_SECRET = "disposable-storage-test-auth-secret";
const rootDir = join(directory, "assets"), dataDir = join(directory, "state");
const objects = new Map(), requests = [];
const r2 = { provider: "r2", accountId: "a".repeat(32), bucket: "memories-test", accessKeyId: "r2-access-id", accessKeySecret: "r2-secret-value", prefix: "archive" };
const oss = { provider: "oss", region: "cn-hangzhou", bucket: "memories-test", accessKeyId: "oss-access-id", accessKeySecret: "oss-secret-value", prefix: "photos" };
async function transport(url, options) {
  const name = String(url), headers = options.headers, method = options.method;
  assert.equal(options.redirect, "manual");
  assert.match(headers.authorization, /^(AWS4-HMAC-SHA256|OSS4-HMAC-SHA256) Credential=/);
  assert.equal(headers[headers["x-oss-date"] ? "x-oss-content-sha256" : "x-amz-content-sha256"], "UNSIGNED-PAYLOAD");
  requests.push({ name, method, headers });
  if (method === "PUT") {
    if (objects.has(name) && (headers["if-none-match"] || headers["x-oss-forbid-overwrite"])) return new Response(null, { status: 412 });
    let body = options.body;
    if (body && typeof body.pipe === "function") { const chunks = []; for await (const chunk of body) chunks.push(chunk); body = Buffer.concat(chunks); }
    objects.set(name, Buffer.from(body)); return new Response(null, { status: 200 });
  }
  if (method === "DELETE") { objects.delete(name); return new Response(null, { status: 204 }); }
  const bytes = objects.get(name);
  if (!bytes) return new Response(null, { status: 404 });
  if (headers.range) {
    const [, start, end] = headers.range.match(/^bytes=(\d+)-(\d+)$/);
    const part = bytes.subarray(Number(start), Number(end) + 1);
    return new Response(part, { status: 206, headers: { "content-range": `bytes ${start}-${end}/${bytes.length}`, "content-length": String(part.length), "accept-ranges": "bytes" } });
  }
  return new Response(method === "HEAD" ? null : bytes, { status: 200, headers: { "content-length": String(bytes.length) } });
}
const storage = createMediaStorage({ rootDir, dataDir, fetch: transport });
let server;
try {
  assert.deepEqual((await storage.settings()).provider, "local");
  await storage.upload("admin/old.jpg", Buffer.from("local-original"));
  const canonical = signObjectRequest(oss, "PUT", "a b/c.jpg", { "content-type": "image/jpeg", "x-oss-forbid-overwrite": "true" }, new Date("2025-03-28T10:10:48Z"));
  assert.equal(canonical.url.href, "https://memories-test.oss-cn-hangzhou.aliyuncs.com/photos/a%20b/c.jpg");
  assert.equal(canonical.canonical, "PUT\n/memories-test/photos/a%20b/c.jpg\n\ncontent-type:image/jpeg\nx-oss-content-sha256:UNSIGNED-PAYLOAD\nx-oss-date:20250328T101048Z\nx-oss-forbid-overwrite:true\n\n\nUNSIGNED-PAYLOAD");
  assert.match(canonical.headers.authorization, /Credential=oss-access-id\/20250328\/cn-hangzhou\/oss\/aliyun_v4_request/);
  const aws = signObjectRequest(r2, "GET", "admin/image.png", {}, new Date("2025-03-28T10:10:48Z"));
  assert.equal(aws.url.pathname, "/memories-test/archive/admin/image.png");
  assert.match(aws.headers.authorization, /SignedHeaders=host;x-amz-content-sha256;x-amz-date/);
  assert.throws(() => validateStorageProfile({ ...r2, accountId: "localhost" }), /Account ID/);
  assert.throws(() => validateStorageProfile({ ...oss, region: "cn-hangzhou.example.com" }), /region/);
  assert.throws(() => validateStorageProfile({ ...r2, prefix: "../private" }), /storage key/);
  assert.throws(() => validateStorageProfile({ ...r2, publicBaseUrl: "http://media.example.com" }), /HTTPS/);
  assert.equal((await storage.test(r2)).ok, true);
  assert.equal(objects.size, 0, "Connection probes must remove their temporary objects");
  const saved = await storage.save(r2);
  assert.equal(saved.accessKeySecret, ""); assert.equal(saved.accessKeyId, ""); assert.equal(saved.hasAccessKeySecret, true);
  const encrypted = await readFile(join(dataDir, "object-storage.enc.json"), "utf8");
  assert.ok(!encrypted.includes(r2.accessKeySecret)); assert.ok(!encrypted.includes(r2.accessKeyId));
  assert.equal((await stat(join(dataDir, "object-storage.enc.json"))).mode & 0o777, 0o600);
  await storage.save({ ...saved, prefix: "archive", accessKeyId: "", accessKeySecret: "" });
  assert.equal(await storage.upload("admin/cloud.png", Buffer.from("cloud-image"), { contentType: "image/png" }), "/uploads/admin/cloud.png");
  await assert.rejects(access(join(rootDir, "admin/cloud.png")), { code: "ENOENT" });
  await assert.rejects(storage.upload("admin/cloud.png", "overwrite"), { code: "EEXIST" });
  const group = "posts/revival-aabbccdd-123", folder = join(rootDir, group);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, "full.jpg"), Buffer.from("GIF89a-test"));
  await writeFile(join(folder, "video.mp4"), Buffer.from("0123456789"));
  await writeFile(join(folder, "video.json"), '{"duration":1}');
  await storage.flushDirectory(group);
  await assert.rejects(access(join(folder, "video.mp4")), { code: "ENOENT" });
  assert.equal(await readFile(join(folder, "video.json"), "utf8"), '{"duration":1}');
  assert.equal((await storage.read(group + "/full.jpg")).mimeType, "image/gif", "GIF bytes retain animation MIME under legacy .jpg URLs");
  const restarted = createMediaStorage({ rootDir, dataDir, fetch: transport });
  assert.equal((await restarted.read("admin/cloud.png")).data.toString(), "cloud-image");
  await storage.save(oss);
  assert.equal((await storage.read("admin/cloud.png")).data.toString(), "cloud-image", "Provider switches retain the original object's profile");
  await storage.upload(group + "/extra.jpg", Buffer.from("additional-image"), { contentType: "image/jpeg" });
  assert.equal((await storage.read(group + "/full.jpg")).data.toString(), "GIF89a-test", "Adding a file must preserve the group index");
  await storage.upload("admin/oss.png", Buffer.from("oss-image"), { contentType: "image/png" });
  assert.ok(requests.some(r => r.method === "PUT" && r.name.includes("oss-cn-hangzhou.aliyuncs.com")));
  const ossUrl = "https://memories-test.oss-cn-hangzhou.aliyuncs.com/photos/admin/oss.png";
  assert.equal(storage.rewriteUrls('/uploads/admin/oss.png'), ossUrl);
  assert.deepEqual(storage.publicOrigins(), ['https://memories-test.oss-cn-hangzhou.aliyuncs.com']);
  assert.equal(storage.rewriteUrls(ossUrl, true), '/uploads/admin/oss.png');
  assert.equal(storage.rewriteUrls('/uploads/admin/old.jpg'), '/uploads/admin/old.jpg', 'Local images must retain local URLs');
  assert.equal(storage.rewriteUrls('https://unrelated.example/uploads/admin/oss.png'), 'https://unrelated.example/uploads/admin/oss.png');
  assert.equal(storage.rewriteUrls(ossUrl.replace('oss.png', 'unknown.png'), true), ossUrl.replace('oss.png', 'unknown.png'), 'External objects are not managed uploads');
  await storage.save({ ...oss, publicBaseUrl: 'https://media.example.com/base/' });
  const cdnUrl = 'https://media.example.com/base/photos/admin/oss.png';
  assert.deepEqual(storage.publicOrigins(), ['https://media.example.com']);
  assert.equal(storage.rewriteUrls('/uploads/admin/oss.png?download=1'), cdnUrl + '?download=1');
  const payload = JSON.stringify({ attachments: [{url:'/uploads/admin/oss.png'}], content:'![photo](/uploads/admin/oss.png)' });
  assert.deepEqual(JSON.parse(storage.rewriteUrls(storage.rewriteUrls(payload), true)), JSON.parse(payload), 'Editor round trips retain media identity and Markdown references');
  assert.equal(restarted.rewriteUrls('/uploads/admin/oss.png'), cdnUrl, 'Separate processes see current configuration');

  await storage.save({ provider: "local" });
  assert.equal(await storage.exists("admin/cloud.png"), true);
  await assert.rejects(storage.upload("admin/cloud.png", "overwrite"), { code: "EEXIST" });
  await storage.upload("admin/local-again.jpg", "local-again");
  assert.equal(await readFile(join(rootDir, "admin/old.jpg"), "utf8"), "local-original", "Existing local media is preserved");
  server = createServer((req, res) => storage.serve(req, res).then(handled => { if (!handled) { res.statusCode = 404; res.end(); } }).catch(() => { res.statusCode = 500; res.end(); }));
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const media = await fetch(origin + `/uploads/${group}/video.mp4`, { headers: { Range: "bytes=2-5" } });
  assert.equal(media.status, 206); assert.equal(await media.text(), "2345"); assert.equal(media.headers.get("content-range"), "bytes 2-5/10");
  assert.match(media.headers.get("x-robots-tag"), /noimageindex/);
  const head = await fetch(origin + "/uploads/admin/cloud.png", { method: "HEAD" });
  assert.equal(head.status, 200); assert.equal(head.headers.get("content-length"), "11");
  assert.equal(await (await fetch(origin + `/uploads/tmp/revival-aabbccdd-123/full.jpg`)).text(), "GIF89a-test");
  process.env.STORAGE_PUBLIC_BASE_URL = "/custom-media";
  assert.equal((await fetch(origin + `/uploads/${group}/video.mp4`)).status,200,"Public legacy media URLs survive a custom API storage base");
  assert.equal((await fetch(origin + "/custom-media/admin/cloud.png")).status,200);
  if (previousPublicBase === undefined) delete process.env.STORAGE_PUBLIC_BASE_URL; else process.env.STORAGE_PUBLIC_BASE_URL = previousPublicBase;
  await storage.delete("admin/cloud.png"); assert.equal(await storage.exists("admin/cloud.png"), false);
  await storage.delete(group); assert.ok(![...objects.keys()].some(key => key.includes(group)));
  await storage.delete("admin/oss.png");
  assert.equal(objects.size, 0);
  process.env.AUTH_SECRET = "wrong-auth-secret";
  await assert.rejects(storage.settings(), /cannot be decrypted/);
  console.log("Object storage: OSS/R2 signing, encrypted configuration, credential retention, private media Range/HEAD, provider switches, restart and deletion passed");
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  if (previousPublicBase === undefined) delete process.env.STORAGE_PUBLIC_BASE_URL; else process.env.STORAGE_PUBLIC_BASE_URL = previousPublicBase;
  if (previousSecret === undefined) delete process.env.AUTH_SECRET; else process.env.AUTH_SECRET = previousSecret;
  await rm(directory, { recursive: true, force: true });
}
