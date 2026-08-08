
export interface AdminActionButtonsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    extraActions?: React.ReactNode;
}


export default function AdminActionButtons({ onEdit, onDelete, onView, extraActions }: AdminActionButtonsProps) {
    return (
        <div className="flex items-center gap-1.5">
            {onView && (
                <button 
                    onClick={onView}
                    className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all" 
                    title="Xem chi tiết"
                >
                    <i className="fa-solid fa-eye text-[11px]"></i>
                </button>
            )}
            
            {onEdit && (
                <button 
                    onClick={onEdit}
                    className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-all" 
                    title="Sửa"
                >
                    <i className="fa-solid fa-pen text-[11px]"></i>
                </button>
            )}
            
            {extraActions}

            {onDelete && (
                <button 
                    onClick={onDelete}
                    className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all" 
                    title="Xoá"
                >
                    <i className="fa-solid fa-trash text-[11px]"></i>
                </button>
            )}
        </div>
    );
}
