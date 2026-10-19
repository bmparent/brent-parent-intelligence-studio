import test from 'node:test';
import assert from 'node:assert/strict';
import { applyContextProposal, applyProposal, operationFields, validateProposal } from '../src/playground/aiOperations';
import { flattenNodes, type BlockNode } from '../src/playground/authoringSchema';
import { validateProject, type Project } from '../src/playground/model';
import { aiCaseCategories, aiCaseTarget, createAiCaseFixture, loadAiCases, type AiComparisonCase } from './playground-ai-case-fixture';

const corpus = loadAiCases();
const paths = (before: unknown, after: unknown, prefix = ''): string[] => {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (before === null || after === null || typeof before !== 'object' || typeof after !== 'object') return [prefix];
  const left = before as Record<string, unknown>, right = after as Record<string, unknown>;
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].flatMap(key => paths(left[key], right[key], prefix ? `${prefix}.${key}` : key));
};
function nodePath(root: BlockNode, selected: string, path: string): string | null {
  if (root.id === selected) return path;
  for (const [index, child] of (root.children || []).entries()) {
    const result = nodePath(child, selected, `${path}.children.${index}`);
    if (result) return result;
  }
  return null;
}
function permittedReferencePaths(project: Project, testCase: AiComparisonCase): Set<string> {
  const target = aiCaseTarget(project, testCase.target), sectionIndex = project.sections.indexOf(target.section), prefix = `sections.${sectionIndex}`;
  const permitted = new Set<string>();
  for (const op of testCase.referenceProposal.ops) {
    if (op.field.startsWith('node.')) {
      assert.ok(target.node && target.section.authoring);
      permitted.add(`${nodePath(target.section.authoring.root, target.nodeId, `${prefix}.authoring.root`)}.${op.field.slice(5)}`);
    } else if (op.field.startsWith('tokens.')) permitted.add(op.field);
    else if (op.field.startsWith('brand.')) {
      permitted.add(op.field);
      if (op.field === 'brand.businessName') project.sections.forEach((section, index) => { if (section.type === 'header' || section.type === 'footer') permitted.add(`sections.${index}.title`); });
    } else {
      const key = op.field.slice(8);
      if (key === 'spacing' || key === 'align') {
        permitted.add(`${prefix}.style.${key}`);
        if (!target.section.style) for (const defaultKey of ['spacing', 'align', 'background']) permitted.add(`${prefix}.style.${defaultKey}`);
      } else permitted.add(`${prefix}.${key}`);
      const nodeType = key === 'title' ? 'heading' : key === 'description' ? 'text' : key === 'cta' || key === 'href' ? 'button' : null;
      const synchronized = target.section.authoring && flattenNodes(target.section.authoring.root).find(node => node.type === nodeType);
      if (synchronized && target.section.authoring) permitted.add(`${nodePath(target.section.authoring.root, synchronized.id, `${prefix}.authoring.root`)}.${key === 'href' ? 'href' : 'text'}`);
    }
  }
  return permitted;
}

test('comparison corpus contains 20 public cases covering all requested categories and typed scopes without fabricated results', () => {
  assert.equal(corpus.cases.length, 20);
  assert.equal(new Set(corpus.cases.map(value => value.id)).size, 20);
  assert.deepEqual([...new Set(corpus.cases.map(value => value.category))].sort(), [...aiCaseCategories].sort());
  assert.deepEqual([...new Set(corpus.cases.map(value => value.target.scope))].sort(), ['brand', 'element', 'page', 'section']);
  assert.equal(corpus.aggregateTestBudgetUsd, 5); assert.equal(corpus.maxOperationsPerProposal, 6); assert.equal(corpus.resultState, 'not_run');
  assert.deepEqual(corpus.viewports.map(value => value.width), [1440, 390]);
  for (const value of corpus.cases) {
    assert.match(value.id, /^[a-z][a-z-]+$/); assert.ok(aiCaseCategories.includes(value.category));
    assert.ok(['switchboard', 'tideglass', 'matter'].includes(value.brief.starter));
    assert.equal(value.brief.logo, undefined); assert.equal(value.brief.photo, undefined);
    assert.ok(value.prompt.length > 60 && value.prompt.length <= 1200, value.id);
    assert.equal(value.humanVisualReview, 'required_for_visual_claims');
    for (const criteria of Object.values(value.successCriteria)) assert.ok(criteria.length > 0 && criteria.every(line => line.length > 12), value.id);
    assert.ok(value.allowedFields.every(field => operationFields.includes(field)), value.id);
    assert.equal(new Set(value.allowedFields).size, value.allowedFields.length, value.id);
  }
});

test('each case resolves a real visible target with deterministic compact provider context and no raw assets', () => {
  for (const value of corpus.cases) {
    const first = createAiCaseFixture(value), second = createAiCaseFixture(value);
    assert.deepEqual(first.project, second.project, value.id); assert.deepEqual(first.context, second.context, value.id);
    assert.equal(first.section.id, value.target.sectionId); assert.equal(first.section.visible, true);
    assert.equal(value.target.scope === 'element', Boolean(first.node), value.id);
    assert.ok(Buffer.byteLength(JSON.stringify(first.context), 'utf8') <= corpus.contextLimitBytes, value.id);
    for (const section of first.context.project.sections) {
      assert.equal(section.image, ''); assert.equal(section.media, undefined);
      for (const node of section.authoring ? flattenNodes(section.authoring.root) : []) { assert.equal(node.image, ''); assert.equal(node.media, undefined); }
    }
  }
});

test('every reference proposal is feasible within six typed operations and leaves all prohibited source paths unchanged', () => {
  for (const value of corpus.cases) {
    const fixture = createAiCaseFixture(value), before = structuredClone(fixture.project), proposal = validateProposal(value.referenceProposal);
    assert.ok(proposal.ops.length >= 1 && proposal.ops.length <= 6, value.id);
    assert.ok(proposal.ops.every(op => value.allowedFields.includes(op.field)), value.id);
    const projected = applyContextProposal(fixture.context, proposal);
    assert.deepEqual(validateProject(projected), projected, value.id);
    const after = applyProposal(fixture.project, fixture.sectionId, value.target.scope, proposal, fixture.nodeId);
    assert.deepEqual(fixture.project, before, value.id);
    const permitted = permittedReferencePaths(before, value), changes = paths(before, after);
    // Missing style/mobile objects are normalized by expanding their changed
    // leaves before comparing the explicit scope/field allowance.
    const leafChanges = changes.flatMap(path => {
      if (path.endsWith('.style') || path.endsWith('.mobile')) {
        const read = (project: Project) => path.split('.').reduce((part: unknown, key) => (part as Record<string, unknown> | undefined)?.[key], project);
        return paths(read(before) || {}, read(after) || {}, path);
      }
      return [path];
    });
    assert.ok(leafChanges.length > 0, value.id);
    assert.deepEqual(leafChanges.filter(path => !permitted.has(path)), [], `${value.id}: unwanted mutation`);
    assert.deepEqual(after.sections.map(section => section.id), before.sections.map(section => section.id), value.id);
    assert.deepEqual(after.glass, before.glass, value.id);
  }
});

test('preservation cases actually contain manual edits and locked brand values reject out-of-scope changes', () => {
  for (const value of corpus.cases.filter(value => value.category === 'manual_work_preservation')) {
    assert.ok(value.manualEdits.length >= 2, value.id);
    const edited = createAiCaseFixture(value), pristine = createAiCaseFixture({ ...value, manualEdits: [], brandLocks: undefined });
    assert.notDeepEqual(edited.project, pristine.project, value.id);
  }
  const locked = createAiCaseFixture(corpus.cases.find(value => value.id === 'preserve-locked-brand')!);
  for (const [field, value] of [['tokens.accent', '#ff0000'], ['tokens.font', 'modern'], ['brand.businessName', 'Changed'], ['brand.tone', 'Changed']]) {
    assert.throws(() => applyProposal(locked.project, locked.sectionId, 'brand', { ops: [{ field, value }] }), /locked/);
  }
});

test('ambiguous or missing selectors and customer uploads cannot enter a comparison fixture', () => {
  const value = corpus.cases[0], fixture = createAiCaseFixture(value);
  assert.throws(() => aiCaseTarget(fixture.project, { scope: 'section', sectionId: 'missing', node: null }), /missing/);
  assert.throws(() => aiCaseTarget(fixture.project, { scope: 'element', sectionId: 'hero', node: { type: 'heading', name: 'Missing' } }), /exactly once/);
  const ambiguous = structuredClone(fixture.project), root = ambiguous.sections.find(section => section.id === 'hero')!.authoring!.root;
  const heading = flattenNodes(root).find(node => node.type === 'heading')!;
  root.children!.push({ ...heading, id: 'node-fixture-duplicate' });
  assert.throws(() => aiCaseTarget(ambiguous, { scope: 'element', sectionId: 'hero', node: { type: 'heading', name: 'Headline' } }), /exactly once/);
  assert.throws(() => createAiCaseFixture({ ...value, brief: { ...value.brief, photo: 'private-customer-photo' } }), /user uploads/);
});
