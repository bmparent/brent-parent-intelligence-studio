import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
await mkdir("dist", { recursive: true });
const result = await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  write: false,
  loader: { ".woff2": "dataurl" },
  plugins: [
    {
      name: "raw-svg",
      setup(b) {
        b.onResolve({ filter: /\.svg\?raw$/ }, (args) => ({
          path: path.resolve(args.resolveDir, args.path.replace("?raw", "")),
          namespace: "svg-inline",
        }));
        b.onLoad({ filter: /.*/, namespace: "svg-inline" }, async (args) => ({
          contents: await readFile(args.path, "utf8"),
          loader: "text",
        }));
      },
    },
  ],
  define: { "process.env.NODE_ENV": '"production"' },
  outdir: "dist/standalone",
});
const js = result.outputFiles.find((f) => f.path.endsWith(".js"))?.text;
const css = result.outputFiles.find((f) => f.path.endsWith(".css"))?.text;
if (!js || !css) throw new Error("Standalone JS/CSS was not produced");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111f3e"><meta name="description" content="A local-first Wellway concept by Eidos Works. Fictional data, interactive charts, check-ins, plans, and advisor review."><title>Wellway · Your wellness journey</title><style>${css.replaceAll("</style", "<\\/style")}</style></head><body><div id="root"></div><script>${js.replaceAll("</script", "<\\/script")}</script></body></html>`;
await writeFile(path.join(root, "dist", "wellway-demo.html"), html);
console.log(
  `Standalone app: dist/wellway-demo.html (${Math.round(Buffer.byteLength(html) / 1024)} KB, with embedded fonts and original logo)`,
);
