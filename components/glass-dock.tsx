"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  CreditCard,
  Settings,
  Search,
} from "lucide-react"
import { motion } from "framer-motion"
import * as React from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"

/**
 * Premium glass sidebar.
 * - Fixed 72px rail, backdrop-blur, semi-transparent.
 * - Thin Lucide icons. Active state = indigo pill behind icon + glow.
 * - Language switcher lives at the bottom.
 */
export function GlassDock() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()

  const nav = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/generate", label: t.nav.generate, icon: Sparkles },
    { href: "/decks", label: t.nav.decks, icon: Layers },
    { href: "/pricing", label: t.nav.pricing, icon: CreditCard },
  ]

  const openCmd = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
  }

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className={cn(
        "fixed left-3 top-3 bottom-3 z-40 hidden w-[60px] flex-col items-center rounded-2xl",
        "syn-glass-strong md:flex",
      )}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <Link
        href="/"
        className="mt-3 grid h-10 w-10 place-items-center rounded-xl"
        aria-label="Synapse home"
        onClick={(e) => {
          if (pathname === "/") e.preventDefault()
        }}
      >
        <motion.div
          whileHover={{ rotate: -6, scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 16 }}
          className="grid h-9 w-9 place-items-center rounded-xl text-white"
          style={{
            background:
              "linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(262 75% 55%) 100%)",
            boxShadow: "0 8px 20px -8px hsl(262 83% 58% / 0.55)",
          }}
        >
          <SynapseMark />
        </motion.div>
      </Link>

      {/* Command launcher */}
      <button
        onClick={openCmd}
        aria-label={t.cmd.open}
        className={cn(
          "mt-4 grid h-10 w-10 place-items-center rounded-xl text-muted-foreground",
          "transition-colors hover:bg-white/[0.04] hover:text-foreground press-98",
        )}
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
      </button>

      {/* Nav */}
      <nav className="mt-4 flex flex-col items-center gap-1.5">
        {nav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-label={item.label}
              className={cn(
                "group relative grid h-10 w-10 place-items-center rounded-xl transition-colors",
                active
                  ? "text-white"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="dock-active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(262 75% 55%) 100%)",
                    boxShadow: "0 6px 18px -6px hsl(262 83% 58% / 0.6)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className="relative z-10 h-[18px] w-[18px]"
                strokeWidth={active ? 1.9 : 1.6}
              />

              {/* Tooltip */}
              <span
                className={cn(
                  "pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg",
                  "bg-popover/95 px-2.5 py-1.5 text-[11px] font-medium text-foreground",
                  "opacity-0 shadow-lg ring-1 ring-white/10 backdrop-blur-md",
                  "transition-opacity group-hover:opacity-100",
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer — language + settings */}
      <div className="mt-auto mb-3 flex flex-col items-center gap-1.5">
        <LanguageSwitcher compact />
        <button
          onClick={() => router.push("/pricing")}
          aria-label={t.nav.settings}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl text-muted-foreground",
            "transition-colors hover:bg-white/[0.04] hover:text-foreground press-98",
          )}
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
      </div>
    </motion.aside>
  )
}

/* Mobile top bar — glass, rounded */
export function MobileTopBar() {
  const { t } = useLanguage()
  return (
    <header
      className={cn(
        "sticky top-2 z-40 mx-3 flex h-12 items-center justify-between rounded-2xl px-3",
        "syn-glass-strong md:hidden",
      )}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg text-white"
          style={{
            background:
              "linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(262 75% 55%) 100%)",
          }}
        >
          <SynapseMark small />
        </div>
        <span className="font-display text-sm font-semibold tracking-tight">
          Synapse
        </span>
      </Link>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true }),
            )
          }
          className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-white/[0.04] hover:text-foreground press-98"
          aria-label={t.cmd.open}
        >
          <Search className="h-4 w-4" strokeWidth={1.6} />
        </button>
        <LanguageSwitcher compact />
      </div>
    </header>
  )
}

/* Custom mark — minimal synapse (two nodes + bridge) */
function SynapseMark({ small }: { small?: boolean }) {
  const size = small ? 14 : 16
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="3.5" cy="4" r="2" fill="currentColor" />
      <circle cx="12.5" cy="12" r="2" fill="currentColor" />
      <path
        d="M4.5 5.5 Q 8 8 11.5 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
