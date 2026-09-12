import { useState } from "react";
import { useStore } from "../lib/store";
import { dateLabel } from "../lib/data";
import type { PlanItem } from "../lib/types";
import { PageTitle, Button, Modal, Note } from "../components/UI";
import { Icon } from "../components/Icon";
export function Plan({ checkin }: { checkin: () => void }) {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [goalEdit, setGoalEdit] = useState(false);
  const [goal, setGoal] = useState(state.goal);
  const [confirmDay, setConfirmDay] = useState(false);
  const done = state.plan.filter((p) =>
    p.doneDates.includes(state.demoDate),
  ).length;
  const current = state.checkins.find((c) => c.date === state.demoDate);
  return (
    <>
      <PageTitle
        title="Small steps. Your pace."
        description="Choose what fits today. Your plan is a starting point, and you can adjust it."
        action={
          <Button variant="outline" onClick={checkin} icon="plus">
            {current ? "Update check-in" : "Add a check-in"}
          </Button>
        }
      />
      <section className="goal-strip">
        <div className="icon-disc">
          <Icon name="sun" size={26} />
        </div>
        <div>
          <span>Your focus</span>
          <h2>{state.goal}</h2>
        </div>
        <Button
          variant="text"
          onClick={() => {
            setGoal(state.goal);
            setGoalEdit(true);
          }}
          icon="edit"
        >
          Edit focus
        </Button>
      </section>
      <div className="plan-heading">
        <div>
          <h2>Your plan for {dateLabel(state.demoDate, true)}</h2>
          <p>
            {current
              ? `You have ${current.minutes} minutes available. Start with one activity.`
              : "How much time do you have? A check-in helps you choose."}
          </p>
        </div>
        <span className="completion-count">
          {done} of {state.plan.length} complete
        </span>
      </div>
      <div
        className="completion-bar"
        aria-label={`${done} of ${state.plan.length} steps completed`}
      >
        <span style={{ width: `${(done / state.plan.length) * 100}%` }} />
      </div>
      <div className="plan-list">
        {state.plan.map((p) => (
          <article
            className={`plan-item ${p.doneDates.includes(state.demoDate) ? "is-complete" : ""}`}
            key={p.id}
          >
            <button
              className="task-check"
              aria-label={`${p.doneDates.includes(state.demoDate) ? "Mark incomplete" : "Complete"}: ${p.title}`}
              aria-pressed={p.doneDates.includes(state.demoDate)}
              onClick={() => dispatch({ type: "toggle", id: p.id })}
            >
              {p.doneDates.includes(state.demoDate) && (
                <Icon name="check" size={22} />
              )}
            </button>
            <span className="icon-disc">
              <Icon
                name={
                  p.kind === "movement"
                    ? "walk"
                    : p.kind === "rest"
                      ? "moon"
                      : "file"
                }
              />
            </span>
            <div className="plan-text">
              <h3>{p.title}</h3>
              <p>{p.detail}</p>
              <div className="plan-meta">
                <span>
                  <Icon name="clock" size={15} />
                  {p.minutes} minutes
                </span>
                <span>{p.time}</span>
              </div>
            </div>
            <Button
              variant="text"
              onClick={() => setEditing({ ...p })}
              icon="edit"
            >
              Adjust
            </Button>
          </article>
        ))}
      </div>
      {done === state.plan.length && (
        <Note icon="check">
          You checked off every step for this demo day. Notice what felt
          manageable and carry that insight into your next check-in.
        </Note>
      )}
      <div className="two-column">
        <section className="panel">
          <h2>Make your plan work for you</h2>
          <ul className="plain-list">
            <li>Pick one step before adding more.</li>
            <li>Adjust timing and duration around your day.</li>
            <li>Record what got in the way; that context is useful.</li>
            <li>Review bigger changes with your advisor.</li>
          </ul>
        </section>
        <section className="panel">
          <h2>Explore the follow-up</h2>
          <p>
            Move to the next fictional day to see how your history and daily
            checklist carry forward. New wearable readings are not invented.
          </p>
          <Button
            variant="outline"
            icon="arrow"
            onClick={() => setConfirmDay(true)}
          >
            Explore the next day
          </Button>
        </section>
      </div>
      {editing && (
        <Modal
          title="Make this step fit."
          subtitle="These changes update your local demo plan."
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dispatch({ type: "plan", value: editing });
              setEditing(null);
            }}
          >
            <label className="field">
              Activity
              <input
                value={editing.title}
                maxLength={120}
                required
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </label>
            <div className="form-columns">
              <label className="field">
                Minutes
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={editing.minutes}
                  onChange={(e) =>
                    setEditing({ ...editing, minutes: Number(e.target.value) })
                  }
                />
              </label>
              <label className="field">
                When
                <input
                  maxLength={80}
                  required
                  value={editing.time}
                  onChange={(e) =>
                    setEditing({ ...editing, time: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="field">
              A helpful note
              <textarea
                rows={3}
                maxLength={600}
                value={editing.detail}
                onChange={(e) =>
                  setEditing({ ...editing, detail: e.target.value })
                }
              />
            </label>
            <div className="modal-actions">
              <Button variant="text" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" icon="check">
                Save adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {goalEdit && (
        <Modal
          title="What would you like to work toward?"
          subtitle="A clear, personal focus makes your next step easier to choose."
          onClose={() => setGoalEdit(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              dispatch({ type: "goal", value: goal.trim() });
              setGoalEdit(false);
            }}
          >
            <label className="field">
              Your focus
              <input
                maxLength={100}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
                placeholder="For example: more consistent energy"
              />
            </label>
            <div className="prompt-chips">
              {[
                "More consistent energy",
                "Build a movement routine",
                "Make time for recovery",
              ].map((t) => (
                <button type="button" key={t} onClick={() => setGoal(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <Button variant="text" onClick={() => setGoalEdit(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!goal.trim()}>
                Save focus
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {confirmDay && (
        <Modal
          title="Explore the next demo day?"
          subtitle="Your history stays intact. Daily completion boxes begin fresh, and new data appears only when you add it."
          onClose={() => setConfirmDay(false)}
        >
          <div className="modal-actions">
            <Button variant="text" onClick={() => setConfirmDay(false)}>
              Stay here
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "advance" });
                setConfirmDay(false);
              }}
              icon="arrow"
            >
              Move to the next day
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
