"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, ArrowLeft, Save } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { SourceInput } from "@/components/generator/source-input"
import { FocusOverlay } from "@/components/generator/focus-overlay"
import { CardReviewList } from "@/components/generator/card-review-list"
import { TokenBudget } from "@/components/generator/token-budget"
import { useLanguage } from "@/components/providers/language-provider"
import { useUsage } from "@/components/providers/usage-provider"
import { LOCALES, type Locale } from "@/lib/i18n"
import { generateCardsStream, type GeneratedCard, type SourceData } from "@/lib/ai"
import { estimateGeneration } from "@/lib/usage"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Stage = "input" | "processing" | "review"

export default function GeneratorPage() {
  const { t, locale } = useLanguage()
  const { tokensRemaining, recordGeneration } = useUsage()
  const [stage, setStage] = useState<Stage>("input")
  const [source, setSource] = useState<SourceData | null>(null)
  const [outputLanguage, setOutputLanguage] = useState<Locale>(locale)
  const [cardCount, setCardCount] = useState(8)
  const [cards, setCards] = useState<GeneratedCard[]>([])
  const [streamed, setStreamed] = useState<GeneratedCard[]>([])
  const [saving, setSaving] = useState(false)

  const estimate = estimateGeneration(source, cardCount)
  const overBudget =
    tokensRemaining != null && estimate.maxTokens > tokensRemaining
  const canGenerate = !!source && !overBudget

  async function handleGenerate() {
    if (!source) return
    setStage("processing")
    setStreamed([])
    try {
      const final = await generateCardsStream(
        source,
        outputLanguage,
        (card) => {
          setStreamed((prev) => [...prev, card])
        },
        { count: cardCount },
      )
      setTimeout(() => {
        setCards(final)
        setStage("review")
      }, 500)
    } catch (err) {
      toast.error((err as Error).message)
      setStage("input")
    }
  }

  async function handleRegenerate(id: string) {
    if (!source) return
    const collected: GeneratedCard[] = []
    await generateCardsStream(
      source,
      outputLanguage,
      (card) => collected.push(card),
      { count: 1 },
    )
    const [replacement] = collected
    if (replacement) {
      setCards((prev) => prev.map((c) => (c.id === id ? { ...replacement, id } : c)))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      // TODO: persist with Supabase via `lib/data/repository.ts`
      //   await saveGeneratedCards(deckId, cards)
      //   await recordGenerationInDb({ tokens: estimate.totalTokens, cards: cards.length })
      await new Promise((r) => setTimeout(r, 600))
      // Transparently decrement the user's monthly quota using the estimate
      // that was shown in the UI before generation (honest accounting).
      recordGeneration(estimate.totalTokens, cards.length)
      toast.success(t.generator.cardsGenerated)
      setStage("input")
      setCards([])
      setSource(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <FocusOverlay
        open={stage === "processing"}
        source={source}
        cards={streamed}
        total={cardCount}
      />

      <motion.div
        animate={{
          opacity: stage === "processing" ? 0.3 : 1,
          filter: stage === "processing" ? "blur(4px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "mx-auto flex max-w-4xl flex-col gap-8",
          stage === "processing" && "pointer-events-none",
        )}
      >
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/25">
              <Sparkles className="h-3 w-3" strokeWidth={2.2} /> AI
            </span>
            <span className="inline-flex items-center rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-white/[0.08]">
              {t.generator.proBadge}
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            {t.generator.title}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground md:text-base">
            {t.generator.subtitle}
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {stage === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className={cn(
                "flex flex-col gap-6 overflow-hidden rounded-3xl p-6 md:p-8",
                "syn-card",
              )}
            >
              <SourceInput value={source} onChange={setSource} />

              <div className="grid gap-5 border-t border-white/[0.06] pt-6 md:grid-cols-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="output-lang">{t.generator.outputLanguage}</FieldLabel>
                    <Select value={outputLanguage} onValueChange={(v) => setOutputLanguage(v as Locale)}>
                      <SelectTrigger
                        id="output-lang"
                        className="h-10 w-full rounded-xl border-white/10 bg-white/[0.03]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 bg-popover/95 backdrop-blur-xl">
                        {LOCALES.map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            <span className="mr-2" aria-hidden>{l.flag}</span>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="card-count">{t.generator.cardCount}</Label>
                      <motion.span
                        key={cardCount}
                        initial={{ scale: 1.25 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm font-semibold tabnum text-primary"
                      >
                        {cardCount}
                      </motion.span>
                    </div>
                    <Slider
                      id="card-count"
                      min={4}
                      max={20}
                      step={1}
                      value={[cardCount]}
                      onValueChange={(v) => setCardCount(v[0])}
                    />
                  </Field>
                </FieldGroup>
              </div>

              <TokenBudget source={source} cardCount={cardCount} />

              <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/[0.06] pt-6 md:flex-row md:items-center">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                  <span className="tabnum">
                    ~{estimate.totalTokens.toLocaleString()} {t.usage.tokens}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: canGenerate ? 1.02 : 1 }}
                  whileTap={{ scale: canGenerate ? 0.97 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold",
                    "syn-btn-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
                  )}
                >
                  <Sparkles className="h-4 w-4" strokeWidth={2.2} />
                  {overBudget ? t.generator.upgradeToGenerate : t.generator.generate}
                </motion.button>
              </div>
            </motion.div>
          )}

          {stage === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStage("input")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.06] hover:text-foreground press-98"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  {t.generator.cancel}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.03] px-3 py-2 text-xs font-medium ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.06] press-98"
                  >
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                    {t.generator.regenerate}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || cards.length === 0}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                      "syn-btn-primary disabled:opacity-40 disabled:shadow-none",
                    )}
                  >
                    {saving ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                    {t.generator.save}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {t.generator.reviewTitle}
                </h2>
                <p className="text-sm text-muted-foreground">{t.generator.reviewSubtitle}</p>
              </div>

              <CardReviewList cards={cards} onChange={setCards} onRegenerate={handleRegenerate} />

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving || cards.length === 0}
                  className={cn(
                    "inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold",
                    "syn-btn-primary disabled:opacity-40 disabled:shadow-none",
                  )}
                >
                  {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" strokeWidth={2.2} />}
                  {t.generator.save} ({cards.length})
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppShell>
  )
}
