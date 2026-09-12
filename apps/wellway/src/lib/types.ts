export type Metric = "sleep" | "steps" | "energy";
export type Page =
  "today" | "journey" | "plan" | "connections" | "advisor" | "help";
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
  | { type: "approve"; id: string; proposal: string }
  | { type: "dismiss"; id: string }
  | { type: "advance" }
  | { type: "restore"; value: AppState }
  | { type: "tour" };
