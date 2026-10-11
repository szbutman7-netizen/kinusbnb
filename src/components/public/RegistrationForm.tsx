"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dataStore } from "@/lib/services/dataService";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { Shliach } from "@/types";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { KinusDatePicker } from "@/components/common/KinusDatePicker";
import { COUNTRIES } from "@/lib/constants/countries";
import { useLanguage } from "@/lib/context/LanguageContext";
import { DEFAULT_ARRIVAL_DATES, DEFAULT_DEPARTURE_DATES } from "@/lib/services/dataService";
import { 
  User, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  Lock,
  AlertCircle
} from "lucide-react";

const KINUS_START_DATE = "2026-11-04";
const KINUS_END_DATE = "2026-11-09";

const INITIAL_FORM_DATA = {
  firstName: "",
  lastName: "",
  hebrewName: "",
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
  cardNumber: "",
  cardExp: "",
  cardCvc: "",
};

export function RegistrationForm() {
  const router = useRouter();
  const { t, language, isRtl } = useLanguage();
  const { formSettings, isLoaded } = useKinusData();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Ensure state resets to step 1 whenever component mounts
  useEffect(() => {
    setStep(1);
    setIsSubmitting(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Date range restrictions: must be between 2026-11-04 and 2026-11-09
    if ((name === "arrivalDate" || name === "departureDate") && value) {
      if (value < KINUS_START_DATE || value > KINUS_END_DATE) {
        setErrorMessage(t("valDatesOutOfRange"));
        return;
      }
    }

    setErrorMessage("");
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    setErrorMessage("");
    if (step === 1) {
      if (formData.hebrewName.trim()) {
        const hasEnglish = /[a-zA-Z]/.test(formData.hebrewName);
        if (hasEnglish) {
          setErrorMessage(t("hebrewOnlyError"));
          return;
        }
      }
      // All fields are optional - validate email only if entered
      if (formData.email && !formData.email.includes("@")) {
        setErrorMessage(t("valEmailInvalid"));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate dates range if entered
      if (formData.arrivalDate && (formData.arrivalDate < KINUS_START_DATE || formData.arrivalDate > KINUS_END_DATE)) {
        setErrorMessage(t("valDatesOutOfRange"));
        return;
      }
      if (formData.departureDate && (formData.departureDate < KINUS_START_DATE || formData.departureDate > KINUS_END_DATE)) {
        setErrorMessage(t("valDatesOutOfRange"));
        return;
      }
      if (formData.arrivalDate && formData.departureDate && formData.arrivalDate > formData.departureDate) {
        setErrorMessage(t("valDepartureBeforeArrival"));
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const shliachId = "shliach-" + Date.now();
      const displayName =
        formData.hebrewName.trim() ||
        [formData.firstName, formData.lastName].filter(Boolean).join(" ") ||
        t("successDefaultShliachName");

      const newShliach: Shliach = {
        id: shliachId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        hebrewName: displayName,
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
        paymentStatus: "PAID",
        amountPaid: 180,
        currency: "USD",
        paidAt: new Date().toISOString(),
        receptionVisible: false,
        checkedIn: false,
        blockCheckIn: false,
        createdAt: new Date().toISOString(),
      };

      await dataStore.addShliach(newShliach);

      // Attempt sending confirmation email via relay if email provided
      if (newShliach.email) {
        try {
          await fetch("/api/email-relay/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: newShliach.email,
              subject: language === "he" ? "אישור הרשמה לכינוס השלוחים תשפ״ז" : "Kinus HaShluchim 5787 Registration Confirmation",
              htmlBody: `<h3>${newShliach.hebrewName},</h3><p>${language === "he" ? "הרשמתכם ללינה בכינוס השלוחים נקלטה בהצלחה!" : "Your Kinus housing registration has been confirmed!"}</p><p>ID: ${newShliach.id}</p><p>Dates: ${newShliach.arrivalDate} - ${newShliach.departureDate}</p>`
            })
          });
        } catch (err) {
          console.warn("Email relay background notice:", err);
        }
      }

      // Reset form state so subsequent visits start clean at Step 1
      setFormData(INITIAL_FORM_DATA);
      setStep(1);
      setIsSubmitting(false);

      router.push(`/success?id=${shliachId}`);
    } catch (err: any) {
      setErrorMessage(err.message || t("valGenericError"));
      setIsSubmitting(false);
    }
  };

  // Closed Registration UI state
  if (isLoaded && !formSettings.isOpen) {
    const customMessage = language === "en" ? formSettings.closedMessageEn : formSettings.closedMessageHe;

    return (
      <div className="bg-[#15305B] rounded-2xl shadow-2xl border border-[#E8D8A8]/20 overflow-hidden max-w-2xl mx-auto">
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
            <div className="hidden sm:block text-xs font-serif text-[#E8D8A8]/80">
              {t("traditionalBh")}
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

  return (
    <div className="bg-[#15305B] rounded-2xl shadow-2xl border border-[#E8D8A8]/20 overflow-hidden max-w-2xl mx-auto">
      {/* Header Banner in authentic Kinus styling with atmospheric background */}
      <div className="relative overflow-hidden p-6 sm:p-8 border-b border-[#E8D8A8]/20 text-white">
        {/* Atmosphere Background Image */}
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
              <span className="text-[#E8D8A8] font-semibold text-xs tracking-widest uppercase block">
                {t("formBadge")}
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {t("formTitle")}
              </h1>
              <p className="text-slate-200 text-xs mt-0.5 font-light">
                {t("formYearSubtitle")}
              </p>
            </div>
          </div>

          <div className={`hidden sm:block ${isRtl ? "text-left" : "text-right"}`}>
            <span className="text-2xl font-serif font-bold text-[#E8D8A8] block">$180</span>
            <span className="text-[11px] text-slate-300">{t("formPriceLabel")}</span>
          </div>
        </div>

        {/* Step Indicator with accessibility attributes */}
        <nav
          aria-label="Registration steps"
          className="mt-4 sm:mt-6 flex items-center justify-between text-xs font-medium border-t border-slate-700/60 pt-3 sm:pt-4"
        >
          <div
            aria-current={step === 1 ? "step" : undefined}
            className={`flex items-center gap-1.5 sm:gap-2 ${step >= 1 ? "text-[#E8D8A8] font-bold" : "text-slate-400"}`}
          >
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold flex-shrink-0 ${step >= 1 ? "bg-[#E8D8A8] text-[#07142A]" : "bg-slate-800 text-slate-300"}`}>1</span>
            <span className="text-[11px] sm:text-xs whitespace-nowrap">{t("stepLabel1")}</span>
          </div>
          <div className="w-3 sm:w-12 h-0.5 bg-slate-700 flex-shrink-0" aria-hidden="true" />
          <div
            aria-current={step === 2 ? "step" : undefined}
            className={`flex items-center gap-1.5 sm:gap-2 ${step >= 2 ? "text-[#E8D8A8] font-bold" : "text-slate-400"}`}
          >
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold flex-shrink-0 ${step >= 2 ? "bg-[#E8D8A8] text-[#07142A]" : "bg-slate-800 text-slate-300"}`}>2</span>
            <span className="text-[11px] sm:text-xs whitespace-nowrap">{t("stepLabel2")}</span>
          </div>
          <div className="w-3 sm:w-12 h-0.5 bg-slate-700 flex-shrink-0" aria-hidden="true" />
          <div
            aria-current={step === 3 ? "step" : undefined}
            className={`flex items-center gap-1.5 sm:gap-2 ${step >= 3 ? "text-[#E8D8A8] font-bold" : "text-slate-400"}`}
          >
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold flex-shrink-0 ${step >= 3 ? "bg-[#E8D8A8] text-[#07142A]" : "bg-slate-800 text-slate-300"}`}>3</span>
            <span className="text-[11px] sm:text-xs whitespace-nowrap">{t("stepLabel3")}</span>
          </div>
        </nav>
      </div>

      {/* Accessible Live Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="m-4 sm:m-6 p-4 bg-red-950/80 border border-red-500/70 rounded-xl flex items-center gap-3 text-red-100 text-xs shadow-md"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-300" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 sm:space-y-6">
        {step === 1 && (
          <fieldset className="space-y-4">
            <legend className="sr-only">{t("step1Header")}</legend>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#E8D8A8]" aria-hidden="true" />
                {t("step1Header")}
              </h2>
            </div>

            <div>
              <label htmlFor="hebrewName" className="block text-xs font-semibold text-slate-200 mb-1">
                {language === "he" ? "שם השליח (בעברית בלבד)" : "Shliach Full Name (Hebrew only)"}
              </label>
              <input
                id="hebrewName"
                type="text"
                name="hebrewName"
                autoComplete="name"
                dir="rtl"
                value={formData.hebrewName}
                onChange={handleChange}
                placeholder="הרב מנחם מענדל כהן"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs transition-all text-right"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                {language === "he" ? "* את שם השליח יש למלא בעברית בלבד" : "* Please fill the Shliach's name in Hebrew only"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("emailLabel")}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("emailPlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs transition-all"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("phoneLabel")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("phonePlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("countryLabel")}
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs"
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
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("cityLabel")}
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder={t("cityPlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="passportOrId" className="block text-xs font-semibold text-slate-200 mb-1">
                {t("passportLabel")}
              </label>
              <input
                id="passportOrId"
                type="text"
                name="passportOrId"
                value={formData.passportOrId}
                onChange={handleChange}
                placeholder={t("passportPlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs transition-all"
              />
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-4">
            <legend className="sr-only">{t("step2Header")}</legend>
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E8D8A8]" aria-hidden="true" />
                {t("step2Header")}
              </h2>
            </div>

            <div className="p-3 bg-[#E8D8A8]/10 border border-[#E8D8A8]/20 rounded-xl text-xs text-[#E8D8A8] space-y-1">
              <span className="font-bold block">{t("datesNoticeTitle")}</span>
              <p className="text-[11px] text-slate-200">
                {t("datesNoticeText")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <KinusDatePicker
                  id="arrivalDate"
                  name="arrivalDate"
                  label={t("arrivalDateLabel")}
                  value={formData.arrivalDate}
                  onChange={(val) => setFormData(prev => ({ ...prev, arrivalDate: val }))}
                  allowedDates={formSettings?.allowedArrivalDates?.length ? formSettings.allowedArrivalDates : DEFAULT_ARRIVAL_DATES}
                  placeholder={t("dateSelectPlaceholder")}
                  hint={t("dateRangeHint")}
                />
              </div>

              <div>
                <label htmlFor="arrivalTime" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("arrivalTimeLabel")}
                </label>
                <input
                  id="arrivalTime"
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <KinusDatePicker
                  id="departureDate"
                  name="departureDate"
                  label={t("departureDateLabel")}
                  value={formData.departureDate}
                  onChange={(val) => setFormData(prev => ({ ...prev, departureDate: val }))}
                  allowedDates={formSettings?.allowedDepartureDates?.length ? formSettings.allowedDepartureDates : DEFAULT_DEPARTURE_DATES}
                  placeholder={t("dateSelectPlaceholder")}
                  hint={t("dateRangeHint")}
                />
              </div>

              <div>
                <label htmlFor="departureTime" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("departureTimeLabel")}
                </label>
                <input
                  id="departureTime"
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs"
              />
              <p id="roommates-help" className="text-[11px] text-slate-300 mt-1">
                {t("roommatesHelp")}
              </p>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#102444] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:border-[#E8D8A8] text-base sm:text-xs"
              />
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-4">
            <legend className="sr-only">{t("step3Header")}</legend>
            <h2 className="text-base font-bold text-[#E8D8A8] border-b border-slate-700 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#E8D8A8]" aria-hidden="true" />
                {t("step3Header")}
              </span>
              <span className="text-sm font-serif font-bold text-[#E8D8A8]">$180.00 USD</span>
            </h2>

            <div className="bg-[#102444] rounded-xl p-4 border border-slate-800">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-xs">
                <span className="text-slate-200 font-medium">{t("feeSummaryLabel")}</span>
                <span className="font-serif font-bold text-[#E8D8A8] text-base">$180.00 USD</span>
              </div>
              <div className="flex justify-between items-center pt-3 text-[11px] text-slate-300">
                <span />
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  {t("sslSecuredText")}
                </span>
              </div>
            </div>

            {/* Embedded Stripe Elements Card */}
            <div className="border border-slate-700 rounded-xl p-4 bg-[#102444] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold text-white">{t("cardDetailsHeader")}</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  {t("stripeEncryptionText")}
                </span>
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-[11px] text-slate-300 mb-1 font-medium">
                  {t("cardNumberLabel")}
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  value={formData.cardNumber}
                  readOnly
                  placeholder="•••• •••• •••• 4242"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 font-mono text-base sm:text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cardExp" className="block text-[11px] text-slate-300 mb-1 font-medium">
                    {t("cardExpLabel")}
                  </label>
                  <input
                    id="cardExp"
                    type="text"
                    value={formData.cardExp}
                    readOnly
                    placeholder="12/28"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 font-mono text-base sm:text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cardCvc" className="block text-[11px] text-slate-300 mb-1 font-medium">
                    {t("cardCvcLabel")}
                  </label>
                  <input
                    id="cardCvc"
                    type="text"
                    value={formData.cardCvc}
                    readOnly
                    placeholder="CVC"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 font-mono text-base sm:text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-300 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {t("stripeNoticeText")}
              </span>
            </div>
          </fieldset>
        )}

        {/* Buttons Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700 gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-full border border-slate-700 text-slate-200 text-xs font-semibold hover:border-[#E8D8A8] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
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
              className="inline-flex items-center gap-1.5 px-6 sm:px-6 py-3 sm:py-2.5 rounded-full bg-[#E8D8A8] text-[#040D1E] text-xs font-bold hover:bg-white transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1E38]"
            >
              {t("btnNext")}
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> : <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 sm:px-8 py-3 rounded-full bg-[#E8D8A8] text-[#040D1E] text-xs font-bold hover:bg-white transition-all shadow-lg disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1E38]"
            >
              {isSubmitting ? (
                <span>{t("btnSubmitting")}</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  {t("btnSubmit")}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
