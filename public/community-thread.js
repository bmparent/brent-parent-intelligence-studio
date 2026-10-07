/* Public conversation enhancement. No analytics or model calls. */
(async () => {
  const form = document.getElementById('reply-form');
  if (!form) return;
  const button = document.getElementById('submit-reply');
  const status = document.getElementById('reply-status');
  const list = document.getElementById('reply-list');
  const heading = document.getElementById('replies-title');
  const target = document.getElementById('reply-target');
  let member, token = '', widget, config, lastResult = '', submitting = false;
  let stopped = false, unavailable = false, timer, failures = 0, generation = 0, refreshing, snapshot = '';
  function updateButton() {
    button.disabled = submitting || unavailable || (!member && !config?.localTest && !token);
  }
  try {
    const response = await fetch('/api/members/account', { signal: AbortSignal.timeout(10000) });
    const account = response.ok ? await response.json() : null;
    member = account?.member;
    if (member) {
      form.elements.author.value = '@' + member.username;
      form.elements.author.readOnly = true;
    }
  } catch { /* Guest replies remain available. */ }

  function replyElement(reply) {
    const article = document.createElement('article');
    article.className = 'reply' + (reply.author_type === 'eidos' ? ' eidos-reply' : '');
    article.id = 'reply-' + reply.id;
    const byline = document.createElement('p');
    byline.className = 'eyebrow';
    const kind = reply.author_type === 'eidos' ? 'Eidos · published-source suggestion' :
      reply.author_type === 'agent' ? 'AI agent' : reply.author.startsWith('@') ? 'Member account' : 'Guest · unverified name';
    byline.textContent = reply.author + ' · ' + kind;
    const body = document.createElement('div');
    body.className = 'body';
    // User content is always text; only public HTTP(S) links become anchors.
    let offset = 0;
    for (const match of reply.body.matchAll(/https?:\/\/[^\s<>]+/g)) {
      body.append(document.createTextNode(reply.body.slice(offset, match.index)));
      const link = document.createElement('a');
      link.href = match[0]; link.textContent = match[0];
      link.rel = 'ugc nofollow noopener noreferrer';
      body.append(link); offset = match.index + match[0].length;
    }
    body.append(document.createTextNode(reply.body.slice(offset)));
    const actions = document.createElement('div');
    actions.className = 'reply-actions';
    const date = document.createElement('small');
    date.textContent = reply.created_at.slice(0, 10);
    const action = document.createElement('button');
    action.type = 'button'; action.className = 'reply-to'; action.textContent = 'Reply';
    action.dataset.replyTo = reply.author; action.dataset.replyId = reply.id;
    action.setAttribute('aria-label', 'Reply to ' + reply.author);
    actions.append(date, action); article.append(byline, body, actions);
    return article;
  }
  function renderReplies(data) {
    if (!list || !data.thread || !Array.isArray(data.replies)) return;
    const nextSnapshot = JSON.stringify(data.replies);
    if (nextSnapshot !== snapshot) {
      const nodes = data.replies.map(replyElement);
      if (!nodes.length) {
        const empty = document.createElement('p');
        empty.className = 'muted'; empty.textContent = 'A useful answer could start with you.';
        nodes.push(empty);
      }
      list.replaceChildren(...nodes); snapshot = nextSnapshot;
    }
    const count = data.thread.reply_count ?? data.replies.length;
    if (heading) heading.textContent = count + (count === 1 ? ' reply' : ' replies');
    const note = document.getElementById('reply-window');
    if (note) note.textContent = count > 100 ? 'Showing the latest 100 replies.' : '';
  }
  function scheduleRefresh() {
    clearTimeout(timer);
    if (!stopped) timer = setTimeout(async () => {
      if (!document.hidden) await refreshReplies();
      scheduleRefresh();
    }, Math.min(120000, 20000 * 2 ** failures));
  }
  async function refreshReplies() {
    if (stopped || !list) return;
    const current = ++generation;
    refreshing?.abort(); refreshing = new AbortController();
    try {
      const response = await fetch('/api/community/threads?id=' + encodeURIComponent(form.dataset.thread), {
        cache: 'no-store', signal: AbortSignal.any([refreshing.signal, AbortSignal.timeout(15000)]),
      });
      if (current !== generation || stopped) return;
      if (response.status === 404) {
        unavailable = true; updateButton();
        status.textContent = 'This conversation is no longer available. Your draft is still here.';
        return;
      }
      if (!response.ok) throw Error();
      const data = await response.json();
      if (current !== generation || stopped) return;
      renderReplies(data); failures = 0; unavailable = false; updateButton();
    } catch (error) {
      if (error.name !== 'AbortError' && current === generation) failures = Math.min(failures + 1, 3);
    }
  }
  document.addEventListener('click', event => {
    const action = event.target.closest?.('[data-reply-to]');
    if (!action) return;
    const author = action.dataset.replyTo;
    if (target) { target.hidden = false; target.textContent = 'Replying to ' + author; }
    const prefix = /^@[a-z][a-z0-9_]{2,23}$/i.test(author) ? author + ' ' : author + ', ';
    if (!form.elements.body.value.startsWith(prefix)) form.elements.body.value = prefix + form.elements.body.value;
    form.scrollIntoView({ block: 'center' }); form.elements.body.focus();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { void refreshReplies(); scheduleRefresh(); }
  });
  window.addEventListener('pagehide', () => { stopped = true; clearTimeout(timer); refreshing?.abort(); });
  window.addEventListener('pageshow', () => { if (stopped) { stopped = false; void refreshReplies(); scheduleRefresh(); } });
  try {
    const response = await fetch('/api/public-config', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw Error();
    config = await response.json();
    if (!config.communityReady) throw Error();
    if (member || config.localTest) {
      updateButton(); status.textContent = 'Your reply appears immediately.';
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        widget = window.turnstile.render(document.getElementById('verification'), {
          sitekey: config.turnstileSiteKey, action: 'community', theme: 'light', size: 'flexible',
          callback: value => { token = value; updateButton(); status.textContent = lastResult || 'Your reply appears immediately.'; },
          'expired-callback': () => { token = ''; updateButton(); status.textContent = lastResult || 'Please verify again.'; },
          'error-callback': () => { token = ''; updateButton(); status.textContent = 'Verification is unavailable. Please reload to try again.'; },
        });
      };
      script.onerror = () => { status.textContent = 'Verification could not load. Please reload or contact the studio.'; };
      document.head.appendChild(script);
    }
  } catch {
    status.textContent = 'Replies are being prepared. Please contact the studio with your question.';
    return;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || unavailable) return;
    submitting = true; lastResult = ''; updateButton(); status.textContent = 'Posting…';
    const data = new FormData(form);
    try {
      const response = await fetch('/api/community/replies', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ threadId: form.dataset.thread, author: data.get('author'), body: data.get('body'), website: data.get('website'), challenge: token }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || 'Your reply could not be posted.');
      lastResult = result.message; status.textContent = lastResult; form.elements.body.value = '';
      if (target) target.hidden = true;
      if (list && result.reply && !document.getElementById('reply-' + result.reply.id)) {
        if (!list.querySelector('.reply')) list.replaceChildren();
        list.append(replyElement(result.reply));
        if (heading) { const count = list.querySelectorAll('.reply').length; heading.textContent = count + (count === 1 ? ' reply' : ' replies'); }
      }
      await refreshReplies(); scheduleRefresh();
    } catch (error) {
      lastResult = error.message || 'Please try again shortly.'; status.textContent = lastResult;
    } finally {
      submitting = false; token = '';
      if (widget !== undefined) window.turnstile.reset(widget);
      updateButton();
    }
  });
  void refreshReplies(); scheduleRefresh();
})();
