import { useEffect } from "react";

interface SubmitConfirmModalProps {
  vin: string;
  mileage: number;
  delta: number | null;
  warnings: string[];
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatKm = (value: number) => `${value.toLocaleString("en-US")} km`;

export const SubmitConfirmModal = ({
  vin,
  mileage,
  delta,
  warnings,
  isSubmitting,
  onConfirm,
  onCancel,
}: SubmitConfirmModalProps) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel, isSubmitting]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={isSubmitting ? undefined : onCancel}
    >
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l9 4v6c0 5-4 9-9 10C7 21 3 17 3 12V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>

        <h2 id="confirm-title" className="modal-title">
          Confirm blockchain submission
        </h2>
        <p className="modal-sub">
          This record will be sealed on-chain permanently. It cannot be edited
          or deleted after confirmation.
        </p>

        <div className="modal-summary">
          <div className="modal-row">
            <span className="modal-label">VIN</span>
            <code className="modal-value-mono">{vin}</code>
          </div>
          <div className="modal-row">
            <span className="modal-label">Mileage</span>
            <span className="modal-value-big">{formatKm(mileage)}</span>
          </div>
          {delta !== null && (
            <div className="modal-row">
              <span className="modal-label">Change</span>
              <span
                className={
                  delta === 0
                    ? "modal-delta modal-delta-zero"
                    : delta > 0
                      ? "modal-delta modal-delta-up"
                      : "modal-delta modal-delta-down"
                }
              >
                {delta > 0 ? "+" : ""}
                {delta.toLocaleString("en-US")} km
              </span>
            </div>
          )}
        </div>

        {warnings.length > 0 && (
          <ul className="modal-warnings">
            {warnings.map((warning) => (
              <li key={warning}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {warning}
              </li>
            ))}
          </ul>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing…" : "Confirm & sign"}
          </button>
        </div>
      </div>
    </div>
  );
};
