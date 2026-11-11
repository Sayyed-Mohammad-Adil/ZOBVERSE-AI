"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Code2,
  Terminal,
  FileCode,
  BookOpen,
  Cpu,
  Database,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Layers,
  Zap,
  ArrowRight,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/auth/login",
    desc: "Authenticate user and receive short-lived JWT token",
    tag: "Auth",
    tagColor: "bg-blue-950 text-blue-400 border-blue-800",
  },
  {
    method: "POST",
    path: "/api/v1/auth/register",
    desc: "Create local candidate account in PostgreSQL",
    tag: "Auth",
    tagColor: "bg-blue-950 text-blue-400 border-blue-800",
  },
  {
    method: "POST",
    path: "/api/v1/resumes/upload",
    desc: "Ingest PDF resume and initiate Light-OCR visual layout parser",
    tag: "Vision OCR",
    tagColor: "bg-cyan-950 text-cyan-400 border-cyan-800",
  },
  {
    method: "GET",
    path: "/api/v1/resumes/{id}/parsed",
    desc: "Retrieve verified skills, experience nodes, and bounding coordinates",
    tag: "Vision OCR",
    tagColor: "bg-cyan-950 text-cyan-400 border-cyan-800",
  },
  {
    method: "GET",
    path: "/api/v1/jobs/search",
    desc: "Query live job feed with match scores, salary estimates, and keywords",
    tag: "Discovery",
    tagColor: "bg-emerald-950 text-emerald-400 border-emerald-800",
  },
  {
    method: "POST",
    path: "/api/v1/match/evaluate",
    desc: "Trigger Rule 2 anti-fabrication match scoring between CV and JD",
    tag: "Intelligence",
    tagColor: "bg-purple-950 text-purple-400 border-purple-800",
  },
  {
    method: "GET",
    path: "/api/v1/review/{candidate_id}",
    desc: "Fetch queued applications pending human-in-the-loop signoff",
    tag: "Pipeline",
    tagColor: "bg-amber-950 text-amber-400 border-amber-800",
  },
];

const CODE_EXAMPLES = {
  curl: `curl -X POST "http://localhost:8000/api/v1/auth/login" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=engineer@example.com&password=your_secure_password"`,
  python: `import httpx

# 1. Connect to local ZOBVERSE AI daemon
client = httpx.Client(base_url="http://localhost:8000/api/v1")

# 2. Authenticate
token_res = client.post("/auth/login", data={
    "username": "engineer@example.com",
    "password": "your_secure_password"
})
jwt_token = token_res.json()["access_token"]

# 3. Query match score for a job posting
headers = {"Authorization": f"Bearer {jwt_token}"}
match = client.get("/jobs/search?role=backend&min_score=85", headers=headers)
print(f"High-match roles found: {len(match.json())}")`,
  node: `const token = localStorage.getItem("token");

const response = await fetch("http://localhost:8000/api/v1/match/evaluate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${token}\`,
  },
  body: JSON.stringify({
    resume_id: "res_uuid_1024",
    job_id: "job_uuid_9921",
    enforce_rule2: true, // Anti-fabrication check
  }),
});

const result = await response.json();
console.log("Match Alignment:", result.alignment_percentage);`,
};

export default function ResourcesPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "node">("python");

  useEffect(() => {
    document.title = "Resources & API Documentation | ZOBVERSE AI";
  }, []);

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-900 bg-slate-950">
        {/* Resources Background Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-resources.jpg"
            alt="ZOBVERSE AI Developer Resources & API References"
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
            Developer Resources &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Complete REST API Reference
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            Integrate with the ZOBVERSE AI local FastAPI daemon, configure custom LLM inference endpoints,
            and inspect how Light-OCR parses multi-column CVs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-2 transition-all shadow-md"
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Interactive Swagger UI (/docs)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href="https://github.com/arcships/light-ocr"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Light-OCR GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Grid: Architecture Guides + Interactive Code */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Dedicated Resource Modules Directory */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Developer &amp; Ecosystem Subsystems</h2>
            <p className="text-xs sm:text-sm text-slate-400">Explore dedicated technical documentation for every layer of ZOBVERSE AI</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link
              href="/resources/api"
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                REST API Reference
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                FastAPI daemon endpoints, auth schemas, code snippets &amp; swagger interface.
              </p>
              <div className="pt-2 text-xs font-mono text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View API Docs &rarr;</span>
              </div>
            </Link>

            <Link
              href="/resources/architecture"
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                System Architecture
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                5 distinct engine layers, multi-modal vision parsing &amp; sovereign data storage.
              </p>
              <div className="pt-2 text-xs font-mono text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Inspect Stack &rarr;</span>
              </div>
            </Link>

            <Link
              href="/resources/audits"
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                Audit Telemetry
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cryptographic submission receipts, Playwright visual logs &amp; rate limit data.
              </p>
              <div className="pt-2 text-xs font-mono text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Telemetry &rarr;</span>
              </div>
            </Link>

            <Link
              href="/resources/open-source"
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group space-y-3 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                Open Source Core
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Light-OCR engine, Docker Compose configs, and candidate sovereignty ethos.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>GitHub Repos &rarr;</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Start Setup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-900">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Local PostgreSQL Storage</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ZOBVERSE AI stores applications, resumes, and matched postings in a localized PostgreSQL instance with SQLAlchemy ORM.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all select-all">
              DATABASE_URL=postgresql://username:password@localhost:5432/job_agent
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Private LLM Inference</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly swap between local Ollama instances (Llama 3, Mistral) and cloud providers like OpenAI or Anthropic.
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all select-all">
              LLM_PROVIDER=ollama // http://localhost:11434
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Rule 2 Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-fabrication engine. Any auto-generated answer must cite an exact sentence from the candidate&apos;s verified resume.
              </p>
            </div>
            <div className="text-[11px] font-mono text-indigo-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all select-all">
              ENFORCE_ZERO_FABRICATION=true
            </div>
          </div>
        </div>

        {/* Code Snippet Workbench */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-2xl">
          <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/80">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold font-mono text-slate-200">API Integration Examples</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              {(["python", "curl", "node"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    activeTab === tab
                      ? "bg-cyan-500 text-slate-950 font-bold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="relative p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
            <button
              onClick={() => copyCode(activeTab, CODE_EXAMPLES[activeTab])}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all flex items-center gap-1.5 text-[11px] z-10 backdrop-blur"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <pre className="pr-16 text-[11px] sm:text-xs overflow-x-auto">{CODE_EXAMPLES[activeTab]}</pre>
          </div>
        </div>

        {/* REST API Endpoints Table */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Core REST Endpoints</h2>
            <p className="text-xs text-slate-400">Available locally on http://localhost:8000/api/v1</p>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
            <div className="divide-y divide-slate-800/80">
              {API_ENDPOINTS.map((endpoint, i) => (
                <div key={i} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shrink-0 ${
                        endpoint.method === "POST"
                          ? "bg-blue-950/80 text-blue-400 border border-blue-800/60"
                          : "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-xs font-mono font-semibold text-white break-all">{endpoint.path}</span>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3">
                    <span className="text-xs text-slate-400">{endpoint.desc}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${endpoint.tagColor}`}>
                      {endpoint.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline & Audit Telemetry Section */}
        <div id="audits" className="space-y-6 pt-10 border-t border-slate-900 scroll-mt-24">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Pipeline &amp; Audit Telemetry Architecture</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Every dispatched submission, automated response, and browser session creates a locally-anchored, tamper-evident audit trail with SHA-256 integrity proofs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileCode className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Submission Receipts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographic timestamp and payload hashes recorded in your local PostgreSQL database for every job application.
                </p>
              </div>
              <div className="text-[10px] font-mono text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800/80 break-all select-all">
                receipt_sha256 = 8f4b...91a2
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Playwright Stealth Receipts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full-page confirmation screenshots and form field telemetry saved locally so you can visually verify every submission state.
                </p>
              </div>
              <div className="text-[10px] font-mono text-blue-300 bg-slate-950 p-2 rounded border border-slate-800/80 break-all select-all">
                proof_screenshot: /audits/*.webp
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Rate Limit Telemetry</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Active token buckets and platform health telemetry prevent account flags with adaptive backoff curves.
                </p>
              </div>
              <div className="text-[10px] font-mono text-purple-300 bg-slate-950 p-2 rounded border border-slate-800/80 break-all select-all">
                rate_guard: STRICT_STEALTH_MODE
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
