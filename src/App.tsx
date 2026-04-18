import { useState, type FormEvent } from "react";
import "./App.css";
import { Link, useNavigate } from "react-router";
import { loginUser, registerUser } from "./api/auth";
import type { AuthTokenPayloadDto } from "./api/dto";

export const App = () => {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const decodeTokenPayload = (token: string): AuthTokenPayloadDto | null => {
    try {
      const tokenParts = token.split(".");
      if (tokenParts.length < 2) {
        return null;
      }

      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;

      return JSON.parse(atob(padded)) as AuthTokenPayloadDto;
    } catch {
      return null;
    }
  };

  const clearFeedback = () => {
    setAuthError("");
    setAuthMessage("");
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (!loginEmail || !loginPassword) {
      setAuthError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem("authToken", response.token);

      const tokenPayload = decodeTokenPayload(response.token);
      if (tokenPayload?.role) {
        localStorage.setItem("authRole", tokenPayload.role);
        localStorage.setItem("authRoles", JSON.stringify([tokenPayload.role]));
      }

      if (tokenPayload?.role === "admin") {
        navigate("/dashboard");
        return;
      }

      navigate("/ledger");
    } catch (error) {
      setAuthError(
        error instanceof Error && error.message
          ? error.message
          : "Login failed. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (!registerEmail || !registerPassword) {
      setAuthError("Email and password are required.");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        email: registerEmail,
        password: registerPassword,
      });

      setAuthMessage("Registration successful. You can now log in.");
      setAuthView("login");
      setLoginEmail(registerEmail);
      setLoginPassword("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
    } catch (error) {
      setAuthError(
        error instanceof Error && error.message
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLanding = () => {
    setShowAuthForm(false);
    clearFeedback();
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
              <section className="landing-hero-v2">
                <div className="hero-bg-grid" aria-hidden="true" />
                <div className="hero-content">
                  <span className="hero-badge">
                    <span className="hero-badge-dot" aria-hidden="true" />
                    LIVE ON ENERGY WEB BLOCKCHAIN
                  </span>
                  <h1 className="hero-title">
                    Mileage you can{" "}
                    <span className="gradient-text">actually trust</span>.
                  </h1>
                  <p className="hero-subtitle">
                    Every odometer reading is sealed on-chain. Tamper-proof,
                    instantly verifiable, and permanent — for buyers,
                    dealerships, and service providers.
                  </p>
                  <div className="hero-cta">
                    <button
                      type="button"
                      className="btn btn-primary hero-btn"
                      onClick={() => {
                        setAuthView("register");
                        setShowAuthForm(true);
                      }}
                    >
                      Get started free
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost hero-btn"
                      onClick={() => {
                        setAuthView("login");
                        setShowAuthForm(true);
                      }}
                    >
                      Verify a vehicle
                      <svg
                        className="btn-arrow"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="hero-stats">
                    <div className="hero-stat">
                      <div className="hero-stat-value">100%</div>
                      <div className="hero-stat-label">immutable</div>
                    </div>
                    <div className="hero-stat-divider" aria-hidden="true" />
                    <div className="hero-stat">
                      <div className="hero-stat-value">&lt; 3s</div>
                      <div className="hero-stat-label">to verify</div>
                    </div>
                    <div className="hero-stat-divider" aria-hidden="true" />
                    <div className="hero-stat">
                      <div className="hero-stat-value">0€</div>
                      <div className="hero-stat-label">for buyers</div>
                    </div>
                  </div>
                </div>

                <div className="hero-visual" aria-hidden="true">
                  <div className="block-chain">
                    <div className="block-card block-1">
                      <div className="block-head">
                        <span className="block-tag">BLOCK #1</span>
                        <span className="block-check">
                          <svg viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                      </div>
                      <span className="block-vin">1HGCM82633A...</span>
                      <span className="block-km">82,450 km</span>
                    </div>
                    <div className="chain-link chain-link-1" />
                    <div className="block-card block-2">
                      <div className="block-head">
                        <span className="block-tag">BLOCK #2</span>
                        <span className="block-check">
                          <svg viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                      </div>
                      <span className="block-vin">1HGCM82633A...</span>
                      <span className="block-km">98,200 km</span>
                    </div>
                    <div className="chain-link chain-link-2" />
                    <div className="block-card block-3 block-active">
                      <div className="block-head">
                        <span className="block-tag">BLOCK #3</span>
                        <span className="block-live">
                          <span className="block-live-dot" />
                          NEW
                        </span>
                      </div>
                      <span className="block-vin">1HGCM82633A...</span>
                      <span className="block-km">125,800 km</span>
                    </div>
                  </div>
                </div>
              </section>

              <section id="about" className="landing-problem">
                <span className="section-kicker">THE PROBLEM</span>
                <h2>
                  Odometer fraud costs buyers{" "}
                  <span className="gradient-text">€9 billion</span> every year
                </h2>
                <p>
                  1 in 3 used cars in Europe has tampered mileage. Paper service
                  books get forged. Centralized databases get edited. Without a
                  trusted source of truth, every used car purchase becomes a leap
                  of faith.
                </p>
              </section>

              <section className="landing-how">
                <span className="section-kicker">HOW IT WORKS</span>
                <h2>Three steps. Zero trust required.</h2>
                <div className="how-grid">
                  <article className="how-step glass-card">
                    <div className="how-step-number">01</div>
                    <h3>Mechanic records</h3>
                    <p>
                      A verified mechanic enters the VIN and current mileage
                      after each service, signing the transaction with their
                      wallet.
                    </p>
                  </article>
                  <article className="how-step glass-card">
                    <div className="how-step-number">02</div>
                    <h3>Sealed on-chain</h3>
                    <p>
                      The record is cryptographically signed and written to the
                      Energy Web blockchain. Cannot be altered or deleted by
                      anyone — ever.
                    </p>
                  </article>
                  <article className="how-step glass-card">
                    <div className="how-step-number">03</div>
                    <h3>Instant verification</h3>
                    <p>
                      Anyone with the VIN sees the full mileage history in
                      seconds. No accounts required, no paperwork, no
                      middlemen.
                    </p>
                  </article>
                </div>
              </section>

              <section id="features" className="landing-audience">
                <span className="section-kicker">BUILT FOR</span>
                <h2>Every stakeholder in the vehicle lifecycle</h2>
                <div className="audience-grid">
                  <article className="audience-card glass-card">
                    <div className="audience-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 17h14l-1.5-6h-11z" />
                        <circle cx="7.5" cy="17.5" r="1.5" />
                        <circle cx="16.5" cy="17.5" r="1.5" />
                      </svg>
                    </div>
                    <h3>Buyers</h3>
                    <p>
                      Know exactly what you're paying for. Verify history
                      before you hand over money.
                    </p>
                  </article>
                  <article className="audience-card glass-card">
                    <div className="audience-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 21h18M5 21V8l7-5 7 5v13M10 21v-6h4v6" />
                      </svg>
                    </div>
                    <h3>Dealerships</h3>
                    <p>
                      Sell with provable integrity. Differentiate your
                      inventory with on-chain certification.
                    </p>
                  </article>
                  <article className="audience-card glass-card">
                    <div className="audience-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 7l3 3-9 9H5v-3zM14 7l3-3 3 3-3 3z" />
                      </svg>
                    </div>
                    <h3>Mechanics</h3>
                    <p>
                      Prove the work you've done. Build reputation directly on
                      the blockchain.
                    </p>
                  </article>
                  <article className="audience-card glass-card">
                    <div className="audience-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2l9 4v6c0 5-4 9-9 10C7 21 3 17 3 12V6z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <h3>Insurance</h3>
                    <p>
                      Accurate claims on accurate data. Spot inconsistencies
                      instantly.
                    </p>
                  </article>
                </div>
              </section>

              <section id="contact" className="landing-final-cta">
                <div className="final-cta-card">
                  <h2>Ready to end odometer fraud?</h2>
                  <p>
                    Join AutoLedger — the blockchain-verified mileage registry
                    built for the real world.
                  </p>
                  <div className="final-cta-actions">
                    <button
                      type="button"
                      className="btn btn-primary hero-btn"
                      onClick={() => {
                        setAuthView("register");
                        setShowAuthForm(true);
                      }}
                    >
                      Create free account
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost hero-btn"
                      onClick={() => {
                        setAuthView("login");
                        setShowAuthForm(true);
                      }}
                    >
                      I already have an account
                    </button>
                  </div>
                </div>
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
                    <form onSubmit={handleLoginSubmit}>
                      <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                          type="email"
                          id="login-email"
                          name="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(event) =>
                            setLoginEmail(event.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                          type="password"
                          id="login-password"
                          name="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(event) =>
                            setLoginPassword(event.target.value)
                          }
                          required
                        />
                      </div>
                      {authError && (
                        <p className="auth-feedback">{authError}</p>
                      )}
                      {authMessage && (
                        <p className="auth-feedback auth-feedback-success">
                          {authMessage}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Logging in..." : "Login"}
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
                    <form onSubmit={handleRegisterSubmit}>
                      <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input
                          type="email"
                          id="reg-email"
                          name="email"
                          placeholder="you@example.com"
                          value={registerEmail}
                          onChange={(event) =>
                            setRegisterEmail(event.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input
                          type="password"
                          id="reg-password"
                          name="password"
                          placeholder="••••••••"
                          value={registerPassword}
                          onChange={(event) =>
                            setRegisterPassword(event.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="reg-confirm">Confirm Password</label>
                        <input
                          type="password"
                          id="reg-confirm"
                          name="confirm"
                          placeholder="••••••••"
                          value={registerConfirmPassword}
                          onChange={(event) =>
                            setRegisterConfirmPassword(event.target.value)
                          }
                          required
                        />
                      </div>
                      {authError && (
                        <p className="auth-feedback">{authError}</p>
                      )}
                      {authMessage && (
                        <p className="auth-feedback auth-feedback-success">
                          {authMessage}
                        </p>
                      )}
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Registering..." : "Register"}
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
