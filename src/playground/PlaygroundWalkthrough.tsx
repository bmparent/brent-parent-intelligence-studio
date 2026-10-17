import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import './walkthrough.css';

const steps = [
  { label: 'Start', title: 'Begin with a real design.', copy: 'Choose a starter, add your details or skip them, and open your editable page.', result: 'Your starting point is ready' },
  { label: 'Select', title: 'Choose one thing to change.', copy: 'Click the headline. On a small screen, open Edit selection to find its controls.', result: 'The headline is selected' },
  { label: 'Write', title: 'Put it in your own words.', copy: 'Edit Text in the selection panel. Your words appear in the page.', result: 'Your words, in place' },
  { label: 'Arrange', title: 'Move the action closer.', copy: 'Select the button. Under Arrange, choose Move earlier to move it above the description.', result: 'Same button. A clearer position.' },
  { label: 'Space', title: 'Give the elements room.', copy: 'Choose the parent beside Inside, then Airy under Space between elements.', result: 'The whole group has more breathing room' },
  { label: 'Mobile', title: 'Check the smaller screen.', copy: 'Choose Mobile. The page responds automatically; mobile overrides let you fine-tune it.', result: 'One page, a smaller canvas' },
  { label: 'Undo', title: 'Try things without worry.', copy: 'Undo reverses the last edit. Here, it restores the previous spacing and keeps your words.', result: 'Spacing restored. Other edits kept.' },
  { label: 'Save', title: 'Keep your place.', copy: 'Your project saves in this browser. Use Project → Download project JSON for an editable backup.', result: 'Saved on this device' },
  { label: 'Finish', title: 'Review, then take it with you.', copy: 'Finish → Prepare current draft. Check the frozen version, approve it, then download your page package.', result: 'Website files + editable project JSON' },
];
const phaseDurations = [900, 1100, 350, 4200];
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}
function motionPreference() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

/** The tutorial has no document, storage, network, or editor-operation access. */
export function PlaygroundWalkthrough({ onDone }: { onDone?: () => void }) {
  const titleId = useId();
  const reduced = useSyncExternalStore(subscribeMotion, motionPreference, () => true);
  const [frame, setFrame] = useState({ step: 0, phase: 0 });
  const [playing, setPlaying] = useState(true), [visible, setVisible] = useState(true);
  const root = useRef<HTMLElement>(null), windowRef = useRef<HTMLDivElement>(null), cursor = useRef<HTMLDivElement>(null);
  const { step, phase } = frame, complete = step === steps.length - 1 && phase === 3;
  const isPlaying = playing && !reduced && !complete;
  // Manual navigation and reduced motion reveal the full result immediately.
  const result = phase >= 2 || reduced;
  const reached = (index: number) => step > index || (step === index && result);
  const mobile = reached(5), airy = reached(4) && !reached(6), written = reached(2), moved = reached(3);
  const selection = step < 1 || (step === 1 && phase === 0 && !reduced) ? '' : step < 3 ? 'headline' : step === 3 && phase === 0 ? 'headline' : step === 3 ? 'button' : step === 4 && phase === 0 ? 'button' : 'container';
  const panel = step >= 7 ? 'project' : selection === 'button' ? 'arrange' : selection === 'container' ? 'layout' : 'text';
  const starterOpen = step === 0 && !result, finishOpen = step === 8 && (phase >= 1 || reduced);
  const target = step === 0 ? 'starter' : step === 1 ? 'headline' : step === 2 ? 'text' : step === 3 ? phase === 0 ? 'button' : 'earlier' : step === 4 ? phase === 0 ? 'parent' : 'airy' : step === 5 ? 'mobile' : step === 6 ? 'undo' : step === 7 ? 'save' : phase === 0 ? 'finish' : 'prepare';

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!isPlaying || !visible) return;
    const timer = window.setTimeout(() => setFrame(current => current.phase < 3 ? { ...current, phase: current.phase + 1 } : { step: current.step + 1, phase: 0 }), phaseDurations[phase]);
    return () => window.clearTimeout(timer);
  }, [isPlaying, visible, phase, step]);
  useLayoutEffect(() => {
    const scene = windowRef.current;
    function position() {
      const anchor = scene?.querySelector<HTMLElement>(`[data-tour-target="${target}"]`);
      if (!scene || !anchor || !cursor.current) return;
      // offset coordinates avoid perspective/viewport rounding and work at every width.
      const sceneBox = scene.getBoundingClientRect(), box = anchor.getBoundingClientRect();
      cursor.current.style.setProperty('--cursor-x', `${box.left - sceneBox.left + box.width * .62}px`);
      cursor.current.style.setProperty('--cursor-y', `${box.top - sceneBox.top + box.height * .55}px`);
    }
    position();
    const observer = new ResizeObserver(position);
    if (scene) observer.observe(scene);
    return () => observer.disconnect();
  }, [target, panel, finishOpen]);
  function choose(index: number) { setPlaying(false); setFrame({ step: index, phase: 3 }); }
  function play() { setVisible(true); if (complete) setFrame({ step: 0, phase: 0 }); setPlaying(!isPlaying); }
  const active = steps[step];
  return <section ref={root} className="pg-walkthrough" aria-labelledby={titleId} data-step={step} data-phase={phase} data-playing={isPlaying} data-visible={visible} data-reduced={reduced}>
    <div className="pg-walkthrough-intro"><div><span className="pg-walkthrough-kicker">Your first page, one small move at a time</span><h2 id={titleId}>Make it yours.</h2></div><p>A one-minute tour of Playground.<br /><span>Illustrated demo · your project stays untouched</span></p></div>
    <div className="pg-walkthrough-stage" aria-hidden="true">
      <div className="pg-walkthrough-orbit" />
      <div className="pg-walkthrough-window" ref={windowRef}>
        <div className="pg-walkthrough-bar"><span className="pg-walkthrough-brand">eidos <b>playground</b></span><span data-tour-target="save" className={`pg-walkthrough-save ${step === 7 && result ? 'is-lit' : ''}`}><i />{reached(7) ? 'Saved on this device' : 'Save now'}</span><span data-tour-target="undo" className={step === 6 && result ? 'is-lit' : ''}>↶ Undo</span><span data-tour-target="mobile" className={mobile ? 'is-lit' : ''}>▯ Mobile</span><span data-tour-target="finish" className="pg-walkthrough-finish-button">Finish ↗</span></div>
        <div className="pg-walkthrough-editor">
          <div className="pg-walkthrough-canvas" data-mobile={mobile}>
            <div className="pg-walkthrough-page" data-airy={airy} data-moved={moved}>
              <div className="pg-walkthrough-nav">FORM & FIELD <span>Studio&nbsp; / &nbsp;Contact</span></div>
              <div className="pg-walkthrough-art"><span /><i /><b /></div>
              <div className={`pg-walkthrough-content ${selection === 'container' && step === 4 ? 'is-selected' : ''}`}>
                <small>INDEPENDENT DESIGN STUDIO</small>
                <div data-tour-target="headline" className={`pg-walkthrough-headline ${selection === 'headline' ? 'is-selected' : ''}`} data-written={written}><span>A new<br />perspective.</span><span>Good ideas.<br />Made tangible.</span></div>
                <div className="pg-walkthrough-description">Thoughtful spaces.<br />Everyday possibilities.</div>
                <div data-tour-target="button" className={`pg-walkthrough-cta ${selection === 'button' ? 'is-selected' : ''}`}>Explore our work <span>↗</span></div>
              </div>
            </div>
          </div>
          <div className="pg-walkthrough-inspector">
            <div className="pg-tour-panel" data-active={panel === 'text'}><small>EDIT SELECTION</small><strong>Headline</strong><span>Text</span><div data-tour-target="text" className={`pg-walkthrough-field pg-tour-text ${step === 2 && phase >= 1 ? 'is-focused' : ''}`} data-written={written}><span>A new perspective.</span><span>Good ideas. Made tangible.</span></div><span>Arrange</span><div className="pg-walkthrough-field">Inside Hero content</div><small>Double-click text on the canvas to edit it there, too.</small></div>
            <div className="pg-tour-panel" data-active={panel === 'arrange'}><small>EDIT SELECTION</small><strong>Button</strong><span>Arrange</span><div data-tour-target="parent" className="pg-walkthrough-field">Inside <b>Hero content</b> ↗</div><div data-tour-target="earlier" className={`pg-walkthrough-field ${step === 3 && result ? 'is-lit' : ''}`}>↑ Move earlier</div><div className="pg-walkthrough-field">↓ Move later</div><small>Elements stay in responsive page flow.</small></div>
            <div className="pg-tour-panel" data-active={panel === 'layout'}><small>EDIT SELECTION</small><strong>Hero content</strong><span>Layout · {mobile ? 'Mobile' : 'Desktop'}</span><span>Space between elements</span><div className={`pg-walkthrough-field ${!airy ? 'is-lit' : ''}`}>Balanced <small>24 px</small></div><div data-tour-target="airy" className={`pg-walkthrough-field ${airy ? 'is-lit' : ''}`}>Airy <small>48 px</small></div><small>{mobile ? 'Inherited from desktop' : 'Mobile inherits these settings'}</small></div>
            <div className="pg-tour-panel" data-active={panel === 'project'}><small>KEEP & CONTINUE</small><strong>Your project</strong><div className="pg-walkthrough-field">Save now</div><span>Backup & restore</span><div className="pg-walkthrough-field">Download project JSON</div><small>Keep an editable backup to continue on another device.</small><div className="pg-tour-note">Add for content<br />Assets for images<br />Brand for your colors</div></div>
          </div>
        </div>
        <div className="pg-tour-starter-overlay" data-open={starterOpen}><div><small>CHOOSE YOUR STARTING POINT</small><h3>A useful beginning.</h3><div className="pg-tour-starter-card" data-tour-target="starter"><div className="pg-tour-starter-art"><i /><b /><span /></div><strong>Switchboard <span>↗</span></strong><p>A clear service business.</p></div><span className="pg-tour-starter-hint">Add your details or choose Skip details</span></div></div>
        <div className="pg-tour-finish-overlay" data-open={finishOpen}><div className="pg-tour-review"><small>FINISH YOUR PAGE</small><h3>Review this version.</h3><p>Check your content, links, image rights and both preview sizes.</p><div data-tour-target="prepare" className={`pg-walkthrough-field ${step === 8 && result ? 'is-lit' : ''}`}>Prepare current draft <span>↗</span></div><div className="pg-tour-package" data-ready={step === 8 && result}><span className="pg-tour-package-icon">↗</span><div><strong>Your page package</strong><p>HTML · CSS · JavaScript · images<br />+ editable project JSON</p></div></div><small>Review and approve the frozen version before downloading. A download does not publish your site.</small></div></div>
        <div className="pg-walkthrough-cursor" ref={cursor} data-click={phase === 2} data-hidden={phase === 3 || reduced}><i /><svg width="25" height="30" viewBox="0 0 25 30"><path d="M2 2 22 16 12 18 8 27Z" fill="#173d40" stroke="white" strokeWidth="2"/></svg></div>
      </div>
      <div className="pg-walkthrough-result"><span className={result ? 'is-visible' : ''}>✓ {active.result}</span><span className={!result ? 'is-visible' : ''}>Watch the highlighted control</span></div>
    </div>
    <div className="pg-walkthrough-bottom"><div className="pg-walkthrough-caption" aria-live={isPlaying ? 'off' : 'polite'}><span>{String(step + 1).padStart(2, '0')} / 09</span><div className="pg-tour-caption-stack">{steps.map((item, index) => <div key={item.label} data-active={index === step} aria-hidden={index !== step}><h3>{item.title}</h3><p>{item.copy}</p></div>)}</div></div><div className="pg-walkthrough-controls"><div className="pg-walkthrough-steps" aria-label="Tutorial steps">{steps.map((item, index) => <button type="button" key={item.label} aria-label={`Step ${index + 1}: ${item.label}`} aria-pressed={step === index} onClick={() => choose(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</button>)}</div><div className="pg-walkthrough-playback">{!reduced && <button type="button" onClick={play}>{isPlaying ? 'Pause' : complete ? 'Replay tour' : 'Play tour'}<span aria-hidden="true">{isPlaying ? ' Ⅱ' : ' ▷'}</span></button>}<button type="button" disabled={step === 0} onClick={() => choose(step - 1)}>Back</button><button type="button" disabled={step === steps.length - 1} onClick={() => choose(step + 1)}>Next</button>{onDone && <button type="button" className="pg-walkthrough-done" onClick={onDone}>Try it yourself ↗</button>}</div>{reduced && <small>Reduced motion is on. Explore at your own pace.</small>}</div></div>
  </section>;
}

export function PlaygroundTourButton() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  return <><button type="button" className="pg-button-secondary pg-tour-launch" onClick={() => setOpen(true)}>How it works <span aria-hidden="true">▷</span></button>{typeof document !== 'undefined' && createPortal(<dialog ref={dialog} className="pg-walkthrough-dialog" aria-label="How Playground works" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}><button type="button" className="pg-walkthrough-close" aria-label="Close Playground tour" onClick={() => setOpen(false)}>×</button>{open && <PlaygroundWalkthrough onDone={() => setOpen(false)} />}</dialog>, document.body)}</>;
}
