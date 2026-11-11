"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Send,
  Calendar,
  Award,
  Database,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  FileText,
  HelpCircle,
  ExternalLink,
  Terminal,
  BarChart3,
  Activity,
} from "lucide-react";

interface DashboardAnalytics {
  total_jobs_discovered?: number;
  resumes_count?: number;
  applications?: {
    total?: number;
    ready?: number;
    applied?: number;
    interview?: number;
    offer?: number;
    skipped?: number;
  };
  application_velocity?: { date: string; count: number }[];
  profile_completion?: number;
  skill_gap_analysis?: { candidate_skills?: string[] };
}

interface DashboardPreferences {
  daily_application_limit?: number | null;
  automation_mode?: string | null;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [updatingMode, setUpdatingMode] = useState(false);

  const loadDashboardData = async () => {
    try {
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) return;
      const me = await meRes.json();
      setLoading(true);

      const [anaRes, prefRes] = await Promise.all([
        fetchWithAuth(`/analytics/${me.id}`),
        fetchWithAuth(`/preferences/${me.id}`),
      ]);

      if (anaRes.ok) {
        setAnalytics(await anaRes.json());
      }
      if (prefRes.ok) {
        setPreferences(await prefRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Command Center | Open Job";
    void Promise.resolve().then(loadDashboardData);
  }, []);

  const handleQuickScan = async () => {
    try {
      setScanning(true);
      const res = await fetchWithAuth("/workers/scan", { method: "POST" });
      if (res.ok) {
        setTimeout(() => {
          loadDashboardData();
          setScanning(false);
        }, 2500);
      } else {
        setScanning(false);
      }
    } catch {
      setScanning(false);
    }
  };

  const toggleAutomationMode = async () => {
    if (!preferences) return;
    try {
      setUpdatingMode(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const newMode = preferences.automation_mode === "Autonomous" ? "Assisted" : "Autonomous";
      const res = await fetchWithAuth(`/preferences/${me.id}`, {
        method: "PUT",
        body: JSON.stringify({
          automation_mode: newMode,
        }),
      });

      if (res.ok) {
        setPreferences((prev) =>
          prev ? { ...prev, automation_mode: newMode } : prev,
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingMode(false);
    }
  };

  const apps = analytics?.applications || {
    total: 0,
    ready: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    skipped: 0,
  };

  const profilePct = analytics?.profile_completion ?? 0;
  const isAutonomous = preferences?.automation_mode === "Autonomous";
  const applicationsByDay = new Map<string, number>(
    (analytics?.application_velocity ?? []).map(
      (entry): [string, number] => [
        entry.date,
        entry.count,
      ],
    ),
  );
  const weeklyVelocity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    return {
      date: dateKey,
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getUTCDay()],
      count: applicationsByDay.get(dateKey) ?? 0,
    };
  });
  const maxDailyApplications = Math.max(
    1,
    ...weeklyVelocity.map((entry) => entry.count),
  );
  const profileSkills: string[] =
    analytics?.skill_gap_analysis?.candidate_skills ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 select-none">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm">
                Candidate Workspace
              </Badge>
              <span className="text-xs text-slate-400 font-mono">Open Job v2.0</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Open Job Autonomous Engine
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Multi-source discovery, deterministic skill matching, Light-OCR vision, and truthful submissions with strictly zero candidate fabrication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleQuickScan}
              loading={scanning}
              leftIcon={<RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />}
            >
              {scanning ? "Scanning Live..." : "Scan Live Jobs"}
            </Button>
            <Link href="/dashboard/reporting">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<BarChart3 className="w-4 h-4 text-blue-600" />}
              >
                Analytics &amp; Reports
              </Button>
            </Link>
            <Link href="/dashboard/review">
              <Button
                variant="outline"
                size="md"
                className="bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-800"
                leftIcon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
              >
                Review ({apps.ready || 0})
              </Button>
            </Link>
          </div>
        </div>

        {/* Account configuration and status links */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span>Automation mode:</span>
            <span className="font-bold text-white">{preferences?.automation_mode ?? "Not loaded"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span>Daily application limit:</span>
            <span className="font-bold text-white">
              {preferences?.daily_application_limit ?? "Not loaded"}
              {preferences?.daily_application_limit != null ? "/day" : ""}
            </span>
          </div>
          <Link href="/dashboard/profile" className="text-cyan-300 hover:text-cyan-200">
            Resume extraction status: View profile
          </Link>
          <Link href="/dashboard/settings" className="text-cyan-300 hover:text-cyan-200">
            Model status: View settings
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Jobs Discovered */}
        <Card className="glass-card hover:border-blue-400/50 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Jobs Discovered
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : (analytics?.total_jobs_discovered ?? 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 pt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Multi-Source Aggregator</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Applications Sent */}
        <Card className="glass-card hover:border-emerald-400/50 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Applications Sent
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : apps.applied}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Records marked applied</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Interviews Scheduled */}
        <Card className="glass-card hover:border-amber-400/50 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Interview Records
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : apps.interview}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Rounds &amp; Prep Tracker</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Offers Received */}
        <Card className="glass-card hover:border-purple-400/50 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Offers Received
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : apps.offer}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 pt-1">
                <Award className="w-3.5 h-3.5" />
                <span>Comp Analysis Ready</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pipeline Stage Flow Bar */}
      <Card className="glass-panel">
        <CardHeader>
          <div>
            <CardTitle>Autonomous Application Pipeline</CardTitle>
            <CardDescription>
              Counts from saved job and application records by current status
            </CardDescription>
          </div>
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              View Full Pipeline
            </Button>
          </Link>
        </CardHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Discovered */}
          <Link href="/dashboard/search" className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-500">1. Discovered</div>
            <div className="text-2xl font-black text-slate-800 mt-1">{analytics?.total_jobs_discovered ?? 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">LinkedIn &amp; Jobicy</div>
          </Link>

          {/* Ready for Review */}
          <Link href="/dashboard/review" className="p-3.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 transition-all border border-amber-200">
            <div className="text-xs font-semibold text-amber-800 flex items-center gap-1">
              <span>2. Review Queue</span>
              {(apps.ready ?? 0) > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">{apps.ready ?? 0}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">Awaiting Human Approval</div>
          </Link>

          {/* Submitted */}
          <Link href="/dashboard/applications" className="p-3.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 transition-all border border-blue-200">
            <div className="text-xs font-semibold text-blue-800">3. Submitted</div>
            <div className="text-2xl font-black text-blue-900 mt-1">{apps.applied}</div>
            <div className="text-[10px] text-blue-700 mt-0.5">Records marked applied</div>
          </Link>

          {/* Interviews */}
          <Link href="/dashboard/interviews" className="p-3.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 transition-all border border-emerald-200">
            <div className="text-xs font-semibold text-emerald-800">4. Interviewing</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{apps.interview}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Prep &amp; Rounds</div>
          </Link>

          {/* Offers */}
          <Link href="/dashboard/offers" className="p-3.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 transition-all border border-purple-200">
            <div className="text-xs font-semibold text-purple-800">5. Offers</div>
            <div className="text-2xl font-black text-purple-900 mt-1">{apps.offer}</div>
            <div className="text-[10px] text-purple-700 mt-0.5">Compensation Ready</div>
          </Link>

          {/* Excluded */}
          <div className="p-3.5 rounded-xl bg-slate-100/60 border border-slate-200/80 opacity-70">
            <div className="text-xs font-semibold text-slate-500">Filtered Out</div>
            <div className="text-2xl font-black text-slate-600 mt-1">{apps.skipped || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Below Match Threshold</div>
          </div>
        </div>
      </Card>
 
      {/* Visual Analytics & Application Velocity Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Velocity Bar Chart */}
        <Card className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Weekly Application Velocity &amp; Cadence
                </h2>
                <p className="text-[11px] text-slate-500">
                  Application records created per day
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                DAILY LIMIT: {preferences?.daily_application_limit ?? "Not loaded"}
              </Badge>
              <Link
                href="/dashboard/reporting"
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline ml-2"
              >
                <span>Full Reports</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive SVG / Tailwind Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="h-40 flex items-end justify-between gap-3 px-2 border-b border-slate-200">
              {weeklyVelocity.map((bar) => (
                <div key={bar.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.count}
                  </span>
                  <div className="w-full max-w-[38px] bg-slate-100 rounded-t-lg relative flex items-end overflow-hidden h-full">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-cyan-400 rounded-t-lg transition-all duration-700 group-hover:brightness-110"
                      style={{
                        height: `${(bar.count / maxDailyApplications) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="text-slate-500">
              Applications recorded over the last 7 days
            </span>
            <span>
              Total: {weeklyVelocity.reduce((sum, entry) => sum + entry.count, 0)}
            </span>
          </div>
        </Card>

        {/* Skill Match Alignment & Channel Performance */}
        <Card className="lg:col-span-1 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Skills in Your Profile
              </h3>
            </div>
            <span className="text-[11px] font-bold text-indigo-600">
              {profileSkills.length} skills
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {profileSkills.length > 0 ? (
              profileSkills.slice(0, 10).map((skill) => (
                <div
                  key={skill}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  {skill}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">
                No skills found in your profile yet. Add them on the profile page.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/console"
              className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center justify-between group"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                Access Real-Time Terminal
              </span>
              <span>→</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Intelligence & Automation Control Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Autonomous Engine Controller */}
        <Card className="lg:col-span-1 glass-card">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Agent Controls</span>
              </CardTitle>
              <CardDescription>Configure autonomy and safety limits</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-5">
            {/* Mode Toggle Switch */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Execution Mode
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {isAutonomous ? "Full Autonomy" : "Human-Assisted"}
                  </div>
                </div>
                <Badge
                  variant={isAutonomous ? "success" : "primary"}
                  size="md"
                  dot
                  pulse={isAutonomous}
                >
                  {isAutonomous ? "AUTONOMOUS" : "ASSISTED"}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {isAutonomous
                  ? "Agent will autonomously submit applications meeting >80% match confidence and queue uncertain ones."
                  : "Agent will prepare candidate answers and queue all applications for your 1-click approval."}
              </p>

              <Button
                variant={isAutonomous ? "outline" : "primary"}
                size="sm"
                className="w-full"
                onClick={toggleAutomationMode}
                loading={updatingMode}
              >
                {isAutonomous ? "Switch to Assisted Mode" : "Activate Autonomous Mode"}
              </Button>
            </div>

            {/* Profile Health Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700">Candidate Brain Completeness</span>
                <span className="text-blue-600">{profilePct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>{analytics?.resumes_count ?? 0} CV(s) Uploaded</span>
                <Link href="/dashboard/profile" className="text-blue-600 hover:underline font-semibold">
                  Complete Profile →
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/dashboard/preferences"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium text-slate-700 text-center transition-colors"
              >
                Salary &amp; Limits
              </Link>
              <Link
                href="/dashboard/settings"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium text-slate-700 text-center transition-colors"
              >
                AI Model Config
              </Link>
            </div>
          </div>
        </Card>

        {/* Right Column: Quick Navigation Launchpad */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div>
                <CardTitle>Core Candidate Workspaces</CardTitle>
                <CardDescription>Instant access to your intelligence workflows</CardDescription>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Job Search */}
              <Link href="/dashboard/search">
                <div className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Live Job Search &amp; Scan
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Scrape and aggregate live postings from LinkedIn, Jobicy, and direct platforms with match scores.
                  </p>
                </div>
              </Link>

              {/* Review Queue */}
              <Link href="/dashboard/review">
                <div className="p-4 rounded-2xl border border-slate-200/80 hover:border-amber-400 hover:shadow-md hover:bg-amber-50/30 transition-all duration-200 group cursor-pointer space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Human-in-the-Loop Review
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Verify high-value applications, clarify screening questions, and approve manual portal actions.
                  </p>
                </div>
              </Link>

              {/* Resume Tailoring */}
              <Link href="/dashboard/resumes">
                <div className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-md hover:bg-indigo-50/30 transition-all duration-200 group cursor-pointer space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Resumes &amp; Tailored CVs
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Upload PDF resumes, view extracted skills graph, and generate tailored variants per job.
                  </p>
                </div>
              </Link>

              {/* Question Bank */}
              <Link href="/dashboard/questions">
                <div className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/30 transition-all duration-200 group cursor-pointer space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Verified Question Bank
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Pre-set truthful candidate answers for work authorization, notice periods, and screening questions.
                  </p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
