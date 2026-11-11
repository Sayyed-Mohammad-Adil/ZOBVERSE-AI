"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  DollarSign,
  Bot,
  CheckCircle2,
  Save,
  RefreshCw,
  X,
  Gauge,
} from "lucide-react";

interface UserPreferences {
  target_salary?: number | null;
  minimum_salary?: number | null;
  automation_mode?: string | null;
  daily_application_limit?: number | null;
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    target_salary: 0,
    minimum_salary: 0,
    automation_mode: "Assisted",
    daily_application_limit: 10,
  });

  const loadPreferences = async () => {
    try {
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Failed to load user");
      setError("");
      const me = await meRes.json();

      const prefRes = await fetchWithAuth(`/preferences/${me.id}`);
      if (prefRes.ok) {
        const data = await prefRes.json();
        setPrefs(data);
        setFormData({
          target_salary: data.target_salary ?? 0,
          minimum_salary: data.minimum_salary ?? 0,
          automation_mode: data.automation_mode || "Assisted",
          daily_application_limit: data.daily_application_limit ?? 10,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadPreferences);
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/preferences/${me.id}`, {
        method: prefs ? "PUT" : "POST",
        body: JSON.stringify({
          ...formData,
          target_salary: formData.target_salary || null,
          minimum_salary: formData.minimum_salary || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save preferences");
      setToastMsg("✓ Preferences and safety limits saved successfully!");
      await loadPreferences();
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const modes = [
    {
      id: "Manual",
      title: "Manual",
      subtitle: "Discovery & Qualification Only",
      desc: "Agent discovers and evaluates jobs; no applications are queued or submitted without manual click.",
    },
    {
      id: "Assisted",
      title: "Assisted (Recommended)",
      subtitle: "Human Review Gate",
      desc: "Agent prepares answers and aligns CVs, routing all submissions to your Review Queue for 1-click approval.",
    },
    {
      id: "Autonomous",
      title: "Autonomous",
      subtitle: "Direct Safe Submission",
      desc: "Agent directly applies to matches >80% confidence and routes ambiguous questions to human review.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Search &amp; Safety Preferences
            </h1>
            <Badge variant="primary" size="sm">
              Safety First
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure automation thresholds, daily rate limits, and compensation requirements
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          loading={saving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-700">Loading candidate preferences...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Automation Mode Selector */}
          <Card className="glass-card">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <span>Automation Execution Level</span>
                </CardTitle>
                <CardDescription>
                  Controls how autonomously the AI agent executes applications
                </CardDescription>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {modes.map((m) => {
                const isSelected = formData.automation_mode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setFormData({ ...formData, automation_mode: m.id })}
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer space-y-2 flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200/90 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{m.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="text-[11px] font-semibold text-blue-700">{m.subtitle}</div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-1">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Daily Rate Limits & Safety */}
          <Card className="glass-card">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-600" />
                  <span>Rate Limiting &amp; Velocity Control</span>
                </CardTitle>
                <CardDescription>
                  Prevents platform rate limits, aggressive spamming, and account flags
                </CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Daily Application Limit:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      aria-label="Daily application limit"
                      value={formData.daily_application_limit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daily_application_limit: Math.min(
                            500,
                            Math.max(1, Number(e.target.value) || 1),
                          ),
                        })
                      }
                      className="w-20 px-2 py-1 text-right text-sm font-bold text-blue-700 bg-white border border-blue-200 rounded-lg"
                    />
                    <span className="text-sm font-extrabold text-blue-600">/ day</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={formData.daily_application_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_application_limit: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 (Conservative)</span>
                  <span>10 (Recommended)</span>
                  <span>500 (Maximum)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  This is a daily ceiling. Each auto-apply cycle remains separately capped.
                </p>
              </div>
            </div>
          </Card>

          {/* Target Compensation */}
          <Card className="glass-card">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Target Compensation Requirements</span>
                </CardTitle>
                <CardDescription>
                  Jobs with disclosed salaries below your floor will be safely excluded
                </CardDescription>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Desired Salary
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    value={formData.target_salary || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_salary: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Absolute Minimum Floor
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    value={formData.minimum_salary || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimum_salary: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
