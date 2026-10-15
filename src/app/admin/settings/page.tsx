"use client";

import { useState, useEffect } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { useAuth } from "@/lib/context/AuthContext";
import { DEFAULT_ARRIVAL_DATES, DEFAULT_DEPARTURE_DATES } from "@/lib/services/dataService";
import { 
  Settings,
  Sliders, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Save, 
  ExternalLink, 
  Eye, 
  Clock,
  Calendar,
  Globe,
  ShieldCheck,
  Check,
  AlertTriangle,
  Trash2,
  KeyRound,
  X
} from "lucide-react";
import Link from "next/link";

const ALL_POSSIBLE_DATES = [
  { value: "2026-11-03", label: "יום שלישי, כ״ג בחשוון (3 בנובמבר)" },
  { value: "2026-11-04", label: "יום רביעי, כ״ד בחשוון (4 בנובמבר)" },
  { value: "2026-11-05", label: "יום חמישי, כ״ה בחשוון (5 בנובמבר)" },
  { value: "2026-11-06", label: "יום שישי, כ״ו בחשוון (6 בנובמבר)" },
  { value: "2026-11-07", label: "שבת קודש, כ״ז בחשוון (7 בנובמבר)" },
  { value: "2026-11-08", label: "יום ראשון (באנקעט), כ״ח בחשוון (8 בנובמבר)" },
  { value: "2026-11-09", label: "יום שני, כ״ט בחשוון (9 בנובמבר)" },
];

export default function SystemSettingsPage() {
  const { formSettings, actions, isLoaded } = useKinusData();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(true);
  const [closedMessageHe, setClosedMessageHe] = useState("");
  const [closedMessageEn, setClosedMessageEn] = useState("");
  const [allowedArrivalDates, setAllowedArrivalDates] = useState<string[]>([...DEFAULT_ARRIVAL_DATES]);
  const [allowedDepartureDates, setAllowedDepartureDates] = useState<string[]>([...DEFAULT_DEPARTURE_DATES]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Master reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");

  const handleCopyDomain = () => {
    navigator.clipboard.writeText("https://kinusbed.vercel.app/");
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  useEffect(() => {
    if (formSettings) {
      setIsOpen(formSettings.isOpen ?? true);
      setClosedMessageHe(formSettings.closedMessageHe || "");
      setClosedMessageEn(formSettings.closedMessageEn || "");
      const validVals = ALL_POSSIBLE_DATES.map((d) => d.value);
      if (formSettings.allowedArrivalDates?.length) {
        const filtered = formSettings.allowedArrivalDates.filter((d) => validVals.includes(d));
        setAllowedArrivalDates(filtered.length ? filtered : [...DEFAULT_ARRIVAL_DATES]);
      }
      if (formSettings.allowedDepartureDates?.length) {
        const filtered = formSettings.allowedDepartureDates.filter((d) => validVals.includes(d));
        setAllowedDepartureDates(filtered.length ? filtered : [...DEFAULT_DEPARTURE_DATES]);
      }
    }
  }, [formSettings]);

  const handleToggle = async (newVal: boolean) => {
    setIsOpen(newVal);
    try {
      await actions.updateFormSettings({
        isOpen: newVal,
        closedMessageHe,
        closedMessageEn,
        allowedArrivalDates,
        allowedDepartureDates,
        updatedBy: user?.displayName || "מנהל מערכת"
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to toggle form status:", err);
    }
  };

  const toggleArrivalDate = (dateVal: string) => {
    setAllowedArrivalDates(prev => 
      prev.includes(dateVal) ? prev.filter(d => d !== dateVal) : [...prev, dateVal].sort()
    );
  };

  const toggleDepartureDate = (dateVal: string) => {
    setAllowedDepartureDates(prev => 
      prev.includes(dateVal) ? prev.filter(d => d !== dateVal) : [...prev, dateVal].sort()
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await actions.updateFormSettings({
        isOpen,
        closedMessageHe,
        closedMessageEn,
        allowedArrivalDates,
        allowedDepartureDates,
        updatedBy: user?.displayName || "מנהל מערכת"
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save form settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMasterReset = async () => {
    if (passcode.trim() !== "7676") {
      setPasscodeError("קוד שגוי! יש להזין את קוד הניהול המדויק.");
      return;
    }

    setIsResetting(true);
    setPasscodeError("");
    try {
      const res = await actions.resetAllData(passcode.trim());
      if (res.success) {
        setResetSuccessMessage(res.message);
        setShowResetModal(false);
        setPasscode("");
        setTimeout(() => setResetSuccessMessage(""), 5000);
      } else {
        setPasscodeError(res.message);
      }
    } catch (err) {
      console.error("Master reset error:", err);
      setPasscodeError("אירעה שגיאה בעת ביצוע האיפוס");
    } finally {
      setIsResetting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-8 text-center text-slate-500">
        טוען הגדרות מערכת...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-900" />
            הגדרות מערכת ואיפוס נתונים
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            שליטה בזמינות טופס ההרשמה הציבורי, תאריכי שהות, דומיין מורשה וניהול נתוני המערכת
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/register"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            צפה בטופס הציבורי
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Official Domain & Authorized Base URL Card */}
      <div className="bg-gradient-to-r from-blue-900 to-[#102444] rounded-2xl p-6 text-white shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-[#E8D8A8]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#E8D8A8] font-bold uppercase tracking-wider">
                דומיין המערכת הרשמי
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3" />
                דומיין מורשה ב-Firebase & Vercel
              </span>
            </div>
            <div className="text-xl font-mono font-bold text-white mt-1 select-all" dir="ltr">
              https://kinusbed.vercel.app/
            </div>
            <p className="text-xs text-slate-300 mt-1">
              כתובת זו מוגדרת כדומיין מורשה עבור התחברות Google, סליקת Stripe, הודעות דוא&quot;ל וכלל קישורי המערכת.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopyDomain}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-colors"
          >
            {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#E8D8A8]" />}
            <span>{copiedDomain ? "הועתק!" : "העתק כתובת"}</span>
          </button>
          <a
            href="https://kinusbed.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E8D8A8] hover:bg-white text-[#0B1A30] font-bold text-xs transition-colors"
          >
            <span>פתח אתר</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Status Toggle Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              isOpen 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}>
              {isOpen ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">
                  סטטוס טופס ההרשמה:
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isOpen 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}>
                  {isOpen ? "פתוח להרשמה (Active)" : "סגור להרשמה (Closed)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-lg">
                {isOpen 
                  ? "הטופס זמין לכלל השלוחים. שדות הרישום, בחירת התאריכים והסליקה פתוחים כסדרם."
                  : "ההרשמה נעולה. שדות ההזנה מוסתרים ומוצגת הודעה מכובדת עם הפניה ישירה לוואטסאפ."
                }
              </p>
            </div>
          </div>

          {/* Interactive Switch Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              {isOpen ? "פתוח" : "סגור"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isOpen}
              aria-label="החלף סטטוס פתיחה וסגירה של טופס ההרשמה"
              onClick={() => handleToggle(!isOpen)}
              className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                isOpen ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isOpen ? "-translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Allowed Dates Section */}
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-900" />
                קביעת תאריכים מורשים להרשמה (בחירה מבוקרת)
              </h2>
              <span className="text-[11px] text-slate-500 font-normal">
                ברירת מחדל: 4 עד 9 בנובמבר 2026 (כ״ד – כ״ט בחשוון)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Arrival Dates */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>תאריכי הגעה מורשים:</span>
                  <span className="text-[10px] text-blue-800 font-normal">{allowedArrivalDates.length} תאריכים נבחרו</span>
                </h3>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {ALL_POSSIBLE_DATES.map((d) => {
                    const isChecked = allowedArrivalDates.includes(d.value);
                    return (
                      <label
                        key={`arr-${d.value}`}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? "bg-blue-100/70 text-blue-900 font-semibold" : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleArrivalDate(d.value)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-[11px]">{d.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Departure Dates */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>תאריכי עזיבה מורשים:</span>
                  <span className="text-[10px] text-blue-800 font-normal">{allowedDepartureDates.length} תאריכים נבחרו</span>
                </h3>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {ALL_POSSIBLE_DATES.map((d) => {
                    const isChecked = allowedDepartureDates.includes(d.value);
                    return (
                      <label
                        key={`dep-${d.value}`}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? "bg-blue-100/70 text-blue-900 font-semibold" : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDepartureDate(d.value)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-[11px]">{d.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Closed Messages */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 pb-1">
              הודעות מותאמות בעת סגירת הטופס (אופציונלי)
            </h2>
            <p className="text-xs text-slate-500">
              אם תשאירו שדות אלה ריקים, המערכת תציג את הודעות ברירת המחדל הרשמיות של הכינוס בעברית ובאנגלית.
            </p>

            <div>
              <label htmlFor="closedMessageHe" className="block text-xs font-bold text-slate-700 mb-1">
                הודעת סגירה בעברית:
              </label>
              <textarea
                id="closedMessageHe"
                value={closedMessageHe}
                onChange={(e) => setClosedMessageHe(e.target.value)}
                rows={3}
                placeholder="ההרשמה המקוונת לדירות ואירוח בכינוס השלוחים סגורה כעת לקבלת פניות חדשות. במידה ודרוש מענה דחוף או סיוע אישי, ניתן לפנות ישירות למוקד הלינה בוואטסאפ."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-slate-400"
              />
            </div>

            <div>
              <label htmlFor="closedMessageEn" className="block text-xs font-bold text-slate-700 mb-1 text-left" dir="ltr">
                English Closed Message:
              </label>
              <textarea
                id="closedMessageEn"
                dir="ltr"
                value={closedMessageEn}
                onChange={(e) => setClosedMessageEn(e.target.value)}
                rows={3}
                placeholder="Online housing registration for the International Kinus HaShluchim is currently closed for new applications. If you require urgent assistance or personal coordination, please reach out to our team directly via WhatsApp."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-slate-400 text-left font-sans"
              />
            </div>
          </div>

          {/* Meta Info */}
          {formSettings?.updatedAt && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <Clock className="w-3.5 h-3.5" />
              <span>
                עודכן לאחרונה: {new Date(formSettings.updatedAt).toLocaleString("he-IL")}
                {formSettings.updatedBy && ` על ידי ${formSettings.updatedBy}`}
              </span>
            </div>
          )}

          {/* Submit & Feedback */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {saveSuccess ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                ההגדרות נשמרו בהצלחה!
              </div>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "שומר שינויים..." : "שמור הגדרות"}
            </button>
          </div>
        </form>
      </div>

      {/* Reset Success Banner */}
      {resetSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 font-bold text-sm shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}

      {/* Danger Zone: Reset and Wipe All Data */}
      <div className="bg-red-50/60 border border-red-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-950">
                אזור סכנה: מחיקה ואיפוס כל הנתונים (System Reset)
              </h2>
              <p className="text-xs text-red-700 mt-1 max-w-2xl leading-relaxed">
                פעולה זו תמחק לצמיתות את כל נתוני הנרשמים והשלוחים במערכת, תאפס את כל המיטות לזמינות מלאה, ותנקה את פניות הציבור ולוגי המיילים. לא ניתן לבטל פעולה זו לאחר ביצועה!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowResetModal(true);
              setPasscode("");
              setPasscodeError("");
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            מחק ואפס את כל הנתונים
          </button>
        </div>
      </div>

      {/* Confirmation & Security Code Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                אישור מחיקה ואיפוס כל הנתונים
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isResetting) setShowResetModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                הנך עומד לבצע <strong className="text-red-700 font-black">איפוס מוחלט של כלל הנתונים</strong> במערכת:
              </p>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <li>מחיקת כל השלוחים והאורחים הרשומים</li>
                <li>איפוס ושחרור כל המיטות והדירות לסטטוס פנוי</li>
                <li>מחיקת פניות הציבור ולוגי הודעות הדוא״ל</li>
              </ul>
              
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-900" />
                  הזן קוד ניהול לאימות המחיקה:
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (passcodeError) setPasscodeError("");
                  }}
                  placeholder="הזן קוד ניהול (4 ספרות)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center font-mono font-bold focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {passcodeError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={isResetting || !passcode}
                onClick={handleMasterReset}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-40"
              >
                {isResetting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    מאפס נתונים...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    אשר ומחק הכל לצמיתות
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
