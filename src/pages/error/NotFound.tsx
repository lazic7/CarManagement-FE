import { Link } from "react-router";
import "../../App.css";

export const NotFound = () => {
  return (
    <div className="app">
      <section className="error-page" id="auth">
        <div className="glass-card error-card">
          <p className="error-eyebrow">404</p>
          <h1>Stranica nije pronađena</h1>
          <p>
            Putanja koju si otvorio ne postoji. Vrati se na početnu i nastavi od
            tamo.
          </p>
          <Link to="/" className="btn btn-primary error-cta">
            Nazad na početnu
          </Link>
        </div>
      </section>
    </div>
  );
};
