"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Flame, ArrowRight, Target, TrendingUp, Play } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { AnimatedNumber } from "@/components/motion/primitives"
import { MasteryRing } from "@/components/mastery-ring"
import { type Deck } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const accentHue: Record<Deck["accent"], string> = {
  indigo: "hsl(262 83% 58%)",
  emerald: "hsl(152 65% 52%)",
  amber: "hsl(38 92% 60%)",
  rose: "hsl(346 80% 62%)",
  sky: "hsl(205 85% 62%)",
}

function greetingText(t: ReturnType<typeof useLanguage>["t"]) {
  const h = new Date().getHours()
  if (h < 12) return t.dashboard.greetingMorning
  if (h < 19) return t.dashboard.greetingAfternoon
  return t.dashboard.greetingEvening
}

/**
 * "The Next Step" hero — Netflix / Coursera "Continue Watching" inspired.
 * Surfaces the single most urgent deck as an immersive card with its
 * accent aura, big CTA, and the user's daily stats tucked on the right.
 */
export function WelcomeSection({
  userName,
  nextDeck,
  streak,
  retention,
  reviewedToday,
}: {
  userName?: string
  nextDeck: Deck | null
  streak: number
  retention: number
  reviewedToday: number
}) {
  const { t } = useLanguage()
  const greeting = greetingText(t)

  const hue = nextDeck ? accentHue[nextDeck.accent] : "hsl(262 83% 58%)"
  const href = nextDeck ? `/study/${nextDeck.id}` : "/generate"
  const dueCount = nextDeck?.dueCards ?? 0

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      }}
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "syn-card",
      )}
      aria-label={t.dashboard.upNext}
    >
      {/* Dynamic Aura — bleeds from the top-left, tinted by the deck accent */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        style={{
          background: `radial-gradient(65% 85% at 0% 0%, ${hue}28, transparent 62%), radial-gradient(50% 70% at 100% 100%, hsl(262 83% 58% / 0.12), transparent 65%)`,
        }}
      />

      {/* Subtle drifting specular highlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-60"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage: `radial-gradient(30% 25% at 20% 10%, ${hue}10, transparent 70%)`,
          backgroundSize: "200% 200%",
        }}
      />

      <div className="relative flex flex-col gap-8 p-6 md:flex-row md:items-stretch md:gap-10 md:p-10">
        {/* LEFT — hero deck "The Next Step" */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 18 }}
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: hue, boxShadow: `0 0 8px ${hue}` }}
            />
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.45 }}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t.dashboard.upNext}
              {userName ? ` · ${greeting}, ${userName}` : ""}
            </motion.p>
          </div>

          {nextDeck ? (
            <>
              <div className="mt-5 flex items-start gap-4">
                {/* Deck glyph */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.18, type: "spring", stiffness: 260, damping: 18 }}
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl md:h-16 md:w-16 md:text-3xl"
                  style={{
                    background: `${hue}22`,
                    boxShadow: `0 0 0 1px ${hue}33 inset, 0 20px 40px -16px ${hue}55`,
                  }}
                >
                  {nextDeck.emoji}
                </motion.div>

                <div className="min-w-0 flex-1">
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.5 }}
                    className="font-display text-3xl font-semibold leading-[1.05] tracking-tight text-balance md:text-[44px]"
                  >
                    {nextDeck.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45 }}
                    className="mt-2 line-clamp-2 max-w-xl text-sm text-muted-foreground md:text-[15px]"
                  >
                    {nextDeck.description}
                  </motion.p>
                </div>
              </div>

              {/* Meta strip */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.45 }}
                className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="tabnum font-semibold text-foreground">
                    <AnimatedNumber value={dueCount} duration={0.9} />
                  </span>
                  {t.dashboard.due}
                </span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-white/20" />
                <span className="inline-flex items-center gap-1.5">
                  <span className="tabnum font-semibold text-foreground">
                    {nextDeck.totalCards}
                  </span>
                  {t.dashboard.cards}
                </span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-white/20" />
                <span className="inline-flex items-center gap-2">
                  <MasteryRing value={nextDeck.mastery} size={20} strokeWidth={2.5} showLabel={false} />
                  <span className="tabnum font-semibold text-foreground">
                    {nextDeck.mastery}%
                  </span>
                  {t.dashboard.mastery}
                </span>
              </motion.div>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, duration: 0.5 }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={href}
                    className={cn(
                      "group inline-flex h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-semibold",
                      "syn-btn-primary",
                    )}
                  >
                    <Play className="h-4 w-4 fill-current" strokeWidth={0} />
                    {t.dashboard.studyCards(dueCount > 0 ? dueCount : nextDeck.totalCards)}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.2}
                    />
                  </Link>
                </motion.div>
                <Link
                  href="/generate"
                  className={cn(
                    "inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-medium text-foreground",
                    "bg-white/[0.03] ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.06]",
                  )}
                >
                  {t.nav.generate}
                </Link>
              </motion.div>
            </>
          ) : (
            <NoDueState message={t.dashboard.noDueDecks} cta={t.nav.generate} />
          )}
        </div>

        {/* RIGHT — stats column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-row gap-3 md:w-[280px] md:flex-col md:gap-3"
        >
          <StatTile
            icon={Flame}
            value={streak}
            label={t.dashboard.streak}
            delay={0.55}
            accent="warning"
          />
          <StatTile
            icon={TrendingUp}
            value={retention}
            suffix="%"
            label={t.dashboard.retention}
            delay={0.63}
            accent="primary"
          />
          <StatTile
            icon={Target}
            value={reviewedToday}
            label={t.dashboard.reviewedToday}
            delay={0.71}
            accent="success"
          />
        </motion.div>
      </div>
    </motion.section>
  )
}

function NoDueState({ message, cta }: { message: string; cta: string }) {
  return (
    <div className="mt-8 flex flex-col gap-5">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        {message}
      </h1>
      <Link
        href="/generate"
        className={cn(
          "inline-flex h-12 w-fit items-center gap-2 rounded-xl px-6 text-sm font-semibold",
          "syn-btn-primary",
        )}
      >
        {cta}
        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
      </Link>
    </div>
  )
}

function StatTile({
  icon: Icon,
  value,
  label,
  suffix,
  delay,
  accent,
}: {
  icon: React.ElementType
  value: number
  label: string
  suffix?: string
  delay: number
  accent: "primary" | "success" | "warning"
}) {
  const accentHsl =
    accent === "primary"
      ? "hsl(262 83% 58%)"
      : accent === "success"
        ? "hsl(142 70% 50%)"
        : "hsl(38 92% 60%)"

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative flex-1 overflow-hidden rounded-2xl p-4",
        "bg-white/[0.025] ring-1 ring-white/[0.06] backdrop-blur-md transition-colors",
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{
            background: `color-mix(in oklch, ${accentHsl} 18%, transparent)`,
            color: accentHsl,
          }}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-semibold tabnum text-foreground">
        <AnimatedNumber value={value} suffix={suffix ?? ""} />
      </div>
      <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </div>
    </motion.div>
  )
}
