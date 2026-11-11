"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Database,
  Send,
  Calendar,
  Award,
  RefreshCw,
  Globe,
  PieChart,
} from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Please log in to view analytics.");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/analytics/${me.id}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const apps = data?.applications || {};
  const skillGaps = data?.skill_gap_analysis || {};
  const sources = data?.applications_by_source || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Market Intelligence &amp; Analytics
            </h1>
            <Badge variant="primary" size="sm">
              Live Real-Time
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time pipeline velocity, skill gap analysis against active job postings, and source attribution
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadAnalytics}
          loading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-850 shadow-lg py-12">
          <BrandLoader size="md" label="Synthesizing market analytics & pipeline metrics..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Level Pipeline Velocity Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-slate-900">
                {(data?.total_jobs_discovered || 0).toLocaleString()}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Discovered
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-blue-600">
                {apps.ready || 0}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Review Queue
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-cyan-600">
                {apps.applied || 0}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Submitted
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-amber-600">
                {apps.interview || 0}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Interviews
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-purple-600">
                {apps.offer || 0}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Offers
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-slate-500">
                {apps.skipped || 0}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Filtered Out
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis Section */}
          <Card className="glass-card">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <span>Deterministic Skill Gap Analysis</span>
                </CardTitle>
                <CardDescription>
                  Real-time market requirements synthesized from active postings vs. your verified candidate profile
                </CardDescription>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Candidate profile skills */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Skills From Your Profile</span>
                  </h3>
                  <Badge variant="success" size="sm">
                    {skillGaps.candidate_skills?.length || 0} Skills
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skillGaps.candidate_skills?.length > 0 ? (
                    skillGaps.candidate_skills.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-white text-emerald-800 text-xs px-2.5 py-1 rounded-lg font-semibold border border-emerald-200 shadow-2xs"
                      >
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic py-2">
                      No skills parsed. Upload a resume to automatically extract your skills.
                    </div>
                  )}
                </div>
              </div>

              {/* Missing High-Demand Skills */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Identified Skill Gaps</span>
                  </h3>
                  <Badge variant="danger" size="sm">
                    {skillGaps.missing_skills?.length || 0} Missing
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skillGaps.missing_skills?.length > 0 ? (
                    skillGaps.missing_skills.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-white text-rose-800 text-xs px-2.5 py-1 rounded-lg font-semibold border border-rose-200 shadow-2xs"
                      >
                        + {s}
                      </span>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic py-2">
                      Zero gaps identified against current criteria.
                    </div>
                  )}
                </div>
              </div>

              {/* Top Market In-Demand */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Top Market Demand</span>
                  </h3>
                  <Badge variant="primary" size="sm">
                    {skillGaps.top_requested_skills?.length || 0} Ranked
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skillGaps.top_requested_skills?.length > 0 ? (
                    skillGaps.top_requested_skills.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-white text-blue-800 text-xs px-2.5 py-1 rounded-lg font-semibold border border-blue-200 shadow-2xs"
                      >
                        ★ {s}
                      </span>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic py-2">
                      Run discovery to scan live market trends.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Sources and Velocity Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applications by Source */}
            <Card className="glass-card">
              <CardHeader>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Applications by Source Platform</span>
                  </CardTitle>
                </div>
              </CardHeader>

              <div className="space-y-4 pt-1">
                {Object.keys(sources).length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-4 text-center">
                    No application source records available yet.
                  </div>
                ) : (
                  Object.entries(sources).map(([src, count]: [string, any]) => {
                    const total = apps.total || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={src} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="capitalize">{src}</span>
                          <span className="text-slate-500 font-normal">
                            {count} apps ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Pipeline Conversion Rates */}
            <Card className="glass-card">
              <CardHeader>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Pipeline Conversion Velocity</span>
                  </CardTitle>
                </div>
              </CardHeader>

              <div className="space-y-4 pt-1 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-semibold text-slate-700">Discovery → Application</span>
                  <span className="font-bold text-blue-600">
                    {data?.total_jobs_discovered ? Math.round(((apps.applied || 0) / data.total_jobs_discovered) * 100) : 0}% Qualified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-semibold text-slate-700">Application → Interview Rate</span>
                  <span className="font-bold text-amber-600">
                    {apps.applied ? Math.round(((apps.interview || 0) / apps.applied) * 100) : 0}% Response Rate
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-semibold text-slate-700">Interview → Offer Close</span>
                  <span className="font-bold text-purple-600">
                    {apps.interview ? Math.round(((apps.offer || 0) / apps.interview) * 100) : 0}% Win Rate
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
