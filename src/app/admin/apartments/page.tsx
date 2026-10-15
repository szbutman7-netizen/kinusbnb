"use client";

import { useState } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { Apartment, Bed } from "@/types";
import { 
  Building2, 
  Plus, 
  Bed as BedIcon, 
  MapPin, 
  Navigation, 
  Key, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Users
} from "lucide-react";

export default function ApartmentsPage() {
  const { apartments, beds, shluchim, actions, isLoaded } = useKinusData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [closingApt, setClosingApt] = useState<Apartment | null>(null);

  // Form State
  const [formNumber, setFormNumber] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formWaze, setFormWaze] = useState("");
  const [formEntryCode, setFormEntryCode] = useState("");
  const [formFloor, setFormFloor] = useState("");
  const [formTotalBeds, setFormTotalBeds] = useState(6);
  const [formManagerName, setFormManagerName] = useState("");
  const [formManagerPhone, setFormManagerPhone] = useState("");
  const [formScheduledClosure, setFormScheduledClosure] = useState("2026-11-24");

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען נתוני דירות ומיטות...</div>;
  }

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || !formAddress || formTotalBeds < 1) return;

    await actions.addApartmentWithBeds(
      {
        apartmentNumber: formNumber,
        address: formAddress,
        wazeUrl: formWaze || undefined,
        entryCode: formEntryCode || undefined,
        floor: formFloor || undefined,
        totalBeds: formTotalBeds,
        managerName: formManagerName || undefined,
        managerPhone: formManagerPhone || undefined,
        scheduledClosureDate: formScheduledClosure,
        status: "ACTIVE",
      },
      formTotalBeds
    );

    // Reset & close
    setFormNumber("");
    setFormAddress("");
    setFormWaze("");
    setFormEntryCode("");
    setFormFloor("");
    setFormTotalBeds(6);
    setFormManagerName("");
    setFormManagerPhone("");
    setShowAddModal(false);
  };

  const handleDeconstruct = async (apartmentId: string) => {
    if (confirm("האם לפנות את כל השלוחים המשובצים בדירה זו ולסגור אותה?")) {
      const aptBeds = beds.filter(b => b.apartmentId === apartmentId);
      for (const b of aptBeds) {
        if (b.currentShliachId) {
          await actions.unassignPlacement(b.currentShliachId);
        }
      }
      await actions.updateApartment(apartmentId, { status: "CLOSED" });
      setClosingApt(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-900" />
            ניהול דירות ומלאי מיטות
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            הגדרת דירות, יצירת מיטות אוטומטית ב-Batch, מעקב תפוסה ומצב סגירת דירות
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          הוסף דירה חדשה
        </button>
      </div>

      {/* Apartments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {apartments.map((apt) => {
          const aptBeds = beds.filter((b) => b.apartmentId === apt.id);
          const assignedCount = aptBeds.filter((b) => b.status === "ASSIGNED").length;
          const reservedCount = aptBeds.filter((b) => b.status === "RESERVED").length;
          const availableCount = aptBeds.filter((b) => b.status === "AVAILABLE").length;

          return (
            <div
              key={apt.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                apt.status === "CLOSED" ? "border-red-300 opacity-60" : "border-slate-200 shadow-xs"
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {apt.apartmentNumber}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-900 flex-shrink-0" />
                      <span>{apt.address}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      apt.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {apt.status === "ACTIVE" ? "פעילה" : "סגורה"}
                  </span>
                </div>

                {/* Details Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-slate-600">
                  {apt.entryCode && (
                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      <Key className="w-3 h-3 text-amber-600" />
                      {apt.entryCode}
                    </span>
                  )}
                  {apt.floor && (
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      {apt.floor}
                    </span>
                  )}
                  {apt.wazeUrl && (
                    <a
                      href={apt.wazeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      ניווט Waze
                    </a>
                  )}
                </div>
              </div>

              {/* Beds Inventory Visual */}
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-slate-800">
                    מלאי מיטות ({aptBeds.length}):
                  </span>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-emerald-700 font-bold">{availableCount} פנויות</span>
                    <span>•</span>
                    <span className="text-blue-700 font-bold">{assignedCount} תפוסות</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold">{reservedCount} משוריינות</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {aptBeds.map((bed) => {
                    const isAssigned = bed.status === "ASSIGNED";
                    const isReserved = bed.status === "RESERVED";

                    return (
                      <div
                        key={bed.id}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                          isAssigned
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : isReserved
                            ? "bg-amber-50 border-amber-200 text-amber-900"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] flex items-center gap-1">
                            <BedIcon className="w-3 h-3" />
                            מיטה {bed.bedNumber}
                          </span>
                          <button
                            onClick={() => actions.setBedReserved(bed.id, !isReserved)}
                            title={isReserved ? "שחרר שריון" : "שריין מיטה זו"}
                            className="text-slate-400 hover:text-amber-600"
                          >
                            {isReserved ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="mt-1.5 text-[10px] truncate">
                          {isAssigned ? (
                            <span className="font-semibold block truncate" title={bed.currentShliachName || ""}>
                              {bed.currentShliachName}
                            </span>
                          ) : isReserved ? (
                            <span className="italic text-amber-700 font-medium">משוריינת</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">פנויה לשיבוץ</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  פינוי: {apt.scheduledClosureDate || "24/11"}
                </span>

                <div className="flex items-center gap-2">
                  {assignedCount > 0 && apt.status === "ACTIVE" && (
                    <button
                      onClick={() => setClosingApt(apt)}
                      className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                      פירוק וסגירה
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`האם למחוק את ${apt.apartmentNumber}? כל השיבוצים יבוטלו.`)) {
                        actions.deleteApartment(apt.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    title="מחק דירה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Apartment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                הוספת דירת אירוח חדשה
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  שם / מספר דירה (למשל: דירה 4 - יוניון 720) *
                </label>
                <input
                  type="text"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  required
                  placeholder="דירה 4 - יוניון 720"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  כתובת מלאה *
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  required
                  placeholder="720 Union St, Apt 3A, Brooklyn, NY 11213"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    מספר מיטות בדירה *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formTotalBeds}
                    onChange={(e) => setFormTotalBeds(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    המיטות ייווצרו אוטומטית במקביל
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    קומה / מעלית
                  </label>
                  <input
                    type="text"
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                    placeholder="קומה 2 (יש מעלית)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    קוד כניסה לדלת / מידע מפתח
                  </label>
                  <input
                    type="text"
                    value={formEntryCode}
                    onChange={(e) => setFormEntryCode(e.target.value)}
                    placeholder="קוד: 7700#"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    קישור Waze
                  </label>
                  <input
                    type="url"
                    value={formWaze}
                    onChange={(e) => setFormWaze(e.target.value)}
                    placeholder="https://waze.com/ul?..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    שם איש קשר אחראי דירה
                  </label>
                  <input
                    type="text"
                    value={formManagerName}
                    onChange={(e) => setFormManagerName(e.target.value)}
                    placeholder="מנחם כהן"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    תאריך פינוי מתוכנן
                  </label>
                  <input
                    type="date"
                    value={formScheduledClosure}
                    onChange={(e) => setFormScheduledClosure(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800"
                >
                  צור דירה ומיטות
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deconstruction Confirmation Modal */}
      {closingApt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-base font-bold text-slate-900">
                פירוק וסגירת {closingApt.apartmentNumber}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              פעולה זו תפנה באופן מרוכז את כל השלוחים המשובצים בדירה זו, תשחרר את המיטות למאגר, ותסמן את הדירה כסגורה.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t text-xs">
              <button
                onClick={() => setClosingApt(null)}
                className="px-4 py-2 border rounded-xl text-slate-700 hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                onClick={() => handleDeconstruct(closingApt.id)}
                className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700"
              >
                בצע פינוי וסגירה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
