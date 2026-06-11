import { useMemo, useState } from 'react';
import { automationQuestions, seoQuestions, uxQuestions } from '../../data/platform';
import { NewsletterSignup, ToolLinkRow, WorkWithEidosCTA } from './Shared';

type CheckedMap = Record<string, boolean>;

function toggleValue(values: CheckedMap, id: string) {
  return { ...values, [id]: !values[id] };
}

function scoreFromChecked(items: readonly { id: string }[], values: CheckedMap) {
  if (!items.length) return 0;
  const checked = items.filter((item) => values[item.id]).length;
  return Math.round((checked / items.length) * 100);
}

function scoreBand(score: number) {
  if (score >= 82) return 'Strong foundation';
  if (score >= 62) return 'Useful but uneven';
  if (score >= 38) return 'High-leverage cleanup';
  return 'Needs a focused baseline';
}

function ChecklistInput({
  id,
  label,
  checked,
  onToggle
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="check-row" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={onToggle} />
      <span>{label}</span>
    </label>
  );
}

export function AutomationScoreTool() {
  const [selected, setSelected] = useState<CheckedMap>({});
  const frictionScore = automationQuestions.reduce((total, question) => total + (selected[question.id] ? question.weight : 0), 0);
  const automationReadiness = Math.max(0, 100 - frictionScore);
  const priorities = automationQuestions
    .filter((question) => selected[question.id])
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  return (
    <section className="tool-workbench section-shell" data-reveal>
      <div className="tool-workbench__intro">
        <p className="section-kicker">Automation Score</p>
        <h1>Find the manual work that deserves attention first.</h1>
        <p>
          Check the friction points that are true today. The output scores operational drag from 0 to 100,
          then translates the highest-weight items into practical next moves.
        </p>
      </div>

      <div className="tool-workbench__grid">
        <form className="tool-panel" data-event="tool_completed" aria-label="Automation score inputs">
          {automationQuestions.map((question) => (
            <ChecklistInput
              key={question.id}
              id={`automation-${question.id}`}
              label={question.label}
              checked={Boolean(selected[question.id])}
              onToggle={() => setSelected((current) => toggleValue(current, question.id))}
            />
          ))}
        </form>

        <aside className="tool-result" aria-live="polite">
          <span>Automation drag score</span>
          <strong>{frictionScore}/100</strong>
          <h2>{scoreBand(automationReadiness)}</h2>
          <p>
            Readiness score: {automationReadiness}/100. Lower drag means the operation has fewer obvious
            automation bottlenecks. Higher drag means the next build should be scoped around repeatable handoffs.
          </p>
          <div className="priority-list">
            <h3>Highest-leverage recommendations</h3>
            {priorities.length ? (
              <ol>
                {priorities.map((item) => (
                  <li key={item.id}>{item.recommendation}</li>
                ))}
              </ol>
            ) : (
              <p>Select the friction points that apply to reveal recommendations.</p>
            )}
          </div>
          <div className="tool-result__actions">
            <a className="btn btn--primary" href="/newsletter">
              Get the checklist
            </a>
            <a className="btn btn--secondary" href="/audit" data-event="audit_cta_click">
              Request an audit
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function AgenticSeoReadinessTool() {
  const [selected, setSelected] = useState<CheckedMap>({});
  const score = scoreFromChecked(seoQuestions, selected);
  const missing = seoQuestions.filter((question) => !selected[question.id]);

  return (
    <section className="tool-workbench section-shell" data-reveal>
      <div className="tool-workbench__intro">
        <p className="section-kicker">Agentic SEO Readiness</p>
        <h1>Check whether the site is easy to crawl, cite, and understand.</h1>
        <p>
          This no-login checklist keeps the first pass practical: crawlability, indexability, metadata,
          article structure, AI crawler policy, accessibility, and mobile performance.
        </p>
      </div>

      <div className="tool-workbench__grid">
        <form className="tool-panel" data-event="tool_completed" aria-label="Agentic SEO readiness inputs">
          {seoQuestions.map((question) => (
            <ChecklistInput
              key={question.id}
              id={`seo-${question.id}`}
              label={question.label}
              checked={Boolean(selected[question.id])}
              onToggle={() => setSelected((current) => toggleValue(current, question.id))}
            />
          ))}
        </form>

        <aside className="tool-result" aria-live="polite">
          <span>Readiness score</span>
          <strong>{score}/100</strong>
          <h2>{scoreBand(score)}</h2>
          <p>
            A strong score does not guarantee AI citations, but it shows the page has the technical and
            editorial signals needed to compete honestly.
          </p>
          <div className="priority-list">
            <h3>Missing items</h3>
            {missing.length ? (
              <ul>
                {missing.slice(0, 6).map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            ) : (
              <p>All readiness items are checked. Verify with live crawl and webmaster-tool data next.</p>
            )}
          </div>
          <div className="tool-result__actions">
            <a className="btn btn--primary" href="/intelligence/agentic-seo-guide">
              Read the guide
            </a>
            <a className="btn btn--secondary" href="/newsletter">
              Join the newsletter
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function UiUxAuditChecklistTool() {
  const [selected, setSelected] = useState<CheckedMap>({});
  const score = scoreFromChecked(uxQuestions, selected);
  const missing = uxQuestions.filter((question) => !selected[question.id]);
  const priorities = useMemo(() => missing.slice(0, 4), [missing]);

  return (
    <section className="tool-workbench section-shell" data-reveal>
      <div className="tool-workbench__intro">
        <p className="section-kicker">UI/UX Audit Checklist</p>
        <h1>Audit the interface before adding another visual layer.</h1>
        <p>
          Score navigation, hierarchy, accessibility, mobile layout, performance, trust signals, and
          monetization restraint. The goal is a better page, not a louder one.
        </p>
      </div>

      <div className="tool-workbench__grid">
        <form className="tool-panel" data-event="tool_completed" aria-label="UI/UX audit checklist inputs">
          {uxQuestions.map((question) => (
            <ChecklistInput
              key={question.id}
              id={`ux-${question.id}`}
              label={question.label}
              checked={Boolean(selected[question.id])}
              onToggle={() => setSelected((current) => toggleValue(current, question.id))}
            />
          ))}
        </form>

        <aside className="tool-result" aria-live="polite">
          <span>Audit score</span>
          <strong>{score}/100</strong>
          <h2>{scoreBand(score)}</h2>
          <p>
            Use the score as a triage tool. The most useful next action is usually one high-friction fix,
            not a broad redesign.
          </p>
          <div className="priority-list">
            <h3>Improvement priorities</h3>
            {priorities.length ? (
              <ol>
                {priorities.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ol>
            ) : (
              <p>All checklist items are checked. Validate with users, accessibility checks, and performance data.</p>
            )}
          </div>
          <ToolLinkRow />
        </aside>
      </div>
    </section>
  );
}

export function ToolSupportSection() {
  return (
    <>
      <section className="section-shell tool-support" data-reveal>
        <div>
          <p className="section-kicker">Next Step</p>
          <h2>Save the result and keep the follow-up practical.</h2>
          <p>
            These tools are intentionally client-side and privacy-light. They do not transmit answers unless
            a future analytics or form endpoint is explicitly configured.
          </p>
        </div>
        <NewsletterSignup context="tool page" />
      </section>
      <WorkWithEidosCTA compact />
    </>
  );
}

