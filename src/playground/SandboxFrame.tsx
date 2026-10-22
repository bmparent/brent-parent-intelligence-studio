import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

type Props = { markup: string | (() => string); channel?: string; title: string; className?: string; style?: CSSProperties };

/** The shell authorizes exact local script bytes without relaxing the app CSP. */
export const SandboxFrame = forwardRef<HTMLIFrameElement, Props>(function SandboxFrame({ markup, channel: suppliedChannel, ...props }, forwardedRef) {
  const session = useMemo(() => ({ markup, channel: crypto.randomUUID() }), [markup]);
  const channel = suppliedChannel || session.channel;
  return <FrameInstance {...props} ref={forwardedRef} key={channel} channel={channel} markup={markup}/>;
});

const FrameInstance = forwardRef<HTMLIFrameElement, Props & { channel: string }>(function FrameInstance({ markup, channel, ...props }, forwardedRef) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const [attempt, setAttempt] = useState(0), [status, setStatus] = useState('loading');
  const loads = useRef(0);
  const attach = useCallback((element: HTMLIFrameElement | null) => {
    frame.current = element;
    if (typeof forwardedRef === 'function') forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  }, [forwardedRef]);
  const open = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: 'playground-frame-open', channel, html: typeof markup === 'function' ? markup() : markup }, '*');
  }, [channel, markup]);
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.channel !== channel) return;
      if (event.data.type === 'playground-frame-ready') open();
      if (event.data.type === 'playground-frame-loaded') setStatus('ready');
      if (event.data.type === 'playground-frame-error') setStatus('error');
    };
    window.addEventListener('message', message);
    return () => window.removeEventListener('message', message);
  }, [channel, open]);
  useEffect(() => {
    const timer = setTimeout(() => setStatus(value => value === 'loading' ? 'error' : value), 10000);
    return () => clearTimeout(timer);
  }, [channel, attempt]);
  return <>
    <iframe {...props} ref={attach} key={`${channel}:${attempt}`} sandbox="allow-scripts" src={`/playground-frame#${channel}`} referrerPolicy="no-referrer" style={{ ...props.style, visibility: status === 'ready' ? 'visible' : 'hidden' }} onLoad={() => {
      if (loads.current++ > 0) setStatus('error');
      else open();
    }}/>
    {status !== 'ready' && <div className="pg-frame-status" role={status === 'error' ? 'alert' : 'status'}>
      {status === 'error' ? <><p>The page preview could not open. Your project and Undo history are still in the editor.</p><button type="button" onClick={() => { loads.current = 0; setStatus('loading'); setAttempt(value => value + 1); }}>Reload page preview</button></> : <p>Opening page preview…</p>}
    </div>}
  </>;
});
