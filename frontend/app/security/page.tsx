"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  DatabaseZap,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Server,
  Fingerprint,
  AlertTriangle,
} from "lucide-react";

const SECURITY_FEATURES = [
  {
    icon: Lock,
    color: "from-cyan-500 to-blue-600",
    title: "AES-256 Encrypted Credentials",
    desc: "All LinkedIn session cookies, API keys, and platform credentials are stored using AES-256 encryption at rest. No credentials ever leave your local machine.",
  },
  {
    icon: ShieldCheck,
    color: "from-emerald-500 to-cyan-600",
    title: "Rule 2 Anti-Fabrication Protocol",
    desc: "Cryptographically enforced policy that prevents the AI from ever inventing candidate information. Every generated claim is verified against your resume.",
  },
  {
    icon: DatabaseZap,
    color: "from-blue-500 to-indigo-600",
    title: "100% Local PostgreSQL Database",
    desc: "Your job data, applications, resumes, and preference files are stored exclusively in a local PostgreSQL instance. No cloud sync, no telemetry, no data broker exposure.",
  },
  {
    icon: EyeOff,
    color: "from-purple-500 to-pink-600",
    title: "Zero Telemetry Architecture",
    desc: "ZOBVERSE AI does not phone home. No analytics SDKs, no crash reporters, no usage logging to external servers. Your career data stays your own.",
  },
  {
    icon: KeyRound,
    color: "from-indigo-500 to-violet-600",
    title: "JWT Token Auth with Expiry",
    desc: "Short-lived JSON Web Tokens authenticate every API call between the frontend and FastAPI backend. Tokens expire automatically and are stored securely.",
  },
  {
    icon: Fingerprint,
    color: "from-rose-500 to-orange-500",
    title: "Stealth Browser Isolation",
    desc: "Playwright dispatch runs in a fully isolated browser profile with unique fingerprinting, preventing detection or cross-contamination with your personal sessions.",
  },
  {
    icon: Server,
    color: "from-amber-500 to-orange-600",
    title: "Private LLM Option",
    desc: "Run Laya AI reasoning entirely offline using a locally-hosted Ollama model. No resume data ever touches OpenAI, Anthropic, or any third-party cloud inference.",
  },
  {
    icon: AlertTriangle,
    color: "from-orange-500 to-red-500",
    title: "Human-in-the-Loop Gateway",
    desc: "Applications are never submitted without explicit candidate pre-flight approval. The agent cannot bypass your review queue regardless of automation mode setting.",
  },
];

export default function SecurityPage() {
  useEffect(() => {
    document.title = "Security & Privacy Architecture | ZOBVERSE AI";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-900 bg-slate-950">
        {/* Security Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-security.jpg"
            alt="ZOBVERSE AI Security Quantum Vault"
            fill
            priority
            className="object-cover object-center opacity-35 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-600/10 via-cyan-600/15 to-blue-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Security You Can{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
              Verify.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            ZOBVERSE AI handles sensitive career data — resume content, platform credentials, salary expectations.
            Every component of the architecture has been designed with privacy-first, locally-sovereign principles.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>0% Cloud Data Exposure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-cyan-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>AES-256 At Rest</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Open Source Auditable</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security Feature Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Security Layers
          </h2>
          <h3 className="text-3xl font-black text-white">8 Architectural Security Guarantees</h3>
          <p className="text-sm text-slate-400">
            Each layer of ZOBVERSE AI&apos;s stack has been engineered with security as a first-class concern, not an afterthought.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECURITY_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 transition-all group space-y-4"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${feature.color} p-0.5 shadow-lg`}>
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-2">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-2 group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Statement */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h3 className="text-3xl font-black text-white">Open Source Security</h3>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ZOBVERSE AI is built transparently. The Light-OCR vision engine, the Laya reasoning core, and the stealth dispatcher are all available for inspection.
            Security-conscious candidates and organizations can audit, fork, and self-host with full control.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h5 className="text-sm font-bold text-emerald-400">No Data Leaving Your Machine</h5>
              <p className="text-xs text-slate-400">All job data, resume content, and application history stays on your local PostgreSQL instance.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h5 className="text-sm font-bold text-cyan-400">Rule 2 is Enforced in Code</h5>
              <p className="text-xs text-slate-400">The anti-fabrication guard is implemented as a verifiable validation layer, not a prompt instruction that can be bypassed.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h5 className="text-sm font-bold text-blue-400">Inspect Every Submission</h5>
              <p className="text-xs text-slate-400">Full screenshot and response receipt logs are stored locally. You can audit every action the agent has ever taken.</p>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all"
          >
            <span>Deploy Your Secure Agent</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
