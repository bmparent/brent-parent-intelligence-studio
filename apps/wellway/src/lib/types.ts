export type Metric = "sleep" | "steps" | "energy";
export type Page =
  | "today"
  | "journey"
  | "plan"
  | "connections"
  | "advisor"
  | "help";
export type Observation = {
  id: string;
  date: string;
  metric: Metric;
  value: number;
  unit: string;
  sourceId: string;
  recordedAt: string;
  importedAt: string;
  note?: string;
};
export type Checkin = {
  id: string;
  date: string;
  energy: number;
  stress: number;
  minutes: number;
  note: string;
};
export type PlanItem = {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  time: string;
  doneDates: string[];
  kind: "movement" | "rest" | "reflect";
};
export type Connection = {
  id: string;
  name: string;
  state: "connected" | "disconnected";
  metrics: Metric[];
  lastSync: string | null;
  simulated: boolean;
};
export type ImportReport = {
  id: string;
  source: string;
  received: number;
  accepted: number;
  duplicates: number;
  rejected: number;
  issues: string[];
  at: string;
  sampleRecord?: Observation;
};
export type Review = {
  id: string;
  createdAt: string;
  context: string;
  proposal: string;
  status: "draft" | "approved" | "dismissed";
  approvedAt?: string;
  sources: string[];
  sourceRecords?: EvidenceRecord[];
  targetPlanId?: string;
  origin?: "guided" | "live";
};
export type EvidenceScope = {
  charts: boolean;
  history: boolean;
  checkin: boolean;
  plan: boolean;
};
export type EvidenceRecord = {
  id: string;
  kind:
    | "observation"
    | "missing"
    | "summary"
    | "history"
    | "profile"
    | "goal"
    | "plan"
    | "checkin"
    | "agenda";
  date: string | null;
  sourceId: string;
  text: string;
  metric?: Metric;
  value?: number | null;
  unit?: string;
  recordedAt?: string;
  importedAt?: string;
  sourceIds?: string[];
};
export type Evidence = {
  version: 2;
  fictional: true;
  asOf: string;
  window: {
    start: string;
    end: string;
    days: number;
    comparisonStart: string;
    comparisonEnd: string;
  };
  scope: EvidenceScope;
  records: EvidenceRecord[];
};
export type VisitDraft = {
  stage: "prepare" | "call" | "summary";
  agenda: string;
  scope: EvidenceScope;
  topic: string;
  visited: string[];
  note: string;
  origin: "guided" | "live";
  sources: string[];
  sourceRecords: EvidenceRecord[];
};
export type AppState = {
  schemaVersion: 1;
  demoDate: string;
  goal: string;
  observations: Observation[];
  checkins: Checkin[];
  plan: PlanItem[];
  connections: Connection[];
  imports: ImportReport[];
  reviews: Review[];
  tourDone: boolean;
  visitDraft?: VisitDraft;
};
export type Action =
  | { type: "checkin"; value: Checkin }
  | { type: "goal"; value: string }
  | { type: "plan"; value: PlanItem }
  | { type: "toggle"; id: string }
  | { type: "connect"; id: string; metrics: Metric[] }
  | { type: "disconnect"; id: string }
  | { type: "import"; records: Observation[]; report: ImportReport }
  | { type: "review"; value: Review }
  | { type: "review-edit"; id: string; proposal: string }
  | { type: "visit-draft"; value?: VisitDraft }
  | { type: "approve"; id: string; proposal: string }
  | { type: "dismiss"; id: string }
  | { type: "advance" }
  | { type: "restore"; value: AppState }
  | { type: "tour" };
