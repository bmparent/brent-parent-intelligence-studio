#!/usr/bin/env node

import { createSign } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

type FolderName =
  | '00_Admin_And_Brand'
  | '01_Leads_And_Intake'
  | '02_Eidos_Snapshot'
  | '03_Client_Projects'
  | '04_Proposals_And_SOWs'
  | '05_Invoices_And_Billing'
  | '06_Content_And_Insights'
  | '07_Agentic_SEO'
  | '08_Storefront_Platforms'
  | '09_Dashboards_And_Automation'
  | '10_Weekly_Operations'
  | '99_Archive';

type DocumentDefinition = {
  name: string;
  folder: FolderName;
  template: string;
};

type TabDefinition = {
  name: string;
  file: string;
  headers: string[];
};

type WorkbookDefinition = {
  name: string;
  folder: FolderName;
  directory: string;
  tabs: TabDefinition[];
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
};

type EnsureFileResult = {
  file: DriveFile;
  created: boolean;
};

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type SpreadsheetMetadata = {
  sheets?: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
};

const execFile = promisify(execFileCallback);
const REPO_ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SCAFFOLD_ROOT = join(REPO_ROOT, 'ops', 'google-drive-command-center');
const TEMPLATE_ROOT = join(SCAFFOLD_ROOT, 'templates');
const SHEET_ROOT = join(SCAFFOLD_ROOT, 'sheets');

const ROOT_FOLDER_NAME = 'Eidos Works Command Center';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DOC_MIME = 'application/vnd.google-apps.document';
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet';
const MANAGED_APP_PROPERTY = { eidosCommandCenterManaged: 'true' };
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets'
];

const FOLDERS: FolderName[] = [
  '00_Admin_And_Brand',
  '01_Leads_And_Intake',
  '02_Eidos_Snapshot',
  '03_Client_Projects',
  '04_Proposals_And_SOWs',
  '05_Invoices_And_Billing',
  '06_Content_And_Insights',
  '07_Agentic_SEO',
  '08_Storefront_Platforms',
  '09_Dashboards_And_Automation',
  '10_Weekly_Operations',
  '99_Archive'
];

const DOCUMENTS: DocumentDefinition[] = [
  { name: 'Eidos Works Operating README', folder: '00_Admin_And_Brand', template: '01-eidos-works-operating-readme.md' },
  { name: 'Brand Voice and Copy Rules', folder: '00_Admin_And_Brand', template: '02-brand-voice-and-copy-rules.md' },
  { name: 'Project Brief Template', folder: '03_Client_Projects', template: '03-project-brief-template.md' },
  { name: 'Website Strategy Call Notes Template', folder: '01_Leads_And_Intake', template: '04-website-strategy-call-notes-template.md' },
  { name: 'Eidos Snapshot Report Template', folder: '02_Eidos_Snapshot', template: '05-eidos-snapshot-report-template.md' },
  { name: 'Proposal / SOW Template', folder: '04_Proposals_And_SOWs', template: '06-proposal-sow-template.md' },
  { name: 'Weekly Review Template', folder: '10_Weekly_Operations', template: '07-weekly-review-template.md' },
  { name: 'Agentic SEO Implementation Checklist', folder: '07_Agentic_SEO', template: '08-agentic-seo-implementation-checklist.md' },
  { name: 'Storefront Platform UX Checklist', folder: '08_Storefront_Platforms', template: '09-storefront-platform-ux-checklist.md' },
  { name: 'Dashboard / Automation Discovery Checklist', folder: '09_Dashboards_And_Automation', template: '10-dashboard-automation-discovery-checklist.md' },
  { name: 'Client Handoff Checklist', folder: '03_Client_Projects', template: '11-client-handoff-checklist.md' }
];

const WORKBOOKS: WorkbookDefinition[] = [
  {
    name: 'Eidos Works CRM and Pipeline',
    folder: '09_Dashboards_And_Automation',
    directory: '01-eidos-works-crm-and-pipeline',
    tabs: [
      tab('Dashboard', 'dashboard.csv', ['Metric', 'Value', 'Updated Date', 'Owner', 'Notes']),
      tab('Leads', 'leads.csv', ['Created Date', 'Name', 'Email', 'Company', 'Website', 'Source', 'Service Interest', 'Budget Range', 'Timeline', 'Status', 'Next Action', 'Notes']),
      tab('Snapshot Orders', 'snapshot-orders.csv', ['Created Date', 'Email', 'Business Name', 'Website URL', 'Primary Goal', 'Style Preference', 'Payment Status', 'Report Status', 'Result URL', 'Follow Up Status', 'Notes']),
      tab('Active Projects', 'active-projects.csv', ['Project Name', 'Client', 'Service Lane', 'Status', 'Start Date', 'Target Launch', 'Budget/Scope', 'Current Blocker', 'Next Action', 'Drive Folder', 'Notes']),
      tab('Tasks', 'tasks.csv', ['Created Date', 'Task', 'Project', 'Priority', 'Status', 'Due Date', 'Owner', 'Link', 'Notes']),
      tab('Follow Ups', 'follow-ups.csv', ['Created Date', 'Contact', 'Company', 'Related Item', 'Channel', 'Due Date', 'Status', 'Owner', 'Outcome', 'Notes']),
      tab('Content Calendar', 'content-calendar.csv', ['Title', 'Category', 'Target Page', 'Status', 'Draft Link', 'Publish Date', 'Primary Question Answered', 'Internal Links', 'Schema Needed', 'Notes']),
      tab('Insights Inventory', 'insights-inventory.csv', ['Title', 'Slug', 'Category', 'Status', 'Last Updated', 'Primary Question Answered', 'Target Audience', 'Internal Links', 'Performance Notes', 'Notes']),
      tab('SEO Tracker', 'seo-tracker.csv', ['Page', 'Primary Query', 'Search Intent', 'Status', 'Indexed', 'Schema', 'Internal Links', 'Last Reviewed', 'Next Action', 'Notes']),
      tab('Finance', 'finance.csv', ['Date', 'Client', 'Invoice/Payment Item', 'Amount', 'Status', 'Due Date', 'Payment Link', 'Notes']),
      tab('Tool Inventory', 'tool-inventory.csv', ['Tool', 'Purpose', 'Owner', 'Plan/Cost', 'Login URL', 'Renewal Date', 'Data Stored', 'Status', 'Notes'])
    ]
  },
  {
    name: 'Eidos Snapshot Orders',
    folder: '02_Eidos_Snapshot',
    directory: '02-eidos-snapshot-orders',
    tabs: [
      tab('Orders', 'orders.csv', ['Created Date', 'Email', 'Business Name', 'Website URL', 'Primary Goal', 'Style Preference', 'Payment Status', 'Report Status', 'Result URL', 'Follow Up Status', 'Notes']),
      tab('Reports', 'reports.csv', ['Created Date', 'Email', 'Business Name', 'Website URL', 'Report Status', 'Drive URL', 'Result URL', 'Delivered Date', 'Quality Check', 'Notes']),
      tab('Follow Ups', 'follow-ups.csv', ['Created Date', 'Email', 'Business Name', 'Reason', 'Due Date', 'Status', 'Owner', 'Outcome', 'Next Action', 'Notes']),
      tab('Errors', 'errors.csv', ['Created Date', 'Email', 'Stage', 'Error Code', 'Error Message', 'Retry Count', 'Last Retry', 'Resolution Status', 'Notes']),
      tab('Refund Review', 'refund-review.csv', ['Created Date', 'Email', 'Payment Reference', 'Reason', 'Evidence Link', 'Decision', 'Decision Date', 'Refund Status', 'Notes'])
    ]
  },
  {
    name: 'Project Tracker',
    folder: '03_Client_Projects',
    directory: '03-project-tracker',
    tabs: [
      tab('Projects', 'projects.csv', ['Project Name', 'Client', 'Service Lane', 'Status', 'Start Date', 'Target Launch', 'Budget/Scope', 'Current Blocker', 'Next Action', 'Drive Folder', 'Notes']),
      tab('Milestones', 'milestones.csv', ['Project Name', 'Milestone', 'Target Date', 'Status', 'Owner', 'Dependency', 'Approval Needed', 'Evidence Link', 'Notes']),
      tab('Deliverables', 'deliverables.csv', ['Project Name', 'Deliverable', 'Phase', 'Status', 'Owner', 'Due Date', 'Client Review', 'Canonical Link', 'Notes']),
      tab('Client Notes', 'client-notes.csv', ['Created Date', 'Project Name', 'Client Contact', 'Note Type', 'Summary', 'Decision', 'Next Action', 'Owner', 'Follow Up Date', 'Source Link']),
      tab('Launch Checklist', 'launch-checklist.csv', ['Project Name', 'Area', 'Check', 'Status', 'Owner', 'Due Date', 'Evidence Link', 'Blocker', 'Notes']),
      tab('Maintenance', 'maintenance.csv', ['Project Name', 'Maintenance Item', 'Frequency', 'Next Due', 'Owner', 'Status', 'Vendor/Tool', 'Canonical Link', 'Notes'])
    ]
  },
  {
    name: 'Content and Agentic SEO Tracker',
    folder: '07_Agentic_SEO',
    directory: '04-content-and-agentic-seo-tracker',
    tabs: [
      tab('Insights', 'insights.csv', ['Title', 'Slug', 'Category', 'Primary Question Answered', 'Status', 'Author', 'Draft Link', 'Publish Date', 'Last Updated', 'Internal Links', 'Schema', 'Performance Notes']),
      tab('Service Pages', 'service-pages.csv', ['Page', 'Service Lane', 'Audience', 'Primary Intent', 'Status', 'Canonical URL', 'Primary CTA', 'Proof Needed', 'Last Reviewed', 'Next Action', 'Notes']),
      tab('Keywords/Questions', 'keywords-questions.csv', ['Question/Query', 'Intent', 'Audience', 'Target Page', 'Source', 'Evidence/Volume', 'Status', 'Last Reviewed', 'Notes']),
      tab('Internal Links', 'internal-links.csv', ['Source Page', 'Destination Page', 'Anchor/Context', 'Status', 'Last Checked', 'Issue', 'Next Action', 'Notes']),
      tab('Schema Checklist', 'schema-checklist.csv', ['Page', 'Schema Type', 'Visible Evidence', 'Validation Status', 'Last Validated', 'Issue', 'Owner', 'Next Action', 'Notes']),
      tab('Search Console Notes', 'search-console-notes.csv', ['Date', 'Property/Page', 'Observation', 'Query', 'Clicks', 'Impressions', 'Position', 'Index Status', 'Action', 'Review Date', 'Notes']),
      tab('AI Referral Notes', 'ai-referral-notes.csv', ['Date', 'Referrer/Assistant', 'Landing Page', 'Observed Evidence', 'Visitor Intent', 'Conversion/Outcome', 'Confidence', 'Follow Up', 'Notes'])
    ]
  }
];

function tab(name: string, file: string, headers: string[]): TabDefinition {
  return { name, file, headers };
}

function hasArgument(name: string): boolean {
  return process.argv.slice(2).includes(name);
}

function printHelp(): void {
  console.log(`Eidos Works Command Center setup

Usage:
  node scripts/setup-google-drive-command-center.ts --check
  node scripts/setup-google-drive-command-center.ts --dry-run
  node scripts/setup-google-drive-command-center.ts

Options:
  --check     Validate all local templates, workbooks, tabs, and headers.
  --dry-run   Validate and print the creation plan without Google writes.
  --help      Show this message.

Authentication order:
  GOOGLE_SERVICE_ACCOUNT_JSON
  GOOGLE_APPLICATION_CREDENTIALS
  gcloud application-default access token
  gcloud user access token`);
}

async function validateScaffold(): Promise<void> {
  const errors: string[] = [];

  if (FOLDERS.length !== 12 || new Set(FOLDERS).size !== FOLDERS.length) {
    errors.push(`Folder plan must have 12 unique entries; found ${FOLDERS.length}.`);
  }

  if (DOCUMENTS.length !== 11 || new Set(DOCUMENTS.map((document) => document.name)).size !== 11) {
    errors.push(`Document plan must have 11 unique documents; found ${DOCUMENTS.length}.`);
  }

  if (WORKBOOKS.length !== 4 || new Set(WORKBOOKS.map((workbook) => workbook.name)).size !== 4) {
    errors.push(`Workbook plan must have four unique workbooks; found ${WORKBOOKS.length}.`);
  }

  for (const document of DOCUMENTS) {
    const path = join(TEMPLATE_ROOT, document.template);
    try {
      const contents = await readFile(path, 'utf8');
      if (!contents.trim().startsWith('# ') || contents.trim().length < 100) {
        errors.push(`${document.template} is empty or does not begin with a Markdown title.`);
      }
    } catch {
      errors.push(`Missing document template: ${path}`);
    }
  }

  for (const workbook of WORKBOOKS) {
    if (new Set(workbook.tabs.map((sheet) => sheet.name)).size !== workbook.tabs.length) {
      errors.push(`${workbook.name} has duplicate tab names.`);
    }

    for (const sheet of workbook.tabs) {
      const path = join(SHEET_ROOT, workbook.directory, sheet.file);
      try {
        const contents = await readFile(path, 'utf8');
        const [headerLine, ...remainingLines] = contents.replace(/\r\n/g, '\n').split('\n');
        const actualHeaders = parseCsvRow(headerLine || '');

        if (!arraysEqual(actualHeaders, sheet.headers)) {
          errors.push(`${workbook.name} / ${sheet.name} has an unexpected header in ${path}.`);
        }

        if (remainingLines.some((line) => line.trim().length > 0)) {
          errors.push(`${path} contains data rows. Scaffold CSV files must contain headers only.`);
        }
      } catch {
        errors.push(`Missing sheet template: ${path}`);
      }
    }
  }

  if (errors.length) {
    throw new Error(`Command Center scaffold validation failed:\n- ${errors.join('\n- ')}`);
  }

  const tabCount = WORKBOOKS.reduce((count, workbook) => count + workbook.tabs.length, 0);
  console.log(`Scaffold valid: ${FOLDERS.length} folders, ${DOCUMENTS.length} Docs, ${WORKBOOKS.length} workbooks, ${tabCount} tabs.`);
}

function printPlan(): void {
  console.log(`\nDrive root: ${ROOT_FOLDER_NAME}`);
  console.log('\nFolders:');
  for (const folder of FOLDERS) console.log(`  - ${folder}`);

  console.log('\nGoogle Docs:');
  for (const document of DOCUMENTS) console.log(`  - ${document.name} -> ${document.folder}`);

  console.log('\nGoogle Sheets:');
  for (const workbook of WORKBOOKS) {
    console.log(`  - ${workbook.name} -> ${workbook.folder}`);
    console.log(`    Tabs: ${workbook.tabs.map((sheet) => sheet.name).join(', ')}`);
  }
}

async function printAvailability(): Promise<void> {
  const serviceAccountConfigured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const [gcloud, clasp] = await Promise.all([commandExists('gcloud'), commandExists('clasp')]);
  console.log('\nSetup availability (secret values are never printed):');
  console.log(`  Service-account environment: ${serviceAccountConfigured ? 'configured' : 'not configured'}`);
  console.log(`  GOOGLE_DRIVE_PARENT_FOLDER_ID: ${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID ? 'configured' : 'not configured (My Drive root)'}`);
  console.log(`  GOOGLE_DRIVE_OWNER_EMAIL: ${process.env.GOOGLE_DRIVE_OWNER_EMAIL ? 'configured' : 'not configured'}`);
  console.log(`  GOOGLE_APPS_SCRIPT_WEBHOOK_URL: ${process.env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL ? 'configured' : 'not configured'}`);
  console.log(`  COMMAND_CENTER_SHARED_SECRET: ${process.env.COMMAND_CENTER_SHARED_SECRET ? 'configured' : 'not configured'}`);
  console.log(`  gcloud: ${gcloud ? 'available' : 'not available'}`);
  console.log(`  clasp: ${clasp ? 'available' : 'not available (optional)'}`);
}

async function commandExists(command: string): Promise<boolean> {
  try {
    await execFile(command, ['--version'], { timeout: 5000, maxBuffer: 1024 * 1024 });
    return true;
  } catch {
    return false;
  }
}

async function obtainAccessToken(): Promise<{ token: string; source: string }> {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const account = await loadServiceAccount();
    return { token: await createServiceAccountAccessToken(account), source: `service account ${account.client_email}` };
  }

  const attempts: Array<{ args: string[]; label: string }> = [
    { args: ['auth', 'application-default', 'print-access-token'], label: 'gcloud application-default credentials' },
    { args: ['auth', 'print-access-token'], label: 'gcloud user credentials' }
  ];

  for (const attempt of attempts) {
    try {
      const result = await execFile('gcloud', attempt.args, { timeout: 15000, maxBuffer: 1024 * 1024 });
      const token = result.stdout.trim();
      if (token) return { token, source: attempt.label };
    } catch {
      // Try the next non-interactive credential source.
    }
  }

  throw new Error('No usable Google credential was found. The local scaffold is complete; configure a service account or run `gcloud auth application-default login`, then rerun this command.');
}

async function loadServiceAccount(): Promise<ServiceAccount> {
  const explicitPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  const rawSetting = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  let jsonText = '';

  if (explicitPath) {
    jsonText = await readFile(resolve(explicitPath), 'utf8');
  } else if (rawSetting) {
    if (rawSetting.startsWith('{')) {
      jsonText = rawSetting;
    } else {
      const decoded = Buffer.from(rawSetting, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        jsonText = decoded;
      } else {
        jsonText = await readFile(resolve(rawSetting), 'utf8');
      }
    }
  }

  let parsed: Partial<ServiceAccount>;
  try {
    parsed = JSON.parse(jsonText) as Partial<ServiceAccount>;
  } catch {
    throw new Error('The configured Google service-account value is not valid JSON, base64 JSON, or a readable JSON path.');
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('The Google service-account JSON must include client_email and private_key.');
  }

  return parsed as ServiceAccount;
}

async function createServiceAccountAccessToken(account: ServiceAccount): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const tokenUrl = account.token_uri || 'https://oauth2.googleapis.com/token';
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: GOOGLE_SCOPES.join(' '),
    aud: tokenUrl,
    iat: issuedAt,
    exp: issuedAt + 3600
  }));
  const unsigned = `${header}.${claims}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${base64Url(signer.sign(account.private_key))}`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  const payload = await response.json() as { access_token?: string; error?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(`Google service-account token request failed (${response.status}${payload.error ? `: ${payload.error}` : ''}).`);
  }

  return payload.access_token;
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function googleRequest<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');

  const response = await fetch(url, { ...init, headers });
  const body = await response.text();

  if (!response.ok) {
    let safeMessage = body.slice(0, 800).replace(/[\r\n]+/g, ' ');
    safeMessage = safeMessage.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
    throw new Error(`Google API request failed (${response.status}): ${safeMessage || response.statusText}`);
  }

  return (body ? JSON.parse(body) : undefined) as T;
}

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function findDriveFiles(token: string, name: string, mimeType: string, parentId?: string): Promise<DriveFile[]> {
  const searchParentId = parentId || 'root';
  const clauses = [
    `name = '${escapeDriveQuery(name)}'`,
    `mimeType = '${escapeDriveQuery(mimeType)}'`,
    'trashed = false',
    `'${escapeDriveQuery(searchParentId)}' in parents`
  ];

  const params = new URLSearchParams({
    q: clauses.join(' and '),
    pageSize: '100',
    spaces: 'drive',
    fields: 'files(id,name,mimeType,webViewLink,createdTime)',
    orderBy: 'createdTime'
  });
  params.set('supportsAllDrives', 'true');
  params.set('includeItemsFromAllDrives', 'true');

  const result = await googleRequest<{ files?: DriveFile[] }>(token, `https://www.googleapis.com/drive/v3/files?${params}`);
  return result.files || [];
}

async function ensureDriveFile(
  token: string,
  name: string,
  mimeType: string,
  parentId?: string
): Promise<EnsureFileResult> {
  const matches = await findDriveFiles(token, name, mimeType, parentId);
  if (matches.length) {
    if (matches.length > 1) {
      console.warn(`  ! ${matches.length} matches found for ${name}; reusing the oldest and leaving duplicates untouched.`);
    }
    console.log(`  = Reused ${name}`);
    return { file: matches[0], created: false };
  }

  const file = await googleRequest<DriveFile>(
    token,
    'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,name,mimeType,webViewLink,createdTime',
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        mimeType,
        ...(parentId ? { parents: [parentId] } : {}),
        appProperties: MANAGED_APP_PROPERTY
      })
    }
  );
  console.log(`  + Created ${name}`);
  return { file, created: true };
}

async function ensureWriterPermission(token: string, fileId: string, email: string): Promise<void> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('GOOGLE_DRIVE_OWNER_EMAIL is not a valid email address.');
  }

  const existing = await googleRequest<{
    permissions?: Array<{ emailAddress?: string; role?: string; type?: string }>;
  }>(token, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true&fields=permissions(emailAddress,role,type)`);

  if ((existing.permissions || []).some((permission) => permission.type === 'user' && permission.emailAddress?.toLowerCase() === email.toLowerCase())) {
    console.log(`  = Root already shared privately with ${email}`);
    return;
  }

  await googleRequest(token, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true&sendNotificationEmail=false&fields=id`, {
    method: 'POST',
    body: JSON.stringify({ type: 'user', role: 'writer', emailAddress: email })
  });
  console.log(`  + Shared root privately with ${email} as writer`);
}

async function isGoogleDocEmpty(token: string, documentId: string): Promise<boolean> {
  const document = await googleRequest<{
    body?: { content?: Array<{ paragraph?: { elements?: Array<{ textRun?: { content?: string } }> } }> };
  }>(token, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`);
  const text = (document.body?.content || [])
    .flatMap((item) => item.paragraph?.elements || [])
    .map((element) => element.textRun?.content || '')
    .join('')
    .trim();
  return text.length === 0;
}

async function ensureDocumentContent(token: string, documentId: string, templatePath: string): Promise<void> {
  if (!(await isGoogleDocEmpty(token, documentId))) {
    console.log(`    = Preserved existing document content`);
    return;
  }

  const source = (await readFile(templatePath, 'utf8')).trimEnd() + '\n';
  await googleRequest(token, `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{ insertText: { location: { index: 1 }, text: source } }]
    })
  });
  console.log(`    + Added template content`);
}

async function spreadsheetMetadata(token: string, spreadsheetId: string): Promise<SpreadsheetMetadata> {
  return googleRequest(token, `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets(properties(sheetId,title,index))`);
}

async function ensureWorkbookTabs(token: string, spreadsheetId: string, workbook: WorkbookDefinition, created: boolean): Promise<void> {
  let metadata = await spreadsheetMetadata(token, spreadsheetId);
  const existingTitles = new Set((metadata.sheets || []).map((sheet) => sheet.properties.title));
  const requests: object[] = [];

  const defaultSheet = (metadata.sheets || []).find((sheet) => sheet.properties.title === 'Sheet1');
  const firstTab = workbook.tabs[0];
  if (created && defaultSheet && !existingTitles.has(firstTab.name)) {
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: defaultSheet.properties.sheetId, title: firstTab.name },
        fields: 'title'
      }
    });
    existingTitles.delete('Sheet1');
    existingTitles.add(firstTab.name);
  }

  for (const sheet of workbook.tabs) {
    if (!existingTitles.has(sheet.name)) {
      requests.push({ addSheet: { properties: { title: sheet.name } } });
      existingTitles.add(sheet.name);
    }
  }

  if (requests.length) {
    await googleRequest(token, `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
    console.log(`    + Added/renamed ${requests.length} tab${requests.length === 1 ? '' : 's'}`);
    metadata = await spreadsheetMetadata(token, spreadsheetId);
  } else {
    console.log(`    = All tabs already exist`);
  }

  for (const sheet of workbook.tabs) {
    await ensureSheetHeader(token, spreadsheetId, sheet);
  }

  await formatWorkbookHeaders(token, spreadsheetId, workbook, metadata);
}

function a1SheetTitle(title: string): string {
  return `'${title.replace(/'/g, "''")}'`;
}

async function ensureSheetHeader(token: string, spreadsheetId: string, sheet: TabDefinition): Promise<void> {
  const range = `${a1SheetTitle(sheet.name)}!1:1`;
  const result = await googleRequest<{ values?: unknown[][] }>(
    token,
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`
  );
  const actual = (result.values?.[0] || []).map((value) => String(value));

  if (actual.length === 0 || actual.every((value) => value.trim() === '')) {
    const target = `${a1SheetTitle(sheet.name)}!A1`;
    await googleRequest(
      token,
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(target)}?valueInputOption=RAW`,
      { method: 'PUT', body: JSON.stringify({ range: target, majorDimension: 'ROWS', values: [sheet.headers] }) }
    );
    console.log(`    + Wrote ${sheet.name} headers`);
    return;
  }

  if (!arraysEqual(actual, sheet.headers)) {
    throw new Error(`${sheet.name} in spreadsheet ${spreadsheetId} has a non-empty incompatible header. Existing data was preserved; reconcile that tab manually.`);
  }

  console.log(`    = Verified ${sheet.name} headers`);
}

async function formatWorkbookHeaders(
  token: string,
  spreadsheetId: string,
  workbook: WorkbookDefinition,
  metadata: SpreadsheetMetadata
): Promise<void> {
  const sheetIdByTitle = new Map((metadata.sheets || []).map((sheet) => [sheet.properties.title, sheet.properties.sheetId]));
  const requests: object[] = [];

  for (const tabDefinition of workbook.tabs) {
    const sheetId = sheetIdByTitle.get(tabDefinition.name);
    if (typeof sheetId !== 'number') continue;
    requests.push(
      {
        updateSheetProperties: {
          properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
          fields: 'gridProperties.frozenRowCount'
        }
      },
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: tabDefinition.headers.length },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.075, green: 0.11, blue: 0.18 },
              textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
              wrapStrategy: 'WRAP',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,wrapStrategy,verticalAlignment)'
        }
      },
      {
        autoResizeDimensions: {
          dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: tabDefinition.headers.length }
        }
      }
    );
  }

  if (requests.length) {
    await googleRequest(token, `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests })
    });
  }
}

async function createCommandCenter(token: string): Promise<void> {
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID?.trim() || undefined;
  console.log('\nReconciling private Google Drive structure...');

  const root = await ensureDriveFile(token, ROOT_FOLDER_NAME, FOLDER_MIME, parentFolderId);
  const ownerEmail = process.env.GOOGLE_DRIVE_OWNER_EMAIL?.trim();
  if (ownerEmail) await ensureWriterPermission(token, root.file.id, ownerEmail);

  const folderIds = new Map<FolderName, string>();
  for (const folderName of FOLDERS) {
    const folder = await ensureDriveFile(token, folderName, FOLDER_MIME, root.file.id);
    folderIds.set(folderName, folder.file.id);
  }

  console.log('\nReconciling Google Docs...');
  for (const definition of DOCUMENTS) {
    const parentId = folderIds.get(definition.folder);
    if (!parentId) throw new Error(`Internal setup error: no folder ID for ${definition.folder}.`);
    const document = await ensureDriveFile(token, definition.name, DOC_MIME, parentId);
    await ensureDocumentContent(token, document.file.id, join(TEMPLATE_ROOT, definition.template));
  }

  console.log('\nReconciling Google Sheets...');
  for (const workbook of WORKBOOKS) {
    const parentId = folderIds.get(workbook.folder);
    if (!parentId) throw new Error(`Internal setup error: no folder ID for ${workbook.folder}.`);
    const spreadsheet = await ensureDriveFile(token, workbook.name, SHEET_MIME, parentId);
    await ensureWorkbookTabs(token, spreadsheet.file.id, workbook, spreadsheet.created);
  }

  const rootUrl = root.file.webViewLink || `https://drive.google.com/drive/folders/${root.file.id}`;
  console.log('\nCommand Center reconciliation complete.');
  console.log(`Root folder: ${rootUrl}`);
  console.log('No public permissions were created. Verify Drive sharing before adding client data.');
}

function parseCsvRow(line: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += character;
    }
  }
  values.push(value);
  return values;
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function main(): Promise<void> {
  const knownArguments = new Set(['--check', '--dry-run', '--help']);
  const unknownArguments = process.argv.slice(2).filter((argument) => !knownArguments.has(argument));
  if (unknownArguments.length) throw new Error(`Unknown option(s): ${unknownArguments.join(', ')}`);

  if (hasArgument('--help')) {
    printHelp();
    return;
  }

  await validateScaffold();
  if (hasArgument('--check')) return;

  printPlan();
  await printAvailability();
  if (hasArgument('--dry-run')) {
    console.log('\nDry run complete. No Google Drive changes were made.');
    return;
  }

  let credential: { token: string; source: string };
  try {
    credential = await obtainAccessToken();
  } catch (error) {
    const explicitCredential = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (explicitCredential) throw error;
    console.warn(`\n${error instanceof Error ? error.message : String(error)}`);
    console.warn(`Scaffold location: ${SCAFFOLD_ROOT}`);
    console.warn('No website files were changed and the website build is not blocked.');
    return;
  }

  console.log(`\nAuthenticated with ${credential.source}.`);
  await createCommandCenter(credential.token);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nCommand Center setup failed: ${message}`);
  console.error(`Local scaffold remains available at ${SCAFFOLD_ROOT}.`);
  process.exitCode = 1;
});
