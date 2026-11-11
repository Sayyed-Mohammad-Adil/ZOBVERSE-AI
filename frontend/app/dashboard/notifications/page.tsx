"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchWithAuth } from "@/lib/api";
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  MailOpen,
} from "lucide-react";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingReadId, setMarkingReadId] = useState<number | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const meRes = await fetchWithAuth("/auth/me");
      if (!meRes.ok) return;
      const me = await meRes.json();

      const res = await fetchWithAuth(`/notifications/${me.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      setMarkingReadId(id);
      await fetchWithAuth(`/notifications/${id}/read`, { method: "PUT" });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingReadId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Activity &amp; Notifications
            </h1>
            {unreadCount > 0 ? (
              <Badge variant="primary" size="sm" dot pulse>
                {unreadCount} Unread
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                All Caught Up
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry on automated submissions, review triggers, and interview reminders
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadNotifications}
          loading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 shadow-lg py-12">
            <BrandLoader size="md" label="Loading real-time notifications & alerts..." />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">You're All Caught Up!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              New submissions, interview reminders, and review alerts will appear here as the worker processes tasks.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                !n.is_read
                  ? "bg-white border-blue-300 shadow-sm ring-1 ring-blue-500/20"
                  : "bg-slate-50/70 border-slate-200/80 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    !n.is_read
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div
                    className={`text-xs sm:text-sm leading-snug ${
                      !n.is_read ? "font-bold text-slate-900" : "font-medium text-slate-600"
                    }`}
                  >
                    {n.message}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </div>
              </div>

              {!n.is_read && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => markAsRead(n.id)}
                  loading={markingReadId === n.id}
                  leftIcon={<MailOpen className="w-3 h-3 text-slate-500" />}
                >
                  Mark Read
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
