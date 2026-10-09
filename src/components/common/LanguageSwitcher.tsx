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
      className={`inline-flex items-center p-1 rounded-full bg-[#0B1A30]/90 border border-[#E8D8A8]/30 shadow-sm ${className}`}
    >
      <div className="px-1.5 text-[#E8D8A8] flex items-center justify-center" aria-hidden="true">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <button
        type="button"
        role="radio"
        aria-checked={language === "he"}
        onClick={() => setLanguage("he")}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102444] ${
          language === "he"
            ? "bg-[#E8D8A8] text-[#0B1A30] font-bold shadow-sm"
            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
        }`}
      >
        עברית
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={language === "en"}
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102444] ${
          language === "en"
            ? "bg-[#E8D8A8] text-[#0B1A30] font-bold shadow-sm"
            : "text-slate-200 hover:text-white hover:bg-slate-800/60"
        }`}
      >
        English
      </button>
    </div>
  );
}
