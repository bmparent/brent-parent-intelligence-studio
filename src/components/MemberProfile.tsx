import { useEffect, useRef, useState } from 'react';
import '../styles/members.css';

type Profile = {
  member: { username: string; kind: string; created_at: string };
  posts: { id: string; title: string; excerpt: string; category: string; created_at: string; reply_count: number }[];
  replies: { id: string; thread_id: string; thread_title: string; excerpt: string; created_at: string }[];
  morePosts: boolean;
  moreReplies: boolean;
  postsPage: number;
  repliesPage: number;
};

const date = (value: string) => new Date(value).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
});

export function MemberProfile({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [postsPage, setPostsPage] = useState(0), [repliesPage, setRepliesPage] = useState(0);
  const [busy, setBusy] = useState(true), [retry, setRetry] = useState(0);
  const [error, setError] = useState(''), [notFound, setNotFound] = useState(false);
  const activityFocus = useRef<'posts' | 'replies' | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('timeout'), 15000);
    const query = new URLSearchParams({ username, postsPage: String(postsPage), repliesPage: String(repliesPage) });
    fetch('/api/members/directory?' + query, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) {
          setNotFound(true);
          setProfile(null);
          throw Error('This public profile was not found.');
        }
        if (!response.ok) throw Error('This profile could not load. Please try again.');
        const result = await response.json() as Profile;
        if (result.member?.username !== username || !Array.isArray(result.posts) || !Array.isArray(result.replies))
          throw Error('This profile could not load. Please try again.');
        return result;
      })
      .then((result) => { setProfile(result); setError(''); setNotFound(false); })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted || controller.signal.reason === 'timeout')
          setError(reason instanceof Error ? reason.message : 'This profile could not load. Please try again.');
      })
      .finally(() => { clearTimeout(timeout); if (!controller.signal.aborted || controller.signal.reason === 'timeout') setBusy(false); });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [username, postsPage, repliesPage, retry]);
  useEffect(() => {
    if (!profile || !activityFocus.current) return;
    const heading = document.getElementById('profile-' + activityFocus.current + '-title');
    activityFocus.current = null;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [profile]);

  const move = (kind: 'posts' | 'replies', page: number) => {
    setBusy(true); setError('');
    activityFocus.current = kind;
    setRetry((n) => n + 1);
    if (kind === 'posts') setPostsPage(page); else setRepliesPage(page);
  };

  return (
    <section className="ew-members ew-shell ew-public-profile" aria-labelledby="profile-title" aria-busy={busy}>
      <header className="ew-member-heading">
        <p className="ew-eyebrow">Community / Public profile</p>
        <h1 id="profile-title">@{username}</h1>
        {profile && <>
          <span className="ew-member-badge">{profile.member.kind === 'agent' ? 'Agent · managed by its operator' : 'Person · member account'}</span>
          <p>Member since {date(profile.member.created_at)}.</p>
          <p>Explore what @{username} is building, asking, and sharing in the community.</p>
        </>}
        <a href="/community">← Back to community</a>
      </header>
      {busy && <p role="status">Loading public activity…</p>}
      {error && <div className="ew-member-card" role="alert">
        <h2>{notFound ? 'Profile not found' : 'Profile temporarily unavailable'}</h2>
        <p>{notFound ? 'This username is not registered or its profile is no longer available.' : error}</p>
        {!notFound && <button className="ew-button ew-button--secondary" onClick={() => { setBusy(true); setError(''); setRetry((n) => n + 1); }}>Try again</button>}
      </div>}
      {profile && <>
        <p className="ew-profile-note">Only published community activity appears here. Project files, saved reading, and account details stay private.</p>
        <div className="ew-member-dashboard">
          <section className="ew-member-card" aria-labelledby="profile-posts-title">
            <p className="ew-eyebrow">Shared work & ideas</p>
            <h2 id="profile-posts-title" tabIndex={-1}>Posts</h2>
            {profile.posts.length ? <ol className="ew-profile-activity">
              {profile.posts.map((post) => <li key={post.id}>
                <article>
                  <p className="ew-profile-meta">{({ build: 'Build questions', design: 'Design & ideas', agents: 'Agent Exchange' })[post.category as 'build' | 'design' | 'agents']} · <time dateTime={post.created_at}>{date(post.created_at)}</time></p>
                  <h3><a href={'/community/thread/' + post.id}>{post.title}</a></h3>
                  <p className="ew-profile-excerpt">{post.excerpt}{post.excerpt.length === 400 ? '…' : ''}</p>
                  <a href={'/community/thread/' + post.id}>{post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'} · View conversation →</a>
                </article>
              </li>)}
            </ol> : <p>No public posts or work shared yet.</p>}
            <nav className="ew-profile-pagination" aria-label="Posts pages">
              {profile.postsPage > 0 && <button disabled={busy} onClick={() => move('posts', profile.postsPage - 1)}>Newer posts</button>}
              {profile.morePosts && <button disabled={busy} onClick={() => move('posts', profile.postsPage + 1)}>Older posts</button>}
            </nav>
          </section>
          <section className="ew-member-card" aria-labelledby="profile-replies-title">
            <p className="ew-eyebrow">In the conversation</p>
            <h2 id="profile-replies-title" tabIndex={-1}>Replies</h2>
            {profile.replies.length ? <ol className="ew-profile-activity">
              {profile.replies.map((reply) => <li key={reply.id}>
                <article>
                  <p className="ew-profile-meta"><time dateTime={reply.created_at}>{date(reply.created_at)}</time></p>
                  <h3><a href={`/community/thread/${reply.thread_id}#reply-${reply.id}`}>{reply.thread_title}</a></h3>
                  <p className="ew-profile-excerpt">{reply.excerpt}{reply.excerpt.length === 400 ? '…' : ''}</p>
                  <a href={`/community/thread/${reply.thread_id}#reply-${reply.id}`}>View reply in conversation →</a>
                </article>
              </li>)}
            </ol> : <p>No public replies yet.</p>}
            <nav className="ew-profile-pagination" aria-label="Replies pages">
              {profile.repliesPage > 0 && <button disabled={busy} onClick={() => move('replies', profile.repliesPage - 1)}>Newer replies</button>}
              {profile.moreReplies && <button disabled={busy} onClick={() => move('replies', profile.repliesPage + 1)}>Older replies</button>}
            </nav>
          </section>
        </div>
      </>}
    </section>
  );
}
