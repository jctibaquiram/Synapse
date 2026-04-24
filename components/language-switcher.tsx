"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Languages, ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { LOCALES } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage()
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  /* Compact: square icon button (lives inside the vertical rail). */
  if (compact) {
    return (
      <div className="relative" ref={wrapRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={t.common.language}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl text-muted-foreground",
            "transition-colors hover:bg-white/[0.04] hover:text-foreground press-98",
            open && "bg-white/[0.04] text-foreground",
          )}
        >
          <Languages className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.96 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{ opacity: 0, x: -4, scale: 0.98, transition: { duration: 0.14 } }}
              className={cn(
                "absolute bottom-0 left-[calc(100%+10px)] z-50 min-w-[200px] overflow-hidden rounded-2xl p-1.5",
                "syn-glass-strong shadow-2xl",
              )}
            >
              <div className="px-2 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {t.common.language}
              </div>
              {LOCALES.map((l, i) => {
                const active = l.code === locale
                return (
                  <motion.button
                    key={l.code}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                    onClick={() => {
                      setLocale(l.code)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "grid h-5 w-7 place-items-center rounded-md font-mono text-[10px] font-semibold tracking-wide",
                          active
                            ? "bg-primary/25 text-primary-foreground"
                            : "bg-white/[0.04] text-muted-foreground",
                        )}
                      >
                        {l.code.toUpperCase()}
                      </span>
                      <span>{l.label}</span>
                    </span>
                    {active && <Check className="h-4 w-4 text-primary" strokeWidth={2} />}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  /* Default: rounded pill with label (mobile / elsewhere). */
  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t.common.language}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground",
          "syn-glass transition-colors hover:text-foreground press-98",
        )}
      >
        <Languages className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="font-mono text-[11px] tracking-wide">{current.code.toUpperCase()}</span>
        <ChevronDown
          className={cn("h-3 w-3 opacity-70 transition-transform", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.14 } }}
            className={cn(
              "absolute right-0 top-[calc(100%+8px)] z-50 min-w-[200px] overflow-hidden rounded-2xl p-1.5",
              "syn-glass-strong shadow-2xl",
            )}
          >
            {LOCALES.map((l) => {
              const active = l.code === locale
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    setLocale(l.code)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-5 w-7 place-items-center rounded-md font-mono text-[10px] font-semibold tracking-wide",
                        active
                          ? "bg-primary/25 text-primary-foreground"
                          : "bg-white/[0.04] text-muted-foreground",
                      )}
                    >
                      {l.code.toUpperCase()}
                    </span>
                    <span>{l.label}</span>
                  </span>
                  {active && <Check className="h-4 w-4 text-primary" strokeWidth={2} />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
