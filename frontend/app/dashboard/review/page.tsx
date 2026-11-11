"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  XCircle,
  HelpCircle,
  RefreshCw,
  Building,
  MapPin,
  Sparkles,
  Lock,
  X,
} from "lucide-react";

interface ReviewItem {
  id: string;
  job_id: number;
  application_id?: number;
  type: string;
  title: string;
  reason: string;
  company: string;
  job_title: string;
  location?: string;
  source: string;
  url?: string;
  match_score?: number;
  created_at?: string;
  details?: any;
}

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeItem, setActiveItem] = useState<ReviewItem | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviewQueue();
  }, []);

  const loadReviewQueue = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Please log in to view review items.");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/review/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    item: ReviewItem,
    action: "APPROVE" | "SKIP" | "EDIT",
    notes?: string,
    updatedSalary?: number
  ) => {
    try {
      setSubmittingAction(true);
      setActionLoadingId(`${item.id}_${action}`);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const res = await fetchWithAuth("/review/resolve", {
        method: "POST",
        body: JSON.stringify({
          review_item_id: item.id,
          job_id: item.job_id,
          user_id: me.id,
          action: action,
          notes: notes,
          updated_salary: updatedSalary,
        }),
      });

      if (!res.ok) throw new Error("Failed to process review action");
      setActiveItem(null);
      await loadReviewQueue();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingAction(false);
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Human-in-the-Loop Review Queue
            </h1>
            {items.length > 0 ? (
              <Badge variant="warning" size="sm" dot pulse>
                {items.length} Pending Approval
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                Queue Clear
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rule 2 Strict Compliance: Zero silent fabrication, human confirmation for ambiguous questions &amp; external portal actions.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadReviewQueue}
          loading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh Queue
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Queue View */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-700">Verifying review items...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/60 border border-emerald-200/80 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">
              Review Queue is 100% Clear
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No applications require manual confirmation, CAPTCHA bypass, or screening question clarification. The autonomous agent is executing cleanly.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-white border-2 border-amber-300/80 shadow-md hover:shadow-lg transition-all duration-200 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="warning" size="sm">
                      {item.type.replace(/_/g, " ")}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      Source: {item.source}
                    </Badge>
                    {item.match_score && (
                      <Badge variant="success" size="sm">
                        {item.match_score}% Confidence Match
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">
                    {item.job_title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span>{item.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location || "Location not provided"}
                    </span>
                  </div>

                  {/* Clarification Requirement Box */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs leading-relaxed space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Review Trigger Reason:</span>
                    </div>
                    <div className="pl-5 text-slate-700 font-medium">
                      {item.reason}
                    </div>
                  </div>

                  {item.url && (
                    <div className="pt-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Open Original Listing / External Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 justify-center">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() =>
                      handleAction(
                        item,
                        "APPROVE",
                        "Approved by candidate via Review Queue"
                      )
                    }
                    loading={actionLoadingId === `${item.id}_APPROVE`}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Approve &amp; Send
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setActiveItem(item);
                      setEditNotes("");
                      setEditSalary("");
                    }}
                    leftIcon={<Edit3 className="w-4 h-4 text-slate-600" />}
                  >
                    Provide Details
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
                    onClick={() =>
                      handleAction(
                        item,
                        "SKIP",
                        "Candidate chose to skip in review queue"
                      )
                    }
                    loading={actionLoadingId === `${item.id}_SKIP`}
                    leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                  >
                    Skip Opportunity
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Provide Info Modal */}
      {activeItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Provide Clarification
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeItem.job_title} at {activeItem.company}
                </p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Candidate Notes / Answer Clarification
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. 'I hold permanent residency' or 'Authorized salary minimum $135k'..."
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Salary (Optional)
                </label>
                <input
                  type="number"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  placeholder="e.g. 145000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setActiveItem(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={submittingAction}
                onClick={() =>
                  handleAction(
                    activeItem,
                    "APPROVE",
                    editNotes || "Approved with user provided notes",
                    editSalary ? parseFloat(editSalary) : undefined
                  )
                }
              >
                Save &amp; Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
