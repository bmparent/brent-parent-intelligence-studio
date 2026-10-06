import { useEffect, useId, useState, type FormEvent } from 'react';
import { post, usePublicConfig } from '../lib/platform';
import { Turnstile } from './Turnstile';

type Mode = 'signup' | 'signin' | 'reset' | 'email' | 'google-username';
export function PasswordField({ label = 'Password', value, onChange, current = false }: { label?: string; value: string; onChange: (value: string) => void; current?: boolean }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return <div className="ew-field"><label htmlFor={id}>{label}</label><span className="ew-password-field">
    <input id={id} aria-describedby={current ? undefined : id + '-help'} type={visible ? 'text' : 'password'} autoComplete={current ? 'current-password' : 'new-password'} value={value} onChange={e => onChange(e.target.value)} required minLength={current ? undefined : 15} maxLength={128} spellCheck={false} autoCapitalize="none" />
    <button type="button" aria-label={(visible ? 'Hide ' : 'Show ') + label.toLowerCase()} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button>
  </span>{!current && <small id={id + '-help'}>15–128 characters. A few memorable words work well.</small>}</div>;
}
export function AccountAccess({ onSuccess }: { onSuccess: () => void }) {
  const config = usePublicConfig();
  const [mode, setMode] = useState<Mode>('signup'), [email, setEmail] = useState(''), [name, setName] = useState(''), [password, setPassword] = useState('');
  const [kind, setKind] = useState('person'), [newsletter, setNewsletter] = useState(false), [verification, setVerification] = useState(''), [reset, setReset] = useState(0);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(''), [localLink, setLocalLink] = useState('');
  useEffect(() => {
    const oauth = new URLSearchParams(location.search).get('oauth');
    if (!oauth) return;
    queueMicrotask(() => {
      if (oauth === 'choose-username') setMode('google-username');
      if (oauth === 'error') setError('Google sign-in could not finish. Please try again.');
      if (oauth === 'collision') setError('These identities belong to different accounts. Sign in to the account you want to keep and link Google from Security.');
      if (oauth === 'link-required') { setMode('email'); setMessage('Confirm this email with an Eidos sign-in link, then link Google from Security. This protects accounts that use a non-Google email provider.'); }
      if (oauth === 'signup-required') { setMode('signup'); setMessage('Create an Eidos account with this email to confirm it, then link Google from Security. This protects addresses managed by a non-Google email provider.'); }
      history.replaceState(null, '', location.pathname);
    });
  }, []);
  function choose(next: Mode) { setMode(next); setPassword(''); setError(''); setMessage(''); setLocalLink(''); }
  async function google() {
    setBusy(true); setError('');
    try {
      const result = await post<{ authorizeUrl: string }>('/api/members/google', { action: 'start' });
      const url = new URL(result.authorizeUrl);
      if (url.origin !== 'https://accounts.google.com' || url.pathname !== '/o/oauth2/v2/auth') throw Error('Google sign-in could not start.');
      location.assign(url.href);
    } catch (e) { setError((e as Error).message); setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage(''); setLocalLink('');
    try {
      const usePassword = config?.passwordsReady && mode !== 'email';
      const endpoint = mode === 'google-username' ? '/api/members/google' : usePassword ? '/api/members/credentials' : '/api/members/auth';
      const action = mode === 'google-username' ? 'complete-signup' : mode === 'reset' ? 'request-reset' : mode === 'signin' ? (usePassword ? 'login' : 'signin') : mode === 'email' ? 'signin' : 'signup';
      const result = await post<{ message?: string; localVerificationUrl?: string; member?: unknown; ok?: boolean }>(endpoint, { action, email, identifier: email, username: name, password, kind, newsletter, challenge: verification, website: new FormData(event.currentTarget).get('website') });
      if ((mode === 'signin' && usePassword) || mode === 'google-username') { setPassword(''); onSuccess(); }
      else { setPassword(''); setMessage(result.message || 'Check your email.'); if (config?.localTest && result.localVerificationUrl) setLocalLink(result.localVerificationUrl); }
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); setVerification(''); setReset(n => n + 1); }
  }
  if (!config) return <p role="status">Loading sign-in options…</p>;
  const isPasswordLogin = mode === 'signin' && config.passwordsReady;
  const needsChallenge = mode !== 'google-username';
  return <div className="ew-account-access">
    <form className="ew-member-card ew-form-stack" onSubmit={submit} aria-busy={busy}>
      <p className="ew-eyebrow">Your Eidos Works account</p>
      <h2>{({ signup: 'Create account', signin: 'Sign in', reset: 'Reset your password', email: 'Sign in with an email link', 'google-username': 'Choose your username' })[mode]}</h2>
      {mode === 'google-username' ? <p>Google verified your email. Choose a public name to finish.</p> : <label className="ew-field">{isPasswordLogin ? 'Username or email' : 'Email'}
        <input type={isPasswordLogin ? 'text' : 'email'} autoComplete={isPasswordLogin ? 'username' : 'email'} value={email} onChange={e => setEmail(e.target.value)} required maxLength={260} autoCapitalize="none" spellCheck={false} />
      </label>}
      {(mode === 'signup' || mode === 'google-username') && <label className="ew-field">Username
        <input value={name} onChange={e => setName(e.target.value.toLowerCase())} required minLength={3} maxLength={24} pattern="[a-z][a-z0-9_]{2,23}" autoComplete="username" autoCapitalize="none" spellCheck={false} />
        <small>3–24 letters, numbers or underscores; start with a letter.</small>
      </label>}
      {config.passwordsReady && (mode === 'signup' || mode === 'signin') && <PasswordField value={password} onChange={setPassword} current={mode === 'signin'} />}
      {(mode === 'signup' || mode === 'google-username') && <details className="ew-account-options"><summary>Newsletter and account options</summary>
        {mode === 'signup' && <label className="ew-field">Account type<select value={kind} onChange={e => setKind(e.target.value)}><option value="person">Person</option><option value="agent">Agent managed by its operator</option></select></label>}
        <label className="ew-member-check"><input type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} /><span>Email me new Insights. Unsubscribe anytime.</span></label>
      </details>}
      <label className="ew-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {needsChallenge && <Turnstile action="member" onToken={setVerification} resetKey={reset} />}
      <button className="ew-button ew-button--primary" disabled={busy || !config.accountsReady || (needsChallenge && !config.localTest && !verification)}>
        {busy ? 'One moment…' : mode === 'signup' ? (config.passwordsReady ? 'Create account' : 'Email me a confirmation link') : mode === 'signin' ? (isPasswordLogin ? 'Sign in' : 'Email me a sign-in link') : mode === 'reset' ? 'Send reset link' : mode === 'google-username' ? 'Finish creating account' : 'Email me a sign-in link'}
      </button>
      {mode === 'signin' && config.passwordsReady && <button type="button" className="ew-account-text" onClick={() => choose('reset')}>Forgot password?</button>}
      {(mode === 'signup' || mode === 'signin') && <><div className="ew-account-or"><span>OR</span></div>
        <button type="button" className="ew-button ew-button--secondary ew-google-button" disabled={busy || !config.googleReady} onClick={() => void google()}>Continue with Google</button>
        {!config.googleReady && <small>Google sign-in is being connected.</small>}
      </>}
      {message && <p className="ew-notice" role="status">{message}</p>}
      {error && <p className="ew-notice ew-error" role="alert">{error}</p>}
      {localLink && <a href={localLink}>Local preview only: open the test account link</a>}
      {mode === 'signup' ? <p>Already have an account? <button type="button" className="ew-account-text" onClick={() => choose('signin')}>Sign in</button></p> : <p><button type="button" className="ew-account-text" onClick={() => choose('signup')}>Create an account</button> · <button type="button" className="ew-account-text" onClick={() => choose('signin')}>Back to sign in</button></p>}
      {mode !== 'email' && mode !== 'google-username' && <button type="button" className="ew-account-text" onClick={() => choose('email')}>Use an email sign-in link</button>}
      <small>By continuing, you agree to the <a href="/terms">terms</a> and <a href="/privacy">privacy policy</a>. Your email stays private.</small>
      {!config.accountsReady && <p role="status">Account sign-in is being connected. The free Playground and Insights archive remain available.</p>}
    </form>
  </div>;
}

export function ResetPasswordPage() {
  const config = usePublicConfig();
  const [email, setEmail] = useState(''), [verification, setVerification] = useState(''), [challengeReset, setChallengeReset] = useState(0), [localLink, setLocalLink] = useState('');
  const [token, setToken] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const readLink = () => {
      const value = new URLSearchParams(location.hash.slice(1)).get('token');
      if (!active || !value) return;
      setToken(value); setMessage(''); setError(''); setPassword('');
      history.replaceState(null, '', location.pathname);
    };
    queueMicrotask(readLink);
    window.addEventListener('hashchange', readLink);
    return () => { active = false; window.removeEventListener('hashchange', readLink); };
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await post<{ message: string; localVerificationUrl?: string }>('/api/members/credentials', token ? { action: 'reset', token, password } : { action: 'request-reset', email, challenge: verification }); setPassword(''); setToken(''); setMessage(result.message); if (config?.localTest && result.localVerificationUrl) setLocalLink(result.localVerificationUrl); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); setVerification(''); setChallengeReset(n => n + 1); }
  }
  return <section className="ew-members ew-shell"><form className="ew-member-card ew-member-confirm" onSubmit={submit} aria-busy={busy}>
    <p className="ew-eyebrow">Account security</p><h1>Choose a new password.</h1>
    {message ? <p role="status">{message}</p> : token ? <><p>This signs out all devices. Only continue if you requested the reset.</p><PasswordField value={password} onChange={setPassword} /><button className="ew-button ew-button--primary" disabled={busy}>{busy ? 'Updating…' : 'Reset password'}</button></> : <><p>We’ll email a secure link to set or reset your password.</p><label className="ew-field">Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={260} /></label><Turnstile action="member" onToken={setVerification} resetKey={challengeReset} /><button className="ew-button ew-button--primary" disabled={busy || !config?.passwordsReady || (!config?.localTest && !verification)}>{busy ? 'Sending…' : 'Send reset link'}</button></>}
    {localLink && <a href={localLink}>Local preview only: open the test reset link</a>}
    {error && <p role="alert">{error}</p>}<a href="/account">Back to sign in</a>
  </form></section>;
}
