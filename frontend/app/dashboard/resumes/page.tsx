"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth, API_URL } from "@/lib/api";
import {
  FileText,
  Upload,
  Star,
  Trash2,
  CheckCircle2,
  Sparkles,
  FileCheck,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Failed to load user");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/resumes/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        setResumes(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/resumes/?user_id=${me.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload resume");

      setToastMsg(`✓ Successfully parsed and indexed '${file.name}'`);
      await loadResumes();
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSetDefault = async (resumeId: number) => {
    try {
      setSettingDefaultId(resumeId);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();
      const res = await fetchWithAuth(
        `/resumes/${resumeId}/default?user_id=${me.id}`,
        { method: "PUT" }
      );
      if (res.ok) {
        await loadResumes();
      }
    } catch (err: any) {
      alert("Failed to set default: " + err.message);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm("Are you sure you want to remove this resume file?")) return;
    try {
      setDeletingId(resumeId);
      const res = await fetchWithAuth(`/resumes/${resumeId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadResumes();
      }
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Resumes &amp; Tailored CVs
            </h1>
            <Badge variant="primary" size="sm">
              {resumes.length} Uploaded
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deterministic parsing extracts verified skills; the agent selects the highest-scoring CV per job application
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            {uploading ? "Extracting & Syncing..." : "Upload CV or CSV"}
          </Button>
        </div>
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

      {/* Upload Dropzone Hero */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 rounded-3xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white/60 hover:bg-blue-50/20 text-center transition-all duration-200 cursor-pointer group space-y-3"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Click or drag &amp; drop to upload a CV or candidate details CSV
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF, DOCX, DOC, TXT, or CSV. Automatically extracts candidate name, skills, role, and contact into your Profile.
          </p>
        </div>
      </div>

      {/* Resumes Grid */}
      {loading && resumes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-700">Loading CV library...</div>
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No resumes stored. Upload a PDF to start automated matching.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                resume.is_default
                  ? "border-blue-400 shadow-md ring-2 ring-blue-500/20"
                  : "border-slate-200/90 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 truncate">
                      {resume.original_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Uploaded on {new Date(resume.created_at).toLocaleDateString([], { dateStyle: "medium" })}
                    </p>
                  </div>
                </div>

                {resume.is_default && (
                  <Badge variant="primary" size="sm" dot>
                    Primary CV
                  </Badge>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  {!resume.is_default && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleSetDefault(resume.id)}
                      loading={settingDefaultId === resume.id}
                      leftIcon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Make Primary
                    </Button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={() => handleDelete(resume.id)}
                  loading={deletingId === resume.id}
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
