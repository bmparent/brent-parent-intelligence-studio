import { useRef, useState } from "react";
import { useStore } from "../lib/store";
import {
  downloadFile,
  validateBackup,
  seedState,
  dateLabel,
} from "../lib/data";
import type { AppState, Page } from "../lib/types";
import { PageTitle, Button, Note, Modal } from "../components/UI";
import { Icon } from "../components/Icon";
export function Help({
  tour,
  navigate,
}: {
  tour: () => void;
  navigate: (p: Page) => void;
}) {
  const { state, dispatch } = useStore();
  const [restore, setRestore] = useState<AppState | null>(null);
  const [reset, setReset] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function read(file?: File) {
    if (!file) return;
    setError("");
    setSaved("");
    try {
      if (file.size > 5000000)
        throw new Error("Please choose a Wellway backup smaller than 5 MB.");
      const s = JSON.parse(await file.text());
      if (!validateBackup(s))
        throw new Error(
          "This is not a valid Wellway v1 backup. Your current information has not changed.",
        );
      setRestore(s);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The backup could not be read.",
      );
    }
    if (input.current) input.current.value = "";
  }
  return (
    <>
      <PageTitle
        title="Find your way. Make it yours."
        description="A few simple habits help you get more from your wellness journey."
        action={
          <Button variant="outline" onClick={tour} icon="arrow">
            Take the guided tour
          </Button>
        }
      />
      <div className="help-steps">
        {[
          {
            n: "01",
            title: "Check in honestly",
            text: "Add energy, available time, and a little context. Consistent short entries are more useful than a perfect one.",
            page: "today",
            icon: "sun",
          },
          {
            n: "02",
            title: "Get curious about a pattern",
            text: "Explore a week. Select a day to see its source. Treat a change as a useful question, not a diagnosis.",
            page: "journey",
            icon: "chart",
          },
          {
            n: "03",
            title: "Choose one next step",
            text: "Make the existing plan fit your day, record what you did, and share what got in the way.",
            page: "plan",
            icon: "plan",
          },
        ].map((s) => (
          <button
            key={s.n}
            className="help-step"
            onClick={() => navigate(s.page as Page)}
          >
            <span className="step-number">{s.n}</span>
            <Icon name={s.icon} size={28} />
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <span className="text-link">
              Try it <Icon name="arrow" size={16} />
            </span>
          </button>
        ))}
      </div>
      <div className="two-column">
        <section className="panel">
          <h2>What works in this edition?</h2>
          <dl className="capability-list">
            <div>
              <dt>Check-ins, plans, and history</dt>
              <dd>Functional. Changes save in this browser.</dd>
            </div>
            <div>
              <dt>Charts and source records</dt>
              <dd>Calculated from your local sample data.</dd>
            </div>
            <div>
              <dt>CSV imports and backups</dt>
              <dd>Functional, with validation and duplicate handling.</dd>
            </div>
            <div>
              <dt>Health service connections</dt>
              <dd>Sample walkthroughs. No provider account is accessed.</dd>
            </div>
            <div>
              <dt>Advisor review</dt>
              <dd>
                Functional local workflow. It does not message a real advisor.
              </dd>
            </div>
            <div>
              <dt>AI assistance</dt>
              <dd>
                Local guided explanations by default. Live AI requires the
                optional local server and a configured API connection.
              </dd>
            </div>
            <div>
              <dt>GitHub and Google Drive</dt>
              <dd>
                Project source and file backups. There is no automatic
                browser-to-Drive sync.
              </dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Your data stays with you</h2>
          <p>
            This concept uses fictional records for Alex Parker. Your edits are
            stored in this browser, not a hosted patient database.
          </p>
          <p>
            Local storage is not encrypted clinical storage. Use sample
            information here. A private or cleared browser can lose local
            changes; export a backup if you want to keep them.
          </p>
          <div className="button-row">
            <Button
              variant="outline"
              onClick={() => {
                downloadFile(
                  "wellway-backup.json",
                  JSON.stringify(state, null, 2),
                );
                setSaved(
                  "Backup download requested. Keep the file somewhere you can find it.",
                );
              }}
              icon="download"
            >
              Export backup
            </Button>
            <Button
              variant="text"
              onClick={() => input.current?.click()}
              icon="upload"
            >
              Restore backup
            </Button>
          </div>
          <input
            ref={input}
            className="sr-only"
            type="file"
            accept=".json,application/json"
            aria-label="Restore Wellway backup"
            onChange={(e) => read(e.target.files?.[0])}
          />
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p className="success-text" role="status">
              {saved}
            </p>
          )}
          <hr />
          <h3>Start the demonstration again</h3>
          <p>
            Return to the original fictional story and demo date. Export first
            to keep any changes.
          </p>
          <Button variant="text" onClick={() => setReset(true)} icon="refresh">
            Reset demo
          </Button>
        </section>
      </div>
      <section className="panel faq">
        <h2>A few useful answers</h2>
        <details>
          <summary>Why is there a gap in my chart?</summary>
          <p>
            No reading is available on that day. Missing values stay empty and
            do not count toward averages. A wearable sync gap can have many
            causes; this app does not guess which one applies.
          </p>
        </details>
        <details>
          <summary>What if two services report the same day?</summary>
          <p>
            We preserve both sources and choose one preferred value for the
            chart. Direct check-ins lead for energy, and the sample wearable
            leads for device measurements. We do not add overlapping daily
            totals. Select a chart point to see if other records are present.
          </p>
        </details>
        <details>
          <summary>Will this tell me what medical condition I have?</summary>
          <p>
            No. This demonstration helps organize information and prepare useful
            questions. It does not diagnose, prescribe, estimate disease risk,
            or monitor emergencies. Medical interpretation and treatment
            decisions need qualified care.
          </p>
        </details>
        <details>
          <summary>Can I use it on another computer?</summary>
          <p>
            Yes. Export a backup, save the file in Google Drive, and open the
            standalone app on the other computer. Use Restore backup there.
            Changes do not automatically follow you between devices.
          </p>
        </details>
        <details>
          <summary>Is this the official Wellway member app?</summary>
          <p>
            This is a concept demonstration built by Eidos Works. It uses
            Wellway’s public wordmark, Spectral and Inter typography, and
            observed brand colors. It is not connected to Wellway’s live
            systems.
          </p>
        </details>
      </section>
      <Note icon="shield">
        Current demo day: {dateLabel(state.demoDate)}. Calendar controls advance
        fictional time only.
      </Note>
      {restore && (
        <Modal
          title="Restore this backup?"
          subtitle={`The backup has ${restore.observations.length} observations and ${restore.checkins.length} check-ins. It will replace this browser’s current demo state.`}
          onClose={() => setRestore(null)}
        >
          <div className="modal-actions">
            <Button variant="text" onClick={() => setRestore(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "restore", value: restore });
                setRestore(null);
                setSaved("Backup restored. Your history and plan are ready.");
              }}
              icon="check"
            >
              Restore backup
            </Button>
          </div>
        </Modal>
      )}
      {reset && (
        <Modal
          title="Start fresh with the sample story?"
          subtitle="This replaces your local edits with the original fictional records. Export a backup first if you want to keep them."
          onClose={() => setReset(false)}
        >
          <div className="modal-actions">
            <Button
              variant="text"
              onClick={() => {
                downloadFile(
                  "wellway-before-reset.json",
                  JSON.stringify(state, null, 2),
                );
              }}
            >
              Export first
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "restore", value: seedState() });
                setReset(false);
                navigate("today");
              }}
            >
              Reset local demo
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
