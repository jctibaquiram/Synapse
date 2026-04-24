"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  CreditCard,
  Settings,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"

export function AppSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const nav = [
    { href: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/generate", label: t.nav.generate, icon: Sparkles },
    { href: "/decks", label: t.nav.decks, icon: Layers },
    { href: "/pricing", label: t.nav.pricing, icon: CreditCard },
  ]

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 px-5 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
          <Zap className="h-4 w-4 text-primary" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">Synapse</span>
          <span className="text-[10px] text-muted-foreground">{t.tagline}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span>{t.nav.settings}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </aside>
  )
}

export function MobileTopBar() {
  const { t } = useLanguage()
  return (
    <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
          <Zap className="h-4 w-4 text-primary" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight">Synapse</span>
      </Link>
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
      </div>
      <span className="sr-only">{t.tagline}</span>
    </header>
  )
}
