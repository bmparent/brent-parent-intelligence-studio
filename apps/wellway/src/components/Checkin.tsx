import { useState } from "react";
import { useStore } from "../lib/store";
import { dateLabel } from "../lib/data";
import { Modal, Button, Note } from "./UI";
import { Icon } from "./Icon";
export function Checkin({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { state, dispatch } = useStore();
  const previous = state.checkins.find((c) => c.date === state.demoDate);
  const [step, setStep] = useState(0);
  const [energy, setEnergy] = useState(previous?.energy ?? 3);
  const [stress, setStress] = useState(previous?.stress ?? 3);
  const [minutes, setMinutes] = useState(previous?.minutes ?? 10);
  const [note, setNote] = useState(previous?.note ?? "");
  const save = () => {
    dispatch({
      type: "checkin",
      value: {
        id: crypto.randomUUID(),
        date: state.demoDate,
        energy,
        stress,
        minutes,
        note: note.trim(),
      },
    });
    onSaved();
  };
  return (
    <Modal
      title={
        step === 0
          ? "Start with how you feel."
          : step === 1
            ? "Make room for real life."
            : "Your day, in your words."
      }
      subtitle={`Check-in for ${dateLabel(state.demoDate)} · Demo day`}
      onClose={onClose}
    >
      <div className="step-progress" aria-label={`Step ${step + 1} of 3`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={i <= step ? "active" : ""} />
        ))}
      </div>
      {step === 0 ? (
        <>
          <fieldset>
            <legend>How is your energy?</legend>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  aria-label={`Energy ${n} out of 5`}
                  aria-pressed={energy === n}
                  className={energy === n ? "selected" : ""}
                  onClick={() => setEnergy(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="scale-ends">
              <span>Very low</span>
              <span>Very high</span>
            </div>
          </fieldset>
          <fieldset>
            <legend>How much stress are you feeling?</legend>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  aria-label={`Stress ${n} out of 5`}
                  aria-pressed={stress === n}
                  className={stress === n ? "selected" : ""}
                  onClick={() => setStress(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="scale-ends">
              <span>Very little</span>
              <span>A great deal</span>
            </div>
          </fieldset>
        </>
      ) : step === 1 ? (
        <>
          <fieldset>
            <legend>How much time feels manageable today?</legend>
            <div className="time-options">
              {[5, 10, 15, 30, 60].map((n) => (
                <button
                  key={n}
                  onClick={() => setMinutes(n)}
                  className={minutes === n ? "selected" : ""}
                  aria-pressed={minutes === n}
                >
                  {n}
                  <span>minutes</span>
                </button>
              ))}
            </div>
          </fieldset>
          <Note>
            There is no perfect answer. Your available time helps you choose a
            smaller version of an existing activity.
          </Note>
        </>
      ) : (
        <>
          <label className="field">
            Anything you would like your advisor to understand?
            <textarea
              placeholder="For example: my work schedule changed, so evenings are harder."
              maxLength={1200}
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <small>
              Optional. Use fictional details in this demonstration.
            </small>
          </label>
          <div className="checkin-review">
            <Icon name="check" />
            <span>
              Energy <strong>{energy}/5</strong> · Stress{" "}
              <strong>{stress}/5</strong> · Time{" "}
              <strong>{minutes} minutes</strong>
            </span>
          </div>
          <Note icon="shield">
            This entry stays in this browser. The advisor view uses the same
            local demo; nothing is sent to a real advisor.
          </Note>
        </>
      )}
      <div className="modal-actions">
        <Button
          variant="text"
          onClick={step === 0 ? onClose : () => setStep(step - 1)}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <Button
          onClick={step === 2 ? save : () => setStep(step + 1)}
          icon={step === 2 ? "check" : "arrow"}
        >
          {step === 2 ? "Save check-in" : "Continue"}
        </Button>
      </div>
    </Modal>
  );
}
