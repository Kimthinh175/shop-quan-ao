export interface AdminTableProps {
  children: React.ReactNode;
}

export default function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="bg-white dark:bg-[#171717] rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}
