import { useState } from "react";
import { useStore } from "../lib/store";
import { summary, formatValue } from "../lib/data";
import { healthHistory } from "../lib/profiles";
import { Button, Modal, Note } from "./UI";
import { Icon } from "./Icon";
import { Portrait } from "./Profiles";

export function VisitCard({
  onOpen,
  onProfile,
}: {
  onOpen: () => void;
  onProfile: () => void;
}) {
  return (
    <section className="visit-card">
      <button
        className="portrait-button"
        onClick={onProfile}
        aria-label="View Maya’s advisor profile"
      >
        <Portrait person="advisor" />
      </button>
      <div className="visit-card-copy">
        <span className="muted small">Your advisor · Demo persona</span>
        <h3>A little time to connect.</h3>
        <p>
          Meet Maya Chen. Bring your week, your questions, and what’s changed.
        </p>
      </div>
      <Button variant="outline" icon="video" onClick={onOpen}>
        Try a video visit
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
  const { state, dispatch } = useStore();
  const [stage, setStage] = useState<"prepare" | "call" | "summary">("prepare");
  const [camera, setCamera] = useState(true);
  const [mic, setMic] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [shared, setShared] = useState(true);
  const [topic, setTopic] = useState("routine");
  const [agenda, setAgenda] = useState(
    "How can I fit my routine around an earlier shift?",
  );
  const [note, setNote] = useState("");
  const [visited, setVisited] = useState<string[]>(["routine"]);
  const sleep = summary(state, "sleep");
  const current = state.checkins.at(-1);
  const walk = state.plan.find((p) => p.id === "walk") || state.plan[0];
  const topics = [
    {
      id: "routine",
      title: "My routine",
      line: `Your focus is ${state.goal.toLowerCase()}. ${current ? `Your latest check-in leaves ${current.minutes} minutes available.` : "Start with the amount of time that feels manageable today."} Which part of your existing routine would you like to make easier?`,
    },
    {
      id: "sleep",
      title: "My sleep",
      line:
        sleep.average === null
          ? "There are no sleep records in the last week. Let’s acknowledge that gap before drawing any conclusions."
          : `Your recorded sleep averages ${formatValue(sleep.average, "sleep")} across ${sleep.coverage} of 7 nights. That describes the available records; it does not tell us why things changed.`,
    },
    {
      id: "history",
      title: "My history",
      line: "Your fictional intake mentions an old knee strain and a preference for short walks. That is context to discuss, not proof that a particular activity is appropriate today.",
    },
  ];
  const selected = topics.find((t) => t.id === topic)!;
  const endVisit = () => {
    setNote(
      `Discuss the timing of “${walk.title}” (${walk.minutes} minutes) around the changed work schedule. Keep the next step within the existing plan and review what felt manageable at the next check-in.`,
    );
    setStage("summary");
  };
  const save = () => {
    if (!note.trim()) return;
    dispatch({
      type: "review",
      value: {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        context: `Simulated video visit. Member agenda: ${agenda.trim() || "No agenda added."} Topics explored: ${visited.map((id) => topics.find((t) => t.id === id)!.title).join(", ")}.`,
        proposal: note.trim(),
        status: "draft",
        sources: shared
          ? [
              ...sleep.rows.flatMap((r) => (r.record ? [r.record.id] : [])),
              ...healthHistory.map((h) => h.id),
            ]
          : [],
      },
    });
    onSaved();
  };
  return (
    <Modal
      title={
        stage === "prepare"
          ? "Make room for a conversation."
          : stage === "call"
            ? "Your visit with Maya."
            : "Leave with a clear next step."
      }
      subtitle="Video-visit simulation · No camera, microphone, recording, or connection to another person"
      onClose={onClose}
      wide
    >
      <div className="visit-progress" aria-label="Visit progress">
        {["Prepare", "Explore visit", "Follow-up"].map((s, i) => (
          <span
            key={s}
            className={
              i === { prepare: 0, call: 1, summary: 2 }[stage] ? "active" : ""
            }
          >
            {i + 1}. {s}
          </span>
        ))}
      </div>
      {stage === "prepare" ? (
        <>
          <div className="visit-preflight">
            <div className="sample-camera">
              <Portrait className="portrait-scene" />
              <span>Alex · Sample camera image</span>
            </div>
            <div>
              <h3>Maya Chen</h3>
              <p>
                Your fictional advisor will help you explore how your week and
                your existing plan fit together.
              </p>
              <label className="field">
                What would you like to talk about?
                <textarea
                  value={agenda}
                  maxLength={500}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={3}
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={shared}
                  onChange={(e) => setShared(e.target.checked)}
                />
                <span>
                  Include my fictional charts and history in this visit
                </span>
              </label>
            </div>
          </div>
          <Note>
            Try the controls and discussion topics. Portraits and advisor
            captions are scripted demonstration content, not a live call or
            generated AI response.
          </Note>
          <div className="modal-actions">
            <Button variant="text" onClick={onClose}>
              Not now
            </Button>
            <Button
              icon="video"
              onClick={() => {
                setVisited(["routine"]);
                setStage("call");
              }}
            >
              Enter demo visit
            </Button>
          </div>
        </>
      ) : stage === "call" ? (
        <>
          <div className="visit-room">
            <div className="advisor-stage">
              <Portrait person="advisor" className="portrait-scene" />
              <span className="visit-sim-label">
                SIMULATED VISIT · STATIC PORTRAITS
              </span>
              <div className="visit-name">
                <i />
                Maya Chen <span>Fictional advisor</span>
              </div>
              <div className="member-pip">
                {camera ? (
                  <Portrait className="portrait-scene" />
                ) : (
                  <div className="camera-off">
                    <Icon name="video" />
                    <span>Sample camera off</span>
                  </div>
                )}
                <span>Alex · {mic ? "Demo mic on" : "Demo mic muted"}</span>
              </div>
            </div>
            <aside className="visit-discussion">
              <h3>Bring your context</h3>
              <p>{agenda || "Explore one part of your week."}</p>
              <div className="topic-buttons">
                {topics
                  .filter((t) => shared || t.id === "routine")
                  .map((t) => (
                    <button
                      key={t.id}
                      aria-pressed={topic === t.id}
                      onClick={() => {
                        setTopic(t.id);
                        setVisited((v) =>
                          v.includes(t.id) ? v : [...v, t.id],
                        );
                      }}
                    >
                      {t.title}
                      <Icon name="arrow" size={15} />
                    </button>
                  ))}
              </div>
              {captions ? (
                <div className="visit-caption" role="status">
                  <small>Scripted advisor caption</small>
                  <p>
                    {shared
                      ? selected.line
                      : "You chose not to share charts or history. We can use your written agenda to prepare a question for your advisor."}
                  </p>
                </div>
              ) : (
                <p className="muted small">
                  Scripted captions are hidden. Turn them on below to explore
                  the sample conversation.
                </p>
              )}
              <small className="muted">
                {shared
                  ? "Fictional context included"
                  : "Charts and history not shared"}{" "}
                · Nothing is transmitted.
              </small>
            </aside>
          </div>
          <div className="call-controls">
            <button aria-pressed={mic} onClick={() => setMic(!mic)}>
              <Icon name="mic" />
              <span>{mic ? "Mute demo mic" : "Unmute demo mic"}</span>
            </button>
            <button aria-pressed={camera} onClick={() => setCamera(!camera)}>
              <Icon name="video" />
              <span>
                {camera ? "Hide sample camera" : "Show sample camera"}
              </span>
            </button>
            <button
              aria-pressed={captions}
              onClick={() => setCaptions(!captions)}
            >
              <Icon name="file" />
              <span>{captions ? "Hide captions" : "Show captions"}</span>
            </button>
            <Button onClick={endVisit} icon="phone">
              End demo visit
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
                Review this scripted follow-up. Saving creates a draft; your
                plan changes only after approval in Advisor.
              </p>
            </div>
          </div>
          <p className="muted small">
            Topics explored:{" "}
            {visited
              .map((id) => topics.find((t) => t.id === id)!.title)
              .join(" · ")}
          </p>
          <label className="field">
            Editable follow-up draft
            <textarea
              rows={5}
              maxLength={1200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <Note>
            No call was placed or recorded. This is a scripted demonstration
            summary, not a transcript or AI-generated clinical note.
          </Note>
          <div className="modal-actions">
            <Button variant="text" onClick={onClose}>
              Discard
            </Button>
            <Button disabled={!note.trim()} onClick={save} icon="check">
              Save for advisor review
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
