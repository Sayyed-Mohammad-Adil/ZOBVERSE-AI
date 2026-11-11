"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { fetchWithAuth, API_URL } from "@/lib/api";
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Bot,
  Compass,
  ArrowDown,
  Layers,
  ShieldCheck,
  Sparkles,
  Link2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface LogEntry {
  id: string;
  timestamp: string;
  time_str: string;
  level: "INFO" | "DISCOVERY" | "MATCHING" | "AUTO_APPLY" | "SUCCESS" | "WARN" | "ERROR" | string;
  stage: "DAEMON" | "SCRAPER" | "MATCHER" | "AUTO_APPLY" | "AUDIT" | string;
  message: string;
  details?: Record<string, unknown>;
}

interface AgentConsoleProps {
  compact?: boolean;
  maxHeight?: string;
  onCycleComplete?: () => void;
}

export default function AgentConsole({
  compact = false,
  maxHeight = "560px",
  onCycleComplete,
}: AgentConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [linkedinConnected, setLinkedinConnected] = useState<boolean>(false);
  const [maxApply, setMaxApply] = useState<number>(5);
  const [minScore, setMinScore] = useState<number>(40);
  const [applySummary, setApplySummary] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onCycleCompleteRef = useRef(onCycleComplete);

  useEffect(() => {
    onCycleCompleteRef.current = onCycleComplete;
  }, [onCycleComplete]);

  // Setup Server-Sent Events listener
  const setupEventSource = useCallback((uid: number) => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const streamUrl = `${API_URL}/workers/stream/${uid}`;
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
      };

      es.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(":")) return;
          const newLog: LogEntry = JSON.parse(event.data);
          setCurrentProgress(`${newLog.stage} · ${newLog.message}`);
          setLogs((prev) => {
            if (prev.some((log) => log.id === newLog.id)) return prev;
            return [...prev, newLog];
          });

          if (
            (newLog.stage === "DAEMON" &&
              ((newLog.level === "SUCCESS" || newLog.level === "WARN") &&
                /complete/i.test(newLog.message))) ||
            (newLog.level === "ERROR" && newLog.stage === "DAEMON")
          ) {
            setIsApplying(false);
            onCycleCompleteRef.current?.();
          }
        } catch {
          // Ignore malformed stream messages.
        }
      };

      es.onerror = () => {
        setConnected(false);
      };
    } catch (err) {
      console.error("SSE connection setup failed:", err);
      setConnected(false);
    }
  }, []);

  // Load User & Initial Logs
  useEffect(() => {
    let isMounted = true;

    async function initUserAndLogs() {
      try {
        const meRes = await fetchWithAuth("/auth/me");
        if (!meRes.ok) return;
        const me = await meRes.json();
        if (!isMounted) return;
        setUserId(me.id);

        // Fetch LinkedIn status
        fetchWithAuth(`/settings/linkedin/${me.id}`)
          .then((r) => r.json())
          .then((d) => {
            if (isMounted && d?.connected) setLinkedinConnected(true);
          })
          .catch(() => {});

        // Fetch buffered logs
        const logRes = await fetchWithAuth(`/workers/logs/${me.id}?limit=120`);
        if (logRes.ok) {
          const data = await logRes.json();
          if (isMounted && Array.isArray(data.logs)) {
            setLogs(data.logs);
          }
        }

        // Establish SSE stream
        setupEventSource(me.id);
      } catch (err) {
        console.error("Agent Console initialization error:", err);
      }
    }

    initUserAndLogs();

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [setupEventSource]);

  // Scroll to bottom of terminal container only (preventing page-level jumps)
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Trigger Auto Apply Cycle
  const handleRunAutoApply = async () => {
    if (!userId || isApplying) return;
    try {
      setIsApplying(true);
      setApplySummary(null);
      setCurrentProgress("DAEMON · Starting the CV-based job fit and application review cycle.");

      // Append local optimistic log
      const optimId = `local_${Date.now()}`;
      setLogs((prev) => [
        ...prev,
        {
          id: optimId,
          timestamp: new Date().toISOString(),
          time_str: new Date().toLocaleTimeString(),
          level: "INFO",
          stage: "DAEMON",
          message: `⚡ Triggering Autonomous Cycle for Candidate #${userId} (Max: ${maxApply}, Min Match: ${minScore}%)...`,
        },
      ]);

      const res = await fetchWithAuth(
        `/workers/auto-apply/${userId}?max_apply=${maxApply}&min_score=${minScore}`,
        { method: "POST" }
      );

      if (res.ok) {
        setApplySummary("Cycle running in background. Live output streaming below.");
      } else {
        setIsApplying(false);
        const err = await res.json().catch(() => ({}));
        setApplySummary(`Launch failed: ${err.detail || "Server error"}`);
      }
    } catch (err) {
      setIsApplying(false);
      setApplySummary("Connection error initiating auto-apply cycle.");
    }
  };

  // Trigger Scan
  const handleRunScan = async () => {
    if (!userId || isScanning) return;
    try {
      setIsScanning(true);
      const res = await fetchWithAuth(`/workers/scan?user_id=${userId}`, { method: "POST" });
      if (res.ok) {
        setTimeout(() => setIsScanning(false), 2000);
      } else {
        setIsScanning(false);
      }
    } catch {
      setIsScanning(false);
    }
  };

  // Clear Console
  const handleClear = async () => {
    if (!userId || isClearing) return;
    try {
      setIsClearing(true);
      await fetchWithAuth(`/workers/clear-logs/${userId}`, { method: "POST" });
      setLogs([]);
    } catch {
      setLogs([]);
    } finally {
      setIsClearing(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== "ALL") {
      if (filterLevel === "AUTO_APPLY" && log.stage !== "AUTO_APPLY" && log.level !== "AUTO_APPLY") return false;
      if (filterLevel === "MATCHER" && log.stage !== "MATCHER" && log.level !== "MATCHING") return false;
      if (filterLevel === "SCRAPER" && log.stage !== "SCRAPER" && log.level !== "DISCOVERY") return false;
      if (filterLevel === "SUCCESS" && log.level !== "SUCCESS") return false;
      if (filterLevel === "WARN" && log.level !== "WARN" && log.level !== "ERROR") return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchStage = log.stage.toLowerCase().includes(q);
      return matchMsg || matchStage;
    }
    return true;
  });

  const getLevelStyle = (level: string) => {
    switch (level) {
      case "SUCCESS":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-800/60";
      case "AUTO_APPLY":
        return "text-amber-300 bg-amber-950/40 border-amber-800/60";
      case "MATCHING":
        return "text-indigo-300 bg-indigo-950/40 border-indigo-800/60";
      case "DISCOVERY":
        return "text-purple-300 bg-purple-950/40 border-purple-800/60";
      case "WARN":
        return "text-orange-400 bg-orange-950/40 border-orange-800/60";
      case "ERROR":
        return "text-rose-400 bg-rose-950/40 border-rose-800/60 font-semibold";
      default:
        return "text-cyan-300 bg-cyan-950/40 border-cyan-800/60";
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "AUTO_APPLY":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "MATCHER":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "SCRAPER":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "AUDIT":
        return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-600/40";
    }
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden font-sans">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Window controls & terminal ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-sm shadow-rose-500/40" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-sm shadow-amber-500/40" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-sm shadow-emerald-500/40" />
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-semibold text-slate-200">
              agent://autojob-daemon/candidate-{userId || "init"}
            </span>
          </div>
        </div>

        {/* Center: Live status badge */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {connected ? "LIVE TELEMETRY STREAM" : "OFFLINE / RECONNECTING"}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {logs.length} events
          </span>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Disable Auto-scroll" : "Enable Auto-scroll"}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors flex items-center gap-1 ${
              autoScroll
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>Scroll {autoScroll ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={handleClear}
            disabled={isClearing}
            title="Clear Console"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-transparent hover:border-slate-700 disabled:opacity-50"
          >
            {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Action Controller Strip */}
      <div className="p-3.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Auto-Apply execution triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={handleRunAutoApply}
            loading={isApplying}
            leftIcon={<Zap className="w-3.5 h-3.5 text-amber-300" />}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-blue-600/30 border border-blue-400/40 text-xs px-4"
          >
            {isApplying ? "Executing Auto-Apply Cycle..." : "Run Auto-Apply Cycle Now"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunScan}
            loading={isScanning}
            leftIcon={<Compass className="w-3.5 h-3.5 text-purple-400" />}
            className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs"
          >
            {isScanning ? "Scanning Web..." : "Scan Postings"}
          </Button>

          <a
            href="/dashboard/settings#linkedin"
            title="Configure LinkedIn Easy-Apply Account & Session Cookie"
            className="border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-400" />
            <span>LinkedIn {linkedinConnected ? "✓ Active" : "Connect"}</span>
          </a>

          {/* Configuration dropdowns */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-slate-800">
            <span>Apply limit:</span>
            <select
              value={maxApply}
              onChange={(e) => setMaxApply(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value={3}>3 jobs</option>
              <option value={5}>5 jobs</option>
              <option value={10}>10 jobs</option>
              <option value={15}>15 jobs</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Min score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value={30}>&gt;= 30%</option>
              <option value={40}>&gt;= 40%</option>
              <option value={50}>&gt;= 50%</option>
              <option value={70}>&gt;= 70%</option>
            </select>
          </div>
        </div>

        {/* Right: Filter tabs & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search filter */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-44 pl-7 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Level filter tabs */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            {["ALL", "AUTO_APPLY", "MATCHER", "SCRAPER", "WARN"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterLevel === lvl
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lvl === "ALL" ? "All" : lvl.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal Output Screen */}
      {isApplying && currentProgress && (
        <div className="px-4 py-3 bg-blue-950/50 border-b border-blue-900/70 text-xs text-blue-200">
          <span className="font-bold text-blue-100">CURRENT STEP</span>
          <span className="mx-2 text-blue-500">|</span>
          <span>{currentProgress}</span>
        </div>
      )}
      <div
        ref={terminalRef}
        style={{ maxHeight }}
        className="p-4 overflow-y-auto space-y-1.5 bg-slate-950 font-mono text-xs select-text leading-relaxed tracking-wide min-h-[280px]"
      >
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Bot className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
            <p className="font-mono text-xs">No console logs match filter. Ready for telemetry.</p>
            <p className="text-[11px] text-slate-600">
              Click &quot;Run Auto-Apply Cycle Now&quot; above to watch CV-fit checks, job details, and application preparation.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2.5 hover:bg-slate-900/60 p-1 rounded transition-colors group"
            >
              {/* Timestamp */}
              <span className="text-slate-400 select-none text-[11px] shrink-0 font-medium">
                {log.time_str || log.timestamp?.substring(11, 19)}
              </span>

              {/* Stage Badge */}
              <span
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider border shrink-0 ${getStageBadge(
                  log.stage
                )}`}
              >
                {log.stage}
              </span>

              {/* Level indicator */}
              <span
                className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider border shrink-0 ${getLevelStyle(
                  log.level
                )}`}
              >
                {log.level}
              </span>

              {/* Message */}
              <div className="flex-1 break-words">
                <span
                  className={`${
                    log.level === "SUCCESS"
                      ? "text-emerald-300 font-bold"
                      : log.level === "ERROR"
                      ? "text-rose-400 font-bold"
                      : log.level === "WARN"
                      ? "text-orange-300"
                      : log.level === "AUTO_APPLY"
                      ? "text-amber-200"
                      : log.level === "MATCHING"
                      ? "text-indigo-200"
                      : log.level === "DISCOVERY"
                      ? "text-purple-200"
                      : "text-slate-300"
                  }`}
                >
                  {log.message}
                </span>

                {/* Structured job and fit details */}
                {log.details && Object.keys(log.details).length > 0 && (
                  <details className="mt-1.5 rounded-lg border border-slate-800 bg-slate-900/70 text-[10px] text-slate-300">
                    <summary className="cursor-pointer px-2 py-1 text-cyan-300 hover:text-cyan-200">
                      View job, CV-fit, salary &amp; step details
                    </summary>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 px-2 pb-2">
                      {Object.entries(log.details).map(([key, value]) => {
                        if (value === null || value === undefined || value === "") return null;
                        const displayValue = Array.isArray(value)
                          ? value.join(", ") || "None"
                          : typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value);
                        return (
                          <div key={key} className="min-w-0 border-t border-slate-800/70 pt-1">
                            <dt className="font-bold text-slate-400">
                              {key.replaceAll("_", " ")}
                            </dt>
                            <dd className="whitespace-pre-wrap break-words text-slate-200">
                              {displayValue}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${isApplying ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            <span>Cycle: {isApplying ? "Running" : "Idle"}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>Fit: Rules + Ollama CV review (when available)</span>
          {applySummary && (
            <>
              <span className="text-slate-700">|</span>
              <span className="text-amber-300 font-sans">{applySummary}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span>Buffer: {logs.length}/300</span>
          <span>SSE: {connected ? "200 OK" : "Connecting..."}</span>
        </div>
      </div>
    </div>
  );
}
