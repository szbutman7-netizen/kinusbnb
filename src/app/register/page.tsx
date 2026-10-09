import { Navbar } from "@/components/layout/Navbar";
import { RegistrationForm } from "@/components/public/RegistrationForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#040D1E] text-slate-100 font-sans selection:bg-[#E8D8A8] selection:text-[#040D1E]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#E8D8A8] hover:text-white transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            חזרה למידע כללי על הכינוס
          </Link>
          <span className="text-xs text-slate-400 font-serif">ב״ה</span>
        </div>

        <RegistrationForm />
      </main>

      <footer className="border-t border-slate-800 bg-[#020813] py-6 text-center text-xs text-slate-500">
        כינוס השלוחים העולמי תשפ״ז • מחלקת אירוח ולינה
      </footer>
    </div>
  );
}
