"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ShieldCheck,
  ArrowRight,
  Clock,
  MousePointer,
} from "lucide-react";

export default function ApplicationPipelineProductPage() {
  useEffect(() => {
    document.title = "Application Pipeline & Review Queue | ZOBVERSE AI Product";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-product.jpg"
            alt="Application Pipeline Command Center"
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
            <span className="text-cyan-400 font-semibold">Application Pipeline</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Pre-Flight Approval Queue &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Zero-Fabrication Dispatch.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Every AI-generated response, custom cover letter, and screening questionnaire must strictly verify against your verified resume facts before reaching your pre-flight approval queue.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Launch Review Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/security"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              Inspect Security Rules &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Account-specific review content is available only in the dashboard. */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Review your real application queue
          </h2>
          <p className="text-sm text-slate-400">
            Job prompts, resume facts, and prepared answers are specific to your account and are not represented with sample records on this public page.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center">
          <Link
            href="/dashboard/review"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Open your review queue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Engineering Pillars of the Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-900">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Rule 2 Zero-Fabrication</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an ATS question asks for a skill you do not possess, the agent explicitly discloses it or flags it for manual guidance. It will never invent credentials.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MousePointer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Stealth Human Emulation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Playwright browser automation introduces humanized keystroke latencies, natural cursor movement paths, and random pauses to avoid anti-bot flags.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Screenshot Audit Trail</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every completed submission automatically captures a high-resolution screenshot and receipt hash saved to your local database for permanent auditability.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Deploy the High-Fidelity Review Queue</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Stop sending blindly. Review tailored, citation-backed applications in seconds and build a high-conversion interview funnel.
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
