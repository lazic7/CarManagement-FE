import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MileageRecordDto } from "../../api/dto";

interface MileageChartProps {
  records: MileageRecordDto[];
}

const formatKm = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value);

const formatDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { timestamp: number; mileage: number } }>;
}

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">
        {new Date(point.timestamp * 1000).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="chart-tooltip-value">
        {point.mileage.toLocaleString()} <span>km</span>
      </div>
    </div>
  );
};

export const MileageChart = ({ records }: MileageChartProps) => {
  if (records.length < 2) return null;

  const data = [...records]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((record) => ({
      timestamp: record.timestamp,
      mileage: record.mileage,
    }));

  return (
    <div className="mileage-chart-card">
      <div className="chart-header">
        <h3>Mileage over time</h3>
        <span className="chart-subtitle">
          Immutable history, read directly from the blockchain
        </span>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.06)"
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatKm}
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(0, 212, 255, 0.35)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Line
              type="monotone"
              dataKey="mileage"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={{
                fill: "#00d4ff",
                stroke: "#0a0a0f",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "#00d4ff",
                stroke: "#8b5cf6",
                strokeWidth: 2,
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
