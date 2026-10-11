"use client";

import { Navbar } from "@/components/layout/Navbar";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const { t, isRtl } = useLanguage();
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    setFormKey(Date.now());
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0B1A30] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#0B1A30]">
      {/* Atmosphere Background Image - Clearly visible */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-30 pointer-events-none transition-opacity duration-300"
        style={{ backgroundImage: "url('/assets/hero-banquet.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0B1A30]/85 via-[#0B1A30]/80 to-[#071224]/90 pointer-events-none" />

      {/* Decorative ambient golden aura */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-[#E8D8A8]/6 rounded-full blur-3xl pointer-events-none animate-ambient-pulse" />

      <Navbar />

      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-16 w-full animate-fade-in-up" id="main-content">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#E8D8A8] hover:text-white bg-[#102444]/60 hover:bg-[#15305B] border border-[#E8D8A8]/20 px-3 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
          >
            <BackIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("backToInfo")}</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#E8D8A8]/80 font-serif tracking-widest">{t("traditionalBh")}</span>
          </div>
        </div>

        <RegistrationForm key={formKey} />
      </main>

      {/* Floating WhatsApp Quick Action */}
      <WhatsAppButton variant="floating" />

      <footer className="border-t border-slate-800 bg-[#071224] pt-6 pb-20 sm:pb-6 text-center text-xs text-slate-400">
        {t("title")} • {t("deptSubtitle")}
      </footer>
    </div>
  );
}
