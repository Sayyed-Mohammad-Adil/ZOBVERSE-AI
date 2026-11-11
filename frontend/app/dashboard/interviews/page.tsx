"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Sparkles,
  Bell,
  MessageSquare,
  Building,
  MapPin,
  X,
  RefreshCw,
} from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

interface Interview {
  id: number;
  application_id?: number;
  user_id: number;
  company: string;
  role: string;
  interview_date: string;
  round: string;
  interviewer?: string;
  notes?: string;
  feedback?: string;
  next_step?: string;
  reminder_set: boolean;
  created_at?: string;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    interview_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    round: "Technical Screening",
    interviewer: "",
    notes: "",
    next_step: "Pending Interview Feedback",
    reminder_set: true,
  });

  const [feedbackData, setFeedbackData] = useState({
    feedback: "",
    next_step: "",
  });

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Please log in to view interviews.");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/interviews/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        setInterviews(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/interviews/${me.id}`, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          interview_date: new Date(formData.interview_date).toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to schedule interview");
      setIsAdding(false);
      setFormData({
        company: "",
        role: "",
        interview_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        round: "Technical Screening",
        interviewer: "",
        notes: "",
        next_step: "Pending Interview Feedback",
        reminder_set: true,
      });
      await loadInterviews();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFeedback = async () => {
    if (!selectedInterview) return;
    try {
      setIsUpdatingFeedback(true);
      const res = await fetchWithAuth(`/interviews/${selectedInterview.id}`, {
        method: "PUT",
        body: JSON.stringify(feedbackData),
      });
      if (!res.ok) throw new Error("Failed to update interview");
      setSelectedInterview(null);
      await loadInterviews();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUpdatingFeedback(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this interview session?")) return;
    try {
      setDeletingId(id);
      const res = await fetchWithAuth(`/interviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete interview");
      await loadInterviews();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Interview Tracking &amp; Prep
            </h1>
            <Badge variant="warning" size="sm" dot pulse>
              {interviews.length} Scheduled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize rounds, interviewer notes, STAR preparation points, and post-session outcomes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isAdding ? "Close Form" : "Schedule Interview"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadInterviews}
            loading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Schedule Interview Form Modal/Card */}
      {isAdding && (
        <Card className="glass-panel p-6 border-blue-200 animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <div>
              <CardTitle>Schedule an Upcoming Interview Session</CardTitle>
              <CardDescription>
                Store interview details to trigger timely prep reminders and log recruiter notes
              </CardDescription>
            </div>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <form onSubmit={handleCreateInterview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Company Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Stripe, OpenAI, Google"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Role
                </label>
                <input
                  required
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Round Format
                </label>
                <select
                  value={formData.round}
                  onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="HR / Recruiter Screening">HR / Recruiter Screening</option>
                  <option value="Technical Screening">Technical Screening</option>
                  <option value="System Design Architecture">System Design Architecture</option>
                  <option value="Coding &amp; Algorithms">Coding &amp; Algorithms</option>
                  <option value="Leadership &amp; Behavioral">Leadership &amp; Behavioral</option>
                  <option value="Executive Final Round">Executive Final Round</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Date &amp; Time
                </label>
                <input
                  required
                  type="datetime-local"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Interviewer(s) Name &amp; Title
                </label>
                <input
                  type="text"
                  value={formData.interviewer}
                  onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                  placeholder="e.g. Alex Chen, Head of Platform"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Next Step Plan
                </label>
                <input
                  type="text"
                  value={formData.next_step}
                  onChange={(e) => setFormData({ ...formData, next_step: e.target.value })}
                  placeholder="e.g. System design prep &amp; portfolio walk-through"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Preparation Strategy &amp; Talking Points
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Mention distributed lock experience, Redis patterns, questions to ask the interviewer..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.reminder_set}
                  onChange={(e) => setFormData({ ...formData, reminder_set: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Enable automated notification reminders before interview</span>
              </label>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={isSaving}>
                  Save Interview
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Main Interviews List */}
      {loading ? (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 shadow-lg py-12">
          <BrandLoader size="md" label="Loading scheduled interview rounds..." />
        </div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Interviews Scheduled Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When you advance to an interview stage or receive an invite, log it here to organize rounds, prep notes, and feedback.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsAdding(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Schedule First Interview
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => {
            const interviewDate = new Date(item.interview_date);
            const isPast = interviewDate.getTime() < Date.now();

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={isPast ? "secondary" : "warning"} size="sm" dot>
                      {item.round}
                    </Badge>

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {interviewDate.toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    {item.reminder_set && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <Bell className="w-3 h-3" /> Reminders On
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">
                    {item.role} <span className="text-slate-400 font-normal">at</span> {item.company}
                  </h3>

                  {item.interviewer && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Interviewer: {item.interviewer}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/80 leading-relaxed">
                      <span className="font-bold text-slate-500 block mb-0.5 uppercase tracking-wider text-[10px]">
                        Prep Notes &amp; Strategy:
                      </span>
                      {item.notes}
                    </div>
                  )}

                  {item.feedback && (
                    <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-950 border border-emerald-200 leading-relaxed">
                      <span className="font-bold text-emerald-700 block mb-0.5 uppercase tracking-wider text-[10px]">
                        Session Feedback &amp; Outcomes:
                      </span>
                      {item.feedback}
                    </div>
                  )}

                  {item.next_step && (
                    <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                      <span>Next Action:</span>
                      <span className="text-slate-700">{item.next_step}</span>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex sm:flex-row md:flex-col gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedInterview(item);
                      setFeedbackData({
                        feedback: item.feedback || "",
                        next_step: item.next_step || "",
                      });
                    }}
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Add Feedback
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
                    onClick={() => handleDelete(item.id)}
                    loading={deletingId === item.id}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Record Interview Feedback
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedInterview.round} • {selectedInterview.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedInterview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Interview Feedback &amp; Questions Asked
                </label>
                <textarea
                  value={feedbackData.feedback}
                  onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                  rows={4}
                  placeholder="How did the session go? System design questions, coding challenges, behavioral cues..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Next Step / Status
                </label>
                <input
                  type="text"
                  value={feedbackData.next_step}
                  onChange={(e) => setFeedbackData({ ...feedbackData, next_step: e.target.value })}
                  placeholder="e.g. Passed round • Scheduling final leadership chat"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedInterview(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateFeedback} loading={isUpdatingFeedback}>
                Save Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
