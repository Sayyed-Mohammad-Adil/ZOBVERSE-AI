"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Terminal,
  Activity,
  Sliders,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Layers,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

const DAEMON_SERVICES = [
  {
    name: "Job discovery",
    desc: "Queued discovery jobs query the LinkedIn public search feed and Jobicy remote-jobs API. Listings are stored with their source URLs and available source fields.",
  },
  {
    name: "Profile-based matching",
    desc: "Matching compares saved candidate profile information with discovered job listings.",
  },
  {
    name: "Human review queue",
    desc: "Prepared applications can be reviewed and approved from the candidate dashboard before submission.",
  },
  {
    name: "Application preparation",
    desc: "The backend prepares application information from saved profile data and the selected job listing.",
  },
];

export default function AgentDashboardProductPage() {
  useEffect(() => {
    document.title = "Agent Dashboard — Autonomous Control Room | Open Job";
  }, []);

  const [activeTab, setActiveTab] = useState<"architecture" | "daemons" | "safety">("architecture");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-product.jpg"
            alt="Autonomous Agent Dashboard Command Center"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/product" className="hover:text-cyan-300 transition-colors">Product</Link>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">Agent Dashboard</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Autonomous Agent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Control Dashboard.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            A localized, single-pane operational bridge giving candidates absolute transparency and complete control over background scraper workers, matching algorithms, and dispatch queues.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Deploy Local Agent</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              How It Works &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Account data note */}
      <section className="border-b border-slate-900 bg-slate-950/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-300 text-center">
            Account-specific counts and worker status are shown in the signed-in dashboard, not in this product overview.
          </p>
        </div>
      </section>

      {/* Deep-Dive Content Sections */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "architecture"
                ? "bg-slate-900 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture &amp; State Loop</span>
          </button>
          <button
            onClick={() => setActiveTab("daemons")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "daemons"
                ? "bg-slate-900 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>4 Daemon Subsystems</span>
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "safety"
                ? "bg-slate-900 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900/50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Fail-Safes &amp; Rate Limits</span>
          </button>
        </div>

        {/* Tab 1: Architecture State Loop */}
        {activeTab === "architecture" && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                  Autonomous Cycle Architecture
                </div>
                <h2 className="text-3xl font-black text-white">
                  Continuous Feedback &amp; Decision Loop
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The dashboard operates on an asynchronous finite state machine. It triggers discovery passes, processes multi-column visual CV parsing with Light-OCR, scores compatibility, and queues submissions for explicit candidate verification.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Full Status Observability</div>
                      <div className="text-xs text-slate-400">Inspect worker cycles, task queue depth, and memory consumption in real time.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Zero Third-Party Telemetry</div>
                      <div className="text-xs text-slate-400">All metrics and application logs reside purely within your local PostgreSQL instance.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">One-Click Emergency Freeze</div>
                      <div className="text-xs text-slate-400">Instantly halt all background Playwright browser instances and pending API dispatches.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account state note */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl space-y-4">
                  <h3 className="text-lg font-bold text-white">View your live account data</h3>
                  <p className="text-sm text-slate-300">
                    This public page does not connect to a candidate account or display live worker status.
                    Sign in to view your saved listings, application queue, and event logs.
                  </p>
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-cyan-200">
                    Sign in to the dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Daemons Breakdown */}
        {activeTab === "daemons" && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-black text-white">Backend Workflow</h2>
              <p className="text-sm text-slate-400">
                These are implemented backend workflows, not live service-status indicators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DAEMON_SERVICES.map((d) => (
                <div key={d.name} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-cyan-500/30 transition-all">
                  <span className="text-sm font-bold text-white">{d.name}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Fail-Safes & Rate Limits */}
        {activeTab === "safety" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Daily Dispatch Caps</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prevents sudden volume spikes. Configurable upper ceiling (e.g. max 15 submissions per 24 hours) preserves candidate account standing.
              </p>
              <div className="text-[11px] font-mono text-amber-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                MAX_DAILY_DISPATCH=15
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Local Credential Vault</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform session cookies and API tokens are encrypted with AES-256 at rest. No third-party proxy ever touches your raw keys.
              </p>
              <div className="text-[11px] font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                VAULT_ENCRYPTION=AES_256_GCM
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Human Approval Gate</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The agent will never bypass your review queue without explicit pre-flight approval, regardless of automation mode setting.
              </p>
              <div className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                REQUIRE_HUMAN_SIGN_OFF=true
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Experience Autonomous Control</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Run the dashboard locally on your own machine. Connect your PostgreSQL database, load your resumes, and let the agent work for you.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Launch Local Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
