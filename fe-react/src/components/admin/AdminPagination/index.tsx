export interface AdminPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  itemName?: string;
}

export default function AdminPagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  itemName = "mục"
}: AdminPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#171717] rounded-b-2xl transition-colors duration-300">
      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
        Hiển thị {totalItems === 0 ? 0 : startItem}–{endItem} / {totalItems} {itemName}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 text-xs hover:border-indigo-400 dark:hover:border-[#D4AF37] hover:text-indigo-600 dark:hover:text-[#D4AF37] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
              currentPage === page
                ? "bg-indigo-600 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-sm"
                : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-[#D4AF37] hover:text-indigo-600 dark:hover:text-[#D4AF37]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-400 text-xs hover:border-indigo-400 dark:hover:border-[#D4AF37] hover:text-indigo-600 dark:hover:text-[#D4AF37] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}
