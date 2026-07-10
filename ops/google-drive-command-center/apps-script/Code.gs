/**
 * Eidos Works Command Center webhook.
 *
 * Deploy this as a Google Apps Script web app and keep every configuration
 * value in Script Properties. Never paste a secret or spreadsheet ID here.
 * Apps Script does not reliably expose arbitrary request headers to doPost(),
 * so the Cloudflare Worker sends the shared secret in the HTTPS JSON body.
 */

var MAX_BODY_CHARACTERS = 24000;
var LOCK_TIMEOUT_MILLISECONDS = 10000;

var PROPERTY_KEYS = Object.freeze({
  SECRET: 'COMMAND_CENTER_SHARED_SECRET',
  CRM: 'COMMAND_CENTER_CRM_SPREADSHEET_ID',
  SNAPSHOT: 'COMMAND_CENTER_SNAPSHOT_SPREADSHEET_ID',
  PROJECT: 'COMMAND_CENTER_PROJECT_SPREADSHEET_ID',
  CONTENT: 'COMMAND_CENTER_CONTENT_SPREADSHEET_ID'
});

var DESTINATIONS = Object.freeze({
  lead: {
    spreadsheetProperty: PROPERTY_KEYS.CRM,
    sheetName: 'Leads',
    fields: [
      field('Created Date', 'createdDate', 'date', 40, false, function () { return new Date().toISOString(); }),
      field('Name', 'name', 'text', 160, true),
      field('Email', 'email', 'email', 254, true),
      field('Company', 'company', 'text', 200),
      field('Website', 'website', 'url', 2048),
      field('Source', 'source', 'text', 160),
      field('Service Interest', 'serviceInterest', 'text', 300),
      field('Budget Range', 'budgetRange', 'text', 100),
      field('Timeline', 'timeline', 'text', 160),
      field('Status', 'status', 'text', 80, false, function () { return 'New'; }),
      field('Next Action', 'nextAction', 'text', 500),
      field('Notes', 'notes', 'text', 2000)
    ]
  },
  snapshot_order: {
    spreadsheetProperty: PROPERTY_KEYS.SNAPSHOT,
    sheetName: 'Orders',
    fields: [
      field('Created Date', 'createdDate', 'date', 40, false, function () { return new Date().toISOString(); }),
      field('Email', 'email', 'email', 254, true),
      field('Business Name', 'businessName', 'text', 200, true),
      field('Website URL', 'websiteUrl', 'url', 2048, true),
      field('Primary Goal', 'primaryGoal', 'text', 1000),
      field('Style Preference', 'stylePreference', 'text', 500),
      field('Payment Status', 'paymentStatus', 'text', 80),
      field('Report Status', 'reportStatus', 'text', 80, false, function () { return 'Queued'; }),
      field('Result URL', 'resultUrl', 'url', 2048),
      field('Follow Up Status', 'followUpStatus', 'text', 80),
      field('Notes', 'notes', 'text', 2000)
    ]
  },
  project: {
    spreadsheetProperty: PROPERTY_KEYS.PROJECT,
    sheetName: 'Projects',
    fields: [
      field('Project Name', 'projectName', 'text', 240, true),
      field('Client', 'client', 'text', 200, true),
      field('Service Lane', 'serviceLane', 'text', 200),
      field('Status', 'status', 'text', 80, false, function () { return 'Planned'; }),
      field('Start Date', 'startDate', 'date', 40),
      field('Target Launch', 'targetLaunch', 'date', 40),
      field('Budget/Scope', 'budgetScope', 'text', 500),
      field('Current Blocker', 'currentBlocker', 'text', 1000),
      field('Next Action', 'nextAction', 'text', 1000),
      field('Drive Folder', 'driveFolder', 'url', 2048),
      field('Notes', 'notes', 'text', 2000)
    ]
  },
  task: {
    spreadsheetProperty: PROPERTY_KEYS.CRM,
    sheetName: 'Tasks',
    fields: [
      field('Created Date', 'createdDate', 'date', 40, false, function () { return new Date().toISOString(); }),
      field('Task', 'task', 'text', 500, true),
      field('Project', 'project', 'text', 240),
      field('Priority', 'priority', 'text', 80),
      field('Status', 'status', 'text', 80, false, function () { return 'Backlog'; }),
      field('Due Date', 'dueDate', 'date', 40),
      field('Owner', 'owner', 'text', 160),
      field('Link', 'link', 'url', 2048),
      field('Notes', 'notes', 'text', 2000)
    ]
  },
  content: {
    spreadsheetProperty: PROPERTY_KEYS.CONTENT,
    sheetName: 'Insights',
    fields: [
      field('Title', 'title', 'text', 300, true),
      field('Slug', 'slug', 'text', 240),
      field('Category', 'category', 'text', 160),
      field('Primary Question Answered', 'primaryQuestionAnswered', 'text', 500),
      field('Status', 'status', 'text', 80, false, function () { return 'Idea'; }),
      field('Author', 'author', 'text', 160),
      field('Draft Link', 'draftLink', 'url', 2048),
      field('Publish Date', 'publishDate', 'date', 40),
      field('Last Updated', 'lastUpdated', 'date', 40),
      field('Internal Links', 'internalLinks', 'text', 2000),
      field('Schema', 'schema', 'text', 200),
      field('Performance Notes', 'performanceNotes', 'text', 2000)
    ]
  },
  finance: {
    spreadsheetProperty: PROPERTY_KEYS.CRM,
    sheetName: 'Finance',
    fields: [
      field('Date', 'date', 'date', 40, false, function () { return new Date().toISOString(); }),
      field('Client', 'client', 'text', 200, true),
      field('Invoice/Payment Item', 'invoicePaymentItem', 'text', 300, true),
      field('Amount', 'amount', 'number', 40),
      field('Status', 'status', 'text', 80),
      field('Due Date', 'dueDate', 'date', 40),
      field('Payment Link', 'paymentLink', 'url', 2048),
      field('Notes', 'notes', 'text', 2000)
    ]
  }
});

function field(header, key, type, maxLength, required, defaultValue) {
  return {
    header: header,
    key: key,
    type: type,
    maxLength: maxLength,
    required: required === true,
    defaultValue: defaultValue || null
  };
}

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'eidos-works-command-center',
    configured: hasRequiredConfiguration_()
  });
}

function doPost(event) {
  try {
    var bodyText = event && event.postData && event.postData.contents;
    if (!bodyText || bodyText.length > MAX_BODY_CHARACTERS) {
      return jsonResponse_({ ok: false, code: 'invalid_body' });
    }

    var request;
    try {
      request = JSON.parse(bodyText);
    } catch (error) {
      return jsonResponse_({ ok: false, code: 'invalid_json' });
    }

    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      return jsonResponse_({ ok: false, code: 'invalid_request' });
    }

    var expectedSecret = PropertiesService.getScriptProperties().getProperty(PROPERTY_KEYS.SECRET) || '';
    var suppliedSecret = typeof request.sharedSecret === 'string' ? request.sharedSecret : '';
    if (expectedSecret.length < 24 || !secureEquals_(expectedSecret, suppliedSecret)) {
      return jsonResponse_({ ok: false, code: 'unauthorized' });
    }

    var eventType = typeof request.eventType === 'string' ? request.eventType : '';
    var destination = DESTINATIONS[eventType];
    if (!destination) {
      return jsonResponse_({ ok: false, code: 'unsupported_event' });
    }

    var data = request.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return jsonResponse_({ ok: false, code: 'invalid_data' });
    }

    var row = buildRow_(destination.fields, data);
    appendValidatedRow_(destination, row);

    return jsonResponse_({
      ok: true,
      eventType: eventType,
      acceptedAt: new Date().toISOString()
    });
  } catch (error) {
    // Do not log request data or secret values.
    console.error('Command Center webhook failed: ' + safeErrorCode_(error));
    return jsonResponse_({ ok: false, code: safeErrorCode_(error) });
  }
}

function buildRow_(fields, data) {
  return fields.map(function (definition) {
    var raw = Object.prototype.hasOwnProperty.call(data, definition.key)
      ? data[definition.key]
      : (definition.defaultValue ? definition.defaultValue() : '');

    if ((raw === '' || raw === null || typeof raw === 'undefined') && definition.required) {
      throw new Error('missing_' + definition.key);
    }

    return validateValue_(raw, definition);
  });
}

function validateValue_(raw, definition) {
  if (raw === '' || raw === null || typeof raw === 'undefined') {
    return '';
  }

  if (definition.type === 'number') {
    if (typeof raw !== 'number' && typeof raw !== 'string') {
      throw new Error('invalid_' + definition.key);
    }
    var numberValue = Number(raw);
    if (!isFinite(numberValue) || Math.abs(numberValue) > 1000000000) {
      throw new Error('invalid_' + definition.key);
    }
    return numberValue;
  }

  if (typeof raw !== 'string' && typeof raw !== 'number' && typeof raw !== 'boolean') {
    throw new Error('invalid_' + definition.key);
  }

  var value = String(raw).trim();
  if (value.length > definition.maxLength) {
    throw new Error('too_long_' + definition.key);
  }

  if (definition.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('invalid_' + definition.key);
  }

  if (definition.type === 'url' && !/^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#]|$)/i.test(value)) {
    throw new Error('invalid_' + definition.key);
  }

  if (definition.type === 'date') {
    var parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      throw new Error('invalid_' + definition.key);
    }
    value = parsed.toISOString();
  }

  return neutralizeFormula_(value);
}

function appendValidatedRow_(destination, row) {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty(destination.spreadsheetProperty);
  if (!spreadsheetId) {
    throw new Error('configuration_missing');
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MILLISECONDS)) {
    throw new Error('busy_retry');
  }

  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(destination.sheetName);
    if (!sheet) {
      throw new Error('sheet_missing');
    }

    var expectedHeaders = destination.fields.map(function (definition) { return definition.header; });
    var actualHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getDisplayValues()[0];
    if (!arraysEqual_(expectedHeaders, actualHeaders)) {
      throw new Error('header_mismatch');
    }

    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
}

function verifyCommandCenterConfiguration() {
  var properties = PropertiesService.getScriptProperties();
  var missing = Object.keys(PROPERTY_KEYS).filter(function (key) {
    return !properties.getProperty(PROPERTY_KEYS[key]);
  });

  if (missing.length) {
    throw new Error('Missing Script Properties: ' + missing.join(', '));
  }

  if ((properties.getProperty(PROPERTY_KEYS.SECRET) || '').length < 24) {
    throw new Error('COMMAND_CENTER_SHARED_SECRET must be at least 24 characters.');
  }

  Object.keys(DESTINATIONS).forEach(function (eventType) {
    var destination = DESTINATIONS[eventType];
    var spreadsheetId = properties.getProperty(destination.spreadsheetProperty);
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(destination.sheetName);
    if (!sheet) {
      throw new Error('Missing sheet for ' + eventType + ': ' + destination.sheetName);
    }
  });

  console.log('Eidos Works Command Center configuration verified.');
  return true;
}

function hasRequiredConfiguration_() {
  var properties = PropertiesService.getScriptProperties();
  return Object.keys(PROPERTY_KEYS).every(function (key) {
    return Boolean(properties.getProperty(PROPERTY_KEYS[key]));
  });
}

function neutralizeFormula_(value) {
  return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
}

function secureEquals_(left, right) {
  left = String(left || '');
  right = String(right || '');
  var length = Math.max(left.length, right.length);
  var result = left.length ^ right.length;

  for (var index = 0; index < length; index += 1) {
    result |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return result === 0;
}

function arraysEqual_(left, right) {
  if (left.length !== right.length) return false;
  for (var index = 0; index < left.length; index += 1) {
    if (String(left[index]) !== String(right[index])) return false;
  }
  return true;
}

function safeErrorCode_(error) {
  var message = error && error.message ? String(error.message) : 'internal_error';
  return /^[a-z0-9_]+$/.test(message) ? message : 'internal_error';
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
