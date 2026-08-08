"use client";

import { useState } from "react";
import "./QuantityInput.module.css";

export interface QuantityInputProps {
    initialValue?: number;
    onChange?: (value: number) => void;
    min?: number;
    max?: number;
}






export default function QuantityInput({
    initialValue = 1,
    onChange,
    min = 1,
    max = 99,
}: QuantityInputProps) {
    const [value, setValue] = useState(initialValue);

    const handleDecrease = () => {
        if (value > min) {
            const newValue = value - 1;
            setValue(newValue);
            onChange?.(newValue);
        }
    };

    const handleIncrease = () => {
        if (value < max) {
            const newValue = value + 1;
            setValue(newValue);
            onChange?.(newValue);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleDecrease}
                disabled={value <= min}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-black hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <i className="fa-solid fa-minus text-[9px]"></i>
            </button>
            <span className="text-sm font-black w-5 text-center qty-value">{value}</span>
            <button
                type="button"
                onClick={handleIncrease}
                disabled={value >= max}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-black hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <i className="fa-solid fa-plus text-[9px]"></i>
            </button>
        </div>
    );
}
