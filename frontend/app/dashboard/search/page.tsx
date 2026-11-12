"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  Search,
  MapPin,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
  CheckCircle2,
  Code2,
  Tag,
  Check,
  Plus,
  Target,
} from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

interface JobRecord {
  id: number;
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  skills?: string | null;
  skills_list?: string[];
  source?: string | null;
  work_mode?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: string | null;
  experience?: string | null;
  canonical_url?: string | null;
  application_url?: string | null;
  posted_at?: string | null;
  match_score?: number | null;
  matched_skills?: string[];
}

interface JobPlatform {
  id: string;
  name: string;
  status: "live" | "guided_only";
  notice: string;
  capabilities: {
    search: boolean;
    manual_action_required: boolean;
  };
}

const OFFICIAL_SEARCH_URLS: Record<string, (query: string, location: string) => string> = {
  linkedin: (query, location) =>
    `https://www.linkedin.com/jobs/search/?${new URLSearchParams({ keywords: query, location })}`,
  indeed: (query, location) =>
    `https://www.indeed.com/jobs?${new URLSearchParams({ q: query, l: location })}`,
  naukri: () => "https://www.naukri.com/",
  internshala: () => "https://internshala.com/jobs/",
  foundit: (query, location) =>
    `https://www.foundit.in/srp/results?${new URLSearchParams({ query, locations: location })}`,
  glassdoor: (query, location) =>
    `https://www.glassdoor.com/Job/jobs.htm?${new URLSearchParams({ "sc.keyword": query, "locKeyword": location })}`,
  wellfound: () => "https://wellfound.com/jobs",
  shine: () => "https://www.shine.com/job-search/",
  ziprecruiter: (query, location) =>
    `https://www.ziprecruiter.com/jobs-search?${new URLSearchParams({ search: query, location })}`,
  jobicy: (query) =>
    `https://jobicy.com/jobs?${new URLSearchParams({ search: query })}`,
};

function isJobPlatform(value: unknown): value is JobPlatform {
  if (!value || typeof value !== "object") return false;
  const platform = value as Partial<JobPlatform>;
  return (
    typeof platform.id === "string" &&
    typeof platform.name === "string" &&
    (platform.status === "live" || platform.status === "guided_only") &&
    typeof platform.notice === "string" &&
    typeof platform.capabilities === "object" &&
    platform.capabilities !== null
  );
}

export default function SearchPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [minSalary, setMinSalary] = useState("");
  const [resultLimit, setResultLimit] = useState(200);
  const [minMatchScore, setMinMatchScore] = useState("");
  const [scanning, setScanning] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);
  const [preparingId, setPreparingId] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [preparedApplicationUrl, setPreparedApplicationUrl] = useState<string | null>(null);
  const [availablePlatforms, setAvailablePlatforms] = useState<JobPlatform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "jobicy"]);
  const [savingPlatforms, setSavingPlatforms] = useState(false);

  // Skill-Wise Search State
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillMatchMode, setSkillMatchMode] = useState<"any" | "all">("any");
  const [popularSkills, setPopularSkills] = useState<{ skill: string; count: number }[]>([]);
  const [myProfileSkills, setMyProfileSkills] = useState<string[]>([]);
  const [profileRole, setProfileRole] = useState("");
  const [loadingProfileSkills, setLoadingProfileSkills] = useState(false);

  // Scan modal / custom scan query
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanQuery, setScanQuery] = useState("");
  const [scanSkillsInput, setScanSkillsInput] = useState("");

  const loadSkillsSummary = async () => {
    try {
      const res = await fetchWithAuth("/jobs/skills/summary");
      if (!res.ok) {
        throw new Error(
          `Could not load job skill data (HTTP ${res.status} ${res.statusText}).`,
        );
      }
      const data: unknown = await res.json();
      if (Array.isArray(data)) {
        setPopularSkills(data);
      }
    } catch (error) {
      console.error("Could not load job skill data:", error);
    }
  };

  const loadPlatforms = async (): Promise<string[]> => {
    try {
      const [sourcesRes, preferencesRes] = await Promise.all([
        fetchWithAuth("/settings/job-sources"),
        fetchWithAuth("/settings/job-sources/preferences"),
      ]);
      if (!sourcesRes.ok || !preferencesRes.ok) {
        throw new Error("Could not load your job platform preferences.");
      }
      const sources: unknown = await sourcesRes.json();
      const preferences = await preferencesRes.json();
      const selected = Array.isArray(preferences.platforms)
        ? preferences.platforms.filter(
            (platform: unknown): platform is string => typeof platform === "string",
          )
        : ["linkedin", "jobicy"];
      setAvailablePlatforms(
        Array.isArray(sources) ? sources.filter(isJobPlatform) : [],
      );
      setSelectedPlatforms(selected);
      return selected;
    } catch (error) {
      console.error("Could not load job platform preferences:", error);
      setError(error instanceof Error ? error.message : "Could not load job platforms.");
      return ["linkedin", "jobicy"];
    }
  };

  const loadCandidateProfileSkills = async (): Promise<string[]> => {
    try {
      setLoadingProfileSkills(true);
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Could not identify your account.");
      const me = await meRes.json();
      const res = await fetchWithAuth(`/profile/${me.id}`);
      if (!res.ok) throw new Error("Could not load your CV profile.");
      const data = await res.json();
      const list = Array.isArray(data.skills)
        ? data.skills.map((skill: unknown) => String(skill).trim()).filter(Boolean)
        : typeof data.skills === "string"
          ? data.skills.split(",").map((skill: string) => skill.trim()).filter(Boolean)
          : [];
      setMyProfileSkills(list);
      setProfileRole(data.current_role || "");
      return list;
    } catch (error) {
      console.error("Could not load CV profile skills:", error);
      return [];
    } finally {
      setLoadingProfileSkills(false);
    }
  };

  const loadJobs = async (
    customSkills?: string[],
    customMode?: "any" | "all",
    customPlatforms?: string[],
  ) => {
    try {
      setLoading(true);
      setError("");

      const activeSkills = customSkills ?? selectedSkills;
      const activeMode = customMode ?? skillMatchMode;
      const activePlatforms = customPlatforms ?? selectedPlatforms;
      if (activePlatforms.length === 0) {
        setJobs([]);
        return;
      }

      const params = new URLSearchParams();
      params.append("limit", String(Math.min(500, Math.max(1, resultLimit))));
      if (query.trim()) params.append("query", query.trim());
      if (activeSkills.length > 0) {
        params.append("skills", activeSkills.join(","));
        params.append("skill_match_mode", activeMode);
      }
      activePlatforms.forEach((platform) => params.append("sources", platform));
      if (workMode !== "All") params.append("work_mode", workMode);
      if (sourceFilter !== "All") params.append("source", sourceFilter);
      if (minSalary && parseFloat(minSalary) > 0) params.append("min_salary", minSalary);
      if (minMatchScore) params.append("min_match_score", minMatchScore);

      const res = await fetchWithAuth(`/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      } else {
        throw new Error("Failed to load jobs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(async () => {
      const platforms = await loadPlatforms();
      await loadCandidateProfileSkills();
      await loadJobs([], undefined, platforms);
      loadSkillsSummary();
    });
    // Load once with the initial filter values; subsequent filter changes use explicit handlers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlatform = async (platformId: string) => {
    const next = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter((platform) => platform !== platformId)
      : [...selectedPlatforms, platformId];
    try {
      setSavingPlatforms(true);
      const response = await fetchWithAuth("/settings/job-sources/preferences", {
        method: "PUT",
        body: JSON.stringify({ platforms: next }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Could not save your platform preferences.");
      }
      setSelectedPlatforms(data.platforms);
      if (sourceFilter !== "All" && !data.platforms.includes(sourceFilter)) {
        setSourceFilter("All");
      }
      await loadJobs(undefined, undefined, data.platforms);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save platform preferences.");
    } finally {
      setSavingPlatforms(false);
    }
  };

  // Toggle single skill tag
  const toggleSkill = (skillName: string) => {
    const exists = selectedSkills.some(
      (s) => s.toLowerCase() === skillName.toLowerCase()
    );
    let updated: string[];
    if (exists) {
      updated = selectedSkills.filter(
        (s) => s.toLowerCase() !== skillName.toLowerCase()
      );
    } else {
      updated = [...selectedSkills, skillName];
    }
    setSelectedSkills(updated);
    loadJobs(updated);
  };

  // Add custom typed skill
  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = skillInput.trim();
    if (!clean) return;

    if (!selectedSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      const updated = [...selectedSkills, clean];
      setSelectedSkills(updated);
      loadJobs(updated);
    }
    setSkillInput("");
  };

  // Clear all skill filters
  const clearAllSkills = () => {
    setSelectedSkills([]);
    loadJobs([]);
  };

  // One-click match candidate's profile skills
  const handleMatchProfileSkills = () => {
    if (myProfileSkills.length === 0) {
      setFeedbackMsg("Please add skills to your profile first in Candidate Settings!");
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }
    const primarySkills = myProfileSkills;
    setSelectedSkills(primarySkills);
    setSkillMatchMode("any");
    loadJobs(primarySkills, "any");
    setFeedbackMsg(
      `✓ Applied ${primarySkills.length} skills from your verified profile: ${primarySkills.join(", ")}`
    );
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Trigger web scan (optionally with skill tags)
  const handleScan = async (
    requestedRole = scanQuery.trim() || profileRole,
    requestedSkills = scanSkillsInput.trim() || myProfileSkills.join(", "),
  ) => {
    const role = requestedRole.trim();
    const skills = requestedSkills.trim();
    if (!role && !skills) {
      setError("Enter a target role or at least one skill before starting discovery.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError("Select at least one job platform before starting discovery.");
      return;
    }

    try {
      setScanning(true);
      setShowScanModal(false);

      const params = new URLSearchParams();
      params.append("query", role || skills);
      if (skills) params.append("skills", skills);
      params.append("platforms", selectedPlatforms.join(","));

      const res = await fetchWithAuth(`/workers/scan?${params.toString()}`, {
        method: "POST",
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.detail || "Live job search failed.");
      }

      await loadJobs([]);
      await loadSkillsSummary();
      setFeedbackMsg(
        result.fetched > 0
          ? `${result.message} ${result.newly_saved} new listings were added to your account.${
              result.errors?.length ? ` Some sources failed: ${result.errors.join("; ")}` : ""
            }${result.warnings?.length ? ` ${result.warnings.join("; ")}` : ""}`
          : `${result.message}${
              result.warnings?.length ? ` ${result.warnings.join("; ")}` : ""
            }${
              result.errors?.length ? ` Some sources failed: ${result.errors.join("; ")}` : ""
            }`,
      );
      setTimeout(() => setFeedbackMsg(null), 6000);
    } catch (err) {
      setError(
        "Live search failed: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      setScanning(false);
    }
  };

  const handlePrepareJob = async (jobId: number) => {
    try {
      setPreparingId(jobId);
      setPreparedApplicationUrl(null);
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Please log in first");
      const me = await meRes.json();

      const res = await fetchWithAuth(
        `/applications/prepare?job_id=${jobId}&user_id=${me.id}`,
        { method: "POST" }
      );

      if (res.ok) {
        const data = await res.json();
        const job = jobs.find((candidate) => candidate.id === jobId);
        setPreparedApplicationUrl(
          data.application_url || job?.application_url || job?.canonical_url || null,
        );
        setFeedbackMsg(
          `Application package is ready for ${data.job_title} at ${data.company}. No application was submitted.`
        );
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        const err = await res.json();
        setError(err.detail || "Failed to prepare application");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare application.");
    } finally {
      setPreparingId(null);
    }
  };

  // Company avatar monogram helper
  const getCompanyColor = (name: string) => {
    const colors = [
      "from-blue-600 to-indigo-600",
      "from-emerald-600 to-teal-600",
      "from-purple-600 to-pink-600",
      "from-amber-600 to-orange-600",
      "from-rose-600 to-red-600",
      "from-cyan-600 to-blue-600",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper to extract parsed skills from a job
  const getJobSkills = (job: JobRecord): string[] => {
    if (job.skills_list && Array.isArray(job.skills_list) && job.skills_list.length > 0) {
      return job.skills_list;
    }
    if (job.skills) {
      return job.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const formatSalary = (amount: number, currency?: string | null) => {
    const formattedAmount = amount.toLocaleString();
    if (currency === "INR") return `₹${formattedAmount}`;
    return currency ? `${currency} ${formattedAmount}` : formattedAmount;
  };

  // Comprehensive Client-side Filter with Skill Evaluation
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const jobSkills = getJobSkills(job);
      const jobSkillsLower = jobSkills.map((s) => s.toLowerCase());

      // 1. Text Query (Title, Company, Location, Skills, Description)
      const qLower = query.toLowerCase().trim();
      const matchesQuery =
        qLower === "" ||
        job.title.toLowerCase().includes(qLower) ||
        job.company.toLowerCase().includes(qLower) ||
        (job.location && job.location.toLowerCase().includes(qLower)) ||
        jobSkillsLower.some((s) => s.includes(qLower)) ||
        (job.description && job.description.toLowerCase().includes(qLower));

      // 2. Work Mode
      const matchesMode =
        workMode === "All" ||
        (job.work_mode && job.work_mode.toLowerCase() === workMode.toLowerCase()) ||
        (workMode === "Remote" &&
          job.location &&
          job.location.toLowerCase().includes("remote"));

      // 3. Source
      const matchesSource =
        sourceFilter === "All" ||
        (job.source && job.source.toLowerCase() === sourceFilter.toLowerCase());

      // 4. Min Salary
      const minSal = minSalary ? parseFloat(minSalary) : 0;
      const matchesSalary = minSal === 0 || (!job.salary_min || job.salary_min >= minSal);

      // 5. Skill-Wise Matching
      let matchesSkills = true;
      if (selectedSkills.length > 0) {
        const matched = selectedSkills.filter((sel) => {
          const sLower = sel.toLowerCase();
          return (
            jobSkillsLower.some((js) => js === sLower || js.includes(sLower) || sLower.includes(js)) ||
            job.title.toLowerCase().includes(sLower) ||
            (job.description && job.description.toLowerCase().includes(sLower))
          );
        });

        if (skillMatchMode === "all") {
          matchesSkills = matched.length === selectedSkills.length;
        } else {
          matchesSkills = matched.length > 0;
        }
      }

      return matchesQuery && matchesMode && matchesSource && matchesSalary && matchesSkills;
    });
  }, [jobs, query, workMode, sourceFilter, minSalary, selectedSkills, skillMatchMode]);

  // Available skills to display in the quick pill row
  const displaySkillPills = useMemo(() => {
    return popularSkills.slice(0, 16).map((ps) => ps.skill);
  }, [popularSkills]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Job Discovery &amp; Search
            </h1>
            <Badge variant="primary" size="sm">
              {loading ? "Loading listings" : `${jobs.length} Listings Loaded`}
            </Badge>
            {selectedSkills.length > 0 && (
              <Badge variant="success" size="sm" className="hidden sm:inline-flex">
                <Code2 className="w-3 h-3 mr-1" />
                {selectedSkills.length} Skill{selectedSkills.length > 1 ? "s" : ""} Filtered
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search opportunities skill-wise, role-wise, or align with your candidate CV profile.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            LinkedIn results come from public job listings; your LinkedIn connection is used for application actions, not job-search authentication.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {myProfileSkills.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMatchProfileSkills}
              loading={loadingProfileSkills}
              leftIcon={<Target className="w-4 h-4 text-blue-600" />}
              className="border-blue-200 text-blue-700 hover:bg-blue-50/80 font-bold"
            >
              Match My Skills ({myProfileSkills.length})
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => {
              setScanQuery(profileRole);
              setScanSkillsInput(myProfileSkills.join(", "));
              setShowScanModal(true);
            }}
            loading={scanning}
            leftIcon={<RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />}
          >
            {scanning ? "Scanning Live..." : "Scan Web For Jobs"}
          </Button>
        </div>
      </div>

      {/* Notifications / Toast */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
            {preparedApplicationUrl && (
              <a
                href={preparedApplicationUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline underline-offset-2"
              >
                Continue on official job page
              </a>
            )}
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SKILL-WISE SEARCH & FILTER HERO CARD */}
      <Card className="glass-panel p-5 space-y-4 border border-blue-100 shadow-sm bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Skill-Wise Search &amp; Tech Stack Filters
              </h2>
              <p className="text-[11px] text-slate-500">
                Select one or more technologies to filter matching jobs instantaneously
              </p>
            </div>
          </div>

          {/* Match Mode (Any vs All) & Clear */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSkillMatchMode("any");
                  loadJobs(undefined, "any");
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  skillMatchMode === "any"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Match Any (OR)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSkillMatchMode("all");
                  loadJobs(undefined, "all");
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  skillMatchMode === "all"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Match All (AND)
              </button>
            </div>

            {selectedSkills.length > 0 && (
              <button
                onClick={clearAllSkills}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Clear Skills
              </button>
            )}
          </div>
        </div>

        {/* Quick Skill Filter Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>Popular &amp; Discovered Skills:</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            {displaySkillPills.map((skill) => {
              const isSelected = selectedSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 scale-[1.02]"
                      : "bg-white hover:bg-slate-100/90 text-slate-700 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Skill Input & Active Filter Chips */}
        <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Custom typed skill input */}
          <form
            onSubmit={handleAddCustomSkill}
            className="flex items-center gap-2 flex-1 max-w-md"
          >
            <div className="relative flex-1">
              <Code2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Add custom skill (e.g. Docker, Rust, Kafka)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={!skillInput.trim()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </form>

          {/* Active Skills Display */}
          {selectedSkills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap flex-1 justify-start md:justify-end">
              <span className="text-xs font-bold text-slate-500 mr-1">Active:</span>
              {selectedSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-in fade-in"
                >
                  <span>{s}</span>
                  <button
                    onClick={() => toggleSkill(s)}
                    className="hover:text-blue-900 ml-0.5"
                    title={`Remove ${s}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Main Search & Additional Filters Bar */}
      <Card className="glass-panel p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by role title, company, skills, keywords (e.g. 'Senior Python', 'FastAPI', 'Remote')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                void handleScan(
                  query.trim() || profileRole,
                  selectedSkills.join(", ") || myProfileSkills.join(", "),
                )
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  void handleScan(
                    profileRole,
                    selectedSkills.join(", ") || myProfileSkills.join(", "),
                  );
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {/* Work Mode */}
            <select
              value={workMode}
              onChange={(e) => {
                setWorkMode(e.target.value);
              }}
              className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>

            {/* Source */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
              }}
              className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Sources</option>
              {availablePlatforms
                .filter((platform) => selectedPlatforms.includes(platform.id))
                .map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
            </select>

            {/* Salary */}
            <input
              type="number"
              placeholder="Min Salary"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="w-28 px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              Match
              <select
                aria-label="Minimum match score"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(e.target.value)}
                className="px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="70">70%+</option>
                <option value="80">80%+</option>
                <option value="90">90%+</option>
                <option value="95">95%+</option>
              </select>
            </label>

            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              Results
              <input
                type="number"
                min={1}
                max={500}
                value={resultLimit}
                aria-label="Maximum search results"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setResultLimit(Number.isFinite(value) ? Math.min(500, Math.max(1, value)) : 1);
                }}
                className="w-20 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleScan(
                  query.trim() || profileRole,
                  selectedSkills.join(", ") || myProfileSkills.join(", "),
                )
              }
              loading={scanning || loading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${scanning || loading ? "animate-spin" : ""}`} />}
            >
              Search Live Jobs
            </Button>
          </div>
        </div>

        {availablePlatforms.length > 0 && (
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Discovery Platforms ({selectedPlatforms.length}/{availablePlatforms.length} selected)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400">
                  Live feeds run in-app; guided boards open on their official search pages.
                </span>
                <Link
                  href="/dashboard/guide"
                  className="text-[11px] font-bold text-blue-700 hover:underline whitespace-nowrap"
                >
                  Link Accounts &amp; Guide &rarr;
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availablePlatforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    type="button"
                    disabled={savingPlatforms}
                    onClick={() => void togglePlatform(platform.id)}
                    title={platform.notice}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer disabled:opacity-60 ${
                      isSelected
                        ? "bg-blue-50 text-blue-800 border-blue-300 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-blue-600 stroke-[3]" />}
                    <span>{platform.name}</span>
                    <span
                      className={`rounded px-1 py-0.5 text-[9px] uppercase font-bold ${
                        platform.status === "live"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {platform.status === "live" ? "Live" : "Guided"}
                    </span>
                  </button>
                );
              })}
            </div>
            {availablePlatforms.some(
              (platform) =>
                selectedPlatforms.includes(platform.id) &&
                platform.status === "guided_only",
            ) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span className="text-[11px] font-semibold text-slate-500">
                  Official guided search:
                </span>
                {availablePlatforms
                  .filter(
                    (platform) =>
                      selectedPlatforms.includes(platform.id) &&
                      platform.status === "guided_only",
                  )
                  .map((platform) => {
                    const searchUrl = OFFICIAL_SEARCH_URLS[platform.id];
                    return searchUrl ? (
                      <a
                        key={platform.id}
                        href={searchUrl(
                          query.trim() || profileRole || selectedSkills.join(" "),
                          "Remote",
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
                      >
                        <span>{platform.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null;
                  })}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Main Grid: Listings & Filter Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{filteredJobs.length}</strong> of {jobs.length} positions
            </span>
            {selectedSkills.length > 0 && (
              <span className="text-blue-600 font-semibold">
                matching [{selectedSkills.join(", ")}]
              </span>
            )}
          </div>
          <span>Filtered by your selected criteria</span>
        </div>

        {loading ? (
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 shadow-lg py-12">
            <BrandLoader size="md" label="Searching jobs skill-wise &amp; querying database..." />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                No jobs match your current skill criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Try switching to <strong>Match Any (OR)</strong> mode, removing some skills, or triggering a live web scan.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              {selectedSkills.length > 0 && (
                <Button variant="secondary" size="sm" onClick={clearAllSkills}>
                  Clear Skill Filters
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowScanModal(true)}
                loading={scanning}
              >
                Scan Web For Jobs
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredJobs.map((job) => {
              const monogramColor = getCompanyColor(job.company || "");
              const isPreparing = preparingId === job.id;
              const jobSkills = getJobSkills(job);

              // Calculate match against user selected skills
              const matchedActiveSkills = selectedSkills.filter((sel) =>
                jobSkills.some(
                  (js) =>
                    js.toLowerCase() === sel.toLowerCase() ||
                    js.toLowerCase().includes(sel.toLowerCase()) ||
                    sel.toLowerCase().includes(js.toLowerCase())
                )
              );

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all duration-200 group flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  {/* Left: Job Meta & Company */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${monogramColor} text-white flex items-center justify-center font-extrabold text-base shadow-sm shrink-0 group-hover:scale-105 transition-transform mt-0.5`}
                    >
                      {job.company?.charAt(0).toUpperCase() || "?"}
                    </div>

                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2
                          onClick={() => setSelectedJob(job)}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer truncate"
                        >
                          {job.title}
                        </h2>

                        <Badge variant="cyan" size="sm">
                          {job.source || "Source not provided"}
                        </Badge>

                        {job.work_mode && (
                          <Badge variant="secondary" size="sm">
                            {job.work_mode}
                          </Badge>
                        )}
                        {job.experience && (
                          <Badge variant="secondary" size="sm">
                            {job.experience}
                          </Badge>
                        )}

                        {selectedSkills.length > 0 && matchedActiveSkills.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-mono">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {matchedActiveSkills.length}/{selectedSkills.length} Skills Match
                          </span>
                        )}

                        {job.match_score != null && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                            🎯 {Math.round(job.match_score)}% Match
                          </span>
                        )}
                        {job.match_score != null && job.match_score >= 95 && (
                          <Badge variant="success" size="sm">95%+ match</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap">
                        <span className="font-semibold text-slate-800">
                          {job.company || "Company not provided"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location || "Location not provided"}
                        </span>
                        {job.salary_min != null && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                              {formatSalary(job.salary_min, job.salary_currency)}
                              {job.salary_max
                                ? ` - ${formatSalary(job.salary_max, job.salary_currency)}`
                                : ""}
                            </span>
                          </>
                        )}
                        {job.posted_at && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">
                              Posted {new Date(job.posted_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">
                        {job.description || "Description not provided by source."}
                      </p>

                      {/* SKILL TAGS ON JOB CARD */}
                      {jobSkills.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Skills:
                          </span>
                          {jobSkills.map((sk) => {
                            const isMatched = selectedSkills.some(
                              (sel) =>
                                sel.toLowerCase() === sk.toLowerCase() ||
                                sk.toLowerCase().includes(sel.toLowerCase()) ||
                                sel.toLowerCase().includes(sk.toLowerCase())
                            );

                            return (
                              <button
                                key={sk}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSkill(sk);
                                }}
                                title={`Filter by ${sk}`}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                  isMatched
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                }`}
                              >
                                {isMatched && "✓ "}
                                {sk}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center md:flex-col lg:flex-row gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 self-center md:self-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                    >
                      Details
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePrepareJob(job.id)}
                      loading={isPreparing}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Prepare Application
                    </Button>

                    {job.canonical_url && (
                      <a
                        href={job.canonical_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Original Job Posting"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-Over Drawer for Selected Job Details */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="primary" size="sm">
                    {selectedJob.source || "Source not provided"}
                  </Badge>
                  {selectedJob.work_mode && (
                    <Badge variant="secondary" size="sm">
                      {selectedJob.work_mode}
                    </Badge>
                  )}
                  {selectedJob.experience && (
                    <Badge variant="secondary" size="sm">
                      {selectedJob.experience}
                    </Badge>
                  )}
                  {selectedJob.skills_list && selectedJob.skills_list.length > 0 && (
                    <Badge variant="cyan" size="sm">
                      {selectedJob.skills_list.length} Skills Listed
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedJob.title}
                </h2>
                <div className="text-sm font-semibold text-slate-700">
                  {selectedJob.company || "Company not provided"} •{" "}
                  {selectedJob.location || "Location not provided"}
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Compensation Card */}
              {selectedJob.salary_min != null && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Disclosed Compensation
                    </div>
                    <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                      {formatSalary(
                        selectedJob.salary_min,
                        selectedJob.salary_currency,
                      )}
                      {selectedJob.salary_max
                        ? ` - ${formatSalary(
                            selectedJob.salary_max,
                            selectedJob.salary_currency,
                          )}`
                        : ""}
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Listed by Source
                  </Badge>
                </div>
              )}

              {/* Verified Job Skills Box */}
              {getJobSkills(selectedJob).length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-blue-600" />
                      Required &amp; Extracted Skills
                    </span>
                    <span className="text-[11px] text-blue-700 font-semibold">
                      Click any skill to filter
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {getJobSkills(selectedJob).map((sk) => {
                      const isCandidateSkill = myProfileSkills.some(
                        (ps) => ps.toLowerCase() === sk.toLowerCase()
                      );
                      const isFilterSkill = selectedSkills.some(
                        (ss) => ss.toLowerCase() === sk.toLowerCase()
                      );

                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isFilterSkill
                              ? "bg-blue-600 text-white shadow-xs"
                              : isCandidateSkill
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-white text-slate-700 border border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          {isCandidateSkill && (
                            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                          )}
                          <span>{sk}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description & Requirements */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Role Overview &amp; Requirements
                </h4>
                {selectedJob.posted_at && (
                  <p className="text-xs text-slate-500">
                    Posted {new Date(selectedJob.posted_at).toLocaleDateString()}
                  </p>
                )}
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 font-sans">
                  {selectedJob.description || "Description not provided by source."}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
              {selectedJob.canonical_url ? (
                <a
                  href={selectedJob.canonical_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open on Platform</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={preparingId === selectedJob.id}
                  onClick={() => {
                    handlePrepareJob(selectedJob.id);
                  }}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Prepare Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Skill Web Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Live Job Discovery
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search enabled feeds and open other selected boards on their official search pages.
                </p>
              </div>
              <button
                onClick={() => setShowScanModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Job platforms
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availablePlatforms.map((platform) => (
                    <label
                      key={platform.id}
                      className="flex items-start gap-2 rounded-xl border border-slate-200 p-2.5 text-xs cursor-pointer hover:border-blue-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        disabled={savingPlatforms}
                        onChange={() => void togglePlatform(platform.id)}
                        className="mt-0.5 accent-blue-600"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          {platform.name}
                          <span className={`rounded px-1 py-0.5 text-[9px] uppercase ${
                            platform.status === "live"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {platform.status === "live" ? "Live" : "Guided"}
                          </span>
                        </span>
                        <span className="mt-1 block text-[10px] leading-relaxed text-slate-500">
                          {platform.notice}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {availablePlatforms
                    .filter(
                      (platform) =>
                        selectedPlatforms.includes(platform.id) &&
                        platform.status === "guided_only",
                    )
                    .map((platform) => {
                      const searchUrl = OFFICIAL_SEARCH_URLS[platform.id];
                      return searchUrl ? (
                        <a
                          key={platform.id}
                          href={searchUrl(scanQuery || profileRole || scanSkillsInput, "Remote")}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-semibold text-blue-700 hover:underline"
                        >
                          Open {platform.name} official search ↗
                        </a>
                      ) : null;
                    })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={scanQuery}
                  onChange={(e) => setScanQuery(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Specific Skills to Target
                </label>
                <input
                  type="text"
                  value={scanSkillsInput}
                  onChange={(e) => setScanSkillsInput(e.target.value)}
                  placeholder="e.g. Python, FastAPI, Docker, PostgreSQL"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Comma-separated skills to extract and prioritize in this discovery cycle.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowScanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleScan()}
                loading={scanning}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />}
              >
                Start Skill Scan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
