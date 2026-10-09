"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { dataStore } from "@/lib/services/dataService";
import { Shliach } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { KinusLogo } from "@/components/common/KinusLogo";
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
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

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#E8D8A8]/10 text-[#E8D8A8] border border-[#E8D8A8]/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-white">
          ההרשמה נקלטה בהצלחה!
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 font-light">
          אישור ההרשמה והלינה נשלחו אל תיבת הדוא״ל שלכם.
        </p>
      </div>

      {/* Printable Confirmation Card */}
      <div className="bg-[#0B1E38] rounded-2xl shadow-2xl border border-[#E8D8A8]/20 overflow-hidden print:bg-white print:text-black print:border print:shadow-none">
        {/* Card Header */}
        <div className="bg-[#07142A] p-5 flex items-center justify-between border-b border-[#E8D8A8]/20 text-white">
          <div className="flex items-center gap-3">
            <KinusLogo size={38} color="#E8D8A8" />
            <div>
              <span className="text-[10px] text-[#E8D8A8] font-bold uppercase tracking-widest block">
                כינוס השלוחים העולמי תשפ״ז
              </span>
              <span className="text-base font-serif font-bold block">
                אישור הרשמה ולינה
              </span>
            </div>
          </div>
          <span className="text-xs text-[#E8D8A8] font-serif">ב״ה</span>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 text-white">
          <div className="space-y-1 pb-4 border-b border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400">פרטי השליח:</span>
            <h2 className="text-xl font-bold text-white">
              {shliach?.hebrewName || "הרב השליח"}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#E8D8A8]" />
              <span>שליח ב{shliach?.city || "מקום השליחות"}, {shliach?.country || ""}</span>
            </p>
            {shliach?.passportOrId && (
              <p className="text-[11px] text-slate-400 font-mono pt-0.5">
                מספר מזהה / ת״ז: {shliach.passportOrId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#07142A] rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 text-[11px]">תאריכי שהות:</span>
              <span className="font-bold text-white block">
                {shliach?.arrivalDate || "18 נובמבר"} - {shliach?.departureDate || "23 נובמבר"}
              </span>
            </div>

            <div className="p-3 bg-[#07142A] rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 text-[11px]">סטטוס תשלום:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                שולם ($180) ב-Stripe
              </span>
            </div>
          </div>

          <div className="bg-[#07142A]/60 border border-[#E8D8A8]/20 rounded-xl p-4 text-xs text-slate-200 space-y-1.5">
            <p className="font-bold text-[#E8D8A8]">הנחיות להגעה וקליטה:</p>
            <p className="text-[11px] leading-relaxed">
              בהגעתכם לקראון הייטס, גשו לעמדת הקבלה והזדהו בשמכם או במספר תעודת הזהות/הדרכון לקבלת מפתח הדירה ופרטי החדר.
            </p>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 bg-[#07142A] border-t border-slate-800 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 text-slate-300 text-xs font-semibold hover:border-slate-500 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            הדפס אישור הרשמה
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#E8D8A8] text-[#040D1E] text-xs font-bold hover:bg-white transition-colors"
          >
            חזרה לדף הבית
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#040D1E] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#040D1E]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Suspense fallback={<div className="text-center py-20 text-slate-400 text-xs">טוען אישור הרשמה...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
