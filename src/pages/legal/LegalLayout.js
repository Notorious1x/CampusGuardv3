import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function LegalLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-gray-950 dark:to-gray-900">
      <header className="container mx-auto flex items-center justify-between p-4 max-w-4xl">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-red-600" />
          <span className="font-bold text-xl tracking-tight">CampusGuard</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to Home
        </Link>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border p-6 md:p-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>}
          <div className="space-y-6 text-sm leading-relaxed text-foreground/90">{children}</div>
        </div>
        <div className="flex items-center justify-center gap-4 py-6 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground underline">Terms &amp; Conditions</Link>
          <Link to="/faq" className="hover:text-foreground underline">FAQs</Link>
        </div>
      </main>
    </div>
  );
}

export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-2">{heading}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}
