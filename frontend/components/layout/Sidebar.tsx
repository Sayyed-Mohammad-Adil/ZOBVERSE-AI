"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  Send,
  Calendar,
  Award,
  User,
  FileText,
  HelpCircle,
  BarChart3,
  Sliders,
  Settings,
  LogOut,
  Terminal,
  Activity,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";
import { useEffect, useRef, useState } from "react";
import { clearAuthSession, fetchWithAuth } from "@/lib/api";
import gsap from "gsap";

interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [userName, setUserName] = useState<string>("Candidate");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const sidebarRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    let active = true;

    const loadUserData = async () => {
      try {
        const meRes = await fetchWithAuth("/auth/me");
        if (!meRes.ok) return;
        const me = await meRes.json();
        if (!active) return;
        setUserEmail(me.email || "");

        const [profRes, revRes] = await Promise.all([
          fetchWithAuth(`/profile/${me.id}`),
          fetchWithAuth(`/review/${me.id}`),
        ]);
        if (!active) return;

        if (profRes.ok) {
          const prof = await profRes.json();
          setUserName(
            prof.first_name
              ? `${prof.first_name} ${prof.last_name || ""}`.trim()
              : me.email.split("@")[0],
          );
        } else {
          setUserName(me.email.split("@")[0]);
        }

        if (revRes.ok) {
          const revData = await revRes.json();
          setReviewCount(Array.isArray(revData) ? revData.length : 0);
        }
      } catch (error) {
        if (active) {
          console.error("Could not load sidebar account data:", error);
        }
      }
    };

    void loadUserData();
    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  // GSAP animation for collapsing and uncollapsing
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const ctx = gsap.context(() => {
      if (isCollapsed) {
        // Collapsing animation
        const tl = gsap.timeline();
        tl.to(".sidebar-expandable-text", {
          opacity: 0,
          x: -12,
          duration: 0.15,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(".sidebar-expandable-text", { display: "none" });
          },
        });
        tl.to(
          sidebarRef.current,
          {
            width: 80,
            duration: 0.35,
            ease: "power3.inOut",
          },
          "-=0.08"
        );
      } else {
        // Uncollapsing animation
        const tl = gsap.timeline();
        gsap.set(".sidebar-expandable-text", { display: "" });
        tl.to(sidebarRef.current, {
          width: 288,
          duration: 0.35,
          ease: "power3.inOut",
        });
        tl.fromTo(
          ".sidebar-expandable-text",
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.24,
            stagger: 0.012,
            ease: "power2.out",
          },
          "-=0.18"
        );
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, [isCollapsed]);

  const navGroups: NavGroup[] = [
    {
      label: "COMMAND CENTER",
      items: [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        {
          name: "Agent Console",
          href: "/dashboard/console",
          icon: Terminal,
        },
        { name: "Live Job Search", href: "/dashboard/search", icon: Search },
        {
          name: "Review Queue",
          href: "/dashboard/review",
          icon: ShieldCheck,
          badge: reviewCount > 0 ? reviewCount : undefined,
          badgeColor:
            "bg-amber-500/20 text-amber-300 border border-amber-500/40",
        },
      ],
    },
    {
      label: "PIPELINE & REPORTING",
      items: [
        { name: "Applications", href: "/dashboard/applications", icon: Send },
        { name: "Interviews", href: "/dashboard/interviews", icon: Calendar },
        { name: "Job Offers", href: "/dashboard/offers", icon: Award },
        { name: "Reporting & Audits", href: "/dashboard/reporting", icon: BarChart3 },
      ],
    },
    {
      label: "CANDIDATE BRAIN",
      items: [
        { name: "My Profile", href: "/dashboard/profile", icon: User },
        { name: "Resumes & CVs", href: "/dashboard/resumes", icon: FileText },
        { name: "Question Bank", href: "/dashboard/questions", icon: HelpCircle },
        { name: "Market & Gap Analytics", href: "/dashboard/analytics", icon: Activity },
      ],
    },
    {
      label: "SYSTEM & ABOUT",
      items: [
        { name: "Preferences", href: "/dashboard/preferences", icon: Sliders },
        { name: "AI & Sources", href: "/dashboard/settings", icon: Settings },
        { name: "About", href: "/dashboard/about", icon: Info },
      ],
    },
  ];

  return (
    <aside
      ref={sidebarRef}
      style={{ width: isCollapsed ? 80 : 288 }}
      className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0 overflow-x-hidden relative"
    >
      {/* Brand Header */}
      <div
        className={`p-4 border-b border-slate-800/70 flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } relative`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          } group/logo cursor-pointer text-left focus:outline-none relative w-full`}
          title={isCollapsed ? "Uncollapse" : "Collapse"}
          aria-label={isCollapsed ? "Uncollapse sidebar" : "Collapse sidebar"}
        >
          {/* Logo Icon */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover/logo:shadow-[0_0_25px_rgba(6,182,212,0.65)] group-hover/logo:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950/90 to-slate-900 rounded-[10px] flex items-center justify-center p-1.5 shadow-inner">
                <OpenCodeLogo className="w-6 h-6" glow />
              </div>
            </div>
          </div>

          {/* Brand Text (in expanded state) */}
          <div className="sidebar-expandable-text min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover/logo:text-blue-200 transition-colors">
                ZOBVERSE AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Autonomous Job Engine
            </p>
          </div>

          {/* Floating Hover Indicator Badge: shows Collapse / Uncollapse on hover */}
          <div
            className={`pointer-events-none absolute z-50 transition-all duration-200 opacity-0 group-hover/logo:opacity-100 ${
              isCollapsed
                ? "left-full ml-3 top-1/2 -translate-y-1/2"
                : "right-0 top-1/2 -translate-y-1/2"
            }`}
          >
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase shadow-2xl bg-blue-600/95 text-white backdrop-blur-md border border-blue-400/40 whitespace-nowrap">
              {isCollapsed ? (
                <>
                  <span>Uncollapse</span>
                  <ChevronRight className="w-3 h-3 text-blue-200" />
                </>
              ) : (
                <>
                  <ChevronLeft className="w-3 h-3 text-blue-200" />
                  <span>Collapse</span>
                </>
              )}
            </span>
          </div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 overflow-x-hidden">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="sidebar-expandable-text px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.label}
            </div>
            {isCollapsed && <div className="h-px bg-slate-800/60 my-2 mx-1" />}
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center ${
                      isCollapsed ? "justify-center px-0" : "justify-between px-3"
                    } py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? isCollapsed
                          ? "bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/40 shadow-inner"
                          : "bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-blue-300 font-semibold border-l-2 border-blue-500 shadow-inner"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        isCollapsed ? "justify-center" : "gap-3"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-blue-400"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span className="sidebar-expandable-text truncate">
                        {item.name}
                      </span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`sidebar-expandable-text text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeColor || "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Collapsed mode tooltip on icon hover */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-slate-100 text-[11px] font-medium rounded-lg shadow-xl border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* System Telemetry & User Card */}
      <div
        className={`p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/50 ${
          isCollapsed ? "flex flex-col items-center" : ""
        }`}
      >
        {/* User Profile Pill */}
        <div
          className={`flex items-center ${
            isCollapsed
              ? "justify-center flex-col gap-1.5 p-1.5"
              : "justify-between p-2"
          } rounded-xl bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-slate-800/60 w-full`}
        >
          <Link
            href="/dashboard/profile"
            title={isCollapsed ? `${userName} (${userEmail})` : undefined}
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-2.5 min-w-0 flex-1"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-expandable-text min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {userName}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {userEmail || "Connected"}
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Log Out"
            className={`p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer ${
              isCollapsed ? "" : "ml-1"
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
