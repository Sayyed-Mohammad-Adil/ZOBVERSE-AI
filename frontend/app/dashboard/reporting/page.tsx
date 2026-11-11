"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Send,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpRight,
  Database,
  ShieldCheck,
  RefreshCw,
  Globe,
  Layers,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

export default function ReportingPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    document.title = "Analytics & Reports | ZOBVERSE AI";
    loadReportingData();
  }, []);

  const loadReportingData = async () => {
    try {
      setLoading(true);
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) return;
      const me = await meRes.json();

      const [anaRes, appRes] = await Promise.all([
        fetchWithAuth(`/analytics/${me.id}`),
        fetchWithAuth(`/applications/${me.id}`),
      ]);

      if (anaRes.ok) {
        setAnalytics(await anaRes.json());
      }
      if (appRes.ok) {
        setApplications(await appRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const totalDiscovered = analytics?.total_jobs_discovered ?? 0;
  const totalApplied = apps.applied;
  const interviewCount = apps.interview || 0;
  const offerCount = apps.offer || 0;

  const interviewRate = totalApplied > 0 ? ((interviewCount / totalApplied) * 100).toFixed(1) : "0.0";
  const offerRate = totalApplied > 0 ? ((offerCount / totalApplied) * 100).toFixed(1) : "0.0";

  const recordedVelocity: { date: string; count: number }[] =
    analytics?.application_velocity ?? [];
  const velocityByDay = new Map(
    recordedVelocity.map((entry) => [entry.date, entry.count]),
  );
  const today = new Date();
  const velocityData =
    timeRange === "all"
      ? Object.entries(
          recordedVelocity.reduce<Record<string, number>>((months, entry) => {
            const month = entry.date.slice(0, 7);
            months[month] = (months[month] ?? 0) + entry.count;
            return months;
          }, {}),
        ).map(([month, count]) => ({ day: month, count }))
      : Array.from({ length: timeRange === "7d" ? 7 : 30 }, (_, index) => {
          const date = new Date(today);
          date.setUTCDate(date.getUTCDate() - (timeRange === "7d" ? 6 : 29) + index);
          const dateKey = date.toISOString().slice(0, 10);
          return {
            day:
              timeRange === "7d"
                ? date.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" })
                : dateKey.slice(5),
            count: velocityByDay.get(dateKey) ?? 0,
          };
        });
  const sourceApplications = Object.entries(
    (analytics?.applications_by_source ?? {}) as Record<string, number>,
  );

  const exportCSV = () => {
    if (!applications || applications.length === 0) {
      alert("No application records to export.");
      return;
    }

    const headers = ["ID", "Job Title", "Company", "Source", "Status", "Match Score", "Applied At"];
    const rows = applications.map((app) => [
      app.id,
      `"${app.job_title || ""}"`,
      `"${app.job_company || ""}"`,
      `"${app.job_source || ""}"`,
      `"${app.status || ""}"`,
      app.match_score ?? "Not calculated",
      app.created_at || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zobverse_ai_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none font-sans pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Reporting &amp; Funnel Analytics
            </h1>
            <Badge variant="purple" size="sm" dot>
              ZOBVERSE AI INTELLIGENCE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Activity and conversion metrics recorded in your account
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === "7d" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === "30d" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                timeRange === "all" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              All Time
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={exportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadReportingData}
            loading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingested */}
        <Card className="glass-card hover:border-blue-400/50 p-5 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Jobs Evaluated
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : totalDiscovered.toLocaleString()}
              </div>
              <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                <span>Multi-Source Ingestion</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Submissions Dispatched */}
        <Card className="glass-card hover:border-emerald-400/50 p-5 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Applied
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loading ? "..." : totalApplied}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                <span>Application records</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Interview Rate */}
        <Card className="glass-card hover:border-amber-400/50 p-5 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interview Rate
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {interviewRate}%
              </div>
              <div className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{interviewCount} Interview Records</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Offer Conversion */}
        <Card className="glass-card hover:border-purple-400/50 p-5 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Offer Conversion
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {offerRate}%
              </div>
              <div className="text-[11px] font-semibold text-purple-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{offerCount} Offers Received</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Application Funnel Flow */}
      <Card className="glass-panel p-6">
        <CardHeader className="px-0 pt-0">
          <div>
            <CardTitle>End-to-End Application Conversion Funnel</CardTitle>
            <CardDescription>
              Counts are based on saved listings and application records.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-4 pt-2">
          {/* Step 1: Discovered */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                1. Scraped &amp; Ingested Postings
              </span>
              <span>
                {totalDiscovered > 0
                  ? `${totalDiscovered} roles (100%)`
                  : "No discovered jobs recorded"}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-slate-400 rounded-full"
                style={{ width: `${totalDiscovered > 0 ? 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Step 2: Application records */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                2. Application records created
              </span>
              <span>{applications.length} records</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${totalDiscovered > 0 ? Math.min(100, (applications.length / totalDiscovered) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Step 3: Verified Submissions */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                3. Applications Marked Applied
              </span>
              <span>
                {totalApplied} submitted ({totalDiscovered > 0 ? ((totalApplied / totalDiscovered) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${totalDiscovered > 0 ? Math.min(100, (totalApplied / totalDiscovered) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Step 4: Interview Stage */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                4. Recruiter Screen &amp; Technical Interviews
              </span>
              <span>{interviewCount} candidates</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${totalApplied > 0 ? Math.min(100, (interviewCount / totalApplied) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Step 5: Offers Received */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                5. Written Job Offers
              </span>
              <span>{offerCount} received</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${totalApplied > 0 ? Math.min(100, (offerCount / totalApplied) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Two Column Split: Velocity Bar Chart & Source Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Velocity Bar Chart */}
        <Card className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Application Velocity
              </h3>
              <p className="text-xs text-slate-500">
                Applications recorded in the selected period
              </p>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-200">
              {velocityData.map((item) => {
                const maxVal = Math.max(1, ...velocityData.map((entry) => entry.count));
                const barHeightPct = (item.count / maxVal) * 100;

                return (
                  <div key={item.day} className="flex-1 min-w-8 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg relative flex items-end overflow-hidden h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-500 group-hover:from-blue-500 group-hover:to-indigo-400"
                        style={{ height: `${barHeightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Pacing is throttled automatically to preserve candidate reputation and prevent spam filters.
          </p>
        </Card>

        {/* Source Channel Performance Table */}
        <Card className="glass-panel p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Applications by Job Source
            </h3>
            <p className="text-xs text-slate-500">
              Application records grouped by the source attached to each job
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {sourceApplications.length ? sourceApplications.map(([source, count]) => (
              <div
                key={source}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-slate-900">{source}</span>
                <span className="font-bold text-slate-700">{count} applications</span>
              </div>
            )) : (
              <p className="text-xs text-slate-500">
                No application source data recorded yet.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Applications Audit Trail Table */}
      <Card className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Application Telemetry Log
            </h3>
            <p className="text-xs text-slate-500">
              Recent application records from your account
            </p>
          </div>
          <Link href="/dashboard/applications">
            <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Full Pipeline
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Position</th>
                <th className="py-3 px-3">Company</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Match Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No application events logged yet. Scan and apply to populate reports.
                  </td>
                </tr>
              ) : (
                applications.slice(0, 8).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{app.job_title || "Not recorded"}</td>
                    <td className="py-3 px-3 text-slate-600">{app.job_company || "Not recorded"}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                        {app.job_source || "Not recorded"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">
                      {typeof app.match_score === "number"
                        ? `${Math.round(app.match_score)}%`
                        : "Not calculated"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        {app.status || "Not recorded"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {app.created_at
                        ? new Date(app.created_at).toLocaleDateString()
                        : "Not recorded"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
