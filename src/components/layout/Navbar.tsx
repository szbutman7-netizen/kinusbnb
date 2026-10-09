"use client";

import Link from "next/link";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/lib/context/LanguageContext";

export function Navbar() {
  const { t, isRtl } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-3">
          {/* Official Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2545] rounded-xl p-1"
            aria-label={t("title")}
          >
            <div className="w-11 h-11 rounded-xl bg-[#0B2545] p-1 flex items-center justify-center shadow-xs border border-[#0B2545]/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <KinusLogo size={36} color="#E8D8A8" />
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                {t("title")}
              </span>
              <span className="text-[11px] sm:text-xs text-[#8C6D2D] font-bold tracking-wider block">
                {t("deptSubtitle")}
              </span>
            </div>
          </Link>

          {/* Navigation Links and Tools */}
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-2 sm:gap-4"
          >
            <WhatsAppButton
              className="hidden lg:inline-flex"
            />

            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0B2545] transition-colors hidden md:block px-2 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2545]"
            >
              {t("navInfo")}
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#0B2545] text-white hover:bg-[#123661] border border-[#0B2545] transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2545] focus-visible:ring-offset-2"
            >
              {t("navRegister")}
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}

