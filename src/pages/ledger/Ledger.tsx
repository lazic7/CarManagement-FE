import { useMemo, useState } from "react";
import { Link } from "react-router";
import "../../App.css";
import { getMileageRecordsByVin } from "../../api/records";
import type { MileageRecordDto } from "../../api/dto";

export const Ledger = () => {
  const [vin, setVin] = useState("");
  const [records, setRecords] = useState<MileageRecordDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    localStorage.clear();
  };

  const sortedRecords = useMemo(
    () =>
      [...records].sort((a, b) => {
        const left = Number(a.timestamp) || 0;
        const right = Number(b.timestamp) || 0;
        return right - left;
      }),
    [records],
  );

  const handleFetchRecords = async () => {
    const normalizedVin = vin.trim().toUpperCase();

    setErrorMessage("");
    if (!normalizedVin) {
      setErrorMessage("VIN is required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await getMileageRecordsByVin(normalizedVin);
      setRecords(response);
    } catch (error) {
      setRecords([]);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Failed to fetch mileage data.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="dashboard">
      <header>
        <div className="logo">AutoLedger</div>
        <nav>
          <Link to="/" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </header>
      <main>
        <div className="dashboard-grid">
          <div className="glass-card verification-card">
            <h2>Verify Vehicle Mileage</h2>
            <div className="form-group">
              <label htmlFor="vin">VIN Number</label>
              <input
                type="text"
                id="vin"
                name="vin"
                placeholder="e.g. 1HGBH41JXMN109186"
                value={vin}
                onChange={(event) => setVin(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={handleFetchRecords}
            >
              {isLoading ? "Loading..." : "Fetch Vehicle Data"}
            </button>

            {errorMessage && (
              <p className="auth-feedback ledger-feedback">{errorMessage}</p>
            )}

            <div className="results-section">
              <h3>Mileage history</h3>
              {sortedRecords.length === 0 ? (
                <div className="empty-state">
                  <p>
                    Enter a VIN and click <strong>Fetch Vehicle Data</strong> to
                    see verification history.
                  </p>
                  <p>
                    Results appear below as a timeline with blockchain proof.
                  </p>
                </div>
              ) : (
                <ul className="timeline">
                  {sortedRecords.map((record, index) => (
                    <li
                      className="timeline-item"
                      key={`${record.mechanic}-${record.timestamp}-${record.mileage}-${index}`}
                    >
                      <div className="date">
                        {record.timestamp
                          ? new Date(record.timestamp * 1000).toLocaleString()
                          : "Date unavailable"}
                      </div>
                      <div className="mileage">
                        {record.mileage.toLocaleString()} km
                      </div>
                      <div className="hash">Mechanic: {record.mechanic}</div>
                      <span className="status-badge">
                        Verified on Blockchain
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};
