/** Runs only in the opaque-origin preview frame, under its per-response nonce. */
export function frameBootstrap() {
  const channel = location.hash.slice(1);
  const nonce = (document.currentScript as HTMLScriptElement | null)?.nonce;
  if (parent === window || !nonce || !/^[a-zA-Z0-9-]{1,100}$/.test(channel)) return;
  const send = (type: string) => parent.postMessage({ type, channel }, '*');
  let opened = false;
  let runtimeFailed = false;
  window.addEventListener('error', () => { runtimeFailed = true; send('playground-frame-error'); });
  // A broken project runtime must never navigate the frame into the application.
  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a') : null;
    if (!anchor) return;
    event.preventDefault();
    const href = anchor.getAttribute('href') || '';
    if (document.body.dataset.editing !== 'true' && href.startsWith('#')) {
      document.getElementById(href.slice(1) || 'page-main')?.scrollIntoView({ block: 'start' });
    }
  }, true);
  document.addEventListener('submit', event => event.preventDefault(), true);
  window.addEventListener('message', event => {
    const data = event.data;
    if (opened || event.source !== parent || data?.channel !== channel || data?.type !== 'playground-frame-open') return;
    if (typeof data.html !== 'string' || data.html.length > 64_000_000) return;
    opened = true;
    try {
      const page = new DOMParser().parseFromString(data.html, 'text/html');
      const scripts = Array.from(page.querySelectorAll('script'));
      // Editor and frozen packages are self-contained. Never fetch project code.
      if (scripts.some(script => script.hasAttribute('src'))) throw Error('External preview script');
      for (const script of scripts) script.remove();
      document.head.replaceChildren(...Array.from(page.head.childNodes));
      document.body.replaceChildren(...Array.from(page.body.childNodes));
      for (const attr of Array.from(page.body.attributes)) document.body.setAttribute(attr.name, attr.value);
      for (const original of scripts) {
        const script = document.createElement('script');
        script.setAttribute('nonce', nonce);
        if (original.type) script.type = original.type;
        script.textContent = original.textContent;
        document.body.append(script);
      }
      if (!runtimeFailed) send('playground-frame-loaded');
    } catch { send('playground-frame-error'); }
  });
  send('playground-frame-ready');
}
