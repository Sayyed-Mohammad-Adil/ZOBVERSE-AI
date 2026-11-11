"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  Cpu,
  Server,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Lock,
  Link2,
  Key,
  Eye,
  EyeOff,
  ShieldAlert,
  Info,
  Check,
  Copy,
} from "lucide-react";

export default function SettingsPage() {
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [testingOllama, setTestingOllama] = useState(false);
  const [testingLaya, setTestingLaya] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<"checking" | "connected" | "offline" | "model_missing">("checking");

  // LinkedIn Integration State
  const [userId, setUserId] = useState<number | null>(null);
  const [linkedin, setLinkedin] = useState<any>(null);
  const [authMethod, setAuthMethod] = useState<"session_cookie" | "credentials">("session_cookie");
  const [sessionCookie, setSessionCookie] = useState("");
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [linkedinPassword, setLinkedinPassword] = useState("");
  const [autoEasyApply, setAutoEasyApply] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const [copiedCookie, setCopiedCookie] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [savingLinkedin, setSavingLinkedin] = useState(false);
  const [testingLinkedin, setTestingLinkedin] = useState(false);
  const [disconnectingLinkedin, setDisconnectingLinkedin] = useState(false);
  const [linkedinMsg, setLinkedinMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const meRes = await fetchWithAuth("/auth/me");
      if (meRes.ok) {
        const me = await meRes.json();
        setUserId(me.id);
        await loadLinkedinSettings(me.id);
      }

      const aiRes = await fetchWithAuth("/settings/ai");
      if (aiRes.ok) {
        setAiConfig(await aiRes.json());
        const statusRes = await fetchWithAuth("/settings/ai/test-ollama", { method: "POST" });
        const statusData = await statusRes.json();
        setOllamaStatus(
          statusData.status === "connected"
            ? "connected"
            : statusData.status === "model_missing"
              ? "model_missing"
              : "offline",
        );
      }

      const sourcesRes = await fetchWithAuth("/settings/job-sources");
      if (sourcesRes.ok) setSources(await sourcesRes.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function loadLinkedinSettings(uid: number) {
    try {
      const res = await fetchWithAuth(`/settings/linkedin/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setLinkedin(data);
        if (data.auth_method) setAuthMethod(data.auth_method);
        setAutoEasyApply(data.auto_easy_apply ?? true);
        if (data.username && !data.username.includes("***")) {
          setLinkedinUsername(data.username);
        }
        if (data.session_cookie) {
          setSessionCookie(data.session_cookie);
        }
      }
    } catch (e) {
      console.error("Error loading LinkedIn settings:", e);
    }
  }

  const handleSaveLinkedin = async () => {
    if (!userId) return;
    try {
      setSavingLinkedin(true);
      setLinkedinMsg(null);

      const res = await fetchWithAuth(`/settings/linkedin/${userId}`, {
        method: "POST",
        body: JSON.stringify({
          auth_method: authMethod,
          username: linkedinUsername || undefined,
          password: linkedinPassword || undefined,
          session_cookie: sessionCookie || undefined,
          auto_easy_apply: autoEasyApply,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLinkedin(data);
        setLinkedinMsg({ type: "success", text: "✓ LinkedIn account credentials securely updated!" });
        if (data.session_cookie) {
          setSessionCookie(data.session_cookie);
        }
        setLinkedinPassword("");
      } else {
        setLinkedinMsg({ type: "error", text: data.detail || "Failed to update LinkedIn settings." });
      }
    } catch (err: any) {
      setLinkedinMsg({ type: "error", text: err.message || "Network error updating LinkedIn." });
    } finally {
      setSavingLinkedin(false);
    }
  };

  const handleTestLinkedin = async () => {
    if (!userId) return;
    try {
      setTestingLinkedin(true);
      setLinkedinMsg(null);
      const res = await fetchWithAuth(`/settings/linkedin/test/${userId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLinkedinMsg({ type: "success", text: `✓ ${data.message}` });
        loadLinkedinSettings(userId);
      } else {
        setLinkedinMsg({ type: "error", text: data.detail || "Validation check failed." });
      }
    } catch (err: any) {
      setLinkedinMsg({ type: "error", text: err.message || "Failed to test connection." });
    } finally {
      setTestingLinkedin(false);
    }
  };

  const handleDisconnectLinkedin = async () => {
    if (!userId) return;
    try {
      setDisconnectingLinkedin(true);
      setLinkedinMsg(null);
      const res = await fetchWithAuth(`/settings/linkedin/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setLinkedin({ connected: false, status: "DISCONNECTED", has_cookie: false, username: null });
        setLinkedinMsg({ type: "success", text: "LinkedIn account disconnected." });
      }
    } catch (err: any) {
      setLinkedinMsg({ type: "error", text: err.message || "Failed to disconnect." });
    } finally {
      setDisconnectingLinkedin(false);
    }
  };

  const handleTestOllama = async () => {
    setTestingOllama(true);
    setTestResult(null);
    try {
      const res = await fetchWithAuth("/settings/ai/test-ollama", { method: "POST" });
      const data = await res.json();
      setOllamaStatus(
        data.status === "connected"
          ? "connected"
          : data.status === "model_missing"
            ? "model_missing"
            : "offline",
      );
      if (data.status === "connected") {
        setTestResult(`✓ Ollama and configured model ${data.configured_model} are available.`);
      } else if (data.status === "model_missing") {
        setTestResult(`✗ ${data.message} Installed models: ${data.models?.join(", ") || "None"}`);
      } else {
        setTestResult(`✗ Ollama Offline: ${data.message}`);
      }
    } catch (err: any) {
      setOllamaStatus("offline");
      setTestResult(`✗ Test error: ${err.message}`);
    } finally {
      setTestingOllama(false);
    }
  };

  const handleTestLaya = async () => {
    setTestingLaya(true);
    setTestResult(null);
    try {
      const res = await fetchWithAuth("/settings/ai/test-laya", { method: "POST" });
      const data = await res.json();
      if (data.status === "rule_based") {
        setTestResult(`✓ ${data.message}`);
      } else {
        setTestResult(`✗ Laya Error: ${data.message}`);
      }
    } catch (err: any) {
      setTestResult(`✗ Test error: ${err.message}`);
    } finally {
      setTestingLaya(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();
      const res = await fetchWithAuth(`/settings/privacy/export/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `candidate_data_${me.id}.json`;
        a.click();
      }
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setExportingData(false);
    }
  };

  const handleClearHistory = async () => {
    if (
      !confirm(
        "Are you sure you want to clear your application history? This cannot be undone."
      )
    )
      return;
    try {
      setClearingHistory(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();
      const res = await fetchWithAuth(`/settings/privacy/applications/${me.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Application history cleared.");
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              AI Engines &amp; System Configuration
            </h1>
            <Badge
              variant={ollamaStatus === "connected" ? "success" : "warning"}
              size="sm"
              dot
              pulse={ollamaStatus === "checking"}
            >
              {ollamaStatus === "checking"
                ? "Checking Ollama"
                : ollamaStatus === "connected"
                  ? `Ollama Connected • ${aiConfig?.default_llm_model}`
                  : ollamaStatus === "model_missing"
                    ? "Configured model missing"
                    : "Ollama Offline"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Local AI inference telemetry, configured job portals, and candidate data privacy guardrails
          </p>
        </div>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            testResult.startsWith("✓")
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-amber-50 text-amber-900 border border-amber-200"
          }`}
        >
          <span>{testResult}</span>
          <button onClick={() => setTestResult(null)}>
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* AI Inference Architecture */}
      <Card className="glass-card">
        <CardHeader>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>AI Decision &amp; Extraction Architecture</span>
            </CardTitle>
            <CardDescription>
              Local LLM endpoints powered by Ollama and Laya structured extraction
            </CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Ollama Service Daemon
              </span>
              <span className="font-mono text-slate-800 font-semibold">
                {aiConfig?.ollama_url || "http://localhost:11434"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Generative Reasoning Model
              </span>
              <span className="font-mono text-slate-800 font-semibold">
                {aiConfig?.default_llm_model || "llama3"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Dense Vector Embedding
              </span>
              <span className="font-mono text-slate-800 font-semibold">
                {aiConfig?.default_embedding_model || "nomic-embed-text"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Laya Deterministic Engine
              </span>
              <span className="font-semibold text-emerald-700">
                Rule-based classifiers (not a connected LLM)
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestOllama}
              loading={testingOllama}
              leftIcon={<Server className="w-3.5 h-3.5" />}
            >
              Test Ollama
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestLaya}
              loading={testingLaya}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Test Laya Decision Layer
            </Button>
          </div>
        </div>
      </Card>

      {/* Configured Sources */}
      <Card className="glass-card">
        <CardHeader>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Multi-Source Ingestion Connectors</span>
            </CardTitle>
            <CardDescription>
              Live feeds and guided official-site workflows. CAPTCHA and access controls are never bypassed.
            </CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-3 pt-1">
          {sources.map((source) => (
            <div
              key={source.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {source.name}
                  </h4>
                  <Badge
                    variant={source.status === "live" ? "success" : "warning"}
                    size="sm"
                  >
                    {source.status === "live" ? "Live search" : "Guided only"}
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap text-[11px] pt-1">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {source.capabilities?.search ? "Live discovery" : "Official-site search"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    Application preparation
                  </span>
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                    Candidate submits on platform
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-2xl">{source.notice}</p>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 self-start sm:self-center">
                {source.status === "live" ? "Search enabled" : "Partner access required"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* LinkedIn Account Connection & Application Guardrails */}
      <Card className="glass-card" id="linkedin">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-600" />
                <span>LinkedIn Integration &amp; Session Status</span>
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn profile session or credentials for direct autonomous Easy Apply and live status monitoring
              </CardDescription>
            </div>
            <div>
              {linkedin?.connected ? (
                <Badge variant="success" size="md" dot pulse>
                  LINKEDIN CONNECTED
                </Badge>
              ) : (
                <Badge variant="warning" size="md" dot>
                  NOT CONNECTED
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <div className="space-y-5 pt-1 text-xs">
          {linkedinMsg && (
            <div
              className={`p-3.5 rounded-xl font-semibold flex items-center justify-between shadow-xs ${
                linkedinMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-rose-50 text-rose-900 border border-rose-200"
              }`}
            >
              <span>{linkedinMsg.text}</span>
              <button onClick={() => setLinkedinMsg(null)}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          {/* Current Connection Status Pill */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Account Status:</span>
                <span className={linkedin?.connected ? "text-emerald-700 font-extrabold" : "text-amber-700"}>
                  {linkedin?.connected ? "Active & Authenticated" : "Not Configured (Using Assisted Mode)"}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {linkedin?.connected
                  ? `Connection verified via ${
                      linkedin?.auth_method === "session_cookie"
                        ? `Session Cookie (li_at: ${linkedin?.cookie_preview || "Configured"})`
                        : `Credentials (${linkedin?.username || "Account"})`
                    } • applications remain review-only`
                  : "Connect your LinkedIn session for account status checks. This build does not submit applications."}
              </p>
            </div>

            {linkedin?.connected && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestLinkedin}
                  loading={testingLinkedin}
                  className="text-xs"
                >
                  Test Session
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDisconnectLinkedin}
                  loading={disconnectingLinkedin}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          {/* Method Selection Tabs */}
          <div className="space-y-3">
            <label className="font-bold text-slate-800 text-xs block">
              Authentication Method:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Method 1: Session Cookie (Recommended) */}
              <button
                type="button"
                onClick={() => setAuthMethod("session_cookie")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  authMethod === "session_cookie"
                    ? "border-blue-500 bg-blue-50/50 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span>Session Cookie (li_at)</span>
                  </div>
                  <Badge variant="success" size="sm">
                    RECOMMENDED
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  100% Anti-Ban. Uses your browser&apos;s active session directly. Zero CAPTCHA or OTP checkpoints.
                </p>
              </button>

              {/* Method 2: Username & Password */}
              <button
                type="button"
                onClick={() => setAuthMethod("credentials")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  authMethod === "credentials"
                    ? "border-blue-500 bg-blue-50/50 shadow-xs"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Username &amp; Password</span>
                  </div>
                  <Badge variant="primary" size="sm">
                    PLAYWRIGHT
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Direct login via headless browser. If LinkedIn triggers OTP verification, agent will alert console.
                </p>
              </button>
            </div>
          </div>

          {/* Form Inputs based on selected method */}
          {authMethod === "session_cookie" ? (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn <code className="text-blue-600 font-mono">li_at</code> Session Cookie Value:</span>
                  </label>
                  {sessionCookie && (
                    <button
                      type="button"
                      onClick={() => setShowCookie(!showCookie)}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition-colors"
                    >
                      {showCookie ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showCookie ? "Mask Cookie" : "Reveal Cookie"}</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showCookie ? "text" : "password"}
                    placeholder={linkedin?.has_cookie ? "••••••••••••••••••••••••••••• (Active cookie saved, paste to replace)" : "Paste li_at cookie here (e.g. AQEDAR...4fQ)"}
                    value={sessionCookie}
                    onChange={(e) => setSessionCookie(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 pr-24"
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    {sessionCookie && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(sessionCookie);
                            setCopiedCookie(true);
                            setTimeout(() => setCopiedCookie(false), 2000);
                          }}
                          title="Copy cookie to clipboard"
                          className="px-2 py-1 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          {copiedCookie ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCookie ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCookie(!showCookie)}
                          title={showCookie ? "Hide cookie" : "Show cookie"}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          {showCookie ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Cookie Display Card */}
              {(linkedin?.has_cookie || sessionCookie) && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-950 text-xs">Active Stored Session Cookie:</span>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      {linkedin?.connected ? "ACTIVE & AUTHENTICATED" : "STORED IN SYSTEM"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white/90 p-2.5 rounded-xl border border-emerald-200 font-mono text-[11px] text-slate-800 shadow-2xs">
                    <span className="truncate max-w-[450px] select-all font-semibold text-slate-800">
                      {showCookie
                        ? (sessionCookie || linkedin?.session_cookie || linkedin?.cookie_preview || "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••")
                        : (sessionCookie
                            ? `${sessionCookie.slice(0, 12)}••••••••••••${sessionCookie.slice(-8)}`
                            : (linkedin?.session_cookie
                                ? `${linkedin.session_cookie.slice(0, 12)}••••••••••••${linkedin.session_cookie.slice(-8)}`
                                : (linkedin?.cookie_preview || "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••")))}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCookie(!showCookie)}
                        className="p-1 rounded hover:bg-emerald-100 text-emerald-700"
                        title={showCookie ? "Mask cookie" : "Reveal full cookie"}
                      >
                        {showCookie ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const val = sessionCookie || linkedin?.session_cookie;
                          if (val) {
                            navigator.clipboard.writeText(val);
                            setCopiedCookie(true);
                            setTimeout(() => setCopiedCookie(false), 2000);
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-100/90 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        {copiedCookie ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-emerald-700" />}
                        <span>{copiedCookie ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-800 leading-tight">
                    ✓ The session is stored for connection checks. Current application cycles prepare items for candidate review and do not submit applications.
                  </p>
                </div>
              )}

              {/* Instructions Box */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1.5 text-[11px] text-blue-950">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>How to find your `li_at` cookie in 15 seconds:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-0.5 text-slate-700">
                  <li>Open <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">LinkedIn.com</a> in Chrome where you are logged in.</li>
                  <li>Press <strong>F12</strong> (or Right-Click → <em>Inspect</em>) and click the <strong>Application</strong> tab at the top.</li>
                  <li>In the left sidebar, expand <strong>Cookies</strong> → click <code>https://www.linkedin.com</code>.</li>
                  <li>Find the row named <code>li_at</code>, double click its <strong>Value</strong>, and copy &amp; paste it above.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
              <div>
                <label className="font-bold text-slate-800 text-xs block mb-1">
                  LinkedIn Email or Phone:
                </label>
                <input
                  type="text"
                  placeholder="e.g. your.email@gmail.com"
                  value={linkedinUsername}
                  onChange={(e) => setLinkedinUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 text-xs block mb-1">
                  LinkedIn Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your LinkedIn password"
                    value={linkedinPassword}
                    onChange={(e) => setLinkedinPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Bot Safety Note:</strong> Plain password logins from cloud servers may trigger LinkedIn 2FA / OTP challenges. The agent will pause and output an action notification on your console if a challenge occurs.
                </span>
              </div>
            </div>
          )}

          {/* Easy-Apply Auto Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="font-bold text-slate-900">LinkedIn Application Preparation</div>
              <p className="text-slate-500 text-[11px]">
                This preference is retained, but this build does not submit applications to LinkedIn. Prepared applications remain in your review queue until you submit them on the official platform.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoEasyApply}
              onChange={(e) => setAutoEasyApply(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleSaveLinkedin}
              loading={savingLinkedin}
              size="md"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6"
            >
              {linkedin?.connected ? "Update LinkedIn Settings" : "Save & Connect LinkedIn Account"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Privacy & Anti-Fabrication Hardening */}
      <Card className="glass-card">
        <CardHeader>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-700" />
              <span>Privacy &amp; Data Sovereignty</span>
            </CardTitle>
            <CardDescription>
              Export all stored candidate records or wipe application history at any time
            </CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-4 pt-1 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="font-bold text-slate-900">Strict Non-Negotiable Rule 2</div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Zero candidate fabrication, pause on anti-bot/CAPTCHA, zero duplicate applications.
              </p>
            </div>
            <Badge variant="success" size="sm" dot>
              100% ENFORCED
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              loading={exportingData}
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-500" />}
            >
              Export Candidate Archive (JSON)
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
              onClick={handleClearHistory}
              loading={clearingHistory}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            >
              Clear Application History
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
