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
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center gap-2.5 p-3 sm:px-4 sm:py-3 bg-[#102444] text-[#E8D8A8] rounded-full shadow-2xl hover:bg-[#15305B] hover:border-[#E8D8A8] hover:scale-105 active:scale-95 transition-all duration-300 font-sans border border-[#E8D8A8]/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E8D8A8]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1A30] group ${className}`}
      >
        <svg
          className="w-6 h-6 fill-current flex-shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.031 2C6.511 2 2.023 6.488 2.023 12.008c0 1.956.564 3.782 1.542 5.334L2 22l4.808-1.528a9.96 9.96 0 0 0 5.223 1.472h.004c5.52 0 10.008-4.488 10.008-10.008A10.01 10.01 0 0 0 12.031 2zm5.792 14.155c-.24.675-1.393 1.29-1.928 1.34-.492.046-1.127.067-3.262-.816-2.564-1.06-4.22-3.66-4.348-3.83-.127-.17-1.042-1.385-1.042-2.641 0-1.256.657-1.874.89-2.128.233-.255.508-.318.677-.318.17 0 .339.002.487.01.157.009.367-.06.574.437.212.509.721 1.76.785 1.887.064.127.106.276.021.446-.084.17-.127.276-.254.424-.127.148-.267.33-.381.444-.127.127-.26.265-.112.52.148.254.657 1.085 1.409 1.755.968.862 1.784 1.13 2.038 1.257.254.127.402.106.551-.064.148-.17.635-.741.805-.995.17-.254.339-.212.571-.127.233.085 1.473.694 1.727.821.254.127.424.19.487.297.063.106.063.614-.177 1.289z" />
        </svg>
        <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-wide">
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
      className={`inline-flex items-center gap-2 px-4 py-2 bg-[#102444] text-[#E8D8A8] border border-[#E8D8A8]/30 hover:border-[#E8D8A8] hover:bg-[#15305B] rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all text-xs font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E8D8A8]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#102444] ${className}`}
    >
      <svg
        className="w-4 h-4 fill-current flex-shrink-0"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12.031 2C6.511 2 2.023 6.488 2.023 12.008c0 1.956.564 3.782 1.542 5.334L2 22l4.808-1.528a9.96 9.96 0 0 0 5.223 1.472h.004c5.52 0 10.008-4.488 10.008-10.008A10.01 10.01 0 0 0 12.031 2zm5.792 14.155c-.24.675-1.393 1.29-1.928 1.34-.492.046-1.127.067-3.262-.816-2.564-1.06-4.22-3.66-4.348-3.83-.127-.17-1.042-1.385-1.042-2.641 0-1.256.657-1.874.89-2.128.233-.255.508-.318.677-.318.17 0 .339.002.487.01.157.009.367-.06.574.437.212.509.721 1.76.785 1.887.064.127.106.276.021.446-.084.17-.127.276-.254.424-.127.148-.267.33-.381.444-.127.127-.26.265-.112.52.148.254.657 1.085 1.409 1.755.968.862 1.784 1.13 2.038 1.257.254.127.402.106.551-.064.148-.17.635-.741.805-.995.17-.254.339-.212.571-.127.233.085 1.473.694 1.727.821.254.127.424.19.487.297.063.106.063.614-.177 1.289z" />
      </svg>
      {showText && <span>{displayLabel}</span>}
    </a>
  );
}
