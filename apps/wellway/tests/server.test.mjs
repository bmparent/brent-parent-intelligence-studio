import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: root,
  env: { ...process.env, OPENAI_API_KEY: "", WELLWAY_PORT: "4339" },
  stdio: ["ignore", "pipe", "pipe"],
});
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Local server did not start")),
      8000,
    );
    child.stdout.on("data", (d) => {
      if (d.toString().includes("Wellway local app:")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once("error", reject);
    child.once("exit", (code) => reject(new Error("Server exited: " + code)));
  });
  const base = "http://127.0.0.1:4339";
  const status = await fetch(base + "/api/status");
  assert.equal(status.status, 200);
  assert.equal((await status.json()).aiConfigured, false);
  const home = await fetch(base + "/");
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Wellway/);
  assert.match(
    home.headers.get("content-security-policy"),
    /connect-src 'self'/,
  );
  const blocked = await fetch(base + "/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://unrelated.example",
    },
    body: "{}",
  });
  assert.equal(blocked.status, 403);
  const noKey = await fetch(base + "/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: "{}",
  });
  assert.equal(noKey.status, 503);
  const traversal = await fetch(base + "/%2e%2e%2fpackage.json");
  assert.equal(traversal.status, 403);
  console.log(
    "Local server checks passed: standalone response, no-key status, cross-origin rejection, no-key rejection, path confinement. No live model call made.",
  );
} finally {
  child.kill("SIGTERM");
}
