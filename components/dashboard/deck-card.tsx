"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Sparkles, ArrowUpRight, Lock } from "lucide-react"
import { MasteryRing } from "@/components/mastery-ring"
import { useLanguage } from "@/components/providers/language-provider"
import { mockStudyCards, type Deck } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const accentMap: Record<Deck["accent"], { hue: string; label: string }> = {
  indigo: { hue: "hsl(262 83% 58%)", label: "Indigo" },
  emerald: { hue: "hsl(152 65% 52%)", label: "Emerald" },
  amber: { hue: "hsl(38 92% 60%)", label: "Amber" },
  rose: { hue: "hsl(346 80% 62%)", label: "Rose" },
  sky: { hue: "hsl(205 85% 62%)", label: "Sky" },
}

type Props = {
  deck: Deck
  featured?: boolean
  onProClick?: (deck: Deck) => void
}

/**
 * Premium deck card.
 * - Soft rounded-2xl (24px), subtle glass + indigo border glow on hover.
 * - Spring scale 1.02 on hover.
 * - Inline "quick preview" of 2 questions when hovered.
 */
export function DeckCard({ deck, featured, onProClick }: Props) {
  const { t } = useLanguage()
  const [hovered, setHovered] = React.useState(false)
  const palette = accentMap[deck.accent]

  const sampleQuestions = React.useMemo(() => {
    const forDeck = mockStudyCards.filter((c) => c.deckId === deck.id)
    const sample = (forDeck.length ? forDeck : mockStudyCards).slice(0, 2)
    return sample.map((c) => c.question)
  }, [deck.id])

  const href = `/study/${deck.id}`
  const lockedPro = !!deck.isPro

  const handleClick = (e: React.MouseEvent) => {
    if (lockedPro && onProClick) {
      e.preventDefault()
      onProClick(deck)
    }
  }

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22, mass: 0.6 }}
      className={cn("group relative h-full", featured && "md:col-span-2")}
    >
      <Link
        href={href}
        onClick={handleClick}
        className="block h-full focus-visible:outline-none"
        aria-label={`${t.nav.study} — ${deck.title}`}
      >
        <div
          className={cn(
            "relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-3xl p-6",
            "syn-card syn-card-hover",
          )}
        >
          {/* Accent color bloom (subtle, corner) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 blur-3xl transition-opacity group-hover:opacity-100"
            style={{ background: `${palette.hue}22` }}
          />

          {/* Header row */}
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <motion.div
                whileHover={{ rotate: -4, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
                style={{
                  background: `${palette.hue}1c`,
                  boxShadow: `0 0 0 1px ${palette.hue}33 inset`,
                }}
              >
                {deck.emoji}
              </motion.div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[17px] font-semibold leading-tight tracking-tight text-foreground">
                    {deck.title}
                  </h3>
                  {lockedPro && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-primary/25">
                      <Lock className="h-2.5 w-2.5" strokeWidth={2.2} />
                      {t.dashboard.pro}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">
                  {deck.description}
                </p>
              </div>
            </div>
            <MasteryRing value={deck.mastery} size={44} strokeWidth={3} />
          </div>

          {/* Stats row */}
          <div className="relative mt-6 grid grid-cols-3 gap-2">
            <Stat value={deck.totalCards} label={t.dashboard.cards} />
            <Stat value={deck.dueCards} label={t.dashboard.due} highlight={deck.dueCards > 0} />
            <Stat value={`${deck.mastery}%`} label={t.dashboard.mastery} />
          </div>

          {/* Mastery progress bar */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>{t.dashboard.mastery}</span>
              <span className="tabnum text-foreground">{deck.mastery}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${deck.mastery}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${palette.hue} 0%, hsl(262 80% 65%) 100%)`,
                  boxShadow: `0 0 12px -2px ${palette.hue}88`,
                }}
              />
            </div>
          </div>

          {/* Preview + footer */}
          <div className="relative mt-5 flex-1">
            <AnimatePresence mode="wait">
              {hovered && !lockedPro ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  }}
                  exit={{ opacity: 0, y: 4, transition: { duration: 0.15 } }}
                  className="flex flex-col gap-1.5"
                >
                  <div className="text-[11px] font-medium text-muted-foreground">
                    {t.deck.quickPreview}
                  </div>
                  {sampleQuestions.map((q, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i, duration: 0.25 }}
                      className="line-clamp-1 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-muted-foreground ring-1 ring-white/[0.04]"
                    >
                      {q}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer CTA */}
          <div className="relative mt-5 flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              {t.deck.tapToStudy}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all",
                lockedPro
                  ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                  : "bg-white/[0.04] text-foreground ring-1 ring-white/[0.06] group-hover:bg-primary/15 group-hover:text-primary group-hover:ring-primary/25",
              )}
            >
              {lockedPro ? (
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              ) : (
                <Play className="h-3 w-3 fill-current" strokeWidth={0} />
              )}
              {t.dashboard.continueStudy}
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2}
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Stat({
  value,
  label,
  highlight,
}: {
  value: number | string
  label: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl bg-white/[0.025] px-3 py-2.5 ring-1 ring-white/[0.05]">
      <div
        className={cn(
          "font-display text-lg font-semibold tabnum",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  )
}
