import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import "../../App.css";
import { fetchAdminHistoryFromChain } from "../../web3/mileageEvents";
import type { AdminHistoryEntry } from "../dashboard/adminHistory";
import {
  buildAddressUrl,
  buildTxUrl,
  shortenHash,
} from "../../utils/explorer";
import { clearAuthSession } from "../../utils/auth";

const formatDate = (timestamp: number) => {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (timestamp: number) => {
  if (!timestamp) return "Unknown";
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isValidAddress = (value: string | undefined): value is string =>
  !!value && /^0x[a-fA-F0-9]{40}$/.test(value);

export const MechanicProfile = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<AdminHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const normalizedAddress = address ?? "";
  const valid = isValidAddress(normalizedAddress);

  const handleLogout = () => {
    clearAuthSession();
  };

  useEffect(() => {
    if (!valid) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchAdminHistoryFromChain(normalizedAddress)
      .then((data) => {
        if (cancelled) return;
        setEntries(data);
      })
      .catch(() => {
        if (cancelled) return;
        setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedAddress, valid]);

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return {
        total: 0,
        uniqueVins: 0,
        firstTs: 0,
        lastTs: 0,
      };
    }
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    return {
      total: entries.length,
      uniqueVins: new Set(entries.map((entry) => entry.vin)).size,
      firstTs: sorted[0].timestamp,
      lastTs: sorted[sorted.length - 1].timestamp,
    };
  }, [entries]);

  const orderedEntries = useMemo(
    () => [...entries].sort((a, b) => b.timestamp - a.timestamp),
    [entries],
  );

  if (!valid) {
    return (
      <section id="mechanic">
        <header>
          <div className="logo">AutoLedger</div>
          <nav>
            <button
              type="button"
              className="mechanic-back"
              onClick={() => navigate(-1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <Link to="/" onClick={handleLogout}>
              Logout
            </Link>
          </nav>
        </header>
        <main className="mechanic-main">
          <div className="mechanic-empty glass-card">
            <h2>Invalid wallet address</h2>
            <p>
              The address in the URL doesn't look like a valid Ethereum
              wallet. Double-check the link.
            </p>
            <Link to="/" className="btn btn-primary mechanic-empty-cta">
              Back to home
            </Link>
          </div>
        </main>
      </section>
    );
  }

  return (
    <section id="mechanic">
      <header>
        <div className="logo">AutoLedger</div>
        <nav>
          <button
            type="button"
            className="mechanic-back"
            onClick={() => navigate(-1)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <Link to="/" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </header>
      <main className="mechanic-main">
        <section className="mechanic-hero">
          <span className="section-kicker">MECHANIC PROFILE</span>
          <h1 className="mechanic-address">
            <code>{normalizedAddress}</code>
          </h1>
          <div className="mechanic-meta-row">
            <span className="stats-badge">
              <span className="pulse-dot" aria-hidden="true" />
              Verified on-chain
            </span>
            <a
              className="explorer-link"
              href={buildAddressUrl(normalizedAddress)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>View on Etherscan</code>
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
          </div>
        </section>

        <div className="mechanic-stats-card">
          <div className="stats-grid">
            <div className="stat-tile">
              <span className="stat-tile-label">Records signed</span>
              <span className="stat-tile-value stat-cyan">
                {isLoading ? "…" : stats.total}
              </span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-label">Unique vehicles</span>
              <span className="stat-tile-value stat-purple">
                {isLoading ? "…" : stats.uniqueVins}
              </span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-label">First activity</span>
              <span className="stat-tile-value stat-violet">
                {isLoading ? "…" : formatDate(stats.firstTs)}
              </span>
            </div>
            <div className="stat-tile">
              <span className="stat-tile-label">Latest activity</span>
              <span className="stat-tile-value stat-green">
                {isLoading ? "…" : formatDate(stats.lastTs)}
              </span>
            </div>
          </div>
        </div>

        <div className="mechanic-records">
          <div className="mechanic-records-header">
            <h2>Signed records</h2>
            <span className="mechanic-records-count">
              {isLoading
                ? "Loading…"
                : orderedEntries.length === 0
                  ? "No activity"
                  : `${orderedEntries.length} on chain`}
            </span>
          </div>

          {isLoading ? (
            <ul className="mechanic-records-list">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="mechanic-record skeleton-mechanic-record"
                >
                  <span className="skeleton" style={{ width: "40%", height: 18 }} />
                  <span className="skeleton" style={{ width: "30%", height: 14 }} />
                  <span className="skeleton" style={{ width: "55%", height: 14 }} />
                </li>
              ))}
            </ul>
          ) : orderedEntries.length === 0 ? (
            <div className="mechanic-empty-inline">
              <p>This wallet hasn't signed any records yet.</p>
            </div>
          ) : (
            <ul className="mechanic-records-list">
              {orderedEntries.map((entry, index) => (
                <li
                  key={`${entry.txHash}-${index}`}
                  className="mechanic-record"
                >
                  <div className="mechanic-record-head">
                    <Link
                      to={`/ledger?vin=${encodeURIComponent(entry.vin)}`}
                      className="mechanic-record-vin"
                    >
                      <code>{entry.vin}</code>
                    </Link>
                    <span className="mechanic-record-mileage">
                      {entry.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <div className="mechanic-record-foot">
                    <span className="mechanic-record-date">
                      {formatDateTime(entry.timestamp)}
                    </span>
                    <a
                      className="activity-link"
                      href={buildTxUrl(entry.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View transaction on Etherscan"
                    >
                      <code>{shortenHash(entry.txHash, 6, 6)}</code>
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
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </section>
  );
};
