"use client";

import { useState } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { Shliach, Apartment, Bed } from "@/types";
import { 
  Layers, 
  Users, 
  Building2, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Bed as BedIcon, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";

export default function PlacementPage() {
  const { shluchim, apartments, beds, actions, isLoaded } = useKinusData();
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Selected Guests
  const [selectedShliachIds, setSelectedShliachIds] = useState<string[]>([]);
  
  // Step 2: Target Apartment
  const [targetApartmentId, setTargetApartmentId] = useState<string>("");

  // Step 3: Pending visibility flag
  const [makeVisibleToReception, setMakeVisibleToReception] = useState<boolean>(true);

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען נתוני שיבוץ...</div>;
  }

  // Unplaced Shluchim (excluding uncompleted drafts)
  const unplacedShluchim = shluchim.filter((s) => !s.bedId && s.registrationStatus !== 'DRAFT');
  // Placed Shluchim
  const placedShluchim = shluchim.filter((s) => !!s.bedId && s.registrationStatus !== 'DRAFT');

  const toggleSelectShliach = (id: string) => {
    setSelectedShliachIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllUnplaced = () => {
    if (selectedShliachIds.length === unplacedShluchim.length) {
      setSelectedShliachIds([]);
    } else {
      setSelectedShliachIds(unplacedShluchim.map((s) => s.id));
    }
  };

  // Execute Auto Assignment into Target Apartment
  const handleAssignToApartment = async () => {
    if (!targetApartmentId || selectedShliachIds.length === 0) return;

    const aptBeds = beds.filter(
      (b) => b.apartmentId === targetApartmentId && b.status === "AVAILABLE"
    );

    if (aptBeds.length < selectedShliachIds.length) {
      alert(`אין מספיק מיטות פנויות בדירה זו! פנויות: ${aptBeds.length}, נבחרו: ${selectedShliachIds.length}`);
      return;
    }

    for (let i = 0; i < selectedShliachIds.length; i++) {
      const shliachId = selectedShliachIds[i];
      const bed = aptBeds[i];
      await actions.assignPlacement(shliachId, bed.id, makeVisibleToReception);
    }

    setSelectedShliachIds([]);
    setActiveTab(3); // Go to approval / summary
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-900" />
            מסך שיבוץ אינטראקטיבי
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            תהליך שיבוץ מובנה ב-4 שלבים: בחירת שלוחים, בחירת דירת יעד, אישור חשיפה, ומנהל תפוסה
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 1 ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. בחירת שלוחים ({unplacedShluchim.length})
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 2 ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            2. בחירת דירה
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 3 ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            3. סטטוס ואישור
          </button>
          <button
            onClick={() => setActiveTab(4)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 4 ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            4. מנהל תפוסה (Grid)
          </button>
        </div>
      </div>

      {/* Tab 1: Select Guests */}
      {activeTab === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                שלב 1: בחירת שלוחים שטרם שובצו
              </h2>
              <p className="text-xs text-slate-500">
                סמנו את השלוחים שברצונכם לשבץ יחד בדירה הבאה
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={selectAllUnplaced}
                className="text-xs font-bold text-blue-900 hover:underline"
              >
                {selectedShliachIds.length === unplacedShluchim.length ? "בטל הכל" : "בחר את כולם"}
              </button>
              <button
                disabled={selectedShliachIds.length === 0}
                onClick={() => setActiveTab(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl disabled:opacity-40 hover:bg-blue-800 transition-colors"
              >
                המשך לבחירת דירה ({selectedShliachIds.length})
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {unplacedShluchim.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              כל השלוחים הרשומים כבר שובצו לדירות!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unplacedShluchim.map((s) => {
                const isSelected = selectedShliachIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSelectShliach(s.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 shadow-xs"
                        : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded text-blue-900"
                    />
                    <div className="flex-1 text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {s.hebrewName || `${s.firstName} ${s.lastName}`}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        שליח ב{s.city}, {s.country}
                      </div>
                      {s.preferredRoommates && (
                        <div className="text-indigo-700 font-semibold text-[10px] mt-1">
                          מבקש שותף: {s.preferredRoommates}
                        </div>
                      )}
                      {s.specialRequests && (
                        <div className="text-slate-400 text-[10px]">
                          בקשה: {s.specialRequests}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Target Apartment */}
      {activeTab === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                שלב 2: בחירת דירת יעד לשיבוץ
              </h2>
              <p className="text-xs text-slate-500">
                נבחרו {selectedShliachIds.length} שלוחים. בחר דירה עם מספיק מקומות פנויים.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab(1)}
                className="px-3 py-1.5 border rounded-xl text-xs font-semibold"
              >
                חזור לבחירת שלוחים
              </button>
              <button
                disabled={!targetApartmentId || selectedShliachIds.length === 0}
                onClick={handleAssignToApartment}
                className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl disabled:opacity-40 hover:bg-emerald-700 transition-colors"
              >
                שבץ עכשיו בדירה הנבחרת
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apartments.map((apt) => {
              const aptBeds = beds.filter((b) => b.apartmentId === apt.id);
              const availableBeds = aptBeds.filter((b) => b.status === "AVAILABLE").length;
              const isSelected = targetApartmentId === apt.id;
              const hasEnoughSpace = availableBeds >= selectedShliachIds.length;

              return (
                <div
                  key={apt.id}
                  onClick={() => {
                    if (hasEnoughSpace) setTargetApartmentId(apt.id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600"
                      : hasEnoughSpace
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {apt.apartmentNumber}
                    </h3>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                        availableBeds > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {availableBeds} פנויות
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">{apt.address}</p>

                  <div className="mt-3 pt-3 border-t text-[11px] text-slate-600 flex justify-between">
                    <span>סה״כ מיטות: {apt.totalBeds}</span>
                    <span>קומה: {apt.floor || "לא צוין"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Pending Approval & Visibility */}
      {activeTab === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                שלב 3: אישור שיבוצים וחשיפה לקבלה
              </h2>
              <p className="text-xs text-slate-500">
                שליטה האם פרטי הדירה והמיטה גלויים לעמדת הקבלה ולאורח (`receptionVisible`)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const hiddenIds = placedShluchim.filter(s => !s.receptionVisible).map(s => s.id);
                  actions.batchPublishPlacement(hiddenIds, true);
                }}
                className="px-3.5 py-1.5 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800"
              >
                חשוף את כל השיבוצים לקבלה
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {placedShluchim.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    {s.hebrewName}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {s.apartmentName} • מיטה {s.bedNumber}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => actions.updateShliach(s.id, { receptionVisible: !s.receptionVisible })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      s.receptionVisible
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s.receptionVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{s.receptionVisible ? "גלוי לקבלה" : "חסוי (טיוטה)"}</span>
                  </button>

                  <button
                    onClick={() => actions.unassignPlacement(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                    title="בטל שיבוץ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Occupancy Manager (Visual Grid) */}
      {activeTab === 4 && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              מנהל תפוסה ויזואלי – רשת דירות ומיטות
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                פנויה
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                משובצת
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                משוריינת
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apt) => {
              const aptBeds = beds.filter((b) => b.apartmentId === apt.id);

              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 mb-3">
                    {apt.apartmentNumber}
                  </h3>

                  <div className="space-y-2">
                    {aptBeds.map((bed) => {
                      const isAssigned = bed.status === "ASSIGNED";
                      const isReserved = bed.status === "RESERVED";

                      return (
                        <div
                          key={bed.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            isAssigned
                              ? "bg-blue-50/70 border-blue-200 text-blue-950"
                              : isReserved
                              ? "bg-amber-50/70 border-amber-200 text-amber-950"
                              : "bg-emerald-50/40 border-emerald-200 text-emerald-950"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BedIcon className="w-4 h-4 text-slate-400" />
                            <span className="font-bold">מיטה {bed.bedNumber}</span>
                            <span className="text-[11px] truncate max-w-[130px]">
                              {bed.currentShliachName || (isReserved ? "שריון ללא שם" : "פנויה")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {isAssigned && bed.currentShliachId && (
                              <button
                                onClick={() => actions.unassignPlacement(bed.currentShliachId!)}
                                className="text-slate-400 hover:text-red-600 text-[10px] font-bold"
                              >
                                שחרר
                              </button>
                            )}
                            <button
                              onClick={() => actions.setBedReserved(bed.id, !isReserved)}
                              className="text-slate-400 hover:text-amber-600"
                            >
                              {isReserved ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
