"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Cpu,
  Server,
  HelpCircle,
  ArrowRight,
  Lock,
  Database,
  Terminal,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

const TIERS = [
  {
    name: "Open Source Core",
    badge: "100% FREE FOREVER",
    badgeColor: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40",
    price: "$0",
    period: "forever / free",
    desc: "Self-hosted sovereign AI agent running locally on your hardware. Zero data collection, full source code access.",
    popular: true,
    highlight: "from-cyan-500 via-blue-500 to-indigo-600",
    cta: "Deploy Local Agent",
    ctaHref: "/register",
    features: [
      "Full Autonomous Agent Dashboard",
      "Embedded Light-OCR Visual Resume Parser",
      "Rule 2 Anti-Fabrication Enforcement Engine",
      "Local PostgreSQL Database & AES-256 Vault",
      "Playwright Stealth Dispatch Daemon",
      "Unlimited Job Feed Discovery & Scraping",
      "Human-in-the-Loop Approval Queue",
      "Bring Your Own LLM (Ollama, OpenAI, Gemini)",
      "Zero Telemetry / No Phoning Home",
    ],
  },
  {
    name: "Power Seeker",
    badge: "SUPPORTER EDITION",
    badgeColor: "bg-blue-950/80 text-cyan-300 border-cyan-500/40",
    price: "$19",
    period: "one-time contribution",
    desc: "For senior engineers and power job seekers looking for advanced multi-persona targeting and priority model weights.",
    popular: false,
    highlight: "from-indigo-500 to-purple-600",
    cta: "Support Open Development",
    ctaHref: "https://github.com/arcships/light-ocr",
    features: [
      "Everything in Open Source Core",
      "Multi-Persona CV Routing (e.g. AI vs Staff Backend)",
      "Automated Market Gap & Salary Percentile Analysis",
      "Telegram & Discord Instant Dispatch Webhooks",
      "Pre-tuned Local LLM Quantizations for Ollama",
      "Direct Discord Dev Channel Access",
      "Sponsor Badge in Open Code Community",
    ],
  },
  {
    name: "Sovereign Cluster",
    badge: "ORGANIZATIONS & LABS",
    badgeColor: "bg-purple-950/80 text-purple-300 border-purple-500/40",
    price: "Custom",
    period: "dedicated architecture",
    desc: "Dedicated internal clusters for bootcamps, university placement cells, and career transition accelerators.",
    popular: false,
    highlight: "from-purple-600 to-pink-600",
    cta: "Contact Architecture Team",
    ctaHref: "/contact",
    features: [
      "Multi-Tenant PostgreSQL Cluster Setup",
      "Enterprise ATS Connectors (Greenhouse, Lever, Ashby)",
      "Centralized Curated Question Bank Database",
      "Custom Fine-Tuned OCR Document Extraction",
      "Dedicated Air-Gapped Network Configuration",
      "Architecture & Deployment SLA Support",
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: "Visual Resume Parsing (Light-OCR)", free: "Unlimited", pro: "Priority Models", enterprise: "Custom Models" },
  { feature: "Anti-Fabrication Verification (Rule 2)", free: "Always On", pro: "Always On", enterprise: "Always On" },
  { feature: "Data Sovereignty (Local DB)", free: "100% Local", pro: "100% Local", enterprise: "Private VPC / Airgap" },
  { feature: "AI Model Support", free: "Ollama / BYO-Key", pro: "Ollama / BYO-Key", enterprise: "Dedicated Self-Hosted" },
  { feature: "Application Dispatch Speed", free: "Stealth Throttled", pro: "Stealth Throttled", enterprise: "Cluster Scaled" },
  { feature: "Telemetry & Cloud Tracking", free: "Zero (Disabled)", pro: "Zero (Disabled)", enterprise: "Zero (Disabled)" },
  { feature: "Community Discord", free: "Public", pro: "VIP Channel", enterprise: "Dedicated Slack/Discord" },
];

const FAQS = [
  {
    q: "Why is Open Job free and open source?",
    a: "Corporate recruiting tech has automated resume filtering with opaque AI screeners, creating an asymmetric disadvantage for candidates. We believe every engineer and job seeker deserves an equal, honest, and sovereign AI advocate that never sells their data or charges predatory subscriptions.",
  },
  {
    q: "Does Open Job have access to my credit card or bank details?",
    a: "No. The core application runs locally on your machine with no billing required. If you choose to sponsor development, payments are handled externally via GitHub Sponsors.",
  },
  {
    q: "How much does LLM usage cost?",
    a: "If you run local open-weights models through Ollama (like Llama 3 or Mistral), your cost is $0. If you configure commercial APIs (such as OpenAI GPT-4o or Google Gemini), you only pay those providers directly for actual tokens consumed, typically pennies per application.",
  },
  {
    q: "Can I use Open Job without any coding experience?",
    a: "Yes. Open Job provides a complete modern web dashboard with guided setup. You simply upload your resume, select your preferences, review matched jobs, and approve submissions with one click.",
  },
];

export default function PricingPage() {
  useEffect(() => {
    document.title = "Pricing & Open Access | Open Job";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-900 bg-slate-950">
        {/* Pricing Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-pricing.jpg"
            alt="Open Job Transparent Economics"
            fill
            priority
            className="object-cover object-center opacity-35 mix-blend-screen scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-600/15 via-blue-600/20 to-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Candidate Sovereignty. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Zero Paywalls. No Subscriptions.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            Open Job is fundamentally open-source software. You own your data, your database,
            and your application pipeline. Choose the tier that matches your setup.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? "bg-slate-900/90 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.2)] scale-[1.02]"
                  : "bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-[11px] font-black tracking-wider uppercase text-white shadow-lg shadow-cyan-500/30">
                  Most Popular • Recommended
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{tier.name}</span>
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
                      {tier.badge}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                      {tier.price}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{tier.period}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">{tier.desc}</p>
                </div>

                <div className="h-px bg-slate-800/80" />

                <div className="space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    What&apos;s Included:
                  </div>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-slate-800/60">
                <Link
                  href={tier.ctaHref}
                  className={`w-full py-3.5 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2 group ${
                    tier.popular
                      ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Full Capability Matrix</h2>
            <p className="text-sm text-slate-400">Detailed breakdown of operational boundaries across setups</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Capability / Guardrail</th>
                  <th className="p-4 sm:p-5 text-cyan-400">Open Source Core</th>
                  <th className="p-4 sm:p-5 text-blue-400">Power Seeker</th>
                  <th className="p-4 sm:p-5 text-purple-400">Cluster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-white">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-mono text-cyan-300">{row.free}</td>
                    <td className="p-4 sm:p-5 font-mono text-slate-300">{row.pro}</td>
                    <td className="p-4 sm:p-5 font-mono text-slate-300">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono">
              <HelpCircle className="w-4 h-4" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl font-black text-white">Clear Answers to Common Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5 hover:border-slate-700/80 transition-all"
              >
                <h3 className="text-sm font-bold text-white flex items-start gap-2">
                  <span className="text-cyan-400 font-mono">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/20 text-center space-y-4">
            <h3 className="text-lg font-bold text-white">Have a specific architectural setup?</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              Our engineering team is actively building connectors and fine-tuning extraction pipelines. Reach out anytime on GitHub or via our contact channel.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                <span>Get in Touch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
