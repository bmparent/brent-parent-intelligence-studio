import { useState } from "react";
import { useStore } from "../lib/store";
import { evidence } from "../lib/data";
import {
  guidedFollowup,
  newVisit,
  topicLabels,
  visitEvidence,
} from "../lib/visit";
import { useAI } from "../lib/useAI";
import type { EvidenceScope, VisitDraft } from "../lib/types";
import { Button, Modal, Note } from "./UI";
import { Icon } from "./Icon";
import { Portrait } from "./Profiles";
import { SupportingRecords } from "./Evidence";

export function VisitCard({
  onOpen,
  onProfile,
}: {
  onOpen: () => void;
  onProfile: () => void;
}) {
  const { state } = useStore();
  return (
    <section className="visit-card ww-glass">
      <button
        className="portrait-button"
        onClick={onProfile}
        aria-label="View Maya’s advisor profile"
      >
        <Portrait person="advisor" />
      </button>
      <div className="visit-card-copy">
        <span className="muted small">Your advisor · Maya Chen</span>
        <h3>A little time to connect.</h3>
        <p>
          {state.visitDraft
            ? "Your agenda and follow-up are saved. Pick up where you left off."
            : "Bring your week, your questions, and what’s changed."}
        </p>
      </div>
      <Button variant="outline" icon="video" onClick={onOpen}>
        {state.visitDraft ? "Resume visit" : "Join visit"}
      </Button>
    </section>
  );
}
export function VideoVisit({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { state, dispatch, storageError } = useStore();
  const v = state.visitDraft || newVisit();
  const update = (patch: Partial<VisitDraft>) =>
    dispatch({ type: "visit-draft", value: { ...v, ...patch } });
  const [camera, setCamera] = useState(true),
    [mic, setMic] = useState(false),
    [captions, setCaptions] = useState(true);
  const ai = useAI();
  const [brief, setBrief] = useState<{
    text: string;
    sources: string[];
    records: ReturnType<typeof evidence>["records"];
  } | null>(null);
  const selectedPacket = visitEvidence(state, v.scope, v.agenda, v.visited);
  const allowedTopics = Object.keys(topicLabels).filter(
    (t) =>
      t === "routine" ||
      (t === "sleep" && v.scope.charts) ||
      (t === "history" && v.scope.history),
  );
  const caption = () => {
    const p = visitEvidence(state, v.scope, v.agenda, [v.topic]);
    if (v.topic === "sleep")
      return (
        p.records.find((r) => r.id === "summary:sleep:displayed")?.text ||
        "Sleep records were not included."
      );
    if (v.topic === "history")
      return "Review which intake details are still relevant. A past note does not establish what is appropriate today.";
    return v.scope.plan
      ? `Your existing focus is “${state.goal}.” Which part of the routine would you like to make easier?`
      : "Use your written agenda to prepare a question. Your existing plan was not shared.";
  };
  const end = () => {
    const draft = guidedFollowup(state, v);
    update({
      stage: "summary",
      note: draft.text,
      origin: "guided",
      sources: draft.sources,
      sourceRecords: draft.evidence.records,
    });
  };
  async function generate(mode: "preparation" | "followup") {
    const packet =
      mode === "preparation"
        ? evidence(state, { scope: v.scope, agenda: v.agenda })
        : selectedPacket;
    const result = await ai.ask(
      mode,
      mode === "preparation"
        ? "Prepare a short brief and questions for this agenda using only included context."
        : `Prepare an editable follow-up for the written agenda and these explored topics: ${v.visited.map((t) => topicLabels[t]).join(", ") || "none"}. No transcript exists.`,
      packet,
    );
    if (!result) return;
    const text = result.segments.map((s) => s.text).join("\n\n");
    if (mode === "preparation")
      setBrief({ text, sources: result.sources, records: packet.records });
    else
      update({
        note: text,
        origin: "live",
        sources: result.sources,
        sourceRecords: packet.records,
      });
  }
  const save = () => {
    if (!v.note.trim()) return;
    dispatch({
      type: "review",
      value: {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        context: `Simulated visit. Agenda: ${v.agenda.trim() || "Not supplied"}. Topics explored: ${v.visited.map((t) => topicLabels[t]).join(", ") || "None"}.`,
        proposal: v.note.trim(),
        status: "draft",
        sources: v.sources,
        sourceRecords: v.sourceRecords,
        targetPlanId:
          v.scope.plan && v.visited.includes("routine")
            ? state.plan[0]?.id
            : "followup",
        origin: v.origin,
      },
    });
    dispatch({ type: "visit-draft", value: undefined });
    onSaved();
  };
  return (
    <Modal
      title={
        v.stage === "prepare"
          ? "Make room for a conversation."
          : v.stage === "call"
            ? "Your visit with Maya."
            : "Leave with a clear next step."
      }
      subtitle="Simulated visit · No person connected · Camera and microphone are simulated"
      onClose={onClose}
      wide
    >
      <div className="visit-progress" aria-label="Visit progress">
        {["Prepare", "Visit", "Follow-up"].map((s, i) => (
          <span
            key={s}
            className={
              i === { prepare: 0, call: 1, summary: 2 }[v.stage] ? "active" : ""
            }
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>
      <p className="save-state" role="status">
        {storageError
          ? "Changes could not be saved. Keep this window open."
          : state.visitDraft
            ? "Draft saved in this browser · Safe to close and resume"
            : "Add an agenda to get started"}
      </p>
      {v.stage === "prepare" ? (
        <>
          <div className="visit-preflight">
            <div className="sample-camera">
              <Portrait className="portrait-scene" />
              <span>Alex · Simulated camera</span>
            </div>
            <div>
              <h3>Maya Chen</h3>
              <p>Bring one question you would like to explore.</p>
              <label className="field">
                What would you like to talk about?
                <textarea
                  disabled={ai.pending}
                  value={v.agenda}
                  rows={3}
                  maxLength={500}
                  onChange={(e) => {
                    update({ agenda: e.target.value });
                    setBrief(null);
                  }}
                />
              </label>
              <fieldset className="visit-scope">
                <legend>Context to include</legend>
                {(
                  [
                    ["charts", "Charts"],
                    ["history", "Health history"],
                    ["checkin", "Check-ins"],
                    ["plan", "Current plan and focus"],
                  ] as [keyof EvidenceScope, string][]
                ).map(([k, label]) => (
                  <label className="checkbox-row" key={k}>
                    <input
                      disabled={ai.pending}
                      type="checkbox"
                      checked={v.scope[k]}
                      onChange={(e) => {
                        update({
                          scope: { ...v.scope, [k]: e.target.checked },
                          sources: [],
                          sourceRecords: [],
                        });
                        setBrief(null);
                      }}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
            </div>
          </div>
          <div className="button-row">
            <Button
              variant="outline"
              disabled={ai.pending || ai.availability !== "ready"}
              onClick={() => generate("preparation")}
              icon="sparkles"
            >
              Prepare summary with live AI
            </Button>
            <small>
              {ai.availability === "ready"
                ? "Sends only the selected fictional context to OpenAI."
                : "Live AI unavailable · You can prepare and join the simulated visit."}
            </small>
          </div>
          {brief && (
            <section className="assistant-answer">
              <span className="status-pill">Live AI preparation</span>
              <p className="answer-text">{brief.text}</p>
              <SupportingRecords ids={brief.sources} records={brief.records} />
            </section>
          )}
          <div className="modal-actions">
            <Button variant="text" onClick={onClose}>
              Close and resume later
            </Button>
            <Button
              disabled={ai.pending}
              icon="video"
              onClick={() => {
                const first =
                  /sleep|rest/i.test(v.agenda) && v.scope.charts
                    ? "sleep"
                    : /history|knee|allerg/i.test(v.agenda) && v.scope.history
                      ? "history"
                      : "routine";
                update({ stage: "call", topic: first, visited: [first] });
              }}
            >
              Join visit
            </Button>
          </div>
        </>
      ) : v.stage === "call" ? (
        <>
          <div className="visit-room">
            <div className="advisor-stage">
              <Portrait person="advisor" className="portrait-scene" />
              <span className="visit-sim-label">SIMULATED VISIT</span>
              <div className="visit-name">
                Maya Chen <span>Fictional advisor · No connection</span>
              </div>
              <div className="member-pip">
                {camera ? (
                  <Portrait className="portrait-scene" />
                ) : (
                  <div className="camera-off">
                    <Icon name="video" />
                    <span>Camera hidden</span>
                  </div>
                )}
                <span>
                  Alex · {mic ? "Simulated mic on" : "Simulated mic muted"}
                </span>
              </div>
            </div>
            <aside className="visit-discussion">
              <h3>Bring your context</h3>
              <p>{v.agenda || "Explore one part of your week."}</p>
              <div className="topic-buttons">
                {allowedTopics.map((t) => (
                  <button
                    key={t}
                    aria-pressed={v.topic === t}
                    onClick={() =>
                      update({
                        topic: t,
                        visited: v.visited.includes(t)
                          ? v.visited
                          : [...v.visited, t],
                      })
                    }
                  >
                    {topicLabels[t]}
                    <Icon name="arrow" size={15} />
                  </button>
                ))}
              </div>
              {captions ? (
                <div className="visit-caption" role="status">
                  <small>Scripted discussion prompt</small>
                  <p>{caption()}</p>
                </div>
              ) : (
                <p>Discussion prompts are hidden.</p>
              )}
              <small className="muted">
                Only selected context is included. No call is placed or
                recorded.
              </small>
            </aside>
          </div>
          <div className="call-controls ww-glass">
            <button aria-pressed={mic} onClick={() => setMic(!mic)}>
              <Icon name="mic" />
              <span>{mic ? "Mute" : "Unmute"}</span>
            </button>
            <button aria-pressed={camera} onClick={() => setCamera(!camera)}>
              <Icon name="video" />
              <span>{camera ? "Hide camera" : "Show camera"}</span>
            </button>
            <button
              aria-pressed={captions}
              onClick={() => setCaptions(!captions)}
            >
              <Icon name="file" />
              <span>{captions ? "Hide captions" : "Show captions"}</span>
            </button>
            <Button onClick={end} icon="phone">
              End visit
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="visit-summary-head">
            <Portrait person="advisor" />
            <div>
              <h3>Your conversation, carried forward.</h3>
              <p>
                Review the draft, then send it to the advisor view for a
                separate approval.
              </p>
            </div>
          </div>
          <span className="status-pill">
            {v.origin === "live"
              ? "Live AI draft · Editable"
              : "Guided draft · No live model"}
          </span>
          <p className="muted small">
            Topics explored:{" "}
            {v.visited.map((t) => topicLabels[t]).join(" · ") || "None"}
          </p>
          <label className="field">
            Editable follow-up draft
            <textarea
              disabled={ai.pending}
              rows={6}
              maxLength={6500}
              value={v.note}
              onChange={(e) => update({ note: e.target.value })}
            />
          </label>
          <SupportingRecords ids={v.sources} records={v.sourceRecords} />
          <Note>
            The draft uses the written agenda and selected topics. No transcript
            exists. Approval is a separate action.
          </Note>
          <div className="button-row">
            <Button
              variant="outline"
              disabled={ai.pending || ai.availability !== "ready"}
              onClick={() => generate("followup")}
              icon="sparkles"
            >
              Prepare follow-up with live AI
            </Button>
            <small>
              {ai.availability === "ready"
                ? "Sends the included fictional visit context to OpenAI."
                : "Live AI unavailable · Your guided draft is editable."}
            </small>
          </div>
          <div className="modal-actions">
            <Button variant="text" onClick={onClose}>
              Close and resume later
            </Button>
            <Button
              disabled={!v.note.trim() || ai.pending}
              onClick={save}
              icon="check"
            >
              Save for advisor review
            </Button>
          </div>
        </>
      )}
      {ai.pending && (
        <div className="ai-progress" role="status">
          Preparing from the selected context…
          <Button variant="text" onClick={ai.cancel}>
            Cancel request
          </Button>
        </div>
      )}
      {ai.error && (
        <p className="error-text" role="alert">
          {ai.error} Use the preparation button to retry.
        </p>
      )}
      {ai.cancelled && (
        <p role="status">Request cancelled. Your draft is unchanged.</p>
      )}
    </Modal>
  );
}
