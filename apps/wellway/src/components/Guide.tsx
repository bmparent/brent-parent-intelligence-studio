import { useState } from "react";
import { useStore } from "../lib/store";
import type { Page } from "../lib/types";
import { Modal, Button, Note } from "./UI";
import { Icon } from "./Icon";
const steps = [
  {
    icon: "sun",
    title: "Start with your day.",
    body: "A useful wellness journey starts with context. Record your energy, how much time you have, and anything that changed.",
    label: "Try a check-in",
    page: "today",
  },
  {
    icon: "chart",
    title: "Look behind the numbers.",
    body: "Choose a measurement and a time range. Select any day to see its source. Missing data stays visible, so the picture is honest.",
    label: "Explore my journey",
    page: "journey",
  },
  {
    icon: "plan",
    title: "Choose one manageable step.",
    body: "Make an existing activity fit your schedule. Adjust its time or duration, then mark it complete. Your choices stay in this browser.",
    label: "Open my plan",
    page: "plan",
  },
  {
    icon: "link",
    title: "Bring your information together.",
    body: "Try a sample connection or import a sample CSV. Review what was accepted, what was duplicated, and what needs a correction.",
    label: "Explore connections",
    page: "connections",
  },
  {
    icon: "user",
    title: "See the advisor’s perspective.",
    body: "Prepare a source-linked brief, review a proposed adjustment, and see the approved change appear in the member’s plan.",
    label: "Open advisor view",
    page: "advisor",
  },
] as const;
export function Guide({
  onClose,
  navigate,
  checkin,
}: {
  onClose: () => void;
  navigate: (p: Page) => void;
  checkin: () => void;
}) {
  const [step, setStep] = useState(0);
  const { dispatch } = useStore();
  const item = steps[step];
  return (
    <Modal
      title={item.title}
      subtitle={`A quick tour · ${step + 1} of ${steps.length}`}
      onClose={onClose}
    >
      <div className="guide-icon">
        <Icon name={item.icon} size={44} />
      </div>
      <p className="guide-body">{item.body}</p>
      <div className="guide-dots">
        {steps.map((s, i) => (
          <button
            key={s.title}
            className={i === step ? "active" : ""}
            onClick={() => setStep(i)}
            aria-label={`Tour step ${i + 1}: ${s.title}`}
            aria-current={i === step ? "step" : undefined}
          />
        ))}
      </div>
      <Note>
        This is a concept demonstration by Eidos Works with fictional data. It
        is not Wellway’s live member service. Live AI and health-provider access
        are not connected.
      </Note>
      <div className="modal-actions">
        <Button
          variant="text"
          onClick={() => {
            dispatch({ type: "tour" });
            onClose();
            navigate(item.page);
            if (step === 0) checkin();
          }}
        >
          {item.label}
        </Button>
        <Button
          onClick={() => {
            if (step === steps.length - 1) {
              dispatch({ type: "tour" });
              onClose();
            } else setStep(step + 1);
          }}
          icon={step === steps.length - 1 ? "check" : "arrow"}
        >
          {step === steps.length - 1 ? "Ready to explore" : "Next"}
        </Button>
      </div>
    </Modal>
  );
}
