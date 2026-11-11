"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Layers,
  Cpu,
  Scan,
  ShieldCheck,
  Database,
  Terminal,
  ArrowRight,
  Server,
  Lock,
  MousePointer,
  CheckCircle2,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

const ARCH_LAYERS = [
  {
    layer: "Layer 01",
    name: "Perception & Vision Engine",
    tech: "Light-OCR Vision Core",
    icon: Scan,
    color: "from-cyan-500 to-blue-600",
    desc: "Computer vision model that parses resumes page-by-page. Instead of scrambling multi-column layouts into broken text streams, it identifies layout hierarchy, verified skills, and experience blocks with bounding coordinates.",
  },
  {
    layer: "Layer 02",
    name: "Cognitive Alignment Engine",
    tech: "Laya Multi-Vector Reasoning",
    icon: Cpu,
    color: "from-blue-600 to-indigo-600",
    desc: "Computes multi-factor semantic alignment between candidate resume facts and job requisition criteria. Outputs transparent scoring explanations, skill gaps, and CV version recommendations.",
  },
  {
    layer: "Layer 03",
    name: "Rule 2 Verification Guard",
    tech: "Cryptographic Anti-Fabrication",
    icon: ShieldCheck,
    color: "from-indigo-600 to-purple-600",
    desc: "Verification layer that inspects every generated answer or cover paragraph. Every single factual statement must trace back to an exact sentence in the verified resume database.",
  },
  {
    layer: "Layer 04",
    name: "Autonomous Execution & Persistence",
    tech: "FastAPI + Local PostgreSQL",
    icon: Database,
    color: "from-purple-600 to-pink-600",
    desc: "Asynchronous task daemon orchestrating continuous discovery, candidate queues, and historical telemetry stored exclusively within a localized, sovereign PostgreSQL database.",
  },
  {
    layer: "Layer 05",
    name: "Stealth Dispatch Daemon",
    tech: "Playwright Headless Stealth",
    icon: MousePointer,
    color: "from-pink-600 to-rose-600",
    desc: "Navigates multi-step ATS portal questionnaires using natural typing delays, realistic mouse curves, and stored session cookies. Automatically saves full-page screenshot receipts.",
  },
];

export default function SystemArchitecturePage() {
  useEffect(() => {
    document.title = "System Architecture & Engine Internals | ZOBVERSE AI Resources";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-resources.jpg"
            alt="System Architecture Matrix"
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
            <span className="text-cyan-400 font-semibold">System Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            System Architecture &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Technical Stack Overview.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            A comprehensive breakdown of how ZOBVERSE AI couples local computer vision, anti-fabrication policy engines, asynchronous background daemons, and sovereign data storage.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/resources/audits"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Inspect Telemetry &amp; Audits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources/api"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              REST API Endpoints &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Architecture Layers Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Modular Subsystem Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            5 Distinct Layers of the ZOBVERSE AI Engine
          </h2>
          <p className="text-sm text-slate-400">
            Each layer operates with a strict separation of concerns, ensuring local privacy, zero cloud exposure, and verifiable truth.
          </p>
        </div>

        <div className="space-y-6">
          {ARCH_LAYERS.map((l) => {
            const Icon = l.icon;
            return (
              <div
                key={l.layer}
                className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-3 space-y-2">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                      {l.layer}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${l.color} p-0.5 shadow-md`}>
                        <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-base">{l.name}</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400 block">{l.tech}</span>
                  </div>

                  <div className="lg:col-span-9 text-xs sm:text-sm text-slate-300 leading-relaxed border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
                    {l.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Sovereignty Principles */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Data Sovereignty by Design</h3>
            <p className="text-xs text-slate-400">Core architectural constraints enforced across the codebase</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-emerald-400 font-mono">0% Cloud Data Leakage</div>
              <p className="text-xs text-slate-400">All resume text, platform cookies, and company notes reside only in your local PostgreSQL cluster.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">Private LLM Ready</div>
              <p className="text-xs text-slate-400">Plug-and-play local reasoning via Ollama (Llama 3, Mistral, Qwen) without transmitting data to OpenAI.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-purple-400 font-mono">Auditable Open Source</div>
              <p className="text-xs text-slate-400">The entire dispatch pipeline and Light-OCR vision model are auditable on GitHub for total transparency.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Deploy on Your Infrastructure</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Run ZOBVERSE AI as a sovereign AI application with Docker Compose or standalone Python virtual environments.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Deploy Local Node</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
