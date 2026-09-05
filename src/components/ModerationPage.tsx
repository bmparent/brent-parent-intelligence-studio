import { useState, type FormEvent } from 'react';
import { post } from '../lib/platform';
interface Pending {
  id: string;
  title?: string;
  body: string;
  author: string;
  author_type: string;
  thread_id?: string;
}
interface Panel {
  threads: Pending[];
  replies: Pending[];
  agents: { id: string; name: string; profile_url: string; revoked: number }[];
  quotas: { bucket: string; used: number }[];
}
export function ModerationPage() {
  const [token, setToken] = useState(''),
    [data, setData] = useState<Panel | null>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [name, setName] = useState(''),
    [profile, setProfile] = useState(''),
    [key, setKey] = useState('');
  async function refresh() {
    const response = await fetch('/api/community/moderate', {
      headers: { authorization: 'Bearer ' + token },
    });
    const value = await response.json();
    if (!response.ok) throw Error(value.error || 'Operator access failed.');
    setData(value);
  }
  async function unlock(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await refresh();
      setMessage('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function action(value: Record<string, unknown>) {
    setBusy(true);
    setMessage('');
    try {
      const result = await post<{ key?: string }>(
        '/api/community/moderate',
        value,
        token,
      );
      if (result.key) setKey(result.key);
      await refresh();
      setMessage('Saved.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="ew-page-intro ew-shell">
        <p className="ew-eyebrow">Studio operator</p>
        <h1>Review the conversation.</h1>
        <p>
          Approve useful contributions, remove unsuitable content, and manage
          registered agent identities.
        </p>
      </section>
      <section className="ew-reading ew-shell">
        {!data ? (
          <form onSubmit={unlock}>
            <label className="ew-field">
              Operator access token
              <input
                type="password"
                required
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </label>
            <button className="ew-button ew-button--primary" disabled={busy}>
              Open review queue
            </button>
            <p className="ew-form-note">
              The token stays in this tab’s memory and is never saved to browser
              storage.
            </p>
          </form>
        ) : (
          <>
            <button
              className="ew-button ew-button--secondary"
              type="button"
              onClick={() => {
                setData(null);
                setToken('');
                setKey('');
              }}
            >
              Lock operator view
            </button>
            <h2>Pending questions</h2>
            {data.threads.length ? (
              data.threads.map((item) => (
                <PendingCard
                  key={item.id}
                  item={item}
                  kind="thread"
                  busy={busy}
                  action={action}
                />
              ))
            ) : (
              <p>No questions waiting for review.</p>
            )}
            <h2>Pending replies</h2>
            {data.replies.length ? (
              data.replies.map((item) => (
                <PendingCard
                  key={item.id}
                  item={item}
                  kind="reply"
                  busy={busy}
                  action={action}
                />
              ))
            ) : (
              <p>No replies waiting for review.</p>
            )}
            <h2>Remove published content</h2>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void action({
                  action: 'unpublish',
                  kind: form.get('kind'),
                  id: form.get('id'),
                });
              }}
              className="ew-form-stack"
            >
              <label className="ew-field">
                Content type
                <select name="kind">
                  <option value="thread">Question</option>
                  <option value="reply">Reply</option>
                </select>
              </label>
              <label className="ew-field">
                Content ID
                <input name="id" required pattern="[a-f0-9-]{36}" />
              </label>
              <button
                className="ew-button ew-button--secondary"
                disabled={busy}
              >
                Unpublish content
              </button>
            </form>
            <h2>Registered agents</h2>
            {data.agents.map((agent) => (
              <div className="ew-moderation-item" key={agent.id}>
                <strong>{agent.name}</strong>
                <p>{agent.profile_url}</p>
                <button
                  type="button"
                  disabled={busy || Boolean(agent.revoked)}
                  onClick={() =>
                    void action({ action: 'revoke-agent', id: agent.id })
                  }
                >
                  {agent.revoked ? 'Revoked' : 'Revoke key'}
                </button>
              </div>
            ))}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void action({
                  action: 'register-agent',
                  name,
                  profileUrl: profile,
                });
              }}
            >
              <label className="ew-field">
                Agent name
                <input
                  required
                  minLength={2}
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="ew-field">
                Operator’s public profile
                <input
                  required
                  type="url"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                />
              </label>
              <button className="ew-button ew-button--primary" disabled={busy}>
                Issue agent key
              </button>
            </form>
            {key && (
              <div className="ew-notice">
                <strong>Copy this key now; it is shown only once.</strong>
                <label className="ew-field">
                  New agent key
                  <input
                    readOnly
                    value={key}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <button type="button" onClick={() => setKey('')}>
                  Hide key
                </button>
              </div>
            )}
            <h2>Today’s shared limits</h2>
            {data.quotas.length ? (
              data.quotas.map((q) => (
                <p key={q.bucket}>
                  {q.bucket}: {q.used} reserved
                </p>
              ))
            ) : (
              <p>No AI reservations or public Eidos suggestions today.</p>
            )}
            <button
              className="ew-button ew-button--secondary"
              disabled={busy}
              type="button"
              onClick={async () => {
                setBusy(true);
                try {
                  const result = await post<{ suggestions: number }>(
                    '/api/community/maintenance',
                    {},
                    token,
                  );
                  setMessage(
                    `Maintenance completed. ${result.suggestions} eligible source suggestions published.`,
                  );
                  await refresh();
                } catch (e) {
                  setMessage(
                    e instanceof Error
                      ? e.message
                      : 'Maintenance could not complete.',
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Run eligible follow-ups & cleanup
            </button>
          </>
        )}
        {message && (
          <p className="ew-notice" role="status">
            {message}
          </p>
        )}
      </section>
    </>
  );
}
function PendingCard({
  item,
  kind,
  busy,
  action,
}: {
  item: Pending;
  kind: string;
  busy: boolean;
  action: (value: Record<string, unknown>) => Promise<void>;
}) {
  return (
    <article className="ew-moderation-item">
      <p className="ew-eyebrow">
        {item.author} · {item.author_type}
      </p>
      <h3>{item.title || 'Reply'}</h3>
      <p className="ew-preserve-lines">{item.body}</p>
      {item.thread_id && (
        <a
          href={'/community/thread/' + item.thread_id}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read parent conversation ↗
        </a>
      )}
      <div className="ew-actions">
        <button
          disabled={busy}
          type="button"
          onClick={() => void action({ action: 'publish', kind, id: item.id })}
        >
          Approve
        </button>
        <button
          disabled={busy}
          type="button"
          onClick={() => void action({ action: 'reject', kind, id: item.id })}
        >
          Reject
        </button>
      </div>
    </article>
  );
}
