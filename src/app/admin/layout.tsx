"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  Building2, 
  Users, 
  Layers, 
  CheckSquare, 
  Mail, 
  UserCheck, 
  LogOut, 
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
  Sliders,
  MessageSquare,
  History,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import { KinusLogo } from "@/components/common/KinusLogo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout, hasAccess } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, isLoading, pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        טוען נתוני אבטחה והרשאות...
      </div>
    );
  }

  const navItems = [
    { label: "לוח בקרה", href: "/admin", icon: LayoutDashboard, access: true },
    { label: "הגדרות מערכת", href: "/admin/settings", icon: Sliders, access: user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "HOUSING_MANAGER" },
    { label: "פניות הציבור", href: "/admin/messages", icon: MessageSquare, access: true },
    { label: "דירות ומיטות", href: "/admin/apartments", icon: Building2, access: hasAccess("apartments") },
    { label: "מאגר נרשמים", href: "/admin/shluchim", icon: Users, access: hasAccess("shluchim") },
    { label: "ניהול חיובים", href: "/admin/payments", icon: CreditCard, access: user.role === "SUPER_ADMIN" || user.role === "ADMIN" || hasAccess("payments") || hasAccess("shluchim") },
    { label: "מסך שיבוץ", href: "/admin/placement", icon: Layers, access: hasAccess("placement") },
    { label: "עמדת קבלה", href: "/admin/reception", icon: CheckSquare, access: hasAccess("reception") },
    { label: "שליחת מיילים", href: "/admin/emails", icon: Mail, access: hasAccess("emails") },
    { label: "ניהול משתמשים", href: "/admin/users", icon: UserCheck, access: hasAccess("users") },
    { label: "יומן שינויים", href: "/admin/audit", icon: History, access: user.role === "SUPER_ADMIN" || hasAccess("audit") },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100" dir="rtl">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 text-white border-l border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <KinusLogo size={40} variant="emblem" className="shrink-0" />
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white">
              כינוס השלוחים
            </h1>
            <span className="text-[11px] text-amber-400 font-semibold block">
              חדר פיקוד וניהול לינה
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="text-xs font-semibold text-slate-200">
            {user.displayName}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {user.email}
          </div>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/80 text-blue-300 border border-blue-700">
            {user.role}
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            if (!item.access) return null;
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center w-full py-2 px-3 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            פתח טופס הרשמה ציבורי ↗
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs text-red-400 hover:bg-red-950/40 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            התנתק מהמערכת
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <KinusLogo size={32} variant="emblem" className="shrink-0" />
          <span className="font-bold text-sm">כינוס השלוחים - ניהול</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white p-4 border-b border-slate-800 space-y-2">
          <div className="text-xs text-slate-300 mb-2 font-medium">
            מחובר כ: {user.displayName} ({user.role})
          </div>
          {navItems.map((item) => {
            if (!item.access) return null;
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                  isActive ? "bg-blue-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 w-full text-xs text-red-400 pt-3 border-t border-slate-800"
          >
            <LogOut className="w-4 h-4" />
            התנתק מהמערכת
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
