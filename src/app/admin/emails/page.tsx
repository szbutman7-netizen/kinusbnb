"use client";

import { useState } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { EmailTemplate, Shliach } from "@/types";
import { 
  Mail, 
  Send, 
  Code, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  RefreshCw,
  Gauge,
  Power,
  FlaskConical,
  Check
} from "lucide-react";

export default function EmailsPage() {
  const { templates, emailLogs, shluchim, formSettings, actions, isLoaded } = useKinusData();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || "template-registration-confirmation"
  );

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [subject, setSubject] = useState(currentTemplate?.subject || "");
  const [htmlContent, setHtmlContent] = useState(currentTemplate?.htmlContent || "");
  const [recipientFilter, setRecipientFilter] = useState<"ALL" | "PLACED" | "UNPLACED" | "PAID">("ALL");
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ current: number; total: number } | null>(null);
  const [previewTab, setPreviewTab] = useState<"CODE" | "PREVIEW">("PREVIEW");
  const [remainingDailyQuota, setRemainingDailyQuota] = useState(1485);

  // Auto-send confirmation toggle
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(formSettings?.sendConfirmationEmail ?? true);
  const [isSavingToggle, setIsSavingToggle] = useState(false);

  // Test email state
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען ממשק מיילים...</div>;
  }

  const handleToggleAutoEmail = async () => {
    const nextVal = !autoEmailEnabled;
    setAutoEmailEnabled(nextVal);
    setIsSavingToggle(true);
    try {
      await actions.updateFormSettings({
        sendConfirmationEmail: nextVal,
      });
    } catch (err) {
      console.error("Failed to update auto email status:", err);
    } finally {
      setIsSavingToggle(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      setTestResult({ success: false, message: "נא להזין כתובת דוא״ל תקינה" });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    const testHtml = htmlContent
      .replace(/{shliach_name}/g, "הרב ישראל מאיר לאו")
      .replace(/{city}/g, "תל אביב - יפו")
      .replace(/{apartment_name}/g, "דירה 1 - מונטגומרי 740")
      .replace(/{apartment_address}/g, "740 Montgomery St, Brooklyn")
      .replace(/{bed_number}/g, "1")
      .replace(/{entry_code}/g, "7701#")
      .replace(/{arrival_date}/g, "03/11/2026")
      .replace(/{departure_date}/g, "10/11/2026");

    try {
      const res = await fetch("/api/email-relay/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailAddress.trim(),
          subject: `[מייל בדיקה] ${subject}`,
          htmlBody: testHtml,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "שגיאה בשליחת מייל הבדיקה");
      }

      actions.addEmailLog({
        recipientEmail: testEmailAddress.trim(),
        recipientName: "מייל בדיקה / ניסיון",
        subject: `[מייל בדיקה] ${subject}`,
        templateName: currentTemplate?.name,
        status: "SENT",
      });

      setTestResult({
        success: true,
        message: `מייל ניסיון נשלח בהצלחה אל ${testEmailAddress.trim()}!`,
      });
      setTimeout(() => setTestResult(null), 6000);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "נכשלה שליחת מייל הניסיון",
      });
      actions.addEmailLog({
        recipientEmail: testEmailAddress.trim(),
        recipientName: "מייל בדיקה / ניסיון",
        subject: `[מייל בדיקה] ${subject}`,
        templateName: currentTemplate?.name,
        status: "FAILED",
        errorMessage: err.message,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) {
      setSubject(tmpl.subject);
      setHtmlContent(tmpl.htmlContent);
    }
  };

  const handleSaveTemplate = () => {
    if (currentTemplate) {
      actions.saveTemplate({
        ...currentTemplate,
        subject,
        htmlContent,
      });
      alert("התבנית נשמרה בהצלחה!");
    }
  };

  // Target Recipients
  const targetRecipients = shluchim.filter((s) => {
    if (!s.email) return false;
    if (recipientFilter === "PLACED") return !!s.bedId;
    if (recipientFilter === "UNPLACED") return !s.bedId;
    if (recipientFilter === "PAID") return s.paymentStatus === "PAID";
    return true;
  });

  // Render HTML preview with replacement for first recipient or sample
  const sampleShliach = targetRecipients[0] || shluchim[0];
  const renderedPreview = htmlContent
    .replace(/{shliach_name}/g, sampleShliach?.hebrewName || "הרב מנחם מענדל")
    .replace(/{city}/g, sampleShliach?.city || "פריז")
    .replace(/{apartment_name}/g, sampleShliach?.apartmentName || "דירה 1 - מונטגומרי 740")
    .replace(/{apartment_address}/g, sampleShliach?.apartmentAddress || "740 Montgomery St, Brooklyn")
    .replace(/{bed_number}/g, String(sampleShliach?.bedNumber || "1"))
    .replace(/{entry_code}/g, "קוד כניסה: 7701#")
    .replace(/{arrival_date}/g, sampleShliach?.arrivalDate || "18/11")
    .replace(/{departure_date}/g, sampleShliach?.departureDate || "23/11");

  // Send batch of emails via Apps Script Relay
  const handleSendEmails = async () => {
    if (targetRecipients.length === 0) {
      alert("אין נמענים העונים לסינון שנבחר.");
      return;
    }

    if (!confirm(`האם לשלוח מייל זה אל ${targetRecipients.length} שלוחים?`)) return;

    setIsSending(true);
    setSendProgress({ current: 0, total: targetRecipients.length });

    const CHUNK_SIZE = 25;
    let sentCount = 0;

    for (let i = 0; i < targetRecipients.length; i += CHUNK_SIZE) {
      const chunk = targetRecipients.slice(i, i + CHUNK_SIZE);

      for (const shliach of chunk) {
        const personalizedHtml = htmlContent
          .replace(/{shliach_name}/g, shliach.hebrewName || `${shliach.firstName} ${shliach.lastName}`)
          .replace(/{city}/g, shliach.city)
          .replace(/{apartment_name}/g, shliach.apartmentName || "דירת אירוח")
          .replace(/{apartment_address}/g, shliach.apartmentAddress || "")
          .replace(/{bed_number}/g, String(shliach.bedNumber || ""))
          .replace(/{arrival_date}/g, shliach.arrivalDate)
          .replace(/{departure_date}/g, shliach.departureDate);

        try {
          const res = await fetch("/api/email-relay/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: shliach.email,
              subject: subject,
              htmlBody: personalizedHtml,
            }),
          });

          const data = await res.json();
          actions.addEmailLog({
            recipientEmail: shliach.email,
            recipientName: shliach.hebrewName,
            subject: subject,
            templateName: currentTemplate?.name,
            status: "SENT",
          });
        } catch (err: any) {
          actions.addEmailLog({
            recipientEmail: shliach.email,
            recipientName: shliach.hebrewName,
            subject: subject,
            templateName: currentTemplate?.name,
            status: "FAILED",
            errorMessage: err.message,
          });
        }

        sentCount++;
        setSendProgress({ current: sentCount, total: targetRecipients.length });
      }

      // 1.5 seconds delay between chunks
      if (i + CHUNK_SIZE < targetRecipients.length) {
        await new Promise((res) => setTimeout(res, 1500));
      }
    }

    setRemainingDailyQuota((q) => Math.max(0, q - sentCount));
    setIsSending(false);
    setSendProgress(null);
    alert(`שליחת ${sentCount} מיילים הסתיימה בהצלחה!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-blue-900" />
            מערך שליחת מיילים (Apps Script Relay)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            שליחה מותאמת אישית מתוך חשבון ה-Google הרשמי, עורך תבניות HTML, החלפת תגיות דינמיות ומעקב מכסות
          </p>
        </div>

        {/* Quota Gauge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs">
          <Gauge className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-slate-400 block text-[10px]">מכסת שליחה יומית:</span>
            <span className="font-bold text-slate-900">
              {remainingDailyQuota} / 1,500 מיילים נותרו
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Template Selector & Sending Controls */}
        <div className="space-y-6">
          {/* Automated Confirmation Email Toggle Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${autoEmailEnabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <Power className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">שליחת מייל אישור הרשמה</h3>
                  <p className="text-[10px] text-slate-400">שליחה אוטומטית בעת סיום הרישום בטופס</p>
                </div>
              </div>

              {/* Switch button */}
              <button
                type="button"
                role="switch"
                aria-checked={autoEmailEnabled}
                onClick={handleToggleAutoEmail}
                disabled={isSavingToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoEmailEnabled ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    autoEmailEnabled ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">סטטוס מנגנון:</span>
              <span className={`font-bold px-2 py-0.5 rounded ${autoEmailEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {autoEmailEnabled ? "פעיל (שולח מיידית לנרשם)" : "כבוי (ללא שליחה אוטומטית)"}
              </span>
            </div>
          </div>

          {/* Send Test Email Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FlaskConical className="w-4 h-4 text-amber-600" />
              <span>שליחת מייל ניסיון (Test Email)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              שגר מייל בדיקה עם התבנית הפעילה ונתוני הדגמה מלאים לכל כתובת דוא״ל לבחירתך:
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-2.5">
              <div>
                <input
                  type="email"
                  dir="ltr"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-2 ${
                  testResult.success 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingTest || !testEmailAddress.trim()}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>שולח מייל בדיקה...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>שלח מייל ניסיון עכשיו</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Templates Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">בחר תבנית מייל</h3>
            <div className="space-y-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`w-full p-3 rounded-xl border text-right transition-all ${
                    selectedTemplateId === tmpl.id
                      ? "bg-blue-50 border-blue-400 font-bold text-blue-950"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="block">{tmpl.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{tmpl.subject}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sending Settings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">הגדרות קהל יעד לשליחה</h3>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">
                סנן נמענים:
              </label>
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value as any)}
                className="w-full p-2.5 border rounded-xl bg-white"
              >
                <option value="ALL">כל השלוחים הרשומים ({shluchim.length})</option>
                <option value="PLACED">שלוחים ששובצו בלבד ({shluchim.filter(s => !!s.bedId).length})</option>
                <option value="UNPLACED">שלוחים שטרם שובצו ({shluchim.filter(s => !s.bedId).length})</option>
                <option value="PAID">שלוחים ששילמו בלבד ({shluchim.filter(s => s.paymentStatus === 'PAID').length})</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl text-blue-900 text-[11px] space-y-1">
              <div><strong>כמות נמענים מיועדת:</strong> {targetRecipients.length} שלוחים</div>
              <div><strong>קצב שיגור:</strong> מנות של 25 עם 1.5 שניות השהיה</div>
            </div>

            <button
              onClick={handleSendEmails}
              disabled={isSending || targetRecipients.length === 0}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>שולח... ({sendProgress?.current}/{sendProgress?.total})</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>שגר מיילים עכשיו ({targetRecipients.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center / Right: Template Editor & Live Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewTab("PREVIEW")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  previewTab === "PREVIEW" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                תצוגה מקדימה חיה
              </button>
              <button
                onClick={() => setPreviewTab("CODE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  previewTab === "CODE" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                עריכת קוד HTML
              </button>
            </div>

            <button
              onClick={handleSaveTemplate}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              שמור תבנית
            </button>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              נושא המייל (Subject)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border rounded-xl"
            />
          </div>

          {/* Dynamic Tags Helper Bar */}
          <div className="p-2.5 bg-slate-50 border rounded-xl text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-700 block">תגיות דינמיות להעתקה:</span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{shliach_name}"}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{city}"}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{apartment_name}"}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{apartment_address}"}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{bed_number}"}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{entry_code}"}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{arrival_date}"}</span>
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{"{departure_date}"}</span>
            </div>
          </div>

          {/* Tab View: Code or Preview */}
          {previewTab === "CODE" ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                בלוק HTML מלא
              </label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={16}
                dir="ltr"
                className="w-full p-3 font-mono text-xs border rounded-xl bg-slate-900 text-slate-100 leading-relaxed"
              />
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 min-h-[380px] overflow-y-auto">
              <div
                dangerouslySetInnerHTML={{ __html: renderedPreview }}
                className="bg-white rounded-lg shadow-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Email Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-900" />
          יומן שליחות אחרונות (Email Logs)
        </h3>

        {emailLogs.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            טרם נשלחו מיילים במערכת
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                <tr>
                  <th className="p-3">נמען</th>
                  <th className="p-3">כתובת דוא״ל</th>
                  <th className="p-3">נושא</th>
                  <th className="p-3">תאריך ושעה</th>
                  <th className="p-3">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emailLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{log.recipientName}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600">{log.recipientEmail}</td>
                    <td className="p-3 text-slate-700">{log.subject}</td>
                    <td className="p-3 text-slate-500 text-[11px]">{log.sentAt.replace("T", " ").slice(0, 16)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === "SENT" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        {log.status === "SENT" ? "נשלח בהצלחה" : "נכשל"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
