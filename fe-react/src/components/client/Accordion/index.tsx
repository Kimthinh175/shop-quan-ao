"use client";

import { useState, ReactNode } from "react";

export interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4 transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-2 text-left text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-[#EBC563] transition-colors focus:outline-none"
      >
        <span>{title}</span>
        <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'} text-[10px] text-slate-400 dark:text-slate-500 transition-transform duration-300`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 ${
          isOpen ? "max-h-[500px] mt-3 opacity-100" : "max-h-0 mt-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
