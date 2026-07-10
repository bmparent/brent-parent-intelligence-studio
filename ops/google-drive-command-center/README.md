# Eidos Works Command Center

This directory is the private-by-default scaffold for the internal **Eidos Works Command Center**. It is an operations system, not a public website route. The setup script creates or reuses the same named folders, Google Docs, Google Sheets, and tabs on every run.

## What is included

- `templates/`: 11 Markdown source templates for Google Docs.
- `sheets/`: four workbook definitions, represented by one CSV header/template per tab.
- `apps-script/Code.gs`: a minimal webhook that validates a shared secret and appends approved fields to the correct sheet.
- `../../scripts/setup-google-drive-command-center.ts`: the idempotent Drive setup command.

The Drive root is named `Eidos Works Command Center` and contains these 12 operational folders (the numbered working set `00` through `10`, plus `99_Archive`):

1. `00_Admin_And_Brand`
2. `01_Leads_And_Intake`
3. `02_Eidos_Snapshot`
4. `03_Client_Projects`
5. `04_Proposals_And_SOWs`
6. `05_Invoices_And_Billing`
7. `06_Content_And_Insights`
8. `07_Agentic_SEO`
9. `08_Storefront_Platforms`
10. `09_Dashboards_And_Automation`
11. `10_Weekly_Operations`
12. `99_Archive`

## Local validation (no Google access required)

Node 24 is pinned by this repository and can execute the TypeScript setup file directly:

```bash
node scripts/setup-google-drive-command-center.ts --check
node scripts/setup-google-drive-command-center.ts --dry-run
```

`--check` verifies that all expected templates, workbook directories, tabs, and required headers exist. `--dry-run` prints the exact Drive plan and credential/tool availability without writing to Google.

## Create it in Google Drive

### Option A: existing gcloud login

1. Authenticate locally with `gcloud auth application-default login` (or an existing `gcloud auth login`).
2. Optionally set `GOOGLE_DRIVE_PARENT_FOLDER_ID` to place the root under a private folder you already own.
3. Run:

```bash
node scripts/setup-google-drive-command-center.ts
```

### Option B: service account

1. Create a Google Cloud service account with Drive, Docs, and Sheets APIs enabled.
2. Give the service account access to the private parent folder where the Command Center should live.
3. Set one of:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` to the full JSON value, base64-encoded JSON, or a JSON file path; or
   - `GOOGLE_APPLICATION_CREDENTIALS` to the service-account JSON file path.
4. Set `GOOGLE_DRIVE_PARENT_FOLDER_ID` to that shared private parent folder.
5. Optionally set `GOOGLE_DRIVE_OWNER_EMAIL`. Newly created items will be shared with only this named account as `writer`; the script never creates public or link-wide permissions.
6. Run the same Node command.

The setup command is idempotent. It searches within the intended parent by exact name and MIME type, reuses matches, adds only missing folders/docs/sheets/tabs, and only writes a header to a blank tab. It stops instead of overwriting a non-empty, incompatible header.

## Apps Script webhook setup

1. Open the created **Eidos Works CRM and Pipeline** spreadsheet.
2. Choose **Extensions → Apps Script**.
3. Replace the editor contents with `apps-script/Code.gs`.
4. In **Project Settings → Script properties**, add:
   - `COMMAND_CENTER_SHARED_SECRET`: a long random value used only by the Worker and Apps Script.
   - `COMMAND_CENTER_CRM_SPREADSHEET_ID`: the CRM workbook ID.
   - `COMMAND_CENTER_SNAPSHOT_SPREADSHEET_ID`: the Snapshot workbook ID.
   - `COMMAND_CENTER_PROJECT_SPREADSHEET_ID`: the Project Tracker workbook ID.
   - `COMMAND_CENTER_CONTENT_SPREADSHEET_ID`: the Content/SEO workbook ID.
5. Run `verifyCommandCenterConfiguration` once from the editor and authorize only the requested spreadsheet access.
6. Choose **Deploy → New deployment → Web app**. Execute as the owner and limit access to the narrowest option compatible with the Cloudflare Worker. Apps Script web apps receiving server-to-server requests may require “Anyone” access; the shared-secret check remains mandatory, but the URL and secret must still be treated as credentials.
7. Store the deployment URL as `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` in Cloudflare, and store the same secret as `COMMAND_CENTER_SHARED_SECRET`. Do not put either value in public `PUBLIC_*` variables or client-side code. The Worker must parse the JSON response and require `ok: true`; Apps Script web apps can return an error payload with an HTTP 200 status.

Worker request shape:

```json
{
  "sharedSecret": "server-side-secret",
  "eventType": "lead",
  "data": {
    "name": "Example Person",
    "email": "person@example.com",
    "website": "https://example.com",
    "serviceInterest": "Website strategy"
  }
}
```

Accepted event types are `lead`, `snapshot_order`, `project`, `task`, `content`, and `finance`. The webhook uses an allowlist, length limits, email/URL checks, a lock around each append, and spreadsheet-safe text handling. Unknown fields are discarded. Never send payment card details, API keys, private notes that are not operationally necessary, or large report content.

## Privacy and security

- Every created Drive item inherits only the parent folder's access. The script never enables “anyone with the link.”
- Keep client data out of this repository; CSV files contain headers/examples only.
- Store Google credentials, webhook URLs, and secrets in local/Cloudflare secret storage, never Git.
- Prefer a dedicated parent folder and least-privilege service account.
- Rotate the webhook secret if its URL or request body is exposed.
- Review Google Drive sharing after initial creation and after team-member changes.

See `docs/COMMAND_CENTER.md` for architecture, environment variables, operating procedures, and known MVP limitations.
