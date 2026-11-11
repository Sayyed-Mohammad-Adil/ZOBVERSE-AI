"use client";

import Link from "next/link";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";
import { ShieldCheck, Heart, Sparkles, Terminal } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-xs text-slate-500 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
          {/* Brand Info */}
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-sm shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center p-1">
                  <OpenCodeLogo className="w-5 h-5" glow />
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Open <span className="text-cyan-400">Job</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Autonomous AI application intelligence designed for radical honesty, zero fabrication,
              and verifiable career acceleration powered by Light-OCR vision and Laya reasoning.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-400 pt-1 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Rule 2 Enforced
              </span>
              <span>&bull;</span>
              <span className="text-cyan-300">Light-OCR Active</span>
              <span>&bull;</span>
              <span>Local PostgreSQL</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              Product &amp; Workflow
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/features" className="hover:text-cyan-300 transition-colors">
                  Core Features
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-cyan-300 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-cyan-300 transition-colors">
                  Security &amp; Privacy
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-cyan-300 transition-colors">
                  Pricing &amp; Open Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem & Resources */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              Ecosystem &amp; Docs
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/info" className="hover:text-cyan-300 transition-colors">
                  System Info &amp; About
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-cyan-300 transition-colors">
                  API &amp; Developer Docs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cyan-300 transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/arcships/light-ocr"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-300 transition-colors"
                >
                  Light-OCR on GitHub &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} Open Job — Engineered with Open Code. Built for candidate sovereignty.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/info" className="hover:text-white">Architecture</Link>
            <Link href="/resources#audits" className="hover:text-white">Audit Logs</Link>
            <Link href="/resources" className="hover:text-white">API References</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
