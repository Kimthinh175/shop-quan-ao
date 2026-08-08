"use client";

import { useEffect } from "react";

export interface SizeRow {
  size: string;
  height: string;
  weight: string;
}

export interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: SizeRow[];
}

const defaultData: SizeRow[] = [
  { size: "XS", height: "1m48 - 1m53", weight: "40 - 45 kg" },
  { size: "S", height: "1m50 - 1m58", weight: "45 - 52 kg" },
  { size: "M", height: "1m55 - 1m62", weight: "52 - 58 kg" },
  { size: "L", height: "1m60 - 1m68", weight: "58 - 64 kg" },
  { size: "XL", height: "1m65 - 1m72", weight: "64 - 70 kg" },
];

export default function SizeGuideModal({
  isOpen,
  onClose,
  data = defaultData,
}: SizeGuideModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity duration-300 p-4">
      <div className="bg-white dark:bg-[#171717] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative transition-transform duration-300 transform scale-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-xl"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <i className="fa-solid fa-ruler-combined text-indigo-600 dark:text-[#EBC563]" />{" "}
          Bảng Hướng Dẫn Chọn Size
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
                <th className="p-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Size
                </th>
                <th className="p-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Chiều Cao
                </th>
                <th className="p-4 font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Cân Nặng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {data.map((row) => (
                <tr key={row.size} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-black text-slate-900 dark:text-white">{row.size}</td>
                  <td className="p-4">{row.height}</td>
                  <td className="p-4">{row.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex gap-3 items-start border border-slate-200/80 dark:border-slate-800">
          <i className="fa-solid fa-lightbulb text-amber-500 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            <strong className="text-slate-800 dark:text-slate-200">Gợi ý:</strong> Nếu chiều cao của bạn thuộc size S nhưng cân nặng thuộc size M, hãy ưu tiên chọn size theo cân nặng (size M) để mặc thoải mái nhất nhé.
          </p>
        </div>
      </div>
    </div>
  );
}
