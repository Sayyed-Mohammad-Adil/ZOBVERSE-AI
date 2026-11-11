"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function Home() {
  useEffect(() => {
    document.title = "ZOBVERSE AI — Find. Apply. Get Hired.";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Your Personal AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Job Application Assistant
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed font-normal">
            Never spam. Never fabricate. Discover high-match jobs across LinkedIn and remote platforms,
            evaluate alignment with explainable scores, and auto-prepare tailored applications with 100% human-in-the-loop approval.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-semibold shadow-xl shadow-blue-600/30 hover:shadow-blue-600/45 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch Agent Dashboard</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/dashboard/search"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-base font-medium border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Live Job Feed</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Quality, Not Volume
            </h2>
            <p className="text-slate-400 text-base">
              Mass indiscriminate job spam gets candidates blacklisted. The agent prioritizes precision alignment,
              honest representations, and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                📄
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Resume Understanding</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload multiple CV versions (PDF, DOCX, TXT). Laya and PyPDF parse skills, experience years, and roles. The agent picks the most aligned CV for each application.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                ⚖️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Explainable Match Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every score (0-100%) comes with transparent justifications, matched skills, identified gaps, and potential concerns regarding salary or location.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 hover:border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Strict Rule 2 Protection</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Never invents candidate credentials. Never bypasses anti-bot or CAPTCHAs. Halts and requests human action when platforms require authentication.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 hover:border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                🚦
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Human-in-the-Loop Review</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dedicated review queue flags undisclosed salaries, ambiguous requirements, and low-confidence Q&amp;As for quick candidate sign-off.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 hover:border-amber-500/40 transition-all hover:shadow-xl hover:shadow-amber-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                🧠
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Question Bank &amp; Confidence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Screening answers are mapped with confidence scores and source tags (e.g. &quot;Candidate profile → CV&quot;). Unknown metrics require explicit human input.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 hover:border-cyan-500/40 transition-all hover:shadow-xl hover:shadow-cyan-500/5 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform">
                📊
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Skill Gap &amp; Market Insights</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Analyzes live jobs to report in-demand market skills versus candidate skills, identifying actionable learning priorities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">How It Works</h2>
            <p className="text-slate-400 text-sm">Four seamless steps from configuration to interview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center mx-auto border border-blue-500/20">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Upload &amp; Preferences</h4>
              <p className="text-xs text-slate-400">
                Upload your resumes and set salary minimums, target roles, currencies (INR/USD), and locations.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center mx-auto border border-indigo-500/20">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Continuous Discovery</h4>
              <p className="text-xs text-slate-400">
                Background worker scans public feeds (LinkedIn, remote boards) and runs 5-tier duplicate checks.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center mx-auto border border-purple-500/20">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Match &amp; Prepare</h4>
              <p className="text-xs text-slate-400">
                AI selects the optimal CV, drafts honest cover letters, and resolves screening questions.
              </p>
            </div>

            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center mx-auto border border-emerald-500/20">
                4
              </div>
              <h4 className="font-bold text-white text-sm">Track to Offer</h4>
              <p className="text-xs text-slate-400">
                Manage interviews, save feedback notes, compare offers, and analyze negotiation terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to Take Control of Your Career?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            No subscription fees. Powered by your own local database and private AI models.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-xl shadow-blue-600/25 transition-all"
            >
              Access Your Dashboard Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
