export type SubmitStep = "idle" | "metamask" | "submitted" | "done";

interface StepIndicatorProps {
  step: SubmitStep;
}

const STEPS: Array<{ id: SubmitStep; label: string }> = [
  { id: "idle", label: "Input" },
  { id: "metamask", label: "Sign in MetaMask" },
  { id: "submitted", label: "Confirming" },
  { id: "done", label: "On-chain" },
];

const getStepStatus = (
  stepId: SubmitStep,
  currentStep: SubmitStep,
): "done" | "active" | "pending" => {
  const order: SubmitStep[] = ["idle", "metamask", "submitted", "done"];
  const currentIndex = order.indexOf(currentStep);
  const stepIndex = order.indexOf(stepId);
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "active";
  return "pending";
};

export const StepIndicator = ({ step }: StepIndicatorProps) => {
  return (
    <div className="step-indicator" aria-label="Submission progress">
      {STEPS.map((s, index) => {
        const status = getStepStatus(s.id, step);
        return (
          <div
            key={s.id}
            className={`step-node is-${status}`}
            aria-current={status === "active" ? "step" : undefined}
          >
            <div className="step-dot">
              {status === "done" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="step-label">{s.label}</span>
            {index < STEPS.length - 1 && (
              <span className="step-connector" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
};
