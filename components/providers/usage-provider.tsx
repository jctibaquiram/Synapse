"use client"

// Tracks monthly AI consumption client-side for the demo.
// When Supabase is connected, replace the localStorage persistence with:
//
//   const { data } = await supabase
//     .from("generations")
//     .select("tokens_total, cards_count")
//     .gte("created_at", startOfMonthISO)
//     .eq("user_id", user.id)
//
// The context API below stays identical — only the source of truth changes.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { PLAN_LIMITS, type Plan } from "@/lib/usage"

type UsageState = {
  monthKey: string // "2026-04"
  tokensUsed: number
  cardsGenerated: number
}

type UsageContextValue = {
  plan: Plan
  setPlan: (p: Plan) => void
  tokensUsed: number
  cardsGenerated: number
  tokenLimit: number | null
  cardLimit: number | null
  tokensRemaining: number | null
  cardsRemaining: number | null
  /** Record a completed generation. Persists immediately. */
  recordGeneration: (tokens: number, cards: number) => void
  /** Manually reset (e.g. cycle rollover). */
  reset: () => void
}

const UsageContext = createContext<UsageContextValue | null>(null)

const STORAGE_KEY = "synapse.usage.v1"
const PLAN_KEY = "synapse.plan.v1"

function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function initialState(): UsageState {
  return { monthKey: currentMonthKey(), tokensUsed: 0, cardsGenerated: 0 }
}

export function UsageProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<Plan>("free")
  const [state, setState] = useState<UsageState>(initialState)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage + auto-reset on month rollover.
  useEffect(() => {
    try {
      const rawPlan = localStorage.getItem(PLAN_KEY) as Plan | null
      if (rawPlan === "pro" || rawPlan === "free") setPlanState(rawPlan)

      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as UsageState
        if (parsed.monthKey === currentMonthKey()) {
          setState(parsed)
        } else {
          // Month changed -> rollover
          const fresh = initialState()
          setState(fresh)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
        }
      }
    } catch {
      // ignore storage errors (Safari private, etc.)
    } finally {
      setHydrated(true)
    }
  }, [])

  const setPlan = useCallback((p: Plan) => {
    setPlanState(p)
    try {
      localStorage.setItem(PLAN_KEY, p)
    } catch {}
  }, [])

  const recordGeneration = useCallback((tokens: number, cards: number) => {
    setState((prev) => {
      const next: UsageState = {
        monthKey: currentMonthKey(),
        tokensUsed: prev.tokensUsed + tokens,
        cardsGenerated: prev.cardsGenerated + cards,
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const fresh = initialState()
    setState(fresh)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    } catch {}
  }, [])

  const value = useMemo<UsageContextValue>(() => {
    const limits = PLAN_LIMITS[plan]
    const tokensRemaining =
      limits.monthlyTokens == null ? null : Math.max(0, limits.monthlyTokens - state.tokensUsed)
    const cardsRemaining =
      limits.monthlyCards == null ? null : Math.max(0, limits.monthlyCards - state.cardsGenerated)
    return {
      plan,
      setPlan,
      tokensUsed: hydrated ? state.tokensUsed : 0,
      cardsGenerated: hydrated ? state.cardsGenerated : 0,
      tokenLimit: limits.monthlyTokens,
      cardLimit: limits.monthlyCards,
      tokensRemaining,
      cardsRemaining,
      recordGeneration,
      reset,
    }
  }, [plan, setPlan, state, hydrated, recordGeneration, reset])

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>
}

export function useUsage() {
  const ctx = useContext(UsageContext)
  if (!ctx) throw new Error("useUsage must be used inside <UsageProvider>")
  return ctx
}
