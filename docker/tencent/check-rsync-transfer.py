#!/usr/bin/env python3
"""Exercise the actual forced-command parser and rsync protocol in isolation."""
import os
import re
from pathlib import Path
import shutil
import subprocess
import tempfile

if not shutil.which("rsync"):
    raise SystemExit("rsync is required for deployment verification")
with tempfile.TemporaryDirectory(prefix="remember-rsync-") as directory:
    base = Path(directory)
    cache = base / ".image-transfer" / "image.tar"
    cache.parent.mkdir()
    original = os.urandom(4 * 1024 * 1024)
    cache.write_bytes(original)
    expected = original[:12345] + b"updated image block" + original[12345:]
    source = base / "source.tar"
    source.write_bytes(expected)
    script = base / "deploy.sh"
    script.write_text(Path(__file__).with_name("deploy-from-actions.sh").read_text().replace(
        "base=/opt/i-remember", 'base="' + directory + '"', 1))
    wrapper = base / "ssh"
    wrapper.write_text('''#!/bin/bash
set -eu
while [[ "$1" != upload\\ * ]]; do shift; done
export SSH_ORIGINAL_COMMAND="$*"
exec bash "$TEST_SERVER_SCRIPT"
''')
    wrapper.chmod(0o700)
    env = dict(os.environ, TEST_SERVER_SCRIPT=str(script))
    command = "upload " + "a" * 40 + " sha256:" + "b" * 64
    result = subprocess.run(["rsync", "--partial", "--checksum", "--compress", "--no-whole-file",
                             "--protocol=31", "--timeout=180", "--stats", "--rsync-path=" + command,
                             "-e", str(wrapper), str(source), "root@example:image.tar"],
                            env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)
    assert cache.read_bytes() == expected, "Received archive differs from sender"
    print(result.stdout)
    literal = re.search(r"Literal data: ([0-9,]+)", result.stdout)
    assert literal and int(literal.group(1).replace(",", "")) < 65536, "Expected an incremental transfer"
    # Reject arbitrary remote paths/options before rsync can run.
    for tail in ["--server -cze.LsfxC --partial . other.tar",
                 "--server -cze.LsfxC --delete . image.tar",
                 "--server -cze.LsfxC --partial . /etc/passwd"]:
        rejected = subprocess.run(["bash", str(script)], env=dict(env, SSH_ORIGINAL_COMMAND=command + " " + tail),
                                  stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        assert rejected.returncode != 0, "Unsafe transfer command was accepted"
    print("Incremental transfer and forced-command restrictions passed")
