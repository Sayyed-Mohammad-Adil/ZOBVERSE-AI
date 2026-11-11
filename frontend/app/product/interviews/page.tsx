"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ArrowRight,
  UserCheck,
  BookOpen,
  MessageSquare,
} from "lucide-react";

export default function InterviewTrackerProductPage() {
  useEffect(() => {
    document.title = "Interview Tracker & Orchestration | Open Job Product";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-product.jpg"
            alt="Interview Tracker Command Center"
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
            <span className="text-cyan-400 font-semibold">Interview Tracker</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Candidate Interview Tracker &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Context Memory Bank.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Consolidate interview rounds, synchronize interviewer context, practice with tailored question banks, and maintain an audit log of every discussion in your local database.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Setup Interview Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/product/offers"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              Offer Negotiation &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Round Orchestration Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Timeline Milestone Visualization
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Track Every Round With Precision
          </h2>
          <p className="text-sm text-slate-400">
            Never walk into an interview unprepared. Keep all round notes, interviewer profiles, and technical prep cards neatly organized.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-sm text-slate-300">
            Your actual interview rounds will appear here after you add them to your account.
          </p>
          <Link href="/register" className="mt-4 inline-flex text-sm font-semibold text-cyan-400 hover:text-cyan-300">
            Create an account to track your interviews <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* 3 Core Interview Prep Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-900">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Company Question Bank</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated repository of historical questions asked by target engineering teams, automatically categorized by data structures, distributed systems, and culture.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interviewer Briefing Dossier</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Store notes on your interviewers&apos; technical backgrounds, recent publications, and company tenure to frame high-impact conversation topics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Post-Round Debrief Journal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Capture your impressions immediately after the call. The AI analyzes your debrief notes to suggest follow-up questions and negotiation leverage points.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Master Your Interview Pipeline</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Organize every conversation, maintain candidate context, and convert round passes into competitive job offers.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
