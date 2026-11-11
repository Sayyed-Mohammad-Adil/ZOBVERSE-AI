"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Award,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Layers,
  Sparkles,
  Percent,
} from "lucide-react";

export default function OfferComparisonProductPage() {
  useEffect(() => {
    document.title = "Offer Comparison & Negotiation Engine | ZOBVERSE AI Product";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-product.jpg"
            alt="Offer Comparison & Negotiation Engine"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/product" className="hover:text-cyan-300 transition-colors">Product</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Offer Comparison</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Offer Comparison &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Negotiation Intelligence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Deconstruct competing offers down to annualized net compensation. Factor in 4-year vesting schedules, cliffs, tax implications, and craft data-backed negotiation scripts.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Compare Your Offers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              View Free License &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Offer comparison data is shown only from the signed-in user's account. */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Account-based offer comparison
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Compare offers using your own records
          </h2>
          <p className="text-sm text-slate-400">
            This public page does not display sample companies, compensation figures, or account data. Sign in to view offers saved to your account.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 text-center space-y-4">
          <p className="text-sm text-slate-300">
            Offer details are private account data and are not available in this public product overview.
          </p>
          <Link
            href="/dashboard/offers"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            View your offer tracker
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {/* 3 Core Negotiation Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-900">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4-Year Equity Vesting Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Model standard 1-year cliffs versus backloaded Amazon-style schedules (5/15/40/40) to forecast actual cashflow over your expected tenure.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Geographic Tax &amp; Cost of Living</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates local state tax, municipal income taxes, and city cost-of-living adjustments to provide a true apples-to-apples comparison.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI-Assisted Negotiation Scripts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate polite, assertive counter-offer emails leveraging competing timelines, market percentiles, and specific terms you want improved.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Maximize Your Career Value</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Negotiate with confidence and clarity using verified market benchmarks and transparent total compensation modeling.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
