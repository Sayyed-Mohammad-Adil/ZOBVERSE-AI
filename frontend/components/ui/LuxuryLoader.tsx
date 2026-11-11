"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sparkles, Bot, Cpu, ShieldCheck, Eye, Zap } from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";

export default function LuxuryLoader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Booting Open Job Autonomous Engine...");

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if intro has already run in this session
    const hasSeenIntro = sessionStorage.getItem("openjob_intro_shown");
    if (hasSeenIntro) {
      return;
    }

    setVisible(true);

    const steps = [
      { pct: 15, text: "Booting Open Job Autonomous Engine..." },
      { pct: 38, text: "Calibrating Light-OCR Offline Vision (PP-OCRv6)..." },
      { pct: 64, text: "Synchronizing Laya Decision Core & Truthfulness Rule 2..." },
      { pct: 88, text: "Connecting Telemetry, Pipeline Queues & Sockets..." },
      { pct: 100, text: "Systems Initialized. Welcome to Open Job." },
    ];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.05,
            filter: "blur(12px)",
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: () => {
              sessionStorage.setItem("openjob_intro_shown", "true");
              setVisible(false);
            },
          });
        },
      });

      // Initial state
      gsap.set(logoRef.current, { scale: 0.7, opacity: 0, rotationY: 45 });
      gsap.set(ringRef.current, { rotation: 0, scale: 0.8, opacity: 0 });
      gsap.set(textRef.current, { y: 20, opacity: 0 });
      gsap.set(badgeRef.current, { y: 15, opacity: 0 });

      // Entrance animation
      tl.to(ringRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.7)",
      })
        .to(
          logoRef.current,
          {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            duration: 1,
            ease: "power4.out",
          },
          "-=0.7"
        )
        .to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .to(
          badgeRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
        );

      // Continuous ring rotation
      gsap.to(ringRef.current, {
        rotation: 360,
        repeat: -1,
        duration: 8,
        ease: "none",
      });

      // Step progression
      let currentProgress = 0;
      steps.forEach((step, idx) => {
        tl.to(
          {},
          {
            duration: 0.45,
            onStart: () => {
              setStatusText(step.text);
            },
            onUpdate: function () {
              const p = Math.round(
                gsap.utils.interpolate(currentProgress, step.pct, this.progress())
              );
              setProgress(p);
            },
            onComplete: () => {
              currentProgress = step.pct;
            },
          },
          idx === 0 ? "+=0.2" : "+=0.1"
        );
      });

      // Brief final pause
      tl.to({}, { duration: 0.4 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSkip = () => {
    sessionStorage.setItem("openjob_intro_shown", "true");
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => setVisible(false),
      });
    } else {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-white select-none overflow-hidden"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse delay-700" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Main Showcase Center */}
      <div className="relative flex flex-col items-center max-w-md px-6 text-center z-10">
        {/* Glowing Logo & Ring Anchor */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          {/* Animated Outer Gradient Ring */}
          <div
            ref={ringRef}
            className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 opacity-80 shadow-[0_0_35px_rgba(59,130,246,0.5)]"
          >
            <div className="w-full h-full bg-slate-950 rounded-full" />
          </div>

          {/* Secondary Pulse Ring */}
          <div className="absolute inset-2 rounded-full border border-blue-400/20 animate-ping opacity-40 pointer-events-none" />

          {/* Core Brand Emblem */}
          <div
            ref={logoRef}
            className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-2xl shadow-blue-500/40 flex items-center justify-center"
          >
            <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-sm p-2">
              <OpenCodeLogo className="w-10 h-10" glow />
            </div>
          </div>
        </div>

        {/* Brand Title & Typography */}
        <div ref={textRef} className="space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Open Job
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-400/30">
              AI Core
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 tracking-wide">
            Autonomous, Truthful &amp; Explainable Job Search Engine
          </p>
        </div>

        {/* Real-Time Progress Bar */}
        <div className="w-full max-w-xs space-y-2.5 mb-5">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Zap className="w-3.5 h-3.5 animate-bounce" />
              Initializing
            </span>
            <span className="font-mono text-slate-200">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Status Line */}
          <div className="h-6 flex items-center justify-center">
            <p className="text-[11px] text-slate-400 font-mono tracking-tight transition-all duration-200 truncate">
              {statusText}
            </p>
          </div>
        </div>

        {/* Engine Capability Badges */}
        <div
          ref={badgeRef}
          className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-800/80 w-full"
        >
          <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
            <Eye className="w-3 h-3 text-cyan-400" />
            Light-OCR Engine
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Zero Fabrication
          </span>
          <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
            <Cpu className="w-3 h-3 text-indigo-400" />
            Laya Reasoning
          </span>
        </div>

        {/* Skip button for user convenience */}
        <button
          onClick={handleSkip}
          className="mt-6 text-[11px] text-slate-500 hover:text-slate-300 font-medium transition-colors cursor-pointer"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
}
