"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { KinusLogo } from "@/components/common/KinusLogo";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { ContactSection } from "@/components/public/ContactSection";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ShieldCheck, HeartHandshake, MapPin, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

export default function HomePage() {
  const { t, isRtl, language } = useLanguage();
  const CtaArrow = isRtl ? ArrowLeft : ArrowRight;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1A30] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#0B1A30]">
      <Navbar />

      <main className="flex-1" id="main-content">
        {/* Cinematic Hero Section with authentic atmosphere image and regal lighting */}
        <section className="relative overflow-hidden pt-8 pb-16 sm:pt-20 sm:pb-32 border-b border-[#E8D8A8]/15 bg-[#0B1A30]">
          {/* Authentic Banquet Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 pointer-events-none transition-opacity duration-300"
            style={{ backgroundImage: "url('/assets/hero-banquet.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A30]/85 via-[#0F2342]/75 to-[#0B1A30]/90 pointer-events-none" />

          {/* Decorative floating ambient golden aura */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[350px] sm:h-[450px] bg-[#E8D8A8]/10 rounded-full blur-3xl pointer-events-none animate-ambient-pulse" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Traditional B"H */}
            <div className={`text-xs text-[#E8D8A8]/80 tracking-widest font-serif mb-4 sm:mb-6 animate-fade-in ${isRtl ? "text-right" : "text-left"}`}>
              {t("traditionalBh")}
            </div>

            {/* Official Kinus Emblem with Glowing Halo */}
            <div className="flex justify-center mb-4 sm:mb-6 animate-fade-in-down">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#E8D8A8]/30 to-amber-500/30 blur-md group-hover:blur-lg opacity-75 group-hover:opacity-100 transition duration-500" />
                <div className="relative p-2.5 sm:p-3.5 rounded-full bg-[#0B1A30]/80 border border-[#E8D8A8]/30 shadow-[0_0_35px_rgba(232,216,168,0.2)] animate-subtle-float">
                  <KinusLogo size={64} variant="emblem" className="sm:w-[92px] sm:h-[92px] transition-transform duration-300 group-hover:scale-105" />
                </div>
              </div>
            </div>

            {/* Subtitle / Date Badge */}
            <div className="animate-fade-in-up delay-100 inline-flex items-center px-3.5 sm:px-5 py-1.5 rounded-full bg-[#E8D8A8]/10 border border-[#E8D8A8]/25 mb-4 sm:mb-5 backdrop-blur-sm">
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#E8D8A8] uppercase">
                {t("datesBanner")}
              </span>
            </div>

            {/* Main Header */}
            <h1 className="animate-fade-in-up delay-200 text-3xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight text-white leading-tight sm:leading-tight px-2 drop-shadow-sm">
              {t("heroTitle")}
            </h1>

            <p className="animate-fade-in-up delay-200 text-base sm:text-2xl text-slate-200 font-light mt-2 sm:mt-3 mb-4 px-2">
              {t("heroSubtitle")}
            </p>

            <div className="animate-fade-in-up delay-300 w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-[#E8D8A8] to-transparent mx-auto my-4 sm:my-6" aria-hidden="true" />

            <p className="animate-fade-in-up delay-300 max-w-2xl mx-auto text-xs sm:text-base text-slate-300 leading-relaxed font-light px-2">
              {t("heroDescription")}
            </p>

            {/* Official Call To Action Buttons with Shimmer & Glow */}
            <div className="animate-fade-in-up delay-400 mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/register"
                className="shimmer-button w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full border border-[#E8D8A8] bg-[#E8D8A8] text-[#0B1A30] font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(232,216,168,0.25)] hover:bg-white hover:text-[#0B1A30] hover:shadow-[0_0_35px_rgba(232,216,168,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1A30] transition-all duration-200 active:scale-95"
              >
                <span>{t("heroRegisterCta")}</span>
                <CtaArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <a
                href="#details"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-slate-700/80 bg-[#102444]/60 backdrop-blur-md text-slate-200 text-sm font-medium hover:border-[#E8D8A8]/60 hover:text-white hover:bg-[#15305B]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] transition-all duration-200 active:scale-95"
              >
                {t("heroDetailsCta")}
              </a>
            </div>

            {/* Fee badge */}
            <div className="animate-fade-in-up delay-400 mt-6 sm:mt-8 inline-block px-4 py-1.5 rounded-full bg-[#102444]/70 border border-[#E8D8A8]/20 backdrop-blur-sm text-xs text-[#E8D8A8] font-medium tracking-wide">
              {t("feeBadge")}
            </div>
          </div>
        </section>

        {/* Atmosphere Image Strip with Ken Burns Effect */}
        <section className="py-12 sm:py-18 bg-[#091526] border-b border-[#E8D8A8]/15 relative overflow-hidden" aria-label="גלריית אווירה מכינוס השלוחים">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
              <span className="text-[11px] sm:text-xs font-bold text-[#E8D8A8] tracking-[0.25em] uppercase block mb-2">
                {language === "he" ? "רשמי הכינוס" : "Kinus Atmosphere"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-white">
                {language === "he" ? "אלפי שלוחים בצוותא חדא" : "Thousands of Shluchim Gathered Together"}
              </h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#E8D8A8] to-transparent mx-auto mt-3" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* Atmosphere Card 1: Grand Banquet */}
              <div className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8D8A8]/20 bg-[#102444] shadow-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{ backgroundImage: "url('/assets/hero-banquet.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071224]/95 via-[#0B1A30]/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white z-10 transition-transform duration-300">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8D8A8]/20 text-[#E8D8A8] text-[10px] font-semibold mb-1.5 border border-[#E8D8A8]/30">
                    {language === "he" ? "מעמד הסיום" : "Grand Banquet"}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#E8D8A8] transition-colors">
                    {language === "he" ? "הבאנקעט העולמי" : "The Grand Banquet"}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-light mt-0.5 line-clamp-2">
                    {language === "he" ? "אלפי שלוחים חוגגים יחד בהתרוממות הרוח" : "Thousands celebrating together in unity"}
                  </p>
                </div>
              </div>

              {/* Atmosphere Card 2: 770 Crowd */}
              <div className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8D8A8]/20 bg-[#102444] shadow-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{ backgroundImage: "url('/assets/kinus-crowd-main.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071224]/95 via-[#0B1A30]/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white z-10 transition-transform duration-300">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8D8A8]/20 text-[#E8D8A8] text-[10px] font-semibold mb-1.5 border border-[#E8D8A8]/30">
                    {language === "he" ? "בית חיינו" : "Headquarters"}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#E8D8A8] transition-colors">
                    {language === "he" ? "תפילות והתוועדויות ב-770" : "Prayers & Farbrengens at 770"}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-light mt-0.5 line-clamp-2">
                    {language === "he" ? "התכנסות השלוחים בסמיכות למשלח" : "Shluchim gathering at 770 Eastern Parkway"}
                  </p>
                </div>
              </div>

              {/* Atmosphere Card 3: Group Photo */}
              <div className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8D8A8]/20 bg-[#102444] shadow-xl">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-110"
                  style={{ backgroundImage: "url('/assets/kinus-group-crowd.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071224]/95 via-[#0B1A30]/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white z-10 transition-transform duration-300">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8D8A8]/20 text-[#E8D8A8] text-[10px] font-semibold mb-1.5 border border-[#E8D8A8]/30">
                    {language === "he" ? "מסורת הכינוס" : "Annual Tradition"}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#E8D8A8] transition-colors">
                    {language === "he" ? "התצלום הכללי בחזית 770" : "The Official Group Photo"}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-light mt-0.5 line-clamp-2">
                    {language === "he" ? "שלוחי המלך מכל קצוות תבל" : "Shluchim from every corner of the world"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accommodation Pillars Section */}
        <section id="details" className="py-14 sm:py-24 bg-[#0F223D]/95 border-b border-slate-800/80 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
              <span className="text-xs font-bold text-[#E8D8A8] tracking-[0.2em] uppercase block mb-2">
                {t("pillarsHeaderTag")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-white">
                {t("pillarsTitle")}
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#E8D8A8] to-transparent mx-auto mt-4" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
              {/* Feature 1 */}
              <div className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-2xl text-center group relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8D8A8]/0 to-transparent group-hover:via-[#E8D8A8]/60 transition-all duration-500" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/25 group-hover:scale-110 group-hover:bg-[#E8D8A8]/20 group-hover:shadow-[0_0_20px_rgba(232,216,168,0.25)] transition-all duration-300" aria-hidden="true">
                  <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2.5 group-hover:text-[#E8D8A8] transition-colors duration-200">
                  {t("feature1Title")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {t("feature1Desc")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-2xl text-center group relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8D8A8]/0 to-transparent group-hover:via-[#E8D8A8]/60 transition-all duration-500" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/25 group-hover:scale-110 group-hover:bg-[#E8D8A8]/20 group-hover:shadow-[0_0_20px_rgba(232,216,168,0.25)] transition-all duration-300" aria-hidden="true">
                  <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2.5 group-hover:text-[#E8D8A8] transition-colors duration-200">
                  {t("feature2Title")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {t("feature2Desc")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-2xl text-center group relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E8D8A8]/0 to-transparent group-hover:via-[#E8D8A8]/60 transition-all duration-500" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8D8A8]/10 text-[#E8D8A8] flex items-center justify-center mx-auto mb-5 border border-[#E8D8A8]/25 group-hover:scale-110 group-hover:bg-[#E8D8A8]/20 group-hover:shadow-[0_0_20px_rgba(232,216,168,0.25)] transition-all duration-300" aria-hidden="true">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2.5 group-hover:text-[#E8D8A8] transition-colors duration-200">
                  {t("feature3Title")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {t("feature3Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs - Interactive Smooth Accordion */}
        <section className="py-14 sm:py-24 bg-[#0B1A30]" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-xs font-bold text-[#E8D8A8] tracking-[0.2em] uppercase block mb-2">
                FAQ
              </span>
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-serif text-white">
                {t("faqTitle")}
              </h2>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#E8D8A8] to-transparent mx-auto mt-3" aria-hidden="true" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl transition-all duration-300 border ${
                      isOpen
                        ? "bg-[#102444] border-[#E8D8A8]/40 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
                        : "bg-[#102444]/60 border-slate-800 hover:border-[#E8D8A8]/25"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8D8A8] rounded-2xl transition-colors"
                      aria-expanded={isOpen}
                    >
                      <h3 className={`font-bold text-sm sm:text-base transition-colors duration-200 ${isOpen ? "text-[#E8D8A8]" : "text-white"}`}>
                        {faq.q}
                      </h3>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-[#E8D8A8]/15 text-[#E8D8A8] rotate-180" : "bg-slate-800/80 text-slate-400"}`}>
                        <ChevronDown className="w-4 h-4 transition-transform duration-300" aria-hidden="true" />
                      </div>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed font-light border-t border-slate-800/60 pt-3">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Register CTA Card with atmosphere image */}
            <div className="relative overflow-hidden mt-12 sm:mt-16 p-6 sm:p-12 rounded-3xl border border-[#E8D8A8]/30 text-center shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)] group">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none scale-105"
                style={{ backgroundImage: "url('/assets/kinus-crowd-main.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#102444]/90 via-[#15305B]/85 to-[#102444]/90 pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl sm:text-3xl font-serif text-white">
                  {t("bottomCtaTitle")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto font-light leading-relaxed">
                  {t("bottomCtaDesc")}
                </p>
                <div className="pt-2">
                  <Link
                    href="/register"
                    className="shimmer-button inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#E8D8A8] text-[#0B1A30] font-bold text-xs sm:text-sm hover:bg-white hover:shadow-[0_0_25px_rgba(232,216,168,0.5)] transition-all duration-200 active:scale-95"
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
      <footer className="border-t border-slate-800 bg-[#071224] pt-8 pb-20 sm:pb-8 text-center text-xs text-slate-300">
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
