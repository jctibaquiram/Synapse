"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { DeckCard } from "@/components/dashboard/deck-card"
import { NewDeckDialog } from "@/components/dashboard/new-deck-dialog"
import { PricingModal } from "@/components/pricing/pricing-modal"
import { useLanguage } from "@/components/providers/language-provider"
import { mockDecks, type Deck } from "@/lib/mock-data"

export default function DecksPage() {
  const { t } = useLanguage()
  const [proModalOpen, setProModalOpen] = useState(false)

  const handleProClick = (_deck: Deck) => setProModalOpen(true)

  return (
    <AppShell>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t.nav.decks}</h1>
            <p className="text-sm text-muted-foreground">
              {mockDecks.length} {t.dashboard.yourDecks.toLowerCase()}
            </p>
          </div>
          <NewDeckDialog />
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onProClick={handleProClick} />
          ))}
        </div>
      </div>

      <PricingModal open={proModalOpen} onOpenChange={setProModalOpen} />
    </AppShell>
  )
}
