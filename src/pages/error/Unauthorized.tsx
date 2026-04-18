import { Link, useSearchParams } from "react-router";
import "../../App.css";

export const Unauthorized = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="app">
      <section className="error-page-v2" id="auth">
        <div className="error-bg-grid" aria-hidden="true" />

        <div className="error-content-v2">
          <span className="error-badge error-badge-amber">
            <span className="error-badge-dot error-badge-dot-amber" aria-hidden="true" />
            RESTRICTED ACCESS
          </span>

          <h1 className="error-code">
            <span className="gradient-text">401</span>
          </h1>

          <h2 className="error-title-v2">Sign in required</h2>

          <p className="error-sub-v2">
            This area is protected. You need to be signed in with the right
            role to open
            {from ? (
              <>
                {" "}
                <code className="error-path">{from}</code>
              </>
            ) : (
              " this page"
            )}
            . Your session may have expired — just sign in again.
          </p>

          <div className="error-cta-row">
            <Link to="/" className="btn btn-primary hero-btn">
              Sign in
            </Link>
            <Link to="/" className="btn btn-ghost hero-btn">
              Back to home
              <svg
                className="btn-arrow"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="error-visual" aria-hidden="true">
          <div className="locked-block">
            <div className="chain-block locked-block-card">
              <span className="chain-block-tag locked-block-tag">
                SECURED
              </span>
              <div className="chain-block-hash locked" />
              <div className="chain-block-hash locked short" />
              <div className="chain-block-hash locked" />
            </div>

            <div className="lock-overlay">
              <span className="lock-glow" />
              <svg className="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="11" width="16" height="11" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                <circle cx="12" cy="16.5" r="1.2" />
              </svg>
            </div>

            <span className="lock-spark lock-spark-1" />
            <span className="lock-spark lock-spark-2" />
            <span className="lock-spark lock-spark-3" />
          </div>
        </div>
      </section>
    </div>
  );
};
