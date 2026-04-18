import type { AdminHistoryEntry } from "./adminHistory";
import { buildTxUrl, shortenHash } from "../../utils/explorer";

interface RecentActivityProps {
  history: AdminHistoryEntry[];
}

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const RecentActivity = ({ history }: RecentActivityProps) => {
  return (
    <aside className="recent-activity">
      <div className="recent-activity-header">
        <h3>Recent activity</h3>
        <span className="recent-activity-count">
          {history.length === 0 ? "No submissions yet" : `Last ${history.length}`}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="recent-activity-empty">
          <div className="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v6l4 2" />
            </svg>
          </div>
          <p>
            Your submitted records will appear here with a direct link to
            Volta Explorer.
          </p>
        </div>
      ) : (
        <ul className="recent-activity-list">
          {history.slice(0, 6).map((entry) => (
            <li key={`${entry.txHash}-${entry.timestamp}`}>
              <div className="activity-row">
                <div className="activity-main">
                  <code className="activity-vin">{entry.vin}</code>
                  <span className="activity-mileage">
                    {entry.mileage.toLocaleString()} km
                  </span>
                </div>
                <div className="activity-meta">
                  <span
                    className={
                      entry.status === "confirmed"
                        ? "activity-status is-confirmed"
                        : "activity-status is-pending"
                    }
                  >
                    {entry.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                  <span className="activity-time">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                <a
                  className="activity-link"
                  href={buildTxUrl(entry.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View transaction on Volta Explorer"
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
    </aside>
  );
};
