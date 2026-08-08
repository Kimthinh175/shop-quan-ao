'use client';

import { useState, useEffect } from 'react';

export interface PaymentMethodsProps {
    onChange?: (method: string) => void;
    defaultMethod?: string;
}

export default function PaymentMethods({ onChange, defaultMethod = 'cod' }: PaymentMethodsProps) {
    const [selectedMethod, setSelectedMethod] = useState(defaultMethod);

    useEffect(() => {
        const mapped = selectedMethod === 'cod' ? 'COD' : 'TRANSFER';
        onChange?.(mapped);
    }, [selectedMethod]);

    return (
        <div className="card">
            <span className="section-label">Hình thức thanh toán</span>
            <div className="space-y-3" id="payment-list">

                <div
                    className={`pay-opt ${selectedMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('cod')}
                >
                    <div className="radio-ring"><div className="radio-dot"></div></div>
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-money-bill-wave text-slate-600 dark:text-slate-300"></i>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Thanh toán khi nhận hàng (COD)</p>
                        <p className="text-xs text-slate-400 mt-0.5">Trả tiền mặt khi nhận hàng</p>
                    </div>
                </div>

                <div
                    className={`pay-opt ${selectedMethod === 'banking' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('banking')}
                >
                    <div className="radio-ring"><div className="radio-dot"></div></div>
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/60 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-building-columns text-blue-600 dark:text-blue-400 text-sm"></i>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Chuyển khoản ngân hàng</p>
                        <p className="text-xs text-slate-400 mt-0.5">QR Code hoặc chuyển khoản thủ công</p>
                    </div>
                </div>

                {selectedMethod === 'banking' && (
                    <div id="banking-detail" className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 text-sm">
                        <p className="font-black text-slate-900 dark:text-white mb-2 text-xs uppercase tracking-widest">Thông tin chuyển khoản</p>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                            <p>Ngân hàng: <strong className="text-slate-900 dark:text-white">Vietcombank</strong></p>
                            <p>Số TK: <strong className="text-slate-900 dark:text-white">1234 5678 9012</strong></p>
                            <p>Chủ TK: <strong className="text-slate-900 dark:text-white">CLOSET FASHION STORE</strong></p>
                            <p>Nội dung: <strong className="text-indigo-600 dark:text-[#EBC563]">CLO + [Số điện thoại]</strong></p>
                        </div>
                    </div>
                )}

                <div
                    className={`pay-opt ${selectedMethod === 'momo' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('momo')}
                >
                    <div className="radio-ring"><div className="radio-dot"></div></div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#b0006d' }}>
                        <span className="text-white text-xs font-black">M</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Ví MoMo</p>
                        <p className="text-xs text-slate-400 mt-0.5">Thanh toán nhanh qua ví điện tử</p>
                    </div>
                </div>

                <div
                    className={`pay-opt ${selectedMethod === 'vnpay' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('vnpay')}
                >
                    <div className="radio-ring"><div className="radio-dot"></div></div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600">
                        <span className="text-white text-[9px] font-black">VNPay</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">VNPay</p>
                        <p className="text-xs text-slate-400 mt-0.5">ATM, Internet Banking, QR Code</p>
                    </div>
                </div>

                <div
                    className={`pay-opt ${selectedMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('card')}
                >
                    <div className="radio-ring"><div className="radio-dot"></div></div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-credit-card text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Thẻ tín dụng / Ghi nợ</p>
                        <div className="flex items-center gap-2 mt-1">
                            <i className="fa-brands fa-cc-visa text-blue-700 dark:text-blue-400 text-base"></i>
                            <i className="fa-brands fa-cc-mastercard text-red-600 text-base"></i>
                            <i className="fa-brands fa-cc-apple-pay text-slate-800 dark:text-slate-300 text-base"></i>
                        </div>
                    </div>
                </div>

            </div>

            {selectedMethod === 'card' && (
                <div id="card-fields" className="mt-4 space-y-3">
                    <input type="text" className="input-field" placeholder="Số thẻ" maxLength={19} />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" className="input-field" placeholder="MM / YY" maxLength={7} />
                        <input type="text" className="input-field" placeholder="CVV" maxLength={4} />
                    </div>
                    <input type="text" className="input-field" placeholder="Tên chủ thẻ" />
                </div>
            )}
        </div>
    );
}
