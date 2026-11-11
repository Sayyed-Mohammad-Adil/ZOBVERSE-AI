"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  HelpCircle,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Bot,
  Layers,
  X,
  Loader2,
} from "lucide-react";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    question_text: "",
    answer_text: "",
    category: "TECHNICAL",
    confidence_score: 0.8,
    source: "User confirmed",
  });

  // AI Test Question state
  const [testPrompt, setTestPrompt] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Failed to load user");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/questions/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      setIsSaving(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/questions/${me.id}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add question");
      setIsAdding(false);
      setFormData({
        question_text: "",
        answer_text: "",
        category: "TECHNICAL",
        confidence_score: 0.8,
        source: "User confirmed",
      });
      await loadQuestions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this answer from your bank?")) return;
    try {
      setDeletingId(id);
      const res = await fetchWithAuth(`/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete question");
      await loadQuestions();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTestClassifier = async () => {
    if (!testPrompt) return;
    setIsTesting(true);
    try {
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const res = await fetchWithAuth("/questions/classify", {
        method: "POST",
        body: JSON.stringify({ user_id: me.id, question_text: testPrompt }),
      });
      if (res.ok) {
        const result = await res.json();
        setTestResult(result);
      }
    } catch (err: any) {
      alert("Error testing classifier: " + err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Verified Question Bank
            </h1>
            <Badge variant="success" size="sm" dot>
              {questions.length} Answers Stored
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deterministic pre-screening answers (Work authorization, notice period, relocation) with zero hallucination guarantee
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isAdding ? "Close Form" : "Add Q&amp;A"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadQuestions}
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

      {/* Test / Simulate Question Auto-Resolution */}
      <Card className="glass-panel p-5 border-indigo-200/80">
        <CardHeader>
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Simulate AI Screening Question Resolution</span>
            </CardTitle>
            <CardDescription>
              Test how the agent will resolve real recruiter screening prompts without hallucination
            </CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="e.g. 'Are you authorized to work in the US without sponsorship?' or 'Years of Python?'"
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestClassifier}
              loading={isTesting}
              leftIcon={<Sparkles className="w-4 h-4 text-indigo-600" />}
            >
              Analyze Prompt
            </Button>
          </div>

          {testResult && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary" size="sm">
                  Category: {testResult.category}
                </Badge>
                <Badge
                  variant={testResult.confidence >= 0.8 ? "success" : "warning"}
                  size="sm"
                  dot
                >
                  Confidence: {Math.round(testResult.confidence * 100)}%
                </Badge>
                <span className="text-[11px] text-slate-500">
                  Source: <strong>{testResult.source}</strong>
                </span>
              </div>

              <div className="pt-1 text-slate-800">
                <span className="font-bold text-slate-600 block mb-0.5">Resolved Answer:</span>
                {testResult.suggested_answer ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
                    {testResult.suggested_answer}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>User Confirmation Required • Routed to Review Queue</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Add Q&A Form */}
      {isAdding && (
        <Card className="glass-panel p-6 border-blue-200 animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <div>
              <CardTitle>Add Verified Candidate Q&amp;A</CardTitle>
              <CardDescription>
                Provide the exact truth for common application screening prompts
              </CardDescription>
            </div>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Question / Screening Prompt
              </label>
              <input
                type="text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="e.g. Will you now or in the future require visa sponsorship?"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Your Confirmed Answer
              </label>
              <textarea
                value={formData.answer_text}
                onChange={(e) => setFormData({ ...formData, answer_text: e.target.value })}
                rows={3}
                placeholder="e.g. No, I am a US citizen and do not require visa sponsorship."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Question Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="WORK_AUTHORIZATION">Work Authorization &amp; Visa</option>
                  <option value="NOTICE_PERIOD">Notice Period &amp; Availability</option>
                  <option value="SALARY_EXPECTATION">Salary &amp; Compensation</option>
                  <option value="RELOCATION">Relocation &amp; Travel</option>
                  <option value="TECHNICAL">Technical Skills &amp; Experience</option>
                  <option value="BEHAVIORAL">Behavioral &amp; Culture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Confidence Score
                </label>
                <select
                  value={formData.confidence_score}
                  onChange={(e) =>
                    setFormData({ ...formData, confidence_score: parseFloat(e.target.value) })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="1.0">100% (Confirmed)</option>
                  <option value="0.9">90% (High Confidence)</option>
                  <option value="0.8">80% (Requires Context)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddQuestion} loading={isSaving}>
                Save to Bank
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Question Cards List */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-700">Loading saved answers...</div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Your Question Bank is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add standard answers for work authorization, notice periods, and experience to accelerate automated submissions.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsAdding(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add First Answer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="cyan" size="sm">
                      {q.category?.replace(/_/g, " ") || "GENERAL"}
                    </Badge>
                    <Badge variant="success" size="sm" dot>
                      {typeof q.confidence_score === "number"
                        ? `${Math.round(q.confidence_score * 100)}% Confidence`
                        : "Confidence not recorded"}
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Source: {q.source || "Not recorded"}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 pt-1">
                    {q.question_text}
                  </h3>
                </div>

                <button
                  onClick={() => handleDelete(q.id)}
                  disabled={deletingId === q.id}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                  title="Delete Question"
                >
                  {deletingId === q.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-sans">
                <span className="font-bold text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">
                  Confirmed Candidate Answer:
                </span>
                {q.answer_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
