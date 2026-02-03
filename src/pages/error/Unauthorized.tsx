import { Link, useSearchParams } from "react-router";
import "../../App.css";

export const Unauthorized = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="app">
      <section className="error-page" id="auth">
        <div className="glass-card error-card">
          <p className="error-eyebrow">401</p>
          <h1>Pristup nije dozvoljen</h1>
          <p>
            Moraš biti prijavljen da bi otvorio ovu stranicu
            {from ? ` (${from}).` : "."}
          </p>
          <Link to="/" className="btn btn-primary error-cta">
            Nazad na početnu
          </Link>
        </div>
      </section>
    </div>
  );
};
