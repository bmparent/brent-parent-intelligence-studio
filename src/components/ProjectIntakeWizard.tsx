import { FormEvent, useMemo, useState } from 'react';
import { siteConfig } from '../config/site';
import { SectionHeader } from './SectionHeader';
import { GlassPanel } from './GlassPanel';

const projectTypes = [
  'Custom storefront',
  'Graphic design / mockups',
  'Production dashboard',
  'Workflow automation',
  'Eidos Brain / Sentinel prototype',
  'Website / portfolio / landing page',
  'Not sure yet'
];

const timelines = ['ASAP', '2-4 weeks', '1-2 months', 'Flexible / exploratory'];

const budgetRanges = [
  'Small focused polish',
  'Scoped build after discovery',
  'Phased larger build',
  'Flexible / exploratory',
  'Not sure yet'
];

type IntakeState = {
  projectType: string;
  problem: string;
  currentUrl: string;
  tools: string;
  inspiration: string;
  timeline: string;
  budget: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  preferredContact: string;
  website: string;
};

type SubmitState =
  | { status: 'idle' | 'submitting'; message?: string; brief?: string; mailto?: string }
  | { status: 'success' | 'fallback' | 'error'; message: string; brief: string; mailto: string };

type InquiryResponse = {
  state?: 'sent' | 'fallback' | 'validation_error' | 'provider_error';
  submitted?: boolean;
  message?: string;
  brief?: string;
  mailto?: string;
  errors?: Record<string, string>;
};

const initialState: IntakeState = {
  projectType: 'Not sure yet',
  problem: '',
  currentUrl: '',
  tools: '',
  inspiration: '',
  timeline: 'Flexible / exploratory',
  budget: 'Not sure yet',
  name: '',
  company: '',
  email: '',
  phone: '',
  preferredContact: 'Email',
  website: ''
};

function buildBrief(form: IntakeState) {
  return [
    'Eidos Works project inquiry',
    '',
    `Project type: ${form.projectType}`,
    `Problem to solve: ${form.problem}`,
    `Current website/storefront URL: ${form.currentUrl || 'Not provided'}`,
    `Tools involved: ${form.tools || 'Not provided'}`,
    `Examples or inspiration: ${form.inspiration || 'Not provided'}`,
    `Timeline: ${form.timeline}`,
    `Budget posture: ${form.budget}`,
    '',
    `Name: ${form.name}`,
    `Company / organization: ${form.company || 'Not provided'}`,
    `Email: ${form.email}`,
    `Phone: ${form.phone || 'Not provided'}`,
    `Preferred contact method: ${form.preferredContact}`
  ].join('\n');
}

function buildMailto(brief: string) {
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent('Eidos Works project inquiry')}&body=${encodeURIComponent(brief)}`;
}

export function ProjectIntakeWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);

  const brief = useMemo(() => buildBrief(form), [form]);
  const mailto = useMemo(() => buildMailto(brief), [brief]);

  const updateField = (field: keyof IntakeState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateCurrentStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 0 && !form.projectType) nextErrors.projectType = 'Choose a project type.';
    if (step === 1 && form.problem.trim().length < 20) nextErrors.problem = 'Describe the problem in at least 20 characters.';
    if (step === 4) {
      if (!form.name.trim()) nextErrors.name = 'Name is required.';
      if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'A valid email is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, 5));
  };

  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState({ status: 'submitting', brief, mailto });

    const contactErrors: Record<string, string> = {};
    if (form.problem.trim().length < 20) contactErrors.problem = 'Describe the problem in at least 20 characters.';
    if (!form.name.trim()) contactErrors.name = 'Name is required.';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) contactErrors.email = 'A valid email is required.';

    if (Object.keys(contactErrors).length) {
      setErrors(contactErrors);
      setSubmitState({
        status: 'error',
        message: 'Please complete the required fields before submitting.',
        brief,
        mailto
      });
      return;
    }

    const isLocalStaticPreview =
      typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
      !['8787', '8788'].includes(window.location.port);

    if (isLocalStaticPreview) {
      setSubmitState({
        status: 'fallback',
        message: 'Your brief is ready. Email it to Eidos Works.',
        brief,
        mailto
      });
      return;
    }

    try {
      const response = await fetch('/api/project-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, brief })
      });
      const data = (await response.json()) as InquiryResponse;
      const responseBrief = data.brief ?? brief;
      const responseMailto = data.mailto ?? mailto;

      if (data.state === 'sent' || data.submitted) {
        setSubmitState({
          status: 'success',
          message: data.message ?? 'Your brief was submitted to Eidos Works.',
          brief: responseBrief,
          mailto: responseMailto
        });
        return;
      }

      if (data.state === 'fallback' || data.state === 'provider_error') {
        setErrors(data.errors ?? {});
        setSubmitState({
          status: 'fallback',
          message: data.message ?? 'Your brief is ready. Email it to Eidos Works.',
          brief: responseBrief,
          mailto: responseMailto
        });
        return;
      }

      if (!response.ok || data.state === 'validation_error') {
        setErrors(data.errors ?? {});
        setSubmitState({
          status: 'error',
          message: data.message ?? 'The brief could not be submitted yet.',
          brief: responseBrief,
          mailto: responseMailto
        });
        return;
      }

      setSubmitState({
        status: 'fallback',
        message: data.message ?? 'Your brief is ready. Email it to Eidos Works.',
        brief: responseBrief,
        mailto: responseMailto
      });
    } catch {
      setSubmitState({
        status: 'fallback',
        message: 'Your brief is ready. Email it to Eidos Works.',
        brief,
        mailto
      });
    }
  };

  return (
    <section id="start" className="section-shell section-block project-intake" aria-labelledby="start-title">
      <SectionHeader
        id="start-title"
        eyebrow="Start a project"
        title="Turn the rough idea into a brief Brent can actually respond to."
        summary="The intake flow captures the project type, current tools, timeline, budget posture, and contact details, then creates a clean project brief before anything is sent."
      />

      <GlassPanel className="intake-shell" ariaLabel="Start a project intake flow">
        <div className="intake-steps" aria-label="Project intake steps">
          {['Type', 'Problem', 'Tools', 'Timeline', 'Contact', 'Review'].map((label, index) => (
            <button
              className={step === index ? 'is-active' : ''}
              key={label}
              type="button"
              aria-current={step === index ? 'step' : undefined}
              onClick={() => {
                if (index <= step || validateCurrentStep()) setStep(index);
              }}
            >
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </div>

        <form className="intake-form" onSubmit={submit}>
          <label className="hp-field" htmlFor="project-website">
            Website
            <input
              id="project-website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => updateField('website', event.target.value)}
            />
          </label>

          <div className="intake-status" aria-live="polite">
            Step {step + 1} of 6
          </div>

          {step === 0 ? (
            <fieldset className="choice-grid">
              <legend>Project type</legend>
              {projectTypes.map((type) => (
                <label key={type}>
                  <input
                    type="radio"
                    name="projectType"
                    value={type}
                    checked={form.projectType === type}
                    onChange={(event) => updateField('projectType', event.target.value)}
                  />
                  <span>{type}</span>
                </label>
              ))}
              {errors.projectType ? <p className="field-error">{errors.projectType}</p> : null}
            </fieldset>
          ) : null}

          {step === 1 ? (
            <label className="intake-field" htmlFor="project-problem">
              <span>What are you trying to fix, launch, simplify, or improve?</span>
              <textarea
                id="project-problem"
                rows={7}
                value={form.problem}
                onChange={(event) => updateField('problem', event.target.value)}
              />
              {errors.problem ? <small className="field-error">{errors.problem}</small> : null}
            </label>
          ) : null}

          {step === 2 ? (
            <div className="intake-grid-fields">
              <label className="intake-field" htmlFor="project-url">
                <span>Current website/storefront URL</span>
                <input id="project-url" value={form.currentUrl} onChange={(event) => updateField('currentUrl', event.target.value)} />
              </label>
              <label className="intake-field" htmlFor="project-tools">
                <span>Tools involved</span>
                <input
                  id="project-tools"
                  value={form.tools}
                  placeholder="InkSoft, Printavo, Sheets, forms, Cloudinary..."
                  onChange={(event) => updateField('tools', event.target.value)}
                />
              </label>
              <label className="intake-field intake-field--full" htmlFor="project-inspiration">
                <span>Examples or inspiration</span>
                <textarea id="project-inspiration" rows={4} value={form.inspiration} onChange={(event) => updateField('inspiration', event.target.value)} />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="intake-grid-fields">
              <fieldset className="choice-grid choice-grid--compact">
                <legend>Timeline</legend>
                {timelines.map((timeline) => (
                  <label key={timeline}>
                    <input
                      type="radio"
                      name="timeline"
                      value={timeline}
                      checked={form.timeline === timeline}
                      onChange={(event) => updateField('timeline', event.target.value)}
                    />
                    <span>{timeline}</span>
                  </label>
                ))}
              </fieldset>
              <label className="intake-field" htmlFor="project-budget">
                <span>Budget posture</span>
                <select id="project-budget" value={form.budget} onChange={(event) => updateField('budget', event.target.value)}>
                  {budgetRanges.map((range) => (
                    <option key={range}>{range}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="intake-grid-fields">
              <label className="intake-field" htmlFor="project-name">
                <span>Name</span>
                <input id="project-name" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
                {errors.name ? <small className="field-error">{errors.name}</small> : null}
              </label>
              <label className="intake-field" htmlFor="project-company">
                <span>Company / organization</span>
                <input id="project-company" value={form.company} onChange={(event) => updateField('company', event.target.value)} />
              </label>
              <label className="intake-field" htmlFor="project-email">
                <span>Email</span>
                <input id="project-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
                {errors.email ? <small className="field-error">{errors.email}</small> : null}
              </label>
              <label className="intake-field" htmlFor="project-phone">
                <span>Phone optional</span>
                <input id="project-phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
              </label>
              <label className="intake-field" htmlFor="project-contact-method">
                <span>Preferred contact method</span>
                <select
                  id="project-contact-method"
                  value={form.preferredContact}
                  onChange={(event) => updateField('preferredContact', event.target.value)}
                >
                  <option>Email</option>
                  <option>Phone</option>
                  <option>Either email or phone</option>
                </select>
              </label>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="brief-review">
              <span className="section-kicker">Generated brief</span>
              <pre>{brief}</pre>
              {submitState.status === 'success' || submitState.status === 'fallback' || submitState.status === 'error' ? (
                <div className={`submit-result submit-result--${submitState.status}`} aria-live="polite">
                  <strong>{submitState.message}</strong>
                  {submitState.status !== 'success' ? (
                    <div className="submit-result__actions">
                      <a className="btn btn--primary" href={submitState.mailto}>
                        Email this brief
                      </a>
                      <button className="btn btn--secondary" type="button" onClick={copyBrief}>
                        {copied ? 'Copied' : 'Copy brief'}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="intake-actions">
            <button className="btn btn--secondary" type="button" onClick={previousStep} disabled={step === 0}>
              Back
            </button>
            {step < 5 ? (
              <button className="btn btn--primary" type="button" onClick={nextStep}>
                Continue
              </button>
            ) : (
              <button className="btn btn--primary" type="submit" disabled={submitState.status === 'submitting'}>
                {submitState.status === 'submitting' ? 'Preparing brief...' : 'Submit project brief'}
              </button>
            )}
          </div>
        </form>
      </GlassPanel>
    </section>
  );
}
