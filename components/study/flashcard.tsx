"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import type { Flashcard } from "@/lib/mock-data"

type Props = {
  card: Flashcard
  flipped: boolean
  onFlip: () => void
  index: number
  total: number
}

/**
 * Premium flashcard — soft-rounded, glass, 3D rotateY flip.
 */
export function FlashcardView({ card, flipped, onFlip, index, total }: Props) {
  const { t } = useLanguage()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id + "-" + index}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.98,
          transition: { duration: 0.25 },
        }}
        className="w-full"
      >
        <button
          type="button"
          onClick={onFlip}
          aria-pressed={flipped}
          aria-label={t.study.flip}
          className="group w-full outline-none"
          style={{ perspective: 1800 }}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative h-[380px] w-full sm:h-[460px]")}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front — question */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col overflow-hidden rounded-3xl p-1",
                "syn-card",
              )}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              {/* soft indigo bloom */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 0%, hsl(262 83% 58% / 0.12), transparent 70%)",
                }}
              />

              <div className="relative flex items-center justify-between px-5 pb-3 pt-4 text-[11px] font-medium text-muted-foreground">
                <span className="text-primary">{t.generator.question}</span>
                <span className="tabnum">
                  {index + 1} / {total}
                </span>
              </div>

              <div className="relative flex flex-1 items-center justify-center px-6 py-6 sm:px-12">
                <p className="text-balance text-center font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
                  {card.question}
                </p>
              </div>

              <div className="relative flex items-center justify-between px-5 pb-4 pt-2 text-[11px] text-muted-foreground">
                <span>{t.deck.tapToStudy}</span>
                <span className="text-primary">Space to reveal</span>
              </div>
            </div>

            {/* Back — answer */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col overflow-hidden rounded-3xl p-1",
                "syn-card",
              )}
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 100%, hsl(262 80% 60% / 0.15), transparent 70%)",
                }}
              />

              <div className="relative flex items-center justify-between px-5 pb-3 pt-4 text-[11px] font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-primary ring-1 ring-primary/25">
                  {t.generator.answer}
                </span>
                <span className="tabnum text-muted-foreground">
                  {index + 1} / {total}
                </span>
              </div>

              <div className="relative flex flex-1 items-center justify-center px-6 py-6 sm:px-12">
                <p className="text-pretty text-center text-base leading-relaxed text-foreground md:text-xl">
                  {card.answer}
                </p>
              </div>

              <div className="relative px-5 pb-4 pt-2 text-center text-[11px] text-muted-foreground">
                Rate your recall · 1 · 2 · 3 · 4
              </div>
            </div>
          </motion.div>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
