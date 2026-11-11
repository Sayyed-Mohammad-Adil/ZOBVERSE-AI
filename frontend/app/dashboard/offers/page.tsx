"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  Award,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  Briefcase,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

interface Offer {
  id: number;
  application_id?: number;
  user_id: number;
  company: string;
  role: string;
  base_salary: number;
  bonus?: number | null;
  equity?: string;
  currency: string;
  location?: string;
  work_mode?: string | null;
  joining_date?: string;
  status: string; // PENDING, ACCEPTED, DECLINED, NEGOTIATING
  notes?: string;
  created_at?: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    base_salary: "",
    bonus: "",
    equity: "",
    currency: "",
    location: "",
    work_mode: "",
    status: "PENDING",
    joining_date: "",
    notes: "",
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError("");
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) throw new Error("Please log in to view offers.");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/offers/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const meRes = await fetchWithAuth("/auth/me");
      const me = await meRes.json();

      const res = await fetchWithAuth(`/offers/${me.id}`, {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          base_salary: Number(formData.base_salary),
          bonus: formData.bonus === "" ? null : Number(formData.bonus),
          work_mode: formData.work_mode || null,
          joining_date: formData.joining_date
            ? new Date(formData.joining_date).toISOString()
            : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to record offer");
      setIsAdding(false);
      setFormData({
        company: "",
        role: "",
        base_salary: "",
        bonus: "",
        equity: "",
        currency: "",
        location: "",
        work_mode: "",
        status: "PENDING",
        joining_date: "",
        notes: "",
      });
      await loadOffers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`/offers/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await loadOffers();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this offer package?")) return;
    try {
      setDeletingId(id);
      const res = await fetchWithAuth(`/offers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete offer");
      await loadOffers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "ACCEPTED":
        return <Badge variant="success" size="sm" dot pulse>Accepted Offer</Badge>;
      case "NEGOTIATING":
        return <Badge variant="warning" size="sm" dot>Negotiating</Badge>;
      case "DECLINED":
        return <Badge variant="danger" size="sm">Declined</Badge>;
      case "PENDING":
      default:
        return <Badge variant="primary" size="sm" dot>Decision Pending</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Offers &amp; Compensation Packages
            </h1>
            <Badge variant="purple" size="sm" dot pulse>
              {offers.length} Received
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare base salaries, equity packages, bonus structures, and negotiation milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isAdding ? "Close Form" : "Record New Offer"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadOffers}
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

      {/* Record Offer Modal / Form */}
      {isAdding && (
        <Card className="glass-panel p-6 border-purple-200 animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <div>
              <CardTitle>Record Compensation Package</CardTitle>
              <CardDescription>
                Store offer components to compare total compensation and make confident decisions
              </CardDescription>
            </div>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Company Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Stripe, OpenAI"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Offered Role
                </label>
                <input
                  required
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Staff Software Engineer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Currency
                </label>
                <select
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="" disabled>Select currency</option>
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Base Salary
                </label>
                <input
                  required
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) =>
                    setFormData({ ...formData, base_salary: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Annual Bonus
                </label>
                <input
                  type="number"
                  value={formData.bonus}
                  onChange={(e) =>
                    setFormData({ ...formData, bonus: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Equity Grant Description
                </label>
                <input
                  type="text"
                  value={formData.equity}
                  onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
                  placeholder="e.g. $80k RSUs over 4 years"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Work Mode
                </label>
                <select
                  value={formData.work_mode}
                  onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Not specified</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco or Remote"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Offer Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="PENDING">Pending Decision</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="DECLINED">Declined</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Negotiation Notes &amp; Perks
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Unlimited PTO, $3,000 WFH equipment budget, 401(k) 5% match..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={isSaving}>
                Save Offer Package
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Offers Grid */}
      {loading ? (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 shadow-lg py-12">
          <BrandLoader size="md" label="Loading compensation & offer data..." />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Job Offers Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When an employer extends an offer letter, log the total compensation here to compare packages side-by-side.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsAdding(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Record First Offer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((offer) => {
            const formatCurrency = (amount: number) => {
              const symbols: Record<string, string> = {
                USD: "$",
                INR: "₹",
                EUR: "€",
                GBP: "£",
                CAD: "CA$",
              };
              return `${symbols[offer.currency] ?? `${offer.currency} `}${amount.toLocaleString()}`;
            };

            return (
              <div
                key={offer.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(offer.status)}
                        <Badge variant="secondary" size="sm">
                          {offer.work_mode || "Work mode not provided"}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                        {offer.company}
                      </h3>
                      <div className="text-xs font-semibold text-slate-600">
                        {offer.role} • {offer.location || "Location not provided"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(offer.id)}
                      disabled={deletingId === offer.id}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title="Delete Offer"
                    >
                      {deletingId === offer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Compensation Breakdown Cards */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs text-purple-900 font-semibold">
                      <span>Total First-Year Cash</span>
                      <span className="text-lg font-black text-purple-950">
                        {offer.bonus == null
                          ? "Not calculated"
                          : formatCurrency(offer.base_salary + offer.bonus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/60 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium text-[11px] block">Base Salary</span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(offer.base_salary)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium text-[11px] block">Annual Bonus</span>
                        <span className="font-bold text-slate-800">
                          {offer.bonus == null
                            ? "Not provided"
                            : formatCurrency(offer.bonus)}
                        </span>
                      </div>
                    </div>

                    {offer.equity && (
                      <div className="pt-2 border-t border-purple-200/60 text-xs">
                        <span className="text-slate-500 font-medium text-[11px] block">Equity / Stock</span>
                        <span className="font-bold text-indigo-700">{offer.equity}</span>
                      </div>
                    )}
                  </div>

                  {offer.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                      <span className="font-bold text-slate-500 block mb-0.5 text-[10px] uppercase tracking-wider">
                        Perks &amp; Details:
                      </span>
                      {offer.notes}
                    </div>
                  )}
                </div>

                {/* Status Switcher Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">Update Status:</span>
                  <select
                    value={offer.status}
                    onChange={(e) => handleUpdateStatus(offer.id, e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="PENDING">Pending Decision</option>
                    <option value="NEGOTIATING">Negotiating</option>
                    <option value="ACCEPTED">Accept Offer</option>
                    <option value="DECLINED">Decline Offer</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
