"use client";

import * as React from "react";
import Link from "next/link";
import { CircleAlert, Home, RefreshCcw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[Application Root Error Caught Exception]:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-night p-6 text-center text-snow">
      <div className="max-w-md rounded-2xl border border-red-400/20 bg-night-2/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10 text-red-400">
          <CircleAlert className="size-6" />
        </div>
        <h2 className="font-display text-lg font-bold text-snow">
          Something went wrong
        </h2>
        <p className="mt-2 text-xs text-mist leading-relaxed">
          {error.message ||
            "An unexpected error occurred while loading this page. Please try refreshing."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-sky/40 bg-sky/20 px-4 py-2.5 text-xs font-semibold text-sky hover:bg-sky/30 transition-colors"
          >
            <RefreshCcw className="size-3.5" />
            Reload Page
          </button>
          <Link
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-mist hover:text-snow hover:bg-white/[0.08] transition-colors"
          >
            <Home className="size-3.5" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

