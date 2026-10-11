"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

interface KinusDatePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  allowedDates: string[];
  placeholder?: string;
  label: string;
  hint?: string;
}

export function KinusDatePicker({
  id,
  name,
  value,
  onChange,
  allowedDates,
  placeholder,
  label,
  hint,
}: KinusDatePickerProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) return dateStr;

    if (language === "he") {
      const weekday = date.toLocaleDateString("he-IL", { weekday: "long" });
      const dayNum = parseInt(day);
      const monthName = date.toLocaleDateString("he-IL", { month: "long" });
      return `${weekday}, ${dayNum} ב${monthName} ${year}`;
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
  };

  const currentDisplayText = value ? formatDateDisplay(value) : (placeholder || (language === "he" ? "אנא בחר תאריך" : "Please select date"));

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-200 mb-1">
        {label}
      </label>

      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${label}: ${value ? formatDateDisplay(value) : placeholder}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white hover:border-[#E8D8A8]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs transition-all text-start"
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-[#E8D8A8] flex-shrink-0" aria-hidden="true" />
          <span className={value ? "text-white font-medium truncate" : "text-slate-400 font-normal truncate"}>
            {currentDisplayText}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#E8D8A8] transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {hint && (
        <span className="text-[10px] text-[#E8D8A8] block mt-1 font-medium">
          {hint}
        </span>
      )}

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1.5 w-full bg-[#07142A] border border-[#E8D8A8]/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-2 space-y-1 backdrop-blur-md focus:outline-none"
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold text-[#E8D8A8] border-b border-slate-800 flex items-center justify-between">
            <span>{language === "he" ? "תאריכים מורשים לבחירה:" : "Authorized Dates:"}</span>
            <span className="text-[10px] text-slate-400">חשוון תשפ״ז</span>
          </div>

          <div className="pt-1 space-y-1 max-h-56 overflow-y-auto">
            {allowedDates.map((dateStr) => {
              const isSelected = value === dateStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(dateStr);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all text-start ${
                    isSelected
                      ? "bg-[#E8D8A8] text-[#07142A] font-bold shadow-sm"
                      : "text-slate-200 hover:bg-[#0B1E38] hover:text-[#E8D8A8]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{formatDateDisplay(dateStr)}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
