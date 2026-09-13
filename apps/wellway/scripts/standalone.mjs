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
  loader: { ".woff2": "dataurl", ".png": "dataurl" },
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
const template = await readFile("index.html", "utf8");
const html = template
  .replace('<script type="module" src="/src/main.tsx"></script>', () => `<script>${js.replaceAll("</script", "<\\/script")}</script>`)
  .replace("</head>", () => `<style>${css.replaceAll("</style", "<\\/style")}</style></head>`);
await writeFile(path.join(root, "dist", "wellway-demo.html"), html);
console.log(
  `Standalone app: dist/wellway-demo.html (${Math.round(Buffer.byteLength(html) / 1024)} KB, with embedded fonts and original logo)`,
);
