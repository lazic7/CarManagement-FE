import {
  isRouteErrorResponse,
  Link,
  useRouteError,
  type ErrorResponse,
} from "react-router";
import "../../App.css";

const getErrorMessage = (error: unknown) => {
  if (isRouteErrorResponse(error)) {
    return {
      code: String(error.status),
      title: error.statusText || "Greška na ruti",
      detail:
        typeof error.data === "string"
          ? error.data
          : "Dogodila se greška pri učitavanju stranice.",
    };
  }

  if (error instanceof Error) {
    return {
      code: "500",
      title: "Neočekivana greška",
      detail: error.message || "Pokušaj ponovo malo kasnije.",
    };
  }

  return {
    code: "500",
    title: "Neočekivana greška",
    detail: "Pokušaj ponovo malo kasnije.",
  };
};

export const RouteErrorPage = () => {
  const error = useRouteError() as ErrorResponse | Error | unknown;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="app">
      <section className="error-page" id="auth">
        <div className="glass-card error-card">
          <p className="error-eyebrow">{errorMessage.code}</p>
          <h1>{errorMessage.title}</h1>
          <p>{errorMessage.detail}</p>
          <Link to="/" className="btn btn-primary error-cta">
            Nazad na početnu
          </Link>
        </div>
      </section>
    </div>
  );
};
