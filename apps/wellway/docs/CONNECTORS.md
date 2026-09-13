# Adding a health-data source

The working import boundary is `ingest(existing, incoming, sourceName)` in `src/lib/data.ts`. It accepts untrusted incoming records, returns validated new observations and an import report, and leaves committing the result to an explicit user action. The CSV flow and sample service flows use this same boundary.

## The adapter's responsibility

A provider-specific adapter obtains authorized records and maps them into:

```ts
type Observation = {
  id: string; // Stable provider record ID
  sourceId: string; // Stable adapter/account namespace
  date: string; // Member-local calendar date: YYYY-MM-DD
  metric: "sleep" | "steps" | "energy";
  value: number;
  unit: string; // h, steps, or score, matching metric
  recordedAt: string; // ISO timestamp
  importedAt: string; // ISO timestamp
  note?: string;
};
```

The adapter must define time-zone treatment, distinguish asleep duration from time in bed, and distinguish a daily step total from an interval count. Those meanings cannot safely be inferred from a column name. Energy is an explicitly self-reported 1–5 score, not a wearable-derived clinical metric.

For a file-based demonstration, export the six required CSV columns: `id,date,metric,value,unit,sourceId`. The app supplies timestamps when absent. Use **Connections → Example CSV** for a template. Download a file from Google Drive, choose it in the app, review the report, and confirm the import. There is no Drive API token or background synchronization.

## Shared processing

1. Normalize provider semantics before submission.
2. Validate supported units, real dates, finite values, and demo bounds.
3. Deduplicate by `sourceId + id`; existing observations are not overwritten.
4. Present accepted counts, duplicates, rejected rows, and reasons.
5. Commit only on confirmation; update local history and visualizations.

Different sources can coexist. The chart selects one preferred observation per day and reveals other available sources; it does not sum overlapping wearable totals. The preference rule and missing-data denominator are documented in the README. New metric types require explicit types, validation, units, display conventions, and meaningful verification.

## Where real integrations belong

The existing sample cards demonstrate a user selecting measurements and reviewing actual pipeline results. They do not call provider APIs. Apple Health requires an iOS HealthKit integration; Health Connect requires an Android integration. Other services need their own supported API/export mechanism and consent. There is no universal web-only connection to every health service.

Keep provider credentials and OpenAI keys out of the browser. A future authenticated connector service would handle consent, token refresh, revocation, incremental cursors, corrections/deletions, and audit history before passing normalized observations into this boundary. That service is deliberately not deployed in this local edition.

## AI and review boundary

`evidenceSnapshot()` supplies computed values, coverage, source IDs, the member's stated context, and the existing plan. The optional local server exposes only `get_wellness_evidence` to the model and requires it before an answer. Its tool output is read-only. Local advisor drafts are editable, and **Approve in demo** is the explicit action that changes the member plan; no message is sent to a real advisor.

The adapter still needs live account testing and representative evaluation before release. Evaluate numerical accuracy, source attribution, missing data, unsupported medical claims, adversarial notes, and the boundary between explaining a plan and changing one. The offline guide and fictional examples do not establish live model performance.

Primary references: [HealthKit setup](https://developer.apple.com/documentation/healthkit/setting-up-healthkit), [Health Connect reading](https://developer.android.com/health-and-fitness/health-connect/read-data), [OpenAI agents](https://developers.openai.com/api/docs/guides/agents).
