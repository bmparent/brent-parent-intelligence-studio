# Eidos Works Command Center

## Purpose

The Eidos Works Command Center is a private Google Drive operations layer for lead intake, Snapshot orders, active projects, content, agentic SEO work, finance tracking, and weekly reviews. It is intentionally separate from the public website: there is no public `/command-center` route and no client data is committed to Git.

The no-new-spend design uses tools already available on free/existing plans:

1. A website form or Snapshot event reaches a Cloudflare Function/Worker.
2. The Worker validates and stores only the minimum operational record in D1/KV when configured.
3. The Worker optionally sends a server-to-server POST to Google Apps Script.
4. Apps Script authenticates the request with a shared secret, validates an allowlisted payload, and appends one row to the intended private Sheet.
5. Google Drive remains the human-facing command center for daily operations.

If Google credentials are absent, the website still builds and works; the local scaffold remains ready for later setup.

## Drive layout and ownership

The root folder is `Eidos Works Command Center`. The setup script creates the numbered folders `00_Admin_And_Brand` through `10_Weekly_Operations`, plus `99_Archive`, as listed in `ops/google-drive-command-center/README.md`.

Documents are placed with the work they support:

| Document | Folder |
| --- | --- |
| Eidos Works Operating README | `00_Admin_And_Brand` |
| Brand Voice and Copy Rules | `00_Admin_And_Brand` |
| Project Brief Template | `03_Client_Projects` |
| Website Strategy Call Notes Template | `01_Leads_And_Intake` |
| Eidos Snapshot Report Template | `02_Eidos_Snapshot` |
| Proposal / SOW Template | `04_Proposals_And_SOWs` |
| Weekly Review Template | `10_Weekly_Operations` |
| Agentic SEO Implementation Checklist | `07_Agentic_SEO` |
| Storefront Platform UX Checklist | `08_Storefront_Platforms` |
| Dashboard / Automation Discovery Checklist | `09_Dashboards_And_Automation` |
| Client Handoff Checklist | `03_Client_Projects` |

The four workbooks are created in the most relevant folders:

| Workbook | Folder | Tabs |
| --- | --- | --- |
| Eidos Works CRM and Pipeline | `09_Dashboards_And_Automation` | Dashboard, Leads, Snapshot Orders, Active Projects, Tasks, Follow Ups, Content Calendar, Insights Inventory, SEO Tracker, Finance, Tool Inventory |
| Eidos Snapshot Orders | `02_Eidos_Snapshot` | Orders, Reports, Follow Ups, Errors, Refund Review |
| Project Tracker | `03_Client_Projects` | Projects, Milestones, Deliverables, Client Notes, Launch Checklist, Maintenance |
| Content and Agentic SEO Tracker | `07_Agentic_SEO` | Insights, Service Pages, Keywords/Questions, Internal Links, Schema Checklist, Search Console Notes, AI Referral Notes |

## Setup and idempotency

Validate the source scaffold without credentials:

```bash
node scripts/setup-google-drive-command-center.ts --check
```

Preview what would be created and detect credential/tool availability:

```bash
node scripts/setup-google-drive-command-center.ts --dry-run
```

Create or reconcile the private Drive structure:

```bash
node scripts/setup-google-drive-command-center.ts
```

The script obtains an access token from a service account or an existing gcloud login. For each item, it queries only the expected parent folder using exact name and MIME type. Existing items are reused. Missing tabs are added; existing tabs and rows are retained. A blank tab receives its expected header, while a conflicting non-empty header causes a safe failure so data is never silently rearranged.

No public permissions are created. If `GOOGLE_DRIVE_OWNER_EMAIL` is supplied, it receives a direct `writer` permission only. If a service account creates the files, keep the root inside a folder already shared with that service account and verify that Brent's account retains access.

## Environment variables

| Variable | Required | Use |
| --- | --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | One auth route | Raw JSON, base64 JSON, or a path to service-account JSON. |
| `GOOGLE_APPLICATION_CREDENTIALS` | One auth route | Path to service-account JSON. |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID` | Recommended | Existing private parent; otherwise the authenticated account's My Drive root is used. |
| `GOOGLE_DRIVE_OWNER_EMAIL` | Optional | Directly shares created/reused items with this single user as writer. |
| `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` | Integration only | Apps Script deployment URL, stored server-side. |
| `COMMAND_CENTER_SHARED_SECRET` | Integration only | Long random secret shared by Worker and Apps Script, stored server-side. |

`gcloud auth application-default print-access-token` and then `gcloud auth print-access-token` are used as local fallbacks. The setup's dry run also reports whether `gcloud` and `clasp` are available. `clasp` is optional because deployment can be completed in the Apps Script editor.

## Worker-to-Apps-Script contract

Send JSON by `POST` from a server-side Worker only:

```json
{
  "sharedSecret": "<COMMAND_CENTER_SHARED_SECRET>",
  "eventType": "snapshot_order",
  "data": {
    "email": "buyer@example.com",
    "businessName": "Example Co",
    "websiteUrl": "https://example.com",
    "primaryGoal": "Improve qualified inquiries",
    "paymentStatus": "paid",
    "reportStatus": "queued"
  }
}
```

Do not send the secret from browser code. Apps Script web-app events do not reliably expose arbitrary request headers, so the secret is in the server-to-server JSON body and removed before field mapping. HTTPS protects it in transit; Cloudflare secret storage and Apps Script Script Properties protect it at rest.

The webhook accepts only six event types, discards unknown keys, caps body and field lengths, validates email/URL fields, neutralizes spreadsheet formula prefixes, and serializes row appends with a script lock. Responses do not echo submitted data or secret values. The Worker must parse the response body and require `ok: true`; Apps Script may return a JSON error with an HTTP 200 status.

## Operating rhythm

- Daily: review new Leads, Snapshot Orders, Tasks, and Follow Ups; assign the next action and owner.
- Per project: keep status, blocker, next action, milestones, deliverables, and handoff links current.
- Weekly: complete the Weekly Review, reconcile pipeline/finance, schedule content, and archive finished material.
- Monthly: audit Drive sharing, tool inventory, stalled leads, unpaid items, indexing notes, and automation failures.

## Production checklist

- [ ] Drive, Docs, and Sheets APIs are enabled for the chosen Google Cloud identity.
- [ ] Root folder is private and shared only with intended people/service account.
- [ ] `node scripts/setup-google-drive-command-center.ts --check` passes.
- [ ] The setup command completes twice without creating duplicates.
- [ ] All 11 Google Docs and four Google Sheets are present in their intended folders.
- [ ] Apps Script properties contain four spreadsheet IDs and a unique shared secret.
- [ ] Apps Script is deployed with the narrowest workable access level.
- [ ] Webhook URL and secret exist only in Cloudflare/Apps Script secret storage.
- [ ] A test lead and Snapshot order append to the correct tabs.
- [ ] Invalid secret, unknown event, malformed email/URL, and oversized body tests are rejected.
- [ ] No customer, card, credential, or private report data exists in the repository.

## Known MVP limitations

- Apps Script web apps do not support a conventional custom authorization header contract, so the secret travels in the encrypted JSON request body.
- Apps Script `ContentService` does not provide normal HTTP status-code control; callers must treat `ok: false` as failure even when the transport status is 200.
- Spreadsheet appends are operational records, not a transactional CRM; simultaneous submissions are serialized but Google quotas still apply.
- The setup script does not delete, rename, or reorder user-created Drive content.
- It does not transfer Drive ownership. `GOOGLE_DRIVE_OWNER_EMAIL` grants one private writer permission to avoid risky ownership changes.
- Existing tabs with incompatible headers require manual reconciliation.
- Automatic deployment of Apps Script is not attempted; this avoids requiring extra OAuth scopes or a paid service.
