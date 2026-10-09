"use client";

interface KinusLogoProps {
  className?: string;
  size?: number;
  color?: string; // default gold: #E8D8A8
}

export function KinusLogo({ className = "", size = 48, color = "#E8D8A8" }: KinusLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Globe Ring */}
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="1.8" />
      <circle cx="50" cy="50" r="41" stroke={color} strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />

      {/* Globe Latitudes & Longitudes */}
      <ellipse cx="50" cy="50" rx="46" ry="18" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <ellipse cx="50" cy="50" rx="20" ry="46" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <line x1="4" y1="50" x2="96" y2="50" stroke={color} strokeWidth="0.8" opacity="0.35" />
      <line x1="50" y1="4" x2="50" y2="96" stroke={color} strokeWidth="0.8" opacity="0.35" />

      {/* 770 Eastern Parkway Silhouette Centerpiece */}
      {/* Base */}
      <rect x="22" y="52" width="56" height="24" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />

      {/* 3 Iconic Gothic Gables of 770 */}
      {/* Left Gable */}
      <path d="M22 52 L31 32 L40 52 Z" fill={color} fillOpacity="0.85" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      {/* Center Gable (Taller) */}
      <path d="M40 52 L50 25 L60 52 Z" fill={color} fillOpacity="0.95" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      {/* Right Gable */}
      <path d="M60 52 L69 32 L78 52 Z" fill={color} fillOpacity="0.85" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Windows on 770 facade */}
      <rect x="28" y="58" width="5" height="8" rx="2.5" fill="#07142A" stroke={color} strokeWidth="0.6" />
      <rect x="47.5" y="56" width="5" height="10" rx="2.5" fill="#07142A" stroke={color} strokeWidth="0.8" />
      <rect x="67" y="58" width="5" height="8" rx="2.5" fill="#07142A" stroke={color} strokeWidth="0.6" />

      {/* Entrance Door */}
      <path d="M46 76 L46 68 A4 4 0 0 1 54 68 L54 76 Z" fill="#07142A" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}
