"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Kbd } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import type { Rating } from "@/lib/sm2"

type Props = {
  onRate: (r: Rating, center: { x: number; y: number }) => void
  disabled?: boolean
}

type Tone = "destructive" | "warning" | "primary" | "success"

const TONE: Record<Tone, { bg: string; fg: string; ring: string; hover: string }> = {
  destructive: {
    bg: "bg-destructive/12",
    fg: "text-destructive",
    ring: "ring-destructive/30",
    hover: "hover:bg-destructive/20 hover:ring-destructive/50",
  },
  warning: {
    bg: "bg-warning/12",
    fg: "text-warning",
    ring: "ring-warning/30",
    hover: "hover:bg-warning/20 hover:ring-warning/50",
  },
  primary: {
    bg: "bg-primary/15",
    fg: "text-primary",
    ring: "ring-primary/30",
    hover: "hover:bg-primary/25 hover:ring-primary/50",
  },
  success: {
    bg: "bg-success/12",
    fg: "text-success",
    ring: "ring-success/30",
    hover: "hover:bg-success/20 hover:ring-success/50",
  },
}

export function SrsButtons({ onRate, disabled }: Props) {
  const { t } = useLanguage()

  const buttons: {
    rating: Rating
    label: string
    hint: string
    shortcut: string
    tone: Tone
  }[] = [
    { rating: "again", label: t.study.again, hint: t.study.againHint, shortcut: "1", tone: "destructive" },
    { rating: "hard", label: t.study.hard, hint: t.study.hardHint, shortcut: "2", tone: "warning" },
    { rating: "good", label: t.study.good, hint: t.study.goodHint, shortcut: "3", tone: "primary" },
    { rating: "easy", label: t.study.easy, hint: t.study.easyHint, shortcut: "4", tone: "success" },
  ]

  const handleClick = (rating: Rating, e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget as HTMLButtonElement
    const rect = el.getBoundingClientRect()
    onRate(rating, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {buttons.map((b, i) => {
          const tone = TONE[b.tone]
          return (
            <Tooltip key={b.rating}>
              <TooltipTrigger asChild>
                <motion.button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => handleClick(b.rating, e)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={cn(
                    "relative flex h-20 flex-col items-center justify-center gap-0.5 rounded-2xl px-3",
                    "ring-1 backdrop-blur-md transition-all disabled:opacity-40",
                    tone.bg,
                    tone.ring,
                    tone.hover,
                  )}
                >
                  <span className={cn("font-display text-base font-semibold", tone.fg)}>
                    {b.label}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {b.hint.split("—")[0].trim()}
                  </span>
                  <Kbd className="absolute right-2 top-2 border-white/10 bg-white/[0.05] text-[10px] text-muted-foreground">
                    {b.shortcut}
                  </Kbd>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-lg border-white/10 bg-popover/95 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs">
                  <span>{b.hint}</span>
                  <Kbd className="border-white/10 bg-white/[0.06]">{b.shortcut}</Kbd>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
