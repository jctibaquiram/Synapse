"use client"

import { motion, AnimatePresence } from "framer-motion"
import * as React from "react"
import { useLanguage } from "@/components/providers/language-provider"
import { cn } from "@/lib/utils"

function seeded(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Premium retention heatmap.
 * - Rounded cells, dark gray → indigo color scale.
 * - Sleek hover tooltip (date + stats), Apple-Health style.
 */
function levelStyle(level: number): React.CSSProperties {
  // 0 → 4 ramp from subtle gray to vivid indigo
  const colors = [
    "hsla(240, 4%, 16%, 0.9)",  // empty-ish
    "hsla(244, 45%, 35%, 0.65)",
    "hsla(244, 65%, 48%, 0.80)",
    "hsla(244, 78%, 58%, 0.92)",
    "hsla(244, 85%, 66%, 1)",
  ]
  return {
    background: colors[level] ?? colors[0],
    boxShadow: level >= 3 ? "0 0 0 1px hsla(244, 80%, 66%, 0.35)" : undefined,
  }
}

type Cell = {
  v: number
  key: string
  w: number
  d: number
  level: number
  reviewed: number
  retention: number
  date: Date
}

function stepLevel(v: number) {
  if (v < 0.08) return 0
  if (v < 0.28) return 1
  if (v < 0.52) return 2
  if (v < 0.78) return 3
  return 4
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function formatDate(d: Date, locale: string) {
  try {
    return d.toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  } catch {
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`
  }
}

export function NeuralHeatmap({
  weeks = 16,
  days = 7,
  compact = false,
  title,
  subtitle,
}: {
  weeks?: number
  days?: number
  compact?: boolean
  title?: string
  subtitle?: string
}) {
  const { t, locale } = useLanguage()
  const headerTitle = title ?? t.heatmap.title
  const headerSubtitle = subtitle ?? t.heatmap.subtitle

  const cells = React.useMemo<Cell[]>(() => {
    const now = new Date()
    const arr: Cell[] = []
    const totalDays = weeks * days
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const base = seeded(w * 7 + d)
        const recencyBoost = (w / weeks) * 0.45
        const weekend = d === 5 || d === 6 ? -0.15 : 0
        const v = Math.max(0, Math.min(1, base * 0.7 + recencyBoost + weekend))
        const daysAgo = totalDays - 1 - (w * days + d)
        const date = new Date(now)
        date.setDate(date.getDate() - daysAgo)
        const reviewed = Math.round(v * 48)
        const retention = Math.round(70 + v * 29)
        arr.push({ v, key: `${w}-${d}`, w, d, level: stepLevel(v), reviewed, retention, date })
      }
    }
    return arr
  }, [weeks, days])

  const [hover, setHover] = React.useState<Cell | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const onCellHover = (cell: Cell, e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setHover(cell)
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className={cn("flex flex-col", compact ? "gap-3 p-5 md:p-6" : "gap-4")}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "font-display font-semibold tracking-tight",
              compact ? "text-sm" : "text-base",
            )}
          >
            {headerTitle}
          </div>
          <div
            className={cn(
              "mt-0.5 text-muted-foreground",
              compact ? "text-[11px]" : "text-[12px]",
            )}
          >
            {headerSubtitle}
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
          </span>
          Active
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn("relative", compact && "overflow-x-auto no-scrollbar")}
        onMouseLeave={() => setHover(null)}
      >
        <div
          className={cn("grid", compact ? "gap-[4px]" : "gap-[5px]")}
          style={{
            gridTemplateColumns: compact
              ? `repeat(${weeks}, 14px)`
              : `repeat(${weeks}, minmax(0, 1fr))`,
          }}
          role="img"
          aria-label={headerTitle}
        >
          {Array.from({ length: weeks }).map((_, w) => (
            <div
              key={w}
              className={cn("flex flex-col", compact ? "gap-[4px]" : "gap-[5px]")}
            >
              {Array.from({ length: days }).map((_, d) => {
                const idx = w * days + d
                const cell = cells[idx]
                return (
                  <motion.div
                    key={cell.key}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        delay: (w * days + d) * 0.004,
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    }}
                    whileHover={{ scale: 1.25, zIndex: 10 }}
                    onMouseMove={(e) => onCellHover(cell, e)}
                    onFocus={(e) => onCellHover(cell, e as unknown as React.MouseEvent)}
                    className="aspect-square w-full rounded-[4px] ring-1 ring-white/[0.03] cursor-pointer"
                    style={levelStyle(cell.level)}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-none absolute z-20 -translate-x-1/2 rounded-xl px-3 py-2",
                "syn-glass-strong shadow-2xl",
              )}
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 68,
                minWidth: 160,
              }}
            >
              <div className="text-[11px] font-medium text-muted-foreground">
                {formatDate(hover.date, locale)}
              </div>
              <div className="mt-1 flex items-center justify-between gap-3 text-[12px]">
                <span className="text-foreground">
                  <span className="font-semibold tabnum">{hover.reviewed}</span>{" "}
                  <span className="text-muted-foreground">{t.dashboard.cards.toLowerCase()}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-primary">
                  <span className="font-semibold tabnum">{hover.retention}%</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={cn(
          "flex items-center justify-between pt-1 text-[11px] text-muted-foreground",
          compact && "pt-0",
        )}
      >
        {!compact ? (
          <div className="flex items-center gap-2">
            {DAY_LABELS.filter((_, i) => i % 2 === 0).map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        ) : (
          <span className="tabnum">{weeks} weeks</span>
        )}
        <div className="flex items-center gap-1.5">
          <span>{t.heatmap.legendLess}</span>
          <div className="flex items-center gap-[3px]">
            {[0, 1, 2, 3, 4].map((l) => (
              <div
                key={l}
                className={cn(
                  "rounded-[3px]",
                  compact ? "h-2 w-2" : "h-2.5 w-2.5",
                )}
                style={levelStyle(l)}
              />
            ))}
          </div>
          <span>{t.heatmap.legendMore}</span>
        </div>
      </div>
    </div>
  )
}
