import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import './walkthrough.css';

const steps = [
  { label: 'Select', title: 'Start with one element.', copy: 'Click a headline on the canvas. On a small screen, open Edit selection to see its controls.' },
  { label: 'Write', title: 'Make the words yours.', copy: 'Change Text in the selection panel. The page updates as you write.' },
  { label: 'Arrange', title: 'Give it a new place.', copy: 'Select the button, then choose Arrange → Move earlier. Elements stay in responsive page flow.' },
  { label: 'Space', title: 'Let the layout breathe.', copy: 'Select the parent container using Inside. Choose Airy under Space between elements.' },
  { label: 'Mobile', title: 'See the smaller picture.', copy: 'Choose Mobile in the toolbar. Desktop spacing is inherited unless you add a mobile override.' },
  { label: 'Undo', title: 'You can always step back.', copy: 'Undo reverses the last edit. Here it restores Balanced spacing and keeps your other changes.' },
];
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
function motionPreference() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

/** A self-contained illustration: intentionally accepts no project or edit callback. */
export function PlaygroundWalkthrough({ onDone }: { onDone?: () => void }) {
  const titleId = useId();
  const reduced = useSyncExternalStore(subscribeMotion, motionPreference, () => true);
  const [step, setStep] = useState(0), [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || reduced || !visible || step === steps.length - 1) return;
    const timer = window.setTimeout(() => setStep(value => value + 1), 3400);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, visible, step]);
  const active = steps[step], mobile = step >= 4, airy = step === 3 || step === 4;
  const isPlaying = playing && !reduced && step < steps.length - 1;
  function choose(index: number) { setPlaying(false); setStep(index); }
  function play() { setVisible(true); if (step === steps.length - 1) setStep(0); setPlaying(!isPlaying); }
  return <section ref={root} className="pg-walkthrough" aria-labelledby={titleId} data-step={step} data-playing={isPlaying} data-visible={visible}>
    <div className="pg-walkthrough-intro"><div><span className="pg-walkthrough-kicker">A little tour. A lot of possibility.</span><h2 id={titleId}>From a starting point<br />to your point of view.</h2></div><p>See how a few small edits change a page.<br /><span>Demo only · your project stays untouched</span></p></div>
    <div className="pg-walkthrough-stage" aria-hidden="true">
      <div className="pg-walkthrough-orbit" />
      <div className="pg-walkthrough-window">
        <div className="pg-walkthrough-bar"><span className="pg-walkthrough-brand">eidos <b>playground</b></span><span className={step === 5 ? 'is-lit' : ''}>↶ Undo</span><span className={mobile ? 'is-lit' : ''}>{mobile ? '▯ Mobile' : '▣ Desktop'}</span></div>
        <div className="pg-walkthrough-editor">
          <div className="pg-walkthrough-canvas" data-mobile={mobile}>
            <div className="pg-walkthrough-page" data-airy={airy} data-moved={step >= 2}>
              <div className="pg-walkthrough-nav">FORM & FIELD <span>Studio&nbsp; / &nbsp;Contact</span></div>
              <div className="pg-walkthrough-art"><span /><i /><b /></div>
              <div className={`pg-walkthrough-content ${step === 3 ? 'is-selected' : ''}`}>
                <small>INDEPENDENT DESIGN STUDIO</small>
                <div className={`pg-walkthrough-headline ${step < 2 ? 'is-selected' : ''}`}>{step === 0 ? <>A new<br />perspective.</> : <>Good ideas.<br />Made tangible.</>}</div>
                <div className="pg-walkthrough-description">Thoughtful spaces.<br />Everyday possibilities.</div>
                <div className={`pg-walkthrough-cta ${step === 2 ? 'is-selected' : ''}`}>Explore our work <span>↗</span></div>
              </div>
            </div>
          </div>
          <div className="pg-walkthrough-inspector"><small>EDIT SELECTION</small><strong>{step < 2 ? 'Headline' : step === 2 ? 'Button' : 'Hero content'}</strong>
            {step < 2 ? <><span>Text</span><div className={`pg-walkthrough-field ${step === 1 ? 'is-lit' : ''}`}>{step === 0 ? 'A new perspective.' : 'Good ideas. Made tangible.'}</div><span>Arrange</span><div className="pg-walkthrough-field">Inside Hero content</div></> : step === 2 ? <><span>Arrange</span><div className="pg-walkthrough-field">Inside Hero content</div><div className="pg-walkthrough-field is-lit">↑ Move earlier</div><div className="pg-walkthrough-field">↓ Move later</div></> : <><span>Layout · {mobile ? 'Mobile' : 'Desktop'}</span><span>Space between elements</span><div className={`pg-walkthrough-field ${!airy ? 'is-lit' : ''}`}>Balanced <small>24 px</small></div><div className={`pg-walkthrough-field ${airy ? 'is-lit' : ''}`}>Airy <small>48 px</small></div><small>{mobile ? 'Inherited from desktop' : 'Mobile inherits these settings'}</small></>}
          </div>
        </div>
        <svg className="pg-walkthrough-cursor" width="25" height="30" viewBox="0 0 25 30"><path d="M2 2 22 16 12 18 8 27Z" fill="#172d30" stroke="white" strokeWidth="2"/></svg>
      </div>
      <span className="pg-walkthrough-result" key={step}>{['Headline selected', 'Your words, on the page', 'Button moved earlier', 'A little more breathing room', 'The same page, on mobile', 'Last edit restored'][step]}</span>
    </div>
    <div className="pg-walkthrough-bottom"><div className="pg-walkthrough-caption" aria-live={isPlaying ? 'off' : 'polite'}><span>0{step + 1} / 06</span><h3>{active.title}</h3><p>{active.copy}</p></div><div className="pg-walkthrough-controls"><div className="pg-walkthrough-steps" aria-label="Tutorial steps">{steps.map((item, index) => <button type="button" key={item.label} aria-label={`Step ${index + 1}: ${item.label}`} aria-pressed={step === index} onClick={() => choose(index)}>{item.label}</button>)}</div><div className="pg-walkthrough-playback">{!reduced && <button type="button" onClick={play}>{isPlaying ? 'Pause' : step === steps.length - 1 ? 'Replay tour' : 'Play tour'}<span aria-hidden="true">{isPlaying ? ' Ⅱ' : ' ▷'}</span></button>}<button type="button" disabled={step === 0} onClick={() => choose(step - 1)}>Back</button><button type="button" disabled={step === steps.length - 1} onClick={() => choose(step + 1)}>Next</button>{onDone && <button type="button" className="pg-walkthrough-done" onClick={onDone}>Try it yourself ↗</button>}</div>{reduced && <small>Reduced motion is on. Explore at your own pace.</small>}</div></div>
  </section>;
}

export function PlaygroundTourButton() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  return <><button type="button" className="pg-button-secondary pg-tour-launch" onClick={() => setOpen(true)}>How it works <span aria-hidden="true">▷</span></button>{typeof document !== 'undefined' && createPortal(<dialog ref={dialog} className="pg-walkthrough-dialog" aria-label="How Playground works" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}><button type="button" className="pg-walkthrough-close" aria-label="Close Playground tour" onClick={() => setOpen(false)}>×</button>{open && <PlaygroundWalkthrough onDone={() => setOpen(false)} />}</dialog>, document.body)}</>;
}
