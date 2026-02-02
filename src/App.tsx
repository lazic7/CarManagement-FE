import { useState } from "react";
import "./App.css";
import { Link } from "react-router";

export const App = () => {
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const showLanding = () => {
    setShowAuthForm(false);
  };

  return (
    <div className="app">
      <section id="auth">
        <div className="landing-shell">
          <header className="landing-header glass-card">
            <Link
              to="/"
              className="logo"
              onClick={(event) => {
                event.preventDefault();
                showLanding();
              }}
            >
              AutoLedger
            </Link>
            <nav className="landing-nav">
              {!showAuthForm && (
                <>
                  <div className="user-menu">
                    <button
                      type="button"
                      className="user-menu-trigger"
                      onClick={() => {
                        setAuthView("login");
                        setShowAuthForm(true);
                      }}
                      aria-label="Open sign in form"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.17 0-7.5 2.09-7.5 4.69a.56.56 0 0 0 .56.56h13.88a.56.56 0 0 0 .56-.56c0-2.6-3.33-4.69-7.5-4.69Z" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </nav>
          </header>

          {!showAuthForm && (
            <>
              <section className="landing-hero">
                <p className="landing-kicker">Blockchain-verified mileage</p>
                <h1>AutoLedger</h1>
                <p>
                  Transparent vehicle history and mileage verification for
                  buyers, dealerships, and service providers.
                </p>
              </section>

              <section id="about" className="landing-section glass-card">
                <h2>About AutoLedger</h2>
                <p>
                  Every mileage update is sealed on-chain, so the history stays
                  immutable and easy to verify.
                </p>
              </section>

              <section className="landing-feature-grid">
                <article id="features" className="glass-card landing-tile">
                  <h3>Features</h3>
                  <p>VIN lookup, timeline history, and blockchain proofs.</p>
                </article>
                <article id="security" className="glass-card landing-tile">
                  <h3>Security</h3>
                  <p>Immutable records and transparent audit trail.</p>
                </article>
                <article id="contact" className="glass-card landing-tile">
                  <h3>Contact</h3>
                  <p>Talk to our team for integration and onboarding.</p>
                </article>
                <article id="support" className="glass-card landing-tile">
                  <h3>Support</h3>
                  <p>Guides, documentation, and direct help when needed.</p>
                </article>
              </section>
            </>
          )}

          {showAuthForm && (
            <div className="auth-container landing-auth">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={authView === "login" ? "is-active" : ""}
                  onClick={() => setAuthView("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={authView === "register" ? "is-active" : ""}
                  onClick={() => setAuthView("register")}
                >
                  Register
                </button>
              </div>

              {authView === "login" && (
                <div id="login-panel" className="auth-panel">
                  <div className="glass-card auth-card">
                    <h1 className="title">Welcome back to AutoLedger</h1>
                    <form action="#" method="get">
                      <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                          type="email"
                          id="login-email"
                          name="email"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                          type="password"
                          id="login-password"
                          name="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Login
                      </button>
                    </form>
                    <p className="auth-switch">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={() => setAuthView("register")}
                      >
                        Register
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {authView === "register" && (
                <div id="register-panel" className="auth-panel">
                  <div className="glass-card auth-card">
                    <h1 className="title">Create your AutoLedger account</h1>
                    <form action="#" method="get">
                      <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input
                          type="email"
                          id="reg-email"
                          name="email"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input
                          type="password"
                          id="reg-password"
                          name="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="reg-confirm">Confirm Password</label>
                        <input
                          type="password"
                          id="reg-confirm"
                          name="confirm"
                          placeholder="••••••••"
                        />
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Register
                      </button>
                    </form>
                    <p className="auth-switch">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={() => setAuthView("login")}
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer>
          <p>AutoLedger — Immutable vehicle history powered by blockchain</p>
        </footer>
      </section>
    </div>
  );
};
