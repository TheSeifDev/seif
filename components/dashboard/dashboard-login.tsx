"use client";

import * as React from "react";
import {
  CircleAlert,
  GitBranch,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

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
    <main
      id="main"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050b13] px-4 py-10 font-sans text-slate-100"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(77,182,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(77,182,255,0.035)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/[0.07] blur-[120px]" />
      <section className="relative w-full max-w-md overflow-hidden border border-white/10 bg-[#0b1828]/95 p-7 shadow-[0_25px_100px_rgba(0,0,0,0.46)] [mask-image:radial-gradient(circle_24px_at_100%_100%,transparent_0_21px,#000_22px)] [-webkit-mask-image:radial-gradient(circle_24px_at_100%_100%,transparent_0_21px,#000_22px)] sm:p-9">
        <div className="mb-9 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-300/85">
              SEIF / CMS
            </div>
            <div className="mt-1 text-xs text-slate-600">Private workspace</div>
          </div>
          <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-3 text-sky-200">
            <LockKeyhole className="size-5" />
          </div>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white">
            {heading}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-red-300/20 bg-red-400/[0.08] p-3 text-sm leading-5 text-red-100"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" />{" "}
            <span>{error}</span>
          </div>
        )}
        {reason === "unconfigured" ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.07] p-4 text-sm leading-6 text-amber-100">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              Authentication readiness is incomplete. Ask the server owner to
              configure the approved provider before signing in.
            </span>
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-sky-300/40 bg-sky-300 px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#06101b] shadow-[0_0_28px_rgba(77,182,255,0.18)] transition hover:bg-sky-200 disabled:cursor-wait disabled:opacity-60"
            disabled={loading}
            onClick={() => void signIn()}
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <GitBranch className="size-4" />
            )}
            {loading ? "Opening GitHub" : "Continue with GitHub"}
          </button>
        )}
        <div className="mt-7 flex items-start gap-3 border-t border-white/[0.08] pt-5 text-[11px] leading-5 text-slate-600">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-300/60" />
          <span>
            Admin access is controlled by the server. This UI has no password or
            sign-up flow.
          </span>
        </div>
      </section>
    </main>
  );
}
