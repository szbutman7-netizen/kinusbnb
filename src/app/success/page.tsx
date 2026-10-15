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
import { CheckCircle2, Printer, ArrowRight, ArrowLeft, ShieldCheck, MapPin, AlertTriangle, Loader2 } from "lucide-react";

import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const redirectStatus = searchParams.get("redirect_status");
  const paymentIntentId = searchParams.get("payment_intent");
  const { t, isRtl, language } = useLanguage();
  const [shliach, setShliach] = useState<Shliach | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function verifyRegistration() {
      if (!id) {
        setLoading(false);
        setIsVerified(false);
        return;
      }

      // 1. Check local cache first
      const record = dataStore.getShluchim().find(s => s.id === id);
      if (record && record.paymentStatus === "PAID" && (record.registrationStatus === "COMPLETED" || !record.registrationStatus)) {
        if (!isCancelled) {
          setShliach(record);
          setIsVerified(true);
          setLoading(false);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {
            // ignore
          }
        }
        return;
      }

      // 2. Direct Firestore fallback (ideal for 3DS redirects or async webhook updates)
      try {
        const snap = await getDoc(doc(db, "shluchim", id));
        if (snap.exists() && !isCancelled) {
          const docData = snap.data() as Shliach;
          const isSuccessfulPayment = docData.paymentStatus === "PAID" || redirectStatus === "succeeded";

          if (isSuccessfulPayment) {
            if (redirectStatus === "succeeded" && docData.paymentStatus !== "PAID") {
              const now = new Date().toISOString();
              await updateDoc(doc(db, "shluchim", id), {
                paymentStatus: "PAID",
                registrationStatus: "COMPLETED",
                stripePaymentIntentId: paymentIntentId || docData.stripePaymentIntentId || "",
                paidAt: now,
                updatedAt: now,
              }).catch(console.warn);
              docData.paymentStatus = "PAID";
              docData.registrationStatus = "COMPLETED";
            }

            setShliach(docData);
            setIsVerified(true);
            setLoading(false);
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch (e) {
              // ignore
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Could not query Firestore directly on success page:", err);
      }

      if (!isCancelled) {
        setIsVerified(false);
        setLoading(false);
      }
    }

    verifyRegistration();

    return () => {
      isCancelled = true;
    };
  }, [id, redirectStatus, paymentIntentId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const BackHomeIcon = isRtl ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-300 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8D8A8]" />
        <p className="text-sm font-medium">{t("loadingReceipt") || "טוען אישור הרשמה..."}</p>
      </div>
    );
  }

  // CONFIRMATION GATE: Deny access if no valid, paid registration exists
  if (!isVerified || !shliach) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif text-white">
            {language === "he" ? "לא נמצא אישור הרשמה תקף" : "Valid Registration Not Found"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            {language === "he"
              ? "לא זוהה תשלום מאומת עבור מזהה זה, או שטרם הושלמה ההרשמה במערכת. במידה וחויבתם, אנא פנו למוקד התמיכה בוואטסאפ."
              : "No verified payment was found for this ID. If you were charged, please contact our support desk on WhatsApp."}
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-full bg-[#E8D8A8] text-[#0B1A30] text-xs font-bold hover:bg-white transition-all shadow-md"
          >
            {language === "he" ? "חזרה לטופס הרשמה" : "Return to Registration"}
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="bg-[#102444] p-5 flex items-center justify-between border-b border-[#E8D8A8]/20 text-white print:bg-slate-100 print:text-black print:border-slate-300">
          <div className="flex items-center gap-3">
            <KinusLogo size={38} color="#E8D8A8" />
            <div className={isRtl ? "text-right" : "text-left"}>
              <span className="text-[10px] text-[#E8D8A8] print:text-slate-700 font-bold uppercase tracking-widest block">
                {t("title")}
              </span>
              <span className="text-base font-serif font-bold block print:text-black">
                {t("successCardBadge")}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 text-white print:text-slate-900 print:bg-white">
          <div className="pb-4 border-b border-slate-700/60 print:border-slate-200">
            <div className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}>
              <span className="text-xs font-semibold text-slate-300 print:text-slate-600">{t("successShliachDetails")}</span>
              <h2 className="text-xl font-bold text-white print:text-black">
                {shliach.hebrewName || `${shliach.firstName} ${shliach.lastName}`}
              </h2>
              <p className="text-xs text-slate-300 print:text-slate-700 flex items-center gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8D8A8] print:text-slate-700" aria-hidden="true" />
                <span>{t("successLocationPrefix")}{shliach.city || ""}, {shliach.country || ""}</span>
              </p>
              {shliach.passportOrId && (
                <p className="text-[11px] text-slate-300 print:text-slate-600 font-mono pt-0.5" dir="ltr">
                  {t("successIdPrefix")} {shliach.passportOrId}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#102444] print:bg-slate-50 rounded-xl border border-slate-700/80 print:border-slate-300">
              <span className="text-slate-300 print:text-slate-600 block mb-1 text-[11px]">{t("successStayDates")}</span>
              <span className="font-bold text-white print:text-black block" dir="ltr">
                {shliach.arrivalDate || "2026-11-03"} - {shliach.departureDate || "2026-11-10"}
              </span>
            </div>

            <div className="p-3 bg-[#102444] print:bg-slate-50 rounded-xl border border-slate-700/80 print:border-slate-300">
              <span className="text-slate-300 print:text-slate-600 block mb-1 text-[11px]">{t("successPaymentStatus")}</span>
              <span className="font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {language === "he"
                    ? `שולם ($${shliach.amountPaid ?? 30}) ב-Stripe`
                    : `Paid ($${shliach.amountPaid ?? 30}) via Stripe`}
                </span>
              </span>
            </div>
          </div>

          {shliach.needsChildrenAccommodation && shliach.childrenNames && shliach.childrenNames.length > 0 && (
            <div className="p-3.5 bg-[#102444] print:bg-slate-50 rounded-xl border border-[#E8D8A8]/30 print:border-slate-300 text-xs text-white print:text-slate-900 space-y-1.5">
              <span className="font-bold text-[#E8D8A8] print:text-slate-800 block">
                {language === "he"
                  ? `לינה עבור ילדים (${shliach.childrenNames.length}):`
                  : `Children Accommodation (${shliach.childrenNames.length}):`}
              </span>
              <p className="text-slate-200 print:text-slate-700 text-[11px]">
                {shliach.childrenNames.join(", ")}
              </p>
            </div>
          )}

          {/* Important Registration Notice / Disclaimer */}
          <div className="bg-amber-950/30 print:bg-amber-50 border border-amber-500/30 print:border-amber-200 rounded-xl p-4 text-xs text-amber-200 print:text-amber-900 space-y-1.5">
            <p className="font-bold text-amber-300 print:text-amber-800 flex items-center gap-1.5">
              <span>{t("successDisclaimerTitle")}</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-100/90 print:text-amber-900 font-light">
              {t("successDisclaimerText")}
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
