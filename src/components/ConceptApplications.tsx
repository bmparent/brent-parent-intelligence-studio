import { useState } from 'react';
import '../styles/concept-applications.css';

const jobs = [
  { id: 'harbor', title: 'Harbor tote bags', quantity: 120, status: 'Ready', due: '2026-09-25', note: 'Canvas totes · one-color front print. Artwork approved; packing pending.' },
  { id: 'field', title: 'Field day shirts', quantity: 80, status: 'Printing', due: '2026-09-26', note: 'Two-color shirts. Print sample approved; cure check next.' },
  { id: 'studio', title: 'Studio caps', quantity: 48, status: 'Delayed', due: '2026-09-24', note: 'Waiting for revised artwork. Confirm the revision before scheduling embroidery.' },
];
const periods = {
  'This week': [{ day: 'Mon', intake: 8, complete: 6 }, { day: 'Tue', intake: 10, complete: 9 }, { day: 'Wed', intake: 7, complete: 8 }, { day: 'Thu', intake: 9, complete: 7 }, { day: 'Fri', intake: 6, complete: 6 }],
  'Last week': [{ day: 'Mon', intake: 6, complete: 5 }, { day: 'Tue', intake: 8, complete: 7 }, { day: 'Wed', intake: 9, complete: 8 }, { day: 'Thu', intake: 5, complete: 6 }, { day: 'Fri', intake: 7, complete: 7 }],
};
function estimateExample(quantity: number, material: number, setup: number, minutes: number) {
  return quantity * material + setup + minutes / 60 * 30;
}
export function ConceptApplications() {
  const [tab, setTab] = useState('Production board'), [reset, setReset] = useState(0);
  return <section className="concept-app" aria-label="Fictional business application demonstrations">
    <header className="concept-brand"><strong>Eidos Works</strong><span>Concept application — fictional data</span></header>
    <nav className="concept-tabs" aria-label="Choose a concept application">{['Production board', 'Estimating workspace', 'Operations dashboard'].map(name => <button key={name} type="button" aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>)}</nav>
    <div className="concept-body" key={reset}>
      {tab === 'Production board' ? <ProductionBoard /> : tab === 'Estimating workspace' ? <EstimatingWorkspace /> : <OperationsDashboard />}
    </div>
    <footer><span>Fictional demonstration. No customer systems connected.</span><button type="button" onClick={() => setReset(n => n + 1)}>Reset demo</button></footer>
  </section>;
}
function ProductionBoard() {
  const [search, setSearch] = useState(''), [status, setStatus] = useState('All'), [due, setDue] = useState(''), [selected, setSelected] = useState('harbor'), [completed, setCompleted] = useState<string[]>([]), [state, setState] = useState('Ready');
  const rows = jobs.map(job => ({ ...job, status: completed.includes(job.id) ? 'Complete' : job.status })).filter(job => job.title.toLowerCase().includes(search.toLowerCase()) && (status === 'All' || job.status === status) && (!due || job.due <= due));
  const detail = rows.find(job => job.id === selected);
  return <div className="concept-production"><div><h2>Keep the next job moving.</h2><p>A simple view of what’s in production and what needs attention.</p>
    <div className="concept-controls"><label>Search jobs<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs…" /></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}>{['All', 'Ready', 'Printing', 'Delayed', 'Complete'].map(s => <option key={s}>{s}</option>)}</select></label><label>Due by<input type="date" value={due} onChange={e => setDue(e.target.value)} /></label></div>
    <label className="concept-state">Preview a state<select value={state} onChange={e => setState(e.target.value)}>{['Ready', 'Loading', 'Error'].map(s => <option key={s}>{s}</option>)}</select></label>
    {state === 'Loading' ? <p role="status">Loading demonstration jobs… Choose Ready to resume.</p> : state === 'Error' ? <p role="alert">Example connection interrupted. <button onClick={() => setState('Ready')}>Retry demo</button></p> : rows.length ? <div className="concept-table-wrap"><table><caption className="sr-only">Fictional production jobs</caption><thead><tr><th>Job name</th><th>Quantity</th><th>Status</th><th>Due date</th></tr></thead><tbody>{rows.map(job => <tr key={job.id} className={detail?.id === job.id ? 'selected' : ''}><th scope="row"><button aria-pressed={detail?.id === job.id} onClick={() => setSelected(job.id)}>{job.title}</button></th><td>{job.quantity}</td><td><span className={'concept-status concept-status--' + job.status.toLowerCase()}>{job.status}</span></td><td>{job.due.slice(5)}</td></tr>)}</tbody></table></div> : <p role="status">No jobs match. <button onClick={() => { setSearch(''); setStatus('All'); setDue(''); }}>Clear filters</button></p>}</div>
    <aside aria-live="polite"><span>Job details</span>{detail && state === 'Ready' ? <><h3>{detail.title}</h3><dl><div><dt>Quantity</dt><dd>{detail.quantity} pieces</dd></div><div><dt>Due date</dt><dd>{detail.due}</dd></div><div><dt>Status</dt><dd>{detail.status}</dd></div></dl><p>{detail.note}</p><button disabled={detail.status === 'Complete'} onClick={() => setCompleted(values => [...values, detail.id])}>Mark as complete</button><button onClick={() => setSelected('')}>Close details</button></> : <p>Select a visible job to inspect its next step.</p>}</aside>
  </div>;
}
function EstimatingWorkspace() {
  const [quantity, setQuantity] = useState(120), [material, setMaterial] = useState(4.5), [setup, setSetup] = useState(35), [minutes, setMinutes] = useState(90);
  const total = estimateExample(quantity, material, setup, minutes);
  return <div className="concept-estimate"><div><h2>See what goes into the estimate.</h2><p>Editable demonstration values. This is not an official quotation.</p><div className="concept-estimate-fields">{[
    { label: 'Quantity', value: quantity, set: setQuantity, min: 1, max: 10000, step: 1 },
    { label: 'Material per piece ($)', value: material, set: setMaterial, min: 0, max: 10000, step: .01 },
    { label: 'Setup ($)', value: setup, set: setSetup, min: 0, max: 10000, step: .01 },
    { label: 'Production minutes', value: minutes, set: setMinutes, min: 0, max: 10000, step: 1 },
  ].map(field => <label key={field.label}>{field.label}<input type="number" min={field.min} max={field.max} step={field.step} value={field.value} onChange={e => field.set(Math.min(field.max, Math.max(field.min, Number(e.target.value) || field.min)))} /></label>)}</div></div>
    <aside aria-live="polite"><span>Example estimate</span><h3>${total.toFixed(2)}</h3><p>${(total / quantity).toFixed(2)} per piece</p><dl><div><dt>Materials</dt><dd>{quantity} × ${material.toFixed(2)}</dd></div><div><dt>Setup</dt><dd>${setup.toFixed(2)}</dd></div><div><dt>Labor example</dt><dd>{minutes} ÷ 60 × $30/hour</dd></div></dl><p>Materials + setup + labor. Tax, shipping and margin are excluded. All rates are fictional.</p></aside></div>;
}
function OperationsDashboard() {
  const [period, setPeriod] = useState<keyof typeof periods>('This week'), [day, setDay] = useState('Mon');
  const rows = periods[period], selected = rows.find(row => row.day === day)!;
  const intake = rows.reduce((n, row) => n + row.intake, 0), complete = rows.reduce((n, row) => n + row.complete, 0);
  return <div><h2>Know where work is collecting.</h2><p>One fictional dataset drives these totals and daily details.</p><label>Reporting period<select value={period} onChange={e => setPeriod(e.target.value as keyof typeof periods)}>{Object.keys(periods).map(p => <option key={p}>{p}</option>)}</select></label>
    <dl className="concept-metrics"><div><dt>Intake</dt><dd>{intake}</dd></div><div><dt>Completed</dt><dd>{complete}</dd></div><div><dt>Change in backlog</dt><dd>+{intake - complete}</dd></div><div><dt>Example capacity</dt><dd>50 jobs/week</dd></div></dl>
    <div className="concept-operations"><div className="concept-bars" aria-label="Daily completions out of ten jobs capacity">{rows.map(row => <button key={row.day} aria-pressed={day === row.day} onClick={() => setDay(row.day)}><span>{row.day}</span><meter min={0} max={10} value={row.complete} aria-label={`${row.day} completed jobs`} /><span>{row.complete} / 10</span></button>)}</div><aside aria-live="polite"><h3>{day} details</h3><p>{selected.intake} received · {selected.complete} completed</p><p>{10 - selected.complete} jobs of unused example capacity.</p><p>Capacity is a demonstration assumption, not measured team performance.</p></aside></div></div>;
}
