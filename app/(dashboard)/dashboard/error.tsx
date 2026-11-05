"use client";

import * as React from "react";
import Link from "next/link";
import { CircleAlert, LayoutDashboard, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[Dashboard Error Boundary Caught Exception]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-2xl border border-red-400/20 bg-night-2/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10 text-red-400">
          <CircleAlert className="size-6" />
        </div>
        <h2 className="font-display text-lg font-bold text-snow">
          Dashboard Encountered an Issue
        </h2>
        <p className="mt-2 text-xs text-mist leading-relaxed">
          {error.message ||
            "A transient connection or layout error occurred while rendering the dashboard. You can reload this view safely."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-sky/40 bg-sky/20 px-4 py-2.5 text-xs font-semibold text-sky hover:bg-sky/30 transition-colors"
          >
            <RefreshCcw className="size-3.5" />
            Retry
          </button>
          <Link
            href="/dashboard"
            prefetch={false}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-mist hover:text-snow hover:bg-white/[0.08] transition-colors"
          >
            <LayoutDashboard className="size-3.5" />
            Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

