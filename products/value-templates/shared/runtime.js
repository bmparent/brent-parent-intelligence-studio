/* Local-only template helpers. No network requests or persistent visitor storage. */
(() => {
  'use strict';
  const config = window.TEMPLATE_CONFIG || {};
  const copy = config.copy || {};
  document.querySelectorAll('[data-copy]').forEach(element => {
    const value = copy[element.dataset.copy];
    if (typeof value === 'string') element.textContent = value;
  });
  if (typeof config.documentTitle === 'string') document.title = config.documentTitle;
  const safeColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
  const themeRoot = document.documentElement;
  Object.entries(config.colors || {}).forEach(([key, value]) => {
    if (/^(ink|paper|accent|surface)$/.test(key) && safeColor(value)) themeRoot.style.setProperty(`--${key}`, value);
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
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const result = document.querySelector('[data-inquiry-result]');
  const output = result.querySelector('textarea');
  const email = result.querySelector('[data-email-draft]');
  const service = new URLSearchParams(window.location.search).get('service');
  const focus = form.elements.namedItem('focus');
  if (focus && service && Array.from(focus.options).some(option => option.value === service)) focus.value = service;
  let draft = '';
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const parts = [copy.brand || 'Project inquiry', ''];
    for (const field of form.querySelectorAll('[data-field]')) {
      const value = field.tagName === 'SELECT' ? field.selectedOptions[0]?.textContent : field.value;
      parts.push(`${field.dataset.field}: ${String(value || '').trim()}`);
    }
    draft = parts.join('\n\n');
    output.value = draft;
    const address = String(config.contactEmail || '').trim();
    const validEmail = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(address) && !/[\r\n]/.test(address);
    email.hidden = !validEmail;
    if (validEmail) email.href = `mailto:${encodeURIComponent(address)}?subject=${encodeURIComponent('Website project inquiry')}&body=${encodeURIComponent(draft)}`;
    else email.removeAttribute('href');
    result.hidden = false;
    result.focus();
  });
  result.querySelector('[data-download-draft]').addEventListener('click', () => {
    if (draft) download(draft + '\n', 'project-inquiry.txt', 'text/plain;charset=utf-8');
  });
  result.querySelector('[data-edit-draft]').addEventListener('click', () => {
    result.hidden = true;
    form.querySelector('select, input, textarea').focus();
  });
  form.addEventListener('input', () => { result.hidden = true; });
  // The static fieldset stays disabled if this script is missing or fails.
  // Enable it only after the local-only submission handler is installed.
  form.querySelector('[data-inquiry-fields]').disabled = false;
  form.removeAttribute('aria-describedby');
  document.querySelector('[data-inquiry-unavailable]').hidden = true;
})();
