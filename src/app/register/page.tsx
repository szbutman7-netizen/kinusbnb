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

        <RegistrationForm key={formKey} />
      </main>

      {/* Floating WhatsApp Quick Action */}
      <WhatsAppButton variant="floating" />

      <footer className="border-t border-slate-800 bg-[#071224] py-6 text-center text-xs text-slate-400">
        {t("title")} • {t("deptSubtitle")}
      </footer>
    </div>
  );
}
