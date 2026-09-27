"""Exercise the owner UI refresh behavior against a local, labeled fixture."""
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from threading import Thread
import json
import re

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
source = (root / "ops/owner-console/src/ui.ts").read_text(encoding="utf-8")
html = re.search(r"export const html = `(.*)`;\s*$", source, re.S).group(1)
output = root / "artifacts/implementation/2026-09-27"
output.mkdir(parents=True, exist_ok=True)
state = {"reads": 0, "fail": False}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            status, body, kind = 200, html.encode(), "text/html"
        elif self.path == "/api/operations":
            state["reads"] += 1
            if state["fail"]:
                status, data = 503, {"error": "fixture source unavailable"}
            else:
                status = 200
                data = {
                    "status": "healthy",
                    "environment": "local-fixture",
                    "observedAt": "2026-09-27T21:00:00Z",
                    "staleAfter": "2026-10-01T00:00:00Z",
                    "data": {"work": [], "accounts": state["reads"], "agents": 0,
                             "outcomes": [], "audit": [], "readiness": {"kitMode": "test"}},
                }
            body, kind = json.dumps(data).encode(), "application/json"
        elif self.path == "/api/sources/daily-refresh":
            status, kind = 200, "application/json"
            body = json.dumps({"data": {"attemptedAt": "2026-09-27T03:15:00Z",
                                        "lastSuccessAt": "2026-09-27T03:15:00Z",
                                        "status": "healthy",
                                        "sources": {"github": {"status": "healthy"},
                                                    "deployments": {"status": "healthy"}}}}).encode()
        else:
            status, kind, body = 200, "application/json", b'{"status":"healthy","data":{"pulls":[],"workflows":[],"site":{"status":"healthy"},"backend":{"status":"healthy"}}}'
        self.send_response(status)
        self.send_header("Content-Type", kind)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *_args):
        pass


server = HTTPServer(("127.0.0.1", 0), Handler)
Thread(target=server.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{server.server_port}/"
results = {}
try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.clock.install()
        page.goto(url)
        page.get_by_text("Members").wait_for()
        assert page.locator(".metric").nth(1).locator("strong").inner_text() == "1"
        page.get_by_role("button", name="Refresh now").click()
        assert page.locator(".metric").nth(1).locator("strong").inner_text() == "2"
        state["fail"] = True
        page.get_by_role("button", name="Refresh now").click()
        page.get_by_text("Refresh failed:", exact=False).wait_for()
        assert page.locator(".metric").nth(1).locator("strong").inner_text() == "2"
        assert "refresh failed" in page.locator("#environment").inner_text()
        state["fail"] = False
        page.clock.fast_forward(15 * 60 * 1000 + 60 * 1000)
        page.wait_for_function("document.querySelector('.metric:nth-child(2) strong')?.textContent === '4'")
        assert "healthy" in page.locator("#environment").inner_text()
        page.get_by_role("button", name="Services & security").click()
        page.get_by_text("Daily scheduled check").wait_for()
        assert "last fully healthy" in page.locator("#content").inner_text().lower()
        page.screenshot(path=str(output / "owner-daily-refresh-local.png"), full_page=True)
        results = {"kind": "local fixture, not hosted integration", "reads": state["reads"],
                   "manualRefresh": "passed", "failureRetainsLastSuccess": "passed",
                   "automaticRefresh": "passed", "dailyCheckpointDisplay": "passed"}
        browser.close()
finally:
    server.shutdown()

with (output / "owner-daily-refresh-local.json").open("w", encoding="utf-8", newline="\n") as receipt:
    receipt.write(json.dumps(results, indent=2) + "\n")
print(json.dumps(results))
