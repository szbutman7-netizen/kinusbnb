import type { Metadata, Viewport } from "next";
import { Assistant, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kinusbed.vercel.app"),
  title: {
    default: "כינוס השלוחים העולמי - מערכת רישום ואירוח | International Conference of Shluchim",
    template: "%s | כינוס השלוחים העולמי",
  },
  description: "הרשמה, סליקה ושיבוץ לינה לשלוחי חב\"ד בכינוס השלוחים העולמי תשפ\"ה - Official Kinus Housing & Registration",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "כינוס השלוחים",
  },
  alternates: {
    canonical: "https://kinusbed.vercel.app",
  },
  openGraph: {
    title: "כינוס השלוחים העולמי - מערכת רישום ואירוח",
    description: "הרשמה, סליקה ושיבוץ לינה לשלוחי חב\"ד בכינוס השלוחים העולמי תשפ\"ה • Official Kinus Housing & Registration",
    url: "https://kinusbed.vercel.app",
    siteName: "כינוס השלוחים העולמי",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "כינוס השלוחים העולמי - מערכת רישום ואירוח",
        type: "image/jpeg",
      },
      {
        url: "/og-square.jpg",
        width: 600,
        height: 600,
        alt: "כינוס השלוחים העולמי",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "כינוס השלוחים העולמי - מערכת רישום ואירוח",
    description: "הרשמה, סליקה ושיבוץ לינה לשלוחי חב\"ד בכינוס השלוחים העולמי תשפ\"ה",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/kinus-emblem.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  other: {
    "image_src": "https://kinusbed.vercel.app/og-image.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B1A30",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`h-full antialiased overflow-x-hidden w-full ${assistant.variable} ${playfair.variable}`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden w-full">
        <ServiceWorkerRegister />
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

