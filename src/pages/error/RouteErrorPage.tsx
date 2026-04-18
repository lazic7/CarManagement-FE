import {
  isRouteErrorResponse,
  Link,
  useRouteError,
  type ErrorResponse,
} from "react-router";
import "../../App.css";

const getRouteErrorDetail = (data: unknown) => {
  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return "An unexpected error occurred while loading this page.";
};

const getErrorMessage = (error: unknown) => {
  if (isRouteErrorResponse(error)) {
    return {
      code: String(error.status),
      title: error.statusText || "Route error",
      detail: getRouteErrorDetail(error.data),
    };
  }

  if (error instanceof Error) {
    return {
      code: "500",
      title: "Something broke",
      detail: error.message || "Please try again in a moment.",
    };
  }

  return {
    code: "500",
    title: "Something broke",
    detail: "Please try again in a moment.",
  };
};

export const RouteErrorPage = () => {
  const error = useRouteError() as ErrorResponse | Error | unknown;
  const { code, title, detail } = getErrorMessage(error);

  return (
    <div className="app">
      <section className="error-page-v2" id="auth">
        <div className="error-bg-grid" aria-hidden="true" />

        <div className="error-content-v2">
          <span className="error-badge error-badge-danger">
            <span
              className="error-badge-dot error-badge-dot-danger"
              aria-hidden="true"
            />
            UNEXPECTED ERROR
          </span>

          <h1 className="error-code">
            <span className="gradient-text">{code}</span>
          </h1>

          <h2 className="error-title-v2">{title}</h2>

          <p className="error-sub-v2">{detail}</p>

          <div className="error-cta-row">
            <button
              type="button"
              className="btn btn-primary hero-btn"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
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
          <div className="fragmented-block">
            <div className="fragment fragment-main">
              <div className="fragment-bar" />
              <div className="fragment-bar short" />
              <div className="fragment-bar" />
            </div>

            <div className="fragment fragment-shard fragment-shard-1" />
            <div className="fragment fragment-shard fragment-shard-2" />
            <div className="fragment fragment-shard fragment-shard-3" />

            <div className="glitch-warning">
              <span className="glitch-ring" />
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l10 18H2L12 2z" />
                <path d="M12 9v5M12 17h.01" />
              </svg>
            </div>

            <span className="error-spark error-spark-1" />
            <span className="error-spark error-spark-2" />
            <span className="error-spark error-spark-3" />
          </div>
        </div>
      </section>
    </div>
  );
};
