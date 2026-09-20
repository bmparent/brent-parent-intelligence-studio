export { growthEndpoint as onRequestPost } from '../../_shared/growth';
export const onRequestGet = () => Response.json({ service: 'eidos-growth', version: 1, consentRequired: true }, { headers: { 'cache-control': 'no-store' } });
