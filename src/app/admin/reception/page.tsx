"use client";

import { useState, useMemo } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { useAuth } from "@/lib/context/AuthContext";
import { Shliach } from "@/types";
import { 
  CheckSquare, 
  Search, 
  CheckCircle2, 
  ShieldAlert, 
  MapPin, 
  Home, 
  Users, 
  Clock, 
  Key,
  X,
  Phone,
  Mail
} from "lucide-react";

export default function ReceptionPage() {
  const { shluchim, apartments, beds, actions, isLoaded } = useKinusData();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShliach, setSelectedShliach] = useState<Shliach | null>(null);

  const staffName = user?.displayName || "דייל קבלה";

  // Clean phone helper
  const cleanPhone = (phone: string) => phone.replace(/[^\d]/g, "").replace(/^0/, "").replace(/^972/, "").replace(/^1/, "");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    const cleanQ = cleanPhone(q);

    return shluchim.filter((s) => {
      const nameMatch = `${s.firstName} ${s.lastName} ${s.hebrewName}`.toLowerCase().includes(q);
      const idMatch = (s.passportOrId || "").toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      const phoneMatch = cleanQ.length > 2 && cleanPhone(s.phone || "").includes(cleanQ);
      const cityMatch = `${s.city} ${s.country}`.toLowerCase().includes(q);
      return nameMatch || idMatch || phoneMatch || cityMatch;
    });
  }, [shluchim, searchQuery]);

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען עמדת קבלה...</div>;
  }

  const handleCheckIn = async (shliach: Shliach) => {
    if (shliach.registrationStatus === 'DRAFT') {
      alert("שליח זה בסטטוס 'טופס נטוש (טיוטה)' וטרם השלים את הרישום. יש להפנות למשרד להסדרת הרישום והתשלום.");
      return;
    }
    if (shliach.paymentStatus !== 'PAID') {
      const confirmUnpaid = window.confirm(
        `⚠️ שימו לב: השליח ${shliach.hebrewName || `${shliach.firstName} ${shliach.lastName}`} טרם שילם את דמי הרישום (סטטוס: ${shliach.paymentStatus === 'EXEMPT' ? 'פטור' : 'טרם שולם'}).\n\nהאם לאשר קליטה וצ'ק-אין בכל זאת?`
      );
      if (!confirmUnpaid) return;
    }
    const result = await actions.checkInShliach(shliach.id, staffName);
    if (!result.success) {
      alert(result.message);
    } else {
      // Refresh selected shliach in state
      const updated = shluchim.find(s => s.id === shliach.id);
      if (updated) setSelectedShliach({ ...updated, checkedIn: true, checkedInBy: staffName, checkedInAt: new Date().toISOString() });
    }
  };

  // Find Roommates in the same apartment
  const roommates = selectedShliach?.apartmentId
    ? shluchim.filter(s => s.apartmentId === selectedShliach.apartmentId && s.id !== selectedShliach.id)
    : [];

  const apartmentDetails = selectedShliach?.apartmentId
    ? apartments.find(a => a.id === selectedShliach.apartmentId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-amber-500" />
            עמדת קבלה וצ'ק-אין (Reception Desk)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            קליטת שלוחים מהירה, איתור מיידי, ביצוע צ'ק-אין, מניעת חסימות והצגת פרטי דירה ושותפים
          </p>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-5 h-5 absolute right-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="הקלד שם שליח, מספר טלפון, עיר שליחות, ת״ז או דרכון לאיתור מיידי..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Real-time search dropdown results */}
        {searchResults.length > 0 && (
          <div className="mt-3 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            {searchResults.map((s) => (
              <div
                key={s.id}
                onClick={() => { setSelectedShliach(s); setSearchQuery(""); }}
                className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-900 block">
                    {s.hebrewName || `${s.firstName} ${s.lastName}`}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {s.city}, {s.country} • {s.phone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {s.paymentStatus !== 'PAID' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      טרם שולם
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      שולם
                    </span>
                  )}
                  {s.blockCheckIn && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                      חסום
                    </span>
                  )}
                  {s.checkedIn ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      כבר נקלט
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      מוכן לקליטה
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Guest Card - Desk View */}
      {selectedShliach ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Card Top Banner */}
          <div className={`p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
            selectedShliach.blockCheckIn
              ? "bg-red-700"
              : selectedShliach.checkedIn
              ? "bg-emerald-700"
              : "bg-blue-900"
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[11px] font-bold">
                  {selectedShliach.passportOrId ? `דרכון/ת״ז: ${selectedShliach.passportOrId}` : selectedShliach.id}
                </span>
                {selectedShliach.paymentStatus !== 'PAID' ? (
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[11px] font-black">
                    ⚠️ טרם שולם ($30)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[11px] font-bold">
                    ✓ שולם
                  </span>
                )}
                {selectedShliach.checkedIn && (
                  <span className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[11px] font-bold">
                    ✓ נקלט בעמדה
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black">
                {selectedShliach.hebrewName || `${selectedShliach.firstName} ${selectedShliach.lastName}`}
              </h2>
              <p className="text-white/80 text-xs mt-1">
                שליח ב{selectedShliach.city}, {selectedShliach.country} • טלפון: {selectedShliach.phone}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!selectedShliach.checkedIn && !selectedShliach.blockCheckIn && (
                <button
                  onClick={() => handleCheckIn(selectedShliach)}
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  בצע צ'ק-אין עכשיו
                </button>
              )}
              <button
                onClick={() => setSelectedShliach(null)}
                className="p-2 text-white/70 hover:text-white rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Block Alert Notice */}
          {selectedShliach.blockCheckIn && (
            <div className="bg-red-50 border-y border-red-200 p-4 flex items-start gap-3 text-red-900 text-xs">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm">קליטת השליח חסומה!</strong>
                <span>סיבה: {selectedShliach.blockReason || "נדרש להפנות למשרד ההנהלה לבירור"}</span>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Accommodation Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
                <Home className="w-4 h-4 text-blue-900" />
                פרטי לינה ודירה
              </h3>

              {!selectedShliach.apartmentId ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                  השליח עדיין לא שובץ לדירה. נא לפנות למנהל השיבוץ.
                </div>
              ) : !selectedShliach.receptionVisible ? (
                <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl text-slate-700">
                  פרטי הדירה נקבעו אך טרם אושרו לחשיפה בעמדת הקבלה (`receptionVisible = false`).
                </div>
              ) : (
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <div className="text-base font-extrabold text-blue-950">
                    {selectedShliach.apartmentName}
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-900" />
                    <span>{apartmentDetails?.address || selectedShliach.apartmentAddress}</span>
                  </div>
                  <div className="font-bold text-amber-900 bg-amber-100/70 p-2 rounded-lg flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <span>מיטה מספר: {selectedShliach.bedNumber}</span>
                    {apartmentDetails?.entryCode && <span>• {apartmentDetails.entryCode}</span>}
                  </div>
                </div>
              )}

              {/* Roommates List */}
              {selectedShliach.receptionVisible && roommates.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-900" />
                    שותפים לחדר בדירה זו:
                  </h4>
                  <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden bg-slate-50">
                    {roommates.map((rm) => (
                      <div key={rm.id} className="p-2.5 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{rm.hebrewName}</span>
                        <span className="text-slate-500">
                          מיטה {rm.bedNumber} {rm.checkedIn ? "(כבר הגיע)" : "(טרם הגיע)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Payment & Registration Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-2">
                <Clock className="w-4 h-4 text-blue-900" />
                נתוני הרשמה ושהות
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-slate-400 block text-[10px]">תאריך הגעה:</span>
                  <span className="font-bold text-slate-800">{selectedShliach.arrivalDate}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-slate-400 block text-[10px]">תאריך עזיבה:</span>
                  <span className="font-bold text-slate-800">{selectedShliach.departureDate}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">סטטוס תשלום:</span>
                  <span className={`font-bold ${selectedShliach.paymentStatus === 'PAID' ? "text-emerald-700" : "text-amber-700"}`}>
                    {selectedShliach.paymentStatus === 'PAID' ? "שולם ($180)" : "ממתין לתשלום"}
                  </span>
                </div>
                {selectedShliach.checkedIn && (
                  <div className="text-left">
                    <span className="text-slate-400 block text-[10px]">נקלט ע״י:</span>
                    <span className="font-bold text-slate-800">{selectedShliach.checkedInBy || "דייל"}</span>
                  </div>
                )}
              </div>

              {selectedShliach.adminNotes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[10px]">הערת מנהל:</span>
                  <span>{selectedShliach.adminNotes}</span>
                </div>
              )}

              {selectedShliach.preferredRoommates && (
                <div className="p-3 bg-slate-50 rounded-xl border text-slate-700">
                  <span className="font-bold block text-[10px] text-slate-500">בקשת שותפים בהרשמה:</span>
                  <span>{selectedShliach.preferredRoommates}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
          השתמש בסרגל החיפוש למעלה כדי לאתר שליח ולבצע צ'ק-אין
        </div>
      )}
    </div>
  );
}
