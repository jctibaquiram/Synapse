"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/components/providers/language-provider"

/**
 * Thin top ticker strip: shows active route + live clock + build hash.
 * Pure decorative / informational, animates on route change.
 */
export function StatusTicker() {
  const pathname = usePathname()
  const { t, locale } = useLanguage()
  const [now, setNow] = React.useState<string>("--:--:--")

  React.useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNow(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`,
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const routeLabel = React.useMemo(() => {
    if (pathname === "/") return t.nav.dashboard
    if (pathname.startsWith("/generate")) return t.nav.generate
    if (pathname.startsWith("/decks")) return t.nav.decks
    if (pathname.startsWith("/pricing")) return t.nav.pricing
    if (pathname.startsWith("/study")) return t.nav.study ?? "STUDY"
    return pathname
  }, [pathname, t])

  return (
    <div className="sticky top-0 z-30 hidden h-7 w-full items-center justify-between border-b border-border bg-background/80 px-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur md:flex">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 bg-primary" />
          </span>
          SYN //  ONLINE
        </span>
        <span className="hidden lg:inline">BUILD 0x{Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0").toUpperCase()}</span>
        <span className="hidden lg:inline">LOCALE {locale.toUpperCase()}</span>
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={routeLabel}
          initial={{ opacity: 0, x: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          <span className="text-muted-foreground/60">ROUTE</span>
          <span className="text-foreground">&gt; {routeLabel}</span>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-4">
        <span className="tabnum text-foreground">{now}</span>
      </div>
    </div>
  )
}
