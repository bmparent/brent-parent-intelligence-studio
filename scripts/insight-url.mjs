// Pages serves prerendered directory indexes with a trailing slash. Keep
// canonical metadata checks separate and reject every other redirect target.
export function isExpectedArticleLocation(actual, expected) {
  return actual === expected || actual === `${expected.replace(/\/$/, '')}/`;
}
