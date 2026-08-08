
export interface OrderSummaryProps {
    itemCount?: number;
    subtotal: string;
    shippingFee?: string;
    discount?: string;
    total: string;
    onCheckout?: () => void;
    buttonText?: string;
}

export default function OrderSummary({
    itemCount,
    subtotal,
    shippingFee = 'Miễn phí',
    discount,
    total,
    onCheckout,
    buttonText = 'Đặt hàng ngay'
}: OrderSummaryProps) {
    return (
        <div className="card">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Tóm tắt đơn hàng</h3>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Tạm tính {itemCount ? `(${itemCount} sản phẩm)` : ''}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Phí vận chuyển</span>
                    <span className={`text-sm font-bold ${shippingFee === 'Miễn phí' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>{shippingFee}</span>
                </div>
                {discount && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Giảm giá</span>
                        <span className="text-sm font-bold text-red-500">{discount}</span>
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Tổng cộng</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-[#EBC563]">{total}</span>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                Thuế đã bao gồm. Phí vận chuyển (nếu có) sẽ được tính chính xác dựa trên địa chỉ giao hàng.
            </p>

            <button
                type="button"
                onClick={onCheckout}
                className="mt-5 w-full flex justify-center items-center py-4 bg-slate-900 dark:bg-[#D4AF37] text-white dark:text-slate-950 rounded-xl font-bold text-sm hover:bg-indigo-600 dark:hover:bg-[#EBC563] hover:shadow-lg transition-all duration-300"
            >
                <i className="fa-solid fa-lock text-xs mr-2"></i>
                {buttonText}
            </button>

            {/* Security badges */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-4">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    <i className="fa-solid fa-shield-halved text-green-500"></i>
                    Bảo mật SSL
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    <i className="fa-solid fa-rotate-left text-blue-500"></i>
                    Đổi trả 30 ngày
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    <i className="fa-solid fa-truck text-orange-500"></i>
                    Ship toàn quốc
                </div>
            </div>
        </div>
    );
}
