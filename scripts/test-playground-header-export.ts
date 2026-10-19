import test from 'node:test';
import assert from 'node:assert/strict';
import { createProject, validateProject } from '../src/playground/model';
import { enableBlocks } from '../src/playground/authoring';
import { headerFiles } from '../src/playground/export';
const textFiles = (input: ReturnType<typeof createProject>) => Object.fromEntries(headerFiles(input).map(file => [file.name, new TextDecoder().decode(file.data)]));

test('header installation example retains every default fragment target and saved page source', () => {
  const project = createProject(), files = textFiles(project), html = files['index.html'];
  for (const id of ['page-main', 'header', 'hero', 'work', 'services', 'contact', 'footer']) assert.ok(html.includes(`id="${id}"`), id);
  assert.ok(html.includes(project.sections[1].title));
  assert.deepEqual(JSON.parse(files['project.json']), project);
  assert.match(files['README.md'], /actual section\/card\/block identities/);
  assert.match(files['eidos-header.js'], /target\.setAttribute\('tabindex','-1'\)/);
});

test('arbitrary navigation IDs and responsive block destinations are preserved without fixed-target assumptions', () => {
  let project = enableBlocks(createProject());
  project.sections = project.sections.map(section => section.id === 'work' ? { ...section, id: 'selected-projects' } : section.id === 'contact' ? { ...section, id: 'get-in-touch' } : section);
  const nodeId = project.sections[1].authoring!.root.children![0].id;
  project.sections[0].navigation = [{ label: 'Our projects', href: '#selected-projects' }, { label: 'The headline', href: '#' + nodeId }];
  project.sections[0].href = '#get-in-touch';
  project = validateProject(project); const files = textFiles(project), html = files['index.html'];
  for (const id of ['selected-projects', 'get-in-touch', nodeId]) assert.ok(html.includes(`id="${id}"`));
  assert.doesNotMatch(html, /Unconfigured destination:/);
  assert.match(files['header.html'], /href="#selected-projects"/);
  assert.match(files['header.html'], /href="#get-in-touch"/);
});

test('missing/hidden custom targets receive honest installation-only placeholders while defaults omit hidden navigation', () => {
  const project = createProject(); project.sections[3].visible = false;
  let files = textFiles(project);
  assert.doesNotMatch(files['header.html'], /href="#work"/);
  const flexible = { ...project, schemaVersion: 2 as const, sections: project.sections.map(section => ({ ...section, type: section.id as typeof section.type })) };
  flexible.sections[0].navigation = [{ label: 'Hidden work', href: '#work' }, { label: 'Future page', href: '#future-destination' }];
  files = textFiles(flexible);
  assert.match(files['index.html'], /id="work" tabindex="-1"><h2>Unconfigured destination: work/);
  assert.match(files['index.html'], /id="future-destination" tabindex="-1"/);
  assert.match(files['README.md'], /Unconfigured fragment destinations: work, future-destination/);
  assert.match(files['README.md'], /not real source sections or a completed page/);
});

test('header example safely preserves literal replacement syntax and escaped user content', () => {
  const project = createProject(); project.sections[0].title = '$& <script>alert(1)</script>';
  project.sections[1].title = 'Literal $& and <words>';
  const files = textFiles(project), html = files['index.html'];
  assert.match(html, /\$&amp; &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Literal \$&amp; and &lt;words&gt;/);
  assert.equal((html.match(/<eidos-glass-header /g) || []).length, 1);
  assert.doesNotMatch(html, /<script>alert\(1\)/);
});
