"use client";

import React, { useState, useEffect } from "react";
import AgentConsole from "@/components/console/AgentConsole";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";
import {
  Terminal,
  Activity,
  ShieldCheck,
  Zap,
  Sliders,
  Sparkles,
  Bot,
  ExternalLink,
  Search,
  CheckCircle2,
  Link2,
} from "lucide-react";

export default function ConsolePage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [linkedinStatus, setLinkedinStatus] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    loadDashboardMeta();
  }, [refreshTrigger]);

  const loadDashboardMeta = async () => {
    try {
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) return;
      const me = await meRes.json();

      const [pRes, prefRes, anaRes, lkRes] = await Promise.all([
        fetchWithAuth(`/profile/${me.id}`),
        fetchWithAuth(`/preferences/${me.id}`),
        fetchWithAuth(`/analytics/${me.id}`),
        fetchWithAuth(`/settings/linkedin/${me.id}`),
      ]);

      if (pRes.ok) setUserProfile(await pRes.json());
      if (prefRes.ok) setPreferences(await prefRes.json());
      if (anaRes.ok) setAnalytics(await anaRes.json());
      if (lkRes.ok) setLinkedinStatus(await lkRes.json());
    } catch (e) {
      console.error("Failed to load console metadata:", e);
    }
  };

  const isAutonomous = preferences?.automation_mode === "Autonomous";
  const candName = userProfile?.first_name
    ? `${userProfile.first_name} ${userProfile.last_name || ""}`.trim()
    : "Candidate";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-cyan-400 flex items-center justify-center border border-slate-800 shadow-md">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>Agent Execution Console</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Actual worker events appear here when the worker is running; no activity is fabricated.
              </p>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Candidate:</span>
            <span className="font-bold text-slate-900">{candName}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Autonomy:</span>
            <Badge variant={isAutonomous ? "success" : "primary"} size="sm">
              {isAutonomous ? "Autonomous" : "Assisted"}
            </Badge>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Daily Limit:</span>
            <span className="font-bold text-slate-900">
              {preferences?.daily_application_limit ?? "Not loaded"}
              {preferences?.daily_application_limit != null ? " / day" : ""}
            </span>
          </div>

          <Link
            href="/dashboard/settings#linkedin"
            className="px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs transition-all hover:border-blue-400 hover:shadow-xs group cursor-pointer bg-white"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-slate-600 font-medium">LinkedIn:</span>
            {linkedinStatus?.connected ? (
              <Badge variant="success" size="sm" dot pulse>
                CONNECTED
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                CONNECT SESSION
              </Badge>
            )}
          </Link>
        </div>
      </div>

      {/* Main Terminal Screen */}
      <div className="space-y-4">
        <AgentConsole
          maxHeight="520px"
          onCycleComplete={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div>

      {/* Execution Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Review Queue Count */}
        <Link href="/dashboard/review">
          <Card className="glass-card hover:border-amber-400 transition-all cursor-pointer">
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Review Queue</span>
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analytics?.applications?.ready ?? 0}
              </div>
              <p className="text-[11px] text-slate-500">Awaiting 1-click candidate review</p>
            </div>
          </Card>
        </Link>

        {/* Card 2: Applications Submitted */}
        <Link href="/dashboard/applications">
          <Card className="glass-card hover:border-blue-400 transition-all cursor-pointer">
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Submitted</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analytics?.applications?.applied ?? 0}
              </div>
              <p className="text-[11px] text-slate-500">Applications delivered</p>
            </div>
          </Card>
        </Link>

        {/* Card 3: Live Job Postings Scanned */}
        <Link href="/dashboard/search">
          <Card className="glass-card hover:border-indigo-400 transition-all cursor-pointer">
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Database Postings</span>
                <Search className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analytics?.total_jobs_discovered ?? 0}
              </div>
              <p className="text-[11px] text-slate-500">Active postings in candidate pool</p>
            </div>
          </Card>
        </Link>

        {/* Card 4: Autonomy Policy */}
        <Link href="/dashboard/preferences">
          <Card className="glass-card hover:border-emerald-400 transition-all cursor-pointer">
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Safety Guardrails</span>
                <Sliders className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {isAutonomous ? "Full Auto (>40% match)" : "Assisted (Review First)"}
              </div>
              <p className="text-[11px] text-slate-500">Configurable in preferences →</p>
            </div>
          </Card>
        </Link>

        {/* Card 5: LinkedIn Session Status */}
        <Link href="/dashboard/settings#linkedin">
          <Card className="glass-card hover:border-blue-400 transition-all cursor-pointer">
            <div className="p-4 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>LinkedIn Session</span>
                <Link2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {linkedinStatus?.connected ? (
                  linkedinStatus?.auth_method === "session_cookie" ? "Session Token (li_at)" : "Credentials Linked"
                ) : (
                  "Not Linked (Assisted)"
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {linkedinStatus?.connected
                  ? "LinkedIn session connected"
                  : "Click to connect account →"}
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Architecture & Workflow Explainer */}
      <Card className="glass-card p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-bold text-slate-900 text-sm">
              How Auto-Apply Execution Works in ZOBVERSE AI
            </h3>
            <p>
              1. <strong>Pipeline Discovery:</strong> Live discovery uses enabled feeds; other selected boards open their official search pages.
            </p>
            <p>
              2. <strong>Deterministic Matching:</strong> The engine compares role requirements against your verified skills, experience, and salary preferences, computing a factual 0-100% score.
            </p>
            <p>
              3. <strong>Execution Policy:</strong> Under <em>Autonomous Mode</em>, roles meeting the match threshold are submitted directly. External portals or assisted mode positions are queued in the <em>Review Queue</em> for your 1-click confirmation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
