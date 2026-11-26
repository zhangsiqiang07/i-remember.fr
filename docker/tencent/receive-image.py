#!/usr/bin/env python3
"""Receive a bounded Docker archive; verify it before the deploy script loads it."""
import base64
import hashlib
import json
import os
from pathlib import PurePosixPath
import sys
import tarfile

MAX_ARCHIVE = 2 * 1024 * 1024 * 1024
SOURCE = "https://github.com/zhangsiqiang07/i-remember.fr"


def receive(stream, path, revision, digest, image_id, archive_sha, size, encoded_manifest):
    if not 0 < size <= MAX_ARCHIVE:
        raise ValueError("Image archive exceeds the allowed size")
    raw = base64.b64decode(encoded_manifest, validate=True)
    if len(raw) > 49152 or "sha256:" + hashlib.sha256(raw).hexdigest() != digest:
        raise ValueError("Registry manifest digest mismatch")
    registry = json.loads(raw)
    if registry.get("config", {}).get("digest") != image_id:
        raise ValueError("Image ID does not match the registry manifest")
    checksum = hashlib.sha256()
    remaining = size
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as output:
        while remaining:
            block = stream.read(min(1024 * 1024, remaining))
            if not block:
                raise ValueError("Incomplete image transfer")
            output.write(block)
            checksum.update(block)
            remaining -= len(block)
    if stream.read(1):
        raise ValueError("Unexpected data after image archive")
    if checksum.hexdigest() != archive_sha:
        raise ValueError("Image archive checksum mismatch")
    with tarfile.open(path, "r:*") as archive:
        members = {}
        total = 0
        for member in archive:
            name = PurePosixPath(member.name)
            if (name.is_absolute() or ".." in name.parts or "\\" in member.name
                    or not (member.isfile() or member.isdir()) or member.name in members):
                raise ValueError("Unsafe or duplicate archive member")
            members[member.name] = member
            total += member.size
            if len(members) > 512 or total > 8 * MAX_ARCHIVE:
                raise ValueError("Image archive contents exceed limits")

        def small_file(name):
            member = members.get(name)
            if not member or not member.isfile() or member.size > 1024 * 1024:
                raise ValueError("Missing or oversized image metadata")
            return archive.extractfile(member).read()

        manifest = json.loads(small_file("manifest.json"))
        if not isinstance(manifest, list) or len(manifest) != 1:
            raise ValueError("Only one project image may be loaded")
        entry = manifest[0]
        allowed_tag = "ghcr.io/zhangsiqiang07/i-remember.fr:sha-" + revision
        if entry.get("RepoTags") not in (None, [], [allowed_tag]):
            raise ValueError("Archive may not replace unrelated image tags")
        config_bytes = small_file(entry["Config"])
        if "sha256:" + hashlib.sha256(config_bytes).hexdigest() != image_id:
            raise ValueError("Archive config does not match the registry image")
        config = json.loads(config_bytes)
        labels = config.get("config", {}).get("Labels") or {}
        if (config.get("architecture") != "amd64" or config.get("os") != "linux"
                or labels.get("org.opencontainers.image.revision") != revision
                or labels.get("org.opencontainers.image.source") != SOURCE):
            raise ValueError("Image architecture, source or revision mismatch")
        for layer in entry.get("Layers", []):
            if layer not in members or not members[layer].isfile():
                raise ValueError("Missing image layer")
        if "index.json" in members:
            index = json.loads(small_file("index.json"))
            descriptors = index.get("manifests", [])
            if len(descriptors) != 1:
                raise ValueError("Only one OCI image may be loaded")
            descriptor = descriptors[0]
            reference = descriptor.get("annotations", {}).get("org.opencontainers.image.ref.name")
            if reference not in (None, allowed_tag, "sha-" + revision):
                raise ValueError("OCI archive may not replace unrelated tags")
            algorithm, value = descriptor["digest"].split(":", 1)
            if algorithm != "sha256" or len(value) != 64 or any(c not in "0123456789abcdef" for c in value):
                raise ValueError("Invalid OCI manifest digest")
            oci_bytes = small_file("blobs/sha256/" + value)
            if hashlib.sha256(oci_bytes).hexdigest() != value:
                raise ValueError("OCI manifest checksum mismatch")
            if json.loads(oci_bytes).get("config", {}).get("digest") != image_id:
                raise ValueError("OCI manifest references another image")


if __name__ == "__main__":
    try:
        revision, digest, image_id, checksum, size, manifest, path = sys.argv[1:]
        receive(sys.stdin.buffer, path, revision, digest, image_id, checksum, int(size), manifest)
        print("Verified image archive, registry digest, architecture and source")
    except (ValueError, KeyError, TypeError, OSError, tarfile.TarError) as error:
        print("Image transfer rejected: " + str(error), file=sys.stderr)
        sys.exit(1)
