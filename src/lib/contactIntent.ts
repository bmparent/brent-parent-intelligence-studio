export const quoteDeskFeedbackService = 'Quote Desk workspace feedback';

export function isQuoteDeskFeedback(search: string) {
  const query = new URLSearchParams(search);
  return query.get('utm_source') === 'quote-desk' &&
    query.get('utm_medium') === 'owned-tool' &&
    query.get('utm_campaign') === 'quote-desk-validation';
}
