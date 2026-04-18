export const Skeleton = ({
  width,
  height,
  radius = 8,
  className,
}: {
  width?: string | number;
  height?: string | number;
  radius?: number;
  className?: string;
}) => (
  <span
    className={`skeleton ${className ?? ""}`}
    style={{
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius: `${radius}px`,
    }}
    aria-hidden="true"
  />
);

export const StatsCardSkeleton = () => (
  <div className="vehicle-stats-card skeleton-card">
    <div className="stats-header">
      <div className="stats-vin">
        <Skeleton width={32} height={12} radius={4} />
        <Skeleton width={180} height={28} radius={6} />
      </div>
      <Skeleton width={130} height={28} radius={999} />
    </div>
    <div className="stats-grid">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="stat-tile">
          <Skeleton width="60%" height={10} radius={4} />
          <Skeleton width="75%" height={28} radius={6} />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="mileage-chart-card skeleton-card">
    <div className="chart-header">
      <Skeleton width={160} height={18} radius={5} />
      <Skeleton width={240} height={12} radius={4} />
    </div>
    <div className="chart-wrapper skeleton-chart-wrapper">
      <div className="skeleton-chart-grid" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="skeleton-chart-gridline" />
        ))}
      </div>
      <svg
        className="skeleton-chart-line"
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M 0 110 Q 60 90 120 80 T 240 50 T 360 30 L 400 20"
          fill="none"
          stroke="url(#skGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="skGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

export const TimelineSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <ul className="timeline skeleton-timeline">
    {Array.from({ length: rows }).map((_, index) => (
      <li
        key={index}
        className="timeline-item skeleton-timeline-item"
        style={{ animationDelay: `${index * 120}ms` }}
      >
        <Skeleton width="35%" height={10} radius={4} />
        <Skeleton width="55%" height={22} radius={5} />
        <Skeleton width="80%" height={14} radius={4} />
      </li>
    ))}
  </ul>
);
