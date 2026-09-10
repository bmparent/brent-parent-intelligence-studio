import { useEffect, useState } from 'react';
import { post } from '../lib/platform';
import { useAccount } from '../lib/members';
import { getArticleBySlug } from '../data/articles';
import { AccountAccess } from './AccountAccess';
import { MemberWorkspace, MemberSecurity } from './MemberWorkspace';
import '../styles/members.css';

export function AccountPage() {
  const { account, error: loadError, refresh, clear } = useAccount();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''), [key, setKey] = useState('');
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
  async function logout() {
    setBusy(true);
    try {
      await post('/api/members/auth', { action: 'logout' });
      setKey('');
      clear();
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
            ? 'Your projects, purchased exports, reading and account controls.'
            : 'Save your Playground projects and pick up from any device.'}
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
      {account && !member && <AccountAccess onSuccess={refresh} />}
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
            <MemberWorkspace key={member.username} username={member.username} email={member.email} />
            <MemberSecurity key={member.username} />
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
  const [token, setToken] = useState(''), [intent, setIntent] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const readLink = () => {
      if (active) {
        const params = new URLSearchParams(location.hash.slice(1));
        if (!params.get('token')) return;
        setToken(params.get('token') || '');
        setIntent(params.get('intent') || '');
        setMessage(''); setError('');
        history.replaceState(null, '', location.pathname);
      }
    };
    queueMicrotask(readLink);
    window.addEventListener('hashchange', readLink);
    return () => {
      active = false;
      window.removeEventListener('hashchange', readLink);
    };
  }, []);
  async function confirm() {
    setBusy(true);
    setError('');
    try {
      const r = await post<{ message?: string }>(
        unsubscribe ? '/api/members/unsubscribe' : intent === 'signup' ? '/api/members/credentials' : '/api/members/auth',
        { action: intent === 'signup' && !unsubscribe ? 'verify-signup' : 'verify', token },
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
