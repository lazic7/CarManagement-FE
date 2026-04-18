import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import "../../App.css";
import {
  createMechanic,
  listMechanics,
  type MechanicDto,
} from "../../api/mechanics";
import { clearAuthSession } from "../../utils/auth";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const Superadmin = () => {
  const [mechanics, setMechanics] = useState<MechanicDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleLogout = () => {
    clearAuthSession();
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await listMechanics();
      setMechanics(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load mechanics.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Email and password are required.");
      toast.error("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMechanic(email.trim(), password);
      toast.success(`Mechanic ${email} created.`);
      setEmail("");
      setPassword("");
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create mechanic.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="superadmin">
      <header>
        <div className="logo">AutoLedger</div>
        <nav>
          <span className="badge superadmin-badge">Superadmin</span>
          <Link to="/" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </header>
      <main className="superadmin-main">
        <section className="superadmin-hero">
          <span className="section-kicker">MECHANIC MANAGEMENT</span>
          <h1 className="superadmin-title">
            Manage the <span className="gradient-text">trusted network</span>
          </h1>
          <p className="superadmin-sub">
            Onboard new mechanics who can sign mileage records on the
            blockchain. Only verified operators should be added.
          </p>
          <div className="superadmin-stat-row">
            <div className="superadmin-stat">
              <span className="superadmin-stat-value">
                {isLoading ? "…" : mechanics.length}
              </span>
              <span className="superadmin-stat-label">
                Active mechanics
              </span>
            </div>
          </div>
        </section>

        <div className="superadmin-grid">
          <div className="glass-card superadmin-form-card">
            <div className="admin-form-header">
              <h2>Add new mechanic</h2>
              <p className="admin-form-sub">
                They will be able to sign on-chain mileage records using their
                own wallet.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="mech-email">Email</label>
                <input
                  type="email"
                  id="mech-email"
                  name="email"
                  placeholder="mechanic@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="mech-password">Temporary password</label>
                <input
                  type="text"
                  id="mech-password"
                  name="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="off"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating…" : "Create mechanic"}
              </button>

              {formError && (
                <p className="auth-feedback ledger-feedback">{formError}</p>
              )}
            </form>
          </div>

          <div className="superadmin-list-card">
            <div className="superadmin-list-header">
              <h2>All mechanics</h2>
              <span className="superadmin-list-count">
                {isLoading
                  ? "Loading…"
                  : `${mechanics.length} registered`}
              </span>
            </div>

            {isLoading ? (
              <ul className="superadmin-list">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="superadmin-item skeleton-sa-item">
                    <span
                      className="skeleton"
                      style={{ width: "55%", height: 16 }}
                    />
                    <span
                      className="skeleton"
                      style={{ width: "30%", height: 12 }}
                    />
                  </li>
                ))}
              </ul>
            ) : mechanics.length === 0 ? (
              <div className="superadmin-empty">
                <p>
                  No mechanics yet. Add your first one on the left to get
                  started.
                </p>
              </div>
            ) : (
              <ul className="superadmin-list">
                {mechanics.map((mechanic) => (
                  <li key={mechanic._id} className="superadmin-item">
                    <div className="superadmin-item-main">
                      <div className="superadmin-item-avatar" aria-hidden="true">
                        {mechanic.email.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="superadmin-item-email">
                          {mechanic.email}
                        </div>
                        <div className="superadmin-item-meta">
                          Joined {formatDate(mechanic.createdAt)}
                        </div>
                      </div>
                    </div>
                    <span className="superadmin-item-role">MECHANIC</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </section>
  );
};
