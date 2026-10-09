"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { dataStore } from "@/lib/services/dataService";
import { Shliach } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { useLanguage } from "@/lib/context/LanguageContext";
import { CheckCircle2, Printer, ArrowRight, ArrowLeft, ShieldCheck, MapPin } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { t, isRtl } = useLanguage();
  const [shliach, setShliach] = useState<Shliach | null>(null);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    if (id) {
      const found = dataStore.getShluchim().find(s => s.id === id);
      if (found) {
        setShliach(found);
      }
    }
  }, [id]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const BackHomeIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#E8D8A8]/10 text-[#E8D8A8] border border-[#E8D8A8]/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm" aria-hidden="true">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-white">
          {t("successTitle")}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 font-light">
          {t("successSubtitle")}
        </p>
      </div>

      {/* Printable Confirmation Card */}
      <div className="bg-[#15305B] rounded-2xl shadow-2xl border border-[#E8D8A8]/20 overflow-hidden print:bg-white print:text-black print:border print:shadow-none">
        {/* Card Header */}
        <div className="bg-[#102444] p-5 flex items-center justify-between border-b border-[#E8D8A8]/20 text-white">
          <div className="flex items-center gap-3">
            <KinusLogo size={38} color="#E8D8A8" />
            <div className={isRtl ? "text-right" : "text-left"}>
              <span className="text-[10px] text-[#E8D8A8] font-bold uppercase tracking-widest block">
                {t("title")}
              </span>
              <span className="text-base font-serif font-bold block">
                {t("successCardBadge")}
              </span>
            </div>
          </div>
          <span className="text-xs text-[#E8D8A8] font-serif">{t("traditionalBh")}</span>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 text-white">
          <div className={`space-y-1 pb-4 border-b border-slate-700/60 ${isRtl ? "text-right" : "text-left"}`}>
            <span className="text-xs font-semibold text-slate-300">{t("successShliachDetails")}</span>
            <h2 className="text-xl font-bold text-white">
              {shliach?.hebrewName || t("successDefaultShliachName")}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#E8D8A8]" aria-hidden="true" />
              <span>{t("successLocationPrefix")}{shliach?.city || ""}, {shliach?.country || ""}</span>
            </p>
            {shliach?.passportOrId && (
              <p className="text-[11px] text-slate-300 font-mono pt-0.5">
                {t("successIdPrefix")} {shliach.passportOrId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#102444] rounded-xl border border-slate-700/80">
              <span className="text-slate-300 block mb-1 text-[11px]">{t("successStayDates")}</span>
              <span className="font-bold text-white block">
                {shliach?.arrivalDate || "2026-11-04"} - {shliach?.departureDate || "2026-11-09"}
              </span>
            </div>

            <div className="p-3 bg-[#102444] rounded-xl border border-slate-700/80">
              <span className="text-slate-300 block mb-1 text-[11px]">{t("successPaymentStatus")}</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                {t("successPaidStripe")}
              </span>
            </div>
          </div>

          <div className="bg-[#102444]/80 border border-[#E8D8A8]/20 rounded-xl p-4 text-xs text-slate-200 space-y-1.5">
            <p className="font-bold text-[#E8D8A8]">{t("successArrivalGuideTitle")}</p>
            <p className="text-[11px] leading-relaxed text-slate-200">
              {t("successArrivalGuideText")}
            </p>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 bg-[#102444] border-t border-slate-800 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 text-slate-200 text-xs font-semibold hover:border-[#E8D8A8] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            {t("btnPrint")}
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#E8D8A8] text-[#0B1A30] text-xs font-bold hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
          >
            <span>{t("btnHome")}</span>
            <BackHomeIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1A30] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#0B1A30]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" id="main-content">
        <Suspense fallback={<div className="text-center py-20 text-slate-400 text-xs">טוען אישור הרשמה...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <WhatsAppButton variant="floating" />
    </div>
  );
}

