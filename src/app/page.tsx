import { Navbar } from "@/components/layout/Navbar";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import { Sparkles, Building2, ShieldCheck, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
            ברוכים הבאים לכינוס השלוחים העולמי תשפ״ז
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            הסדרי לינה ואירוח לשלוחים
          </h1>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            מערכת הרישום והשיבוץ המרכזית לדירות האירוח בסמיכות לבית חיינו – 770.
            אנא השלימו את ההרשמה להבטחת מקומכם.
          </p>
        </div>

        {/* The Registration Card */}
        <RegistrationForm />

        {/* Features Underneath */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <Building2 className="w-8 h-8 text-blue-900 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">דירות אירוח מסודרות</h3>
            <p className="text-xs text-slate-500 mt-1">
              עשרות דירות מרווחות ומאובזרות בשכונת קראון הייטס בקרבת 770
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">סליקה מאובטחת</h3>
            <p className="text-xs text-slate-500 mt-1">
              תשלום מוצפן ומהיר באמצעות Stripe עם אישור מיידי לדוא״ל
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <Clock className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">קליטה מהירה</h3>
            <p className="text-xs text-slate-500 mt-1">
              איתור מהיר בעמדת הקבלה וקבלת מפתח ופרטי הדירה תוך שניות
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © כינוס השלוחים העולמי – מחלקת אירוח ולינה | שנת תשפ״ז
      </footer>
    </div>
  );
}
