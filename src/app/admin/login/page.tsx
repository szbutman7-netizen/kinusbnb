"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Shield, Sparkles, LogIn, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { APP_VERSION } from "@/version";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginAsDemoUser, user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);

    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.message);
    }
  };

  const handleDemoLogin = (role: "SUPER_ADMIN" | "HOUSING_MANAGER" | "RECEPTION_STAFF") => {
    loginAsDemoUser(role);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12" dir="rtl">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-amber-300 flex items-center justify-center font-black text-2xl mx-auto shadow-lg mb-4">
            770
          </div>
          <h2 className="text-2xl font-black text-white">
            כניסת צוות וניהול הכינוס
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            גישה מאובטחת למורשים בלבד (Google Workspace Whitelist)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-950/80 border border-red-800 rounded-xl flex items-start gap-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all shadow-md disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading ? "מתחבר..." : "התחברות באמצעות חשבון Google"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-800 text-slate-400">
                או התחברות מהירה לפי תפקיד לבדיקה:
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleDemoLogin("SUPER_ADMIN")}
              className="w-full py-2.5 px-3 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                מנהל על (SUPER ADMIN)
              </span>
              <span className="text-[11px] text-slate-400">כל ההרשאות</span>
            </button>

            <button
              onClick={() => handleDemoLogin("HOUSING_MANAGER")}
              className="w-full py-2.5 px-3 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                מנהל שיבוץ ודירות (HOUSING)
              </span>
              <span className="text-[11px] text-slate-400">דירות, נרשמים, שיבוץ</span>
            </button>

            <button
              onClick={() => handleDemoLogin("RECEPTION_STAFF")}
              className="w-full py-2.5 px-3 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                דייל עמדת קבלה (RECEPTION)
              </span>
              <span className="text-[11px] text-slate-400">קבלה וצ'ק-אין בלבד</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 space-y-2">
          <a href="/" className="text-xs text-blue-400 hover:underline block">
            חזרה לדף הראשי
          </a>
          <span className="text-[10px] text-slate-500 font-mono block">
            מערכת ניהול {APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
}
