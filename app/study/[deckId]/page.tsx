"use client"

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, Trophy } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { LanguageSwitcher } from "@/components/language-switcher"
import { FlashcardView } from "@/components/study/flashcard"
import { SrsButtons } from "@/components/study/srs-buttons"
import { ZenBackground } from "@/components/study/zen-background"
import { ParticleBurst, type Burst } from "@/components/study/particle-burst"
import { useLanguage } from "@/components/providers/language-provider"
import { getDeckById, mockStudyCards, type Flashcard } from "@/lib/mock-data"
import { applySm2, type Rating } from "@/lib/sm2"
import { cn } from "@/lib/utils"

// NOTE: Focus Mode renders WITHOUT <AppShell>. Sidebar + global chrome are hidden.
// Supabase: supabase.from("flashcards").select("*").eq("deck_id", deckId).lte("due_at", now)

export default function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params)
  const { t } = useLanguage()

  const deck = getDeckById(deckId)
  const initialCards = useMemo(
    () => mockStudyCards.filter((c) => c.deckId === deckId),
    [deckId],
  )
  const seedCards = initialCards.length > 0 ? initialCards : mockStudyCards

  const [queue, setQueue] = useState<Flashcard[]>(seedCards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [bursts, setBursts] = useState<Burst[]>([])
  const burstId = useRef(0)
  const total = seedCards.length

  const current = queue[index]
  const done = !current

  const flip = useCallback(() => setFlipped((f) => !f), [])

  const triggerBurst = (rating: Rating, center: { x: number; y: number }) => {
    if (rating !== "good" && rating !== "easy") return
    const id = ++burstId.current
    setBursts((b) => [...b, { id, x: center.x, y: center.y, tone: rating }])
    setTimeout(() => {
      setBursts((b) => b.filter((x) => x.id !== id))
    }, 1400)
  }

  const handleRate = useCallback(
    (rating: Rating, center: { x: number; y: number } = { x: window.innerWidth / 2, y: window.innerHeight / 2 }) => {
      if (!current || !flipped) return
      const nextState = applySm2(
        {
          easeFactor: current.easeFactor,
          interval: current.interval,
          repetitions: current.repetitions,
        },
        rating,
      )
      // TODO: await supabase.from("flashcards").update({ ...nextState, due_at }).eq("id", current.id)
      triggerBurst(rating, center)
      setReviewed((n) => n + 1)

      if (rating === "again") {
        setQueue((q) => {
          const rest = q.slice(index + 1)
          const before = q.slice(0, index)
          return [...before, ...rest, { ...current, ...nextState }]
        })
      } else {
        setIndex((i) => i + 1)
      }
      setFlipped(false)
    },
    [current, flipped, index],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === "Space") {
        e.preventDefault()
        flip()
        return
      }
      if (!flipped) return
      const map: Record<string, Rating> = { "1": "again", "2": "hard", "3": "good", "4": "easy" }
      const r = map[e.key]
      if (r) {
        const center = { x: window.innerWidth / 2, y: window.innerHeight * 0.8 }
        handleRate(r, center)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [flip, handleRate, flipped])

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <ZenBackground />
      <ParticleBurst bursts={bursts} />

      {/* Glass focus-mode top bar */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative z-10 mx-3 mt-3 flex items-center justify-between rounded-2xl px-4 py-2.5",
          "syn-glass-strong",
        )}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground",
              "bg-white/[0.03] ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.06] hover:text-foreground press-98",
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            {t.study.exit}
          </Link>
          <span className="h-5 w-px bg-white/10" aria-hidden />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-medium text-muted-foreground">
              Focus session
            </span>
            <span className="mt-0.5 font-display text-sm font-semibold tracking-tight">
              {deck?.title ?? "Synapse"}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-xs text-muted-foreground tabnum">
            <span className="text-foreground font-semibold">
              {Math.min(reviewed + 1, total)}
            </span>
            <span className="mx-1 text-white/20">/</span>
            <span>{total}</span>
          </span>
          <LanguageSwitcher />
        </div>
      </motion.header>

      {/* Progress bar — smooth gradient fill */}
      <div className="relative z-10 mx-3 mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? (reviewed / total) * 100 : 0}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "linear-gradient(90deg, hsl(262 83% 58%) 0%, hsl(262 80% 60%) 100%)",
            boxShadow: "0 0 12px hsl(262 83% 58% / 0.45)",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
        {done ? (
          <SessionComplete reviewed={reviewed} />
        ) : (
          <>
            <FlashcardView
              card={current}
              flipped={flipped}
              onFlip={flip}
              index={index}
              total={total}
            />

            <AnimatePresence mode="wait">
              {flipped ? (
                <motion.div
                  key="rate"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
                  <SrsButtons onRate={handleRate} />
                </motion.div>
              ) : (
                <motion.div
                  key="show"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex w-full flex-col items-center gap-3"
                >
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    onClick={flip}
                    className={cn(
                      "group inline-flex min-w-[280px] items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-sm font-semibold",
                      "syn-btn-primary",
                    )}
                  >
                    {t.study.showAnswer}
                    <Kbd className="border-white/20 bg-white/10 text-white">Space</Kbd>
                  </motion.button>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    {t.study.shortcuts}:
                    <Kbd className="border-white/10 bg-white/[0.05]">1</Kbd>
                    <Kbd className="border-white/10 bg-white/[0.05]">2</Kbd>
                    <Kbd className="border-white/10 bg-white/[0.05]">3</Kbd>
                    <Kbd className="border-white/10 bg-white/[0.05]">4</Kbd>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  )
}

function SessionComplete({ reviewed }: { reviewed: number }) {
  const { t } = useLanguage()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
      }}
      className={cn(
        "relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl",
        "syn-card",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, hsl(142 70% 50% / 0.18), transparent 65%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5 p-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
          className="grid h-20 w-20 place-items-center rounded-3xl"
          style={{
            background: "linear-gradient(135deg, hsl(142 70% 50% / 0.2), hsl(262 83% 58% / 0.2))",
            boxShadow: "0 0 0 1px hsla(0, 0%, 100%, 0.06) inset",
          }}
        >
          <Trophy className="h-9 w-9 text-success" strokeWidth={2} />
        </motion.div>
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {t.study.sessionComplete}
          </h2>
          <p className="text-sm text-muted-foreground">{t.study.sessionStats}</p>
        </div>
        <div className="inline-flex items-center gap-2.5 rounded-full bg-primary/10 px-4 py-2 ring-1 ring-primary/20">
          <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
          <span className="tabnum font-semibold text-foreground">{reviewed}</span>
          <span className="text-xs text-muted-foreground">cards reviewed</span>
        </div>
        <Link
          href="/"
          className={cn(
            "mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold",
            "syn-btn-primary",
          )}
        >
          {t.study.backToDashboard}
        </Link>
      </div>
    </motion.div>
  )
}
