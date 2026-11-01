"use client";

import * as React from "react";
import {
  ArrowUpRight,
  CircleAlert,
  GitBranch,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { container, darkCard } from "@/lib/ui/layout";
import { cn } from "@/lib/utils";

type DashboardLoginProps = {
  reason?: "unauthenticated" | "unconfigured" | "forbidden";
};

export function DashboardLogin({
  reason = "unauthenticated",
}: DashboardLoginProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "github", callbackURL: "/dashboard" }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          payload?.message ??
            (response.status === 503
              ? "Authentication is not configured yet."
              : "Could not start GitHub sign-in."),
        );
      }
      const url = payload?.url ?? payload?.redirectURL;
      if (!url)
        throw new Error("The sign-in service did not return a redirect URL.");
      window.location.assign(url);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not start GitHub sign-in.",
      );
      setLoading(false);
    }
  };

  const heading =
    reason === "forbidden"
      ? "Admin access required"
      : reason === "unconfigured"
        ? "Workspace unavailable"
        : "Private workspace";
  const description =
    reason === "forbidden"
      ? "This account is authenticated, but it is not authorized for the portfolio workspace."
      : reason === "unconfigured"
        ? "The server has not finished configuring authentication. No secret values are exposed in this screen."
        : "Sign in with the approved GitHub account to manage portfolio content.";

  return (
    <section className={cn(container, "relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-36")}>
      <div className="relative w-full max-w-lg">
        {/* Subtle background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full bg-sky/10 blur-[100px]"
        />

        <div className={cn(darkCard, "relative overflow-hidden p-8 sm:p-12 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]")}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-sky shadow-[0_0_0_4px_rgba(77,182,255,0.18)]"
              />
              <span>SEIF / CMS</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-mist">
              <LockKeyhole className="size-3 text-sky" />
              <span>AUTH ONLY</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-[-0.04em] text-snow">
              {heading}
            </h1>
            <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-mist">
              {description}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {reason === "unconfigured" ? (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200 leading-relaxed"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
              <span>
                Authentication readiness is incomplete. Ask the server owner to
                configure the approved provider before signing in.
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="group/pill inline-flex w-full h-12 items-center justify-center gap-3 rounded-full bg-snow px-6 text-sm font-semibold text-night shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky disabled:cursor-wait disabled:opacity-60"
              disabled={loading}
              onClick={() => void signIn()}
            >
              {loading ? (
                <LoaderCircle className="size-4 animate-spin text-night" />
              ) : (
                <GitBranch className="size-4 text-night" />
              )}
              <span>{loading ? "Opening GitHub…" : "Continue with GitHub"}</span>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-night text-snow transition-transform duration-300 group-hover/pill:rotate-45">
                <ArrowUpRight className="size-3.5" />
              </span>
            </button>
          )}

          <div className="mt-8 flex items-start gap-2.5 border-t border-white/[0.08] pt-6 font-mono text-[11px] leading-relaxed text-mist">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky" />
            <span>
              Admin access is server-controlled. This UI has no public password or sign-up flow.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
