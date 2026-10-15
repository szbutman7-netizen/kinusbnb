"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dataStore } from "@/lib/services/dataService";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { Shliach } from "@/types";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { KinusDatePicker } from "@/components/common/KinusDatePicker";
import { KinusTimePicker } from "@/components/common/KinusTimePicker";
import { COUNTRIES } from "@/lib/constants/countries";
import { useLanguage } from "@/lib/context/LanguageContext";
import { DEFAULT_ARRIVAL_DATES, DEFAULT_DEPARTURE_DATES } from "@/lib/services/dataService";
import { generateRegistrationConfirmationHtml } from "@/lib/services/emailTemplateHelper";
import StripePaymentSection from "./StripePaymentSection";
import { 
  User, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  AlertCircle, 
  Check, 
  Loader2,
  Plus,
  Trash2,
  Baby
} from "lucide-react";

const KINUS_START_DATE = "2026-11-04";
const KINUS_END_DATE = "2026-11-09";

const INITIAL_FORM_DATA = {
  firstName: "",
  lastName: "",
  hebrewName: "",
  age: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  passportOrId: "",
  arrivalDate: "",
  arrivalTime: "",
  departureDate: "",
  departureTime: "",
  preferredRoommates: "",
  specialRequests: "",
  needsChildrenAccommodation: false,
  childrenNames: [""] as string[],
  cardNumber: "",
  cardExp: "",
  cardCvc: "",
};

function getEmailSuggestion(email: string): string | null {
  const clean = email.trim().toLowerCase();
  const parts = clean.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || !domain) return null;

  const TYPO_MAP: Record<string, string> = {
    "gmai.com": "gmail.com",
    "gamil.com": "gmail.com",
    "gmial.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gmaik.com": "gmail.com",
    "hotmai.com": "hotmail.com",
    "hotmial.com": "hotmail.com",
    "hotmaill.com": "hotmail.com",
    "yaho.com": "yahoo.com",
    "yahooo.com": "yahoo.com",
    "outlok.com": "outlook.com",
    "outloo.com": "outlook.com",
    "outllok.com": "outlook.com",
    "iclud.com": "icloud.com",
    "icoud.com": "icloud.com",
  };

  const suggestion = TYPO_MAP[domain];
  return suggestion ? `${local}@${suggestion}` : null;
}

export function RegistrationForm() {
  const router = useRouter();
  const { t, language, isRtl } = useLanguage();
  const { formSettings, isLoaded } = useKinusData();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [savedShliachId, setSavedShliachId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Restore draft state and synchronize with browser history
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem("kinus_registration_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
      const params = new URLSearchParams(window.location.search);
      const urlStep = Number(params.get("step"));
      const savedStep = Number(sessionStorage.getItem("kinus_registration_step"));
      const initialStep = (urlStep >= 1 && urlStep <= 3 ? urlStep : (savedStep >= 1 && savedStep <= 3 ? savedStep : 1)) as 1 | 2 | 3;
      setStep(initialStep);
    } catch {
      // ignore
    }
    setIsSubmitting(false);

    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const s = Number(params.get("step")) || 1;
        if (s >= 1 && s <= 3) {
          setStep(s as 1 | 2 | 3);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const goToStep = (newStep: 1 | 2 | 3, dir: "forward" | "backward" = "forward") => {
    setDirection(dir);
    setStep(newStep);
    try {
      sessionStorage.setItem("kinus_registration_step", String(newStep));
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(newStep));
      window.history.pushState({ step: newStep }, "", url.toString());
    } catch {
      // ignore
    }
  };

  // Prevent accidental tab closure or navigation while submission is saving to server
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting]);

  const suggestedEmail = getEmailSuggestion(formData.email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Date range restrictions: must be between 2026-11-03 and 2026-11-10
    if ((name === "arrivalDate" || name === "departureDate") && value) {
      if (value < KINUS_START_DATE || value > KINUS_END_DATE) {
        setErrorMessage(t("valDatesOutOfRange"));
        return;
      }
    }

    setErrorMessage("");
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      try {
        sessionStorage.setItem("kinus_registration_draft", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleChildNameChange = (index: number, val: string) => {
    setFormData(prev => {
      const updated = [...prev.childrenNames];
      updated[index] = val;
      const res = { ...prev, childrenNames: updated };
      try {
        sessionStorage.setItem("kinus_registration_draft", JSON.stringify(res));
      } catch {
        // ignore
      }
      return res;
    });
  };

  const handleAddChild = () => {
    setFormData(prev => ({
      ...prev,
      childrenNames: [...prev.childrenNames, ""]
    }));
  };

  const handleRemoveChild = (index: number) => {
    setFormData(prev => {
      const updated = prev.childrenNames.filter((_, i) => i !== index);
      return {
        ...prev,
        childrenNames: updated.length > 0 ? updated : [""]
      };
    });
  };

  // Dynamic pricing calculation: $30 base + $30 per child (if needs accommodation)
  const validChildren = formData.needsChildrenAccommodation
    ? formData.childrenNames.map(c => c.trim()).filter(Boolean)
    : [];
  // If user selected "yes", we count either the number of entered children or minimum 1 if they clicked yes
  const childrenCount = formData.needsChildrenAccommodation
    ? Math.max(formData.childrenNames.length, 1)
    : 0;
  const childrenFee = childrenCount * 30;
  const basePrice = 30;
  const totalPrice = basePrice + childrenFee;

  const handleNextStep = async () => {
    setErrorMessage("");
    if (step === 1) {
      if (!formData.hebrewName.trim()) {
        setErrorMessage(t("valHebrewNameRequired"));
        return;
      }
      const nameParts = formData.hebrewName.trim().split(/\s+/).filter(Boolean);
      if (nameParts.length < 2) {
        setErrorMessage(t("valFullNameIncomplete"));
        return;
      }
      const inferredFirstName = nameParts.slice(0, -1).join(" ");
      const inferredLastName = nameParts[nameParts.length - 1];

      const ageNum = Number(formData.age);
      if (!formData.age || isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
        setErrorMessage(t("valAgeRequired"));
        return;
      }
      if (!formData.passportOrId.trim()) {
        setErrorMessage(t("valPassportRequired"));
        return;
      }
      if (!formData.country.trim()) {
        setErrorMessage(t("valCountryRequired"));
        return;
      }
      if (!formData.city.trim()) {
        setErrorMessage(t("valCityRequired"));
        return;
      }
      const cleanPhone = formData.phone.trim().replace(/\D/g, "");
      if (!formData.phone.trim() || cleanPhone.length < 7) {
        setErrorMessage(t("valPhoneRequired"));
        return;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setErrorMessage(t("valEmailInvalid"));
        return;
      }

      setIsSavingDraft(true);
      try {
        const draft = await dataStore.saveShliachDraft({
          id: savedShliachId || undefined,
          firstName: inferredFirstName,
          lastName: inferredLastName,
          hebrewName: formData.hebrewName.trim(),
          age: ageNum,
          passportOrId: formData.passportOrId.trim(),
          country: formData.country,
          city: formData.city.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          needsChildrenAccommodation: formData.needsChildrenAccommodation,
          childrenNames: validChildren,
          childrenCount: childrenCount,
          registrationStatus: 'DRAFT',
        });
        if (draft && draft.id) {
          setSavedShliachId(draft.id);
        }
      } catch (err) {
        console.warn("Draft auto-save notice:", err);
      } finally {
        setIsSavingDraft(false);
      }

      goToStep(2, "forward");
    } else if (step === 2) {
      if (!formData.arrivalDate) {
        setErrorMessage(t("valArrivalRequired"));
        return;
      }
      if (formData.arrivalDate < KINUS_START_DATE || formData.arrivalDate > KINUS_END_DATE) {
        setErrorMessage(t("valDatesOutOfRange"));
        return;
      }
      if (!formData.arrivalTime) {
        setErrorMessage(t("valArrivalRequired"));
        return;
      }
      if (!formData.departureDate) {
        setErrorMessage(t("valDepartureRequired"));
        return;
      }
      if (formData.departureDate < KINUS_START_DATE || formData.departureDate > KINUS_END_DATE) {
        setErrorMessage(t("valDatesOutOfRange"));
        return;
      }
      if (!formData.departureTime) {
        setErrorMessage(t("valDepartureRequired"));
        return;
      }
      if (formData.arrivalDate > formData.departureDate) {
        setErrorMessage(t("valDepartureBeforeArrival"));
        return;
      }
      if (formData.needsChildrenAccommodation && validChildren.length === 0) {
        setErrorMessage(t("valChildrenNamesRequired"));
        return;
      }

      try {
        await dataStore.saveShliachDraft({
          id: savedShliachId || undefined,
          passportOrId: formData.passportOrId.trim(),
          arrivalDate: formData.arrivalDate,
          arrivalTime: formData.arrivalTime,
          departureDate: formData.departureDate,
          departureTime: formData.departureTime,
          preferredRoommates: formData.preferredRoommates.trim(),
          specialRequests: formData.specialRequests.trim(),
          needsChildrenAccommodation: formData.needsChildrenAccommodation,
          childrenNames: validChildren,
          childrenCount: childrenCount,
          registrationStatus: 'DRAFT',
        });
      } catch (err) {
        console.warn("Draft step 2 update notice:", err);
      }

      goToStep(3, "forward");
    }
  };

  const handlePrevStep = () => {
    setErrorMessage("");
    const prevStep = Math.max(1, step - 1) as 1 | 2 | 3;
    goToStep(prevStep, "backward");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Verify online network connection before attempting submission
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setErrorMessage(t("valServerSyncError"));
      return;
    }

    const displayName = formData.hebrewName.trim() || t("successDefaultShliachName");
    const nameParts = displayName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      setErrorMessage(t("valFullNameIncomplete"));
      return;
    }

    // Trigger Stripe Elements payment verification & confirmation
    window.dispatchEvent(new CustomEvent("stripe-submit-trigger"));
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const shliachId = savedShliachId || ("shliach-" + Date.now());
      const displayName = formData.hebrewName.trim() || t("successDefaultShliachName");
      const nameParts = displayName.split(/\s+/).filter(Boolean);
      const inferredFirstName = nameParts.slice(0, -1).join(" ");
      const inferredLastName = nameParts[nameParts.length - 1];

      const newShliach: Shliach = {
        id: shliachId,
        firstName: inferredFirstName,
        lastName: inferredLastName,
        hebrewName: displayName,
        age: Number(formData.age) || undefined,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        country: formData.country || (language === "he" ? "לא צוין" : "Not specified"),
        city: formData.city.trim() || (language === "he" ? "לא צוין" : "Not specified"),
        passportOrId: formData.passportOrId.trim(),
        arrivalDate: formData.arrivalDate || "2026-11-04",
        arrivalTime: formData.arrivalTime || "12:00",
        departureDate: formData.departureDate || "2026-11-09",
        departureTime: formData.departureTime || "12:00",
        preferredRoommates: formData.preferredRoommates.trim(),
        specialRequests: formData.specialRequests.trim(),
        needsChildrenAccommodation: formData.needsChildrenAccommodation,
        childrenNames: formData.needsChildrenAccommodation ? validChildren : [],
        childrenCount: childrenCount,
        paymentStatus: "PAID",
        amountPaid: totalPrice,
        currency: "USD",
        paidAt: new Date().toISOString(),
        receptionVisible: false,
        checkedIn: false,
        blockCheckIn: false,
        registrationStatus: 'COMPLETED',
        stripePaymentIntentId: paymentIntentId,
        createdAt: new Date().toISOString(),
      };

      // Ensure persistence with strict server sync requirement before granting completion
      await dataStore.addShliach(newShliach, { requireServerSync: true });

      // Attempt sending confirmation email via relay if email provided and feature is enabled
      const isEmailEnabled = formSettings?.sendConfirmationEmail ?? true;
      if (newShliach.email && isEmailEnabled) {
        try {
          const styledHtml = generateRegistrationConfirmationHtml({
            shliachName: newShliach.hebrewName,
            city: newShliach.city,
            country: newShliach.country,
            arrivalDate: newShliach.arrivalDate,
            departureDate: newShliach.departureDate,
            registrationId: newShliach.id,
            totalPrice: newShliach.amountPaid,
            specialRequests: newShliach.specialRequests,
            preferredRoommates: newShliach.preferredRoommates,
            childrenNames: newShliach.childrenNames,
            needsChildrenAccommodation: newShliach.needsChildrenAccommodation,
          });

          await fetch("/api/email-relay/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: newShliach.email,
              subject: "אישור הרשמה לכינוס השלוחים העולמי ה׳תשפ״ז",
              htmlBody: styledHtml,
            }),
          });

          // Log the successful automated email in the system
          dataStore.addEmailLog({
            recipientEmail: newShliach.email,
            recipientName: newShliach.hebrewName,
            subject: "אישור הרשמה לכינוס השלוחים העולמי ה׳תשפ״ז",
            templateName: "אישור הרשמה וקבלה לתשלום",
            status: "SENT",
          });
        } catch (err: any) {
          console.warn("Email relay background notice:", err);
          dataStore.addEmailLog({
            recipientEmail: newShliach.email,
            recipientName: newShliach.hebrewName,
            subject: "אישור הרשמה לכינוס השלוחים העולמי ה׳תשפ״ז",
            templateName: "אישור הרשמה וקבלה לתשלום",
            status: "FAILED",
            errorMessage: err?.message || "Failed to send",
          });
        }
      }

      // Reset form state so subsequent visits start clean at Step 1
      try {
        sessionStorage.removeItem("kinus_registration_draft");
        sessionStorage.removeItem("kinus_registration_step");
      } catch {
        // ignore
      }
      setFormData(INITIAL_FORM_DATA);
      setStep(1);
      setIsSubmitting(false);

      router.push(`/success?id=${shliachId}`);
    } catch (err: any) {
      if (err?.message === "SERVER_SYNC_FAILED") {
        setErrorMessage(t("valServerSyncError"));
      } else {
        setErrorMessage(err.message || t("valGenericError"));
      }
      setIsSubmitting(false);
    }
  };

  // Closed Registration UI state
  if (isLoaded && !formSettings.isOpen) {
    const customMessage = language === "en" ? formSettings.closedMessageEn : formSettings.closedMessageHe;

    return (
      <div className="glass-panel rounded-3xl shadow-2xl border-[#E8D8A8]/25 overflow-hidden max-w-2xl mx-auto">
        {/* Header Banner */}
        <div className="relative overflow-hidden p-6 sm:p-8 border-b border-[#E8D8A8]/20 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 pointer-events-none"
            style={{ backgroundImage: "url('/assets/hero-banquet.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#102444]/85 via-[#15305B]/90 to-[#15305B] pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-1 rounded-full bg-[#E8D8A8]/10 border border-[#E8D8A8]/30 shadow-[0_0_20px_rgba(232,216,168,0.15)] flex-shrink-0">
                <KinusLogo size={52} variant="emblem" />
              </div>
              <div>
                <span className="text-amber-400 font-semibold text-xs tracking-widest uppercase block">
                  {t("formClosedBadge")}
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                  {t("formTitle")}
                </h1>
                <p className="text-slate-200 text-xs mt-0.5 font-light">
                  {t("formYearSubtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Closed Body Message */}
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {t("formClosedTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-[#E8D8A8] font-medium">
              {t("formClosedSubtitle")}
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-[#102444]/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-200 leading-relaxed font-light shadow-md">
            {customMessage?.trim() || t("formClosedDesc")}
          </div>

          {/* WhatsApp Direct Help */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#102444]/80 p-5 rounded-xl border border-slate-700/70">
            <div className={isRtl ? "text-right" : "text-left"}>
              <span className="text-xs font-bold text-white block">
                {t("formClosedContactUs")}
              </span>
              <span className="text-[11px] text-slate-300">
                {t("whatsappBannerSubtitle")}
              </span>
            </div>
            <WhatsAppButton label={t("whatsappButtonText")} />
          </div>
        </div>
      </div>
    );
  }

  const stepAnimationClass = direction === "forward"
    ? (isRtl ? "animate-slide-in-right" : "animate-slide-in-left")
    : (isRtl ? "animate-slide-in-left" : "animate-slide-in-right");

  // Real-time live validation states
  const namePartsForValidation = formData.hebrewName.trim().split(/\s+/).filter(Boolean);
  const isHebrewNameValid = namePartsForValidation.length >= 2 && /^[\u0590-\u05FFa-zA-Z\s'"\-\.\u05F3\u05F4]+$/.test(formData.hebrewName.trim());
  const isAgeValid = !isNaN(Number(formData.age)) && Number(formData.age) >= 18 && Number(formData.age) <= 120;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPhoneValid = formData.phone.trim().replace(/\D/g, "").length >= 7;
  const isCountryValid = Boolean(formData.country);
  const isCityValid = formData.city.trim().length > 1;
  const isPassportValid = formData.passportOrId.trim().length >= 3;

  const ValidBadge = () => (
    <div
      className={`absolute top-1/2 -translate-y-1/2 ${
        isRtl ? "left-3" : "right-3"
      } flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 shadow-[0_0_10px_rgba(52,211,153,0.35)] animate-fade-in pointer-events-none z-10`}
      aria-hidden="true"
    >
      <Check className="w-3 h-3 stroke-[3]" />
    </div>
  );

  return (
    <div className="glass-panel rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] border-[#E8D8A8]/25 overflow-hidden max-w-2xl mx-auto backdrop-blur-xl">
      {/* Header Banner in authentic Kinus styling with atmospheric background */}
      <div className="relative overflow-hidden p-6 sm:p-8 border-b border-[#E8D8A8]/20 text-white">
        {/* Atmosphere Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 pointer-events-none transition-opacity duration-300"
          style={{ backgroundImage: "url('/assets/hero-banquet.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#102444]/90 via-[#15305B]/90 to-[#102444]/95 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-1 rounded-full bg-[#E8D8A8]/10 border border-[#E8D8A8]/30 shadow-[0_0_20px_rgba(232,216,168,0.2)] flex-shrink-0 animate-subtle-float">
              <KinusLogo size={52} variant="emblem" />
            </div>
            <div>
              {t("formBadge") ? (
                <span className="text-[#E8D8A8] font-semibold text-xs tracking-widest uppercase block">
                  {t("formBadge")}
                </span>
              ) : null}
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {t("formTitle")}
              </h1>
              {t("formYearSubtitle") ? (
                <p className="text-slate-200 text-xs mt-0.5 font-light">
                  {t("formYearSubtitle")}
                </p>
              ) : null}
              {t("formDeadlineNotice") ? (
                <p className="text-[#E8D8A8] text-xs mt-1 font-medium">
                  {t("formDeadlineNotice")}
                </p>
              ) : null}
            </div>
          </div>

          <div className={`hidden sm:block ${isRtl ? "text-left" : "text-right"}`}>
            <span className="text-2xl font-serif font-bold text-[#E8D8A8] block drop-shadow-sm">$30</span>
            <span className="text-[11px] text-slate-300">{t("formPriceLabel")}</span>
          </div>
        </div>

        {/* Step Indicator with continuous progress bar */}
        <nav
          aria-label="Registration steps"
          className="mt-5 sm:mt-7 border-t border-slate-700/60 pt-4"
        >
          <div className="relative flex items-center justify-between px-2 sm:px-6">
            {/* Background track line */}
            <div className="absolute top-4 inset-x-8 sm:inset-x-14 h-1 bg-slate-800/90 rounded-full" aria-hidden="true" />
            
            {/* Animated filled progress line */}
            <div
              className="absolute top-4 h-1 bg-gradient-to-r from-[#E8D8A8]/60 via-[#E8D8A8] to-[#E8D8A8] rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(232,216,168,0.5)]"
              style={{
                [isRtl ? "right" : "left"]: "2rem",
                width: step === 1 ? "0%" : step === 2 ? "calc(50% - 2rem)" : "calc(100% - 4rem)"
              }}
              aria-hidden="true"
            />

            {/* Step 1 Node */}
            <div
              aria-current={step === 1 ? "step" : undefined}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > 1
                    ? "bg-[#E8D8A8] text-[#07142A] shadow-[0_0_15px_rgba(232,216,168,0.5)] scale-100"
                    : step === 1
                    ? "bg-[#E8D8A8] text-[#07142A] ring-4 ring-[#E8D8A8]/30 shadow-[0_0_20px_rgba(232,216,168,0.6)] scale-110"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" /> : "1"}
              </div>
              <span className={`text-[11px] sm:text-xs mt-1.5 transition-colors duration-200 ${
                step >= 1 ? "text-[#E8D8A8] font-bold" : "text-slate-400"
              }`}>
                {t("stepLabel1")}
              </span>
            </div>

            {/* Step 2 Node */}
            <div
              aria-current={step === 2 ? "step" : undefined}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step > 2
                    ? "bg-[#E8D8A8] text-[#07142A] shadow-[0_0_15px_rgba(232,216,168,0.5)] scale-100"
                    : step === 2
                    ? "bg-[#E8D8A8] text-[#07142A] ring-4 ring-[#E8D8A8]/30 shadow-[0_0_20px_rgba(232,216,168,0.6)] scale-110"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" /> : "2"}
              </div>
              <span className={`text-[11px] sm:text-xs mt-1.5 transition-colors duration-200 ${
                step >= 2 ? "text-[#E8D8A8] font-bold" : "text-slate-400"
              }`}>
                {t("stepLabel2")}
              </span>
            </div>

            {/* Step 3 Node */}
            <div
              aria-current={step === 3 ? "step" : undefined}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === 3
                    ? "bg-[#E8D8A8] text-[#07142A] ring-4 ring-[#E8D8A8]/30 shadow-[0_0_20px_rgba(232,216,168,0.6)] scale-110"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                3
              </div>
              <span className={`text-[11px] sm:text-xs mt-1.5 transition-colors duration-200 ${
                step >= 3 ? "text-[#E8D8A8] font-bold" : "text-slate-400"
              }`}>
                {t("stepLabel3")}
              </span>
            </div>
          </div>
        </nav>
      </div>

      {/* Accessible Live Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="animate-alert-shake m-4 sm:m-6 p-4 bg-red-950/80 border border-red-500/70 rounded-2xl flex items-center gap-3 text-red-100 text-xs shadow-lg"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-300" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-6">
        {step === 1 && (
          <fieldset key="step-1" className={`space-y-4 ${stepAnimationClass}`}>
            <legend className="sr-only">{t("step1Header")}</legend>
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#E8D8A8]" aria-hidden="true" />
                {t("step1Header")}
              </h2>
              <span className="text-[11px] text-[#E8D8A8] font-medium">
                {t("mandatoryNotice")}
              </span>
            </div>

            {/* Hebrew Name */}
            <div>
              <label htmlFor="hebrewName" className="block text-xs font-semibold text-slate-200 mb-1">
                {t("hebrewNameLabel")} <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="hebrewName"
                  type="text"
                  name="hebrewName"
                  autoComplete="name"
                  dir="auto"
                  value={formData.hebrewName}
                  onChange={handleChange}
                  placeholder={t("hebrewNamePlaceholder")}
                  required
                  className={`kinus-input w-full px-3.5 py-2.5 rounded-xl border ${
                    isHebrewNameValid ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "border-slate-700"
                  } bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs text-right transition-all ${
                    isHebrewNameValid ? (isRtl ? "pl-10" : "pr-10") : ""
                  }`}
                />
                {isHebrewNameValid && <ValidBadge />}
              </div>
            </div>

            {/* Age & Passport / ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("ageLabel")} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="age"
                    type="number"
                    name="age"
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className={`kinus-input w-full px-3.5 py-2.5 rounded-xl border ${
                      isAgeValid ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "border-slate-700"
                    } bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs transition-all ${
                      isAgeValid ? (isRtl ? "pl-10" : "pr-10") : ""
                    }`}
                  />
                  {isAgeValid && <ValidBadge />}
                </div>
              </div>

              <div>
                <label htmlFor="passportOrId" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("passportLabel")} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="passportOrId"
                    type="text"
                    name="passportOrId"
                    value={formData.passportOrId}
                    onChange={handleChange}
                    placeholder={t("passportPlaceholder")}
                    required
                    className={`kinus-input w-full px-3.5 py-2.5 rounded-xl border ${
                      isPassportValid ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "border-slate-700"
                    } bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs transition-all ${
                      isPassportValid ? (isRtl ? "pl-10" : "pr-10") : ""
                    }`}
                  />
                  {isPassportValid && <ValidBadge />}
                </div>
              </div>
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("countryLabel")} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={`kinus-input w-full px-3.5 py-2.5 rounded-xl border ${
                      isCountryValid ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "border-slate-700"
                    } bg-[#0B1E38]/90 text-white focus:outline-none text-base sm:text-xs transition-all ${
                      isCountryValid ? (isRtl ? "pl-10" : "pr-10") : ""
                    }`}
                  >
                    <option value="">{t("countrySelectDefault")}</option>
                    {COUNTRIES.map((c) => {
                      const countryDisplay = language === "en" ? `${c.nameEn} (${c.nameHe})` : `${c.nameHe} (${c.nameEn})`;
                      const countryValue = language === "en" ? c.nameEn : c.nameHe;
                      return (
                        <option key={c.nameEn} value={countryValue}>
                          {countryDisplay}
                        </option>
                      );
                    })}
                    <option value="Other">{t("countryOther")}</option>
                  </select>
                  {isCountryValid && <ValidBadge />}
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("cityLabel")} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={t("cityPlaceholder")}
                    required
                    className={`kinus-input w-full px-3.5 py-2.5 rounded-xl border ${
                      isCityValid ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "border-slate-700"
                    } bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs transition-all ${
                      isCityValid ? (isRtl ? "pl-10" : "pr-10") : ""
                    }`}
                  />
                  {isCityValid && <ValidBadge />}
                </div>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("phoneLabel")} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("phonePlaceholder")}
                    required
                    className={`kinus-input w-full px-3.5 py-2.5 rounded-xl border ${
                      isPhoneValid ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "border-slate-700"
                    } bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs transition-all ${
                      isPhoneValid ? (isRtl ? "pl-10" : "pr-10") : ""
                    }`}
                  />
                  {isPhoneValid && <ValidBadge />}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("emailLabel")} <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("emailPlaceholder")}
                    required
                    className={`kinus-input w-full px-3.5 py-2.5 rounded-xl border ${
                      isEmailValid ? "border-emerald-500/60 shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "border-slate-700"
                    } bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs transition-all ${
                      isEmailValid ? (isRtl ? "pl-10" : "pr-10") : ""
                    }`}
                  />
                  {isEmailValid && <ValidBadge />}
                </div>
                {suggestedEmail && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-sm">
                    <span className="font-medium">
                      {language === "he"
                        ? `האם התכוונת ל-${suggestedEmail}?`
                        : `Did you mean ${suggestedEmail}?`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, email: suggestedEmail }))}
                      className="px-2.5 py-1 rounded-lg bg-amber-400/25 hover:bg-amber-400/40 text-amber-200 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 border border-amber-400/40"
                    >
                      {language === "he" ? "תקן לכתובת זו" : "Apply fix"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset key="step-2" className={`space-y-4 ${stepAnimationClass}`}>
            <legend className="sr-only">{t("step2Header")}</legend>
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E8D8A8]" aria-hidden="true" />
                {t("step2Header")}
              </h2>
            </div>

            <div className="p-3.5 bg-[#E8D8A8]/10 border border-[#E8D8A8]/25 rounded-xl text-xs text-[#E8D8A8] space-y-1 backdrop-blur-sm">
              <span className="font-bold block">{t("datesNoticeTitle")}</span>
              <p className="text-[11px] text-slate-200 leading-relaxed font-light">
                {t("datesNoticeText")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <KinusDatePicker
                  id="arrivalDate"
                  name="arrivalDate"
                  label={t("arrivalDateLabel")}
                  required
                  value={formData.arrivalDate}
                  onChange={(val) => setFormData(prev => ({ ...prev, arrivalDate: val }))}
                  allowedDates={formSettings?.allowedArrivalDates?.length ? formSettings.allowedArrivalDates : DEFAULT_ARRIVAL_DATES}
                  placeholder={t("dateSelectPlaceholder")}
                />
              </div>

              <div>
                <KinusTimePicker
                  id="arrivalTime"
                  name="arrivalTime"
                  label={t("arrivalTimeLabel")}
                  required
                  value={formData.arrivalTime}
                  onChange={(val) => setFormData(prev => ({ ...prev, arrivalTime: val }))}
                  placeholder={t("timeSelectPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <KinusDatePicker
                  id="departureDate"
                  name="departureDate"
                  label={t("departureDateLabel")}
                  required
                  value={formData.departureDate}
                  onChange={(val) => setFormData(prev => ({ ...prev, departureDate: val }))}
                  allowedDates={formSettings?.allowedDepartureDates?.length ? formSettings.allowedDepartureDates : DEFAULT_DEPARTURE_DATES}
                  placeholder={t("dateSelectPlaceholder")}
                />
              </div>

              <div>
                <KinusTimePicker
                  id="departureTime"
                  name="departureTime"
                  label={t("departureTimeLabel")}
                  required
                  value={formData.departureTime}
                  onChange={(val) => setFormData(prev => ({ ...prev, departureTime: val }))}
                  placeholder={t("timeSelectPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label htmlFor="preferredRoommates" className="block text-xs font-semibold text-slate-200 mb-1">
                {t("roommatesLabel")}
              </label>
              <input
                id="preferredRoommates"
                type="text"
                name="preferredRoommates"
                value={formData.preferredRoommates}
                onChange={handleChange}
                placeholder={t("roommatesPlaceholder")}
                aria-describedby="roommates-help"
                className="kinus-input w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs"
              />
              <p id="roommates-help" className="text-[11px] text-slate-300 mt-1">
                {t("roommatesHelp")}
              </p>
            </div>

            {/* Children Accommodation Question */}
            <div className="p-4 rounded-2xl bg-[#102444]/90 border border-slate-700/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#E8D8A8]" aria-hidden="true" />
                  {t("childrenQuestionLabel")}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        needsChildrenAccommodation: true,
                        childrenNames: prev.childrenNames.length > 0 ? prev.childrenNames : [""]
                      }));
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      formData.needsChildrenAccommodation
                        ? "bg-[#E8D8A8] text-[#07142A] shadow-[0_0_12px_rgba(232,216,168,0.4)] scale-105"
                        : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                    }`}
                  >
                    {t("childrenOptionYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        needsChildrenAccommodation: false
                      }));
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      !formData.needsChildrenAccommodation
                        ? "bg-[#E8D8A8] text-[#07142A] shadow-[0_0_12px_rgba(232,216,168,0.4)] scale-105"
                        : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                    }`}
                  >
                    {t("childrenOptionNo")}
                  </button>
                </div>
              </div>

              {formData.needsChildrenAccommodation && (
                <div className="pt-2 space-y-3 border-t border-slate-700/60 animate-fade-in">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2">
                    <span className="font-bold text-amber-300">ℹ️</span>
                    <span>{t("childrenPriceNotice")}</span>
                  </div>

                  <div className="space-y-2.5">
                    {formData.childrenNames.map((childName, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={childName}
                            onChange={(e) => handleChildNameChange(idx, e.target.value)}
                            placeholder={`${t("childNamePlaceholder")} ${formData.childrenNames.length > 1 ? `(#${idx + 1})` : ""}`}
                            className="kinus-input w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38] text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs"
                          />
                        </div>
                        {formData.childrenNames.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChild(idx)}
                            aria-label={`${t("removeChildButton")} #${idx + 1}`}
                            className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 hover:text-red-100 hover:bg-red-900/60 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddChild}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8D8A8]/40 bg-[#E8D8A8]/10 text-[#E8D8A8] text-xs font-semibold hover:bg-[#E8D8A8]/20 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t("addChildButton")}</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-xs font-semibold text-slate-200 mb-1">
                {t("specialRequestsLabel")}
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={3}
                placeholder={t("specialRequestsPlaceholder")}
                className="kinus-input w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38]/90 text-white placeholder-slate-400 focus:outline-none text-base sm:text-xs"
              />
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset key="step-3" className={`space-y-4 ${stepAnimationClass}`}>
            <legend className="sr-only">{t("step3Header")}</legend>
            <h2 className="text-base font-bold text-[#E8D8A8] border-b border-slate-700/80 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#E8D8A8]" aria-hidden="true" />
                {t("step3Header")}
              </span>
              <span className="text-sm font-serif font-bold text-[#E8D8A8]">${totalPrice}.00 USD</span>
            </h2>

            {/* VIP Pass Summary Card */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[#E8D8A8]/30 shadow-md relative overflow-hidden space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-200 font-medium">{t("feeSummaryLabel")}</span>
                <span className="font-serif font-semibold text-slate-100">$30.00 USD</span>
              </div>

              {formData.needsChildrenAccommodation && childrenCount > 0 && (
                <div className="flex justify-between items-center text-xs border-t border-slate-700/40 pt-2 text-[#E8D8A8]">
                  <span>
                    {t("childrenSummaryLabel")} ({childrenCount} × $30)
                  </span>
                  <span className="font-serif font-semibold">${childrenFee}.00 USD</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-700/60 text-xs">
                <span className="text-white font-bold">{t("feeTotalLabel")}</span>
                <span className="font-serif font-bold text-[#E8D8A8] text-base drop-shadow-sm">${totalPrice}.00 USD</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-300">
                <span className="text-slate-400 font-light">{language === "he" ? "כולל אירוח מלא לכל ימי הכינוס" : "Includes full accommodation for all Kinus days"}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                  {t("sslSecuredText")}
                </span>
              </div>
            </div>

            {/* Embedded Real Stripe Elements Integration */}
            <StripePaymentSection
              amount={totalPrice}
              shliachDetails={{
                id: savedShliachId || `shliach-${Date.now()}`,
                hebrewName: formData.hebrewName.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                country: formData.country,
                city: formData.city.trim(),
                passportOrId: formData.passportOrId.trim(),
                arrivalDate: formData.arrivalDate || "2026-11-04",
                arrivalTime: formData.arrivalTime || "12:00",
                departureDate: formData.departureDate || "2026-11-09",
                departureTime: formData.departureTime || "12:00",
                needsChildrenAccommodation: formData.needsChildrenAccommodation,
                childrenNames: validChildren,
              }}
              childrenCount={childrenCount}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              onPaymentSuccess={handlePaymentSuccess}
              onError={(err) => setErrorMessage(err)}
              language={language}
              t={t}
            />
          </fieldset>
        )}

        {/* Buttons Controls */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-700/80 gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-slate-700/80 bg-[#102444]/60 text-slate-200 text-xs font-semibold hover:border-[#E8D8A8] hover:text-white hover:bg-[#15305B] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] active:scale-95"
            >
              {isRtl ? <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /> : <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
              {t("btnBack")}
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSavingDraft}
              className="shimmer-button inline-flex items-center gap-2 px-7 sm:px-8 py-3 rounded-full bg-[#E8D8A8] text-[#040D1E] text-xs font-bold hover:bg-white hover:shadow-[0_0_20px_rgba(232,216,168,0.4)] transition-all duration-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1E38] active:scale-95 disabled:opacity-60"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>{t("savingData")}</span>
                </>
              ) : (
                <>
                  <span>{t("btnNext")}</span>
                  {isRtl ? <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> : <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="shimmer-button inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E8D8A8] text-[#040D1E] text-xs sm:text-sm font-bold hover:bg-white hover:shadow-[0_0_25px_rgba(232,216,168,0.5)] transition-all duration-200 shadow-lg disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1E38] active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{t("btnSubmitting")}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  <span>{`${t("btnSubmit")} ($${totalPrice})`}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Submitting & Saving Lock Overlay */}
      {isSubmitting && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("submittingOverlayTitle")}
          className="fixed inset-0 z-50 bg-[#07142A]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-[#102444] border border-[#E8D8A8]/30 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-[#E8D8A8]/10 border border-[#E8D8A8]/40 flex items-center justify-center mx-auto text-[#E8D8A8] shadow-[0_0_30px_rgba(232,216,168,0.25)]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white font-serif tracking-wide">
                {t("submittingOverlayTitle")}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {t("submittingOverlayDesc")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
