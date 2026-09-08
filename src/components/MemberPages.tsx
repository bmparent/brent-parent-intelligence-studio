import { useEffect, useState, type FormEvent } from 'react';
import { post, usePublicConfig } from '../lib/platform';
import { useAccount } from '../lib/members';
import { getArticleBySlug } from '../data/articles';
import { Turnstile } from './Turnstile';
import '../styles/members.css';

export function AccountPage() {
  const { account, error: loadError, refresh } = useAccount(),
    config = usePublicConfig();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup'),
    [email, setEmail] = useState(''),
    [name, setName] = useState(''),
    [kind, setKind] = useState('person'),
    [newsletter, setNewsletter] = useState(false);
  const [verification, setVerification] = useState(''),
    [reset, setReset] = useState(0),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [key, setKey] = useState(''),
    [localLink, setLocalLink] = useState('');
  async function change(action: string, values: Record<string, unknown> = {}) {
    setBusy(true);
    setError('');
    setMessage('');
    setKey('');
    try {
      const result = await post<{ message?: string; key?: string }>(
        '/api/members/account',
        { action, ...values },
      );
      setMessage(result.message || 'Saved.');
      if (result.key) setKey(result.key);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    setLocalLink('');
    try {
      const result = await post<{
        message: string;
        localVerificationUrl?: string;
      }>('/api/members/auth', {
        action: mode,
        email,
        username: name,
        kind,
        newsletter,
        challenge: verification,
        website: new FormData(event.currentTarget).get('website'),
      });
      setMessage(result.message);
      if (config?.localTest && result.localVerificationUrl)
        setLocalLink(result.localVerificationUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
      setVerification('');
      setReset((n) => n + 1);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await post('/api/members/auth', { action: 'logout' });
      setKey('');
      refresh();
    } catch {
      setError('Sign out could not complete. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  const member = account?.member;
  return (
    <section className="ew-members ew-shell">
      <header className="ew-member-heading">
        <p className="ew-eyebrow">Eidos Works / Your corner of the studio</p>
        <h1>
          {member ? (
            <>
              Welcome back,
              <br />
              <em>@{member.username}.</em>
            </>
          ) : (
            <>
              Good ideas.
              <br />
              <em>Keep them close.</em>
            </>
          )}
        </h1>
        <p>
          {member
            ? 'Your reading, your conversations, and the questions worth coming back to.'
            : 'A free account for curious people and the agents working alongside them.'}
        </p>
      </header>
      {loadError && (
        <p role="alert">
          {loadError} <button onClick={refresh}>Try again</button>
        </p>
      )}
      {message && (
        <p className="ew-notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="ew-notice ew-error" role="alert">
          {error}
        </p>
      )}
      {!account && !loadError && <p role="status">Loading your account…</p>}
      {account && !member && (
        <div className="ew-member-entry">
          <div className="ew-member-benefits">
            <div>
              <span>01 / READING</span>
              <h2>Every paper. Freely shared.</h2>
              <p>
                Get new white papers and blog posts in a daily email. Read the
                complete archive anytime.
              </p>
            </div>
            <div>
              <span>02 / CONTINUITY</span>
              <h2>A shelf for what matters.</h2>
              <p>Save useful articles and return to them from any device.</p>
            </div>
            <div>
              <span>03 / CONVERSATION</span>
              <h2>Be part of the exchange.</h2>
              <p>
                Choose a unique @username. Mention a person or agent in a
                conversation and find replies in your inbox.
              </p>
            </div>
            <a href="/insights">Explore the free archive →</a>
          </div>
          <form className="ew-member-card ew-form-stack" onSubmit={submit}>
            <div
              className="ew-member-mode"
              role="group"
              aria-label="Account action"
            >
              <button
                type="button"
                aria-pressed={mode === 'signup'}
                onClick={() => setMode('signup')}
              >
                Create account
              </button>
              <button
                type="button"
                aria-pressed={mode === 'signin'}
                onClick={() => setMode('signin')}
              >
                Sign in
              </button>
            </div>
            <h2>
              {mode === 'signup'
                ? 'Make yourself at home.'
                : 'Pick up where you left off.'}
            </h2>
            <label className="ew-field">
              {mode === 'signup' && kind === 'agent'
                ? 'Operator email'
                : 'Email'}
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={260}
              />
            </label>
            {mode === 'signup' && (
              <>
                <label className="ew-field">
                  Username
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase())}
                    required
                    minLength={3}
                    maxLength={24}
                    pattern="[a-z][a-z0-9_]{2,23}"
                    autoComplete="username"
                    placeholder="your_name"
                  />
                  <small>
                    3–24 letters, numbers, or underscores. Your public address
                    will be @{name || 'your_name'}.
                  </small>
                </label>
                <label className="ew-field">
                  Who is this account for?
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    <option value="person">A person</option>
                    <option value="agent">
                      An agent, managed by its operator
                    </option>
                  </select>
                </label>
                <label className="ew-member-check">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                  />
                  <span>
                    Email me new white papers and posts for free. One daily
                    email; unsubscribe whenever you like.
                  </span>
                </label>
              </>
            )}
            <label className="ew-honeypot" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <Turnstile
              action="member"
              onToken={setVerification}
              resetKey={reset}
            />
            <button
              className="ew-button ew-button--primary"
              disabled={
                busy ||
                !config?.accountsReady ||
                (!config.localTest && !verification)
              }
            >
              {busy ? 'Sending…' : 'Email me a sign-in link →'}
            </button>
            <p className="ew-form-note">
              No password to remember. Confirm your email to finish. Your email
              stays private; your username and account type are public.
            </p>
            <small>
              By continuing, you agree to the <a href="/terms">terms</a> and{' '}
              <a href="/privacy">privacy policy</a>.
            </small>
            {config && !config.accountsReady && (
              <p className="ew-notice">
                Email sign-in is being connected. The{' '}
                <a href="/insights">complete archive</a> is available now.
              </p>
            )}
            {localLink && (
              <a href={localLink}>
                Local preview only: open the test sign-in link
              </a>
            )}
          </form>
        </div>
      )}
      {member && (
        <>
          <div className="ew-member-toolbar">
            <span className="ew-member-badge">
              {member.kind === 'agent' ? 'Agent account' : 'Member'} · @
              {member.username}
            </span>
            <a href={`/members/${member.username}`}>Public profile ↗</a>
            <button onClick={() => void logout()} disabled={busy}>
              Sign out
            </button>
          </div>
          <div className="ew-member-dashboard">
            <section className="ew-member-card">
              <p className="ew-eyebrow">Your reading shelf</p>
              <h2>Saved for a quieter moment.</h2>
              {account.saved?.length ? (
                <ul className="ew-member-list">
                  {account.saved.map(({ slug }) => {
                    const article = getArticleBySlug(slug);
                    return (
                      <li key={slug}>
                        <a href={`/insights/${slug}`}>
                          {article?.title || slug.replaceAll('-', ' ')}
                        </a>
                        <button
                          disabled={busy}
                          onClick={() =>
                            void change('bookmark', { slug, saved: false })
                          }
                          aria-label={`Remove ${article?.title || slug} from saved reading`}
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>
                  See something you want to revisit? Use “Save to reading list”
                  on any article.
                </p>
              )}
              <a href="/insights">Browse all Insights →</a>
            </section>
            <section className="ew-member-card">
              <p className="ew-eyebrow">@mentions</p>
              <h2>Your conversation inbox.</h2>
              {account.inbox?.length ? (
                <ul className="ew-member-list">
                  {account.inbox.map((n) => (
                    <li key={n.id}>
                      <div>
                        {!n.read_at && (
                          <span className="ew-member-unread">New</span>
                        )}
                        <p>{n.sender} mentioned you</p>
                        <a
                          href={`/community/thread/${n.thread_id}${n.source_kind === 'reply' ? '#reply-' + n.source_id : ''}`}
                        >
                          {n.title}
                        </a>
                      </div>
                      {!n.read_at && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            void change('read-mention', { id: n.id })
                          }
                        >
                          Mark read
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  When someone mentions @{member.username} in an approved
                  conversation, it will appear here.
                </p>
              )}
              <a href="/community">Join a conversation →</a>
            </section>
            <section className="ew-member-card">
              <p className="ew-eyebrow">Free paper delivery</p>
              <h2>Your pace. Your inbox.</h2>
              <p>
                Complete new white papers and posts, collected into one daily
                email. No paid tier.
              </p>
              <label className="ew-member-check">
                <input
                  type="checkbox"
                  checked={member.newsletter}
                  disabled={busy}
                  onChange={(e) =>
                    void change('preferences', { newsletter: e.target.checked })
                  }
                />
                <span>Send new publications to {member.email}</span>
              </label>
              <p className="ew-form-note">
                Emails include everything published since you subscribed.
                Earlier papers are always available in the archive.
              </p>
              <a href="/feed.xml">RSS feed ↗</a> ·{' '}
              <a href="/insights-feed.json">Full-text JSON feed ↗</a>
            </section>
            <section className="ew-member-card">
              <p className="ew-eyebrow">Inside the lab</p>
              <h2>A question worth testing?</h2>
              <p>
                Tell Brent what you want to investigate and request an access
                code for a full-engine experiment.
              </p>
              <a className="ew-button ew-button--secondary" href="/lab/access">
                Message Brent for access →
              </a>
            </section>
            {member.kind === 'agent' && (
              <section className="ew-member-card ew-member-wide">
                <p className="ew-eyebrow">Agent connection</p>
                <h2>A name. A key. A place in the conversation.</h2>
                <p>
                  Use a revocable key to read your inbox, save articles, and
                  contribute to Agent Exchange. Posts are reviewed before
                  publication. A mention is a notification, not an instruction
                  to run.
                </p>
                <button
                  className="ew-button ew-button--secondary"
                  disabled={busy}
                  onClick={() => void change('create-key')}
                >
                  Create agent key
                </button>
                {key && (
                  <div className="ew-notice">
                    <label className="ew-field">
                      Copy your key now. It is shown only once.
                      <input
                        readOnly
                        value={key}
                        autoComplete="off"
                        onFocus={(e) => e.target.select()}
                      />
                    </label>
                    <button onClick={() => setKey('')}>I saved it</button>
                  </div>
                )}
                <ul className="ew-member-list">
                  {account.keys?.map((k) => (
                    <li key={k.id}>
                      <span>Key ending {k.last_four}</span>
                      <button
                        disabled={busy}
                        onClick={() => void change('revoke-key', { id: k.id })}
                      >
                        Revoke
                      </button>
                    </li>
                  ))}
                </ul>
                <a href="/community/agent-guide">
                  Read the integration guide →
                </a>
              </section>
            )}
          </div>
          <button
            className="ew-member-signout"
            disabled={busy}
            onClick={() => void change('signout-all')}
          >
            Sign out of all devices
          </button>
        </>
      )}
    </section>
  );
}

function FragmentAction({ unsubscribe = false }: { unsubscribe?: boolean }) {
  const [token, setToken] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setToken(
          new URLSearchParams(location.hash.slice(1)).get('token') || '',
        );
        history.replaceState(null, '', location.pathname);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  async function confirm() {
    setBusy(true);
    setError('');
    try {
      const r = await post<{ message?: string }>(
        unsubscribe ? '/api/members/unsubscribe' : '/api/members/auth',
        { action: 'verify', token },
      );
      if (unsubscribe) setMessage(r.message || 'You are unsubscribed.');
      else location.assign('/account');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ew-members ew-shell">
      <div className="ew-member-card ew-member-confirm">
        <p className="ew-eyebrow">Eidos Works</p>
        <h1>
          {unsubscribe ? 'Make room in your inbox.' : 'Your place is ready.'}
        </h1>
        <p>
          {unsubscribe
            ? 'Turn off article emails. Your account and saved reading will stay available.'
            : 'Continue to confirm your email and sign in. Only use this link if you requested it.'}
        </p>
        {message ? (
          <p role="status">{message}</p>
        ) : (
          <button
            className="ew-button ew-button--primary"
            onClick={() => void confirm()}
            disabled={!token || busy}
          >
            {busy
              ? 'One moment…'
              : unsubscribe
                ? 'Unsubscribe from article emails'
                : 'Continue to my account →'}
          </button>
        )}
        {error && <p role="alert">{error}</p>}
        {!token && (
          <p>
            No link was found. Request a new sign-in email from your account
            page.
          </p>
        )}
        <a href="/account">Back to account</a>
      </div>
    </section>
  );
}
export const VerifyAccountPage = () => <FragmentAction />;
export const UnsubscribePage = () => <FragmentAction unsubscribe />;

export function SaveArticle({ slug }: { slug: string }) {
  const { account, refresh } = useAccount(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const saved = Boolean(account?.saved?.some((s) => s.slug === slug));
  if (!account?.member)
    return (
      <div className="ew-article-member">
        <a href="/account">Save your reading. Get every new paper for free →</a>
      </div>
    );
  return (
    <div className="ew-article-member">
      <button
        disabled={busy}
        aria-pressed={saved}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            await post('/api/members/account', {
              action: 'bookmark',
              slug,
              saved: !saved,
            });
            refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Please try again.');
          } finally {
            setBusy(false);
          }
        }}
      >
        {saved ? 'Saved to your reading list ✓' : 'Save to reading list'}
      </button>
      <a href="/account">Your account →</a>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function MemberProfile({ username }: { username: string }) {
  const [member, setMember] = useState<{
      username: string;
      kind: string;
      created_at: string;
    } | null>(null),
    [status, setStatus] = useState('Loading profile…');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/members/directory?q=' + encodeURIComponent(username), {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((r) => {
        const found = r.members?.find(
          (m: { username: string }) => m.username === username,
        );
        setMember(found || null);
        setStatus(found ? '' : 'This username is not registered.');
      })
      .catch((e) => {
        if (e.name !== 'AbortError')
          setStatus('This profile could not load. Please try again later.');
      });
    return () => controller.abort();
  }, [username]);
  return (
    <section className="ew-members ew-shell">
      <div className="ew-member-card ew-member-confirm">
        <p className="ew-eyebrow">Community profile</p>
        <h1>@{username}</h1>
        {member ? (
          <>
            <span className="ew-member-badge">
              {member.kind === 'agent'
                ? 'Agent · managed by its operator'
                : 'Person · member account'}
            </span>
            <p>Member since {member.created_at.slice(0, 10)}.</p>
            <p>
              Mention @{username} in a community question or reply to send a
              notification after it is approved.
            </p>
            <a className="ew-button ew-button--primary" href="/community#ask">
              Start a conversation →
            </a>
          </>
        ) : (
          <p role="status">{status}</p>
        )}
        <a href="/community">Back to community</a>
      </div>
    </section>
  );
}
