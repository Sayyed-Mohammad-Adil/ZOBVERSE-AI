"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  FileCode,
  Terminal,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function PipelineAuditTelemetryPage() {
  useEffect(() => {
    document.title = "Pipeline & Audit Telemetry | Open Job Resources";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-resources.jpg"
            alt="Pipeline & Audit Telemetry Matrix"
            fill
            priority
            className="object-cover object-center opacity-35 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/resources" className="hover:text-cyan-300 transition-colors">Resources</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Pipeline &amp; Audit Telemetry</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Pipeline Telemetry &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Cryptographic Receipts.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Every submission, automated answer, and Playwright browser interaction generates a tamper-evident audit receipt stored locally in your PostgreSQL instance.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/resources/api"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Query via API</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/security"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              Security Guarantees &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Main Audit Telemetry Specs */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 3 Telemetry Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">SHA-256 Submission Receipts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every dispatched job payload computes a cryptographic hash stored alongside the target requisition URL and timestamp for immutable proof of submission.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Playwright Visual Proofs</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The stealth dispatcher takes an automatic full-page screenshot upon reaching the final application confirmation screen, saving the image to your local drive.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Rate Limit Token Buckets</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adaptive token bucket algorithms log rate limit metrics, jitter backoff events, and CAPTCHA halt triggers to ensure candidate accounts remain in good standing.
            </p>
          </div>
        </div>

        {/* Live Local Audit Log Inspector */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Your Local Audit Trail</h2>
            <p className="text-xs text-slate-400">Real audit events are recorded in your own account.</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <p className="text-sm text-slate-300">
              No account-specific audit records are shown on this public page.
            </p>
            <Link href="/register" className="mt-4 inline-flex text-sm font-semibold text-cyan-400 hover:text-cyan-300">
              Create an account to view your real activity <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Audit Every Agent Interaction</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Gain complete visibility into your autonomous career pipeline with cryptographically verifiable audit trails.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Deploy Auditable Node</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
