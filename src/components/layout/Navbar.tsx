"use client";

import Link from "next/link";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLanguage } from "@/lib/context/LanguageContext";

export function Navbar() {
  const { t, isRtl } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#102444]/95 backdrop-blur-md border-b border-[#E8D8A8]/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-3">
          {/* Official Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102444] rounded-xl p-1"
            aria-label={t("title")}
          >
            <KinusLogo size={44} color="#E8D8A8" className="group-hover:scale-105 transition-transform flex-shrink-0" />
            <div className={isRtl ? "text-right" : "text-left"}>
              <span className="text-lg sm:text-xl font-black font-heading text-white tracking-wide block leading-tight">
                {t("title")}
              </span>
              <span className="text-[11px] sm:text-xs text-[#E8D8A8] font-medium tracking-wider uppercase block">
                {t("deptSubtitle")}
              </span>
            </div>
          </Link>

          {/* Navigation Links and Tools */}
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-2 sm:gap-3"
          >
            <WhatsAppButton
              className="hidden lg:inline-flex"
            />

            <Link
              href="/"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-full border border-[#E8D8A8]/30 text-slate-200 hover:border-[#E8D8A8] hover:text-[#E8D8A8] hover:bg-[#15305B]/60 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
            >
              {t("navInfo")}
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-full bg-[#E8D8A8] text-[#0B1A30] hover:bg-white hover:shadow-lg active:scale-95 transition-all tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102444]"
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
