// Synapse — Transparent token/cost model.
//
// All prices/limits here are the single source of truth for the UI.
// When Supabase is connected, monthly totals will be sourced from the
// `generations` table (sum of `tokens_total` for the current period)
// instead of localStorage. The shapes stay identical.

import type { SourceData } from "@/lib/ai"

export type Plan = "free" | "pro"

/**
 * Model used for AI card generation. Swap here and every UI surface updates.
 * Pricing is OpenAI public list price for gpt-4o-mini (per 1M tokens).
 */
export const AI_MODEL = {
  id: "gpt-4o-mini",
  label: "GPT-4o mini",
  inputPer1M: 0.15, // USD
  outputPer1M: 0.6, // USD
} as const

/**
 * Token accounting per generated card.
 *  - INPUT tokens per card include a tiny slice of the shared system prompt
 *    plus the proportional chunk of source context sent to the model.
 *  - OUTPUT tokens cover the JSON { question, answer } pair.
 * These numbers are conservative upper bounds, matching what we BILL against
 * the plan budget so the UI never understates cost.
 */
export const TOKENS = {
  systemOverheadPerCard: 40,
  outputPerCard: 160,
  // Default input context budget per card when source is short/unknown.
  defaultInputPerCard: 120,
  // Average characters per token for English/Spanish/Portuguese mix.
  charsPerToken: 4,
} as const

export const PLAN_LIMITS: Record<Plan, { monthlyTokens: number | null; monthlyCards: number | null }> = {
  free: { monthlyTokens: 20_000, monthlyCards: 50 },
  pro: { monthlyTokens: null, monthlyCards: null }, // unlimited
}

/** Estimate input tokens for a given source — always rounded UP for honesty. */
export function estimateSourceTokens(source: SourceData | null): number {
  if (!source) return 0
  if (source.type === "text") {
    return Math.ceil(source.text.length / TOKENS.charsPerToken)
  }
  if (source.type === "url") {
    // Fetching + readability usually lands around ~1500 words = ~2000 tokens.
    return 2000
  }
  // PDF: 1 KB ≈ ~220 tokens of extracted text (conservative upper bound).
  return Math.min(60_000, Math.ceil((source.size / 1024) * 220))
}

export type TokenEstimate = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  /** Worst-case total if the model uses the full per-card input budget. */
  maxTokens: number
  estimatedCostUsd: number
  maxCostUsd: number
  tokensPerCard: number
}

/**
 * Compute the prospective cost of generating `cards` flashcards from `source`.
 * The estimate splits the source tokens across all cards (the API is called
 * once per generation, so the context is shared).
 */
export function estimateGeneration(
  source: SourceData | null,
  cards: number,
): TokenEstimate {
  const sourceTokens = estimateSourceTokens(source)
  const systemTokens = cards * TOKENS.systemOverheadPerCard
  const inputTokens = sourceTokens + systemTokens
  const outputTokens = cards * TOKENS.outputPerCard
  const totalTokens = inputTokens + outputTokens

  // Max possible: assume worst-case input per card when source isn't provided yet.
  const maxInput = Math.max(inputTokens, cards * TOKENS.defaultInputPerCard + systemTokens)
  const maxTokens = maxInput + outputTokens

  const estimatedCostUsd =
    (inputTokens / 1_000_000) * AI_MODEL.inputPer1M +
    (outputTokens / 1_000_000) * AI_MODEL.outputPer1M
  const maxCostUsd =
    (maxInput / 1_000_000) * AI_MODEL.inputPer1M +
    (outputTokens / 1_000_000) * AI_MODEL.outputPer1M

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    maxTokens,
    estimatedCostUsd,
    maxCostUsd,
    tokensPerCard: Math.round((inputTokens + outputTokens) / Math.max(1, cards)),
  }
}

export function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(4)}`
  if (n < 1) return `$${n.toFixed(3)}`
  return `$${n.toFixed(2)}`
}

export function formatTokens(n: number): string {
  return n.toLocaleString("en-US")
}

/** First day of next month — used for "Resets on …" hint. */
export function nextResetDate(locale = "en"): string {
  const d = new Date()
  const reset = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return reset.toLocaleDateString(locale, { day: "numeric", month: "long" })
}
