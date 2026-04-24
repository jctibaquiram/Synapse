"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { DeckCard } from "@/components/dashboard/deck-card"
import { NewDeckDialog } from "@/components/dashboard/new-deck-dialog"
import { PricingModal } from "@/components/pricing/pricing-modal"
import { NeuralHeatmap } from "@/components/neural-heatmap"
import { useLanguage } from "@/components/providers/language-provider"
import { staggerContainer, staggerItem } from "@/components/motion/primitives"
import { mockDecks, type Deck } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

// NOTE: When Supabase is connected, replace mockDecks with:
//   const { data } = await supabase.from("decks").select("*").eq("user_id", user.id)
// Gate by supabase.auth.getUser() and RLS policies on subscription tier.

export default function DashboardPage() {
  const { t } = useLanguage()
  const [proModalOpen, setProModalOpen] = useState(false)

  // "The Next Step" — pick the deck with the highest due count.
  // Tie-breaker: lower mastery wins. Skip locked Pro decks.
  const nextDeck: Deck | null = useMemo(() => {
    const candidates = mockDecks.filter((d) => !d.isPro && d.dueCards > 0)
    if (candidates.length === 0) {
      const any = mockDecks.find((d) => !d.isPro)
      return any ?? null
    }
    return [...candidates].sort((a, b) => {
      if (b.dueCards !== a.dueCards) return b.dueCards - a.dueCards
      return a.mastery - b.mastery
    })[0]
  }, [])

  const handleProClick = (_deck: Deck) => {
    setProModalOpen(true)
  }

  // Put the "next" deck first and featured; keep other decks in original order.
  const orderedDecks = useMemo(() => {
    if (!nextDeck) return mockDecks
    return [nextDeck, ...mockDecks.filter((d) => d.id !== nextDeck.id)]
  }, [nextDeck])

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <WelcomeSection
          userName="Daniela"
          nextDeck={nextDeck}
          streak={14}
          retention={92}
          reviewedToday={37}
        />

        {/* Decks — Bento grid */}
        <section className="flex flex-col gap-5">
          <header className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {t.dashboard.yourDecks}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mockDecks.length} active ·{" "}
                {mockDecks.reduce((s, d) => s + d.totalCards, 0)} cards total
              </p>
            </div>
            <NewDeckDialog />
          </header>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {orderedDecks.map((deck, i) => (
              <motion.div key={deck.id} variants={staggerItem}>
                <DeckCard deck={deck} featured={i === 0} onProClick={handleProClick} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Compact "Progress" widget — heatmap tucked discreetly at the bottom */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className={cn("rounded-3xl", "syn-card")}
          aria-label={t.dashboard.statsTitle}
        >
          <NeuralHeatmap
            title={t.dashboard.statsTitle}
            subtitle={t.dashboard.statsSubtitle}
            compact
          />
        </motion.section>
      </div>

      <PricingModal open={proModalOpen} onOpenChange={setProModalOpen} />
    </AppShell>
  )
}
