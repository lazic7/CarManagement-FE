import { useMemo, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import "../../App.css";
import { getMileageRecordsByVin } from "../../api/records";
import type { MileageRecordDto } from "../../api/dto";
import { generateVehiclePassport } from "../../utils/pdfExport";
import { buildAddressUrl, shortenHash } from "../../utils/explorer";
import { clearAuthSession } from "../../utils/auth";
import { VehicleStatsCard } from "./VehicleStatsCard";
import { MileageChart } from "./MileageChart";
import {
  StatsCardSkeleton,
  ChartSkeleton,
  TimelineSkeleton,
} from "./LedgerSkeletons";

export const Ledger = () => {
  const [vin, setVin] = useState("");
  const [fetchedVin, setFetchedVin] = useState("");
  const [records, setRecords] = useState<MileageRecordDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    clearAuthSession();
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
      toast.error("VIN is required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await getMileageRecordsByVin(normalizedVin);
      setRecords(response);
      setFetchedVin(normalizedVin);
      if (response.length === 0) {
        toast("No records found for this VIN.", { icon: "ℹ️" });
      } else {
        toast.success(`Loaded ${response.length} verified record${response.length === 1 ? "" : "s"}.`);
      }
    } catch (error) {
      setRecords([]);
      setFetchedVin("");
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to fetch mileage data.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPassport = () => {
    if (!fetchedVin || records.length === 0) return;
    generateVehiclePassport(fetchedVin, records);
    toast.success("Vehicle Passport downloaded.");
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

            {isLoading && sortedRecords.length === 0 && (
              <>
                <StatsCardSkeleton />
                <ChartSkeleton />
              </>
            )}

            {!isLoading && sortedRecords.length > 0 && (
              <VehicleStatsCard vin={fetchedVin} records={sortedRecords} />
            )}
            {!isLoading && sortedRecords.length >= 2 && (
              <MileageChart records={sortedRecords} />
            )}

            <div className="results-section">
              <div className="results-header">
                <h3>Mileage history</h3>
                {!isLoading && sortedRecords.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={handleDownloadPassport}
                  >
                    <span className="btn-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
                        <path d="M5 21h14" />
                      </svg>
                    </span>
                    Vehicle Passport
                  </button>
                )}
              </div>
              {isLoading ? (
                <TimelineSkeleton rows={3} />
              ) : sortedRecords.length === 0 ? (
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
                      <div className="hash">
                        <span className="meta-label">Mechanic</span>
                        <a
                          className="explorer-link"
                          href={buildAddressUrl(record.mechanic)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <code>{shortenHash(record.mechanic)}</code>
                          <svg className="external-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M14 3h7v7" />
                            <path d="M10 14L21 3" />
                            <path d="M21 14v7h-7" />
                            <path d="M3 10V3h7" />
                          </svg>
                        </a>
                      </div>
                      <span className="status-badge">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="badge-icon">
                          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                        </svg>
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
