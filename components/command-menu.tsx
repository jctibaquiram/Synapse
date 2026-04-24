"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  CreditCard,
  Search,
  Play,
  Languages,
  ChevronRight,
} from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { mockDecks } from "@/lib/mock-data"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

type CmdItem = {
  id: string
  label: string
  hint?: string
  icon: React.ElementType
  onSelect: () => void
  group: "nav" | "deck" | "action"
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const router = useRouter()
  const { t, setLocale, locale } = useLanguage()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  const items = React.useMemo<CmdItem[]>(() => {
    const nav: CmdItem[] = [
      { id: "n1", label: t.nav.dashboard, icon: LayoutDashboard, group: "nav", onSelect: () => router.push("/") },
      { id: "n2", label: t.nav.generate, icon: Sparkles, group: "nav", onSelect: () => router.push("/generate") },
      { id: "n3", label: t.nav.decks, icon: Layers, group: "nav", onSelect: () => router.push("/decks") },
      { id: "n4", label: t.nav.pricing, icon: CreditCard, group: "nav", onSelect: () => router.push("/pricing") },
    ]
    const decks: CmdItem[] = mockDecks.map((d) => ({
      id: `d-${d.id}`,
      label: `${t.cmd.study} · ${d.title}`,
      hint: `${d.dueCards} ${t.dashboard.due}`,
      icon: Play,
      group: "deck",
      onSelect: () => router.push(`/study/${d.id}`),
    }))
    const langs: CmdItem[] = (["en", "es", "pt"] as const)
      .filter((l) => l !== locale)
      .map((l) => ({
        id: `l-${l}`,
        label: `${t.cmd.switchTo} ${l.toUpperCase()}`,
        icon: Languages,
        group: "action",
        onSelect: () => setLocale(l),
      }))
    return [...nav, ...decks, ...langs]
  }, [t, router, locale, setLocale])

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase()),
  )

  const groups: Array<{ key: CmdItem["group"]; label: string }> = [
    { key: "nav", label: t.cmd.navigation },
    { key: "deck", label: t.cmd.decks },
    { key: "action", label: t.cmd.actions },
  ]

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filtered[active]
      if (item) {
        item.onSelect()
        setOpen(false)
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="absolute inset-0 bg-background/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-label="Command menu"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full max-w-xl overflow-hidden rounded-2xl",
              "syn-glass-strong shadow-2xl",
            )}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.98,
              transition: { duration: 0.18 },
            }}
          >
            {/* Gradient accent on top edge */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, hsl(262 83% 58% / 0.8) 50%, transparent 100%)",
              }}
            />

            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={handleKey}
                placeholder={t.cmd.placeholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Kbd className="bg-white/[0.05] border-white/10 text-muted-foreground">Esc</Kbd>
            </div>

            <div className="h-px bg-white/5" />

            <div className="max-h-[50vh] overflow-y-auto p-1.5">
              {groups.map((g) => {
                const rows = filtered.filter((i) => i.group === g.key)
                if (!rows.length) return null
                return (
                  <div key={g.key} className="mb-1 last:mb-0">
                    <div className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {g.label}
                    </div>
                    <ul>
                      {rows.map((item) => {
                        const idx = filtered.indexOf(item)
                        const isActive = idx === active
                        const Icon = item.icon
                        return (
                          <li key={item.id}>
                            <button
                              onMouseEnter={() => setActive(idx)}
                              onClick={() => {
                                item.onSelect()
                                setOpen(false)
                              }}
                              className={cn(
                                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                                isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {isActive && (
                                <motion.span
                                  layoutId="cmd-active-pill"
                                  className="absolute inset-0 rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08]"
                                  transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                  }}
                                />
                              )}
                              <Icon
                                className={cn(
                                  "relative z-10 h-4 w-4 shrink-0",
                                  isActive ? "text-primary" : "",
                                )}
                                strokeWidth={1.8}
                              />
                              <span className="relative z-10 flex-1 truncate">
                                {item.label}
                              </span>
                              {item.hint && (
                                <span className="relative z-10 text-[11px] font-normal text-muted-foreground">
                                  {item.hint}
                                </span>
                              )}
                              <ChevronRight
                                className={cn(
                                  "relative z-10 h-3.5 w-3.5 shrink-0 transition-all",
                                  isActive
                                    ? "text-primary translate-x-0.5"
                                    : "opacity-0",
                                )}
                                strokeWidth={2}
                              />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
              {!filtered.length && (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {t.cmd.empty}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/5 px-4 py-2.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Kbd className="bg-white/[0.05] border-white/10">↑</Kbd>
                  <Kbd className="bg-white/[0.05] border-white/10">↓</Kbd>
                  {t.cmd.navigate}
                </span>
                <span className="flex items-center gap-1">
                  <Kbd className="bg-white/[0.05] border-white/10">↵</Kbd>
                  {t.cmd.select}
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Kbd className="bg-white/[0.05] border-white/10">⌘</Kbd>
                <Kbd className="bg-white/[0.05] border-white/10">K</Kbd>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
