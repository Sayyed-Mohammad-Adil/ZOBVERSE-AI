"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth, getApiUrl } from "@/lib/api";
import {
  Send,
  Upload,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Building,
  MapPin,
  X,
} from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Failed to load user");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/applications/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: number, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`/applications/${appId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadApplications();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportStatus("Importing CSV records and validating duplicate rules...");

      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${getApiUrl()}/applications/import-csv?user_id=${me.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.ok) {
        const result = await res.json();
        setImportStatus(
          `✓ Imported ${result.imported} application(s). (${result.skipped_duplicates} duplicates skipped safely).`
        );
        loadApplications();
        setTimeout(() => setImportStatus(null), 5000);
      } else {
        const err = await res.json();
        throw new Error(err.detail || "Failed to import CSV");
      }
    } catch (err: any) {
      setError(err.message);
      setImportStatus(null);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    const normalized = (status || "").toUpperCase();
    switch (normalized) {
      case "READY":
        return <Badge variant="primary" size="sm" dot>Ready to Submit</Badge>;
      case "APPLIED":
        return <Badge variant="cyan" size="sm" dot>Submitted</Badge>;
      case "INTERVIEW":
        return <Badge variant="warning" size="sm" dot pulse>Interviewing</Badge>;
      case "OFFER":
        return <Badge variant="success" size="sm" dot pulse>Offer Received</Badge>;
      case "REJECTED":
        return <Badge variant="danger" size="sm">Rejected</Badge>;
      case "SKIPPED":
        return <Badge variant="secondary" size="sm">Skipped</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const statusTabs = [
    { key: "ALL", label: "All Pipeline", count: applications.length },
    {
      key: "READY",
      label: "Ready for Review",
      count: applications.filter((a) => a.status === "READY").length,
    },
    {
      key: "APPLIED",
      label: "Submitted",
      count: applications.filter((a) => a.status === "APPLIED").length,
    },
    {
      key: "INTERVIEW",
      label: "Interviews",
      count: applications.filter((a) => a.status === "INTERVIEW").length,
    },
    {
      key: "OFFER",
      label: "Offers",
      count: applications.filter((a) => a.status === "OFFER").length,
    },
  ];

  const filteredApps = applications.filter((app) => {
    const matchesFilter = filter === "ALL" || (app.status || "").toUpperCase() === filter;
    const matchesSearch =
      searchQuery === "" ||
      (app.job_title && app.job_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.company && app.company.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Application Pipeline Tracker
            </h1>
            <Badge variant="primary" size="sm">
              {applications.length} Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete lifecycle tracking, automated submissions, and verified anti-duplicate history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvUpload}
            accept=".csv"
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={isImporting}
            leftIcon={<Upload className="w-4 h-4 text-slate-500" />}
          >
            Import CSV History
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadApplications}
            loading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* CSV Status Alert */}
      {importStatus && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-sm font-medium flex items-center justify-between shadow-xs">
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus(null)} className="text-blue-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Filter Tabs and Quick Search */}
      <Card className="glass-panel p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                  filter === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === tab.key
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 shadow-lg py-12">
          <BrandLoader size="md" label="Loading pipeline application history..." />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No applications in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore live openings in Job Search to queue new applications or import previous submissions via CSV.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Role & Company Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                      {app.job_title}
                    </h2>
                    {getStatusBadge(app.status)}
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      Source: {app.source || "Auto-Agent"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-800">{app.company}</span>
                    <span>•</span>
                    <span className="text-slate-500">
                      Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Status Switcher & External Link */}
                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="READY">Ready</option>
                    <option value="APPLIED">Submitted</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SKIPPED">Skipped</option>
                  </select>

                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Job Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
