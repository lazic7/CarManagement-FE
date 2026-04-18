import type { AdminHistoryEntry } from "./adminHistory";

interface AdminStatsCardProps {
  history: AdminHistoryEntry[];
}

const formatRelative = (timestamp: number) => {
  if (!timestamp) return "—";
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-GB");
};

export const AdminStatsCard = ({ history }: AdminStatsCardProps) => {
  const totalTxs = history.length;
  const uniqueVins = new Set(history.map((entry) => entry.vin)).size;
  const latest = history[0];
  const confirmedCount = history.filter(
    (entry) => entry.status === "confirmed",
  ).length;
  const successRate = totalTxs === 0 ? 0 : Math.round((confirmedCount / totalTxs) * 100);

  return (
    <div className="admin-stats-card">
      <div className="admin-stats-grid">
        <div className="stat-tile">
          <span className="stat-tile-label">Records submitted</span>
          <span className="stat-tile-value stat-cyan">{totalTxs}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Unique vehicles</span>
          <span className="stat-tile-value stat-purple">{uniqueVins}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Last submission</span>
          <span className="stat-tile-value stat-violet">
            {latest ? formatRelative(latest.timestamp) : "—"}
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Success rate</span>
          <span className="stat-tile-value stat-green">
            {totalTxs === 0 ? "—" : `${successRate}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
