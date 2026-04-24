"use client"

import { AnimatePresence, motion } from "framer-motion"
import { FileText, Link2, Type, Sparkles } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import type { GeneratedCard, SourceData } from "@/lib/ai"

/**
 * Focus Mode overlay used while the AI is generating cards.
 * - Dims and blurs the background.
 * - Shows a 3D-scanning animation over the source icon.
 * - Streams cards into a floating stack on the right.
 */
export function FocusOverlay({
  open,
  source,
  cards,
  total,
}: {
  open: boolean
  source: SourceData | null
  cards: GeneratedCard[]
  total: number
}) {
  const { t } = useLanguage()

  const SourceIcon =
    source?.type === "pdf" ? FileText : source?.type === "url" ? Link2 : Type

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-live="polite"
          aria-busy="true"
        >
          {/* Dim + blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/70"
            style={{ backdropFilter: "blur(20px)" }}
          />

          <div className="relative flex h-full flex-col items-center justify-center gap-8 px-6 md:flex-row md:gap-16">
            {/* 3D scanning document */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 24 }}
              className="relative"
            >
              <motion.div
                animate={{ rotateY: [-12, 12, -12], rotateX: [6, -2, 6] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
                style={{ transformStyle: "preserve-3d", transformPerspective: 1000 }}
                className="relative flex h-64 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-card to-background shadow-[0_40px_120px_-30px_rgba(99,102,241,0.7)] ring-1 ring-white/10"
              >
                <SourceIcon className="h-16 w-16 text-primary/70" strokeWidth={1.2} />

                {/* Scanning bars — horizontal sweep */}
                <motion.div
                  className="absolute inset-x-4 h-[2px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #6366f1, #ec4899, transparent)",
                    boxShadow: "0 0 20px rgba(99,102,241,0.9)",
                  }}
                  animate={{ top: ["8%", "92%", "8%"] }}
                  transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
                />

                {/* Grid lines — vertical sweeps */}
                <motion.div
                  className="absolute inset-y-4 w-[1px]"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(99,102,241,0.6), transparent)",
                  }}
                  animate={{ left: ["10%", "90%", "10%"] }}
                  transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
                />

                {/* Corner brackets */}
                {[
                  { top: 8, left: 8, rotate: 0 },
                  { top: 8, right: 8, rotate: 90 },
                  { bottom: 8, right: 8, rotate: 180 },
                  { bottom: 8, left: 8, rotate: 270 },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
                    className="absolute h-4 w-4 border-l-2 border-t-2 border-primary"
                    style={{ ...pos, transform: `rotate(${pos.rotate}deg)` }}
                  />
                ))}
              </motion.div>

              {/* Pulsing ring */}
              <motion.div
                className="absolute -inset-10 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(99,102,241,0.25), transparent 70%)",
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
              />
            </motion.div>

            {/* Status + card stack */}
            <div className="flex w-full max-w-sm flex-col gap-5">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/30">
                  <Sparkles className="h-3 w-3" />
                  {t.generator.processing.replace("…", "")}
                </div>
                <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
                  {t.generator.processing}
                </h2>
                <p className="text-pretty text-sm text-muted-foreground">
                  {t.generator.processingHint}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-pink"
                      animate={{ width: `${(cards.length / Math.max(total, 1)) * 100}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 24 }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {cards.length} / {total}
                  </span>
                </div>
              </motion.div>

              {/* Flying card stack */}
              <div className="relative h-48">
                <AnimatePresence>
                  {cards.slice(-5).map((card, i, arr) => {
                    const depth = arr.length - 1 - i
                    return (
                      <motion.div
                        key={card.id}
                        initial={{
                          opacity: 0,
                          x: -260,
                          y: -40,
                          rotate: -18,
                          scale: 0.7,
                          filter: "blur(10px)",
                        }}
                        animate={{
                          opacity: 1 - depth * 0.15,
                          x: depth * 8,
                          y: depth * 6,
                          rotate: depth * 2,
                          scale: 1 - depth * 0.04,
                          filter: "blur(0px)",
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 22 }}
                        className="glass-strong absolute inset-0 flex flex-col gap-1.5 rounded-2xl p-4"
                        style={{ zIndex: 50 - depth }}
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">
                          Q
                        </span>
                        <p className="line-clamp-2 text-sm font-medium leading-snug">
                          {card.question}
                        </p>
                        <div className="h-px bg-white/10" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-pink">
                          A
                        </span>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {card.answer}
                        </p>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
