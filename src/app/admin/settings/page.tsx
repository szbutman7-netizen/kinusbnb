"use client";

import { useState, useEffect } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  Sliders, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Save, 
  ExternalLink, 
  AlertCircle,
  Eye,
  MessageCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function FormSettingsPage() {
  const { formSettings, actions, isLoaded } = useKinusData();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(true);
  const [closedMessageHe, setClosedMessageHe] = useState("");
  const [closedMessageEn, setClosedMessageEn] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (formSettings) {
      setIsOpen(formSettings.isOpen ?? true);
      setClosedMessageHe(formSettings.closedMessageHe || "");
      setClosedMessageEn(formSettings.closedMessageEn || "");
    }
  }, [formSettings]);

  const handleToggle = async (newVal: boolean) => {
    setIsOpen(newVal);
    try {
      await actions.updateFormSettings({
        isOpen: newVal,
        closedMessageHe,
        closedMessageEn,
        updatedBy: user?.displayName || "מנהל מערכת"
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to toggle form status:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await actions.updateFormSettings({
        isOpen,
        closedMessageHe,
        closedMessageEn,
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
            הגדרות טופס הרשמה
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            שליטה בזמינות טופס ההרשמה הציבורי, פתיחה או נעילת ההרשמה והתאמת הודעות מערכת
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
                  ? "הטופס זמין לכלל השלוחים. שדות הרישום, בחירת התאריכים והסליקה ב-Stripe פתוחים כסדרם."
                  : "ההרשמה נעולה. שדות ההזנה מוסתרים מהמשתמשים ומוצגת הודעה מכובדת בשתי השפות עם הפניה לוואטסאפ."
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

        {/* Message Settings Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              הודעות מותאמות בעת סגירת הטופס (אופציונלי)
            </h2>
            <p className="text-xs text-slate-500">
              אם תשאירו שדות אלה ריקים, המערכת תציג את הודעות ברירת המחדל הרשמיות של הכינוס בעברית ובאנגלית.
            </p>

            {/* Hebrew message */}
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

            {/* English message */}
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

      {/* Live Preview Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            תצוגה מקדימה: כיצד השלוחים יראו את העמוד כעת
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
            isOpen ? "bg-emerald-900/80 text-emerald-300 border border-emerald-700" : "bg-rose-900/80 text-rose-300 border border-rose-700"
          }`}>
            {isOpen ? "טופס הרשמה פעיל" : "מסך הרשמה סגורה"}
          </span>
        </div>

        {isOpen ? (
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white">הטופס פתוח באופן מלא:</p>
            <p>שלוחים המגיעים לכתובת <code>/register</code> יראו את כל 3 שלבי הרישום (פרטים אישיים, תאריכי הגעה, סליקת Stripe) ויוכלו לבצע הרשמה ותשלום כרגיל.</p>
          </div>
        ) : (
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Lock className="w-4 h-4" />
              ההרשמה נעולה כעת:
            </div>
            <p>
              שלוחים המגיעים לכתובת <code>/register</code> יקבלו את כרטיס ההודעה המעוצב ללא שדות הזנה, עם כפתור פנייה ייעודי ישיר למוקד הלינה בוואטסאפ: <strong>13474542013+</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
