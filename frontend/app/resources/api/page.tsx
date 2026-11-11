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
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  ArrowRight,
  BookOpen,
} from "lucide-react";

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
  {
    method: "POST",
    path: "/api/v1/review/approve/{item_id}",
    desc: "Approve tailored application and enqueue for Playwright stealth dispatch",
    tag: "Pipeline",
    tagColor: "bg-amber-950 text-amber-400 border-amber-800",
  },
  {
    method: "GET",
    path: "/api/v1/telemetry/audits",
    desc: "Query cryptographic receipt logs and proof screenshot hashes",
    tag: "Telemetry",
    tagColor: "bg-indigo-950 text-indigo-400 border-indigo-800",
  },
];

const CODE_EXAMPLES = {
  python: `import httpx

# 1. Connect to local Open Job FastAPI daemon
client = httpx.Client(base_url="http://localhost:8000/api/v1")

# 2. Authenticate
token_res = client.post("/auth/login", data={
    "username": "engineer@example.com",
    "password": "your_secure_password"
})
jwt_token = token_res.json()["access_token"]
headers = {"Authorization": f"Bearer {jwt_token}"}

# 3. Query match score for a job posting
match = client.get("/jobs/search?role=backend&min_score=85", headers=headers)
print(f"High-match roles found: {len(match.json())}")`,
  curl: `curl -X POST "http://localhost:8000/api/v1/auth/login" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=engineer@example.com&password=your_secure_password"`,
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
    enforce_rule2: true, // Anti-fabrication verification
  }),
});

const result = await response.json();
console.log("Match Alignment:", result.alignment_percentage);`,
};

export default function ApiDocumentationPage() {
  useEffect(() => {
    document.title = "REST API Documentation & Endpoints | Open Job Resources";
  }, []);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"python" | "curl" | "node">("python");

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-900 bg-slate-950">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg-resources.jpg"
            alt="REST API Documentation Desk"
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
            <span className="text-cyan-400 font-semibold">API Documentation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
            Complete REST API &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Developer Reference.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Integrate with the Open Job local FastAPI daemon, configure custom LLM inference endpoints (Ollama, Gemini, OpenAI), and automate your career pipeline via code.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
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
            <Link
              href="/resources/architecture"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              System Architecture &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Code Snippet Workbench & REST Endpoints */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Code Workbench */}
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
            <p className="text-xs text-slate-400">Local base URL: http://localhost:8000/api/v1</p>
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

        {/* Bottom CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/30 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Ready to Build on Open Job?</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Read the system architecture guides or check out the open-source vision parser core on GitHub.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/resources/architecture"
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <span>Explore System Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
