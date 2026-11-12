"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  BookOpen,
  CheckCircle2,
  Compass,
  ExternalLink,
  Key,
  Link2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

type AuthMethod = "profile_link" | "session_cookie" | "credentials";

interface PlatformConnection {
  id: string;
  name: string;
  status: "live" | "guided_only";
  notice: string;
  connected: boolean;
  connection_status: string;
  auth_method: AuthMethod;
  username: string | null;
  has_cookie: boolean;
  cookie_preview: string | null;
  profile_url: string | null;
  auto_easy_apply: boolean;
  last_verified_at: string | null;
}

interface PlatformGuideMeta {
  loginUrl: string;
  searchUrl: string;
  cookieDomain: string;
  profilePlaceholder: string;
  cookieName: string;
  steps: string[];
}

interface PlatformFormState {
  auth_method: AuthMethod;
  profile_url: string;
  username: string;
  password: string;
  session_cookie: string;
  auto_easy_apply: boolean;
}

const PLATFORM_GUIDES: Record<string, PlatformGuideMeta> = {
  linkedin: {
    loginUrl: "https://www.linkedin.com/login",
    searchUrl: "https://www.linkedin.com/jobs/search/",
    cookieDomain: "https://www.linkedin.com",
    profilePlaceholder: "https://www.linkedin.com/in/your-handle",
    cookieName: "li_at",
    steps: [
      "Sign in to LinkedIn in your browser.",
      "Either paste your LinkedIn profile URL / email, or copy your `li_at` cookie from DevTools -> Application -> Cookies -> https://www.linkedin.com.",
      "Public job search runs live in-app; final application submission remains candidate-reviewed.",
    ],
  },
  indeed: {
    loginUrl: "https://secure.indeed.com/auth",
    searchUrl: "https://www.indeed.com/jobs",
    cookieDomain: "https://www.indeed.com",
    profilePlaceholder: "https://profile.indeed.com/...",
    cookieName: "SHOE or CTK",
    steps: [
      "Sign in to your Indeed account in Chrome/Firefox.",
      "Link your Indeed account email or profile URL below (or copy your session cookie via F12 -> Application -> Cookies).",
      "Use the Official Search link to browse Indeed listings without triggering anti-bot blocks.",
    ],
  },
  naukri: {
    loginUrl: "https://www.naukri.com/nlogin/login",
    searchUrl: "https://www.naukri.com/",
    cookieDomain: "https://www.naukri.com",
    profilePlaceholder: "https://www.naukri.com/mnjuser/profile",
    cookieName: "nauk_at",
    steps: [
      "Log in to Naukri.com and open your profile page.",
      "Copy your Naukri profile URL or registered email into the form below (or paste your `nauk_at` session cookie).",
      "Open Naukri official search from Live Job Search or this guide to review and apply.",
    ],
  },
  internshala: {
    loginUrl: "https://internshala.com/login/user",
    searchUrl: "https://internshala.com/jobs/",
    cookieDomain: "https://internshala.com",
    profilePlaceholder: "https://internshala.com/student/profile",
    cookieName: "PHPSESSID",
    steps: [
      "Log in to your Internshala candidate account.",
      "Save your Internshala registered email or profile URL (or `PHPSESSID` cookie) to link it with ZOBVERSE AI.",
      "Use the guided search link to browse internships and fresher roles on Internshala.",
    ],
  },
  foundit: {
    loginUrl: "https://www.foundit.in/rio/login",
    searchUrl: "https://www.foundit.in/srp/results",
    cookieDomain: "https://www.foundit.in",
    profilePlaceholder: "https://www.foundit.in/seeker/profile",
    cookieName: "session cookie",
    steps: [
      "Sign in to Foundit (formerly Monster India).",
      "Enter your Foundit account email or profile URL below to link your account.",
      "Use the official Foundit search button to view current openings directly.",
    ],
  },
  glassdoor: {
    loginUrl: "https://www.glassdoor.com/profile/login_input.htm",
    searchUrl: "https://www.glassdoor.com/Job/jobs.htm",
    cookieDomain: "https://www.glassdoor.com",
    profilePlaceholder: "https://www.glassdoor.com/member/profile/index.htm",
    cookieName: "GDSESSION",
    steps: [
      "Sign in to Glassdoor in your browser.",
      "Save your Glassdoor account email or profile link (or `GDSESSION` cookie) below.",
      "Open Glassdoor official search to inspect salaries, company reviews, and apply directly.",
    ],
  },
  wellfound: {
    loginUrl: "https://wellfound.com/login",
    searchUrl: "https://wellfound.com/jobs",
    cookieDomain: "https://wellfound.com",
    profilePlaceholder: "https://wellfound.com/u/your-handle",
    cookieName: "_angellist",
    steps: [
      "Log in to Wellfound (formerly AngelList Talent).",
      "Paste your Wellfound profile URL (e.g. https://wellfound.com/u/...) or login email.",
      "Use the official Wellfound jobs link to apply directly to startup roles.",
    ],
  },
  shine: {
    loginUrl: "https://www.shine.com/myshine/login/",
    searchUrl: "https://www.shine.com/job-search/",
    cookieDomain: "https://www.shine.com",
    profilePlaceholder: "https://www.shine.com/myshine/myprofile/",
    cookieName: "session cookie",
    steps: [
      "Sign in to Shine.com in your browser.",
      "Link your Shine account email or profile URL below.",
      "Open Shine official job search to browse and submit applications directly.",
    ],
  },
  ziprecruiter: {
    loginUrl: "https://www.ziprecruiter.com/authn/login",
    searchUrl: "https://www.ziprecruiter.com/jobs-search",
    cookieDomain: "https://www.ziprecruiter.com",
    profilePlaceholder: "https://www.ziprecruiter.com/candidate/profile",
    cookieName: "zrsess",
    steps: [
      "Log in to your ZipRecruiter candidate account.",
      "Save your ZipRecruiter email or profile URL below to mark the account linked.",
      "Use the official ZipRecruiter search link to view and apply to matching roles.",
    ],
  },
  jobicy: {
    loginUrl: "https://jobicy.com/login",
    searchUrl: "https://jobicy.com/jobs",
    cookieDomain: "https://jobicy.com",
    profilePlaceholder: "https://jobicy.com/profile",
    cookieName: "wordpress_logged_in",
    steps: [
      "Jobicy remote jobs are fetched live via Jobicy's public API with no login required.",
      "Optionally link your Jobicy account email or profile URL if you keep saved alerts there.",
      "Employer applications open on the target company portal for your final review.",
    ],
  },
};

function buildInitialForm(conn: PlatformConnection): PlatformFormState {
  return {
    auth_method: conn.auth_method || "profile_link",
    profile_url: conn.profile_url || "",
    username: "",
    password: "",
    session_cookie: "",
    auto_easy_apply: conn.auto_easy_apply ?? false,
  };
}

export default function PlatformGuidePage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "jobicy"]);
  const [forms, setForms] = useState<Record<string, PlatformFormState>>({});
  const [expandedId, setExpandedId] = useState<string | null>("linkedin");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [togglingDiscoveryId, setTogglingDiscoveryId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cardNotice, setCardNotice] = useState<Record<string, { type: "success" | "error"; text: string }>>({});

  useEffect(() => {
    let active = true;

    async function loadAll() {
      try {
        setLoading(true);
        const [connRes, prefRes] = await Promise.all([
          fetchWithAuth("/settings/platforms/connections"),
          fetchWithAuth("/settings/job-sources/preferences"),
        ]);

        if (!active) return;

        if (!connRes.ok) {
          throw new Error("Could not load platform connection status.");
        }

        const connData: PlatformConnection[] = await connRes.json();
        setConnections(connData);

        const initialForms: Record<string, PlatformFormState> = {};
        for (const item of connData) {
          initialForms[item.id] = buildInitialForm(item);
        }
        setForms(initialForms);

        if (prefRes.ok) {
          const prefData = await prefRes.json();
          if (Array.isArray(prefData.platforms)) {
            setSelectedPlatforms(prefData.platforms);
          }
        }

        if (typeof window !== "undefined") {
          const requestedPlatform = new URLSearchParams(window.location.search).get("platform");
          if (requestedPlatform && connData.some((item) => item.id === requestedPlatform)) {
            setExpandedId(requestedPlatform);
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load platform guide.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAll();
    return () => {
      active = false;
    };
  }, []);

  const updateForm = (platformId: string, patch: Partial<PlatformFormState>) => {
    setForms((prev) => ({
      ...prev,
      [platformId]: {
        ...(prev[platformId] || {
          auth_method: "profile_link",
          profile_url: "",
          username: "",
          password: "",
          session_cookie: "",
          auto_easy_apply: false,
        }),
        ...patch,
      },
    }));
  };

  const handleToggleDiscovery = async (platformId: string) => {
    const next = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter((id) => id !== platformId)
      : [...selectedPlatforms, platformId];

    try {
      setTogglingDiscoveryId(platformId);
      const res = await fetchWithAuth("/settings/job-sources/preferences", {
        method: "PUT",
        body: JSON.stringify({ platforms: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Could not update discovery selection.");
      }
      setSelectedPlatforms(data.platforms);
    } catch (err) {
      setCardNotice((prev) => ({
        ...prev,
        [platformId]: {
          type: "error",
          text: err instanceof Error ? err.message : "Failed to update discovery toggle.",
        },
      }));
    } finally {
      setTogglingDiscoveryId(null);
    }
  };

  const handleConnect = async (platformId: string) => {
    const form = forms[platformId];
    if (!form) return;

    try {
      setSavingId(platformId);
      setCardNotice((prev) => {
        const copy = { ...prev };
        delete copy[platformId];
        return copy;
      });

      const res = await fetchWithAuth(`/settings/platforms/${platformId}/connect`, {
        method: "POST",
        body: JSON.stringify({
          auth_method: form.auth_method,
          profile_url: form.profile_url || undefined,
          username: form.username || undefined,
          password: form.password || undefined,
          session_cookie: form.session_cookie || undefined,
          auto_easy_apply: form.auto_easy_apply,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Could not link platform account.");
      }

      setConnections((prev) => prev.map((item) => (item.id === platformId ? data : item)));
      updateForm(platformId, {
        profile_url: data.profile_url || "",
        password: "",
        session_cookie: "",
      });
      setCardNotice((prev) => ({
        ...prev,
        [platformId]: {
          type: "success",
          text: `✓ ${data.name} account linked successfully.`,
        },
      }));
    } catch (err) {
      setCardNotice((prev) => ({
        ...prev,
        [platformId]: {
          type: "error",
          text: err instanceof Error ? err.message : "Failed to link account.",
        },
      }));
    } finally {
      setSavingId(null);
    }
  };

  const handleTest = async (platformId: string) => {
    try {
      setTestingId(platformId);
      const res = await fetchWithAuth(`/settings/platforms/${platformId}/test`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Verification failed.");
      }
      setConnections((prev) =>
        prev.map((item) =>
          item.id === platformId
            ? { ...item, last_verified_at: data.last_verified_at, connected: true }
            : item,
        ),
      );
      setCardNotice((prev) => ({
        ...prev,
        [platformId]: {
          type: "success",
          text: `✓ ${data.message}`,
        },
      }));
    } catch (err) {
      setCardNotice((prev) => ({
        ...prev,
        [platformId]: {
          type: "error",
          text: err instanceof Error ? err.message : "Verification failed.",
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      setDisconnectingId(platformId);
      const res = await fetchWithAuth(`/settings/platforms/${platformId}/disconnect`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Could not disconnect account.");
      }
      setConnections((prev) => prev.map((item) => (item.id === platformId ? data : item)));
      updateForm(platformId, {
        profile_url: "",
        username: "",
        password: "",
        session_cookie: "",
      });
      setCardNotice((prev) => ({
        ...prev,
        [platformId]: {
          type: "success",
          text: `${data.name} account disconnected.`,
        },
      }));
    } catch (err) {
      setCardNotice((prev) => ({
        ...prev,
        [platformId]: {
          type: "error",
          text: err instanceof Error ? err.message : "Failed to disconnect.",
        },
      }));
    } finally {
      setDisconnectingId(null);
    }
  };

  const linkedCount = connections.filter((c) => c.connected).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Platform Connection Guide &amp; Accounts
            </h1>
            <Badge variant="primary" size="sm">
              {linkedCount} / {connections.length || 10} Linked
            </Badge>
            <Badge variant="success" size="sm">
              {selectedPlatforms.length} Enabled in Search
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Step-by-step setup to link your candidate accounts across all 10 supported job platforms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/search">
            <Button variant="primary" size="sm" leftIcon={<Compass className="w-4 h-4" />}>
              Open Live Job Search
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3-Step Overview Guide */}
      <Card className="glass-card border border-blue-100 bg-gradient-to-br from-white via-slate-50/60 to-blue-50/30">
        <CardHeader>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>How Multi-Platform Account Linking Works</span>
            </CardTitle>
            <CardDescription>
              Zero anti-bot evasion, zero CAPTCHA bypass, and full candidate control over every board.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>1. Link Your Account</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Save your official profile URL, account email, or active browser session cookie per platform so your candidate connections stay organized in one place.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>2. Choose Live vs Guided</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>LinkedIn</strong> and <strong>Jobicy</strong> run live in-app searches. The other 8 boards open directly on their official search pages without scraping.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>3. Review Before Submit</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Prepared applications stay in <code>READY</code> status in your Review Queue. You submit on the official site and confirm in the tracker.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick-Jump Status Strip for All 10 Platforms */}
      {!loading && connections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {connections.map((conn) => (
            <button
              key={conn.id}
              type="button"
              onClick={() => {
                setExpandedId(conn.id);
                document
                  .getElementById(`platform-card-${conn.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                conn.connected
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300"
                  : expandedId === conn.id
                    ? "bg-blue-50 text-blue-800 border-blue-300"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  conn.connected ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <span>{conn.name}</span>
              <span className="text-[10px] opacity-75">
                {conn.connected ? "Linked" : "Link"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Platform Cards */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading platform connection guide...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((conn, index) => {
            const guide = PLATFORM_GUIDES[conn.id];
            const form = forms[conn.id] || buildInitialForm(conn);
            const isExpanded = expandedId === conn.id;
            const isDiscoveryEnabled = selectedPlatforms.includes(conn.id);
            const notice = cardNotice[conn.id];

            return (
              <Card key={conn.id} id={`platform-card-${conn.id}`} className="glass-card">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{index + 1}
                      </span>
                      <h2 className="text-base font-extrabold text-slate-900">
                        {conn.name}
                      </h2>
                      <Badge
                        variant={conn.status === "live" ? "success" : "warning"}
                        size="sm"
                      >
                        {conn.status === "live" ? "Live Search" : "Guided Official-Site"}
                      </Badge>
                      <Badge
                        variant={conn.connected ? "primary" : "secondary"}
                        size="sm"
                        dot={conn.connected}
                      >
                        {conn.connected ? "Account Linked" : "Not Linked"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{conn.notice}</p>
                    {conn.connected && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-700 font-semibold pt-0.5">
                        <span>Method: {conn.auth_method.replace("_", " ")}</span>
                        {conn.username && <span>Account: {conn.username}</span>}
                        {conn.profile_url && (
                          <a
                            href={conn.profile_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline inline-flex items-center gap-1"
                          >
                            <span>Saved Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {conn.has_cookie && (
                          <span>Cookie: {conn.cookie_preview || "Configured"}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {guide && (
                      <>
                        <a
                          href={guide.loginUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5"
                        >
                          <span>Official Login</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={guide.searchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-700 inline-flex items-center gap-1.5"
                        >
                          <span>Search Jobs</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}

                    <Button
                      variant={isDiscoveryEnabled ? "secondary" : "outline"}
                      size="sm"
                      loading={togglingDiscoveryId === conn.id}
                      onClick={() => void handleToggleDiscovery(conn.id)}
                    >
                      {isDiscoveryEnabled ? "✓ In Discovery" : "Add to Discovery"}
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Link2 className="w-3.5 h-3.5" />}
                      onClick={() => setExpandedId(isExpanded ? null : conn.id)}
                    >
                      {isExpanded
                        ? "Hide Setup"
                        : conn.connected
                          ? "Manage Link"
                          : "Link Account"}
                    </Button>
                  </div>
                </div>

                {notice && (
                  <div
                    className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      notice.type === "success"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-rose-50 text-rose-900 border border-rose-200"
                    }`}
                  >
                    <span>{notice.text}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCardNotice((prev) => {
                          const copy = { ...prev };
                          delete copy[conn.id];
                          return copy;
                        })
                      }
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Step-by-step guide */}
                    <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>{conn.name} Setup Guide</span>
                      </div>
                      <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                        {(guide?.steps || []).map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                      {guide && (
                        <p className="text-[11px] text-slate-500 pt-1">
                          Browser cookie reference: <code>{guide.cookieName}</code>
                        </p>
                      )}
                    </div>

                    {/* Right: Account linking form */}
                    <div className="lg:col-span-7 space-y-4 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">
                          Connection Method
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => updateForm(conn.id, { auth_method: "profile_link" })}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              form.auth_method === "profile_link"
                                ? "border-blue-500 bg-blue-50/60 text-blue-900"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <div className="font-bold flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Profile Link</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Profile URL or email
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateForm(conn.id, { auth_method: "session_cookie" })}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              form.auth_method === "session_cookie"
                                ? "border-blue-500 bg-blue-50/60 text-blue-900"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <div className="font-bold flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Session Cookie</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Active browser token
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateForm(conn.id, { auth_method: "credentials" })}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              form.auth_method === "credentials"
                                ? "border-blue-500 bg-blue-50/60 text-blue-900"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <div className="font-bold flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Credentials</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Email &amp; password
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            {conn.name} Profile URL
                          </label>
                          <input
                            type="url"
                            value={form.profile_url}
                            onChange={(e) =>
                              updateForm(conn.id, { profile_url: e.target.value })
                            }
                            placeholder={guide?.profilePlaceholder || "https://..."}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Account Email / Username
                          </label>
                          <input
                            type="text"
                            value={form.username}
                            onChange={(e) =>
                              updateForm(conn.id, { username: e.target.value })
                            }
                            placeholder={conn.username || "you@example.com"}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {form.auth_method === "session_cookie" && (
                        <div className="space-y-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">
                              Session Cookie ({guide?.cookieName || "cookie"})
                            </label>
                            <input
                              type="password"
                              value={form.session_cookie}
                              onChange={(e) =>
                                updateForm(conn.id, { session_cookie: e.target.value })
                              }
                              placeholder={
                                conn.has_cookie
                                  ? `Saved (${conn.cookie_preview}) — paste new value to replace`
                                  : "Paste browser session cookie value"
                              }
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          {guide && (
                            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1 text-[11px] text-blue-950">
                              <div className="font-bold text-blue-900">
                                How to copy your {conn.name} cookie in 15 seconds:
                              </div>
                              <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                                <li>
                                  Open{" "}
                                  <a
                                    href={guide.loginUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline font-semibold"
                                  >
                                    {conn.name}
                                  </a>{" "}
                                  in Chrome where you are signed in.
                                </li>
                                <li>
                                  Press <strong>F12</strong> (or Right-Click → <em>Inspect</em>) and open the <strong>Application</strong> tab.
                                </li>
                                <li>
                                  Expand <strong>Cookies</strong> → click <code>{guide.cookieDomain}</code>.
                                </li>
                                <li>
                                  Find <code>{guide.cookieName}</code>, copy its <strong>Value</strong>, and paste it above.
                                </li>
                              </ol>
                            </div>
                          )}
                        </div>
                      )}

                      {form.auth_method === "credentials" && (
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Account Password
                          </label>
                          <input
                            type="password"
                            value={form.password}
                            onChange={(e) =>
                              updateForm(conn.id, { password: e.target.value })
                            }
                            placeholder="Enter account password"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          {conn.connected && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                loading={testingId === conn.id}
                                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                onClick={() => void handleTest(conn.id)}
                              >
                                Verify Link
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:bg-rose-50"
                                loading={disconnectingId === conn.id}
                                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                                onClick={() => void handleDisconnect(conn.id)}
                              >
                                Disconnect
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          loading={savingId === conn.id}
                          leftIcon={<Link2 className="w-3.5 h-3.5" />}
                          onClick={() => void handleConnect(conn.id)}
                        >
                          {conn.connected ? `Update ${conn.name} Link` : `Link ${conn.name} Account`}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
