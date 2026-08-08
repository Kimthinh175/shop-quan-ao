import QuantityInput from "../QuantityInput";
import "./CartItem.module.css";

export interface CartItemProps {
    image: string;
    title: string;
    variant: string;
    price: string;
    quantity: number;
    onRemove?: () => void;
    onQuantityChange?: (qty: number) => void;
}






export default function CartItem({ image, title, variant, price, quantity, onRemove, onQuantityChange }: CartItemProps) {
    return (
        <div className="cart-item flex gap-4 py-4 border-b border-slate-100 last:border-b-0">
            <div className="w-20 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={image} className="w-full h-full object-cover" alt={title} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1 line-clamp-1">{title}</p>
                    <p className="text-[11px] text-slate-400 font-medium mb-3">{variant}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <QuantityInput initialValue={quantity} onChange={onQuantityChange} />
                    <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{price}</p>
                    </div>
                </div>
            </div>
            <button 
                type="button"
                onClick={onRemove}
                className="text-slate-300 hover:text-red-400 transition-all text-sm flex-shrink-0 mt-1" 
                title="Xoá sản phẩm"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    );
}
