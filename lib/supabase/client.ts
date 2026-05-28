"use client";

import { createBrowserClient } from "@supabase/ssr";

function getSupabaseBrowserEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}

export function isSupabaseBrowserConfigured() {
  return getSupabaseBrowserEnv().configured;
}

export function createSupabaseBrowserClient() {
  const { url, anonKey, configured } = getSupabaseBrowserEnv();

  if (!configured) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
