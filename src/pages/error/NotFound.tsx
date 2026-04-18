import { Link } from "react-router";
import "../../App.css";

export const NotFound = () => {
  return (
    <div className="app">
      <section className="error-page-v2" id="auth">
        <div className="error-bg-grid" aria-hidden="true" />

        <div className="error-content-v2">
          <span className="error-badge">
            <span className="error-badge-dot" aria-hidden="true" />
            NOT FOUND ON CHAIN
          </span>

          <h1 className="error-code">
            <span className="gradient-text">404</span>
          </h1>

          <h2 className="error-title-v2">Block not found</h2>

          <p className="error-sub-v2">
            This page isn't on our chain. It may have been moved, renamed,
            or never minted in the first place. Double-check the URL or jump
            back to safety.
          </p>

          <div className="error-cta-row">
            <Link to="/" className="btn btn-primary hero-btn">
              Back to home
            </Link>
            <Link to="/ledger" className="btn btn-ghost hero-btn">
              Verify a vehicle
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
          <div className="broken-chain">
            <div className="chain-block chain-block-left">
              <span className="chain-block-tag">BLOCK #042</span>
              <div className="chain-block-hash" />
              <div className="chain-block-hash short" />
            </div>

            <div className="chain-break">
              <span className="chain-spark chain-spark-1" />
              <span className="chain-spark chain-spark-2" />
              <span className="chain-spark chain-spark-3" />
              <span className="chain-spark chain-spark-4" />
              <svg
                className="chain-break-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 1 7 7l-2 2" />
                <path d="M14 11a5 5 0 0 0-7-7L5 6" />
              </svg>
            </div>

            <div className="chain-block chain-block-right">
              <span className="chain-block-tag chain-block-tag-missing">
                ???
              </span>
              <div className="chain-block-hash missing" />
              <div className="chain-block-hash missing short" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
