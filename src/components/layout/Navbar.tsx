"use client";

import Link from "next/link";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/lib/context/LanguageContext";

export function Navbar() {
  const { t, isRtl } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#0B1A30]/85 backdrop-blur-xl border-b border-[#E8D8A8]/20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] transition-all">
      {/* Delicate golden gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8D8A8]/35 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-2 sm:gap-3">
          {/* Official Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] rounded-xl p-0.5"
            aria-label={t("title")}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#E8D8A8]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <KinusLogo size={36} color="#E8D8A8" className="relative sm:w-[44px] sm:h-[44px] group-hover:scale-105 transition-transform duration-300 flex-shrink-0" />
            </div>
            <div className={`min-w-0 flex-1 ${isRtl ? "text-right" : "text-left"}`}>
              <span className="text-sm sm:text-xl font-black font-heading text-white tracking-wide block leading-tight truncate group-hover:text-[#E8D8A8] transition-colors duration-200">
                {t("title")}
              </span>
              <span className="text-[10px] sm:text-xs text-[#E8D8A8] font-medium tracking-wider uppercase block truncate">
                {t("deptSubtitle")}
              </span>
            </div>
          </Link>

          {/* Navigation Links and Tools */}
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0"
          >
            <WhatsAppButton
              className="hidden lg:inline-flex"
            />

            <Link
              href="/"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border border-[#E8D8A8]/25 text-slate-200 hover:border-[#E8D8A8] hover:text-[#E8D8A8] hover:bg-[#15305B]/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
            >
              {t("navInfo")}
            </Link>

            <Link
              href="/register"
              className="shimmer-button inline-flex items-center justify-center px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full bg-[#E8D8A8] text-[#0B1A30] hover:bg-white hover:shadow-[0_0_20px_rgba(232,216,168,0.4)] active:scale-95 transition-all duration-200 tracking-wide whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
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
