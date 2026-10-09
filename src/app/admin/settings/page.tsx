"use client";

import { useState, useEffect } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { useAuth } from "@/lib/context/AuthContext";
import { DEFAULT_ARRIVAL_DATES, DEFAULT_DEPARTURE_DATES } from "@/lib/services/dataService";
import { 
  Sliders, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Save, 
  ExternalLink, 
  Eye, 
  Clock,
  Calendar
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
  { value: "2026-11-10", label: "יום שלישי, ל׳ בחשוון (10 בנובמבר)" },
];

export default function FormSettingsPage() {
  const { formSettings, actions, isLoaded } = useKinusData();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(true);
  const [closedMessageHe, setClosedMessageHe] = useState("");
  const [closedMessageEn, setClosedMessageEn] = useState("");
  const [allowedArrivalDates, setAllowedArrivalDates] = useState<string[]>([...DEFAULT_ARRIVAL_DATES]);
  const [allowedDepartureDates, setAllowedDepartureDates] = useState<string[]>([...DEFAULT_DEPARTURE_DATES]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (formSettings) {
      setIsOpen(formSettings.isOpen ?? true);
      setClosedMessageHe(formSettings.closedMessageHe || "");
      setClosedMessageEn(formSettings.closedMessageEn || "");
      if (formSettings.allowedArrivalDates?.length) {
        setAllowedArrivalDates(formSettings.allowedArrivalDates);
      }
      if (formSettings.allowedDepartureDates?.length) {
        setAllowedDepartureDates(formSettings.allowedDepartureDates);
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

  if (!isLoaded) {
    return (
      <div className="p-8 text-center text-slate-500">
        טוען הגדרות טופס...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-blue-900" />
            הגדרות טופס הרשמה ותאריכים
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            שליטה בזמינות טופס ההרשמה הציבורי, פתיחה או נעילת ההרשמה וקביעת טווח תאריכי השהות המורשים
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
    </div>
  );
}
