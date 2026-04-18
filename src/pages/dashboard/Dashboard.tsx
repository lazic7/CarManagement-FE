import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import "../../App.css";
import { submitMileageOnChain } from "../../web3/mileageContract";
import { buildTxUrl, buildAddressUrl, shortenHash } from "../../utils/explorer";
import { celebrate } from "../../utils/celebrate";

export const Dashboard = () => {
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitStatus("");
    setTxHash("");
    setWalletAddress("");

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
    setSubmitStatus("Opening MetaMask and preparing transaction...");
    const pendingToast = toast.loading("Opening MetaMask…");

    try {
      const result = await submitMileageOnChain(normalizedVin, parsedMileage, {
        onTransactionSubmitted: (hash) => {
          setTxHash(hash);
          setSubmitStatus("Transaction submitted. Waiting for confirmation...");
          toast.loading("Transaction submitted, waiting for confirmation…", {
            id: pendingToast,
          });
        },
      });

      setWalletAddress(result.walletAddress);

      if (result.confirmationStatus === "confirmed") {
        setSubmitStatus("Mileage successfully written to blockchain.");
        toast.success("Mileage recorded on blockchain!", { id: pendingToast });
        celebrate();
      } else {
        setSubmitStatus(
          "Transaction sent, but confirmation is taking longer than expected. Check tx hash in explorer.",
        );
        toast.success("Transaction sent. Confirmation is pending.", {
          id: pendingToast,
        });
      }

      setMileage("");
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";

      if (code === "4001" || code === "ACTION_REJECTED") {
        setSubmitError("Transaction was rejected in MetaMask.");
        setSubmitStatus("");
        toast.error("Rejected in MetaMask.", { id: pendingToast });
        return;
      }

      const message =
        error instanceof Error && error.message
          ? error.message
          : "Transaction failed in MetaMask.";
      setSubmitError(message);
      setSubmitStatus("");
      toast.error(message, { id: pendingToast });
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
        <div className="dashboard-grid">
          <div className="glass-card">
            <h2>Submit Mileage to Blockchain</h2>
            <div className="form-group">
              <label htmlFor="admin-vin">VIN Number</label>
              <input
                type="text"
                id="admin-vin"
                name="vin"
                placeholder="e.g. 1HGBH41JXMN109186"
                value={vin}
                onChange={(event) => setVin(event.target.value)}
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
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Waiting for MetaMask..." : "Save to Blockchain"}
            </button>

            {submitError && (
              <p className="auth-feedback ledger-feedback">{submitError}</p>
            )}
            {submitStatus && (
              <p className="auth-feedback auth-feedback-success ledger-feedback">
                {submitStatus}
              </p>
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
                  <svg className="external-icon" viewBox="0 0 24 24" aria-hidden="true">
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
                  <svg className="external-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14 3h7v7" />
                    <path d="M10 14L21 3" />
                    <path d="M21 14v7h-7" />
                    <path d="M3 10V3h7" />
                  </svg>
                </a>
                <span className="verified-chip">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  View on Volta Explorer
                </span>
              </p>
            )}

            <div className="metamask-box">
              <div className="metamask-icon" aria-hidden="true">
                🦊
              </div>
              <p>
                You will be asked to confirm this transaction in MetaMask. This
                will write the mileage record to the blockchain and cannot be
                undone.
              </p>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};
