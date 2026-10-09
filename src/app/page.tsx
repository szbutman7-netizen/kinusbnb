"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { ContactSection } from "@/components/public/ContactSection";
import { useLanguage } from "@/lib/context/LanguageContext";
import { Building2, ShieldCheck, HeartHandshake, MapPin, Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { t, isRtl } = useLanguage();
  const CtaArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1A30] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#0B1A30]">
      <Navbar />

      <main className="flex-1" id="main-content">
        {/* Cinematic Hero Section with authentic atmosphere image */}
        <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32 border-b border-[#E8D8A8]/15 bg-[#0B1A30]">
          {/* Authentic Banquet Backdrop - Clearly visible atmosphere */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 pointer-events-none transition-opacity duration-300"
            style={{ backgroundImage: "url('/assets/hero-banquet.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A30]/80 via-[#0F2342]/70 to-[#0B1A30]/85 pointer-events-none" />

          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E8D8A8]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Traditional B"H */}
            <div className={`text-xs text-[#E8D8A8]/80 tracking-widest font-serif mb-6 ${isRtl ? "text-right" : "text-left"}`}>
              {t("traditionalBh")}
            </div>

            {/* Official Kinus Emblem */}
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-full bg-[#E8D8A8]/10 border border-[#E8D8A8]/20 shadow-[0_0_30px_rgba(232,216,168,0.15)]">
                <KinusLogo size={88} variant="emblem" />
              </div>
            </div>

            {/* Subtitle / Date */}
            <div className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#E8D8A8] uppercase mb-4">
              {t("datesBanner")}
            </div>

            {/* Main Header */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white leading-tight sm:leading-tight">
              {t("heroTitle")}
            </h1>

            <p className="text-lg sm:text-2xl text-slate-200 font-light mt-3 mb-4">
              {t("heroSubtitle")}
            </p>

            <div className="w-24 h-0.5 bg-[#E8D8A8]/40 mx-auto my-6" aria-hidden="true" />

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {t("heroDescription")}
            </p>

            {/* Official Call To Action Button (Pill Button in Kinus Gold style) */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border border-[#E8D8A8] bg-[#E8D8A8] text-[#0B1A30] font-bold text-sm tracking-wide shadow-lg hover:bg-transparent hover:text-[#E8D8A8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1A30] transition-all transform hover:-translate-y-0.5"
              >
                <span>{t("heroRegisterCta")}</span>
                <CtaArrow className="w-4 h-4" aria-hidden="true" />
              </Link>

              <a
                href="#details"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-slate-700 text-slate-200 text-sm font-medium hover:border-[#E8D8A8]/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] transition-all"
              >
                {t("heroDetailsCta")}
              </a>
            </div>

            {/* Fee badge */}
            <div className="mt-8 text-xs text-[#E8D8A8] font-medium tracking-wide">
              {t("feeBadge")}
            </div>
          </div>
        </section>

        {/* Accommodation Pillars Section */}
        <section id="details" className="py-16 sm:py-24 bg-[#102444]/90 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-[#E8D8A8] tracking-[0.2em] uppercase block mb-2">
                {t("pillarsHeaderTag")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-white">
                {t("pillarsTitle")}
              </h2>
              <div className="w-12 h-0.5 bg-[#E8D8A8]/40 mx-auto mt-4" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-[#15305B]/60 border border-slate-800 hover:border-[#E8D8A8]/30 transition-all text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/20" aria-hidden="true">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {t("feature1Title")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {t("feature1Desc")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-[#15305B]/60 border border-slate-800 hover:border-[#E8D8A8]/30 transition-all text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/20" aria-hidden="true">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {t("feature2Title")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {t("feature2Desc")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-[#15305B]/60 border border-slate-800 hover:border-[#E8D8A8]/30 transition-all text-center">
                <div className="w-14 h-14 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/20" aria-hidden="true">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {t("feature3Title")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {t("feature3Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs and Practical Details */}
        <section className="py-16 sm:py-20 bg-[#0B1A30]" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="faq-heading" className="text-2xl font-serif text-white">
                {t("faqTitle")}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#102444] border border-slate-800">
                <h3 className="font-bold text-sm text-[#E8D8A8] mb-1">
                  {t("faq1Q")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t("faq1A")}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#102444] border border-slate-800">
                <h3 className="font-bold text-sm text-[#E8D8A8] mb-1">
                  {t("faq2Q")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t("faq2A")}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#102444] border border-slate-800">
                <h3 className="font-bold text-sm text-[#E8D8A8] mb-1">
                  {t("faq3Q")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {t("faq3A")}
                </p>
              </div>
            </div>

            {/* Bottom Register CTA Card with atmosphere image */}
            <div className="relative overflow-hidden mt-14 p-8 sm:p-12 rounded-3xl border border-[#E8D8A8]/30 text-center space-y-4">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-35 pointer-events-none"
                style={{ backgroundImage: "url('/assets/kinus-crowd-main.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#102444]/80 via-[#15305B]/75 to-[#102444]/80 pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl sm:text-2xl font-serif text-white">
                  {t("bottomCtaTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto font-light">
                  {t("bottomCtaDesc")}
                </p>
                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#E8D8A8] text-[#0B1A30] font-bold text-sm hover:bg-white transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8]"
                  >
                    <span>{t("bottomCtaButton")}</span>
                    <CtaArrow className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Block */}
        <ContactSection />
      </main>

      {/* Official Clean Footer (No admin links) */}
      <footer className="border-t border-slate-800 bg-[#071224] py-8 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KinusLogo size={24} variant="emblem" />
            <span className="text-slate-200 font-medium">{t("footerCopyright")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-slate-300">
              <a
                href="https://maps.google.com/?q=788%20Eastern%20Pkwy%2C%20Brooklyn%2C%20NY%2011213"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E8D8A8] underline transition-colors"
              >
                788 Eastern Parkway, Suite 301, Brooklyn NY, 11213
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Action */}
      <WhatsAppButton variant="floating" />
    </div>
  );
}
