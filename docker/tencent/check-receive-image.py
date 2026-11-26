#!/usr/bin/env python3
import base64
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import sys
import unittest

sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location("receiver", Path(__file__).with_name("receive-image.py"))
receiver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(receiver)


class ImageTransferTests(unittest.TestCase):
    def payload(self, change=None, extra=None):
        self.revision = "a" * 40
        config = {"architecture": "amd64", "os": "linux", "config": {"Labels": {
            "org.opencontainers.image.revision": self.revision,
            "org.opencontainers.image.source": receiver.SOURCE,
        }}}
        if change:
            change(config)
        encoded = json.dumps(config).encode()
        self.image_id = "sha256:" + hashlib.sha256(encoded).hexdigest()
        raw = json.dumps({"schemaVersion": 2, "config": {"digest": self.image_id}}).encode()
        self.digest = "sha256:" + hashlib.sha256(raw).hexdigest()
        self.manifest = base64.b64encode(raw).decode()
        buffer = io.BytesIO()
        with tarfile.open(fileobj=buffer, mode="w:gz") as archive:
            for name, data in {"config.json": encoded, "manifest.json": json.dumps([
                    {"Config": "config.json", "RepoTags": None, "Layers": []}]).encode(), **(extra or {})}.items():
                info = tarfile.TarInfo(name)
                info.size = len(data)
                archive.addfile(info, io.BytesIO(data))
        return buffer.getvalue()

    def check(self, body, **overrides):
        values = dict(revision=self.revision, digest=self.digest, image_id=self.image_id,
                      archive_sha=hashlib.sha256(body).hexdigest(), size=len(body), encoded_manifest=self.manifest)
        values.update(overrides)
        with tempfile.TemporaryDirectory() as directory:
            receiver.receive(io.BytesIO(body), str(Path(directory) / "image"), **values)

    def test_valid_archive(self):
        self.check(self.payload())

    def test_truncation_and_checksum(self):
        body = self.payload()
        for changes in [{"size": len(body) + 1}, {"size": len(body) - 1},
                        {"archive_sha": "0" * 64}, {"digest": "sha256:" + "0" * 64},
                        {"image_id": "sha256:" + "0" * 64}, {"size": receiver.MAX_ARCHIVE + 1}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.check(body, **changes)

    def test_wrong_architecture_source_and_revision(self):
        for change in [lambda c: c.update(architecture="arm64"),
                       lambda c: c["config"]["Labels"].update({"org.opencontainers.image.source": "other"}),
                       lambda c: c["config"]["Labels"].update({"org.opencontainers.image.revision": "b" * 40})]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.check(self.payload(change=change))

    def test_traversal_and_other_image_tags(self):
        with self.assertRaises(ValueError):
            self.check(self.payload(extra={"../outside": b"bad"}))
        with self.assertRaises(ValueError):
            self.check(self.payload(extra={"manifest.json": json.dumps([
                {"Config": "config.json", "RepoTags": ["unrelated:latest"], "Layers": []}]).encode()}))


if __name__ == "__main__":
    unittest.main()
