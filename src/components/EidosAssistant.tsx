import { useEffect, useRef, useState, type FormEvent } from 'react';
import { post, usePublicConfig, requestId } from '../lib/platform';
import { track } from '../lib/analytics';
interface Answer {
  answer: string;
  sources: { title: string; href: string }[];
  mode: 'sources' | 'ai';
  note?: string;
}
export function EidosAssistant() {
  const [open, setOpen] = useState(false),
    [question, setQuestion] = useState(''),
    [lastQuestion, setLastQuestion] = useState(''),
    [answer, setAnswer] = useState<Answer | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const config = usePublicConfig();
  const dialog = useRef<HTMLDialogElement>(null),
    toggle = useRef<HTMLButtonElement>(null),
    field = useRef<HTMLTextAreaElement>(null);
  const controller = useRef(0);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      field.current?.focus();
    } else if (dialog.current?.open) {
      dialog.current.close();
      toggle.current?.focus();
    }
  }, [open]);
  async function ask(value: string, enhanced = false) {
    if (busy || value.trim().length < 3) return;
    setBusy(true);
    setError('');
    const request = ++controller.current;
    setLastQuestion(value);
    track(enhanced ? 'assistant_ai_request' : 'assistant_question', {
      mode: enhanced ? 'ai' : 'sources',
    });
    try {
      const result = await post<Answer>('/api/assistant', {
        question: value,
        enhanced,
        requestId: enhanced ? requestId() : undefined,
      });
      if (controller.current === request) setAnswer(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }
  return (
    <>
      <button
        ref={toggle}
        className="ew-assistant-trigger"
        type="button"
        onClick={() => {
          setOpen(true);
          track('assistant_open');
        }}
      >
        <span aria-hidden="true">✳</span>
        <span>Ask Eidos</span>
      </button>
      <dialog
        ref={dialog}
        className="ew-assistant-dialog"
        aria-labelledby="assistant-title"
        onCancel={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) {
            const r = dialog.current.getBoundingClientRect();
            if (
              event.clientX < r.left ||
              event.clientX > r.right ||
              event.clientY < r.top ||
              event.clientY > r.bottom
            )
              setOpen(false);
          }
        }}
      >
        <div className="ew-assistant-heading">
          <div>
            <p className="ew-eyebrow">A little studio intelligence</p>
            <h2 id="assistant-title">Hello. I’m Eidos.</h2>
          </div>
          <button
            type="button"
            aria-label="Close Eidos assistant"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="ew-assistant-body">
          <p>
            Ask about the work, your next website, or where an idea could go. I
            start with the studio’s published information.
          </p>
          <div className="ew-assistant-prompts">
            {[
              'What can you build?',
              'Show me the storefronts',
              'What is Sentinel Lab?',
            ].map((prompt) => (
              <button
                type="button"
                disabled={busy}
                key={prompt}
                onClick={() => {
                  setQuestion(prompt);
                  void ask(prompt);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div
            className="ew-assistant-answer"
            aria-live="polite"
            aria-busy={busy}
          >
            {busy ? (
              <p>Finding a useful answer…</p>
            ) : answer ? (
              <>
                <p className="ew-answer-question">{lastQuestion}</p>
                <span className="ew-answer-label">
                  {answer.mode === 'ai'
                    ? 'AI-generated follow-up'
                    : 'From Eidos’s published work'}
                </span>
                <p className="ew-preserve-lines">{answer.answer}</p>
                <nav aria-label="Answer sources">
                  {answer.sources
                    .filter((source) =>
                      /^\/(work|about|contact|services|shop|lab|community)(\/|$)/.test(
                        source.href,
                      ),
                    )
                    .map((source) => (
                      <a key={source.href} href={source.href}>
                        {source.title} ↗
                      </a>
                    ))}
                </nav>
                {answer.note && <p className="ew-form-note">{answer.note}</p>}
                {config?.aiReady && answer.mode === 'sources' && (
                  <button
                    className="ew-text-button"
                    type="button"
                    onClick={() => void ask(lastQuestion, true)}
                  >
                    Ask AI to elaborate
                  </button>
                )}
              </>
            ) : null}
          </div>
          {error && (
            <p className="ew-notice ew-error" role="alert">
              {error}
            </p>
          )}
          <form onSubmit={submit}>
            <label className="ew-field">
              <span>Your question</span>
              <textarea
                ref={field}
                required
                minLength={3}
                maxLength={900}
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What are you imagining?"
              />
            </label>
            <div className="ew-assistant-submit">
              <span>{question.length}/900</span>
              <button
                className="ew-button ew-button--primary"
                disabled={busy}
                type="submit"
              >
                {busy ? 'Thinking…' : 'Ask Eidos →'}
              </button>
            </div>
          </form>
          <p className="ew-form-note">
            This conversation stays in this tab. An optional AI follow-up sends
            your question to our AI provider; avoid private information. I
            cannot quote a project or operate the Lab.{' '}
            <a href="/privacy">Details</a>
          </p>
          <a className="ew-text-link" href="/community">
            Want a public conversation? →
          </a>
        </div>
      </dialog>
    </>
  );
}
