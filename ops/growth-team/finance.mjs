// Pure policy gate. No provider calls, tokens, client records, or payment credentials.
const cents = (value) => Number.isSafeInteger(value) && value >= 0;
const monthOf = (date) => new Date(date).toISOString().slice(0, 7);

/** A denial is safer than treating missing cost, identity, or ledger as zero. */
export function assessCommitment({ request, managerDecision, financeDecision, policy, ledger, now = new Date() }) {
  if (!request?.id || !cents(request.maximumCashCents) || !managerDecision || managerDecision.requestId !== request.id || managerDecision.decision !== 'proceed') {
    return { permitted: false, reason: 'incomplete_request_or_manager_decision' };
  }
  if (request.maximumCashCents === 0) return { permitted: true, reason: 'zero_cash' };
  if (policy?.currency !== 'USD' || !cents(policy.ownerApprovedMonthlyCashCapCents) || !cents(policy.ownerApprovedPerCommitmentCashCapCents) || !policy.ownerApprovalReference) {
    return { permitted: false, reason: 'no_owner_approved_cash_ceiling' };
  }
  if (!financeDecision || financeDecision.role !== 'finance' || financeDecision.requestId !== request.id || financeDecision.decision !== 'approve' || !cents(financeDecision.maximumCashCents) || !financeDecision.id || financeDecision.month !== monthOf(now)) {
    return { permitted: false, reason: 'no_current_finance_approval' };
  }
  if (!ledger || ledger.month !== monthOf(now) || !cents(ledger.spentAndReservedCashCents) || !Array.isArray(ledger.requestIds)) {
    return { permitted: false, reason: 'unknown_cash_ledger' };
  }
  if (ledger.requestIds.includes(request.id)) return { permitted: false, reason: 'duplicate_commitment' };
  if (request.maximumCashCents > financeDecision.maximumCashCents || request.maximumCashCents > policy.ownerApprovedPerCommitmentCashCapCents || ledger.spentAndReservedCashCents + request.maximumCashCents > policy.ownerApprovedMonthlyCashCapCents) {
    return { permitted: false, reason: 'cash_ceiling_exceeded' };
  }
  return { permitted: true, reason: 'within_approved_cash_ceiling', reserveCashCents: request.maximumCashCents };
}
