import { useState } from "react";
import { useStore } from "../lib/store";
import {
  summary,
  formatValue,
  dateLabel,
  evidence,
  downloadFile,
} from "../lib/data";
import { PageTitle, Button, Note, Empty } from "../components/UI";
import { Icon } from "../components/Icon";
import { Portrait, History } from "../components/Profiles";
import { VisitCard } from "../components/VideoVisit";
import { SupportingRecords } from "../components/Evidence";
export function Advisor({
  visit,
  profile,
}: {
  visit: () => void;
  profile: (person: "member" | "advisor") => void;
}) {
  const { state, dispatch, storageError } = useStore();
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const latest = state.checkins.at(-1);
  const sleep = summary(state, "sleep");
  const draft = state.reviews.find((r) => r.status === "draft");
  const proposal = draft?.proposal || "";
  const approved = state.reviews.find((r) => r.status === "approved");
  const createDraft = () => {
    const p =
      latest?.minutes && latest.minutes < 10
        ? `Try a ${latest.minutes}-minute version of the existing walk when it fits your day. Review how manageable it felt at your next check-in.`
        : "Review the timing of the existing short walk and record what felt manageable at the next check-in.";
    const packet = evidence(state, {
      scope: { charts: false, history: false, checkin: true, plan: true },
    });
    dispatch({
      type: "review",
      value: {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        context: latest?.note || "No additional context has been recorded.",
        proposal: p,
        status: "draft",
        sources: packet.records
          .filter((r) => r.kind === "plan" || r.kind === "checkin")
          .map((r) => r.id),
        sourceRecords: packet.records,
        targetPlanId: state.plan[0]?.id,
        origin: "guided",
      },
    });
  };
  const brief = () => {
    const review = draft || approved;
    const records = review?.sourceRecords || evidence(state).records;
    return `WELLWAY — FICTIONAL ADVISOR BRIEF\nScenario day: ${dateLabel(state.demoDate)}\nStatus: ${review?.status || "Not drafted"}\n\n${review?.context || "General preparation from the available scenario records."}\n\nNext step: ${review?.proposal || "No draft yet."}\n\nIncluded records:\n${records.map((r) => `${r.id} | ${r.date || "Current context"} | ${r.text}`).join("\n")}\n\nSimulated visit. No transcript or clinical assessment.`;
  };
  return (
    <>
      <PageTitle
        title="More context. A clearer conversation."
        description="Prepare for Alex’s next appointment, review the evidence, and agree on a manageable step."
        action={
          <Button
            variant="outline"
            onClick={() =>
              downloadFile("wellway-advisor-brief.txt", brief(), "text/plain")
            }
            icon="download"
          >
            Export brief
          </Button>
        }
      />
      <section className="member-strip">
        <button
          className="portrait-button"
          aria-label="View Alex’s member profile"
          onClick={() => profile("member")}
        >
          <Portrait />
        </button>
        <div>
          <h2>Alex Parker</h2>
          <p>{state.goal}</p>
        </div>
        <div className="member-context">
          <span>Last check-in</span>
          <strong>
            {latest ? dateLabel(latest.date, true) : "No check-in yet"}
          </strong>
        </div>
        <div className="member-context">
          <span>Open reviews</span>
          <strong>
            {state.reviews.filter((r) => r.status === "draft").length}
          </strong>
        </div>
      </section>
      <VisitCard onOpen={visit} onProfile={() => profile("advisor")} />
      <div className="advisor-grid">
        <div>
          <section className="panel">
            <div className="panel-heading">
              <h2>Since the last conversation</h2>
              <span className="status-pill">Recorded context</span>
            </div>
            <div className="brief-observation">
              <Icon name="moon" />
              <div>
                <h3>Recorded sleep</h3>
                <p>
                  {sleep.average === null
                    ? "No sleep records in this period."
                    : `Average ${formatValue(sleep.average, "sleep")} over ${sleep.coverage} recorded nights in the last seven days.`}
                </p>
                <button
                  className="text-button"
                  onClick={() => setEvidenceOpen(!evidenceOpen)}
                >
                  {evidenceOpen
                    ? "Hide source records"
                    : "Review source records"}
                </button>
              </div>
            </div>
            {evidenceOpen && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sleep</th>
                      <th>Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sleep.rows.map((r) => (
                      <tr key={r.date}>
                        <td>{dateLabel(r.date, true)}</td>
                        <td>{formatValue(r.value, "sleep")}</td>
                        <td className="record-id">
                          {r.record?.id || "Missing — excluded"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="brief-observation">
              <Icon name="file" />
              <div>
                <h3>In Alex’s words</h3>
                <blockquote>{latest?.note || "No note added yet."}</blockquote>
                <p className="muted small">
                  {latest
                    ? `${dateLabel(latest.date, true)} · Energy ${latest.energy}/5 · Stress ${latest.stress}/5 · ${latest.minutes} minutes available`
                    : "Invite a check-in in the member view."}
                </p>
              </div>
            </div>
            <Note>
              The record comparison does not establish a cause. Confirm context
              with Alex before interpreting the change.
            </Note>
          </section>
          <section className="panel">
            <h2>Questions worth asking</h2>
            <ul className="question-list">
              <li>What has changed in your daily schedule?</li>
              <li>Which part of the current plan feels easiest to fit in?</li>
              <li>What would make the next week more manageable?</li>
            </ul>
            <p className="muted small">
              Prepared conversation prompts. Adapt them to the member and your
              scope of practice.
            </p>
          </section>
        </div>
        <section className="panel review-panel">
          <h2>Agree on the next step</h2>
          {draft ? (
            <>
              <span className="status-pill">Draft · Review needed</span>
              <p>
                Check the source entries and edit the draft before adding it to
                the member’s plan.
              </p>
              <label className="field">
                Proposed plan adjustment
                <textarea
                  rows={6}
                  value={proposal}
                  maxLength={6500}
                  onChange={(e) =>
                    dispatch({
                      type: "review-edit",
                      id: draft.id,
                      proposal: e.target.value,
                    })
                  }
                />
              </label>
              <div className="button-row">
                <Button
                  onClick={() => {
                    dispatch({
                      type: "approve",
                      id: draft.id,
                      proposal: proposal.trim(),
                    });
                  }}
                  disabled={!proposal.trim()}
                  icon="check"
                >
                  Approve plan
                </Button>
                <Button
                  variant="text"
                  onClick={() => dispatch({ type: "dismiss", id: draft.id })}
                >
                  Dismiss
                </Button>
              </div>
              <p className="save-state" role="status">
                {storageError
                  ? "Edits could not be saved. Keep this view open."
                  : "Draft edits saved · Approval is still required"}
              </p>
              <p className="muted small">
                {draft.targetPlanId === "followup"
                  ? "Approval adds a follow-up to My plan without changing an activity."
                  : "Approval updates the selected activity note and adds a journey milestone."}
              </p>
              <SupportingRecords
                ids={draft.sources}
                records={draft.sourceRecords || []}
              />
            </>
          ) : (
            <>
              {approved ? (
                <div className="review-approved">
                  <span className="icon-disc">
                    <Icon name="check" />
                  </span>
                  <h3>Plan updated</h3>
                  <p>{approved.proposal}</p>
                  <small>
                    Approved{" "}
                    {approved.approvedAt
                      ? new Date(approved.approvedAt).toLocaleString()
                      : "in this workspace"}{" "}
                    · Actual action time
                  </small>
                  <Button variant="outline" onClick={createDraft} icon="edit">
                    Draft another adjustment
                  </Button>
                </div>
              ) : (
                <Empty
                  title="Prepare a useful starting point"
                  description="Create a draft from the recorded context and existing plan, then review it before use."
                >
                  <Button onClick={createDraft} icon="sparkles">
                    Prepare a draft
                  </Button>
                </Empty>
              )}
            </>
          )}
          <details>
            <summary>How was this draft prepared?</summary>
            <p>
              {draft?.origin === "live"
                ? "This draft began as a live AI response using the context included in the visit. Check its cited records and review your edits before approval."
                : "Guided drafts use the written agenda, selected topics, and included records. They are editable starting points; no live model was used."}
            </p>
            <button
              className="text-button"
              onClick={() =>
                downloadFile(
                  "wellway-evidence.json",
                  JSON.stringify(
                    draft?.sourceRecords || evidence(state).records,
                    null,
                    2,
                  ),
                )
              }
            >
              Export the evidence package
            </button>
          </details>
        </section>
      </div>
      <section className="panel history-panel">
        <History />
      </section>
    </>
  );
}
