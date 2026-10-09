"use client";

import { Navbar } from "@/components/layout/Navbar";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { useLanguage } from "@/lib/context/LanguageContext";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const { t, isRtl } = useLanguage();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#040D1E] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#040D1E]">
      {/* Atmosphere Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: "url('/assets/hero-banquet.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#040D1E] via-[#040D1E]/95 to-[#020813] pointer-events-none" />

      <Navbar />

      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full" id="main-content">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#E8D8A8] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] rounded-md px-1 py-0.5"
          >
            <BackIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("backToInfo")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#E8D8A8]/80 font-serif">{t("traditionalBh")}</span>
          </div>
        </div>

        <RegistrationForm />
      </main>

      {/* Floating WhatsApp Quick Action */}
      <WhatsAppButton variant="floating" />

      <footer className="border-t border-slate-800 bg-[#020813] py-6 text-center text-xs text-slate-400">
        {t("title")} • {t("deptSubtitle")}
      </footer>
    </div>
  );
}

