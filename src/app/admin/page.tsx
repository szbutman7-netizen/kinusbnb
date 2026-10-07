"use client";

import Link from "next/link";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { 
  Users, 
  CreditCard, 
  Layers, 
  CheckCircle, 
  Building2, 
  Bed, 
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  QrCode
} from "lucide-react";

export default function AdminDashboardPage() {
  const { stats, shluchim, apartments, isLoaded } = useKinusData();

  if (!isLoaded || !stats) {
    return <div className="p-8 text-center text-slate-500">טוען מדדים ונתונים...</div>;
  }

  const statCards = [
    { title: "סה״כ נרשמים", value: stats.totalRegistered, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "שילמו ב-Stripe", value: stats.totalPaid, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "שובצו לדירות", value: stats.totalPlaced, icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "נקלטו בקבלה", value: stats.totalCheckedIn, icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "סה״כ דירות", value: stats.totalApartments, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "מיטות פנויות", value: stats.availableBeds, icon: Bed, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "אורחים חסומים", value: stats.blockedGuests, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            לוח בקרה וחדר פיקוד – כינוס השלוחים תשפ״ז
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            מעקב בזמן אמת אחר קליטה, רישום, סליקה, ומלאי הדירות והמיטות
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/reception"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            פתח עמדת קבלה מהירה
          </Link>
          <Link
            href="/admin/placement"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs"
          >
            <Layers className="w-4 h-4" />
            עבור למסך שיבוץ
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Registrations & Active Apartments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Guests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-900" />
              נרשמים אחרונים
            </h2>
            <Link
              href="/admin/shluchim"
              className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
            >
              לכל הנרשמים
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {shluchim.slice(0, 5).map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    {s.hebrewName || `${s.firstName} ${s.lastName}`}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {s.city}, {s.country}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.paymentStatus === "PAID" ? "שולם" : "ממתין לתשלום"}
                  </span>

                  {s.checkedIn ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      נקלט
                    </span>
                  ) : s.bedId ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      משובץ
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      לא שובץ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apartments Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-900" />
              מצב דירות ותפוסה
            </h2>
            <Link
              href="/admin/apartments"
              className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1"
            >
              לניהול דירות
              <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {apartments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{apt.apartmentNumber}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                    {apt.address}
                  </div>
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-900 text-sm">
                    {apt.totalBeds}
                  </span>
                  <span className="text-[10px] text-slate-500 block">מיטות בדירה</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
