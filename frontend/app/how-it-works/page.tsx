"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  FileText,
  Sliders,
  Compass,
  BarChart3,
  UserCheck,
  Send,
  ArrowRight,
  CheckCircle2,
  Scan,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

const PIPELINE_STAGES = [
  {
    step: "01",
    title: "CV Perception & Light-OCR Parsing",
    subtitle: "Visual layout decomposition & skill bounding boxes",
    icon: Scan,
    color: "from-cyan-500 to-blue-600",
    badge: "Computer Vision",
    description:
      "Your resume is processed through our embedded Light-OCR multi-modal vision engine. Rather than scrambling multi-column layouts into garbled strings, Light-OCR reads the visual hierarchy, identifying work history, verified accomplishments, and technical stacks with 99.4% layout confidence.",
    details: [
      "Preserves asymmetric two-column layouts and design headers",
      "Assigns bounding-box coordinates to all verified skills",
      "Locks ground-truth candidate facts into the local database",
    ],
  },
  {
    step: "02",
    title: "Target Definition & Boundary Guardrails",
    subtitle: "Setting salary minimums, remote preferences & exclusions",
    icon: Sliders,
    color: "from-blue-600 to-indigo-600",
    badge: "Policy Engine",
    description:
      "Configure your exact career parameters. Set minimum base compensation, preferred titles (e.g. Senior Backend / Staff AI Engineer), remote vs hybrid requirements, and blacklisted companies you never want your application submitted to.",
    details: [
      "Custom blacklist filters to exclude past employers or agencies",
      "Location radius and time-zone overlap matching",
      "Strict minimum compensation gating to eliminate lowball postings",
    ],
  },
  {
    step: "03",
    title: "Continuous Multi-Channel Discovery",
    subtitle: "Real-time scanning & cryptographic de-duplication",
    icon: Compass,
    color: "from-indigo-600 to-purple-600",
    badge: "Scraping & Ingestion",
    description:
      "ZOBVERSE AI runs background search workers querying LinkedIn job feeds, direct company career portals, and remote job listings. A cryptographic fingerprinting system ensures reposted or mirrored jobs are deduplicated so you never apply twice to the same requisition.",
    details: [
      "Automated hourly discovery pulses across primary channels",
      "SHA-256 requisition deduplication across multi-board mirrors",
      "Direct extraction of hiring manager names and post dates",
    ],
  },
  {
    step: "04",
    title: "Explainable Match Evaluation",
    subtitle: "Multi-vector semantic distance & transparent pros/cons",
    icon: BarChart3,
    color: "from-purple-600 to-pink-600",
    badge: "Laya AI Reasoning",
    description:
      "Every discovered role undergoes rigorous compatibility scoring (0-100). The agent evaluates technical fit, seniority alignment, domain overlap, and ATS keyword relevance. You get an instant itemized breakdown of why you fit and any identified gaps.",
    details: [
      "No mystery black-box scores: detailed pros, cons, and missing items",
      "Evaluates real conceptual depth rather than shallow keyword stuffing",
      "Sorts opportunities by highest statistical interview conversion rate",
    ],
  },
  {
    step: "05",
    title: "Human-in-the-Loop Pre-Flight Review",
    subtitle: "100% candidate control before any data is dispatched",
    icon: UserCheck,
    color: "from-pink-600 to-rose-600",
    badge: "Zero Hallucination",
    description:
      "Before an application is submitted, you can inspect the tailored responses, personalized introductory notes, and attached resume. Review everything with one click in your Dashboard, or enable autonomous mode for verified scores above 90%.",
    details: [
      "One-click approve, modify, or reject within the live dashboard",
      "Rule 2 Anti-Fabrication ensures answers stay 100% honest",
      "Live preview of all custom essay responses and questionnaires",
    ],
  },
  {
    step: "06",
    title: "Stealth Dispatch & Unified Lifecycle Tracking",
    subtitle: "Playwright human emulation & PostgreSQL audit history",
    icon: Send,
    color: "from-rose-600 to-cyan-500",
    badge: "Playwright Stealth",
    description:
      "The stealth dispatcher navigates the application portal using natural typing delays, realistic mouse curves, and stored session cookies. Once submitted, the application transitions to your pipeline tracker where you log interview rounds, notes, and offers.",
    details: [
      "Humanized keystroke latency evades anti-bot detection",
      "Encrypted screenshot and receipt logging for full auditability",
      "Direct kanban tracking: Applied → Screening → Interview → Offer",
    ],
  },
];

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = "How It Works | ZOBVERSE AI Pipeline Architecture";
  }, []);

  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-900 bg-slate-950">
        {/* Workflow Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-workflow.jpg"
            alt="ZOBVERSE AI Pipeline Workflow"
            fill
            priority
            className="object-cover object-center opacity-35 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-cyan-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            How ZOBVERSE AI Works. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              From Raw Resume to Final Offer.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            Follow the 6-stage autonomous workflow that turns noisy job hunting into a methodical,
            verifiable career advantage with zero spam and total candidate sovereignty.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Launch Pipeline in Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-semibold transition-all"
            >
              Explore Core Features →
            </Link>
          </div>
        </div>
      </section>

      {/* Sequential Pipeline Walkthrough */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Stage Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">
              Select Pipeline Stage
            </div>
            {PIPELINE_STAGES.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = activeStep === idx;
              return (
                <button
                  key={item.step}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center gap-4 ${
                    isSelected
                      ? "bg-slate-900 border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                      : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/30"
                        : "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isSelected ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? "text-cyan-400 translate-x-1" : "text-slate-600"
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Deep Stage Detail Card */}
          <div className="lg:col-span-7">
            {(() => {
              const current = PIPELINE_STAGES[activeStep];
              const Icon = current.icon;
              return (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono shadow-sm">
                      {current.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      STAGE {current.step} OF 06
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${current.color} p-0.5 shadow-lg shadow-blue-500/25`}>
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-3">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{current.title}</h3>
                      <p className="text-xs text-slate-400">{current.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed pt-2">
                    {current.description}
                  </p>

                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Key Technical Capabilities:
                    </h5>
                    <div className="space-y-2">
                      {current.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                      disabled={activeStep === 0}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      ← Previous Stage
                    </button>
                    <button
                      onClick={() => setActiveStep((prev) => Math.min(PIPELINE_STAGES.length - 1, prev + 1))}
                      disabled={activeStep === PIPELINE_STAGES.length - 1}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Complete Workflow Architecture Diagram */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Interactive Execution Pipeline
            </h2>
            <h3 className="text-3xl font-black text-white">Full Stack Orchestration Overview</h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              How the FastAPI backend, PostgreSQL database, Light-OCR vision engine, and Playwright browser work in unified synchrony.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                A
              </div>
              <h4 className="font-bold text-white text-sm">Vision &amp; Telemetry Layer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Light-OCR executes document parsing on your uploaded PDF, generating bounding boxes and structured JSON schemas directly into PostgreSQL.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/80 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
                B
              </div>
              <h4 className="font-bold text-white text-sm">Laya Reasoning Matrix</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates job descriptions against candidate vectors, computing 0-100 match ratings and verifying Rule-2 anti-fabrication compliance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-800/80 text-purple-400 flex items-center justify-center font-mono font-bold text-xs">
                C
              </div>
              <h4 className="font-bold text-white text-sm">Stealth Dispatch Execution</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Playwright launches a sandboxed browser profile with human typing curves, completing multi-step applications and logging proof of submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Automate Your Applications with Integrity?
          </h3>
          <p className="text-sm text-slate-400">
            Configure your parameters once, review matches with explainable scores, and dispatch with confidence.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all"
            >
              Get Started with ZOBVERSE AI →
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
