/* Progressive enhancement only. Static content and navigation work without this file. */
(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const page = document.body.dataset.page;
  const text = (selector, value) => { if (typeof value === 'string') document.querySelectorAll(selector).forEach(el => { el.textContent = value; }); };
  const safeHref = value => typeof value === 'string' && /^(https?:\/\/|mailto:|tel:|[a-zA-Z0-9_./#?-])/i.test(value) && !/^(javascript:|data:|vbscript:)/i.test(value);
  if (config.brand) text('[data-brand]', config.brand);
  if (config.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) document.querySelectorAll('[data-email]').forEach(a => { a.textContent = config.email; a.href = 'mailto:' + config.email; });
  if (config.phone && /^[+\d() .-]{6,30}$/.test(config.phone)) document.querySelectorAll('[data-phone]').forEach(a => { a.textContent = config.phone; a.href = 'tel:' + config.phone.replace(/[^+\d]/g, ''); });
  for (const [key, value] of Object.entries(config.colors || {})) if (['ink','paper','accent','panel','line'].includes(key) && /^#[0-9a-f]{3,8}$/i.test(value)) document.body.style.setProperty('--' + key, value);
  if (config.fonts?.heading) document.body.style.setProperty('--heading-font', config.fonts.heading);
  if (config.fonts?.body) document.body.style.setProperty('--body-font', config.fonts.body);
  const content = config.pages?.[page];
  if (content) {
    text('[data-hero-title]', content.title); text('[data-hero-intro]', content.intro); text('[data-primary-link]', content.ctaLabel);
    if (safeHref(content.ctaHref)) document.querySelectorAll('[data-primary-link]').forEach(a => { a.href = content.ctaHref; });
    if (content.image && safeHref(content.image)) document.querySelectorAll('[data-hero-image]').forEach(img => { img.src = content.image; if (content.imageAlt) img.alt = content.imageAlt; });
  }
  document.documentElement.classList.add('js-ready');
  if (config.motion === false) { document.documentElement.style.scrollBehavior = 'auto'; document.documentElement.classList.add('motion-off'); }
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  toggle?.addEventListener('click', () => { const expanded = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(expanded)); nav?.classList.toggle('is-open', expanded); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { toggle.setAttribute('aria-expanded','false'); nav?.classList.remove('is-open'); toggle.focus(); } });
  const announce = value => text('[data-interaction-status]', value);
  document.querySelectorAll('[data-problem]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-problem]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelectorAll('[data-service]').forEach(card => { card.hidden = button.dataset.problem !== 'all' && card.dataset.service !== button.dataset.problem; });
    announce(button.textContent.trim() + ': matching service shown. Follow its link to see the process and contact path.');
  }));
  document.querySelectorAll('[data-time]').forEach(button => { if (button.tagName !== 'BUTTON') return; button.addEventListener('click', () => {
    document.querySelectorAll('button[data-time]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('.hero')?.setAttribute('data-time', button.dataset.time);
    const captions = { morning:'Morning: quiet light, a slow breakfast, and a walk before the day fills.', day:'Day: explore the coast, find a table outside, or leave the afternoon unplanned.', evening:'Evening: return to warm light and make time for dinner together.' };
    text('[data-scene-caption]', captions[button.dataset.time]); announce(captions[button.dataset.time]);
  }); });
  const materialDescriptions = { clay:'Clay: an unglazed outer surface shows the turning lines. A glazed interior is easier to clean.', timber:'Timber: visible grain and a shaped seat. Use indoors and wipe spills promptly.' };
  document.querySelectorAll('[data-material]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-material]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const img = document.querySelector('[data-material-image]'); if (img) { img.src = 'assets/' + (button.dataset.material === 'clay' ? 'vessel.svg' : 'timber.svg'); img.alt = button.dataset.material === 'clay' ? 'Original study of a clay vessel, showing its surface lines.' : 'Original study of a timber stool, showing its seat and grain.'; }
    text('[data-material-notes]', materialDescriptions[button.dataset.material]); announce(materialDescriptions[button.dataset.material]);
  }));
  const lens = document.querySelector('[data-lens]');
  lens?.addEventListener('click', () => { const expanded = lens.getAttribute('aria-pressed') !== 'true'; lens.setAttribute('aria-pressed',String(expanded)); lens.textContent = expanded ? 'Show whole object' : 'Inspect surface'; document.querySelector('.material-stage')?.classList.toggle('is-close',expanded); announce(expanded ? 'Close inspection enabled. The object description remains below.' : 'Whole object shown.'); });
  document.querySelector('.material-stage')?.addEventListener('pointermove', event => { if (!document.querySelector('.material-stage')?.classList.contains('is-close')) return; const bounds = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--lens-x', ((event.clientX - bounds.left) / bounds.width * 100) + '%'); event.currentTarget.style.setProperty('--lens-y', ((event.clientY - bounds.top) / bounds.height * 100) + '%'); });
  document.querySelectorAll('[data-program]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-program]').forEach(other => other.setAttribute('aria-pressed',String(other === button))); document.querySelectorAll('[data-event]').forEach(card => { card.hidden = button.dataset.program !== 'all' && card.dataset.event !== button.dataset.program; }); announce(button.textContent.trim() + ' program shown. Event links remain available.'); }));
  document.querySelector('[data-theme-toggle]')?.addEventListener('click', event => { const night = document.body.dataset.theme !== 'night'; document.body.dataset.theme = night ? 'night' : 'day'; event.currentTarget.setAttribute('aria-pressed',String(night)); event.currentTarget.textContent = night ? 'Day mode' : 'Night mode'; });
  const interest = new URLSearchParams(window.location.search).get('interest');
  const inquirySelect = document.querySelector('.inquiry-form select');
  if (interest && inquirySelect) {
    const keywords = { improvements:'Space', repair:'Repair', planning:'Project', 'shore-house':'Stay', vessel:'Object', 'listening-room':'Program', film:'Program', conversation:'Program' };
    const option = Array.from(inquirySelect.options).find(item => keywords[interest] && item.textContent.startsWith(keywords[interest]));
    if (option) inquirySelect.value = option.value;
  }
  document.querySelector('.inquiry-form')?.addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const data = new FormData(form); const email = config.email || 'hello@example.com';
    const body = ['Name: ' + data.get('name'),'Email: ' + data.get('email'),'Interest: ' + (data.get('interest') || ''),'',data.get('message') || ''].join('\n');
    const link = document.querySelector('[data-prepared-email]'); if (link) { link.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('Website inquiry') + '&body=' + encodeURIComponent(body); link.hidden = false; }
    text('.form-status','Your draft is ready. Open the email draft below, then review and send it in your email app. Nothing has been sent or stored by this website.');
  });
})();

/* Poster-layer selection reveals information; ordinary event links stay available. */
(() => {
  const layers = [...document.querySelectorAll('[data-poster-layer]')];
  if (!layers.length) return;
  const panels = [...document.querySelectorAll('[data-poster-panel]')];
  const status = document.querySelector('[data-poster-status]');
  function reveal(layer) {
    layers.forEach(button => button.setAttribute('aria-pressed', String(button === layer)));
    panels.forEach(panel => { panel.hidden = panel.dataset.posterPanel !== layer.dataset.posterLayer; });
    if (status) status.textContent = layer.dataset.posterTitle + ' — event information revealed.';
  }
  layers.forEach(layer => layer.addEventListener('click', () => reveal(layer)));
  reveal(layers[0]);
})();
