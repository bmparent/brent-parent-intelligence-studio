import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.cwd());
const templatePath = resolve(root, 'dist/index.html');
const serverEntry = resolve(root, 'dist-ssr/entry-server.js');

const template = await readFile(templatePath, 'utf8');
const { render } = await import(pathToFileURL(serverEntry).href);
const appHtml = render();

const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
await writeFile(templatePath, html);
