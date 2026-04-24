// Server-side Supabase client for React Server Components, Route Handlers,
// and Server Actions. Activate by connecting the Supabase integration in v0.
//
//   import { createClient } from "@/lib/supabase/server"
//   const supabase = await createClient()
//   const { data } = await supabase.from("decks").select("*")
//
// The signature is async so this file works seamlessly with Next.js 16's
// async `cookies()` API.

export async function createClient() {
  // When SUPABASE_URL is present, replace this body with:
  //
  //   import { cookies } from "next/headers"
  //   import { createServerClient } from "@supabase/ssr"
  //   const cookieStore = await cookies()
  //   return createServerClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //     {
  //       cookies: {
  //         getAll: () => cookieStore.getAll(),
  //         setAll: (cookiesToSet) => {
  //           try {
  //             cookiesToSet.forEach(({ name, value, options }) =>
  //               cookieStore.set(name, value, options))
  //           } catch { /* Called from a Server Component — safe to ignore */ }
  //         },
  //       },
  //     },
  //   )
  return {
    __notConnected: true as const,
    message:
      "Supabase is not connected yet. Add the integration from v0 → Settings → Integrations.",
  }
}
