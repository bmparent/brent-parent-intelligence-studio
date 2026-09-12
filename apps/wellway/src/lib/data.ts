import type {
  AppState,
  Metric,
  Observation,
  Action,
  ImportReport,
} from "./types";
export const DEMO_DATE = "2026-09-12";
export const STORAGE_KEY = "wellway.journey.v1";
export const metricInfo: Record<
  Metric,
  {
    name: string;
    unit: string;
    color: string;
    range: [number, number];
    ticks: number[];
  }
> = {
  sleep: {
    name: "Sleep",
    unit: "hours",
    color: "#008da6",
    range: [0, 12],
    ticks: [0, 4, 8, 12],
  },
  steps: {
    name: "Movement",
    unit: "steps",
    color: "#168978",
    range: [0, 16000],
    ticks: [0, 4000, 8000, 12000, 16000],
  },
  energy: {
    name: "Energy",
    unit: "out of 5",
    color: "#7967bd",
    range: [0, 5],
    ticks: [0, 1, 2, 3, 4, 5],
  },
};
export const day = (date: string, offset = 0) =>
  new Date(Date.parse(date + "T12:00:00Z") + offset * 86400000)
    .toISOString()
    .slice(0, 10);
export const dateLabel = (date: string, short = false) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
export const weekday = (date: string) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
export function formatValue(value: number | null | undefined, metric: Metric) {
  if (value == null) return "No record";
  if (metric === "sleep") {
    const minutes = Math.round(value * 60);
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
  }
  if (metric === "steps") return Math.round(value).toLocaleString("en-US");
  return `${value} / 5`;
}
export function seedState(): AppState {
  const sleep = [
    7.2,
    7.5,
    7.1,
    7.8,
    7.4,
    6.8,
    7.6,
    7.5,
    7.2,
    7.7,
    7.3,
    7.4,
    7.1,
    7.6,
    7.2,
    7,
    6.8,
    7.1,
    6.5,
    6.9,
    7,
    6.4,
    6.9,
    null,
    7.2,
    5.8,
    6.8,
    6.7,
  ];
  const steps = [
    6240, 5800, 7400, 6800, 4900, 8200, 7600, 6700, 7200, 5400, 8800, 6700,
    6500, 7700, 5800, 6200, 4300, 7900, 6500, 5400, 7100, 5600, 6100, 4900,
    7500, 5300, 8100, 6240,
  ];
  const energy = [
    4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 3, 3, 4, 3, 3, 3, 4, 2, 3, 3, 3, 3, 2, 4,
    2, 3, 3,
  ];
  const observations: Observation[] = [];
  for (let i = 0; i < 28; i++) {
    const date = day(DEMO_DATE, i - 27);
    for (const metric of ["sleep", "steps", "energy"] as Metric[]) {
      const value =
        metric === "sleep"
          ? sleep[i]
          : metric === "steps"
            ? steps[i]
            : energy[i];
      if (value === null) continue;
      observations.push({
        id: `sample-${metric}-${date}`,
        date,
        metric,
        value,
        unit: metric === "sleep" ? "h" : metric === "steps" ? "steps" : "score",
        sourceId: metric === "energy" ? "checkins" : "sample-watch",
        recordedAt: date + "T08:00:00Z",
        importedAt: DEMO_DATE + "T12:00:00Z",
      });
    }
  }
  return {
    schemaVersion: 1,
    demoDate: DEMO_DATE,
    goal: "More consistent energy",
    observations,
    checkins: [
      {
        id: "initial-checkin",
        date: day(DEMO_DATE, -1),
        energy: 3,
        stress: 3,
        minutes: 15,
        note: "My work schedule changed this week. Shorter activities are easier to fit in.",
      },
    ],
    plan: [
      {
        id: "walk",
        title: "Make room for a short walk",
        detail: "Choose a comfortable pace and a time that works for you.",
        minutes: 10,
        time: "After lunch",
        doneDates: [],
        kind: "movement",
      },
      {
        id: "winddown",
        title: "Make a little space to wind down",
        detail: "Put one small pause between the day and your evening.",
        minutes: 10,
        time: "This evening",
        doneDates: [],
        kind: "rest",
      },
      {
        id: "reflect",
        title: "Notice what worked",
        detail: "A quick note helps you and your advisor understand your week.",
        minutes: 2,
        time: "Before bed",
        doneDates: [],
        kind: "reflect",
      },
    ],
    connections: [
      {
        id: "sample-watch",
        name: "Sample wearable",
        state: "connected",
        metrics: ["sleep", "steps"],
        lastSync: DEMO_DATE + "T12:00:00Z",
        simulated: true,
      },
      {
        id: "checkins",
        name: "Your check-ins",
        state: "connected",
        metrics: ["energy"],
        lastSync: DEMO_DATE + "T12:00:00Z",
        simulated: false,
      },
      {
        id: "sample-ring",
        name: "Sample sleep tracker",
        state: "disconnected",
        metrics: ["sleep"],
        lastSync: null,
        simulated: true,
      },
      {
        id: "apple-health",
        name: "Apple Health",
        state: "disconnected",
        metrics: ["sleep", "steps"],
        lastSync: null,
        simulated: true,
      },
      {
        id: "health-connect",
        name: "Health Connect",
        state: "disconnected",
        metrics: ["sleep", "steps"],
        lastSync: null,
        simulated: true,
      },
    ],
    imports: [],
    reviews: [],
    tourDone: false,
  };
}
export function series(state: AppState, metric: Metric, days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const date = day(state.demoDate, i - days + 1);
    const records = state.observations.filter(
      (x) => x.date === date && x.metric === metric,
    );
    const record = records.slice().sort((a, b) => {
      const aP =
        a.sourceId === "checkins" ? 3 : a.sourceId === "sample-watch" ? 2 : 1;
      const bP =
        b.sourceId === "checkins" ? 3 : b.sourceId === "sample-watch" ? 2 : 1;
      return bP - aP || b.importedAt.localeCompare(a.importedAt);
    })[0];
    return {
      date,
      value: record?.value ?? null,
      record,
      alternatives: records.length - 1,
    };
  });
}
export function summary(state: AppState, metric: Metric, days = 7) {
  const rows = series(state, metric, days);
  const values = rows.flatMap((x) => (x.value == null ? [] : [x.value]));
  const previous = series(
    { ...state, demoDate: day(state.demoDate, -days) },
    metric,
    days,
  ).flatMap((x) => (x.value == null ? [] : [x.value]));
  const average = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null;
  const previousAverage = previous.length
    ? previous.reduce((a, b) => a + b, 0) / previous.length
    : null;
  return {
    average,
    previousAverage,
    delta:
      average !== null && previousAverage !== null
        ? average - previousAverage
        : null,
    coverage: values.length,
    days,
    rows,
  };
}
export function validateRecord(value: unknown): string | null {
  if (!value || typeof value !== "object") return "Record must be an object.";
  const r = value as Observation;
  if (typeof r.id !== "string" || !r.id.trim() || r.id.length > 180)
    return "A short record ID is required.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(r.date) ||
    !Number.isFinite(Date.parse(r.date + "T12:00:00Z")) ||
    new Date(r.date + "T12:00:00Z").toISOString().slice(0, 10) !== r.date
  )
    return "Date must be a real YYYY-MM-DD date.";
  if (!["sleep", "steps", "energy"].includes(r.metric))
    return "Metric must be sleep, steps, or energy.";
  if (typeof r.value !== "number" || !Number.isFinite(r.value))
    return "Value must be a finite number.";
  const bounds =
    r.metric === "sleep"
      ? [0, 24]
      : r.metric === "steps"
        ? [0, 100000]
        : [1, 5];
  if (r.value < bounds[0] || r.value > bounds[1])
    return `Value is outside the accepted ${r.metric} range.`;
  if (r.metric !== "sleep" && !Number.isInteger(r.value))
    return "Steps and energy must be whole numbers.";
  if (r.unit !== { sleep: "h", steps: "steps", energy: "score" }[r.metric])
    return `Expected unit: ${{ sleep: "h", steps: "steps", energy: "score" }[r.metric]}.`;
  if (
    typeof r.sourceId !== "string" ||
    !r.sourceId.trim() ||
    r.sourceId.length > 100
  )
    return "Source is required.";
  if (
    typeof r.recordedAt !== "string" ||
    !Number.isFinite(Date.parse(r.recordedAt)) ||
    typeof r.importedAt !== "string" ||
    !Number.isFinite(Date.parse(r.importedAt))
  )
    return "Record and import timestamps are required.";
  return null;
}
export function ingest(
  existing: Observation[],
  incoming: unknown[],
  source: string,
): { records: Observation[]; report: ImportReport } {
  const seen = new Set(existing.map((x) => x.sourceId + "|" + x.id));
  const records: Observation[] = [];
  let duplicates = 0,
    rejected = 0;
  const issues: string[] = [];
  for (const [i, value] of incoming.entries()) {
    const error = validateRecord(value);
    if (error) {
      rejected++;
      if (issues.length < 8) issues.push(`Row ${i + 1}: ${error}`);
      continue;
    }
    const r = value as Observation;
    const key = r.sourceId + "|" + r.id;
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    records.push({
      ...r,
      note: typeof r.note === "string" ? r.note.slice(0, 1200) : undefined,
    });
  }
  return {
    records,
    report: {
      id: crypto.randomUUID(),
      source,
      received: incoming.length,
      accepted: records.length,
      duplicates,
      rejected,
      issues,
      at: new Date().toISOString(),
      sampleRecord: records[0],
    },
  };
}
export function parseCsv(text: string): unknown[] {
  if (text.length > 1000000)
    throw new Error("Please use a sample CSV smaller than 1 MB.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("A quoted CSV field was not closed.");
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  const headers =
    rows.shift()?.map((x) => x.trim().replace(/^\uFEFF/, "")) || [];
  for (const h of ["id", "date", "metric", "value", "unit", "sourceId"])
    if (!headers.includes(h))
      throw new Error(
        `Missing column: ${h}. Download the example CSV to see the format.`,
      );
  if (rows.length > 5000)
    throw new Error("Use 5,000 rows or fewer for this demo.");
  return rows.map((cols) => {
    const r = Object.fromEntries(
      headers.map((h, i) => [h, cols[i]?.trim() ?? ""]),
    );
    return {
      ...r,
      value: r.value === "" ? NaN : Number(r.value),
      recordedAt: r.recordedAt || r.date + "T08:00:00Z",
      importedAt: new Date().toISOString(),
    };
  });
}
export function validateBackup(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const s = value as AppState;
  return (
    s.schemaVersion === 1 &&
    typeof s.goal === "string" &&
    s.goal.length <= 180 &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.demoDate) &&
    !Number.isNaN(Date.parse(s.demoDate)) &&
    Array.isArray(s.observations) &&
    s.observations.length <= 10000 &&
    s.observations.every((x) => !validateRecord(x)) &&
    Array.isArray(s.plan) &&
    s.plan.length <= 30 &&
    s.plan.every(
      (x) =>
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        x.title.length <= 200 &&
        typeof x.detail === "string" &&
        typeof x.time === "string" &&
        Number.isFinite(x.minutes) &&
        x.minutes >= 1 &&
        x.minutes <= 120 &&
        Array.isArray(x.doneDates) &&
        x.doneDates.every((d) => typeof d === "string") &&
        ["movement", "rest", "reflect"].includes(x.kind),
    ) &&
    Array.isArray(s.checkins) &&
    s.checkins.length <= 1000 &&
    s.checkins.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.date === "string" &&
        typeof c.note === "string" &&
        c.note.length <= 1200 &&
        Number.isInteger(c.energy) &&
        c.energy >= 1 &&
        c.energy <= 5 &&
        Number.isInteger(c.stress) &&
        c.stress >= 1 &&
        c.stress <= 5 &&
        Number.isFinite(c.minutes) &&
        c.minutes >= 0 &&
        c.minutes <= 120,
    ) &&
    Array.isArray(s.connections) &&
    s.connections.length <= 30 &&
    s.connections.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.name === "string" &&
        ["connected", "disconnected"].includes(c.state) &&
        Array.isArray(c.metrics) &&
        c.metrics.every((m) => ["sleep", "steps", "energy"].includes(m)),
    ) &&
    Array.isArray(s.imports) &&
    s.imports.length <= 1000 &&
    s.imports.every(
      (r) =>
        typeof r.id === "string" &&
        typeof r.source === "string" &&
        typeof r.at === "string" &&
        Array.isArray(r.issues) &&
        r.issues.every((i) => typeof i === "string") &&
        [r.received, r.accepted, r.duplicates, r.rejected].every(
          Number.isFinite,
        ) &&
        (!r.sampleRecord || !validateRecord(r.sampleRecord)),
    ) &&
    Array.isArray(s.reviews) &&
    s.reviews.length <= 1000 &&
    s.reviews.every(
      (r) =>
        typeof r.id === "string" &&
        typeof r.context === "string" &&
        typeof r.proposal === "string" &&
        typeof r.createdAt === "string" &&
        Array.isArray(r.sources) &&
        r.sources.every((x) => typeof x === "string") &&
        ["draft", "approved", "dismissed"].includes(r.status),
    ) &&
    typeof s.tourDone === "boolean"
  );
}
export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case "restore":
      return a.value;
    case "tour":
      return { ...s, tourDone: true };
    case "goal":
      return { ...s, goal: a.value };
    case "plan":
      return {
        ...s,
        plan: s.plan.map((p) => (p.id === a.value.id ? a.value : p)),
      };
    case "toggle":
      return {
        ...s,
        plan: s.plan.map((p) =>
          p.id === a.id
            ? {
                ...p,
                doneDates: p.doneDates.includes(s.demoDate)
                  ? p.doneDates.filter((d) => d !== s.demoDate)
                  : [...p.doneDates, s.demoDate],
              }
            : p,
        ),
      };
    case "checkin": {
      const c = a.value;
      const record: Observation = {
        id: `checkin-energy-${c.date}`,
        date: c.date,
        metric: "energy",
        value: c.energy,
        unit: "score",
        sourceId: "checkins",
        recordedAt: c.date + "T12:00:00Z",
        importedAt: new Date().toISOString(),
        note: c.note,
      };
      return {
        ...s,
        checkins: [...s.checkins.filter((x) => x.date !== c.date), c],
        observations: [
          ...s.observations.filter(
            (x) =>
              !(
                x.sourceId === "checkins" &&
                x.date === c.date &&
                x.metric === "energy"
              ),
          ),
          record,
        ],
      };
    }
    case "connect":
      return {
        ...s,
        connections: s.connections.map((c) =>
          c.id === a.id
            ? {
                ...c,
                state: "connected",
                metrics: a.metrics,
                lastSync: new Date().toISOString(),
              }
            : c,
        ),
      };
    case "disconnect":
      return {
        ...s,
        connections: s.connections.map((c) =>
          c.id === a.id ? { ...c, state: "disconnected" } : c,
        ),
      };
    case "import":
      return {
        ...s,
        observations: [...s.observations, ...a.records],
        imports: [a.report, ...s.imports].slice(0, 100),
      };
    case "review":
      return { ...s, reviews: [a.value, ...s.reviews] };
    case "approve":
      return {
        ...s,
        reviews: s.reviews.map((r) =>
          r.id === a.id
            ? {
                ...r,
                status: "approved",
                proposal: a.proposal,
                approvedAt: new Date().toISOString(),
              }
            : r,
        ),
        plan: s.plan.map((p) =>
          p.id === "walk" ? { ...p, detail: a.proposal } : p,
        ),
      };
    case "dismiss":
      return {
        ...s,
        reviews: s.reviews.map((r) =>
          r.id === a.id ? { ...r, status: "dismissed" } : r,
        ),
      };
    case "advance": {
      const date = day(s.demoDate, 1);
      return { ...s, demoDate: date };
    }
    default:
      return s;
  }
}
export function evidence(s: AppState) {
  const sleep = summary(s, "sleep");
  const movement = summary(s, "steps");
  const energy = summary(s, "energy");
  return {
    asOf: s.demoDate,
    goal: s.goal,
    sleep: {
      average: sleep.average,
      previousAverage: sleep.previousAverage,
      nights: sleep.coverage,
      days: 7,
      sourceIds: sleep.rows.flatMap((x) => (x.record ? [x.record.id] : [])),
    },
    movement: { average: movement.average, days: movement.coverage },
    energy: { average: energy.average, days: energy.coverage },
    latestCheckin: s.checkins.at(-1) || null,
    plan: s.plan.map(({ title, minutes, time }) => ({ title, minutes, time })),
    notice:
      "Fictional demo data. Associations do not establish causes. No diagnosis or medical prediction.",
  };
}
export function downloadFile(
  name: string,
  data: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
