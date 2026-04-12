import { useState } from "react";
import { Link } from "react-router";
import "../../App.css";
import { submitMileageOnChain } from "../../web3/mileageContract";

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
      return;
    }

    if (
      !Number.isFinite(parsedMileage) ||
      !Number.isInteger(parsedMileage) ||
      parsedMileage <= 0
    ) {
      setSubmitError("Mileage must be a whole number greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("Opening MetaMask and preparing transaction...");

    try {
      const result = await submitMileageOnChain(normalizedVin, parsedMileage, {
        onTransactionSubmitted: (hash) => {
          setTxHash(hash);
          setSubmitStatus("Transaction submitted. Waiting for confirmation...");
        },
      });

      setWalletAddress(result.walletAddress);

      if (result.confirmationStatus === "confirmed") {
        setSubmitStatus("Mileage successfully written to blockchain.");
      } else {
        setSubmitStatus(
          "Transaction sent, but confirmation is taking longer than expected. Check tx hash in explorer.",
        );
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
        return;
      }

      const message =
        error instanceof Error && error.message
          ? error.message
          : "Transaction failed in MetaMask.";
      setSubmitError(message);
      setSubmitStatus("");
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
              <p className="ledger-meta">Wallet: {walletAddress}</p>
            )}
            {txHash && (
              <p className="ledger-meta">Transaction hash: {txHash}</p>
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
