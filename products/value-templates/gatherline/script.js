/* Scoped event-section behavior; never edits the host page's content or config. */
(() => {
  'use strict';
  const root = document.querySelector('.gatherline[data-template-root]');
  if (!root) return;
  const config = window.GATHERLINE_CONFIG || {};
  root.querySelectorAll('[data-gatherline-copy]').forEach(element => {
    const value = (config.copy || {})[element.dataset.gatherlineCopy];
    if (typeof value === 'string') element.textContent = value;
  });
  if (document.documentElement.hasAttribute('data-gatherline-demo') && typeof config.documentTitle === 'string') document.title = config.documentTitle;
  Object.entries(config.colors || {}).forEach(([key, value]) => {
    if (/^(paper|ink|accent)$/.test(key) && /^#[0-9a-f]{6}$/i.test(value)) root.style.setProperty(`--${key}`, value);
  });
  function download(content, name, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function icsEscape(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }
  function foldLine(line) {
    const encoder = new TextEncoder();
    const chunks = [];
    let current = '';
    for (const character of line) {
      if (encoder.encode(current + character).length > 75) {
        chunks.push(current);
        current = ' ';
      }
      current += character;
    }
    chunks.push(current);
    return chunks.join('\r\n');
  }
  function utcStamp(value) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value || '')) throw new Error('Use an explicit UTC event time.');
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value.replace('Z', '.000Z')) throw new Error('Use a valid event date.');
    return value.replace(/[-:]/g, '');
  }
  const calendarButton = root.querySelector('[data-gatherline-calendar]');
  if (calendarButton) calendarButton.addEventListener('click', () => {
    const status = root.querySelector('[data-gatherline-status]');
    try {
      const event = config.event || {};
      const start = utcStamp(event.startUtc);
      const end = utcStamp(event.endUtc);
      if (end <= start) throw new Error('The event must end after it starts.');
      const uid = String(event.uid || 'gatherline-example@template.invalid').replace(/[^a-zA-Z0-9@._-]/g, '');
      const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eidos Works//Gatherline//EN',
        'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
        `UID:${uid}`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
        `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${icsEscape(event.title || 'Workshop')}`,
        `LOCATION:${icsEscape(event.location || '')}`, `DESCRIPTION:${icsEscape(event.description || '')}`,
        'END:VEVENT', 'END:VCALENDAR'
      ];
      download(lines.map(foldLine).join('\r\n') + '\r\n', 'workshop.ics', 'text/calendar;charset=utf-8');
      status.textContent = 'Calendar file prepared. No booking has been made.';
    } catch {
      status.textContent = 'The calendar date needs attention. Check the event times in config.js.';
    }
  });

})();
