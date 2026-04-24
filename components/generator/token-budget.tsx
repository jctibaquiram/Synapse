"use client"

import { motion } from "framer-motion"
import { Info, Sparkles, Zap, TrendingUp } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import { useUsage } from "@/components/providers/usage-provider"
import {
  AI_MODEL,
  estimateGeneration,
  formatTokens,
  formatUsd,
  nextResetDate,
} from "@/lib/usage"
import type { SourceData } from "@/lib/ai"

type Props = {
  source: SourceData | null
  cardCount: number
}

export function TokenBudget({ source, cardCount }: Props) {
  const { t, locale } = useLanguage()
  const { plan, tokensUsed, cardsGenerated, tokenLimit, cardLimit, tokensRemaining, cardsRemaining } =
    useUsage()

  const estimate = estimateGeneration(source, cardCount)
  const tokensPerCard = Math.max(
    1,
    Math.round(estimate.totalTokens / Math.max(1, cardCount)),
  )

  const overBudget =
    tokensRemaining != null && estimate.maxTokens > tokensRemaining

  // Progress % for the monthly bar.
  const pct =
    tokenLimit == null
      ? 0
      : Math.min(100, Math.round((tokensUsed / tokenLimit) * 100))

  const approxRemainingCards =
    cardsRemaining != null
      ? cardsRemaining
      : tokensRemaining != null
        ? Math.max(0, Math.floor(tokensRemaining / tokensPerCard))
        : null

  return (
    <TooltipProvider delayDuration={120}>
      <motion.section
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className={cn(
          "relative overflow-hidden rounded-2xl p-5 md:p-6",
          "border border-white/[0.08] bg-white/[0.02]",
        )}
        aria-label={t.usage.title}
      >
        {/* Accent sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, hsl(262 83% 58% / 0.6) 50%, transparent 100%)",
          }}
        />

        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold tracking-tight">
                {t.usage.title}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={t.usage.learnMore}
                    className="rounded-full p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground"
                  >
                    <Info className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                  {t.usage.tooltipTokens}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t.usage.subtitle}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
              {t.usage.model}
            </div>
            <div className="mt-0.5 font-mono text-[11px] font-medium text-foreground/90">
              {AI_MODEL.label}
            </div>
          </div>
        </header>

        {/* Per-generation row */}
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <EstimateCell
            icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />}
            label={t.usage.estimated}
            tokens={estimate.totalTokens}
            cost={estimate.estimatedCostUsd}
            highlight
          />
          <EstimateCell
            icon={<TrendingUp className="h-3.5 w-3.5" strokeWidth={2.2} />}
            label={t.usage.maxPossible}
            tokens={estimate.maxTokens}
            cost={estimate.maxCostUsd}
          />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
              <span>{t.usage.cost}</span>
            </div>
            <div className="mt-1 font-display text-lg font-semibold tabnum leading-none">
              {formatUsd(estimate.estimatedCostUsd)}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              {t.usage.breakdown(cardCount, tokensPerCard)}
            </div>
          </div>
        </div>

        {/* Monthly usage */}
        <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/90">
                {t.usage.monthlyUsage}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                  plan === "pro"
                    ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                    : "bg-white/[0.06] text-muted-foreground ring-1 ring-white/[0.08]",
                )}
              >
                {plan === "pro" ? t.pricing.pro : t.pricing.free}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {t.usage.resetsOn(nextResetDate(locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR"))}
            </span>
          </div>

          {tokenLimit == null ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary ring-1 ring-primary/20">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              {t.usage.proNoLimit}
            </div>
          ) : (
            <>
              <div className="mt-3 flex items-baseline justify-between text-[12px] tabnum">
                <span className="text-foreground/90">
                  <span className="font-semibold">{formatTokens(tokensUsed)}</span>
                  <span className="text-muted-foreground"> / {formatTokens(tokenLimit)} {t.usage.tokens}</span>
                </span>
                <span className="text-muted-foreground">{pct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 18 }}
                  className={cn(
                    "h-full rounded-full",
                    pct < 70
                      ? "bg-gradient-to-r from-primary to-accent"
                      : pct < 90
                        ? "bg-gradient-to-r from-amber-400 to-primary"
                        : "bg-gradient-to-r from-rose-500 to-amber-400",
                  )}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">
                  {t.usage.remaining}:{" "}
                  <span className="font-medium text-foreground/90 tabnum">
                    {formatTokens(tokensRemaining ?? 0)}
                  </span>
                </span>
                {approxRemainingCards != null ? (
                  <span className="text-muted-foreground">
                    {t.usage.remainingCards(approxRemainingCards)}
                  </span>
                ) : null}
              </div>
              {cardLimit != null ? (
                <div className="mt-2 text-[10.5px] text-muted-foreground/80 tabnum">
                  {t.usage.used}: {cardsGenerated} / {cardLimit} {t.dashboard.cards}
                </div>
              ) : null}
            </>
          )}

          {overBudget ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-[11px] text-destructive"
            >
              {t.generator.overBudget}
            </motion.div>
          ) : null}
        </div>
      </motion.section>
    </TooltipProvider>
  )
}

function EstimateCell({
  icon,
  label,
  tokens,
  cost,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  tokens: number
  cost: number
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        highlight
          ? "border-primary/25 bg-primary/[0.06]"
          : "border-white/[0.06] bg-white/[0.02]",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px]",
          highlight ? "text-primary" : "text-muted-foreground",
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-lg font-semibold tabnum leading-none">
          {formatTokens(tokens)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          tokens
        </span>
      </div>
      <div className="mt-1 text-[11px] tabnum text-muted-foreground">{formatUsd(cost)}</div>
    </div>
  )
}
