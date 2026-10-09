"use client";

import React from "react";
import { useLanguage } from "@/lib/context/LanguageContext";

interface WhatsAppButtonProps {
  className?: string;
  showText?: boolean;
  label?: string;
  ariaLabel?: string;
  variant?: "badge" | "floating" | "pill";
}

export function WhatsAppButton({
  className = "",
  showText = true,
  label,
  ariaLabel,
  variant = "pill",
}: WhatsAppButtonProps) {
  const { t, isRtl } = useLanguage();
  const whatsappUrl = "https://wa.me/13474542013";
  const displayLabel = label || t("whatsappLabel");
  const accessibleLabel = ariaLabel || t("whatsappFullAria");

  if (variant === "floating") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={accessibleLabel}
        className={`fixed bottom-6 ${
          isRtl ? "left-6" : "right-6"
        } z-50 flex items-center gap-2.5 px-4 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-full shadow-lg hover:shadow-xl hover:bg-slate-50 active:scale-95 transition-all duration-200 font-sans focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 group ${className}`}
      >
        <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 2C6.511 2 2.023 6.488 2.023 12.008c0 1.956.564 3.782 1.542 5.334L2 22l4.808-1.528a9.96 9.96 0 0 0 5.223 1.472h.004c5.52 0 10.008-4.488 10.008-10.008A10.01 10.01 0 0 0 12.031 2zm5.792 14.155c-.24.675-1.393 1.29-1.928 1.34-.492.046-1.127.067-3.262-.816-2.564-1.06-4.22-3.66-4.348-3.83-.127-.17-1.042-1.385-1.042-2.641 0-1.256.657-1.874.89-2.128.233-.255.508-.318.677-.318.17 0 .339.002.487.01.157.009.367-.06.574.437.212.509.721 1.76.785 1.887.064.127.106.276.021.446-.084.17-.127.276-.254.424-.127.148-.267.33-.381.444-.127.127-.26.265-.112.52.148.254.657 1.085 1.409 1.755.968.862 1.784 1.13 2.038 1.257.254.127.402.106.551-.064.148-.17.635-.741.805-.995.17-.254.339-.212.571-.127.233.085 1.473.694 1.727.821.254.127.424.19.487.297.063.106.063.614-.177 1.289z" />
          </svg>
        </span>
        <span className="text-xs font-bold tracking-tight text-slate-800">
          {displayLabel}
        </span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleLabel}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-lg shadow-2xs hover:bg-emerald-100/80 active:scale-95 transition-all text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 group ${className}`}
    >
      <span className="w-4 h-4 text-emerald-600 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-3.5 h-3.5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.031 2C6.511 2 2.023 6.488 2.023 12.008c0 1.956.564 3.782 1.542 5.334L2 22l4.808-1.528a9.96 9.96 0 0 0 5.223 1.472h.004c5.52 0 10.008-4.488 10.008-10.008A10.01 10.01 0 0 0 12.031 2zm5.792 14.155c-.24.675-1.393 1.29-1.928 1.34-.492.046-1.127.067-3.262-.816-2.564-1.06-4.22-3.66-4.348-3.83-.127-.17-1.042-1.385-1.042-2.641 0-1.256.657-1.874.89-2.128.233-.255.508-.318.677-.318.17 0 .339.002.487.01.157.009.367-.06.574.437.212.509.721 1.76.785 1.887.064.127.106.276.021.446-.084.17-.127.276-.254.424-.127.148-.267.33-.381.444-.127.127-.26.265-.112.52.148.254.657 1.085 1.409 1.755.968.862 1.784 1.13 2.038 1.257.254.127.402.106.551-.064.148-.17.635-.741.805-.995.17-.254.339-.212.571-.127.233.085 1.473.694 1.727.821.254.127.424.19.487.297.063.106.063.614-.177 1.289z" />
        </svg>
      </span>
      {showText && <span>{displayLabel}</span>}
    </a>
  );
}
