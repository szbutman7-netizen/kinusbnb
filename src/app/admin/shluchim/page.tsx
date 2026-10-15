"use client";

import { useState, useMemo } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { Shliach, PaymentStatus } from "@/types";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Bed, 
  Edit2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Lock,
  Unlock,
  MessageSquare,
  X,
  FileSpreadsheet
} from "lucide-react";

export default function ShluchimPage() {
  const { shluchim, actions, isLoaded } = useKinusData();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL"); // ALL, COMPLETED, DRAFT
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [filterPlacement, setFilterPlacement] = useState<string>("ALL");
  const [filterCheckIn, setFilterCheckIn] = useState<string>("ALL");
  const [filterBlocked, setFilterBlocked] = useState<string>("ALL");

  // Edit / Modal States
  const [editingShliach, setEditingShliach] = useState<Shliach | null>(null);
  const [blockingShliach, setBlockingShliach] = useState<Shliach | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState("");
  const [notesShliach, setNotesShliach] = useState<Shliach | null>(null);
  const [notesInput, setNotesInput] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Clean phone helper for fuzzy phone search
  const cleanPhone = (phone: string) => phone.replace(/[^\d]/g, "").replace(/^0/, "").replace(/^972/, "").replace(/^1/, "");

  const filteredShluchim = useMemo(() => {
    return shluchim.filter((s) => {
      // Fuzzy search
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const cleanedQuery = cleanPhone(query);
        const cleanedPhone = cleanPhone(s.phone || "");

        const nameMatch = `${s.firstName} ${s.lastName} ${s.hebrewName}`.toLowerCase().includes(query);
        const cityMatch = `${s.city} ${s.country}`.toLowerCase().includes(query);
        const idMatch = (s.passportOrId || "").toLowerCase().includes(query) || s.id.toLowerCase().includes(query);
        const phoneMatch = cleanedQuery.length > 2 && cleanedPhone.includes(cleanedQuery);

        if (!nameMatch && !cityMatch && !idMatch && !phoneMatch) return false;
      }

      // Registration Status Filter (Completed vs Draft)
      if (filterStatus === "COMPLETED" && s.registrationStatus === "DRAFT") return false;
      if (filterStatus === "DRAFT" && s.registrationStatus !== "DRAFT") return false;

      // Filters
      if (filterPayment !== "ALL" && s.paymentStatus !== filterPayment) return false;
      if (filterPlacement === "PLACED" && (!s.apartmentId || !s.bedId)) return false;
      if (filterPlacement === "UNPLACED" && s.bedId) return false;
      if (filterCheckIn === "CHECKED_IN" && !s.checkedIn) return false;
      if (filterCheckIn === "NOT_CHECKED_IN" && s.checkedIn) return false;
      if (filterBlocked === "BLOCKED" && !s.blockCheckIn) return false;

      return true;
    });
  }, [shluchim, searchTerm, filterStatus, filterPayment, filterPlacement, filterCheckIn, filterBlocked]);

  const totalCount = shluchim.length;
  const completedCount = shluchim.filter(s => s.registrationStatus !== "DRAFT").length;
  const draftsCount = shluchim.filter(s => s.registrationStatus === "DRAFT").length;

  const totalPages = Math.ceil(filteredShluchim.length / PAGE_SIZE) || 1;
  const paginatedShluchim = filteredShluchim.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען מאגר נרשמים...</div>;
  }

  const handleSaveNotes = async () => {
    if (notesShliach) {
      await actions.updateShliach(notesShliach.id, { adminNotes: notesInput });
      setNotesShliach(null);
    }
  };

  const handleConfirmBlock = async () => {
    if (blockingShliach) {
      const willBlock = !blockingShliach.blockCheckIn;
      await actions.toggleBlockCheckIn(blockingShliach.id, willBlock, blockReasonInput);
      setBlockingShliach(null);
      setBlockReasonInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-900" />
            מאגר שלוחים ונרשמים
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            חיפוש חכם, ניהול תשלומים, מעקב קליטה, חסימות הגעה והערות מנהל
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border">
            {filteredShluchim.length} מתוך {shluchim.length} שלוחים
          </span>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <button
          onClick={() => { setFilterStatus("ALL"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filterStatus === "ALL"
              ? "bg-blue-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          כל הרשומות ({totalCount})
        </button>
        <button
          onClick={() => { setFilterStatus("COMPLETED"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterStatus === "COMPLETED"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          רישומים שהושלמו ({completedCount})
        </button>
        <button
          onClick={() => { setFilterStatus("DRAFT"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            filterStatus === "DRAFT"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          טפסים נטושים / טיוטות ({draftsCount})
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="חיפוש חכם: שם, עיר שליחות, טלפון (ללא מקפים), ת״ז/דרכון..."
              className="w-full pr-10 pl-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Payment Filter */}
            <select
              value={filterPayment}
              onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700"
            >
              <option value="ALL">כל התשלומים</option>
              <option value="PAID">שולם (PAID)</option>
              <option value="PENDING">ממתין לתשלום</option>
            </select>

            {/* Placement Filter */}
            <select
              value={filterPlacement}
              onChange={(e) => { setFilterPlacement(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700"
            >
              <option value="ALL">כל הסטטוסים</option>
              <option value="PLACED">משובצים בדירה</option>
              <option value="UNPLACED">טרם שובצו</option>
            </select>

            {/* Check-In Filter */}
            <select
              value={filterCheckIn}
              onChange={(e) => { setFilterCheckIn(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700"
            >
              <option value="ALL">כל הקליטות</option>
              <option value="CHECKED_IN">נקלטו בעמדה</option>
              <option value="NOT_CHECKED_IN">טרם הגיעו</option>
            </select>

            {/* Blocked Filter */}
            <select
              value={filterBlocked}
              onChange={(e) => { setFilterBlocked(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700"
            >
              <option value="ALL">הכל</option>
              <option value="BLOCKED">חסומים בלבד ⚠️</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shluchim Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5">שם השליח</th>
                <th className="p-3.5">מקום שליחות</th>
                <th className="p-3.5">יצירת קשר</th>
                <th className="p-3.5">תאריכים ושותפים</th>
                <th className="p-3.5">סטטוס תשלום</th>
                <th className="p-3.5">שיבוץ ודירה</th>
                <th className="p-3.5">סטטוס קבלה</th>
                <th className="p-3.5 text-center">פעולות מהירות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedShluchim.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    לא נמצאו שלוחים העונים לתנאי החיפוש
                  </td>
                </tr>
              ) : (
                paginatedShluchim.map((s) => (
                  <tr key={s.id} className={`hover:bg-slate-50/80 transition-colors ${s.blockCheckIn ? "bg-red-50/40" : ""}`}>
                    {/* Name */}
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.blockCheckIn && (
                          <span title={s.blockReason || "חסום לקבלה"} className="text-red-600">
                            ⚠️
                          </span>
                        )}
                        <span>{s.hebrewName || `${s.firstName} ${s.lastName}`}</span>
                        {s.registrationStatus === "DRAFT" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            טופס נטוש
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            הושלם
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-normal">
                        <span>{s.passportOrId ? `מזהה: ${s.passportOrId}` : s.id}</span>
                        {s.age ? (
                          <span className="bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded font-bold border border-blue-200">
                            גיל: {s.age}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-3.5 text-slate-700">
                      <div className="font-semibold">{s.city}</div>
                      <span className="text-[10px] text-slate-500 block">{s.country}</span>
                    </td>

                    {/* Contact */}
                    <td className="p-3.5 text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono text-[11px]">{s.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] truncate max-w-[140px]">{s.email}</span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="p-3.5 text-slate-600">
                      <div className="text-[11px]">
                        {s.arrivalDate.slice(5)} - {s.departureDate.slice(5)}
                      </div>
                      {s.preferredRoommates && (
                        <span className="text-[10px] text-indigo-700 block mt-0.5 truncate max-w-[130px]" title={s.preferredRoommates}>
                          שותף: {s.preferredRoommates}
                        </span>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.paymentStatus === "PAID" ? "שולם ($180)" : "ממתין לתשלום"}
                      </span>
                    </td>

                    {/* Placement */}
                    <td className="p-3.5">
                      {s.apartmentName ? (
                        <div>
                          <div className="font-bold text-slate-900">{s.apartmentName}</div>
                          <span className="text-[10px] text-blue-800 block">
                            מיטה {s.bedNumber} {s.receptionVisible ? "(גלוי לקבלה)" : "(חסוי)"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">טרם שובץ</span>
                      )}
                    </td>

                    {/* Check In Status */}
                    <td className="p-3.5">
                      {s.checkedIn ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>נקלט</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">לא הגיע</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Quick Notes */}
                        <button
                          onClick={() => {
                            setNotesShliach(s);
                            setNotesInput(s.adminNotes || "");
                          }}
                          title={s.adminNotes || "הוסף הערת מנהל"}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            s.adminNotes
                              ? "bg-amber-100 border-amber-300 text-amber-900"
                              : "border-slate-200 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Block Check-in */}
                        <button
                          onClick={() => {
                            setBlockingShliach(s);
                            setBlockReasonInput(s.blockReason || "");
                          }}
                          title={s.blockCheckIn ? "בטל חסימת קבלה" : "חסום קבלה בעמדה"}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            s.blockCheckIn
                              ? "bg-red-600 border-red-700 text-white"
                              : "border-slate-200 text-slate-400 hover:text-red-600"
                          }`}
                        >
                          {s.blockCheckIn ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white"
            >
              הקודם
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-white"
            >
              הבא
            </button>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {notesShliach && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-base font-bold text-slate-900">
                הערות פנימיות עבור {notesShliach.hebrewName}
              </h2>
              <button onClick={() => setNotesShliach(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              rows={4}
              placeholder="כתוב הערות מנהל פנימיות (אינן גלויות לשליח)..."
              className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setNotesShliach(null)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800"
              >
                שמור הערה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockingShliach && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>{blockingShliach.blockCheckIn ? "ביטול חסימת קבלה" : "הפעלת חסימת קבלה בעמדה"}</span>
            </div>
            <p className="text-slate-600">
              {blockingShliach.blockCheckIn
                ? `האם להסיר את החסימה עבור ${blockingShliach.hebrewName}?`
                : `חסימת קבלה תמנע מדיילי עמדת הקבלה לקלוט את ${blockingShliach.hebrewName} ותחייב הפניה למשרד.`}
            </p>
            {!blockingShliach.blockCheckIn && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  סיבת החסימה (תוצג לדייל בעמדת הקבלה):
                </label>
                <input
                  type="text"
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                  placeholder="למשל: נדרש להסדיר תשלום, לפנות למנהל הכינוס"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setBlockingShliach(null)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                onClick={handleConfirmBlock}
                className={`px-4 py-2 font-bold rounded-xl text-white ${
                  blockingShliach.blockCheckIn ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {blockingShliach.blockCheckIn ? "הסר חסימה" : "הפעל חסימת קבלה"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
