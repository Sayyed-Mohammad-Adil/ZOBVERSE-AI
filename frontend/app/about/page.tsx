"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ShieldCheck,
  Eye,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  FileText,
  ExternalLink,
  Globe,
  Database,
  ArrowRight,
  Heart,
  Code2,
  Scan,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

export default function PublicAboutPage() {
  useEffect(() => {
    document.title = "About | Open Job & Open Code Ecosystem";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Showcase Banner with Animated Cybernetic AI Background */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        {/* Background Cybernetic AI Visual with Pulse Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/about-ai-core.jpg"
            alt="Open Job Cybernetic AI Humanoid Core"
            fill
            priority
            className="object-cover object-right md:object-[80%_center] opacity-40 mix-blend-screen scale-105 animate-cyber-pulse"
          />
          {/* Animated Ambient Cyber Scanline */}
          <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-cyber-scan pointer-events-none" />

          {/* Multi-layer gradient overlays ensuring pristine legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <OpenCodeLogo className="w-5 h-5" glow animated />
              <span className="text-[11px] font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent uppercase font-mono">
                Open Code Ecosystem
              </span>
            </div>
            <span className="text-xs text-cyan-400 font-mono flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <Eye className="w-3.5 h-3.5" /> Powered by Light-OCR
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Rule 2 Anti-Fabrication
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Autonomous, Sovereign &amp; Truthful Career Intelligence.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Open Job replaces blind application spam with high-precision, factual career alignment.
            Engineered with zero hallucination constraints, local document vision powered by Light-OCR,
            and complete candidate sovereignty.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Launch Agent Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-semibold transition-all"
            >
              Explore Features &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy & The Open Code Manifesto */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              The Problem with Legacy Bots
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Why We Built Open Job
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              The modern hiring landscape is flooded with low-quality auto-apply bots that spam hundreds of resumes an hour.
              These tools fabricate skills, invent years of experience, trigger account bans on LinkedIn, and waste everyone&apos;s time.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              We built <strong>Open Job</strong> under the <strong>Open Code</strong> initiative as an antidote to this madness:
              a high-fidelity, autonomous agent that acts like a private executive recruiter. It analyzes your genuine resume,
              evaluates real job requirements, computes explainable match ratings, and prepares tailored applications with 100% human-in-the-loop oversight.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-2xl font-black text-cyan-400 font-mono">0%</div>
                <div className="text-xs font-bold text-white">Hallucinated Claims</div>
                <p className="text-[11px] text-slate-400">Strictly enforced by Rule 2 protocol</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
                <div className="text-xs font-bold text-white">Data Sovereignty</div>
                <p className="text-[11px] text-slate-400">Local DB, local credentials, no spying</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Radical Truth Guarantee</h4>
                  <p className="text-xs text-slate-400">Rule 2 Candidate Anti-Fabrication Engine</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every claim submitted in an application is verified against your actual resume. If you have 3 years of React experience, the agent will never claim 7 years just to bypass a filter.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Light-OCR Multi-Modal Vision</h4>
                  <p className="text-xs text-slate-400">Layout-aware deep visual parsing</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rather than treating resumes like plain ASCII, Light-OCR reads the visual geometry, column structures, skill badges, and timeline flows without text interleaving.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Laya Neural Reasoning</h4>
                  <p className="text-xs text-slate-400">Explainable fit scoring and contextual tailoring</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates high-signal introductory statements and cover notes that sound like a thoughtful professional, avoiding clichéd marketing jargon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Open Code Architecture
            </h2>
            <h3 className="text-3xl font-black text-white">Full-Stack Technology Ecosystem</h3>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Modern, reactive, and built entirely on open, battle-tested technologies.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase">Frontend</div>
              <div className="font-bold text-white text-sm">Next.js 16 App Router</div>
              <p className="text-xs text-slate-400">React 19, Tailwind CSS, Lucide, GSAP animations</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-blue-400 font-bold uppercase">Backend API</div>
              <div className="font-bold text-white text-sm">FastAPI + Python 3.12</div>
              <p className="text-xs text-slate-400">Asynchronous I/O, Pydantic v2 schemas, JWT auth</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase">Vision Model</div>
              <div className="font-bold text-white text-sm">Light-OCR Engine</div>
              <p className="text-xs text-slate-400">Sub-second PDF &amp; image visual document parsing</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-purple-400 font-bold uppercase">Persistence</div>
              <div className="font-bold text-white text-sm">PostgreSQL + SQLAlchemy</div>
              <p className="text-xs text-slate-400">Local relational sandbox, Alembic migrations, AES vault</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Experience Open Job?
          </h3>
          <p className="text-sm text-slate-400">
            Join the movement towards honest, automated job applications.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all"
            >
              Deploy Your Free Agent →
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
