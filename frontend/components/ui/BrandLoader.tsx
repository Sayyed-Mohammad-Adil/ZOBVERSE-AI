import React from "react";
import { OpenCodeLogo } from "./OpenCodeLogo";

interface BrandLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "fullscreen";
  label?: string;
  className?: string;
}

export function BrandLoader({
  size = "md",
  label = "Loading...",
  className = "",
}: BrandLoaderProps) {
  if (size === "xs") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1px] shadow-sm shadow-blue-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[5px] flex items-center justify-center p-0.5">
            <OpenCodeLogo className="w-3.5 h-3.5 animate-spin" glow={false} />
          </div>
        </div>
        {label && <span className="text-[11px] text-slate-400 font-mono">{label}</span>}
      </div>
    );
  }

  if (size === "sm") {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 animate-spin opacity-70 blur-xs" />
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-md shadow-blue-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center p-1">
              <OpenCodeLogo className="w-5 h-5 animate-pulse" glow />
            </div>
          </div>
        </div>
        {label && (
          <span className="text-xs font-semibold text-slate-300 font-mono tracking-wide">
            {label}
          </span>
        )}
      </div>
    );
  }

  const isFullscreen = size === "fullscreen";

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md"
          : "flex flex-col items-center justify-center py-12 px-4"
      } ${className}`}
    >
      <div className="relative group">
        {/* Outer Pulsing & Spinning Gradient Rings */}
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 animate-spin opacity-75 blur-md duration-700" />
        <div className="absolute -inset-1 rounded-2xl bg-cyan-400/30 animate-ping opacity-40 duration-1000" />

        {/* The Exact Bordered Brand Container from Sign In / Register */}
        <div className={`relative ${size === "lg" ? "w-20 h-20" : "w-16 h-16"} rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[2px] shadow-[0_0_35px_rgba(6,182,212,0.45)] z-10 transition-transform`}>
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-3 shadow-inner">
            <OpenCodeLogo className={size === "lg" ? "w-11 h-11 animate-pulse" : "w-9 h-9 animate-pulse"} glow />
          </div>
        </div>
      </div>

      {label && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono font-medium text-cyan-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{label}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">
            Open Job Neural Core
          </span>
        </div>
      )}
    </div>
  );
}
