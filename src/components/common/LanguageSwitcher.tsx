"use client";

import React from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={t("langSwitchAria")}
      className={`inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 shadow-xs ${className}`}
    >
      <div className="px-1.5 text-slate-500 flex items-center justify-center" aria-hidden="true">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <button
        type="button"
        role="radio"
        aria-checked={language === "he"}
        onClick={() => setLanguage("he")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2545] ${
          language === "he"
            ? "bg-white text-[#0B2545] font-bold shadow-xs border border-slate-200"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        עברית
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={language === "en"}
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2545] ${
          language === "en"
            ? "bg-white text-[#0B2545] font-bold shadow-xs border border-slate-200"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        English
      </button>
    </div>
  );
}
