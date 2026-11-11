import React from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "cyan"
  | "outline";

export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  size = "md",
  dot = false,
  pulse = false,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium transition-colors select-none";

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded-md gap-1",
    md: "text-xs px-2.5 py-1 rounded-full gap-1.5",
    lg: "text-sm px-3 py-1.5 rounded-full gap-2",
  };

  const variantStyles = {
    primary:
      "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs",
    secondary:
      "bg-slate-100 text-slate-700 border border-slate-200 shadow-xs",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs",
    warning:
      "bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs",
    danger:
      "bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs",
    purple:
      "bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs",
    cyan:
      "bg-cyan-50 text-cyan-700 border border-cyan-200/80 shadow-xs",
    outline:
      "bg-transparent text-slate-700 border border-slate-300",
  };

  const dotColors = {
    primary: "bg-blue-500",
    secondary: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    purple: "bg-purple-500",
    cyan: "bg-cyan-500",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}
