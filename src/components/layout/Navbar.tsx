"use client";

import Link from "next/link";
import { KinusLogo } from "@/components/common/KinusLogo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#07142A]/90 backdrop-blur-md border-b border-[#E8D8A8]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Official Logo & Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <KinusLogo size={44} color="#E8D8A8" className="group-hover:scale-105 transition-transform" />
            <div className="text-right">
              <span className="text-base sm:text-lg font-bold text-white tracking-wide block leading-tight">
                כינוס השלוחים העולמי
              </span>
              <span className="text-[11px] sm:text-xs text-[#E8D8A8] font-medium tracking-wider uppercase block">
                מחלקת אירוח ולינה • תשפ״ז
              </span>
            </div>
          </Link>

          {/* Navigation Links - Purely public, ZERO admin traces */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-[#E8D8A8] transition-colors hidden sm:block"
            >
              מידע כללי
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2 text-xs sm:text-sm font-medium rounded-full border border-[#E8D8A8] text-[#E8D8A8] hover:bg-[#E8D8A8] hover:text-[#07142A] transition-all tracking-wide"
            >
              הרשמה ללינה
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
