"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Scan,
  ShieldCheck,
  Cpu,
  Terminal,
  Database,
  Lock,
  Zap,
  CheckCircle2,
  FileText,
  MousePointer,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

export default function FeaturesPage() {
  useEffect(() => {
    document.title = "Features & Autonomous Capabilities | ZOBVERSE AI";
  }, []);

  const [activeTab, setActiveTab] = useState<"vision" | "truth" | "reasoning" | "stealth">("vision");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-900 bg-slate-950">
        {/* Features Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-features.jpg"
            alt="ZOBVERSE AI Features Neural Vision"
            fill
            priority
            className="object-cover object-center opacity-35 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-600/10 via-blue-600/15 to-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Engineered for Precision. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Guaranteed for Truth.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            ZOBVERSE AI replaces blind spam scripts with deep document vision, strict anti-fabrication
            verification, humanized stealth dispatch, and complete telemetry transparency.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Explore Agent in Action</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-semibold transition-all"
            >
              View Pipeline Workflow →
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Core Engine Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">
            Core Architectural Pillars
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            6 Deep Subsystems Powering Every Application
          </h3>
          <p className="text-sm text-slate-400">
            Select a pillar to inspect the underlying technology, telemetry outputs, and design criteria.
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: "vision", label: "Light-OCR Multi-Modal Vision", icon: Scan },
            { id: "truth", label: "Rule 2 Anti-Fabrication Engine", icon: ShieldCheck },
            { id: "reasoning", label: "Laya Explainable Matching", icon: Cpu },
            { id: "stealth", label: "Stealth Playwright Dispatcher", icon: MousePointer },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-slate-900 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : "bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content Display */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {activeTab === "vision" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                  <Scan className="w-3.5 h-3.5" /> High-Performance Visual Perception
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-white">
                  Light-OCR: Multi-Modal CV Parsing Without Text Scrambling
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Traditional PyPDF2/PDFMiner scrapers break on multi-column layouts, tables, icon-decorated skills, and custom typography.
                  ZOBVERSE AI embeds <strong>Light-OCR</strong>, a high-speed computer vision model that visually dissects resumes page by page.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Column &amp; Visual Flow Detection</h5>
                      <p className="text-xs text-slate-400">Correctly aligns sidebars, header blocks, and timeline chips without interleaving separate columns.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Bounding-Box Telemetry</h5>
                      <p className="text-xs text-slate-400">Captures exact visual coordinates for skills, company names, employment intervals, and education credentials.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Ultra-Fast Hybrid CPU/GPU Inference</h5>
                      <p className="text-xs text-slate-400">Processes complex 3-page executive portfolios in sub-second latency with graceful fallback.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code / Visual Terminal Block */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    LIGHT-OCR INSPECTOR OUTPUT
                  </span>
                  <span>status: 200 OK</span>
                </div>
                <div className="space-y-1.5 text-slate-400">
                  <p className="text-cyan-400 font-bold">&gt; light_ocr.parse_document(&quot;resume_senior_staff.pdf&quot;)</p>
                  <p className="text-slate-500">// Visual layout detected: 2-column asymmetric</p>
                  <p className="text-emerald-400">{`{`}</p>
                  <p className="pl-4 text-slate-300">&quot;candidate_name&quot;: &quot;Adil Qureshi&quot;,</p>
                  <p className="pl-4 text-slate-300">&quot;total_years_experience&quot;: 6.5,</p>
                  <p className="pl-4 text-cyan-300">&quot;extracted_skills&quot;: [&quot;Python&quot;, &quot;FastAPI&quot;, &quot;Next.js&quot;, &quot;Playwright&quot;, &quot;PostgreSQL&quot;],</p>
                  <p className="pl-4 text-slate-300">&quot;timeline_confidence&quot;: 0.994,</p>
                  <p className="pl-4 text-slate-300">&quot;bounding_boxes_count&quot;: 48,</p>
                  <p className="pl-4 text-emerald-300">&quot;rule_2_verified&quot;: true</p>
                  <p className="text-emerald-400">{`}`}</p>
                  <p className="text-slate-500 pt-2">// Ingestion complete: ready for match matrix</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "truth" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> Zero-Hallucination Integrity
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-white">
                  Rule 2 Anti-Fabrication: Absolute Candidate Sovereignty
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Generic AI job bots invent fake dates, embellish company titles, or lie about years of experience to force high ATS scores.
                  This leads to immediate disqualification and blacklisting. ZOBVERSE AI enforces a cryptographic <strong>Rule 2</strong> protocol.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Ground-Truth Fact Verification</h5>
                      <p className="text-xs text-slate-400">Every single sentence generated for job applications is cross-referenced against your verified resume data.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Automated Hallucination Blocker</h5>
                      <p className="text-xs text-slate-400">If an employer asks for 8 years in a skill you have 4 years in, the agent truthfully frames your experience without fabricating.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Immutable Application Audit Trail</h5>
                      <p className="text-xs text-slate-400">Complete historical records of every question, answer, and resume revision stored locally in your database.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Truth Verification Comparison Visual */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-inner">
                <h5 className="text-xs font-mono text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-800">
                  Verification Safeguard Comparison
                </h5>
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs space-y-1.5">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <span>✕</span> Competitor Bot Behavior (Dangerous)
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Fabricates 5+ years of Kubernetes experience you never had to beat the ATS filter. The hiring manager discovers this in the screening call, resulting in an immediate rejection.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZOBVERSE AI Rule 2 Behavior (Truthful)
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Accurately presents your 2 years of Docker &amp; CI/CD orchestration, highlighting rapid architectural ramp-up without inventing claims. Your professional integrity is protected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reasoning" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-400 text-xs font-mono">
                  <Cpu className="w-3.5 h-3.5" /> Laya Neural Reasoning Core
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-white">
                  Explainable Fit Matrix: No Black-Box Percentages
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Instead of giving you an arbitrary 94% score with no explanation, ZOBVERSE AI breaks down
                  job descriptions into multi-dimensional compatibility vectors.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Semantic Vector Distance</h5>
                      <p className="text-xs text-slate-400">Measures conceptual alignment between your accomplishments and employer requirements, ignoring shallow keyword stuffing.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Explainable Pros &amp; Cons</h5>
                      <p className="text-xs text-slate-400">Clearly outlines why you are a strong match and highlights gaps (e.g. required timezone offset or missing tool).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Tailored Cover Letter Generation</h5>
                      <p className="text-xs text-slate-400">Synthesizes concise, professional intro letters referencing your exact projects without boilerplate cliches.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-inner">
                <h3 className="text-sm font-bold text-white">Match results use your data</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Match scores are calculated for each saved listing and candidate profile.
                  This public page does not display sample scores as live results.
                </p>
              </div>
            </div>
          )}

          {activeTab === "stealth" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-mono">
                  <MousePointer className="w-3.5 h-3.5" /> Playwright Headless Automation
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-white">
                  Stealth Playwright Dispatch: Undetected Execution
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Basic bots get flagged by Cloudflare, reCAPTCHA, and LinkedIn anti-scraping within minutes.
                  ZOBVERSE AI utilizes stealth browser profiles with natural human jitter, authentic user-agent rotations, and local cookie persistence.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Natural Keystroke &amp; Mouse Cadence</h5>
                      <p className="text-xs text-slate-400">Emulates realistic human typing speeds (45-80 WPM) with subtle typos and pauses to evade bot heuristics.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Persistent Cookie Vault</h5>
                      <p className="text-xs text-slate-400">Reuses your authenticated sessions with encrypted state storage, avoiding repeated login challenges.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Human-in-the-Loop Gateway</h5>
                      <p className="text-xs text-slate-400">Never submits without your explicit pre-flight approval, ensuring total control over where your name goes.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stealth Console Telemetry */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-500">
                  <span>DISPATCH TELEMETRY LOG</span>
                  <span className="text-blue-400">AGENT HEADLESS</span>
                </div>
                <p className="text-slate-500">[01:34:11] Initializing Playwright Chromium with stealth plugins...</p>
                <p className="text-slate-300">[01:34:12] Injecting human cursor bezier paths (smooth ease-in-out)...</p>
                <p className="text-cyan-400">[01:34:14] Navigating to LinkedIn Job Portal: #39104821</p>
                <p className="text-slate-300">[01:34:15] Easy Apply detected. Autofilling contact fields...</p>
                <p className="text-emerald-400">[01:34:16] Light-OCR verified resume attached: &quot;Adil_Resume_2026.pdf&quot;</p>
                <p className="text-yellow-400">[01:34:17] Pre-flight human approval requested. Waiting for candidate sign-off...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Honest Engineering vs Blind Automation
            </h2>
            <h3 className="text-3xl font-black text-white">How ZOBVERSE AI Outperforms Generic Bots</h3>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-4 px-6 font-bold">Feature / Metric</th>
                    <th className="py-4 px-6 text-slate-400">Generic Auto-Applier Bots</th>
                    <th className="py-4 px-6 text-cyan-300 font-bold bg-cyan-950/30">ZOBVERSE AI Autonomous Engine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-4 px-6 font-bold text-white">Resume Ingestion</td>
                    <td className="py-4 px-6 text-slate-400">Plain regex text scrapers (breaks on columns)</td>
                    <td className="py-4 px-6 text-cyan-300 font-bold bg-cyan-950/20">Light-OCR Multi-Modal Computer Vision</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-4 px-6 font-bold text-white">Truth Policy</td>
                    <td className="py-4 px-6 text-rose-400">Zero policy (hallucinates fake skills &amp; dates)</td>
                    <td className="py-4 px-6 text-emerald-400 font-bold bg-cyan-950/20">Rule 2 Strict Anti-Fabrication Engine</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-4 px-6 font-bold text-white">Job Matching Logic</td>
                    <td className="py-4 px-6 text-slate-400">Blind keyword frequency matching</td>
                    <td className="py-4 px-6 text-cyan-300 font-bold bg-cyan-950/20">Multi-Vector Semantic Distance &amp; Pros/Cons</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-4 px-6 font-bold text-white">Human-in-the-Loop</td>
                    <td className="py-4 px-6 text-slate-400">Uncontrolled auto-submit (leads to bans)</td>
                    <td className="py-4 px-6 text-cyan-300 font-bold bg-cyan-950/20">100% Pre-flight Review or Automated Mode</td>
                  </tr>
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-4 px-6 font-bold text-white">Data Privacy</td>
                    <td className="py-4 px-6 text-slate-400">Centralized closed-source cloud database</td>
                    <td className="py-4 px-6 text-cyan-300 font-bold bg-cyan-950/20">100% Local PostgreSQL &amp; Private LLM Option</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Take Advantage of Autonomous Precision Today
          </h3>
          <p className="text-sm text-slate-400">
            Deploy your dedicated agent, connect your credentials, and experience high-signal career acceleration.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all"
            >
              Deploy Agent Free →
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
