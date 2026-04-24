"use client"

import type { ReactNode } from "react"
import { GlassDock, MobileTopBar } from "@/components/glass-dock"
import { CommandMenu } from "@/components/command-menu"
import { PageTransition } from "@/components/motion/page-transition"

/**
 * Premium SaaS shell.
 * - Solid dark #09090b base (no grid).
 * - Slow-moving indigo/violet radial aura for depth & calm.
 * - Glass sidebar on desktop, glass top bar on mobile.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Aura — slow moving radial gradient */}
      <div aria-hidden className="syn-aura" />
      <div aria-hidden className="syn-noise absolute inset-0 z-0" />

      <GlassDock />
      <CommandMenu />

      <div className="relative z-10 flex min-h-screen flex-col md:pl-[72px]">
        <MobileTopBar />
        <main className="flex-1 min-w-0 px-4 pb-24 pt-4 md:px-10 md:pt-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
