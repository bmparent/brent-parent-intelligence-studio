import { validateProposal, type AiScope, type Proposal } from './aiOperations';

type Fetch = typeof fetch;
const states = ['quoted', 'reserved', 'submitted', 'settled', 'technical_waiver', 'reconciliation_pending', 'cancelled'] as const;
export type AiActionState = typeof states[number];
export type AiBalance = {
  currency: 'USD'; unitsPerUsd: 1000000; mode: 'test' | 'live'; period: string; resetsAt: string;
  requestedLimit: number; effectiveLimit: number; settled: number; pending: number;
  settledIncluded: number; settledPurchased: number; remainingCap: number;
  availableIncluded: number; availablePurchased: number; frozen: boolean; loweringPending: boolean;
};
export type AiAction = {
  id: string; state: AiActionState; documentId: string; revision: string; scope: AiScope; targetId: string;
  estimate: number; maximum: number; currency: 'USD'; unitsPerUsd: 1000000; model: string;
  rateCardVersion: string; expiresAt: string; resetsAt: string; chargedIncluded: number;
  chargedPurchased: number; customerStatus: 'none' | 'held' | 'settled' | 'waived'; result: Proposal | null;
};
export type AiBrief = { documentId: string; revision: string; scope: AiScope; targetId: string; instruction: string; context: string };
export type AiResponse = { enabled?: boolean; reason?: string; balance?: AiBalance; action?: AiAction };
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const money = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= 1000000000000;
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const id = (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const invalid = () => Error('Eidos returned an invalid spending receipt. Generation stays unavailable.');

export function validateAiBalance(value: unknown): AiBalance {
  if (!object(value) || value.currency !== 'USD' || value.unitsPerUsd !== 1000000 || !['test', 'live'].includes(String(value.mode)) ||
      typeof value.period !== 'string' || !/^\d{4}-\d{2}$/.test(value.period) || !date(value.resetsAt) ||
      typeof value.frozen !== 'boolean' || typeof value.loweringPending !== 'boolean' ||
      ['requestedLimit', 'effectiveLimit', 'settled', 'pending', 'settledIncluded', 'settledPurchased', 'remainingCap', 'availableIncluded', 'availablePurchased'].some(key => !money(value[key])) ||
      value.settled !== Number(value.settledIncluded) + Number(value.settledPurchased) ||
      value.effectiveLimit !== Math.max(Number(value.requestedLimit), Number(value.settled) + Number(value.pending)) ||
      value.remainingCap !== Math.max(0, Number(value.requestedLimit) - Number(value.settled) - Number(value.pending)) ||
      value.loweringPending !== (Number(value.requestedLimit) < Number(value.settled) + Number(value.pending))) throw invalid();
  return value as AiBalance;
}
export function validateAiAction(value: unknown): AiAction {
  if (!object(value) || !id(value.id) || !id(value.documentId) || !id(value.revision) || !id(value.targetId) ||
      !states.includes(value.state as AiActionState) || !['element', 'section', 'page', 'brand'].includes(String(value.scope)) ||
      value.currency !== 'USD' || value.unitsPerUsd !== 1000000 ||
      ['estimate', 'maximum', 'chargedIncluded', 'chargedPurchased'].some(key => !money(value[key])) ||
      Number(value.maximum) <= 0 || Number(value.estimate) > Number(value.maximum) || Number(value.chargedIncluded) + Number(value.chargedPurchased) > Number(value.maximum) ||
      !['none', 'held', 'settled', 'waived'].includes(String(value.customerStatus)) ||
      typeof value.model !== 'string' || !value.model || value.model.length > 100 || typeof value.rateCardVersion !== 'string' || !value.rateCardVersion ||
      !date(value.expiresAt) || !date(value.resetsAt)) throw invalid();
  const result = value.result === null ? null : validateProposal(value.result);
  const expectedStatus = value.state === 'quoted' ? 'none' : value.state === 'settled' ? 'settled' : ['cancelled', 'technical_waiver'].includes(String(value.state)) ? 'waived' : 'held';
  if (value.customerStatus !== expectedStatus || (result && value.state !== 'settled') || (value.customerStatus !== 'settled' && Number(value.chargedIncluded) + Number(value.chargedPurchased) !== 0)) throw invalid();
  return { ...value, result } as AiAction;
}
export function sameAiAction(before: AiAction, after: AiAction) {
  return ['id', 'documentId', 'revision', 'scope', 'targetId', 'maximum', 'estimate', 'model', 'rateCardVersion', 'expiresAt', 'resetsAt'].every(key => before[key as keyof AiAction] === after[key as keyof AiAction]);
}
export function validateAiResponse(value: unknown): AiResponse {
  if (!object(value) || (value.enabled !== undefined && typeof value.enabled !== 'boolean') || (value.reason !== undefined && typeof value.reason !== 'string')) throw invalid();
  if (value.enabled === true && value.balance === undefined) throw invalid();
  return { ...(value.enabled === undefined ? {} : { enabled: value.enabled }), ...(typeof value.reason === 'string' ? { reason: value.reason } : {}),
    ...(value.balance === undefined ? {} : { balance: validateAiBalance(value.balance) }), ...(value.action === undefined ? {} : { action: validateAiAction(value.action) }) };
}
export function usd(micros: number) {
  // Receipts are metered in microdollars. Never round a real charge down to
  // $0.00 or show an approved maximum below its exact server commitment.
  if (!money(micros)) throw invalid();
  const whole = Math.floor(micros / 1000000);
  const fraction = String(micros % 1000000).padStart(6, '0').replace(/0+$/, '').padEnd(2, '0');
  return '$' + whole + '.' + fraction;
}
export function limitMicros(dollars: string) {
  if (!/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/.test(dollars.trim())) throw Error('Enter a USD limit with at most two decimal places.');
  const [whole, cents = ''] = dollars.trim().split('.');
  const value = Number(whole) * 1000000 + Number(cents.padEnd(2, '0')) * 10000;
  if (!money(value)) throw Error('That monthly limit exceeds the supported amount.');
  return value;
}
export class AiRequestError extends Error {
  constructor(message: string, readonly status = 0) { super(message); this.name = 'AiRequestError'; }
}
export async function aiRequest(input?: unknown, actionId?: string, signal?: AbortSignal, request: Fetch = fetch): Promise<AiResponse> {
  const response = await request('/api/playground/ai' + (actionId ? '?id=' + encodeURIComponent(actionId) : ''), {
    credentials: 'same-origin', cache: 'no-store', ...(input === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(25000)]) : AbortSignal.timeout(25000),
  });
  let value: unknown;
  try { value = await response.json(); } catch { throw new AiRequestError('Eidos could not read this request status. Check the existing action before starting another.', response.status); }
  if (!response.ok) throw new AiRequestError(object(value) && typeof value.error === 'string' ? value.error : 'Eidos is unavailable. Manual editing remains available.', response.status);
  return validateAiResponse(value);
}
