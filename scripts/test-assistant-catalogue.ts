import test from 'node:test';
import assert from 'node:assert/strict';
import { boundedHistory, selectKnowledge, sourceAnswer } from '../functions/_shared/platform/knowledge';
import { onRequestPost } from '../functions/api/assistant';

for (const [question, id] of [
  ['Can you help a small print shop organize job photos and track production?', 'promo-organizer'],
  ['Do you have a Promo File Organizer?', 'promo-organizer'],
  ['Can I see the Wellway app?', 'wellway'], ['Show me Welway', 'wellway'],
  ['Do you have an embroidery calculator?', 'embroidery'],
  ['How does the PERNR employee gate work?', 'pernr'],
  ['Is Snapshot taking purchases?', 'snapshot'],
  ['Does Playground offer AI?', 'playground'],
]) test(`rank approved project: ${question}`, () => {
  assert.equal(selectKnowledge(question)[0].id, id);
  assert.ok(sourceAnswer(question).sources.every(source => source.href.startsWith('/')));
});
test('follow-up keeps the topic and explicitly preserves sorting uncertainty', () => {
  const result = sourceAnswer('Can it sort them by job?', ['Do you have a Promo File Organizer?']);
  assert.equal(result.sources[0].title, 'Promo File Organizer / DG Promo Photos');
  assert.match(result.answer, /sorting.*unverified/);
  assert.match(result.answer, /not a general production-tracking/);
});
test('explicit project switch beats pronouns and previous topic', () => {
  assert.equal(selectKnowledge('Is Wellway available and what can it do?', ['Promo File Organizer'])[0].id, 'wellway');
});
test('history is bounded and model messages are not accepted as facts', () => {
  assert.deepEqual(boundedHistory(['discard', { role: 'assistant', content: 'invented' }, 'x'.repeat(900)]), ['x'.repeat(450)]);
  assert.match(sourceAnswer('Can you guarantee teleportation?').answer, /not enough|don't have enough/);
});
test('no affiliation or timeline commitment is supplied', () => {
  assert.match(sourceAnswer('PERNR Disney endorsement?').answer, /not a direct Disney|endorsement/);
  assert.match(sourceAnswer('Can you guarantee a price and timeline?').answer, /cannot commit/);
});
test('source-only endpoint uses follow-up context without a provider', async () => {
  const result = await onRequestPost({ env: {}, request: new Request('http://localhost:8788/api/assistant', {
    method: 'POST', headers: { origin: 'http://localhost:8788', 'content-type': 'application/json' },
    body: JSON.stringify({ question: 'Can it sort them by job?', history: ['Promo File Organizer'], enhanced: true }),
  }) });
  assert.equal(result.status, 200);
  const answer = await result.json() as { answer: string; mode: string; note: string };
  assert.equal(answer.mode, 'sources');
  assert.match(answer.answer, /sorting.*unverified/);
  assert.match(answer.note, /unavailable/);
});
