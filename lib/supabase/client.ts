// Browser-side Supabase client — ACTIVATED automatically when you connect
// the Supabase integration in v0 (SUPABASE_URL + SUPABASE_ANON_KEY will be
// populated in process.env and the @supabase/ssr package will be installed).
//
// Usage (inside a "use client" file):
//   import { createClient } from "@/lib/supabase/client"
//   const supabase = createClient()
//   const { data } = await supabase.from("decks").select("*")
//
// Right now it returns a "not connected" shim so the rest of the codebase
// can import from this module without errors while you evaluate Supabase.

export type SupabaseNotConnected = {
  __notConnected: true
  message: string
}

export function createClient(): SupabaseNotConnected {
  // When SUPABASE_URL is present, replace this body with:
  //
  //   import { createBrowserClient } from "@supabase/ssr"
  //   return createBrowserClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   )
  return {
    __notConnected: true,
    message:
      "Supabase is not connected yet. Add the integration from v0 → Settings → Integrations.",
  }
}
