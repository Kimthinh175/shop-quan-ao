"use client";

import { useState } from "react";

export interface RevenueChartPoint {
  _id: string;
  revenue: number;
  orders: number;
}

export interface RevenueChartProps {
  data?: RevenueChartPoint[];
}

export default function RevenueChart({ data = [] }: RevenueChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points =
    data.length > 0
      ? data
      : [
          { _id: "16/07", revenue: 15000000, orders: 12 },
          { _id: "17/07", revenue: 28000000, orders: 19 },
          { _id: "18/07", revenue: 22000000, orders: 15 },
          { _id: "19/07", revenue: 45000000, orders: 32 },
          { _id: "20/07", revenue: 38000000, orders: 26 },
          { _id: "21/07", revenue: 42000000, orders: 28 },
          { _id: "22/07", revenue: 49800000, orders: 35 },
        ];

  const maxRevenue = Math.max(...points.map((p) => p.revenue), 1000000);
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Calculate coordinates
  const coords = points.map((p, idx) => {
    const x = paddingX + (idx / Math.max(points.length - 1, 1)) * usableWidth;
    const y = chartHeight - paddingY - (p.revenue / maxRevenue) * usableHeight;
    return { x, y, point: p };
  });

  // Build SVG Path string
  const pathD = coords.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = coords[idx - 1];
    const cx1 = prev.x + (curr.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (curr.x - prev.x) / 2;
    const cy2 = curr.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }, "");

  // Build Area fill Path string
  const firstX = coords[0]?.x || paddingX;
  const lastX = coords[coords.length - 1]?.x || chartWidth - paddingX;
  const bottomY = chartHeight - paddingY;
  const areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

  return (
    <div className="w-full relative flex flex-col justify-between">
      {/* SVG Canvas Chart */}
      <div className="relative w-full h-[240px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - paddingY - ratio * usableHeight;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Smooth Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#d4af37"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Interactive Data Dots & Hover Tooltips */}
          {coords.map((c, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx}>
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={c.x}
                    y1={paddingY}
                    x2={c.x}
                    y2={bottomY}
                    stroke="#ebc563"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? "7" : "4.5"}
                  fill={isHovered ? "#d4af37" : "#ffffff"}
                  stroke="#d4af37"
                  strokeWidth={isHovered ? "3" : "2.5"}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIdx !== null && coords[hoveredIdx] && (
          <div
            className="absolute bg-slate-900 dark:bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full z-20 transition-all duration-150"
            style={{
              left: `${(coords[hoveredIdx].x / chartWidth) * 100}%`,
              top: `${(coords[hoveredIdx].y / chartHeight) * 100 - 10}px`,
            }}
          >
            <p className="font-extrabold text-[10px] text-amber-400 uppercase tracking-wider">
              {coords[hoveredIdx].point._id}
            </p>
            <p className="font-black text-sm text-emerald-400">
              {coords[hoveredIdx].point.revenue.toLocaleString("vi-VN")}đ
            </p>
            <p className="text-[10px] text-slate-300">
              {coords[hoveredIdx].point.orders} đơn hàng
            </p>
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between px-4 pt-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-200/80 dark:border-slate-800">
        {points.map((p, idx) => (
          <span
            key={idx}
            className={hoveredIdx === idx ? "text-amber-500 font-black" : ""}
          >
            {p._id}
          </span>
        ))}
      </div>
    </div>
  );
}
