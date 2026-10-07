"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Shield, Sparkles, LogIn, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                770
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                  כינוס השלוחים העולמי
                </span>
                <span className="text-xs text-blue-900 font-medium">
                  מחלקת אירוח ולינה
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-slate-700 hover:text-blue-900 px-3 py-2 rounded-lg transition-colors"
            >
              טופס הרשמה
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-800 shadow-sm transition-all"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  ממשק ניהול
                </Link>
                <button
                  onClick={() => logout()}
                  title="התנתק"
                  className="p-2 text-slate-500 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                כניסת צוות
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
