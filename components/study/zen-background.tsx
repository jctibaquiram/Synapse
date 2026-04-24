"use client"

import { motion } from "framer-motion"

/**
 * Zen / focus background — slow drifting indigo-violet aura + deep vignette.
 * Premium calm, aligned with the Aura theme used globally.
 */
export function ZenBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Slow drifting aura */}
      <motion.div
        initial={{ x: "-4%", y: "-2%", scale: 1 }}
        animate={{ x: "4%", y: "3%", scale: 1.08 }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute inset-[-20%]"
        style={{
          filter: "blur(90px) saturate(130%)",
          opacity: 0.6,
          background:
            "radial-gradient(40% 35% at 22% 28%, hsl(262 83% 58% / 0.35), transparent 70%), radial-gradient(45% 40% at 78% 72%, hsl(262 80% 60% / 0.30), transparent 72%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 45%, transparent 35%, hsl(240 10% 3.9% / 0.85) 95%)",
        }}
      />
    </div>
  )
}
