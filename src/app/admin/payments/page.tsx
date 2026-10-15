"use client";

import { useState, useEffect, useMemo } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  CreditCard, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Filter, 
  Download, 
  Receipt,
  X,
  Loader2
} from "lucide-react";

interface StripeChargeItem {
  id: string;
  amount: number;
  currency: string;
  created: string;
  status: string;
  paid: boolean;
  refunded: boolean;
  amountRefunded: number;
  customerEmail: string;
  customerName: string;
  description: string;
  receiptUrl: string | null;
  paymentIntentId: string | null;
  metadata: Record<string, string>;
  cardBrand: string;
  cardLast4: string;
  wallet: string | null;
}

export default function PaymentsPage() {
  const { shluchim, actions, isLoaded } = useKinusData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"accommodation" | "all_stripe">("accommodation");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("ALL");

  // Stripe Live Charges State
  const [stripeCharges, setStripeCharges] = useState<StripeChargeItem[]>([]);
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Refund Modal State
  const [refundModalItem, setRefundModalItem] = useState<{
    id: string;
    paymentIntentId?: string;
    chargeId?: string;
    shliachId?: string;
    name: string;
    maxAmount: number;
  } | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState<string>("requested_by_customer");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundFeedback, setRefundFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch all Stripe charges
  const fetchStripeCharges = async () => {
    setIsLoadingStripe(true);
    setStripeError(null);
    try {
      const res = await fetch("/api/stripe/charges?limit=100");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch Stripe charges");
      setStripeCharges(data.charges || []);
    } catch (err: any) {
      console.error(err);
      setStripeError(err.message || "Failed to fetch charges");
    } finally {
      setIsLoadingStripe(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all_stripe" && stripeCharges.length === 0) {
      fetchStripeCharges();
    }
  }, [activeTab]);

  // Accommodation payments from Shluchim collection
  const accommodationPayments = useMemo(() => {
    return shluchim.filter(s => s.paymentStatus === "PAID" || s.paymentStatus === "REFUNDED" || s.stripePaymentIntentId);
  }, [shluchim]);

  const filteredAccommodationPayments = useMemo(() => {
    return accommodationPayments.filter((s) => {
      if (filterPaymentStatus !== "ALL" && s.paymentStatus !== filterPaymentStatus) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const nameMatch = `${s.hebrewName} ${s.firstName} ${s.lastName}`.toLowerCase().includes(q);
        const emailMatch = (s.email || "").toLowerCase().includes(q);
        const cityMatch = `${s.city} ${s.country}`.toLowerCase().includes(q);
        const piMatch = (s.stripePaymentIntentId || "").toLowerCase().includes(q);
        return nameMatch || emailMatch || cityMatch || piMatch;
      }
      return true;
    });
  }, [accommodationPayments, searchTerm, filterPaymentStatus]);

  // Filtered Stripe charges
  const filteredStripeCharges = useMemo(() => {
    return stripeCharges.filter((c) => {
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const nameMatch = (c.customerName || "").toLowerCase().includes(q);
        const emailMatch = (c.customerEmail || "").toLowerCase().includes(q);
        const idMatch = (c.id || "").toLowerCase().includes(q) || (c.paymentIntentId || "").toLowerCase().includes(q);
        const descMatch = (c.description || "").toLowerCase().includes(q);
        return nameMatch || emailMatch || idMatch || descMatch;
      }
      return true;
    });
  }, [stripeCharges, searchTerm]);

  // Calculations for KPI Cards
  const totalAccommodationRevenue = useMemo(() => {
    return accommodationPayments
      .filter(s => s.paymentStatus === "PAID")
      .reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0);
  }, [accommodationPayments]);

  const totalRefundedCount = useMemo(() => {
    return accommodationPayments.filter(s => s.paymentStatus === "REFUNDED").length;
  }, [accommodationPayments]);

  const handleOpenRefundModal = (item: {
    id: string;
    paymentIntentId?: string;
    chargeId?: string;
    shliachId?: string;
    name: string;
    maxAmount: number;
  }) => {
    setRefundModalItem(item);
    setRefundAmount(String(item.maxAmount));
    setRefundReason("requested_by_customer");
    setRefundFeedback(null);
  };

  const handleExecuteRefund = async () => {
    if (!refundModalItem) return;
    setIsProcessingRefund(true);
    setRefundFeedback(null);

    try {
      const res = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: refundModalItem.paymentIntentId || undefined,
          chargeId: !refundModalItem.paymentIntentId ? refundModalItem.chargeId : undefined,
          shliachId: refundModalItem.shliachId,
          amount: Number(refundAmount) || refundModalItem.maxAmount,
          reason: refundReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed");

      if (refundModalItem.shliachId) {
        actions.updateShliach(refundModalItem.shliachId, {
          paymentStatus: "REFUNDED",
        });
      } else if (refundModalItem.paymentIntentId) {
        const matching = shluchim.find(
          (s) => s.stripePaymentIntentId === refundModalItem.paymentIntentId
        );
        if (matching) {
          actions.updateShliach(matching.id, {
            paymentStatus: "REFUNDED",
          });
        }
      }

      setRefundFeedback({
        success: true,
        message: `זיכוי על סך $${data.amount} בוצע בהצלחה ב-Stripe.`,
      });

      // Refresh Stripe charges if on that tab
      if (activeTab === "all_stripe") {
        fetchStripeCharges();
      }

      setTimeout(() => {
        setRefundModalItem(null);
        setRefundFeedback(null);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setRefundFeedback({
        success: false,
        message: err.message || "שגיאה בביצוע הזיכוי ב-Stripe",
      });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const exportAccommodationCSV = () => {
    if (filteredAccommodationPayments.length === 0) return;
    const headers = [
      "מזהה",
      "שם השליח",
      "דוא״ל",
      "טלפון",
      "עיר",
      "מדינה",
      "סכום ($)",
      "סטטוס תשלום",
      "מזהה Stripe",
      "תאריך תשלום",
    ];

    const rows = filteredAccommodationPayments.map((s) => [
      s.id,
      s.hebrewName || `${s.firstName} ${s.lastName}`,
      s.email,
      s.phone,
      s.city,
      s.country,
      s.amountPaid || 30,
      s.paymentStatus,
      s.stripePaymentIntentId || "",
      s.paidAt || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kinus-payments-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען נתוני חיובים וסליקה...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-blue-900" />
            ממשק ניהול חיובים וסליקה (Stripe)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            מעקב עסקאות, בקרה על תקבולי לינה, וביצוע החזרים כספיים מלאים / חלקיים בזמן אמת
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://dashboard.stripe.com/acct_1L2buKLfPnQv5qYO/payments"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#E8D8A8]" />
            פתח Stripe Dashboard ↗
          </a>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>תקבולי לינה (כינוס)</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-serif">
            ${totalAccommodationRevenue.toLocaleString()} USD
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>עסקאות לינה שולמו</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {accommodationPayments.filter(s => s.paymentStatus === "PAID").length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>עסקאות שזוכו</span>
            <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalRefundedCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>סה״כ עסקאות ב-Stripe</span>
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stripeCharges.length > 0 ? stripeCharges.length : "טוען..."}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("accommodation")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "accommodation"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              חיובים ממערכת הלינה ({accommodationPayments.length})
            </button>
            <button
              onClick={() => setActiveTab("all_stripe")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all_stripe"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              כלל התנועות בחשבון Stripe {stripeCharges.length > 0 && `(${stripeCharges.length})`}
            </button>
          </div>

          {activeTab === "all_stripe" && (
            <button
              onClick={fetchStripeCharges}
              disabled={isLoadingStripe}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStripe ? "animate-spin" : ""}`} />
              רענן נתוני Stripe
            </button>
          )}

          {activeTab === "accommodation" && (
            <button
              onClick={exportAccommodationCSV}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
            >
              <Download className="w-3.5 h-3.5" />
              ייצא ל-Excel (CSV)
            </button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "accommodation"
                  ? "חיפוש לפי שם שליח, דוא״ל, עיר או מזהה Stripe..."
                  : "חיפוש ב-Stripe לפי מזהה, מייל, שם או תיאור..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {activeTab === "accommodation" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">סטטוס:</span>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:outline-none"
              >
                <option value="ALL">כל הסטטוסים</option>
                <option value="PAID">שולם (פעיל)</option>
                <option value="REFUNDED">זוכה (Refunded)</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: ACCOMMODATION CHARGES */}
        {activeTab === "accommodation" && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">שם השליח</th>
                  <th className="py-3 px-4">מיקום</th>
                  <th className="py-3 px-4">תאריכים</th>
                  <th className="py-3 px-4">סכום</th>
                  <th className="py-3 px-4">מזהה תשלום ב-Stripe</th>
                  <th className="py-3 px-4">סטטוס</th>
                  <th className="py-3 px-4">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccommodationPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      לא נמצאו חיובים במערכת הלינה התואמים את החיפוש.
                    </td>
                  </tr>
                ) : (
                  filteredAccommodationPayments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {s.hebrewName || `${s.firstName} ${s.lastName}`}
                        </div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.city}, {s.country}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {s.arrivalDate} – {s.departureDate}
                      </td>
                      <td className="py-3 px-4 font-serif font-bold text-slate-900">
                        ${s.amountPaid || 30}.00 USD
                      </td>
                      <td className="py-3 px-4">
                        {s.stripePaymentIntentId ? (
                          <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1">
                            <span className="truncate max-w-[120px]">{s.stripePaymentIntentId}</span>
                            <a
                              href={`https://dashboard.stripe.com/acct_1L2buKLfPnQv5qYO/payments/${s.stripePaymentIntentId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="צפה ב-Stripe"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.paymentStatus === "REFUNDED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {s.paymentStatus === "PAID"
                            ? "שולם בהצלחה"
                            : s.paymentStatus === "REFUNDED"
                            ? "זוכה (Refund)"
                            : "ממתין"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {s.paymentStatus === "PAID" && s.stripePaymentIntentId && (
                            <button
                              onClick={() =>
                                handleOpenRefundModal({
                                  id: s.id,
                                  paymentIntentId: s.stripePaymentIntentId,
                                  shliachId: s.id,
                                  name: s.hebrewName || `${s.firstName} ${s.lastName}`,
                                  maxAmount: Number(s.amountPaid) || 30,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-[11px] transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              בצע זיכוי
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ALL STRIPE CHARGES */}
        {activeTab === "all_stripe" && (
          <div className="space-y-4">
            {stripeError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{stripeError}</span>
              </div>
            )}

            {isLoadingStripe ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-900 animate-spin" />
                <span className="text-xs text-slate-500">טוען תנועות ישירות מחשבון ה-Stripe...</span>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">מזהה עסקה</th>
                      <th className="py-3 px-4">לקוח / פרטים</th>
                      <th className="py-3 px-4">תיאור</th>
                      <th className="py-3 px-4">סכום</th>
                      <th className="py-3 px-4">אמצעי תשלום</th>
                      <th className="py-3 px-4">תאריך</th>
                      <th className="py-3 px-4">סטטוס</th>
                      <th className="py-3 px-4">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStripeCharges.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          לא נמצאו עסקאות ב-Stripe התואמות לחיפוש.
                        </td>
                      </tr>
                    ) : (
                      filteredStripeCharges.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-[130px]">{c.id}</span>
                              <a
                                href={`https://dashboard.stripe.com/acct_1L2buKLfPnQv5qYO/payments/${c.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">
                              {c.customerName || c.metadata?.shliachName || "—"}
                            </div>
                            <div className="text-[11px] text-slate-400">{c.customerEmail || "—"}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                            {c.description || (c.metadata?.shliachName ? `לינת כינוס - ${c.metadata.shliachName}` : "חיוב Stripe")}
                          </td>
                          <td className="py-3 px-4 font-serif font-bold text-slate-900">
                            ${c.amount.toFixed(2)} {c.currency}
                          </td>
                          <td className="py-3 px-4 text-slate-600 capitalize">
                            {c.cardBrand} •••• {c.cardLast4}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(c.created).toLocaleString("he-IL", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4">
                            {c.refunded ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                זוכה (${c.amountRefunded})
                              </span>
                            ) : c.paid ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                שולם
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {c.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {c.receiptUrl && (
                                <a
                                  href={c.receiptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-500 hover:text-slate-800 p-1"
                                  title="צפה בקבלה"
                                >
                                  <Receipt className="w-4 h-4" />
                                </a>
                              )}
                              {!c.refunded && c.paid && (
                                <button
                                  onClick={() =>
                                    handleOpenRefundModal({
                                      id: c.id,
                                      chargeId: !c.paymentIntentId ? c.id : undefined,
                                      paymentIntentId: c.paymentIntentId || undefined,
                                      shliachId: (c.metadata?.shliachId as string) || undefined,
                                      name: c.customerName || c.customerEmail || c.id,
                                      maxAmount: c.amount,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-[11px] transition-colors"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  זיכוי
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                ביצוע זיכוי כספי ב-Stripe (Refund)
              </h3>
              <button
                onClick={() => setRefundModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">עבור:</span>
                <span className="font-bold text-slate-900">{refundModalItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">סכום חיוב מקורי:</span>
                <span className="font-serif font-bold text-slate-900">${refundModalItem.maxAmount}.00 USD</span>
              </div>
            </div>

            {refundFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  refundFeedback.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {refundFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{refundFeedback.message}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  סכום לזיכוי ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  max={refundModalItem.maxAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-serif font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ברירת המחדל היא זיכוי מלא. ניתן להזין סכום חלקי.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  סיבת הזיכוי
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="requested_by_customer">לבקשת הלקוח / השליח</option>
                  <option value="duplicate">חיוב כפול (Duplicate)</option>
                  <option value="fraudulent">הונאה / כרטיס גנוב (Fraudulent)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRefundModalItem(null)}
                disabled={isProcessingRefund}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                disabled={isProcessingRefund || !refundAmount}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessingRefund ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>מעבד זיכוי...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>אשר זיכוי כספי</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
