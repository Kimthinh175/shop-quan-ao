import Link from "next/link";
import "./Pagination.module.css";

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseHref: string;
    className?: string;
}






export default function Pagination({ currentPage, totalPages, baseHref, className = "mt-24" }: PaginationProps) {
    // Generate array of page numbers
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    return (
        <div className={`flex justify-center items-center gap-4 ${className}`}>
            {hasPrev ? (
                <Link href={`${baseHref}?page=${currentPage - 1}`} className="w-10 h-10 border border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:border-black hover:text-black transition-all">
                    <i className="fa-solid fa-angle-left"></i>
                </Link>
            ) : (
                <button disabled className="w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center text-slate-200 cursor-not-allowed">
                    <i className="fa-solid fa-angle-left"></i>
                </button>
            )}

            <div className="flex items-center gap-6 text-[10px] font-black tracking-widest">
                {pages.map((page) => {
                    const isActive = page === currentPage;
                    const displayPage = page < 10 ? `0${page}` : `${page}`;
                    
                    return isActive ? (
                        <span key={page} className="text-black border-b border-black pb-1">
                            {displayPage}
                        </span>
                    ) : (
                        <Link key={page} href={`${baseHref}?page=${page}`} className="text-slate-400 hover:text-black transition-all">
                            {displayPage}
                        </Link>
                    );
                })}
            </div>

            {hasNext ? (
                <Link href={`${baseHref}?page=${currentPage + 1}`} className="w-10 h-10 border border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:border-black hover:text-black transition-all">
                    <i className="fa-solid fa-angle-right"></i>
                </Link>
            ) : (
                <button disabled className="w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center text-slate-200 cursor-not-allowed">
                    <i className="fa-solid fa-angle-right"></i>
                </button>
            )}
        </div>
    );
}
