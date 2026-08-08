"use client";

export interface CategoryDataPoint {
  name: string;
  count: number;
  color: string;
}

export interface CategoryChartProps {
  categories?: CategoryDataPoint[];
}

export default function CategoryChart({
  categories = [
    { name: "Áo thun", count: 120, color: "#d4af37" },
    { name: "Áo khoác", count: 100, color: "#0ea5e9" },
    { name: "Quần dài", count: 90, color: "#14b8a6" },
    { name: "Giày dép", count: 60, color: "#f59e0b" },
    { name: "Phụ kiện", count: 44, color: "#ec4899" },
  ],
}: CategoryChartProps) {
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  // SVG Donut Chart Calculation
  let cumulativeAngle = 0;
  const radius = 70;
  const strokeWidth = 24;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center w-full">
      {/* SVG Donut Chart with Center Text */}
      <div className="relative w-48 h-48 flex items-center justify-center my-2">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {categories.map((cat, idx) => {
            const strokeDasharray = `${(cat.count / totalCount) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle * circumference;
            cumulativeAngle += cat.count / totalCount;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {totalCount}
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Sản phẩm đã bán
          </span>
        </div>
      </div>

      {/* Category Legend Grid */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-4 w-full mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold line-clamp-1">
                {cat.name}
              </span>
            </div>
            <p className="text-xs font-black text-slate-900 dark:text-white pl-4">
              {cat.count} Đơn
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
