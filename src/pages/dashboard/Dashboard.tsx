import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import "../../App.css";
import { submitMileageOnChain } from "../../web3/mileageContract";
import { buildTxUrl, buildAddressUrl, shortenHash } from "../../utils/explorer";
import { celebrate } from "../../utils/celebrate";
import { clearAuthSession } from "../../utils/auth";
import { fetchAdminHistoryFromChain } from "../../web3/mileageEvents";
import { useWalletAddress } from "../../hooks/useWalletAddress";
import { WalletStatusBanner } from "./WalletStatusBanner";
import { AdminStatsCard } from "./AdminStatsCard";
import { RecentActivity } from "./RecentActivity";
import { StepIndicator, type SubmitStep } from "./StepIndicator";
import {
  loadHistory,
  saveEntry,
  type AdminHistoryEntry,
} from "./adminHistory";

const mergeHistories = (
  chain: AdminHistoryEntry[],
  local: AdminHistoryEntry[],
): AdminHistoryEntry[] => {
  const chainHashes = new Set(chain.map((entry) => entry.txHash.toLowerCase()));
  const localOnly = local.filter(
    (entry) => !chainHashes.has(entry.txHash.toLowerCase()),
  );
  return [...chain, ...localOnly].sort((a, b) => b.timestamp - a.timestamp);
};

export const Dashboard = () => {
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<SubmitStep>("idle");
  const [history, setHistory] = useState<AdminHistoryEntry[]>([]);
  const [isSyncingChain, setIsSyncingChain] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const connectedWallet = useWalletAddress();

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (!connectedWallet) return;
    let cancelled = false;
    setIsSyncingChain(true);
    fetchAdminHistoryFromChain(connectedWallet)
      .then((chainEntries) => {
        if (cancelled) return;
        setHistory((previous) => mergeHistories(chainEntries, previous));
      })
      .catch(() => {
        /* fallback: keep local history */
      })
      .finally(() => {
        if (!cancelled) setIsSyncingChain(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connectedWallet]);

  const handleLogout = () => {
    clearAuthSession();
  };

  const handleReset = () => {
    setVin("");
    setMileage("");
    setSubmitError("");
    setTxHash("");
    setWalletAddress("");
    setStep("idle");
    setJustSubmitted(false);
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setTxHash("");
    setWalletAddress("");
    setJustSubmitted(false);

    const normalizedVin = vin.trim().toUpperCase();
    const parsedMileage = Number(mileage);

    if (!normalizedVin) {
      setSubmitError("VIN is required.");
      toast.error("VIN is required.");
      return;
    }

    if (
      !Number.isFinite(parsedMileage) ||
      !Number.isInteger(parsedMileage) ||
      parsedMileage <= 0
    ) {
      setSubmitError("Mileage must be a whole number greater than 0.");
      toast.error("Mileage must be a whole number greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setStep("metamask");
    const pendingToast = toast.loading("Opening MetaMask…");

    try {
      const result = await submitMileageOnChain(normalizedVin, parsedMileage, {
        onTransactionSubmitted: (hash) => {
          setTxHash(hash);
          setStep("submitted");
          toast.loading("Transaction submitted, waiting for confirmation…", {
            id: pendingToast,
          });
        },
      });

      setWalletAddress(result.walletAddress);
      setStep("done");

      const entry: AdminHistoryEntry = {
        vin: normalizedVin,
        mileage: parsedMileage,
        txHash: result.txHash,
        walletAddress: result.walletAddress,
        timestamp: Date.now(),
        status: result.confirmationStatus,
      };
      setHistory(saveEntry(entry));

      if (result.confirmationStatus === "confirmed") {
        toast.success("Mileage recorded on blockchain!", { id: pendingToast });
        celebrate();
      } else {
        toast.success("Transaction sent. Confirmation is pending.", {
          id: pendingToast,
        });
      }

      setJustSubmitted(true);
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";

      if (code === "4001" || code === "ACTION_REJECTED") {
        setSubmitError("Transaction was rejected in MetaMask.");
        toast.error("Rejected in MetaMask.", { id: pendingToast });
        setStep("idle");
        return;
      }

      const message =
        error instanceof Error && error.message
          ? error.message
          : "Transaction failed in MetaMask.";
      setSubmitError(message);
      toast.error(message, { id: pendingToast });
      setStep("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="admin">
      <header>
        <div className="logo">AutoLedger</div>
        <nav>
          <span className="badge">Admin Panel</span>
          <Link to="/" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </header>
      <main>
        <WalletStatusBanner />
        <AdminStatsCard history={history} isSyncing={isSyncingChain} />

        <div className="admin-grid">
          <div className="glass-card admin-form-card">
            <div className="admin-form-header">
              <h2>Submit mileage to blockchain</h2>
              <p className="admin-form-sub">
                Records are permanent and cannot be altered once confirmed.
              </p>
            </div>

            <StepIndicator step={step} />

            <div className="form-group">
              <label htmlFor="admin-vin">VIN Number</label>
              <input
                type="text"
                id="admin-vin"
                name="vin"
                placeholder="e.g. 1HGBH41JXMN109186"
                value={vin}
                onChange={(event) => setVin(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-mileage">Mileage (km)</label>
              <input
                type="number"
                id="admin-mileage"
                name="mileage"
                placeholder="e.g. 45200"
                min="0"
                value={mileage}
                onChange={(event) => setMileage(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {!justSubmitted ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Waiting for MetaMask..." : "Save to Blockchain"}
              </button>
            ) : (
              <div className="actions-row">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleReset}
                >
                  Submit another
                </button>
                <a
                  className="btn btn-primary"
                  href={buildTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                </a>
              </div>
            )}

            {submitError && (
              <p className="auth-feedback ledger-feedback">{submitError}</p>
            )}

            {walletAddress && (
              <p className="ledger-meta">
                <span className="meta-label">Wallet</span>
                <a
                  className="explorer-link"
                  href={buildAddressUrl(walletAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <code>{shortenHash(walletAddress)}</code>
                  <svg
                    className="external-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M14 3h7v7" />
                    <path d="M10 14L21 3" />
                    <path d="M21 14v7h-7" />
                    <path d="M3 10V3h7" />
                  </svg>
                </a>
              </p>
            )}
            {txHash && (
              <p className="ledger-meta">
                <span className="meta-label">Transaction</span>
                <a
                  className="explorer-link"
                  href={buildTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <code>{shortenHash(txHash, 10, 8)}</code>
                  <svg
                    className="external-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M14 3h7v7" />
                    <path d="M10 14L21 3" />
                    <path d="M21 14v7h-7" />
                    <path d="M3 10V3h7" />
                  </svg>
                </a>
              </p>
            )}

            <div className="metamask-box">
              <div className="metamask-icon" aria-hidden="true">
                🦊
              </div>
              <p>
                You will be asked to confirm this transaction in MetaMask. The
                record will be written to the blockchain permanently.
              </p>
            </div>
          </div>

          <RecentActivity history={history} />
        </div>
      </main>
    </section>
  );
};
