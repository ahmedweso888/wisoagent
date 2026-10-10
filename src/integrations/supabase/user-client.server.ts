/**
 * Request-scoped Supabase client that acts AS the signed-in student.
 *
 * Server-side modules (credits, engine) must never use the browser client:
 * inside a server function there is no browser session, so `auth.uid()` would
 * be NULL and every RLS/RPC check would fail. This builds a client from the
 * incoming Authorization header instead.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import type { Database } from "./types";

export function getUserSupabase(): SupabaseClient<Database> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase environment variables are missing.");

  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: missing bearer token");
  }

  return createClient<Database>(url, key, {
    global: {
      headers: { Authorization: authHeader },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", authHeader);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
