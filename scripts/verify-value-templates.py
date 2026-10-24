#!/usr/bin/env python3
"""Verify exact draft archives, standalone links/assets and release boundaries."""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import re
from urllib.parse import unquote, urlsplit
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "products/value-templates"
OUTPUT = ROOT / "artifacts/value-templates"


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.resources, self.h1 = [], [], [], 0
        self.has_viewport = False
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "meta" and attrs.get("name") == "viewport":
            self.has_viewport = True
        if tag == "meta" and attrs.get("name") == "robots":
            self.noindex = "noindex" in attrs.get("content", "")
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        for key in ("src",):
            if attrs.get(key):
                self.resources.append(attrs[key])
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.resources.append(attrs["href"])


def normalize(base, relative):
    parts = []
    for part in (PurePosixPath(base).parent / unquote(relative)).parts:
        if part == "..":
            if not parts:
                raise AssertionError("A buyer file escapes the package")
            parts.pop()
        elif part != ".":
            parts.append(part)
    return "/".join(parts)


def main():
    catalog = json.loads((SOURCE / "catalog.json").read_text())
    report = json.loads((OUTPUT / "package-report.json").read_text())
    assert catalog["commercialAvailability"] == report["commercialAvailability"] == "unavailable"
    assert len(catalog["products"]) == 3
    assert {p["draftPriceCents"] for p in catalog["products"]} == {1200, 2900, 5900}
    checks = []
    for product, package in zip(catalog["products"], report["packages"], strict=True):
        slug = product["slug"]
        assert product["commercialAvailability"] == "unavailable" and product["status"] == "draft"
        archive_path = ROOT / package["path"]
        archive_bytes = archive_path.read_bytes()
        assert hashlib.sha256(archive_bytes).hexdigest() == package["sha256"]
        assert len(archive_bytes) == package["bytes"]
        with zipfile.ZipFile(archive_path) as archive:
            assert archive.testzip() is None
            names = archive.namelist()
            assert len(names) == len(set(names)) == package["fileCount"]
            assert all(n.startswith(slug + "/") and ".." not in PurePosixPath(n).parts for n in names)
            payload = {name.removeprefix(slug + "/"): archive.read(name) for name in names}
        manifest = json.loads(payload["PACKAGE_MANIFEST.json"])
        assert manifest["productId"] == product["id"]
        assert manifest["draftPriceCents"] == product["draftPriceCents"]
        assert {f["path"] for f in manifest["files"]} == set(payload) - {"PACKAGE_MANIFEST.json"}
        for item in manifest["files"]:
            actual = payload[item["path"]]
            assert hashlib.sha256(actual).hexdigest() == item["sha256"]
            assert len(actual) == item["bytes"]
        behavior_file = "script.js" if slug == "gatherline" else "runtime.js"
        assert all(name in payload for name in ["README.md", "LICENSE-DRAFT.txt", "config.js", behavior_file, "styles.css", "START-HERE.html", "setup.js"])
        documents = {}
        for name, data in payload.items():
            if name.endswith(".html"):
                document = Document()
                document.feed(data.decode())
                assert len(document.ids) == len(set(document.ids)), (slug, name, "duplicate IDs")
                documents[name] = document
                if name != "section.html":
                    assert document.h1 == 1 and document.has_viewport and document.noindex, (slug, name)
            if name.endswith((".js", ".css", ".html")):
                content = data.decode()
                assert not re.search(r"\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage)\s*[.(]", content), (slug, name)
                assert not re.search(r"url\(['\"]?https?://", content), (slug, name)
        for name, document in documents.items():
            for url in document.resources + document.links:
                parsed = urlsplit(url)
                assert not parsed.scheme and not parsed.netloc, (slug, name, "external dependency", url)
                target = normalize(name, parsed.path) if parsed.path else name
                assert target in payload, (slug, name, "missing link or asset", url)
                if parsed.fragment:
                    assert target in documents and parsed.fragment in documents[target].ids, (slug, name, "missing fragment", url)
        assert all(name in documents for name in product["pages"])
        assert not list((ROOT / "public").rglob(archive_path.name)), "Draft buyer ZIP must not be in static hosting"
        checks.append({"product": slug, "files": len(payload), "pages": len(product["pages"]), "state": "pass"})
    receipt = {"scope": "exact private archive hashes, integrity, isolated buyer links/assets and unavailable commerce", "products": checks}
    (OUTPUT / "verification.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    main()
