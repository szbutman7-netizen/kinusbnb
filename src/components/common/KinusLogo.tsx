"use client";

import Image from "next/image";

interface KinusLogoProps {
  className?: string;
  size?: number;
  variant?: "emblem" | "full";
  color?: string; // maintained for backward compatibility
  alt?: string;
}

export function KinusLogo({
  className = "",
  size = 48,
  variant = "emblem",
  alt = "סמל כינוס השלוחים העולמי",
}: KinusLogoProps) {
  if (variant === "full") {
    // Kinus horizontal logo: 6045 x 1499 ≈ 4.03 : 1
    const width = Math.round(size * 4.03);
    return (
      <Image
        src="/assets/kinus-logo.svg"
        alt={alt}
        width={width}
        height={size}
        className={`object-contain ${className}`}
        priority
      />
    );
  }

  // Kinus circular 770 emblem: 1:1
  return (
    <Image
      src="/assets/kinus-emblem.svg"
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}
