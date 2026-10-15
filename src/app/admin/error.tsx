"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard route error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="bg-white border border-red-200 shadow-sm rounded-2xl p-8 max-w-md w-full space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-slate-900">
          אירעה שגיאה בטעינת העמוד
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed">
          המערכת נתקלה בשגיאה בעת טעינת נתוני העמוד. ניתן לנסות לטעון שוב או לחזור ללוח הבקרה.
        </p>

        {error?.message && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 text-left overflow-x-auto" dir="ltr">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            נסה לטעון שוב
          </button>

          <Link
            href="/admin"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            חזרה ללוח הבקרה
          </Link>
        </div>
      </div>
    </div>
  );
}
