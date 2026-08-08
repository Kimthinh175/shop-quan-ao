"use client";

export interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  colorClass: string;
}

export default function AdminStatsCard({
  title,
  value,
  icon,
  colorClass,
}: AdminStatsCardProps) {
  const bgColors: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
    indigo: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50",
    amber: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50",
    sky: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50",
    rose: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50",
    slate: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  };

  const iconBgClass = bgColors[colorClass] || bgColors.slate;

  return (
    <div className="bg-white dark:bg-[#171717] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
      <div className={`w-12 h-12 ${iconBgClass} rounded-2xl flex items-center justify-center mb-4 text-xl shadow-sm`}>
        <i className={icon} />
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {value}
      </h3>
    </div>
  );
}
