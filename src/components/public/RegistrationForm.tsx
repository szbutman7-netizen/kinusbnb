"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dataStore } from "@/lib/services/dataService";
import { Shliach } from "@/types";
import { KinusLogo } from "@/components/common/KinusLogo";
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

export function RegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    hebrewName: "",
    email: "",
    phone: "",
    country: "ישראל",
    city: "",
    passportOrId: "",
    arrivalDate: "2026-11-18",
    arrivalTime: "12:00",
    departureDate: "2026-11-23",
    departureTime: "12:00",
    preferredRoommates: "",
    specialRequests: "",
    cardNumber: "4242 •••• •••• 4242",
    cardExp: "12/28",
    cardCvc: "770",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextStep = () => {
    setErrorMessage("");
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.city) {
        setErrorMessage("נא למלא את כל שדות החובה המסומנים בכוכבית (*)");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.arrivalDate || !formData.departureDate) {
        setErrorMessage("נא לציין תאריכי הגעה ועזיבה");
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
      const newShliach: Shliach = {
        id: shliachId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        hebrewName: formData.hebrewName.trim() || `${formData.firstName} ${formData.lastName}`,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        country: formData.country,
        city: formData.city.trim(),
        passportOrId: formData.passportOrId.trim(),
        arrivalDate: formData.arrivalDate,
        arrivalTime: formData.arrivalTime,
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
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

      // Attempt sending confirmation email via relay in background
      try {
        await fetch("/api/email-relay/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: newShliach.email,
            subject: "אישור הרשמה לכינוס השלוחים תשפ״ז",
            htmlBody: `<h3>שלום עליכם כבוד הרב ${newShliach.hebrewName},</h3><p>הרשמתכם ללינה בכינוס השלוחים נקלטה בהצלחה!</p><p>מספר רישום: ${newShliach.id}</p><p>תאריכים: ${newShliach.arrivalDate} עד ${newShliach.departureDate}</p>`
          })
        });
      } catch (err) {
        console.warn("Email relay background notice:", err);
      }

      router.push(`/success?id=${shliachId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "אירעה שגיאה בעת ההרשמה, אנא נסו שוב.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0B1E38] rounded-2xl shadow-2xl border border-[#E8D8A8]/20 overflow-hidden max-w-2xl mx-auto">
      {/* Header Banner in authentic Kinus styling */}
      <div className="bg-gradient-to-b from-[#07142A] to-[#0D2343] p-6 sm:p-8 border-b border-[#E8D8A8]/20 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <KinusLogo size={52} color="#E8D8A8" />
            <div>
              <span className="text-[#E8D8A8] font-medium text-xs tracking-widest uppercase block">
                טופס הרשמה רשמי
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                אירוח ולינה בכינוס השלוחים
              </h1>
              <p className="text-slate-300 text-xs mt-0.5 font-light">
                שנת הקהל תשפ״ז • ברוקלין, ניו יורק
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-left">
            <span className="text-2xl font-serif font-bold text-[#E8D8A8] block">$180</span>
            <span className="text-[11px] text-slate-400">לכל ימי הכינוס</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 flex items-center justify-between text-xs font-medium border-t border-slate-700/60 pt-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#E8D8A8] font-bold" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-[#E8D8A8] text-[#07142A]" : "bg-slate-800 text-slate-400"}`}>1</span>
            פרטי השליח
          </div>
          <div className="w-12 h-0.5 bg-slate-700" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#E8D8A8] font-bold" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-[#E8D8A8] text-[#07142A]" : "bg-slate-800 text-slate-400"}`}>2</span>
            הגעה ושותפים
          </div>
          <div className="w-12 h-0.5 bg-slate-700" />
          <div className={`flex items-center gap-2 ${step >= 3 ? "text-[#E8D8A8] font-bold" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-[#E8D8A8] text-[#07142A]" : "bg-slate-800 text-slate-400"}`}>3</span>
            סליקה ואישור
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="m-6 p-4 bg-red-950/60 border border-red-700/60 rounded-xl flex items-center gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E8D8A8]" />
              פרטים אישיים ומקום השליחות
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  שם פרטי (באנגלית) *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Menachem M."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  שם משפחה (באנגלית) *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Schneerson"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שם מלא בעברית
              </label>
              <input
                type="text"
                name="hebrewName"
                value={formData.hebrewName}
                onChange={handleChange}
                placeholder="הרב מנחם מענדל שניאורסאהן"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  דוא״ל לקבלת אישור ופרטי הדירה *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rabbi@chabad.org"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  מספר טלפון נייד (וואטסאפ) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-718-555-0123"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ארץ השליחות *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs"
                >
                  <option value="ישראל">ישראל</option>
                  <option value="ארה״ב">ארה״ב (USA)</option>
                  <option value="צרפת">צרפת (France)</option>
                  <option value="רוסיה">רוסיה (Russia)</option>
                  <option value="אוקראינה">אוקראינה (Ukraine)</option>
                  <option value="ארגנטינה">ארגנטינה (Argentina)</option>
                  <option value="בריטניה">בריטניה (UK)</option>
                  <option value="גרמניה">גרמניה (Germany)</option>
                  <option value="אוסטרליה">אוסטרליה (Australia)</option>
                  <option value="אחר">ארץ אחרת</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  עיר השליחות *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="פריז / מוסקבה / ירושלים"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                מספר דרכון או תעודת זהות (לזיהוי בעמדת הקבלה)
              </label>
              <input
                type="text"
                name="passportOrId"
                value={formData.passportOrId}
                onChange={handleChange}
                placeholder="038291029"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs transition-all"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E8D8A8]" />
              זמני שהות ובקשות מיוחדות
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  תאריך הגעה משוער *
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  שעת הגעה משוערת
                </label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  תאריך עזיבה משוער *
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  שעת עזיבה משוערת
                </label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                שותפים מבוקשים לחדר (אם ישנם שלוחים שתרצו ללון עימם)
              </label>
              <input
                type="text"
                name="preferredRoommates"
                value={formData.preferredRoommates}
                onChange={handleChange}
                placeholder="לדוגמה: הרב לוי סגל, הרב יוסף כהן"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                צוות השיבוץ יעשה מאמץ מרבי לשבץ אתכם יחד בהתאם למלאי הדירות.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                בקשות מיוחדות / צרכי נגישות
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={3}
                placeholder="קומה נמוכה, מעלית, צרכים מיוחדים וכו'"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#07142A] text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E8D8A8] focus:border-[#E8D8A8] outline-none text-xs"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#E8D8A8]" />
              תשלום מאובטח באמצעות Stripe
            </h2>

            <div className="bg-[#07142A] rounded-xl p-4 border border-slate-800">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-xs">
                <span className="text-slate-300">דמי השתתפות באירוח ולינה:</span>
                <span className="font-serif font-bold text-[#E8D8A8] text-base">$180.00 USD</span>
              </div>
              <div className="flex justify-between items-center pt-3 text-[11px] text-slate-400">
                <span>כולל מיטה מוצעת, מגבות ומפתח לדירה</span>
                <span className="text-emerald-400 font-bold">סליקה מאובטחת SSL</span>
              </div>
            </div>

            {/* Embedded Stripe Elements Card */}
            <div className="border border-slate-700 rounded-xl p-4 bg-[#07142A] space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">פרטי כרטיס אשראי</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Stripe 256-bit Encryption
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">מספר כרטיס</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">תוקף (MM/YY)</label>
                  <input
                    type="text"
                    value={formData.cardExp}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">CVC / קוד אבטחה</label>
                  <input
                    type="text"
                    value={formData.cardCvc}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                התשלום מועבר ישירות באמצעות Stripe ואינו נשמר בשרתי האתר. אישור תשלום יישלח מיד לדוא״ל שלך.
              </span>
            </div>
          </div>
        )}

        {/* Buttons Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 text-slate-300 text-xs font-semibold hover:border-slate-500 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              חזור
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#E8D8A8] text-[#040D1E] text-xs font-bold hover:bg-white transition-all shadow-md"
            >
              המשך
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#E8D8A8] text-[#040D1E] text-xs font-bold hover:bg-white transition-all shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>מעבד תשלום...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  בצע תשלום ואשר הרשמה ($180)
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
