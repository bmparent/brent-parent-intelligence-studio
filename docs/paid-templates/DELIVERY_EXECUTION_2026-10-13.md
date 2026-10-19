# Template delivery execution — October 13, 2026

The authorized scope is to finish the existing purchase-to-delivery flow in
Stripe TEST mode, then release only editions with accepted evidence. New template
creation stays queued until the selected guest mail/fulfillment gates pass.
Release authorization is already present. No real-money test charge or new paid
service is authorized.

## Implementation plan

1. Refresh refs, provider metadata and exact deployment identities; preserve dirty
   worktrees, current main, purchases and immutable archives.
2. Bind a domain-restricted Sending-only Preview mail key without changing
   Production, and verify the sender.
3. Finalize buyer notices in new immutable versions; update catalog, private
   fulfillment references and manifests together; verify install/edit/reopen.
4. Deploy and identify the reviewed paired TEST candidate with isolated database,
   retained private archives and unrelated features disabled.
5. Observe a genuine paid Checkout webhook and endpoint HTTP acknowledgement,
   exact private ZIP, inbox receipt/recovery, token/access negatives and TEST refund.
6. Run final source/package/shared-code checks, stage additive LIVE configuration,
   and release verified editions only. Preserve fulfillment-capable rollback.
7. Reconcile acceptance and EW-042. Remove EW-044/workflow dependency only when
   the selected mail/fulfillment checks pass, then resume the premium queue.

## Initial observations

- Site continuation PR105 head: `1d1aeeefcfe4fbbdfbbc775a42a3f8fa7efdbc02`.
- Backend continuation PR72 head: `7e43d3bcfca37e57503ead46de4fa11f7497ad71`.
- Both continuations still target `codex/paid-templates-20261010`.
- Original candidate worktrees contain unrelated uncommitted work. Clean delivery
  worktrees start from the continuation heads; original worktrees are untouched.
- Fresh Vercel metadata: `RESEND_API_KEY` remains sensitive and Production-only;
  neither branch nor generic Preview has a mail key. Values were not requested.
- Owner business inbox identity was verified through the Gmail connector. Personal
  addresses, private grants and message contents are excluded from public receipts.
- The Stripe connector exposes only the intended Eidos Works LIVE account. Payment
  testing must use the existing separately confirmed TEST configuration.
- The two requested Eidos Works skills were not present in the local skill catalog
  or local SKILL.md search. Repository acceptance/release/operations records are
  the working runbooks; no missing skill is treated as permission to skip a gate.
- Browser connector inventory timed out twice (30s and 60s). Desktop browser input
  returned `GetCursorPos failed: Access is denied. (0x80070005)`; an accessibility
  read returned no usable tree. Cloud browser profiles have no saved Resend login.
  Secure Resend sign-in or a direct domain-scoped Preview key binding is pending.

## Evidence discipline

The evidence ledger records requirement, observation, environment, exact source
and deployment, UTC time, evidence reference and status. Hosted/provider results
remain separate from controlled tests. Historical transactions do not establish
final-source acceptance. No order is manually marked paid and no signed event is
manufactured. Production remains closed while required acceptance is unresolved.
