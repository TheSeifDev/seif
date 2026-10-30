"use client";

import { createAuthClient } from "better-auth/react";
import { siteUrl } from "@/lib/seo/metadata";

/**
 * The auth API is same-origin in production. The canonical origin is shared
 * with metadata and redirect configuration rather than inferred from a request
 * or a browser-controlled URL.
 */
export const authClient = createAuthClient({
  baseURL: siteUrl("/api/auth"),
});

export const { signIn, signOut, useSession } = authClient;
