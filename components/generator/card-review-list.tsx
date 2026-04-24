"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Pencil, RefreshCw, Trash2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/providers/language-provider"
import type { GeneratedCard } from "@/lib/ai"

type Props = {
  cards: GeneratedCard[]
  onChange: (cards: GeneratedCard[]) => void
  onRegenerate: (id: string) => Promise<void> | void
}

export function CardReviewList({ cards, onChange, onRegenerate }: Props) {
  const { t } = useLanguage()

  return (
    <motion.ul layout className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {cards.map((card, i) => (
          <motion.li
            key={card.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            <ReviewItem
              index={i + 1}
              card={card}
              onSave={(updated) =>
                onChange(cards.map((c) => (c.id === updated.id ? updated : c)))
              }
              onDelete={() => onChange(cards.filter((c) => c.id !== card.id))}
              onRegenerate={() => onRegenerate(card.id)}
            />
          </motion.li>
        ))}
      </AnimatePresence>
      {cards.length === 0 ? (
        <li className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
          {t.generator.emptyReview}
        </li>
      ) : null}
    </motion.ul>
  )
}

function ReviewItem({
  index,
  card,
  onSave,
  onDelete,
  onRegenerate,
}: {
  index: number
  card: GeneratedCard
  onSave: (c: GeneratedCard) => void
  onDelete: () => void
  onRegenerate: () => Promise<void> | void
}) {
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [q, setQ] = useState(card.question)
  const [a, setA] = useState(card.answer)
  const [regenerating, setRegenerating] = useState(false)

  async function handleRegenerate() {
    setRegenerating(true)
    try {
      await onRegenerate()
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="glass group rounded-2xl p-4 transition-shadow hover:shadow-[0_20px_60px_-30px_rgba(99,102,241,0.5)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-pink/20 text-[11px] font-semibold tabular-nums text-primary ring-1 ring-primary/30">
          {index}
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex flex-col gap-2">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t.generator.question}
                </label>
                <Textarea
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  rows={2}
                  className="mt-1 rounded-lg bg-white/5 text-sm ring-1 ring-white/10"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t.generator.answer}
                </label>
                <Textarea
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  rows={3}
                  className="mt-1 rounded-lg bg-white/5 text-sm ring-1 ring-white/10"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium leading-snug">{card.question}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{card.answer}</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          {editing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="press-95 h-8 w-8 text-success hover:text-success"
                onClick={() => {
                  onSave({ ...card, question: q, answer: a })
                  setEditing(false)
                }}
                aria-label={t.generator.save}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="press-95 h-8 w-8"
                onClick={() => {
                  setQ(card.question)
                  setA(card.answer)
                  setEditing(false)
                }}
                aria-label={t.generator.cancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="press-95 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setEditing(true)}
                aria-label={t.generator.edit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="press-95 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleRegenerate}
                disabled={regenerating}
                aria-label={t.generator.regenerate}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="press-95 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
                aria-label={t.generator.delete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
