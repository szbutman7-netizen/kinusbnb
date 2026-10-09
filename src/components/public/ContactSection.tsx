"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { Mail, Send, CheckCircle, AlertCircle, Phone, User, MessageSquare } from "lucide-react";

export function ContactSection() {
  const { t, language, isRtl } = useLanguage();
  const { actions } = useKinusData();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!form.name.trim()) {
      setError(language === "he" ? "נא להזין שם מלא" : "Please enter your name");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError(language === "he" ? "נא להזין כתובת דוא״ל תקינה" : "Please enter a valid email address");
      return;
    }
    if (!form.message.trim()) {
      setError(language === "he" ? "נא להזין את תוכן הפנייה" : "Please enter your message");
      return;
    }

    setIsSubmitting(true);
    try {
      await actions.addContactMessage({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        subject: form.subject.trim() || (language === "he" ? "פנייה כללית" : "General Inquiry"),
        message: form.message.trim(),
      });

      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSuccess(false), 8000);
    } catch (err: any) {
      console.error("Failed to submit contact message:", err);
      setError(t("contactErrorAlert"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-[#0B1A30] border-t border-slate-800" id="contact" aria-labelledby="contact-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-[#E8D8A8] font-semibold text-xs tracking-widest uppercase">
            {t("contactSectionTag")}
          </span>
          <h2 id="contact-heading" className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {t("contactSectionTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-light">
            {t("contactSectionDesc")}
          </p>
        </div>

        <div className="bg-[#102444] border border-[#E8D8A8]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8D8A8]/5 rounded-full blur-3xl pointer-events-none" />

          {success && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 text-xs sm:text-sm flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{t("contactSuccessAlert")}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 text-xs sm:text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("contactNameLabel")} *
                </label>
                <div className="relative">
                  <User className={`absolute top-3 w-4 h-4 text-slate-400 pointer-events-none ${isRtl ? "right-3" : "left-3"}`} />
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("contactNamePlaceholder")}
                    className={`w-full py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] text-xs ${
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("contactEmailLabel")} *
                </label>
                <div className="relative">
                  <Mail className={`absolute top-3 w-4 h-4 text-slate-400 pointer-events-none ${isRtl ? "right-3" : "left-3"}`} />
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t("contactEmailPlaceholder")}
                    className={`w-full py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] text-xs ${
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("contactPhoneLabel")}
                </label>
                <div className="relative">
                  <Phone className={`absolute top-3 w-4 h-4 text-slate-400 pointer-events-none ${isRtl ? "right-3" : "left-3"}`} />
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={t("contactPhonePlaceholder")}
                    className={`w-full py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] text-xs ${
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-200 mb-1">
                  {t("contactSubjectLabel")}
                </label>
                <div className="relative">
                  <MessageSquare className={`absolute top-3 w-4 h-4 text-slate-400 pointer-events-none ${isRtl ? "right-3" : "left-3"}`} />
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder={t("contactSubjectPlaceholder")}
                    className={`w-full py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] text-xs ${
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-200 mb-1">
                {t("contactMessageLabel")} *
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder={t("contactMessagePlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-[#0B1E38] text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] text-xs"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400">
                {language === "he" ? "* מענה יישלח ישירות לכתובת המייל שתציינו" : "* Response will be relayed directly to your email"}
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#E8D8A8] text-[#040D1E] font-bold text-xs hover:bg-white transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t("contactSubmittingBtn")}</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t("contactSubmitBtn")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
