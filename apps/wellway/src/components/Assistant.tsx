import { useState, useEffect, useRef } from "react";
import { useStore } from "../lib/store";
import { summary, formatValue, dateLabel, evidence } from "../lib/data";
import { Modal, Button, Note } from "./UI";
import { Icon } from "./Icon";
import { member, healthHistory } from "../lib/profiles";
export function Assistant({ onClose }: { onClose: () => void }) {
  const { state } = useStore();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [live, setLive] = useState(false);
  const [available, setAvailable] = useState(false);
  const [details, setDetails] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const sleep = summary(state, "sleep");
  useEffect(() => {
    if (
      location.protocol === "http:" &&
      (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    )
      fetch("/api/status")
        .then((r) => (r.ok ? r.json() : null))
        .then((r) => setAvailable(Boolean(r?.aiConfigured)))
        .catch(() => {});
    return () => controller.current?.abort();
  }, []);
  async function ask(q = question) {
    if (!q.trim() || status) return;
    setQuestion(q);
    setAnswer("");
    setStatus("Reading the available records…");
    setSources([]);
    if (live && available) {
      try {
        controller.current = new AbortController();
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, evidence: evidence(state) }),
          signal: controller.current.signal,
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error || "The local AI connection did not respond.",
          );
        setAnswer(result.answer);
        setSources(result.sources || []);
      } catch (e) {
        if (!(e instanceof Error && e.name === "AbortError"))
          setAnswer(
            `Live AI could not complete this request. ${e instanceof Error ? e.message : "Please try again."} You can turn off Live AI and use the guided local answers.`,
          );
      } finally {
        setStatus("");
      }
      return;
    }
    const ql = q.toLowerCase();
    const current = state.checkins.at(-1);
    let text: string;
    if (/history|allerg|medication|profile|knee/.test(ql)) {
      text = `Alex’s fictional intake describes a past knee strain, seasonal allergies, and an earlier work shift. ${member.allergies} ${member.medications}\n\nThese are invented demonstration notes, not verified clinical records. They add context for questions at a visit; they do not establish the cause of a wearable trend or justify a treatment change. Open Alex’s profile to inspect the dated source notes.`;
      setSources(healthHistory.map((h) => `${h.date} · ${h.title} · ${h.id}`));
    } else if (/sleep|week|change|trend|pattern/.test(ql)) {
      text =
        sleep.average === null
          ? "There are no sleep records in the last seven demo days. Try a sample import in Connections, or explore an earlier backup. I cannot describe a trend without records."
          : `Across ${sleep.coverage} of the last 7 demo days, recorded sleep averaged ${formatValue(sleep.average, "sleep")}. ${sleep.delta !== null ? `That is ${Math.round(Math.abs(sleep.delta) * 60)} minutes ${sleep.delta >= 0 ? "more" : "less"} than the previous period’s recorded average.` : ""} ${7 - sleep.coverage ? `${7 - sleep.coverage} day(s) had no record and were excluded.` : ""}\n\n${current?.note ? `Your latest note adds context: “${current.note}”` : "Adding a check-in would help put those observations in context."}\n\nThe records show a difference, not its cause. You can review the individual days in My journey and discuss what changed with your advisor.`;
      setSources(
        sleep.rows.flatMap((r) =>
          r.record
            ? [
                `${dateLabel(r.date, true)} · ${formatValue(r.value, "sleep")} · ${r.record.id}`,
              ]
            : [],
        ),
      );
    } else if (/plan|time|step|minute|today/.test(ql)) {
      text = `Your focus is “${state.goal}.” ${current ? `Your latest check-in said you have ${current.minutes} minutes available.` : "A check-in can help you choose how much time feels realistic."}\n\nYour existing plan includes “${state.plan[0].title}” (${state.plan[0].minutes} minutes, ${state.plan[0].time.toLowerCase()}). You can adjust its timing or duration in My plan. Larger changes can be prepared and reviewed in the advisor demonstration.\n\nChoose a manageable step; the app does not infer medical readiness from a wearable reading.`;
      setSources([
        `Current focus: ${state.goal}`,
        `Existing plan: ${state.plan[0].title}`,
        ...(current ? [`Check-in: ${dateLabel(current.date)}`] : []),
      ]);
    } else if (/connect|sync|source|import|missing|data/.test(ql)) {
      text =
        "Connections lets you try a sample wearable flow or import a sample CSV. The pipeline checks dates, units, and record IDs, skips exact duplicates, and holds invalid rows out of your history.\n\nThe service cards are walkthroughs. Apple Health and Health Connect require mobile app components for real connections. Google Drive backups are transferred manually. A chart gap means no observation was available—not a zero reading.";
      setSources([
        "Connection settings in this browser",
        "Import validation rules",
        "Chart source-selection rules",
      ]);
    } else {
      text =
        "This offline guide can explain the recorded week, the current plan, and how connections work. It is not a live language model and cannot answer unrestricted health questions.\n\nTry “What changed this week?”, “How can I fit my plan into today?”, or “How do the connections work?” For personal health concerns, use your usual qualified care provider.";
    }
    setAnswer(text);
    setStatus("");
  }
  return (
    <Modal
      title="Understand your journey."
      subtitle={
        live && available
          ? "Live AI · Through your local server"
          : "Guided answers · Calculated locally, without a live model"
      }
      onClose={onClose}
      wide
    >
      <div className="assistant-intro">
        <span className="icon-disc">
          <Icon name="sparkles" size={28} />
        </span>
        <p>
          Ask about the information here. Every explanation should make its
          evidence and its limits clear.
        </p>
      </div>
      <div className="prompt-chips">
        {[
          "What changed this week?",
          "How can I fit my plan into today?",
          "How do the connections work?",
          "What is in my history?",
        ].map((q) => (
          <button key={q} disabled={Boolean(status)} onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="ask-form"
      >
        <label className="sr-only" htmlFor="ask-question">
          Your question
        </label>
        <input
          id="ask-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={1000}
          placeholder="Ask about your week, plan, or data…"
        />
        <Button
          type="submit"
          icon="send"
          disabled={!question.trim() || Boolean(status)}
        >
          Ask
        </Button>
      </form>
      {status && (
        <div className="assistant-answer" role="status">
          {status}
        </div>
      )}
      {answer && (
        <div className="assistant-answer" aria-live="polite">
          {answer.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {sources.length > 0 && (
            <details>
              <summary>Show supporting records ({sources.length})</summary>
              <ul className="source-list">
                {sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
      <button
        className="text-button assistant-details"
        onClick={() => setDetails(!details)}
      >
        <Icon name="info" size={16} />
        {details ? "Hide how this works" : "How does the assistant work?"}
      </button>
      {details && (
        <Note>
          The local edition assembles evidence and returns transparent,
          topic-based explanations. An optional local server contains a bounded
          OpenAI agent workflow. It uses only the supplied evidence and cannot
          modify your plan, contact a provider, or connect a service. No API key
          is stored in this app.
        </Note>
      )}
      {available && (
        <div className="live-control">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
            />
            <div>
              <strong>Use live AI for this conversation</strong>
              <span>
                Your question, check-in context, goal, fictional profile and
                health history, and chart evidence will be sent to OpenAI. Use
                fictional details only. API usage is billed to the configured
                account.
              </span>
            </div>
          </label>
        </div>
      )}
    </Modal>
  );
}
