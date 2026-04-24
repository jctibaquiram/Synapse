"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Premium SaaS page transition — smooth crossfade with a slight vertical lift.
 * Inspired by Linear.app & Apple Health. No hard clips, no flashes.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        exit={{
          opacity: 0,
          y: -8,
          filter: "blur(4px)",
          transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
        }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
