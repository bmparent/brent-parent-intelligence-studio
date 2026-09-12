import { useState } from "react";
import { useStore } from "../lib/store";
import { series, formatValue, dateLabel } from "../lib/data";
import type { Metric, Page } from "../lib/types";
import { PageTitle, Button } from "../components/UI";
import { Icon } from "../components/Icon";
import { Chart, MetricTabs, MiniChart } from "../components/Chart";
import { VisitCard } from "../components/VideoVisit";
export function Today({
  navigate,
  checkin,
  tour,
  ask,
  visit,
  advisorProfile,
}: {
  navigate: (p: Page) => void;
  checkin: () => void;
  tour: () => void;
  ask: () => void;
  visit: () => void;
  advisorProfile: () => void;
}) {
  const { state } = useStore();
  const [metric, setMetric] = useState<Metric>("sleep");
  const current = state.checkins.find((c) => c.date === state.demoDate);
  const complete = state.plan.filter((p) =>
    p.doneDates.includes(state.demoDate),
  ).length;
  return (
    <>
      <PageTitle
        title="A little progress, every day."
        description="See what matters today. Take one step that fits your life."
        action={
          <Button variant="outline" onClick={tour} icon="arrow">
            Explore the demo
          </Button>
        }
      />
      <section className="checkin-banner">
        <div className="banner-copy">
          <h2>
            {current
              ? "A plan that fits your day."
              : "How are you feeling today?"}
          </h2>
          <p>
            {current
              ? `You checked in with ${current.minutes} minutes available. Small steps count.`
              : "A 30-second check-in helps your plan fit your day."}
          </p>
          <Button
            variant="white"
            onClick={checkin}
            icon={current ? "edit" : "arrow"}
          >
            {current ? "Edit check-in" : "Start check-in"}
          </Button>
        </div>
        <div className="banner-focus">
          <span>Your focus</span>
          <h2>{state.goal}</h2>
          <p>One manageable step at a time.</p>
        </div>
        <div className="banner-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </section>
      <div className="metrics-row">
        {(["sleep", "steps", "energy"] as Metric[]).map((m) => {
          const latest = series(state, m, 28)
            .filter((r) => r.value != null)
            .at(-1);
          return (
            <button
              key={m}
              className="metric-card"
              onClick={() => {
                setMetric(m);
                document
                  .getElementById("week-chart")
                  ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
              aria-label={`Explore ${m === "steps" ? "movement" : m} data`}
            >
              <span className={`icon-disc icon-${m}`}>
                <Icon
                  name={
                    m === "sleep" ? "moon" : m === "steps" ? "walk" : "energy"
                  }
                  size={29}
                />
              </span>
              <span className="metric-copy">
                <span>
                  {m === "steps"
                    ? "Movement"
                    : m === "sleep"
                      ? "Sleep"
                      : "Energy"}
                </span>
                <strong>{formatValue(latest?.value, m)}</strong>
                <small>
                  {m === "sleep"
                    ? "Last recorded night"
                    : m === "steps"
                      ? "Steps on your latest day"
                      : "From your latest check-in"}
                </small>
              </span>
              <MiniChart metric={m} />
            </button>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <section className="panel week-panel" id="week-chart">
          <div className="panel-heading">
            <h2>Your week, at a glance</h2>
            <MetricTabs value={metric} onChange={setMetric} />
          </div>
          <Chart metric={metric} />
        </section>
        <aside className="panel next-step">
          <h2>One step for today</h2>
          <div className="step-feature">
            <span className="icon-disc">
              <Icon name="walk" size={28} />
            </span>
            <div>
              <h3>
                {current && current.minutes < 10
                  ? `Try a ${current.minutes}-minute version`
                  : state.plan[0].title}
              </h3>
              <p>
                {current
                  ? `You have ${current.minutes} minutes available. Choose an activity from your existing plan.`
                  : "Choose a time that works with your existing plan."}
              </p>
              <Button
                variant="text"
                onClick={() => navigate("plan")}
                icon="arrow"
              >
                Open my plan
              </Button>
            </div>
          </div>
          <div className="step-evidence">
            <h4>What is this based on?</h4>
            <p>Your check-ins and sample wearable records.</p>
            <Button
              variant="outline"
              onClick={() => navigate("journey")}
              icon="arrow"
            >
              Explore my journey
            </Button>
          </div>
        </aside>
      </div>
      <section className="getting-started">
        <div>
          <Icon name="sparkles" size={22} />
          <div>
            <strong>
              {current
                ? "Keep the conversation going."
                : "A good place to begin."}
            </strong>
            <p>
              {current
                ? `${complete} of ${state.plan.length} steps checked off on ${dateLabel(state.demoDate, true)}. You decide what fits.`
                : "Check in, explore one pattern, then choose a step in your plan."}
            </p>
          </div>
        </div>
        <Button variant="text" onClick={ask} icon="arrow">
          Ask about my week
        </Button>
      </section>
      <VisitCard onOpen={visit} onProfile={advisorProfile} />
    </>
  );
}
