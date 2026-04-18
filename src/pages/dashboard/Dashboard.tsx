import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import "../../App.css";
import { submitMileageOnChain } from "../../web3/mileageContract";
import { buildTxUrl, buildAddressUrl, shortenHash } from "../../utils/explorer";
import { celebrate } from "../../utils/celebrate";
import { clearAuthSession } from "../../utils/auth";
import {
  fetchAdminHistoryFromChain,
  fetchLastRecord,
  type LastRecordInfo,
} from "../../web3/mileageEvents";
import { useWalletAddress } from "../../hooks/useWalletAddress";
import { WalletStatusBanner } from "./WalletStatusBanner";
import { AdminStatsCard } from "./AdminStatsCard";
import { RecentActivity } from "./RecentActivity";
import { StepIndicator, type SubmitStep } from "./StepIndicator";
import { SubmitConfirmModal } from "./SubmitConfirmModal";
import {
  loadHistory,
  persistHistory,
  saveEntry,
  type AdminHistoryEntry,
} from "./adminHistory";

const LARGE_JUMP_KM = 50_000;
const SUSPICIOUS_TOTAL_KM = 1_000_000;

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

const formatDigitsWithCommas = (digits: string): string => {
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
};

const formatDateShort = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const Dashboard = () => {
  const [vin, setVin] = useState("");
  const [mileageDigits, setMileageDigits] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<SubmitStep>("idle");
  const [history, setHistory] = useState<AdminHistoryEntry[]>([]);
  const [isSyncingChain, setIsSyncingChain] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [lastRecord, setLastRecord] = useState<LastRecordInfo | null>(null);
  const [isLookingUpVin, setIsLookingUpVin] = useState(false);
  const [vinLookupDone, setVinLookupDone] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const connectedWallet = useWalletAddress();

  const normalizedVin = vin.trim().toUpperCase();
  const parsedMileage = mileageDigits ? Number(mileageDigits) : 0;
  const formattedMileage = formatDigitsWithCommas(mileageDigits);

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
        setHistory((previous) => {
          const merged = mergeHistories(chainEntries, previous);
          persistHistory(merged);
          return merged;
        });
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

  useEffect(() => {
    if (normalizedVin.length < 5) {
      setLastRecord(null);
      setVinLookupDone(false);
      setIsLookingUpVin(false);
      return;
    }

    let cancelled = false;
    setIsLookingUpVin(true);
    const timer = setTimeout(() => {
      fetchLastRecord(normalizedVin)
        .then((record) => {
          if (cancelled) return;
          setLastRecord(record);
          setVinLookupDone(true);
        })
        .catch(() => {
          if (cancelled) return;
          setLastRecord(null);
          setVinLookupDone(true);
        })
        .finally(() => {
          if (!cancelled) setIsLookingUpVin(false);
        });
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalizedVin]);

  const delta = useMemo(() => {
    if (!lastRecord || parsedMileage <= 0) return null;
    return parsedMileage - lastRecord.mileage;
  }, [lastRecord, parsedMileage]);

  const hardError = useMemo(() => {
    if (parsedMileage > 0 && lastRecord && parsedMileage < lastRecord.mileage) {
      return `Mileage cannot be lower than last on-chain record (${lastRecord.mileage.toLocaleString()} km).`;
    }
    return "";
  }, [parsedMileage, lastRecord]);

  const warnings = useMemo(() => {
    const list: string[] = [];
    if (parsedMileage > SUSPICIOUS_TOTAL_KM) {
      list.push(
        `${parsedMileage.toLocaleString()} km is unusually high — double-check for typos.`,
      );
    }
    if (delta !== null && delta > LARGE_JUMP_KM) {
      list.push(
        `Large jump of +${delta.toLocaleString()} km since last record. Make sure this is intentional.`,
      );
    }
    return list;
  }, [parsedMileage, delta]);

  const handleLogout = () => {
    clearAuthSession();
  };

  const handleReset = () => {
    setVin("");
    setMileageDigits("");
    setSubmitError("");
    setTxHash("");
    setWalletAddress("");
    setStep("idle");
    setJustSubmitted(false);
    setLastRecord(null);
    setVinLookupDone(false);
  };

  const handleMileageInput = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    if (digitsOnly.length > 10) return;
    setMileageDigits(digitsOnly);
  };

  const validateBeforeConfirm = (): boolean => {
    setSubmitError("");

    if (!normalizedVin) {
      toast.error("VIN is required.");
      return false;
    }

    if (
      !Number.isFinite(parsedMileage) ||
      !Number.isInteger(parsedMileage) ||
      parsedMileage <= 0
    ) {
      toast.error("Mileage must be a whole number greater than 0.");
      return false;
    }

    if (hardError) {
      setSubmitError(hardError);
      toast.error(hardError);
      return false;
    }

    return true;
  };

  const openConfirm = () => {
    if (!validateBeforeConfirm()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitError("");
    setTxHash("");
    setWalletAddress("");
    setJustSubmitted(false);

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
      setHistory((previous) => saveEntry(entry, previous));

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

  const hasBlockingError = Boolean(hardError);

  return (
    <section id="admin">
      <header>
        <div className="logo">AutoLedger</div>
        <nav>
          <span className="badge">Mechanic Panel</span>
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
                autoComplete="off"
                spellCheck={false}
              />
              {normalizedVin.length >= 5 && (
                <div className="vin-lookup">
                  {isLookingUpVin ? (
                    <span className="vin-lookup-pill vin-lookup-loading">
                      <span className="sync-spinner" aria-hidden="true" />
                      Checking blockchain…
                    </span>
                  ) : vinLookupDone && lastRecord ? (
                    <span className="vin-lookup-pill vin-lookup-known">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Last:{" "}
                      <strong>
                        {lastRecord.mileage.toLocaleString()} km
                      </strong>{" "}
                      on {formatDateShort(lastRecord.timestamp)}
                    </span>
                  ) : vinLookupDone ? (
                    <span className="vin-lookup-pill vin-lookup-new">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      New VIN — first record on-chain
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="admin-mileage">Mileage (km)</label>
              <input
                type="text"
                id="admin-mileage"
                name="mileage"
                inputMode="numeric"
                placeholder="e.g. 45,200"
                value={formattedMileage}
                onChange={(event) => handleMileageInput(event.target.value)}
                disabled={isSubmitting}
                autoComplete="off"
              />
              {parsedMileage > 0 && lastRecord && delta !== null && (
                <div
                  className={
                    delta < 0
                      ? "mileage-delta mileage-delta-down"
                      : delta === 0
                        ? "mileage-delta mileage-delta-zero"
                        : delta > LARGE_JUMP_KM
                          ? "mileage-delta mileage-delta-warn"
                          : "mileage-delta mileage-delta-up"
                  }
                >
                  {delta < 0 ? (
                    <>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 9v4M12 17h.01" />
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                      Decrease of {Math.abs(delta).toLocaleString()} km — not
                      allowed
                    </>
                  ) : delta === 0 ? (
                    <>Same as last on-chain record</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      +{delta.toLocaleString()} km since last record
                    </>
                  )}
                </div>
              )}
              {parsedMileage > SUSPICIOUS_TOTAL_KM && !lastRecord && (
                <div className="mileage-delta mileage-delta-warn">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {parsedMileage.toLocaleString()} km is unusually high —
                  double-check.
                </div>
              )}
            </div>

            {!justSubmitted ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSubmitting || hasBlockingError}
                onClick={openConfirm}
              >
                {hasBlockingError
                  ? "Fix issues above to continue"
                  : "Review & save to blockchain"}
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

      {showConfirmModal && (
        <SubmitConfirmModal
          vin={normalizedVin}
          mileage={parsedMileage}
          delta={delta}
          warnings={warnings}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmedSubmit}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </section>
  );
};
