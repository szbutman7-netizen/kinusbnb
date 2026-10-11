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
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-full bg-[#0B1A30]/90 border border-[#E8D8A8]/30 shadow-sm flex-shrink-0 ${className}`}
    >
      <div className="px-1 text-[#E8D8A8] hidden sm:flex items-center justify-center" aria-hidden="true">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <button
        type="button"
        role="radio"
        aria-checked={language === "he"}
        onClick={() => setLanguage("he")}
        className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] ${
          language === "he"
            ? "bg-[#E8D8A8] text-[#0B1A30] font-bold shadow-sm"
            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
        }`}
      >
        <span className="sm:hidden">עב</span>
        <span className="hidden sm:inline">עברית</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={language === "en"}
        onClick={() => setLanguage("en")}
        className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] ${
          language === "en"
            ? "bg-[#E8D8A8] text-[#0B1A30] font-bold shadow-sm"
            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
        }`}
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>
    </div>
  );
}
