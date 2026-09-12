import { useState } from "react";
import { useStore } from "../lib/store";
import { summary, formatValue, dateLabel } from "../lib/data";
import type { Metric } from "../lib/types";
import { PageTitle, Button, Note } from "../components/UI";
import { Chart, MetricTabs } from "../components/Chart";
import { Icon } from "../components/Icon";
export function Journey({ ask }: { ask: () => void }) {
  const { state } = useStore();
  const [metric, setMetric] = useState<Metric>("sleep");
  const [days, setDays] = useState(7);
  const s = summary(state, metric, days);
  const delta = s.delta;
  const change =
    delta === null
      ? "Not enough history"
      : metric === "sleep"
        ? `${Math.round(Math.abs(delta) * 60)} min ${delta >= 0 ? "more" : "less"}`
        : metric === "steps"
          ? `${Math.round(Math.abs(delta)).toLocaleString()} steps ${delta >= 0 ? "more" : "fewer"}`
          : `${Math.abs(delta).toFixed(1)} points ${delta >= 0 ? "higher" : "lower"}`;
  return (
    <>
      <PageTitle
        title="Your progress has a story."
        description="Explore what changed, add context, and see the information behind it."
        action={
          <Button variant="outline" icon="sparkles" onClick={ask}>
            Ask about my week
          </Button>
        }
      />
      <section className="panel journey-chart">
        <div className="panel-heading">
          <MetricTabs value={metric} onChange={setMetric} />
          <div className="segmented" aria-label="Time range">
            {[7, 14, 28].map((d) => (
              <button
                key={d}
                aria-pressed={days === d}
                onClick={() => setDays(d)}
                className={days === d ? "active" : ""}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>
        <div className="journey-stats">
          <div>
            <span>
              Average recorded {metric === "steps" ? "steps" : metric}
            </span>
            <strong>
              {metric === "energy"
                ? (s.average?.toFixed(1) || "—") + " / 5"
                : formatValue(s.average, metric)}
            </strong>
          </div>
          <div>
            <span>Compared with the previous {days} days</span>
            <strong className="comparison">{change}</strong>
          </div>
          <div>
            <span>Days with a record</span>
            <strong>
              {s.coverage}
              <small> / {days}</small>
            </strong>
          </div>
        </div>
        <Chart metric={metric} days={days} />
      </section>
      <div className="two-column">
        <section className="panel">
          <h2>What the data can tell us</h2>
          <div className="insight-row">
            <span className="icon-disc">
              <Icon name="eye" />
            </span>
            <div>
              <h3>An observation, with context</h3>
              <p>
                {s.average === null
                  ? "There are no records in this period. Connect sample data or add a check-in to begin."
                  : `Across ${s.coverage} recorded days, your average ${metric === "steps" ? "movement" : metric} was ${metric === "energy" ? s.average.toFixed(1) + " out of 5" : formatValue(s.average, metric)}. ${delta === null ? "The previous period has too little data for a comparison." : `That is ${change} than the previous period’s recorded average.`}`}
              </p>
            </div>
          </div>
          <Note>
            Missing days are excluded, not counted as zero. This is a comparison
            of available records, not an explanation of why something changed.
          </Note>
          <details>
            <summary>How are these numbers calculated?</summary>
            <p>
              One preferred observation per measurement and day is used. Direct
              check-ins take priority for energy; the sample wearable takes
              priority for device measurements. Other sources remain available
              in the record details. We sum available daily values and divide by
              the number of recorded days. Sleep is shown in hours and minutes.
            </p>
            <p>
              Different devices are not treated as equally accurate. This demo
              does not estimate disease risk, diagnose conditions, or predict
              health outcomes.
            </p>
          </details>
        </section>
        <section className="panel">
          <h2>Moments along the way</h2>
          <div className="timeline">
            {state.reviews
              .filter((r) => r.status === "approved")
              .slice(0, 2)
              .map((r) => (
                <div className="timeline-item" key={r.id}>
                  <i />
                  <small>Advisor review · Demo</small>
                  <h3>Plan adjustment agreed</h3>
                  <p>{r.proposal}</p>
                </div>
              ))}
            {[...state.checkins]
              .reverse()
              .slice(0, 3)
              .map((c) => (
                <div className="timeline-item" key={c.id}>
                  <i />
                  <small>{dateLabel(c.date)} · Check-in</small>
                  <h3>
                    Energy {c.energy}/5 · {c.minutes} minutes available
                  </h3>
                  <p>
                    {c.note ||
                      "You checked in. Even a short entry gives your journey more context."}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
