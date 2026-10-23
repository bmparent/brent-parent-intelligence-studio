// Optional Core/Plus/Advanced or qualifying legacy-plan enhancement.
// In page footer Code Injection, wrap this file's contents in <script> tags.
// Keep selector.html's native links and articles as the static fallback.
(() => {
  const root = document.getElementById('eidos-switchboard-selector');
  if (!root || root.dataset.enhanced) return;
  root.dataset.enhanced = 'true';
  const links = [...root.querySelectorAll('a[data-ew-choice]')];
  const panels = [...root.querySelectorAll('article[data-ew-panel]')];
  const status = root.querySelector('[data-ew-status]');
  links.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
    const selected = panels.find(panel => panel.dataset.ewPanel === link.dataset.ewChoice);
    if (!selected) return;
    event.preventDefault();
    panels.forEach(panel => { panel.hidden = panel !== selected; });
    links.forEach(choice => choice.setAttribute('aria-current', String(choice === link)));
    if (status) status.textContent = `Showing: ${link.textContent}. All services remain available through the site's ordinary Services links.`;
  }));
})();
