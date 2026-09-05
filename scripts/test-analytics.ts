import test from 'node:test';
import assert from 'node:assert/strict';
import {
  startAnalytics,
  track,
  safePagePath,
  stopAnalytics,
} from '../src/lib/analytics';
await test('Analytics requires consent and never includes private URLs or arbitrary event fields', () => {
  const root = globalThis as unknown as Record<string, unknown>;
  const old = {
    window: root.window,
    document: root.document,
    localStorage: root.localStorage,
  };
  let choice: string | null = null;
  const appended: Record<string, unknown>[] = [];
  const commands: unknown[][] = [];
  const window = {
    location: {
      origin: 'https://eidos-works.com',
      hostname: 'eidos-works.com',
      pathname: '/shop/success',
      search: '?email=private@example.com',
      hash: '#receipt=private',
    },
    dataLayer: { push: (args: unknown[]) => commands.push(Array.from(args)) },
    gtag: undefined,
    __eidosAnalyticsId: undefined,
  };
  root.window = window;
  root.localStorage = { getItem: () => choice };
  root.document = {
    cookie: '',
    createElement: () => ({}),
    head: {
      appendChild: (element: Record<string, unknown>) => appended.push(element),
    },
  };
  try {
    startAnalytics('G-TEST123');
    track('generate_lead');
    assert.equal(appended.length, 0);
    assert.equal(commands.length, 0);
    choice = 'denied';
    startAnalytics('G-TEST123');
    assert.equal(appended.length, 0);
    choice = 'granted';
    startAnalytics('G-TEST123');
    assert.equal(appended.length, 1);
    assert.equal(safePagePath(), '/private');
    track('purchase', {
      transaction_id: '12345678-1234-1234-1234-123456789abc',
      value: 29,
      currency: 'USD',
      item_id: 'cinematic-starter',
      ...{ question: 'secret', email: 'private@example.com' },
    });
    const sent = JSON.stringify(commands);
    assert.ok(!sent.includes('private@example.com'));
    assert.ok(!sent.includes('receipt=private'));
    assert.ok(!sent.includes('secret'));
    assert.ok(
      !commands.some(
        (command) => command[0] === 'event' && command[1] === 'page_view',
      ),
    );
    const count = commands.length;
    choice = 'denied';
    stopAnalytics();
    track('generate_lead');
    assert.equal(commands.length, count + 1);
    assert.equal(
      (window as unknown as Record<string, unknown>)['ga-disable-G-TEST123'],
      true,
    );
  } finally {
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete root[key];
      else root[key] = value;
    }
  }
});
