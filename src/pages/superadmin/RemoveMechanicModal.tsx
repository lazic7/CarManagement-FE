import { useEffect } from "react";

interface RemoveMechanicModalProps {
  email: string;
  walletAddress?: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RemoveMechanicModal = ({
  email,
  walletAddress,
  isSubmitting,
  onConfirm,
  onCancel,
}: RemoveMechanicModalProps) => {
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
      aria-labelledby="remove-title"
      onClick={isSubmitting ? undefined : onCancel}
    >
      <div
        className="modal-card modal-card-danger"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-icon modal-icon-danger">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </div>

        <h2 id="remove-title" className="modal-title">
          Remove mechanic from network?
        </h2>
        <p className="modal-sub">
          This mechanic will no longer be able to sign new on-chain records.
          Existing blockchain entries remain immutable and stay tied to their
          wallet forever.
        </p>

        <div className="modal-summary">
          <div className="modal-row">
            <span className="modal-label">Email</span>
            <span className="modal-value-mono">{email}</span>
          </div>
          {walletAddress && (
            <div className="modal-row">
              <span className="modal-label">Wallet</span>
              <code className="modal-value-mono">
                {walletAddress.slice(0, 10)}…{walletAddress.slice(-8)}
              </code>
            </div>
          )}
        </div>

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
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Removing…" : "Remove mechanic"}
          </button>
        </div>
      </div>
    </div>
  );
};
