"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { dataStore } from "@/lib/services/dataService";
import { Shliach } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle2, Printer, ArrowRight, ShieldCheck, Calendar, MapPin, QrCode } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [shliach, setShliach] = useState<Shliach | null>(null);

  useEffect(() => {
    // Launch festive confetti
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
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          ההרשמה נקלטה בהצלחה!
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          אישור ההרשמה והקבלה נשלחו אל תיבת הדוא״ל שלכם.
        </p>
      </div>

      {/* Printable Badge Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
        {/* Card Header */}
        <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
              כינוס השלוחים העולמי תשפ״ז
            </span>
            <span className="text-lg font-black block">
              אישור לינה וקליטה (Guest Pass)
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 font-bold text-sm">
            770
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-xs font-semibold text-slate-400">שם השליח:</span>
              <h2 className="text-xl font-bold text-slate-900">
                {shliach?.hebrewName || "הרב השליח"}
              </h2>
              <p className="text-sm text-slate-600 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-900" />
                שליח ב{shliach?.city || "מקום השליחות"}, {shliach?.country || ""}
              </p>
            </div>

            {/* QR Code for Check-in */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-xs">
              <QRCodeSVG
                value={shliach?.id || id || "kinus-guest"}
                size={110}
                level="M"
              />
              <span className="text-[10px] text-slate-500 font-mono block mt-1">
                קוד קבלה אישי
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">תאריכי שהות:</span>
              <span className="font-bold text-slate-900 block">
                {shliach?.arrivalDate || "18 נובמבר"} - {shliach?.departureDate || "23 נובמבר"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">סטטוס תשלום:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                שולם ($180) ב-Stripe
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1">
            <p className="font-bold">הנחיות להגעה:</p>
            <p>1. שמרו אישור זה או את קוד ה-QR בצילום מסך בנייד.</p>
            <p>2. בהגעתכם לכינוס, גשו לעמדת הקבלה להצגת ה-QR לקבלת מפתח ופרטי החדר.</p>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-colors"
          >
            <Printer className="w-4 h-4" />
            הדפס אישור
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Suspense fallback={<div className="text-center py-20">טוען אישור הרשמה...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
