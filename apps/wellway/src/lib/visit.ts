import type { AppState, EvidenceScope, VisitDraft } from "./types";
import { evidence, fullScope } from "./data";

export const newVisit = (): VisitDraft => ({
  stage: "prepare",
  agenda: "",
  scope: { ...fullScope },
  topic: "routine",
  visited: [],
  note: "",
  origin: "guided",
  sources: [],
  sourceRecords: [],
});
export const topicLabels: Record<string, string> = {
  routine: "My routine",
  sleep: "My sleep",
  history: "My history",
};
export function visitEvidence(
  state: AppState,
  scope: EvidenceScope,
  agenda: string,
  topics: string[],
) {
  // Permission plus actual discussion determines the packet. Turning context off is authoritative.
  return evidence(state, {
    scope: {
      charts: scope.charts && topics.includes("sleep"),
      history: scope.history && topics.includes("history"),
      checkin: scope.checkin && topics.includes("routine"),
      plan: scope.plan && topics.includes("routine"),
    },
    agenda,
  });
}
export function guidedFollowup(state: AppState, visit: VisitDraft) {
  const packet = visitEvidence(state, visit.scope, visit.agenda, visit.visited);
  const ids: string[] = [];
  const paragraphs: string[] = [];
  if (visit.agenda.trim()) {
    paragraphs.push(`For the next conversation: ${visit.agenda.trim()}`);
    ids.push("visit:agenda");
  }
  if (visit.visited.includes("sleep") && visit.scope.charts) {
    const sleep = packet.records.find(
      (r) => r.id === "summary:sleep:displayed",
    )!;
    paragraphs.push(
      `Review the available sleep record with your advisor. ${sleep.text} Bring questions about the missing days; these observations do not establish a cause.`,
    );
    ids.push(sleep.id);
  }
  if (visit.visited.includes("history") && visit.scope.history) {
    paragraphs.push(
      "Review the supplied intake notes with your advisor and confirm which details remain relevant. No medical assessment or treatment change was made in this simulated visit.",
    );
    ids.push(
      ...packet.records.filter((r) => r.kind === "history").map((r) => r.id),
    );
  }
  if (visit.visited.includes("routine") && visit.scope.plan) {
    const plan = packet.records.find((r) => r.kind === "plan");
    if (plan) {
      paragraphs.push(
        `Discuss which timing feels manageable for the existing plan: ${plan.text} Record what fits before agreeing on a change.`,
      );
      ids.push(plan.id);
    }
  }
  if (!paragraphs.length)
    paragraphs.push(
      "Choose a question to bring to the next conversation. No personal context was included and no plan change has been proposed.",
    );
  return { text: paragraphs.join("\n\n"), sources: ids, evidence: packet };
}
