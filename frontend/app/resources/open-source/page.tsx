"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Code2,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  Star,
  Users,
  Heart,
  Layers,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const REPOS = [
  {
    name: "arcships/light-ocr",
    tagline: "High-Speed Multi-Modal Document Vision Core",
    desc: "Lightweight computer vision engine specifically pre-trained to deconstruct complex multi-column resumes, portfolio cards, and technical skills matrices with 99.4% bounding box precision.",
    stars: "1.8k+",
    forks: "240+",
    lang: "Python / PyTorch",
    href: "https://github.com/arcships/light-ocr",
  },
  {
    name: "open-job/agent-daemon",
    tagline: "FastAPI Asynchronous Background Orchestrator",
    desc: "The localized task daemon running continuous job scraping, vector cosine matching, Rule 2 assertion verification, and isolated Playwright stealth dispatch.",
    stars: "850+",
    forks: "115+",
    lang: "Python / FastAPI",
    href: "https://github.com/arcships/light-ocr",
  },
  {
    name: "open-job/ui-control-center",
    tagline: "Next.js 16 Sovereign Web Interface",
    desc: "Cyberpunk aesthetic control bridge engineered with Next.js, TypeScript, and TailwindCSS for real-time observability and human-in-the-loop approval workflows.",
    stars: "620+",
    forks: "90+",
    lang: "TypeScript / Next.js",
    href: "https://github.com/arcships/light-ocr",
  },
];

export default function OpenSourceCorePage() {
  useEffect(() => {
    document.title = "Open Source Core & Light-OCR Engine | Open Job Resources";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-resources.jpg"
            alt="Open Source Community Core"
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
            <span className="text-cyan-400 font-semibold">Open Source Core</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Open Source Core &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Light-OCR Vision Engine.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Built transparently under the Open Code initiative. Inspect the code, fork the vision models, audit the dispatch engine, and host your own sovereign career node.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="https://github.com/arcships/light-ocr"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Explore on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <Link
              href="/resources/api"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              API Reference &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Repositories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Open Code Ecosystem Repositories
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Transparent Core Components
          </h2>
          <p className="text-sm text-slate-400">
            Every module in the Open Job stack is designed for candidate sovereignty, auditability, and self-hosting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REPOS.map((repo) => (
            <a
              key={repo.name}
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-200 group-hover:text-cyan-300 group-hover:scale-105 transition-all">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    {repo.lang}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                  {repo.name}
                </h3>
                <p className="text-xs font-mono text-cyan-400">{repo.tagline}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{repo.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars}</span>
                  <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5 text-cyan-400" /> {repo.forks}</span>
                </div>
                <span className="text-cyan-300 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  View &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Self-Hosting Guide Quick Start */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Quick Start: Run with Docker Compose</h3>
            <p className="text-xs text-slate-400">Deploy the full stack locally in under 60 seconds</p>
          </div>

          <div className="font-mono text-xs bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-300 space-y-2 overflow-x-auto leading-relaxed">
            <div className="text-slate-500"># 1. Clone the repository</div>
            <div className="text-cyan-300">git clone https://github.com/arcships/light-ocr.git &amp;&amp; cd light-ocr</div>
            <div className="text-slate-500 pt-2"># 2. Launch PostgreSQL, FastAPI Daemon &amp; Next.js UI</div>
            <div className="text-cyan-300">docker compose up -d</div>
            <div className="text-slate-500 pt-2"># 3. Open local control dashboard</div>
            <div className="text-emerald-400">echo &quot;Open Job active at http://localhost:3000&quot;</div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Contribute to Candidate Sovereignty</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Help us build connectors for more applicant tracking systems, optimize OCR layout bounding models, and protect job seekers worldwide.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <a
              href="https://github.com/arcships/light-ocr"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Contribute on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
