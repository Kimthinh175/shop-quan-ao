"use client";

export interface TrustPoliciesProps {
  className?: string;
}

export default function TrustPolicies({ className = "" }: TrustPoliciesProps) {
  return (
    <div className={`bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm transition-colors ${className}`}>
      <div className="flex gap-3.5 items-start">
        <span className="text-indigo-600 dark:text-[#EBC563] mt-0.5 text-sm">
          <i className="fa-solid fa-rotate" />
        </span>
        <div>
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 mb-0.5">
            Chính sách đổi trả 60 ngày
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            Miễn phí đổi trả trong 60 ngày với bất kỳ lý do gì, bưu tá đến lấy hàng tận nhà.
          </p>
        </div>
      </div>
      <div className="flex gap-3.5 items-start">
        <span className="text-indigo-600 dark:text-[#EBC563] mt-0.5 text-sm">
          <i className="fa-solid fa-truck-fast" />
        </span>
        <div>
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 mb-0.5">
            Giao hàng miễn phí từ 200k
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            Miễn phí vận chuyển toàn quốc cho đơn hàng từ 200.000đ trở lên. Giao nhanh 2 - 3 ngày.
          </p>
        </div>
      </div>
      <div className="flex gap-3.5 items-start">
        <span className="text-indigo-600 dark:text-[#EBC563] mt-0.5 text-sm">
          <i className="fa-solid fa-recycle" />
        </span>
        <div>
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 mb-0.5">
            Cam kết 100% hài lòng
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            Được kiểm tra hàng trước khi thanh toán. Hỗ trợ tư vấn giải đáp thắc mắc 24/7.
          </p>
        </div>
      </div>
    </div>
  );
}
