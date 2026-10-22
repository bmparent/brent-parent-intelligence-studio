import { useState } from "react";
import { useStore } from "../lib/store";
import { evidence, dateLabel } from "../lib/data";
import { useAI } from "../lib/useAI";
import type { Segment, Turn } from "../lib/ai-contract";
import type { Evidence } from "../lib/types";
import { Modal, Button, Note } from "./UI";
import { Icon } from "./Icon";
import { SupportingRecords } from "./Evidence";

type Message = {
  question: string;
  segments: Segment[];
  mode: "live" | "guided";
  evidence: Evidence;
};
function guided(
  question: string,
  packet: Evidence,
  previous: Message[],
): Segment[] {
  let q = question.toLowerCase();
  if (/that day|that reading|what about/.test(q))
    q += " " + (previous.at(-1)?.question.toLowerCase() || "");
  const iso = q.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  const named = q.match(/(?:sep(?:tember)?|aug(?:ust)?)\s+(\d{1,2})/);
  const date =
    iso ||
    (named
      ? `2026-${named[0].startsWith("aug") ? "08" : "09"}-${named[1].padStart(2, "0")}`
      : null);
  const metric = /step|movement|walk/.test(q)
    ? "steps"
    : /energy/.test(q)
      ? "energy"
      : "sleep";
  if (date) {
    const r = packet.records.find(
      (r) =>
        r.date === date &&
        r.metric === metric &&
        ["observation", "missing"].includes(r.kind),
    );
    return r
      ? [
          {
            kind: "explanation",
            text: `On ${dateLabel(date)}, ${r.text} This is a scenario record, not a recent provider sync.`,
            sourceIds: [r.id],
          },
        ]
      : [
          {
            kind: "question",
            text: "That day is outside the available chart window. Select a longer period in My journey, then reopen the assistant.",
            sourceIds: [],
          },
        ];
  }
  if (/history|allerg|medication|profile|knee/.test(q)) {
    const records = packet.records.filter(
      (r) => r.kind === "history" || r.kind === "profile",
    );
    return [
      {
        kind: "explanation",
        text: "The supplied fictional intake describes a past knee strain, seasonal allergies, and a reported medication with no product or dose recorded. These notes are unverified context for a conversation, not a clinical assessment.",
        sourceIds: records
          .filter((r) => r.kind === "profile" || /knee|review/.test(r.id))
          .map((r) => r.id),
      },
    ];
  }
  if (/plan|minute|time|today/.test(q) && !/sleep/.test(q)) {
    const goal = packet.records.find((r) => r.kind === "goal")!,
      plan = packet.records.find((r) => r.kind === "plan")!;
    return [
      {
        kind: "explanation",
        text: `Your focus is “${goal.text}.” Your existing plan includes: ${plan.text} Review its timing in My plan and choose what feels manageable. A reading does not establish medical readiness.`,
        sourceIds: [goal.id, plan.id],
      },
    ];
  }
  if (/connect|sync|import/.test(q))
    return [
      {
        kind: "question",
        text: "Connections offers sample service walkthroughs and CSV import. No provider account is connected. For a reading’s origin, select its date in My journey and inspect its source.",
        sourceIds: [],
      },
    ];
  const r = packet.records.find((r) => r.id === `summary:${metric}:displayed`)!;
  const comparison = packet.records.find(
    (r) => r.id === `summary:${metric}:comparison`,
  )!;
  return [
    {
      kind: "explanation",
      text: `${r.text}\n${comparison.text}\nThese records describe a difference, not its cause. Select a day to inspect it or ask about a specific date.`,
      sourceIds: [r.id, comparison.id],
    },
  ];
}
export function Assistant({
  onClose,
  days = 7,
}: {
  onClose: () => void;
  days?: number;
}) {
  const { state } = useStore();
  const ai = useAI();
  const [question, setQuestion] = useState("");
  const [live, setLive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const packet = evidence(state, { days });
  async function ask(q = question) {
    if (!q.trim() || ai.pending) return;
    setQuestion(q);
    if (live) {
      const history: Turn[] = messages.flatMap((m) => [
        { role: "user" as const, content: m.question },
        {
          role: "assistant" as const,
          content: m.segments.map((s) => s.text).join("\n"),
        },
      ]);
      const result = await ai.ask("member", q, packet, history);
      if (result)
        setMessages((m) => [
          ...m,
          {
            question: q,
            segments: result.segments,
            mode: "live",
            evidence: packet,
          },
        ]);
    } else
      setMessages((m) => [
        ...m,
        {
          question: q,
          segments: guided(q, packet, m),
          mode: "guided",
          evidence: packet,
        },
      ]);
  }
  return (
    <Modal
      title="Understand your journey."
      subtitle={`${dateLabel(packet.window.start, true)} – ${dateLabel(packet.window.end, true)} · ${days} scenario days`}
      onClose={onClose}
      wide
    >
      <div className="assistant-intro">
        <span className="icon-disc">
          <Icon name="sparkles" size={28} />
        </span>
        <p>
          Explore a pattern, inspect its sources, and bring a useful question to
          your next conversation.
        </p>
      </div>
      <div className="assistant-mode">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={live}
            disabled={ai.pending || ai.availability !== "ready"}
            onChange={(e) => {
              setLive(e.target.checked);
              setMessages([]);
            }}
          />
          <span>
            <strong>Use live AI</strong>
            <small>
              {ai.availability === "checking"
                ? "Checking connection…"
                : ai.availability === "ready"
                  ? "Available · Sends the supplied fictional records and this conversation to OpenAI."
                  : "Unavailable · Guided answers are available."}
            </small>
          </span>
        </label>
        {ai.availability === "unavailable" && (
          <Button variant="text" onClick={ai.check}>
            Check connection
          </Button>
        )}
      </div>
      <div className="prompt-chips">
        {[
          "What changed this week?",
          "How can I fit my plan into today?",
          "What happened on September 8?",
          "What is in my history?",
        ].map((q) => (
          <button key={q} disabled={ai.pending} onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="conversation" aria-live="polite">
        {messages.map((m, i) => (
          <article className="conversation-turn" key={i}>
            <h3>{m.question}</h3>
            <small className="status-pill">
              {m.mode === "live"
                ? "Live AI response"
                : "Guided answer · No live model"}
            </small>
            {m.segments.map((s, n) => (
              <div key={n}>
                <p className="answer-text">{s.text}</p>
                <SupportingRecords
                  ids={s.sourceIds}
                  records={m.evidence.records}
                />
              </div>
            ))}
          </article>
        ))}
      </div>
      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
      >
        <label className="sr-only" htmlFor="ask-question">
          Your question
        </label>
        <input
          id="ask-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={1000}
          placeholder={
            messages.length
              ? "Ask a follow-up…"
              : "Ask about your week, plan, or a date…"
          }
        />
        <Button
          type="submit"
          icon="send"
          disabled={!question.trim() || ai.pending}
        >
          Ask
        </Button>
      </form>
      {ai.pending && (
        <div className="ai-progress" role="status">
          Reading the supplied records…
          <Button variant="text" onClick={ai.cancel}>
            Cancel request
          </Button>
        </div>
      )}
      {ai.cancelled && (
        <p role="status">Request cancelled. No answer was added.</p>
      )}
      {ai.error && (
        <div className="ai-error" role="alert">
          <p>{ai.error}</p>
          <Button variant="outline" onClick={() => ask()}>
            Retry
          </Button>
        </div>
      )}
      <Note>
        Use fictional details only. Explanations help you prepare questions;
        they do not diagnose, monitor your health, or approve a plan.
      </Note>
    </Modal>
  );
}
