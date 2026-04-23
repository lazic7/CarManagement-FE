import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import "../../App.css";
import { buildApiUrl } from "../../api/client";

interface InvitationResponse {
  email: string;
}

export const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "loading" | "valid" | "invalid" | "done"
  >("loading");
  const [invitationError, setInvitationError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setInvitationError("No invitation token provided.");
      return;
    }

    let cancelled = false;
    fetch(buildApiUrl(`/auth/invitation/${encodeURIComponent(token)}`))
      .then(async (response) => {
        const data = (await response.json()) as
          | InvitationResponse
          | { message?: string };
        if (cancelled) return;
        if (!response.ok) {
          setStatus("invalid");
          setInvitationError(
            ("message" in data && data.message) ||
              "This invitation is invalid or has expired.",
          );
          return;
        }
        setEmail((data as InvitationResponse).email);
        setStatus("valid");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("invalid");
        setInvitationError("Unable to reach the server. Try again later.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl("/auth/set-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || "Failed to set password");
      }
      setStatus("done");
      toast.success("Password set. You can sign in now.");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to set password";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app">
      <section className="error-page-v2" id="auth">
        <div className="error-bg-grid" aria-hidden="true" />

        <div className="error-content-v2">
          <span className="error-badge">
            <span className="error-badge-dot" aria-hidden="true" />
            MECHANIC ACTIVATION
          </span>

          {status === "loading" && (
            <>
              <h1 className="error-title-v2">Checking invitation…</h1>
              <p className="error-sub-v2">One moment, verifying your link.</p>
            </>
          )}

          {status === "invalid" && (
            <>
              <h1 className="error-title-v2">Link invalid or expired</h1>
              <p className="error-sub-v2">
                {invitationError ||
                  "This invitation is no longer valid. Ask your superadmin to resend it."}
              </p>
              <div className="error-cta-row">
                <Link to="/" className="btn btn-primary hero-btn">
                  Back to home
                </Link>
              </div>
            </>
          )}

          {status === "done" && (
            <>
              <h1 className="error-title-v2">
                All set — <span className="gradient-text">welcome</span>.
              </h1>
              <p className="error-sub-v2">
                Your password is saved. Redirecting you to the sign-in page…
              </p>
            </>
          )}

          {status === "valid" && (
            <>
              <h1 className="error-title-v2">
                Activate your <span className="gradient-text">AutoLedger</span>{" "}
                account
              </h1>
              <p className="error-sub-v2">
                You've been invited as a mechanic. Set a password below to
                finish activating your account.
              </p>

              <div className="invitee-card">
                <div className="invitee-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="invitee-card-body">
                  <div className="invitee-card-label">INVITATION FOR</div>
                  <div className="invitee-card-email">{email}</div>
                </div>
              </div>

              <form className="invite-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="invite-password">New password</label>
                  <input
                    type="password"
                    id="invite-password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="invite-confirm">Confirm password</label>
                  <input
                    type="password"
                    id="invite-confirm"
                    name="confirm"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary hero-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Activate account"}
                </button>

                {formError && (
                  <p className="auth-feedback ledger-feedback">{formError}</p>
                )}
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
