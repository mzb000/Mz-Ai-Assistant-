"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          variant === "primary" &&
            "bg-neon-500 text-black hover:bg-neon-400 active:bg-neon-600 neon-glow",
          variant === "secondary" &&
            "bg-surface2 text-foreground hover:bg-border border border-border",
          variant === "ghost" &&
            "text-muted hover:text-foreground hover:bg-surface2/50",
          variant === "danger" &&
            "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
          variant === "outline" &&
            "border border-neon-500/30 text-neon-400 hover:bg-neon-500/10",

          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          size === "icon" && "h-10 w-10 p-0",

          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
