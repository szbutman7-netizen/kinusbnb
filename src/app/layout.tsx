import type { Metadata } from "next";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "כינוס השלוחים העולמי - מערכת רישום ואירוח",
  description: "הרשמה, סליקה ושיבוץ לינה לשלוחי חב\"ד בכינוס השלוחים העולמי",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
