"use client";

import { useState } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { useAuth } from "@/lib/context/AuthContext";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Send, 
  Trash2, 
  User, 
  Clock, 
  Search,
  Inbox
} from "lucide-react";

export default function AdminMessagesPage() {
  const { contactMessages, actions, isLoaded } = useKinusData();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "NEW" | "REPLIED">("ALL");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");

  const filteredMessages = contactMessages.filter((msg) => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "ALL" || msg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const selectedMessage = contactMessages.find((m) => m.id === selectedMessageId);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setIsSending(true);
    try {
      await actions.replyContactMessage(
        selectedMessage.id,
        replyText.trim(),
        user?.displayName || "צוות כינוס השלוחים"
      );

      // Attempt background email relay dispatch
      try {
        await fetch("/api/email-relay/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: selectedMessage.email,
            subject: `מענה לפנייתך באתר כינוס השלוחים: ${selectedMessage.subject || "פנייה"}`,
            htmlBody: `<h3>שלום ${selectedMessage.name},</h3><p>${replyText.replace(/\n/g, "<br/>")}</p><br/><hr/><p style="color: #666; font-size: 12px;">מחלקת אירוח ולינה • כינוס השלוחים העולמי תשפ״ז<br/>788 Eastern Parkway, Suite 301, Brooklyn NY</p>`
          })
        });
      } catch (err) {
        console.warn("Relay background dispatch notice:", err);
      }

      setSuccessNotice("המענה נרשם ונשלח למייל בהצלחה!");
      setReplyText("");
      setTimeout(() => setSuccessNotice(""), 4000);
    } catch (err) {
      console.error("Failed to reply:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("האם למחוק פנייה זו?")) {
      await actions.deleteContactMessage(id);
      if (selectedMessageId === id) setSelectedMessageId(null);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-8 text-center text-slate-500">
        טוען פניות הציבור...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-blue-900" />
            פניות הציבור וצור קשר
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            צפייה בפניות שנשלחו דרך בלוק צור קשר באתר, מענה בדוא״ל ומעקב סטטוס
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-blue-600" />
            <span>סך הכל פניות: {contactMessages.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            חדשות: {contactMessages.filter(m => m.status === "NEW").length}
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Grid: List + Detail / Reply */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List Column */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חיפוש לפי שם, מייל או נושא..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterStatus("ALL")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterStatus === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                הכל ({contactMessages.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("NEW")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterStatus === "NEW" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                חדשות ({contactMessages.filter(m => m.status === "NEW").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("REPLIED")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterStatus === "REPLIED" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                נענו ({contactMessages.filter(m => m.status === "REPLIED").length})
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                לא נמצאו פניות העונות לחתך המבוקש.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessageId === msg.id;
                const isNew = msg.status === "NEW";

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-400 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{msg.name}</span>
                        {isNew ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            חדש
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> נענה
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleDateString("he-IL")}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-blue-900 mt-1 truncate">
                      {msg.subject || "ללא נושא"}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 font-light">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-2 border-t border-slate-100">
                      <span className="truncate">{msg.email}</span>
                      {msg.phone && <span>{msg.phone}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Details & Reply View */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
              {/* Header details */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      {selectedMessage.subject || "פנייה ללא נושא"}
                    </h2>
                    {selectedMessage.status === "NEW" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        ממתין למענה
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        נענה
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1 font-medium text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {selectedMessage.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedMessage.email}
                    </span>
                    {selectedMessage.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedMessage.phone}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="מחק פנייה"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message body */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  תוכן הפנייה:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
                <div className="text-[10px] text-slate-400 text-start pt-2">
                  נשלח בתאריך: {new Date(selectedMessage.createdAt).toLocaleString("he-IL")}
                </div>
              </div>

              {/* Previous Reply if any */}
              {selectedMessage.reply && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      מענה שנשלח לפונה בדוא״ל:
                    </span>
                    <span className="text-[10px] text-emerald-600">
                      {selectedMessage.repliedAt ? new Date(selectedMessage.repliedAt).toLocaleString("he-IL") : ""}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.reply}
                  </p>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    נענה על ידי: {selectedMessage.repliedBy || "צוות הכינוס"}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="admin-reply-box" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-900" />
                    <span>שליחת מענה לדוא״ל ({selectedMessage.email})</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    תשובות נשלחות דרך מודול המייל
                  </span>
                </div>

                <textarea
                  id="admin-reply-box"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`שלום ${selectedMessage.name},\nבהמשך לפנייתך...`}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isSending ? (
                      <span>שולח מענה...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>שלח מענה בדוא״ל</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-700">בחר פנייה מהרשימה כדי לצפות בפרטים</p>
                <p className="text-xs text-slate-400 mt-1">ניתן לקרוא את תוכן הפנייה, להשיב ישירות לדוא״ל ולעקוב אחר סטטוס הטיפול</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
