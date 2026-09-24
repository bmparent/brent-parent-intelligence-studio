"""Local rendering check only. The mock response is not integration evidence."""
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from threading import Thread
import json
import re

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "ops/owner-console/src/ui.ts").read_text(encoding="utf-8")
html = re.search(r"export const html = `(.*)`;\s*$", source, re.S).group(1)
artifact = ROOT / "artifacts/implementation/2026-09-24"
artifact.mkdir(parents=True, exist_ok=True)
fixture = {
    "status": "healthy", "observedAt": "2026-09-24T20:00:00Z", "environment": "local-render-fixture",
    "data": {"work": [
        {"id":"release-snapshot","title":"Snapshot security, cost and storage","source":"acceptance tracker","detail":"Pinned capture and recovery remain open","severity":"critical","status":"blocked","version":1,"updated_at":"2026-09-24T20:00:00Z"},
        {"id":"release-google","title":"Google preview callback and real consent","source":"acceptance tracker","detail":"Consent still needs provider configuration","severity":"high","status":"blocked","version":1,"updated_at":"2026-09-24T20:00:00Z"}],
        "accounts": None, "agents": None, "outcomes": [], "audit": [], "sourceRevision": "unobserved",
        "readiness":{"kitMode":"unknown"}, "release":{"status":"blocked"},
        "connectors":{"inquiries":"not_configured","stripeProvider":"not_configured","cloudflare":"not_configured"}}
}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = html.encode() if self.path == "/" else json.dumps(fixture).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html" if self.path == "/" else "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *_args):
        pass

server = HTTPServer(("127.0.0.1", 0), Handler)
Thread(target=server.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{server.server_port}/"
results = []
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for label, width, height in [("desktop", 1440, 900), ("mobile", 390, 844)]:
        page = browser.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(url, wait_until="networkidle")
        assert page.locator("h1").inner_text() == "Overview"
        assert page.locator("text=Snapshot security, cost and storage").count() == 1
        if label == "mobile":
            page.locator("#menu").click()
            assert page.locator("#menu").get_attribute("aria-expanded") == "true"
            page.locator("#menu").press("Escape")
            assert page.locator("#menu").get_attribute("aria-expanded") == "false"
        overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
        assert not overflow, f"horizontal overflow at {width}px"
        assert not errors, errors
        page.screenshot(path=str(artifact / f"owner-console-local-{label}.png"), full_page=True)
        results.append({"viewport": label, "width": width, "pageErrors": errors, "overflow": overflow})
        page.close()
    browser.close()
server.shutdown()
(artifact / "owner-console-local-browser.json").write_text(json.dumps({"kind":"local render fixture, not hosted integration", "results":results}, indent=2) + "\n", encoding="utf-8")
print(json.dumps(results))
