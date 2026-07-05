import "./StepLoader.css";

/**
 * Loader de pasos con checks. Conectar currentStep al progreso real de cada fase.
 */
export default function StepLoader({ steps, currentStep }) {
  return (
    <div className="step-loader" role="status" aria-live="polite">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const state = isDone ? "done" : isActive ? "active" : "pending";

        return (
          <div className="step-loader__row" key={step}>
            <span className={`step-loader__icon step-loader__icon--${state}`}>
              {isDone && (
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className={`step-loader__label step-loader__label--${state}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
