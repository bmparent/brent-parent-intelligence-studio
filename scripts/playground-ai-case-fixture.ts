import { readFileSync } from 'node:fs';
import { createStarter, type StarterBrief } from '../src/playground/starters';
import { flattenNodes, type BlockNode } from '../src/playground/authoringSchema';
import { applyProposal, createProposalContext, type AiScope, type Operation, type Proposal } from '../src/playground/aiOperations';
import { validateProject, type Project } from '../src/playground/model';
import type { BrandKit } from '../src/playground/media';

export const aiCaseCategories = ['initial_design', 'brand_application', 'copy_refinement', 'section_redesign', 'responsive_repair', 'manual_work_preservation'] as const;
export type AiCaseTarget = { scope: AiScope; sectionId: string; node: { type: BlockNode['type']; name: string } | null };
export type AiComparisonCase = {
  id: string;
  category: typeof aiCaseCategories[number];
  brief: StarterBrief;
  target: AiCaseTarget;
  prompt: string;
  manualEdits: { target: AiCaseTarget; proposal: Proposal }[];
  allowedFields: Operation['field'][];
  referenceProposal: Proposal;
  successCriteria: { instructionFidelity: string[]; renderedMobile: string[]; preservation: string[] };
  humanVisualReview: 'required_for_visual_claims';
  brandLocks?: BrandKit['locks'];
};
export type AiCaseCorpus = {
  schemaVersion: 1;
  corpusId: string;
  purpose: string;
  dataPolicy: string;
  aggregateTestBudgetUsd: 5;
  maxOperationsPerProposal: 6;
  contextLimitBytes: 48000;
  viewports: { name: string; width: number; height: number }[];
  resultState: 'not_run';
  cases: AiComparisonCase[];
};

export function loadAiCases(): AiCaseCorpus {
  const corpus = JSON.parse(readFileSync(new URL('./fixtures/playground-ai-cases.json', import.meta.url), 'utf8')) as AiCaseCorpus;
  if (corpus.schemaVersion !== 1 || corpus.resultState !== 'not_run' || !Array.isArray(corpus.cases) || corpus.cases.length !== 20)
    throw Error('Unsupported or incomplete public comparison corpus.');
  return corpus;
}

/** Resolve semantic selectors against the actual starter; never guess a node ID. */
export function aiCaseTarget(project: Project, target: AiCaseTarget) {
  const section = project.sections.find(value => value.id === target.sectionId);
  if (!section || !section.visible) throw Error('Comparison target section is missing or hidden.');
  if (target.scope !== 'element') {
    if (target.node !== null) throw Error('A non-element comparison cannot carry a node target.');
    return { section, node: null, sectionId: section.id, nodeId: '' };
  }
  const nodes = section.authoring && target.node
    ? flattenNodes(section.authoring.root).filter(node => node.type === target.node!.type && node.name === target.node!.name) : [];
  if (nodes.length !== 1) throw Error('Comparison element selector must resolve exactly once.');
  return { section, node: nodes[0], sectionId: section.id, nodeId: nodes[0].id };
}

/** Optional artwork must come from loadStarterArtwork for this public starter. */
export function createAiCaseFixture(testCase: AiComparisonCase, publicStarterArtwork = '') {
  if (testCase.brief.logo || testCase.brief.photo) throw Error('Comparison fixtures cannot contain user uploads.');
  let project = createStarter(testCase.brief, publicStarterArtwork);
  // createStarter normally issues fresh working-draft IDs. Comparison inputs
  // instead use reproducible IDs so every model receives the identical source.
  for (const section of project.sections) {
    if (section.authoring) flattenNodes(section.authoring.root).forEach((node, index) => { node.id = `node-fixture-${section.id}-${index}`; });
  }
  for (const edit of testCase.manualEdits) {
    const selected = aiCaseTarget(project, edit.target);
    project = applyProposal(project, selected.sectionId, edit.target.scope, edit.proposal, selected.nodeId);
  }
  if (testCase.brandLocks) project.brand = { ...project.brand!, locks: [...testCase.brandLocks] };
  project = validateProject(project);
  const selected = aiCaseTarget(project, testCase.target);
  const context = createProposalContext(project, selected.sectionId, selected.nodeId, testCase.target.scope);
  return { project, context, ...selected };
}
