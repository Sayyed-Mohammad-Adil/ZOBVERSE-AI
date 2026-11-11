"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Database,
  Sliders,
  DollarSign,
  MapPin,
  Building,
} from "lucide-react";

const FEED_SOURCES = [
  { name: "LinkedIn Jobs", availability: "On demand", desc: "Searches publicly available LinkedIn job listings." },
  { name: "Jobicy", availability: "On demand", desc: "Reads remote listings from the Jobicy public jobs API." },
];

export default function LiveJobFeedProductPage() {
  useEffect(() => {
    document.title = "Live Job Feed & Discovery | Open Job Product";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-product.jpg"
            alt="Live Job Feed Command Room"
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
            <span className="text-cyan-400 font-semibold">Live Job Feed</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Live Job Feed &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Intelligent Role Ingestion.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Continuous background discovery across LinkedIn, direct ATS portals, and remote boards. Automatically filters spam, deduplicates multi-board listings, and extracts true salary ranges.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Explore Live Search</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/product/pipeline"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              See Pipeline Queue &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Discovery Pipeline Architecture */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              5-Tier Deduplication &amp; Extraction
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Never Apply Twice to the Same Requisition
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Recruiters re-post the same opening every week across multiple aggregators. Open Job computes cryptographic fingerprints (SHA-256) of normalized job descriptions, company entities, and title tokens to guarantee you never waste time evaluating ghost mirrors.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Salary Normalization &amp; Currency Parsing</span>
                </div>
                <p className="text-xs text-slate-400 pl-6">
                  Extracts undisclosed compensation ranges using NLP models, converting USD/EUR/INR into your preferred annualized target.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Custom Blacklists &amp; Negative Constraints</span>
                </div>
                <p className="text-xs text-slate-400 pl-6">
                  Instantly exclude staffing agencies, former employers, or companies requiring mandatory return-to-office mandates.
                </p>
              </div>
            </div>
          </div>

          {/* Live listing source note */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Listings come from live sources</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Job titles, employers, links, salaries, and descriptions are shown from source listings.
                If a source does not provide a field, it is left blank rather than filled with an example.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-cyan-200"
              >
                Create an account to search listings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Ingestion Sources Grid */}
        <div className="space-y-6 pt-10 border-t border-slate-900">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl font-black text-white">Supported Discovery Feeds</h3>
            <p className="text-xs text-slate-400">These are the job sources currently wired into discovery.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEED_SOURCES.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{f.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    {f.availability}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Stream Real-Time Opportunities</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Configure your target roles and salary filters to let the discovery engine automatically aggregate and rank matches.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Setup Job Preferences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
