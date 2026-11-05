"use client";

import { motion } from "framer-motion";

interface TrendData {
  date: string;
  count: number;
}

interface VisitorChartProps {
  data: TrendData[];
}

export default function VisitorChart({ data }: VisitorChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="mt-4 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
        No data available yet
      </div>
    );
  }

  // Calculate chart metrics
  const maxCount = Math.max(...data.map((d) => d.count), 1); // Avoid division by zero
  const minCount = 0;
  const range = maxCount - minCount;

  // Chart dimensions (SVG)
  const height = 100;
  const width = 300; // ViewBox width
  const paddingX = 10;

  // Generate points for the sparkline
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * (width - 2 * paddingX);
    const y = height - ((d.count - minCount) / range) * (height - 20) - 10; // 10px padding top/bottom
    return { x, y, count: d.count, date: d.date };
  });

  // Create SVG path string
  const pathD =
    `M ${points[0].x} ${points[0].y} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ");

  // Create Area path (for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Calculate percentage change
  const currentCount = points[points.length - 1]?.count || 0;
  const previousCount = points[points.length - 2]?.count || 0;
  const percentChange =
    previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : 0;

  const isPositive = percentChange >= 0;

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-end justify-between">
        <span className="text-xs font-medium text-slate-400">Last 7 Days</span>
        <div
          className={`flex items-center gap-1 text-xs font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(percentChange)}%
        </div>
      </div>

      <div className="relative h-24 w-full overflow-hidden rounded-xl border border-white/5 bg-slate-950/30">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="preserve-3d h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            d={areaD}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#10b981"
              stroke="#020617"
              strokeWidth="2"
              className="hover:r-6 cursor-pointer transition-transform"
            >
              <title>{`${p.date}: ${p.count} visitors`}</title>
            </motion.circle>
          ))}
        </svg>
      </div>
    </div>
  );
}
