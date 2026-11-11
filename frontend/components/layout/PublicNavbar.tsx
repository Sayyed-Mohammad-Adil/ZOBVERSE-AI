"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OpenCodeLogo } from "@/components/ui/OpenCodeLogo";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";

type DropdownItem = { label: string; href: string; desc?: string };

type NavLink = {
  label: string;
  href: string;
  dropdown?: DropdownItem[];
};

const PRODUCT_DROPDOWN: DropdownItem[] = [
  { label: "Agent Dashboard", href: "/product/dashboard", desc: "Full autonomous control center" },
  { label: "Live Job Feed", href: "/product/search", desc: "Real-time job discovery feed" },
  { label: "Application Pipeline", href: "/product/pipeline", desc: "Track every submission" },
  { label: "Interview Tracker", href: "/product/interviews", desc: "Organize all interview rounds" },
  { label: "Offer Comparison", href: "/product/offers", desc: "Compare & negotiate packages" },
];

const RESOURCES_DROPDOWN: DropdownItem[] = [
  { label: "API Documentation", href: "/resources/api", desc: "FastAPI REST API Reference" },
  { label: "System Architecture", href: "/resources/architecture", desc: "How Open Code Ecosystem works" },
  { label: "Pipeline & Audit Telemetry", href: "/resources/audits", desc: "Verifiable telemetry & receipts" },
  { label: "Open Source Core", href: "/resources/open-source", desc: "Light-OCR vision & local engine" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks: NavLink[] = [
    { label: "Product", href: "/product", dropdown: PRODUCT_DROPDOWN },
    { label: "Workflow", href: "/how-it-works" },
    { label: "Features", href: "/features" },
    { label: "Security", href: "/security" },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "/resources", dropdown: RESOURCES_DROPDOWN },
    { label: "Info", href: "/info" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href?: string) => {
    if (!href) return false;
    if (pathname === href || (pathname.startsWith(href + "/") && href !== "/")) return true;
    if (href === "/info" && (pathname === "/about" || pathname.startsWith("/about/"))) return true;
    if (href === "/how-it-works" && pathname === "/workflow") return true;
    return false;
  };

  return (
    <header className="border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" ref={dropdownRef}>
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-1.5">
              <OpenCodeLogo className="w-5 h-5" glow />
            </div>
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            Open <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Job</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const isDropdownOpen = activeDropdown === link.label;

            if (link.dropdown) {
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    onClick={() => setActiveDropdown(null)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-sm ${
                      active || isDropdownOpen
                        ? "text-cyan-300 bg-slate-900/80 font-semibold"
                        : "hover:text-white hover:bg-slate-900/60"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180 text-cyan-400" : ""}`} />
                  </Link>

                  {isDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-slate-900/95 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      <div className="p-2">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className={`flex flex-col px-3.5 py-2.5 rounded-xl transition-all hover:bg-slate-800/70 group ${
                              pathname === item.href ? "bg-cyan-950/40 border border-cyan-500/20" : ""
                            }`}
                          >
                            <span className={`text-xs font-bold ${pathname === item.href ? "text-cyan-300" : "text-slate-100 group-hover:text-white"}`}>
                              {item.label}
                            </span>
                            {item.desc && (
                              <span className="text-[11px] text-slate-500 group-hover:text-slate-400 mt-0.5">{item.desc}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                  active
                    ? "text-cyan-300 bg-slate-900/80 font-semibold"
                    : "hover:text-white hover:bg-slate-900/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-700/60 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          {!isAuthenticated && (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-all"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/60 bg-slate-950/97 backdrop-blur-2xl px-4 py-5 space-y-1 shadow-2xl max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => {
            if ("dropdown" in link && link.dropdown) {
              return (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    {link.label} &rarr;
                  </Link>
                  <div className="pl-3 space-y-0.5">
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3.5 py-2 rounded-xl text-sm transition-all ${
                          pathname === item.href
                            ? "text-cyan-300 bg-slate-900 font-semibold"
                            : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            const linkHref = (link as { label: string; href: string }).href;
            const active = isActive(linkHref);
            return (
              <Link
                key={link.label}
                href={linkHref}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "text-cyan-300 bg-slate-900 border border-cyan-500/30 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800/60 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center text-xs font-bold shadow-md"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-200 text-center text-xs font-semibold border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center text-xs font-bold shadow-md"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
