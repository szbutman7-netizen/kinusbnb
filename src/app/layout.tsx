import type { Metadata, Viewport } from "next";
import { Assistant, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import { LanguageProvider } from "@/lib/context/LanguageContext";
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
  title: "כינוס השלוחים העולמי - מערכת רישום ואירוח | International Kinus HaShluchim",
  description: "הרשמה, סליקה ושיבוץ לינה לשלוחי חב\"ד בכינוס השלוחים העולמי - Official Kinus Housing & Registration",
  icons: {
    icon: "/assets/kinus-emblem.svg",
    shortcut: "/assets/kinus-emblem.svg",
    apple: "/assets/kinus-emblem.svg",
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
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

