import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { KinusLogo } from "@/components/common/KinusLogo";
import { Building2, ShieldCheck, HeartHandshake, MapPin, Calendar, Clock, ArrowLeft } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#040D1E] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#040D1E]">
      <Navbar />

      <main className="flex-1">
        {/* Cinematic Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32 border-b border-[#E8D8A8]/15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0D2343] via-[#07142A] to-[#040D1E]">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E8D8A8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Traditional B"H */}
            <div className="text-right text-xs text-[#E8D8A8]/70 tracking-widest font-serif mb-6">
              ב״ה
            </div>

            {/* Official Kinus Emblem */}
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-full bg-[#E8D8A8]/5 border border-[#E8D8A8]/20 shadow-[0_0_30px_rgba(232,216,168,0.1)]">
                <KinusLogo size={88} color="#E8D8A8" />
              </div>
            </div>

            {/* Subtitle / Date */}
            <div className="text-xs sm:text-sm font-medium tracking-[0.25em] text-[#E8D8A8] uppercase mb-4">
              כ״ד – כ״ט בחשוון תשפ״ז • ברוקלין, ניו יורק
            </div>

            {/* Main Header */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white leading-tight sm:leading-tight">
              כינוס השלוחים העולמי
            </h1>

            <p className="text-lg sm:text-2xl text-slate-300 font-light mt-3 mb-4">
              מערך אירוח ולינה לשלוחי כ״ק אדמו״ר נשיא דורנו
            </p>

            <div className="w-24 h-0.5 bg-[#E8D8A8]/40 mx-auto my-6" />

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              ברוכים הבאים למערכת הרישום והסדרת הלינה לקראת ימי הכינוס הקדושים.
              דירות אירוח מרווחות ומסודרות בשכונת קראון הייטס בסמיכות לבית חיינו – 770.
            </p>

            {/* Official Call To Action Button (Pill Button in Kinus Gold style) */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border border-[#E8D8A8] bg-[#E8D8A8] text-[#040D1E] font-bold text-sm tracking-wide shadow-lg hover:bg-transparent hover:text-[#E8D8A8] transition-all transform hover:-translate-y-0.5"
              >
                <span>להרשמה והסדרת מקום לינה</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <a
                href="#details"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-slate-700 text-slate-300 text-sm font-medium hover:border-[#E8D8A8]/50 hover:text-white transition-all"
              >
                פרטי האירוח והסדרי הגעה
              </a>
            </div>

            {/* Fee badge */}
            <div className="mt-8 text-xs text-[#E8D8A8]/80 font-medium tracking-wide">
              דמי השתתפות: <span className="font-bold text-white">$180</span> לכל ימי הכינוס (כולל מצעים, מגבות ומפתח לדירה)
            </div>
          </div>
        </section>

        {/* Accommodation Pillars Section */}
        <section id="details" className="py-16 sm:py-24 bg-[#07142A]/80 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-[#E8D8A8] tracking-[0.2em] uppercase block mb-2">
                הסדרי האירוח
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-white">
                אירוח בכבוד הראוי לשלוחי המלך
              </h2>
              <div className="w-12 h-0.5 bg-[#E8D8A8]/40 mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-[#0B1E38]/50 border border-slate-800 hover:border-[#E8D8A8]/30 transition-all text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  בסמיכות ל-770
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  דירות האירוח ממוקמות ברחבי שכונת קראון הייטס (איסטרן פארקווי, קינגסטון, מונטגומרי ועוד), במרחק הליכה קצר מ-770.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-[#0B1E38]/50 border border-slate-800 hover:border-[#E8D8A8]/30 transition-all text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/20">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  תיאום שותפים לחדר
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  באפשרותכם לציין בטופס ההרשמה שמות שלוחים שתרצו ללון עימם, וצוות השיבוץ יעשה מאמץ לשבץ אתכם יחד.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-[#0B1E38]/50 border border-slate-800 hover:border-[#E8D8A8]/30 transition-all text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  סליקה מאובטחת
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  תשלום מובנה ומוצפן באמצעות Stripe ברמת אבטחה בנקאית (PCI-DSS), עם אישור הרשמה מיידי הנשלח לדוא״ל.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs and Practical Details */}
        <section className="py-16 sm:py-20 bg-[#040D1E]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-serif text-white">
                מידע חשוב לקראת ההגעה
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#07142A] border border-slate-800">
                <h4 className="font-bold text-sm text-[#E8D8A8] mb-1">
                  מתי ניתן להגיע ולקבל את מפתח הדירה?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  עמדת הקבלה תיפתח ביום רביעי, כ״ד בחשוון. בהגעתכם יש לגשת לעמדת הקבלה ולהזדהות בשמכם לקבלת המפתח ופרטי החדר.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#07142A] border border-slate-800">
                <h4 className="font-bold text-sm text-[#E8D8A8] mb-1">
                  מה כולל האירוח בדירה?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  האירוח כולל מיטה מוצעת עם מצעים נקיים, כרית, שמיכה ומגבת. הדירות מצוידות בחימום/מיזוג, מים חמים וקוד כניסה מסודר.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#07142A] border border-slate-800">
                <h4 className="font-bold text-sm text-[#E8D8A8] mb-1">
                  עד מתי ניתן להישאר בדירה?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  הפינוי מתבצע ביום שני, כ״ט בחשוון, לאחר הבאנקעט המרכזי של כינוס השלוחים.
                </p>
              </div>
            </div>

            {/* Bottom Register CTA Card */}
            <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[#07142A] via-[#0D2343] to-[#07142A] border border-[#E8D8A8]/30 text-center space-y-4">
              <h3 className="text-xl sm:text-2xl font-serif text-white">
                הבטיחו את מקומכם בימי הכינוס
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light">
                מספר המיטות מוגבל. אנא הקדימו להירשם בהקדם כדי לאפשר לצוות השיבוץ להיערך בצורה המיטבית.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#E8D8A8] text-[#040D1E] font-bold text-sm hover:bg-white transition-all shadow-md"
                >
                  מעבר לטופס הרשמה מקוון
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Official Clean Footer (No admin links) */}
      <footer className="border-t border-slate-800 bg-[#020813] py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KinusLogo size={24} color="#E8D8A8" />
            <span className="text-slate-300 font-medium">כינוס השלוחים העולמי תשפ״ז</span>
          </div>
          <div className="text-slate-400">
            מחלקת אירוח ולינה • 770 Eastern Parkway, Brooklyn, NY
          </div>
        </div>
      </footer>
    </div>
  );
}
