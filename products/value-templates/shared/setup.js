/* Offline configuration editor. No network, persistence, eval or dependencies. */
(() => {
  'use strict';
  const form = document.querySelector('[data-setup-form]');
  const fields = document.querySelector('[data-setup-fields]');
  const container = document.querySelector('[data-setup-inputs]');
  const status = document.querySelector('[data-setup-status]');
  const globalName = Object.hasOwn(window, 'GATHERLINE_CONFIG') ? 'GATHERLINE_CONFIG' : 'TEMPLATE_CONFIG';
  const config = window[globalName];
  const controls = [];
  // Always intercept submission, including a malformed or missing config.
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (fields.disabled || !form.reportValidity()) return;
    const next = JSON.parse(JSON.stringify(config));
    for (const { path, input } of controls) {
      let target = next;
      for (const key of path.slice(0, -1)) target = target[key];
      target[path.at(-1)] = input.type === 'checkbox' ? input.checked : input.value;
    }
    if (next.event && !validEvent(next.event)) {
      status.textContent = 'Check the calendar times: use valid UTC dates, and make the end later than the start.';
      controls.find(control => control.path.join('.') === 'event.startUtc')?.input.focus();
      return;
    }
    const content = '/* Prepared locally with START-HERE.html. Keep HTML fallback text in sync. */\nwindow.' + globalName + ' = ' + JSON.stringify(next, null, 2).replace(/</g, '\\u003c') + ';\n';
    const url = URL.createObjectURL(new Blob([content], { type: 'text/javascript;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'config.js';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Download prepared. Replace config.js in your working folder, then open and refresh index.html. This does not update your HTML fallback text or publish your website.';
  });
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    status.textContent = 'Your configuration could not load. Keep the original config.js beside this page and check it before trying again.';
    return;
  }
  const labels = {
    documentTitle: 'Browser tab title', contactEmail: 'Your public contact email (optional)',
    brand: 'Business or event name', headline: 'Main headline', description: 'Introduction',
    disclosure: 'Footer note', ctaTitle: 'Closing invitation', contactTitle: 'Contact heading',
    servicesTitle: 'Services heading', gardenTitle: 'First service name', gardenDescription: 'First service description',
    outdoorTitle: 'Second service name', outdoorDescription: 'Second service description',
    smallTitle: 'Third service name', smallDescription: 'Third service description',
    reviewTitle: 'First service name', reviewDescription: 'First service description',
    planTitle: 'Second service name', planDescription: 'Second service description',
    supportTitle: 'Third service name', supportDescription: 'Third service description',
    day: 'Day shown on the ticket', month: 'Month shown on the ticket', date: 'Date shown on the page',
    time: 'Time shown on the page', location: 'Location', details: 'Workshop details',
    startUtc: 'Calendar start (UTC)', endUtc: 'Calendar end (UTC)', uid: 'Unique calendar event ID',
    title: 'Calendar event name', ink: 'Text color', paper: 'Page background',
    accent: 'Accent color', surface: 'Panel background'
  };
  function addFields(object, parent, path = []) {
    for (const [key, value] of Object.entries(object)) {
      const keys = [...path, key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const group = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = { copy: 'Wording', colors: 'Colors', event: 'Downloaded calendar' }[key] || key;
        group.appendChild(legend);
        parent.appendChild(group);
        addFields(value, group, keys);
        continue;
      }
      if (typeof value !== 'string' && typeof value !== 'boolean') continue;
      const label = document.createElement('label');
      const caption = document.createElement('span');
      caption.textContent = labels[key] || key;
      label.appendChild(caption);
      const input = document.createElement(typeof value === 'string' && /headline|description|details|disclosure/i.test(key) ? 'textarea' : 'input');
      input.id = 'setup-' + keys.join('-');
      if (typeof value === 'boolean') {
        input.type = 'checkbox';
        input.checked = value;
      } else {
        input.value = value;
        if (key === 'contactEmail') input.type = 'email';
        if (path[0] === 'copy' && (key === 'brand' || key === 'headline')) input.required = true;
        if (path[0] === 'colors') {
          input.pattern = '#[0-9a-fA-F]{6}';
          input.required = true;
          input.title = 'Use a six-digit color, for example #20342e.';
        }
      }
      label.appendChild(input);
      if (key === 'startUtc' || key === 'endUtc') {
        const help = document.createElement('span');
        help.className = 'help';
        help.textContent = 'Format: 2026-11-14T15:00:00Z. Also update the date and time shown on the page.';
        label.appendChild(help);
      }
      parent.appendChild(label);
      controls.push({ path: keys, input });
    }
  }
  function validEvent(event) {
    const validStamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value.replace('Z', '.000Z');
    return validStamp(event.startUtc) && validStamp(event.endUtc) && event.endUtc > event.startUtc;
  }
  addFields(config, container);
  fields.disabled = false;
  status.textContent = 'Ready. Your current local configuration is loaded. Download your changes when you are ready.';
})();
