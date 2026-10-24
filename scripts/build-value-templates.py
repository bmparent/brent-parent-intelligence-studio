#!/usr/bin/env python3
"""Build deterministic private draft ZIPs without touching paid-template archives."""
import hashlib
import html
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "products/value-templates"
OUTPUT = ROOT / "artifacts/value-templates"


def main():
    catalog = json.loads((SOURCE / "catalog.json").read_text())
    if catalog["commercialAvailability"] != "unavailable":
        raise ValueError("This builder is for unavailable private drafts only")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    packages = []
    for product in catalog["products"]:
        if product["commercialAvailability"] != "unavailable":
            raise ValueError("Do not activate an edition through this draft builder")
        slug, version = product["slug"], product["version"]
        source = ROOT / product["sourcePath"]
        payload = {}
        for path in sorted(source.rglob("*")):
            if path.is_symlink():
                raise ValueError(f"Symlinks are not buyer source: {path}")
            if not path.is_file():
                continue
            relative = path.relative_to(source).as_posix()
            data = path.read_bytes()
            if path.suffix == ".html":
                data = data.replace(b'../shared/runtime.js', b'runtime.js')
            payload[relative] = data
        if slug != "gatherline":
            payload["runtime.js"] = (SOURCE / "shared/runtime.js").read_bytes()
        # Buyer-only setup companion. It reads the actual local configuration;
        # no duplicated defaults, network service or code editor is required
        # for the supported configuration fields.
        setup = (SOURCE / "shared/START-HERE.html").read_text()
        setup = setup.replace("__TEMPLATE_NAME__", html.escape(product["name"]))
        payload["START-HERE.html"] = setup.encode()
        payload["setup.js"] = (SOURCE / "shared/setup.js").read_bytes()
        manifest = {
            "productId": product["id"], "version": version,
            "status": "private draft; commercial availability unavailable",
            "draftPriceCents": product["draftPriceCents"], "currency": "USD",
            "files": [{"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
                      for name, data in sorted(payload.items())]
        }
        payload["PACKAGE_MANIFEST.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
        package = OUTPUT / f"{slug}-{version}-private-draft.zip"
        with zipfile.ZipFile(package, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for name, data in sorted(payload.items()):
                info = zipfile.ZipInfo(f"{slug}/{name}", date_time=(2026, 10, 22, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, data)
        packages.append({"productId": product["id"], "path": package.relative_to(ROOT).as_posix(),
                         "sha256": hashlib.sha256(package.read_bytes()).hexdigest(),
                         "bytes": package.stat().st_size, "fileCount": len(payload)})
    report = {"batch": catalog["batch"], "commercialAvailability": "unavailable", "packages": packages}
    (OUTPUT / "package-report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
