"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Terminal,
  Search,
  Send,
  Calendar,
  Award,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Sliders,
  Activity,
  Layers,
  FileText,
  BarChart3,
  Cpu,
  Clock,
  Eye,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

const MODULES = [
  {
    id: "dashboard",
    name: "Autonomous Agent Dashboard",
    tagline: "The Central Intelligence & Autonomous Control Room",
    icon: Terminal,
    color: "from-cyan-500 to-blue-600",
    desc: "A localized operational bridge giving you total command over background daemons, scraping schedules, telemetry counters, and candidate brain parameters.",
    highlights: [
      "Real-time daemon worker status (Idle, Discovering, Matching, Dispatched)",
      "Daily rate limiting guardrails to preserve account reputation",
      "One-click agent pause, instant emergency halt, and full telemetry audit",
      "Live activity log tracking every automated browser interaction",
    ],
  },
  {
    id: "search",
    name: "Live Job Feed & Discovery",
    tagline: "Real-Time Multi-Source Role Ingestion & Scoring",
    icon: Search,
    color: "from-blue-600 to-indigo-600",
    desc: "Ingests open software engineering roles from LinkedIn and remote job ecosystems, deduplicating postings and scoring fit against your verified CV facts.",
    highlights: [
      "Automated extraction of compensation bands and equity disclosures",
      "Explainable match scores derived from skill overlap and seniority",
      "Negative constraint filters (blacklist companies, non-remote exclusions)",
      "Cryptographic job deduplication preventing repeated evaluations",
    ],
  },
  {
    id: "pipeline",
    name: "Application Pipeline & Review Queue",
    tagline: "Human-in-the-Loop Tailoring with Zero Fabrication",
    icon: Send,
    color: "from-indigo-600 to-purple-600",
    desc: "Every auto-generated response, custom cover paragraph, and questionnaire submission must pass Rule 2 anti-fabrication verification before human review.",
    highlights: [
      "Side-by-side comparison of job requirements versus your CV facts",
      "Rule 2 cryptographic citations linking every claim back to your resume",
      "Single-click batch approval or granular candidate customization",
      "Automated stealth dispatch through isolated headless Playwright instances",
    ],
  },
  {
    id: "interviews",
    name: "Interview Tracker & Orchestration",
    tagline: "End-to-End Interview Round & Context Management",
    icon: Calendar,
    color: "from-purple-600 to-pink-600",
    desc: "Consolidates screening calls, technical rounds, system design discussions, and executive interviews with synchronized candidate notes and preparation cards.",
    highlights: [
      "Interviewer background synchronization and historical questions asked",
      "Curated question bank tailored to the company's tech stack",
      "Post-interview reflection logs and debrief notes saved in local DB",
      "Timeline calendar visualization with status milestones",
    ],
  },
  {
    id: "offers",
    name: "Offer Comparison & Negotiation Engine",
    tagline: "Total Compensation Decomposition & Package Analysis",
    icon: Award,
    color: "from-emerald-500 to-cyan-600",
    desc: "Evaluate competing offers side-by-side across base salary, annual performance bonuses, equity vesting schedules, and remote work stipends.",
    highlights: [
      "Calculates annualized total compensation factoring 4-year vesting cliffs",
      "Tax bracket estimations and geographic cost-of-living adjustments",
      "AI-assisted negotiation script generation based on verified market percentiles",
      "Decision matrix scoring culture, benefits, and career trajectory",
    ],
  },
];

export default function ProductPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    document.title = "Product Overview & Core Modules | ZOBVERSE AI";
    // Check hash on load
    if (window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (MODULES.some((m) => m.id === hashId)) {
        setActiveTab(hashId);
      }
    }
  }, []);

  const activeModule = MODULES.find((m) => m.id === activeTab) || MODULES[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Section with Bespoke Product Background */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        {/* Background Visual with Cyber Scanlines and Dark Overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-product.jpg"
            alt="ZOBVERSE AI Product Command Center"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-screen scale-105 animate-cyber-pulse"
          />
          <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-cyber-scan pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Autonomous Architecture. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Five Deep Integrated Modules.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Explore the complete feature suite of ZOBVERSE AI. From discovery and automated CV vision parsing
            to strict review verification, interview tracking, and compensation negotiation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-semibold transition-all"
            >
              Explore Workflow &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Module Navigator */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-white">Select a Product Subsystem</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Click any module below to inspect its operational mechanics, data flow, and telemetry guarantees.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-800 pb-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setActiveTab(mod.id);
                  window.history.replaceState(null, "", `#${mod.id}`);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Showcase Card */}
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/80 p-8 sm:p-12 shadow-2xl space-y-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400">
                <activeModule.icon className="w-3.5 h-3.5" />
                <span>Subsystem Module: {activeModule.id.toUpperCase()}</span>
              </div>
              <h3 className="text-3xl font-black text-white">{activeModule.name}</h3>
              <p className="text-sm font-semibold text-cyan-300 font-mono">{activeModule.tagline}</p>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{activeModule.desc}</p>

              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Engineering Capabilities:
                </h4>
                <ul className="space-y-2.5">
                  {activeModule.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your account data
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Live counts and performance data are only available inside your signed-in dashboard.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-cyan-200"
                >
                  Sign in to view your data <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-tr from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-500/20 space-y-2 text-center">
                <div className="text-xs font-bold text-white">Ready to Deploy?</div>
                <p className="text-[11px] text-slate-400">
                  Sign in to your local dashboard instance to launch this autonomous module.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={`/product/${activeModule.id}`}
                    className="inline-block px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all text-center"
                  >
                    Open {activeModule.name} Page &rarr;
                  </Link>
                  <Link
                    href="/register"
                    className="inline-block px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all text-center"
                  >
                    Deploy Module
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Five Modules Deep-Dive Sections */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/60 space-y-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {MODULES.map((mod, index) => {
          const Icon = mod.icon;
          const isEven = index % 2 === 0;
          return (
            <div
              key={mod.id}
              id={mod.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 scroll-mt-24`}
            >
              <div className={`lg:col-span-6 space-y-4 ${isEven ? "" : "lg:order-2"}`}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">{mod.name}</h3>
                <p className="text-xs font-mono text-cyan-400">{mod.tagline}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{mod.desc}</p>
                <ul className="space-y-2 pt-2">
                  {mod.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Link
                    href={`/product/${mod.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold transition-all shadow-md"
                  >
                    <span>Open Detailed {mod.name} Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className={`lg:col-span-6 ${isEven ? "" : "lg:order-1"}`}>
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">daemon::{mod.id}_worker.py</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-slate-400 space-y-1 text-[11px] leading-relaxed">
                    <div><span className="text-cyan-400">class</span> <span className="text-white">{mod.name.replace(/\s+/g, "")}Service</span>:</div>
                    <div className="pl-4 text-slate-500"># Autonomous non-blocking async executor</div>
                    <div className="pl-4"><span className="text-blue-400">async def</span> <span className="text-indigo-300">execute_cycle</span>(self, candidate_id: UUID):</div>
                    <div className="pl-8 text-slate-400">state = await self.db.get_candidate_context(candidate_id)</div>
                    <div className="pl-8 text-slate-400">verified = enforce_rule2_anti_fabrication(state)</div>
                    <div className="pl-8 text-emerald-400">return PipelineResult(status=&quot;SUCCESS&quot;, verified=True)</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <PublicFooter />
    </div>
  );
}
