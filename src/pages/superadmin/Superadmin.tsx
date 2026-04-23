import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import "../../App.css";
import {
  createMechanic,
  deleteMechanic,
  listMechanics,
  type MechanicDto,
} from "../../api/mechanics";
import { clearAuthSession } from "../../utils/auth";
import { getCurrentUser } from "../../api/auth";
import {
  addMechanicOnChain,
  revokeMechanicOnChain,
} from "../../web3/adminContract";
import { useWalletAddress } from "../../hooks/useWalletAddress";
import { WalletStatusBanner } from "../dashboard/WalletStatusBanner";
import { RemoveMechanicModal } from "./RemoveMechanicModal";

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
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [mechanicToRemove, setMechanicToRemove] = useState<MechanicDto | null>(
    null,
  );
  const [isRemoving, setIsRemoving] = useState(false);
  const [registeredWallet, setRegisteredWallet] = useState<string>("");
  const connectedWallet = useWalletAddress();

  const normalizedRegistered = registeredWallet.toLowerCase();
  const normalizedConnected = connectedWallet.toLowerCase();
  const hasWalletMismatch = Boolean(
    normalizedRegistered &&
      normalizedConnected &&
      normalizedRegistered !== normalizedConnected,
  );
  const walletReady =
    Boolean(normalizedConnected) &&
    (!normalizedRegistered || normalizedRegistered === normalizedConnected);

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

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (cancelled) return;
        if (user.walletAddress) setRegisteredWallet(user.walletAddress);
      })
      .catch(() => {
        /* ignore — banner will just say "connect" */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConfirmRemove = async () => {
    if (!mechanicToRemove) return;
    if (!walletReady) {
      toast.error(
        "Connect your superadmin wallet before removing a mechanic.",
      );
      return;
    }
    setIsRemoving(true);
    const pendingToast = toast.loading("Revoking on blockchain…");
    try {
      if (mechanicToRemove.walletAddress) {
        await revokeMechanicOnChain(mechanicToRemove.walletAddress);
        toast.loading("Wallet revoked. Removing account…", {
          id: pendingToast,
        });
      }
      await deleteMechanic(mechanicToRemove._id);
      toast.success(`${mechanicToRemove.email} removed from the network.`, {
        id: pendingToast,
      });
      setMechanicToRemove(null);
      await loadData();
    } catch (error) {
      toast.dismiss(pendingToast);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove mechanic.",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const trimmedWallet = walletAddress.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedWallet) {
      setFormError("Email and wallet address are required.");
      toast.error("All fields are required.");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)) {
      setFormError("Wallet address must be a valid 0x… Ethereum address.");
      toast.error("Invalid wallet address.");
      return;
    }

    if (!walletReady) {
      setFormError(
        "Connect your superadmin wallet in MetaMask before creating a mechanic.",
      );
      toast.error("Connect your superadmin wallet first.");
      return;
    }

    setIsSubmitting(true);
    const pendingToast = toast.loading("Approving mechanic on blockchain…");
    try {
      await addMechanicOnChain(trimmedWallet);
      toast.loading("Wallet approved. Creating account…", {
        id: pendingToast,
      });
      await createMechanic(trimmedEmail, trimmedWallet);
      toast.success(
        `Invitation sent to ${trimmedEmail}. They can set their password through the link.`,
        { id: pendingToast, duration: 6000 },
      );
      setEmail("");
      setWalletAddress("");
      await loadData();
    } catch (error) {
      toast.dismiss(pendingToast);
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
        <WalletStatusBanner expectedAddress={registeredWallet} />
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
                <label htmlFor="mech-wallet">Wallet address</label>
                <input
                  type="text"
                  id="mech-wallet"
                  name="walletAddress"
                  placeholder="0x…"
                  value={walletAddress}
                  onChange={(event) => setWalletAddress(event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
                <p className="form-hint">
                  This wallet will be permanently tied to the account — only it
                  can sign on-chain records.
                </p>
              </div>

              <div className="invite-notice">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 4h16v16H4zM4 4l8 8 8-8" />
                </svg>
                <span>
                  We'll email the mechanic a link to set their own password —
                  you don't enter one here.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !walletReady}
              >
                {isSubmitting
                  ? "Creating…"
                  : !walletReady
                    ? hasWalletMismatch
                      ? "Switch to superadmin wallet to continue"
                      : "Connect wallet to continue"
                    : "Create mechanic"}
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
                          {mechanic.walletAddress && (
                            <>
                              {" · "}
                              <code className="superadmin-item-wallet">
                                {mechanic.walletAddress.slice(0, 6)}…
                                {mechanic.walletAddress.slice(-4)}
                              </code>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="superadmin-item-actions">
                      {mechanic.isPending ? (
                        <span className="superadmin-item-role superadmin-item-role-pending">
                          PENDING
                        </span>
                      ) : (
                        <span className="superadmin-item-role">MECHANIC</span>
                      )}
                      <button
                        type="button"
                        className="superadmin-item-remove"
                        onClick={() => setMechanicToRemove(mechanic)}
                        disabled={!walletReady}
                        title={
                          !walletReady
                            ? "Connect your superadmin wallet to remove mechanics"
                            : `Remove ${mechanic.email}`
                        }
                        aria-label={`Remove ${mechanic.email}`}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {mechanicToRemove && (
        <RemoveMechanicModal
          email={mechanicToRemove.email}
          walletAddress={mechanicToRemove.walletAddress}
          isSubmitting={isRemoving}
          onConfirm={handleConfirmRemove}
          onCancel={() => {
            if (!isRemoving) setMechanicToRemove(null);
          }}
        />
      )}
    </section>
  );
};
