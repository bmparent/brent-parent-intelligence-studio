import { useRef, useState, useEffect } from "react";
import { useStore } from "../lib/store";
import {
  ingest,
  parseCsv,
  day,
  dateLabel,
  downloadFile,
  formatValue,
} from "../lib/data";
import type {
  Connection,
  Metric,
  Observation,
  ImportReport,
} from "../lib/types";
import { PageTitle, Button, Modal, Note } from "../components/UI";
import { Icon } from "../components/Icon";
const DRIVE_URL = "https://drive.google.com/";
export function Connections() {
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState<Connection | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>(["sleep", "steps"]);
  const [flow, setFlow] = useState(0);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [preview, setPreview] = useState<{
    records: Observation[];
    report: ImportReport;
  } | null>(null);
  const [error, setError] = useState("");
  const [disconnect, setDisconnect] = useState<Connection | null>(null);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  function run() {
    if (!selected || !metrics.length) return;
    const source = selected;
    const incoming: unknown[] = [];
    for (let i = 0; i < 7; i++) {
      const date = day(state.demoDate, i - 6);
      for (const metric of metrics)
        incoming.push({
          id: `${source.id}-${metric}-${date}`,
          date,
          metric,
          value:
            metric === "sleep"
              ? [6.5, 6.7, 6.2, 7.1, 6.8, 7.3, 7][i]
              : [5300, 6800, 6100, 7900, 5100, 7400, 6600][i],
          unit: metric === "sleep" ? "h" : "steps",
          sourceId: source.id,
          recordedAt: date + "T08:00:00Z",
          importedAt: new Date().toISOString(),
        });
    }
    incoming.push(incoming[0]);
    incoming.push({
      ...(incoming[0] as Observation),
      id: "intentional-invalid-example",
      value: 999999,
    });
    const result = ingest(state.observations, incoming, source.name);
    setFlow(1);
    setReport(null);
    timers.current = [
      setTimeout(() => setFlow(2), 450),
      setTimeout(() => {
        dispatch({ type: "connect", id: source.id, metrics });
        dispatch({ type: "import", ...result });
        setReport(result.report);
        setFlow(3);
      }, 1000),
    ];
  }
  async function readFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (file.size > 1000000)
        throw new Error("Please choose a sample CSV smaller than 1 MB.");
      const rows = parseCsv(await file.text());
      if (!rows.length) throw new Error("No data rows were found.");
      setPreview(ingest(state.observations, rows, file.name));
    } catch (e) {
      setError(e instanceof Error ? e.message : "The file could not be read.");
    }
    if (input.current) input.current.value = "";
  }
  const example = () =>
    downloadFile(
      "wellway-sample-import.csv",
      `id,date,metric,value,unit,sourceId\nsample-extra-1,${state.demoDate},sleep,7.1,h,csv-example\nsample-extra-2,${state.demoDate},steps,6800,steps,csv-example\n`,
      "text/csv",
    );
  return (
    <>
      <PageTitle
        title="Your information, together."
        description="See what is connected, what is shared, and how each record becomes useful."
        action={
          <Button
            variant="outline"
            onClick={() => input.current?.click()}
            icon="upload"
          >
            Import sample CSV
          </Button>
        }
      />
      <input
        className="sr-only"
        ref={input}
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => readFile(e.target.files?.[0])}
        aria-label="Import sample CSV file"
      />
      <Note icon="shield">
        You are exploring fictional data. Service connections below demonstrate
        the flow; they do not sign in to a provider or sync real health records.
        Everything here stays in this browser.
      </Note>
      <div className="connection-toolbar">
        <h2>Choose a source</h2>
        <label className="search-field">
          <span className="sr-only">Find a source</span>
          <input
            placeholder="Find a source…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Icon name="link" size={19} />
        </label>
      </div>
      <div className="connection-grid">
        {state.connections
          .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
          .map((c) => (
            <section key={c.id} className="panel connection-card">
              <div className="connection-card-top">
                <span className="icon-disc">
                  <Icon
                    name={
                      c.id === "checkins"
                        ? "file"
                        : c.id.includes("health")
                          ? "shield"
                          : c.id === "sample-ring"
                            ? "moon"
                            : "energy"
                    }
                    size={26}
                  />
                </span>
                <span
                  className={`status-pill ${c.state === "connected" ? "connected" : ""}`}
                >
                  {c.id === "checkins"
                    ? "Local entries"
                    : c.state === "connected"
                      ? "Sample connected"
                      : c.id.includes("health")
                        ? "Mobile app needed"
                        : "Sample available"}
                </span>
              </div>
              <h3>{c.name}</h3>
              <p>
                {c.id === "checkins"
                  ? "Your energy, available time, and the context only you can provide."
                  : c.id === "apple-health"
                    ? "A real connection requires an iOS app with HealthKit permissions."
                    : c.id === "health-connect"
                      ? "A real connection requires an Android app and health-data permissions."
                      : c.id === "sample-ring"
                        ? "Try importing another sleep source and inspect overlapping records."
                        : "Sample sleep and movement history, ready to explore."}
              </p>
              <div className="measurement-labels">
                {c.metrics.map((m) => (
                  <span key={m}>
                    {m === "steps"
                      ? "Movement"
                      : m === "sleep"
                        ? "Sleep"
                        : "Energy"}
                  </span>
                ))}
              </div>
              <div className="connection-card-bottom">
                {c.id === "checkins" ? (
                  <span className="muted small">
                    Added when you save a check-in
                  </span>
                ) : (
                  <>
                    <Button
                      variant="text"
                      onClick={() => {
                        setSelected(c);
                        setMetrics(c.metrics);
                        setFlow(0);
                        setReport(null);
                      }}
                      icon="arrow"
                    >
                      {c.state === "connected"
                        ? "Review & import"
                        : "Try sample flow"}
                    </Button>
                    {c.state === "connected" && (
                      <button
                        className="text-button muted"
                        onClick={() => setDisconnect(c)}
                      >
                        Disconnect
                      </button>
                    )}
                  </>
                )}
              </div>
            </section>
          ))}
      </div>
      {!state.connections.some((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      ) && (
        <div className="empty">
          <h3>No matching source</h3>
          <p>
            Try “sleep,” “wearable,” or “Health.” Additional services can use
            the same import format.
          </p>
          <Button variant="text" onClick={() => setQuery("")}>
            Show all sources
          </Button>
        </div>
      )}
      <div className="two-column">
        <section className="panel">
          <div className="panel-heading">
            <h2>Bring a sample file</h2>
            <Icon name="upload" />
          </div>
          <p>
            Import a CSV, review the accepted records, then add them to your
            history. Duplicate records are skipped and invalid rows are
            explained.
          </p>
          <div className="button-row">
            <Button variant="outline" onClick={example} icon="download">
              Example CSV
            </Button>
            <Button
              variant="text"
              onClick={() => input.current?.click()}
              icon="upload"
            >
              Choose file
            </Button>
          </div>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <details>
            <summary>Which columns does the file need?</summary>
            <p>
              <code>id, date, metric, value, unit, sourceId</code>
            </p>
            <p>
              Use YYYY-MM-DD dates. Sleep uses hours (<code>h</code>), movement
              uses <code>steps</code>, and energy uses <code>score</code> from
              1–5. A source ID and record ID together identify a record. Maximum
              1 MB / 5,000 rows.
            </p>
          </details>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Keep a copy you control</h2>
            <Icon name="download" />
          </div>
          <p>
            Export this demo’s history and settings as a backup. Save it in a
            Google Drive folder you choose and restore it on another browser.
          </p>
          <div className="button-row">
            <Button
              variant="outline"
              onClick={() =>
                downloadFile(
                  "wellway-backup.json",
                  JSON.stringify(state, null, 2),
                )
              }
              icon="download"
            >
              Export backup
            </Button>
            <a
              className="text-link"
              href={DRIVE_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open Google Drive <Icon name="arrow" size={17} />
            </a>
          </div>
          <small className="muted">
            Manual file transfer. Google Drive does not continuously sync this
            browser.
          </small>
        </section>
      </div>
      <section className="panel import-history">
        <h2>Recent imports</h2>
        {state.imports.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Added</th>
                  <th>Duplicates</th>
                  <th>Needs review</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {state.imports.slice(0, 6).map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.source}
                      <small>{new Date(r.at).toLocaleString()}</small>
                    </td>
                    <td>{r.accepted}</td>
                    <td>{r.duplicates}</td>
                    <td>{r.rejected}</td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => {
                          setReport(r);
                          setSelected(null);
                          setFlow(3);
                        }}
                      >
                        View record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            Your first sample import will appear here. Try a source above to
            follow the journey of a record.
          </p>
        )}
      </section>
      {selected && (
        <Modal
          title={
            flow === 3
              ? "Your sample data is ready."
              : `Explore ${selected.name}`
          }
          subtitle={
            flow === 0
              ? "Choose which measurements to include in this sample import."
              : "A walkthrough of the records actually processed in this demo."
          }
          onClose={() => {
            if (flow !== 1 && flow !== 2) {
              setSelected(null);
              setFlow(0);
            }
          }}
          wide
        >
          {flow === 0 ? (
            <>
              <Note>
                No provider sign-in occurs. This flow uses generated sample
                records and includes a duplicate and an invalid record so you
                can see how they are handled.
              </Note>
              <fieldset>
                <legend>Include these measurements</legend>
                {(["sleep", "steps"] as Metric[])
                  .filter((m) => selected.id !== "sample-ring" || m === "sleep")
                  .map((m) => (
                    <label className="checkbox-row" key={m}>
                      <input
                        type="checkbox"
                        checked={metrics.includes(m)}
                        onChange={(e) =>
                          setMetrics(
                            e.target.checked
                              ? [...metrics, m]
                              : metrics.filter((x) => x !== m),
                          )
                        }
                      />
                      <div>
                        <strong>
                          {m === "sleep" ? "Sleep duration" : "Daily steps"}
                        </strong>
                        <span>
                          {m === "sleep"
                            ? "Recorded in hours"
                            : "Recorded as a daily count"}
                        </span>
                      </div>
                    </label>
                  ))}
              </fieldset>
              <div className="modal-actions">
                <Button variant="text" onClick={() => setSelected(null)}>
                  Cancel
                </Button>
                <Button onClick={run} disabled={!metrics.length} icon="arrow">
                  Import sample records
                </Button>
              </div>
            </>
          ) : (
            <>
              <Pipeline flow={flow} />
              {report && <ImportResult report={report} />}
              <div className="modal-actions">
                <span className="muted small">
                  {flow < 3
                    ? "Processing sample records…"
                    : "Other sources remain intact."}
                </span>
                <Button
                  disabled={flow < 3}
                  onClick={() => {
                    setSelected(null);
                    setFlow(0);
                    setReport(null);
                  }}
                  icon="check"
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
      {report && !selected && flow === 3 && (
        <Modal
          title="Follow this import."
          onClose={() => {
            setReport(null);
            setFlow(0);
          }}
          wide
        >
          <Pipeline flow={3} />
          <ImportResult report={report} />
        </Modal>
      )}
      {preview && (
        <Modal
          title="Review before importing."
          subtitle="Only valid, new records will be added. Your existing history stays intact."
          onClose={() => setPreview(null)}
          wide
        >
          <ImportResult report={preview.report} />
          <div className="modal-actions">
            <Button variant="text" onClick={() => setPreview(null)}>
              Cancel
            </Button>
            <Button
              disabled={!preview.records.length}
              onClick={() => {
                dispatch({ type: "import", ...preview });
                setReport(preview.report);
                setFlow(3);
                setPreview(null);
              }}
              icon="check"
            >
              Add {preview.records.length}{" "}
              {preview.records.length === 1 ? "record" : "records"}
            </Button>
          </div>
        </Modal>
      )}
      {disconnect && (
        <Modal
          title={`Disconnect ${disconnect.name}?`}
          subtitle="Future sample imports stop until you reconnect. Previously imported records stay in your history."
          onClose={() => setDisconnect(null)}
        >
          <div className="modal-actions">
            <Button variant="text" onClick={() => setDisconnect(null)}>
              Keep connected
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "disconnect", id: disconnect.id });
                setDisconnect(null);
              }}
            >
              Disconnect
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Pipeline({ flow }: { flow: number }) {
  return (
    <ol className="pipeline">
      {[
        { title: "Receive", text: "Source and permissions", icon: "link" },
        { title: "Check", text: "Units, dates, duplicates", icon: "shield" },
        { title: "Use", text: "History and explanations", icon: "chart" },
      ].map((p, i) => (
        <li className={flow > i ? "complete" : ""} key={p.title}>
          <span>
            <Icon name={flow > i ? "check" : p.icon} />
          </span>
          <strong>{p.title}</strong>
          <small>{p.text}</small>
        </li>
      ))}
    </ol>
  );
}
function ImportResult({ report }: { report: ImportReport }) {
  return (
    <div className="import-result">
      <div className="import-totals">
        <div>
          <strong>{report.accepted}</strong>
          <span>added</span>
        </div>
        <div>
          <strong>{report.duplicates}</strong>
          <span>duplicates skipped</span>
        </div>
        <div>
          <strong>{report.rejected}</strong>
          <span>held out</span>
        </div>
      </div>
      <p>
        {report.received} incoming records · {report.source}
      </p>
      {report.issues.length > 0 && (
        <details open>
          <summary>Why were records held out?</summary>
          <ul>
            {report.issues.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </details>
      )}
      {report.sampleRecord && (
        <div className="sample-record">
          <span className="icon-disc">
            <Icon name="file" />
          </span>
          <div>
            <strong>
              {formatValue(
                report.sampleRecord.value,
                report.sampleRecord.metric,
              )}{" "}
              · {dateLabel(report.sampleRecord.date, true)}
            </strong>
            <p>Source: {report.sampleRecord.sourceId}</p>
            <small>Record: {report.sampleRecord.id}</small>
          </div>
        </div>
      )}
      <Note>
        Overlapping measurements from different sources are preserved. Charts
        use one preferred source per day so steps and sleep are not
        double-counted.
      </Note>
    </div>
  );
}
