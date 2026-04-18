import type { MileageRecordDto } from "../../api/dto";

interface VehicleStatsCardProps {
  vin: string;
  records: MileageRecordDto[];
}

const formatNumber = (value: number) => value.toLocaleString("en-US");

const formatDays = (ms: number) => {
  const days = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  if (days < 1) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} mo`;
  }
  const years = (days / 365).toFixed(1);
  return `${years} y`;
};

export const VehicleStatsCard = ({ vin, records }: VehicleStatsCardProps) => {
  if (records.length === 0) return null;

  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];

  const currentKm = latest.mileage;
  const totalDistance = latest.mileage - earliest.mileage;
  const daysTracked = (latest.timestamp - earliest.timestamp) * 1000;
  const recordCount = records.length;

  return (
    <div className="vehicle-stats-card">
      <div className="stats-header">
        <div className="stats-vin">
          <span className="stats-vin-label">VIN</span>
          <code>{vin}</code>
        </div>
        <div className="stats-badge">
          <span className="pulse-dot" aria-hidden="true" />
          On-chain verified
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-tile">
          <span className="stat-tile-label">Current mileage</span>
          <span className="stat-tile-value stat-cyan">
            {formatNumber(currentKm)}
            <span className="stat-unit">km</span>
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Tracked distance</span>
          <span className="stat-tile-value stat-purple">
            {totalDistance > 0 ? "+" : ""}
            {formatNumber(totalDistance)}
            <span className="stat-unit">km</span>
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Days tracked</span>
          <span className="stat-tile-value stat-violet">
            {formatDays(daysTracked)}
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile-label">Verified records</span>
          <span className="stat-tile-value stat-green">{recordCount}</span>
        </div>
      </div>
    </div>
  );
};
