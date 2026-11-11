"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [automationMode, setAutomationMode] = useState<string>("Assisted");
  const [dailyLimit, setDailyLimit] = useState<number>(10);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadHeaderState();
  }, [pathname]);

  const loadHeaderState = async () => {
    try {
      const meRes = await fetchWithAuth("/auth/me");
      if (meRes.ok) {
        const me = await meRes.json();
        setUserId(me.id);
        
        // Fetch preferences
        const prefRes = await fetchWithAuth(`/preferences/${me.id}`);
        if (prefRes.ok) {
          const pref = await prefRes.json();
          setAutomationMode(pref.automation_mode || "Assisted");
          setDailyLimit(pref.daily_application_limit || 10);
        }

        // Fetch review items
        const revRes = await fetchWithAuth(`/review/${me.id}`);
        if (revRes.ok) {
          const rev = await revRes.json();
          setReviewCount(Array.isArray(rev) ? rev.length : 0);
        }

        // Fetch notifications
        const notifRes = await fetchWithAuth(`/notifications/${me.id}`);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(Array.isArray(notifData) ? notifData : []);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetchWithAuth(`/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unread.map((n) => fetchWithAuth(`/notifications/${n.id}/read`, { method: "PUT" }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleQuickScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetchWithAuth("/workers/scan", { method: "POST" });
      if (res.ok) {
        if (pathname === "/dashboard/search") {
          window.location.reload();
        } else {
          router.push("/dashboard/search");
        }
      }
    } catch {
      // ignore
    } finally {
      setIsScanning(false);
    }
  };

  // Generate dynamic breadcrumb title
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return [{ name: "Command Center", href: "/dashboard" }];

    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const formatted = seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { name: formatted, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.href} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-bold text-slate-900 bg-slate-100/80 px-2 py-1 rounded-md">
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Header Actions & Telemetry */}
      <div className="flex items-center gap-3">
        {/* Automation Status Pill */}
        <Link
          href="/dashboard/preferences"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition-all duration-150"
          title="Configure automation modes in Preferences"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                automationMode === "Autonomous" ? "bg-emerald-400" : "bg-blue-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                automationMode === "Autonomous" ? "bg-emerald-500" : "bg-blue-500"
              }`}
            />
          </span>
          <span>
            {automationMode} Mode • {dailyLimit} apps/day
          </span>
        </Link>

        {/* Review Queue Alert if count > 0 */}
        {reviewCount > 0 && (
          <Link
            href="/dashboard/review"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{reviewCount} Needs Approval</span>
          </Link>
        )}

        {/* Quick Scan Action */}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleQuickScan}
          loading={isScanning}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />}
          className="text-xs font-medium"
        >
          Scan Web
        </Button>

        {/* Top Navbar Notification Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300" />
            )}
          </button>

          {/* Interactive Popover Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-2.5 ${
                          !notif.is_read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !notif.is_read ? "bg-blue-600" : "bg-transparent"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors block py-1"
                  >
                    View All Activity &amp; Logs →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
