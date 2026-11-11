"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  Cpu,
  Sparkles,
  Lock,
  Zap,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

interface OcrStatus {
  available: boolean;
  version?: { npm?: string };
}

export default function AboutPage() {
  const [ocrStatus, setOcrStatus] = useState<OcrStatus | null>(null);

  useEffect(() => {
    document.title = "About | Open Job";
    void fetchWithAuth("/resumes/ocr/status")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not check OCR availability.");
        setOcrStatus(await response.json());
      })
      .catch((error) => {
        console.error("Could not check OCR availability:", error);
        setOcrStatus({ available: false });
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none font-sans pb-12">
      {/* Hero Showcase Banner with Animated Cybernetic AI Background */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
        {/* Background Cybernetic AI Visual with Pulse Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/about-ai-core.jpg"
            alt="Open Job Cybernetic AI Humanoid Core"
            fill
            priority
            className="object-cover object-right md:object-[85%_center] opacity-45 mix-blend-screen transition-all duration-1000 scale-105 animate-cyber-pulse"
          />
          {/* Animated Ambient Cyber Scanline */}
          <div className="absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-cyber-scan pointer-events-none" />

          {/* Multi-layer gradient overlays ensuring pristine legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <OpenCodeLogo className="w-5 h-5" glow animated />
              <span className="text-[11px] font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent uppercase">
                Open Code Ecosystem
              </span>
            </div>
            <Badge variant="purple" size="sm" dot pulse>
              OPEN JOB PLATFORM v2.0
            </Badge>
            <span className="text-xs text-cyan-400 font-mono flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <Eye className="w-3.5 h-3.5" /> Powered by Light-OCR
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Open Job: Truthful, Autonomous &amp; Sovereign Career Intelligence
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Open Job replaces mindless application spam with high-precision, factual career alignment.
            Engineered with zero hallucination constraints, local offline document vision powered by Light-OCR,
            and explainable deterministic AI evaluation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link href="/dashboard">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Command Center
              </Button>
            </Link>
            <Link href="/dashboard/reporting">
              <Button
                variant="outline"
                size="md"
                className="bg-slate-900/70 border-slate-700 text-slate-200 hover:bg-slate-800 backdrop-blur-md"
              >
                View Analytics &amp; Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Pillars of Open Job */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Architectural Pillars &amp; Core Principles
          </h2>
          <p className="text-xs text-slate-500">
            The mathematical and ethical constraints governing every automated submission
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Rule 2 Anti-Fabrication */}
          <Card className="glass-card hover:border-emerald-400/50 transition-all p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                Rule 2: Zero Fabrication
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Open Job strictly prohibits hallucinating credentials, skills, or answers.
                Drafts use the resume and profile details you provide. Review generated content
                and confirm that each claim is supported before submitting.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Candidate review before submission</span>
            </div>
          </Card>

          {/* Pillar 2: Light-OCR Vision Core */}
          <Card className="glass-card hover:border-cyan-400/50 transition-all p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-xs">
              <Eye className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                Light-OCR Vision Core
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrated with <strong>@arcships/light-ocr</strong>, Open Job performs fast,
                OCR for scanned PDFs and images using the locally installed PP-OCRv6 Small engine.
                Text extraction runs locally on the configured CPU provider.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-600">
              <Zap className="w-3.5 h-3.5" />
              <span>Offline PP-OCRv6 &bull; PDFium</span>
            </div>
          </Card>

          {/* Pillar 3: Laya Multi-Agent Reasoning */}
          <Card className="glass-card hover:border-indigo-400/50 transition-all p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                Laya Reasoning Layer
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rule-based classifiers extract skills and role signals from job descriptions.
                Ollama connectivity and its configured model are reported separately in Settings.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explainable Deterministic Scoring</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Illustrative OCR architecture image; live status is shown in diagnostics below. */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 border border-slate-800 p-6 sm:p-8 shadow-2xl text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual AI Core Holographic Frame with Floating Animation */}
          <div className="lg:col-span-5 relative group">
            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/50 bg-slate-900/90 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-cyber-float">
              {/* Image Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src="/about-ai-core.jpg"
                  alt="Open Job Neural Vision Core"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Animated Holographic Laser Scanline */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee] animate-cyber-scan pointer-events-none z-20" />
                <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-cyan-400/20 via-cyan-400/5 to-transparent animate-cyber-scan pointer-events-none z-10" />

                {/* Subtle Cyan Holographic Grid & Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />

                {/* Biometric Target HUD Node 1 - Temple Circuit */}
                <div className="absolute top-[35%] right-[32%] z-20 flex items-center gap-1.5 pointer-events-none">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border border-white shadow-[0_0_8px_#22d3ee]" />
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950/90 text-cyan-300 border border-cyan-400/40 backdrop-blur-sm">
                    OCR processing
                  </span>
                </div>

                {/* Biometric Target HUD Node 2 - Fiber Optics Neck */}
                <div className="absolute bottom-[30%] left-[30%] z-20 flex items-center gap-1.5 pointer-events-none">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400 border border-white shadow-[0_0_8px_#818cf8]" />
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950/90 text-indigo-300 border border-indigo-400/40 backdrop-blur-sm">
                    Local document input
                  </span>
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-400/50 text-[10px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>ILLUSTRATIVE OCR ARCHITECTURE</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 flex items-center gap-1">
                    Local OCR &bull; CPU provider
                  </span>
                  <span className="text-slate-400 font-bold">Not live telemetry</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Highlights */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm" dot>
                NEURAL VISION ENGINE
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                Open Code Core Intelligence v2.0
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Local OCR, With Transparent Service Status
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Open Job combines local document perception with deterministic reasoning.
              Resume OCR runs locally. Job-source requests and any configured LLM may use network services;
              check the connection status in Settings and review data before submitting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Local Document Vision</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant optical recognition of scanned PDF credentials, certificates, and portfolio assets.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Anti-Spam Verification</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Every answer is mathematically cross-referenced with your verified candidate facts.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Color Theme: Cyan &bull; Cobalt &bull; Indigo
              </span>
              <span>&bull;</span>
              <span className="text-slate-300">Open-Code Logo Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Light-OCR Engine Diagnostics Card */}
      <Card className="glass-panel p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Light-OCR Document Engine Status
              </h3>
              <p className="text-xs text-slate-500">
                High-performance offline OCR via @arcships/light-ocr
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={ocrStatus?.available ? "success" : "warning"}
              size="sm"
              dot
              pulse={ocrStatus === null}
            >
              {ocrStatus === null
                ? "CHECKING OCR"
                : ocrStatus.available
                  ? "OCR COMMAND AVAILABLE"
                  : "OCR UNAVAILABLE"}
            </Badge>
            <a
              href="https://github.com/arcships/light-ocr"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Model Tier</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {ocrStatus?.available ? "PP-OCRv6 Small" : "Unavailable"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Package Version</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {ocrStatus?.version?.npm ? `v${ocrStatus.version.npm}` : "Unknown"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Hardware Backend</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {ocrStatus?.available ? "CPU" : "Unavailable"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Privacy Sandbox</span>
            <span className="font-bold text-emerald-600 text-sm mt-0.5 block">OCR processing is local</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          Light-OCR handles scanned images and non-selectable PDFs when its local executable is available.
          This status verifies the executable path; a scan-specific extraction result is shown after upload.
        </p>
      </Card>

      {/* Technology Stack Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Integrated Production Technology Stack
          </h2>
          <p className="text-xs text-slate-500">
            Enterprise grade components engineered for resilience and security
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              NJS
            </div>
            <div className="font-bold text-slate-900 text-sm">Next.js 16</div>
            <p className="text-[11px] text-slate-500">
              Modern React 19 app router with server actions and GSAP luxury animations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
              FST
            </div>
            <div className="font-bold text-slate-900 text-sm">FastAPI &amp; Uvicorn</div>
            <p className="text-[11px] text-slate-500">
              Async Python backend managing authentication, pipeline workers, and resume parsers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              PG
            </div>
            <div className="font-bold text-slate-900 text-sm">PostgreSQL DB</div>
            <p className="text-[11px] text-slate-500">
              Reliable relational storage for candidate profile, review queue, and application logs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
              PW
            </div>
            <div className="font-bold text-slate-900 text-sm">Playwright &amp; Ollama</div>
            <p className="text-[11px] text-slate-500">
              Headless browser automation engine coupled with local deep learning models.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Privacy Sovereignty Pledge */}
      <div className="p-6 rounded-3xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Lock className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-white">
            Candidate Privacy &amp; Data Sovereignty Pledge
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Open Job does not sell your candidate data, resume, or credentials to third-party data brokers.
          All session cookies, passwords, and tokens are encrypted with AES-256 in local secure storage.
          You retain full ownership to revoke credentials, delete applications, or reset all profiles with 1 click.
        </p>
      </div>
    </div>
  );
}
