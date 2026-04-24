// Synapse — Data access adapter.
//
// Today this module returns mock data. When Supabase is connected, flip the
// `USE_SUPABASE` flag to `true` (or make it depend on env) and every feature
// of the app will transparently read/write from the database — no other file
// in the codebase has to change.

import { mockDecks, mockStudyCards, type Deck, type Flashcard } from "@/lib/mock-data"
import type { GeneratedCard, SourceData } from "@/lib/ai"

// Flip to true AFTER connecting Supabase + running /scripts/001_init_schema.sql
const USE_SUPABASE = false

// ---------------------------------------------------------------------------
// Decks
// ---------------------------------------------------------------------------
export async function listDecks(): Promise<Deck[]> {
  if (USE_SUPABASE) {
    // const supabase = await createClient()
    // const { data, error } = await supabase
    //   .from("decks")
    //   .select("*, cards:cards(count), due:cards!inner(count).filter(due_at, lte, now())")
    //   .order("updated_at", { ascending: false })
    // if (error) throw error
    // return data as Deck[]
    throw new Error("Supabase not connected")
  }
  return mockDecks
}

export async function getDeck(id: string): Promise<Deck | null> {
  if (USE_SUPABASE) {
    // const supabase = await createClient()
    // const { data } = await supabase.from("decks").select("*").eq("id", id).maybeSingle()
    // return data
    throw new Error("Supabase not connected")
  }
  return mockDecks.find((d) => d.id === id) ?? null
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
export async function listDueCards(deckId: string): Promise<Flashcard[]> {
  if (USE_SUPABASE) {
    // const supabase = await createClient()
    // const { data } = await supabase
    //   .from("cards")
    //   .select("*")
    //   .eq("deck_id", deckId)
    //   .lte("due_at", new Date().toISOString())
    //   .order("due_at")
    // return data ?? []
    throw new Error("Supabase not connected")
  }
  return mockStudyCards.filter((c) => c.deckId === deckId)
}

/** Persist AI-generated cards into a deck. */
export async function saveGeneratedCards(
  deckId: string,
  cards: GeneratedCard[],
): Promise<void> {
  if (USE_SUPABASE) {
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) throw new Error("Not authenticated")
    // const rows = cards.map((c) => ({
    //   deck_id: deckId,
    //   user_id: user.id,
    //   question: c.question,
    //   answer: c.answer,
    // }))
    // const { error } = await supabase.from("cards").insert(rows)
    // if (error) throw error
    return
  }
  // no-op for mock
  return
}

/** Record an SM-2 review event. */
export async function recordReview(cardId: string, quality: number): Promise<void> {
  if (USE_SUPABASE) {
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) throw new Error("Not authenticated")
    // await supabase.from("reviews").insert({ card_id: cardId, user_id: user.id, quality })
    // // Also update the card's SM-2 fields:
    // await supabase.rpc("apply_sm2", { p_card_id: cardId, p_quality: quality })
    return
  }
  return
}

// ---------------------------------------------------------------------------
// Generations (token bookkeeping)
// ---------------------------------------------------------------------------
export async function recordGenerationInDb(args: {
  deckId?: string
  source: SourceData
  model: string
  cardsCount: number
  tokensInput: number
  tokensOutput: number
  costUsd: number
}): Promise<void> {
  if (USE_SUPABASE) {
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) throw new Error("Not authenticated")
    // await supabase.from("generations").insert({
    //   user_id: user.id,
    //   deck_id: args.deckId ?? null,
    //   model: args.model,
    //   source_type: args.source.type,
    //   source_ref: args.source.type === "url" ? args.source.url : null,
    //   cards_count: args.cardsCount,
    //   tokens_input: args.tokensInput,
    //   tokens_output: args.tokensOutput,
    //   cost_usd: args.costUsd,
    // })
    return
  }
  return
}

export async function monthlyUsage(): Promise<{ tokens: number; cards: number; costUsd: number } | null> {
  if (USE_SUPABASE) {
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return null
    // const { data } = await supabase
    //   .from("v_monthly_usage")
    //   .select("tokens_total, cards_total, cost_usd_total")
    //   .eq("user_id", user.id)
    //   .eq("month", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10))
    //   .maybeSingle()
    // if (!data) return { tokens: 0, cards: 0, costUsd: 0 }
    // return { tokens: data.tokens_total, cards: data.cards_total, costUsd: Number(data.cost_usd_total) }
    return null
  }
  return null
}
