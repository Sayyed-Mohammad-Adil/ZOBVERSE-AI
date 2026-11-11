"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth, API_URL } from "@/lib/api";
import Link from "next/link";
import {
  User,
  Briefcase,
  Clock,
  Sparkles,
  Edit3,
  CheckCircle2,
  FileText,
  HelpCircle,
  Save,
  X,
  RefreshCw,
  ShieldCheck,
  Upload,
  Phone,
  MapPin,
  Globe,
  Code,
  Link as LinkIcon,
  FileSpreadsheet,
  AlertCircle,
  Check,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    current_role: "",
    total_experience_years: 0,
    skills: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    summary: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Failed to load user");
      const me = await meRes.json();

      const profileRes = await fetchWithAuth(`/profile/${me.id}`);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        populateFormData(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (data: any) => {
    const rawSkills = data.skills;
    const skillsString = Array.isArray(rawSkills)
      ? rawSkills.join(", ")
      : typeof rawSkills === "string"
      ? rawSkills
      : "";

    setFormData({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      current_role: data.current_role || "",
      total_experience_years: data.total_experience_years || 0,
      skills: skillsString,
      phone: data.phone || "",
      location: data.location || "",
      linkedin_url: data.linkedin_url || "",
      github_url: data.github_url || "",
      portfolio_url: data.portfolio_url || "",
      summary: data.summary || "",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      setError("");
      setUploadSuccess(null);

      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Failed to authenticate user");
      const me = await meRes.json();

      const uploadData = new FormData();
      uploadData.append("file", file);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/profile/upload-file/${me.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || "Failed to parse file");
      }

      const result = await res.json();
      setProfile(result.profile);
      populateFormData(result.profile);
      setUploadSuccess({
        filename: file.name,
        extracted: result.extracted_data,
        message: result.message,
        extractionStatus: result.extraction_status,
        ocrAvailable: result.ocr_available,
      });

      // Also trigger a refresh after 5 seconds to clear banner
      setTimeout(() => {
        setUploadSuccess(null);
      }, 8000);
    } catch (err: any) {
      setError(err.message || "File upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      const res = await fetchWithAuth(`/profile/${me.id}`, {
        method: profile ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save profile");
      setIsEditing(false);
      setSaveSuccess(true);
      await loadProfile();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const skillsList = Array.isArray(profile?.skills)
    ? profile.skills
    : typeof profile?.skills === "string"
    ? profile.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const fullName = `${profile?.first_name || "Candidate"} ${profile?.last_name || ""}`.trim();

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      {/* Hidden file input supporting PDF, DOCX, TXT, CSV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt,.csv"
        className="hidden"
      />

      {/* Profile Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-xl border-2 border-white/20">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  {fullName}
                </h1>
                <Badge variant="success" size="sm" dot>
                  Verified Brain
                </Badge>
              </div>
              <p className="text-sm font-semibold text-slate-300">
                {profile?.current_role || "Role not specified"} •{" "}
                {profile?.total_experience_years || 0} Years Experience
                {profile?.location && ` • ${profile.location}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer shadow-xs"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              {uploading ? "Extracting Details..." : "Upload CV / CSV to Auto-Fill"}
            </Button>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
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
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Fill Banner when CV / CSV Uploaded */}
      {uploadSuccess && (
        <div className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
          uploadSuccess.extractionStatus === "success"
            ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-emerald-500/30 text-emerald-950"
            : "bg-amber-50 border-amber-300 text-amber-950"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-bold">
              {uploadSuccess.extractionStatus === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>{uploadSuccess.message || `Uploaded '${uploadSuccess.filename}'.`}</span>
            </div>
            <button
              onClick={() => setUploadSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {typeof uploadSuccess.ocrAvailable === "boolean" && (
              <span className={`px-2.5 py-1 bg-white/80 rounded-lg border font-semibold shadow-2xs ${
                uploadSuccess.ocrAvailable
                  ? "border-emerald-200 text-emerald-900"
                  : "border-amber-300 text-amber-900"
              }`}>
                OCR {uploadSuccess.ocrAvailable ? "available" : "unavailable"}
              </span>
            )}
            {uploadSuccess.extracted?.first_name && (
              <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                Name: {uploadSuccess.extracted.first_name} {uploadSuccess.extracted.last_name || ""}
              </span>
            )}
            {uploadSuccess.extracted?.current_role && (
              <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                Role: {uploadSuccess.extracted.current_role}
              </span>
            )}
            {uploadSuccess.extracted?.total_experience_years !== null && (
              <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                Experience: {uploadSuccess.extracted.total_experience_years} Years
              </span>
            )}
            {uploadSuccess.extracted?.skills?.length > 0 && (
              <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                Skills: {uploadSuccess.extracted.skills.length} verified
              </span>
            )}
            {uploadSuccess.extracted?.location && (
              <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                Location: {uploadSuccess.extracted.location}
              </span>
            )}
            {uploadSuccess.extracted?.phone && (
              <span className="px-2.5 py-1 bg-white/80 rounded-lg border border-emerald-200 text-emerald-900 font-semibold shadow-2xs">
                Phone: {uploadSuccess.extracted.phone}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Profile and verified candidate details updated successfully!</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-700">Loading candidate profile...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Personal & Professional Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Auto-Fill Upload Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-blue-50/50 transition-all cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600/20 transition-all shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Auto-Fill from CV (PDF/DOCX) or CSV</span>
                    <Badge variant="primary" size="sm">Smart Import</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload your resume or candidate CSV. Laya AI extracts name, role, skills, experience &amp; contact automatically.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 bg-white hover:bg-slate-50 border-indigo-200 text-indigo-700 font-semibold"
                loading={uploading}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Browse File
              </Button>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Personal &amp; Professional Foundation</span>
                  </CardTitle>
                  <CardDescription>
                    Candidate metadata referenced across all automated agent applications
                  </CardDescription>
                </div>
              </CardHeader>

              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({ ...formData, first_name: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/80">
                        {profile?.first_name || "Not set"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({ ...formData, last_name: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/80">
                        {profile?.last_name || "Not set"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Current / Target Role
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.current_role}
                        onChange={(e) =>
                          setFormData({ ...formData, current_role: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/80">
                        {profile?.current_role || "Not set"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Total Experience (Years)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.total_experience_years}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            total_experience_years: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/80">
                        {profile?.total_experience_years || "0"} Years
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/80">
                        {profile?.phone || "Not set"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Location / Region
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="e.g. Bangalore, India or Remote"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 border border-slate-200/80">
                        {profile?.location || "Not set"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Online Profiles & Links */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Professional Profiles &amp; Portfolio
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                        <LinkIcon className="w-3.5 h-3.5 text-blue-600" /> LinkedIn URL
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/..."
                          value={formData.linkedin_url}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedin_url: e.target.value })
                          }
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : profile?.linkedin_url ? (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-2 bg-slate-50 rounded-xl text-xs text-blue-600 truncate hover:underline border border-slate-200/80 font-medium"
                        >
                          {profile.linkedin_url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <div className="p-2 bg-slate-50 rounded-xl text-xs text-slate-400 border border-slate-200/80 italic">
                          Not set
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-slate-800" /> GitHub URL
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          placeholder="https://github.com/..."
                          value={formData.github_url}
                          onChange={(e) =>
                            setFormData({ ...formData, github_url: e.target.value })
                          }
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : profile?.github_url ? (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-2 bg-slate-50 rounded-xl text-xs text-blue-600 truncate hover:underline border border-slate-200/80 font-medium"
                        >
                          {profile.github_url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <div className="p-2 bg-slate-50 rounded-xl text-xs text-slate-400 border border-slate-200/80 italic">
                          Not set
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-purple-600" /> Portfolio / Website
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          placeholder="https://yourportfolio.dev"
                          value={formData.portfolio_url}
                          onChange={(e) =>
                            setFormData({ ...formData, portfolio_url: e.target.value })
                          }
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : profile?.portfolio_url ? (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-2 bg-slate-50 rounded-xl text-xs text-blue-600 truncate hover:underline border border-slate-200/80 font-medium"
                        >
                          {profile.portfolio_url.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <div className="p-2 bg-slate-50 rounded-xl text-xs text-slate-400 border border-slate-200/80 italic">
                          Not set
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Professional Summary &amp; Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      placeholder="Brief overview of your experience, specializations, and career achievements..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-700 border border-slate-200/80 leading-relaxed">
                      {profile?.summary || "No professional summary provided yet. Upload a CV or CSV to auto-fill."}
                    </div>
                  )}
                </div>

                {/* Skills Cloud */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Verified Technical &amp; Domain Skills
                  </label>

                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={formData.skills}
                        onChange={(e) =>
                          setFormData({ ...formData, skills: e.target.value })
                        }
                        placeholder="Comma separated: Python, FastAPI, Docker, Next.js, PostgreSQL..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-[11px] text-slate-400">
                        Separate skills with commas. These are deterministically matched against job qualifications.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skillsList.length > 0 ? (
                        skillsList.map((skill: string) => (
                          <span
                            key={skill}
                            className="bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-xl font-semibold border border-blue-200/80 shadow-2xs"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">No skills listed yet.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Brain Sync & Fast Actions */}
          <div className="space-y-5">
            <Card className="glass-card">
              <CardHeader>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Candidate Brain Sync</span>
                  </CardTitle>
                </div>
              </CardHeader>

              <div className="space-y-3 pt-1 text-xs">
                <Link
                  href="/dashboard/resumes"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-slate-800">Resumes &amp; CVs</div>
                      <div className="text-[10px] text-slate-500">Auto-tailor per role</div>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">Manage</Badge>
                </Link>

                <Link
                  href="/dashboard/questions"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-slate-800">Question Bank</div>
                      <div className="text-[10px] text-slate-500">Work authorization &amp; notice</div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Review</Badge>
                </Link>
              </div>
            </Card>

            {/* Rule 2 Trust Guarantee */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800 shadow-md">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Hallucination Policy</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                The AI agent extracts authentic data directly from your uploaded CV or candidate CSV. It will never fabricate skills or employment history.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
