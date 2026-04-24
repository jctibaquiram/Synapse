"use client"

import { AnimatePresence, motion } from "framer-motion"
import * as React from "react"

export type BurstTone = "good" | "easy"

export type Burst = {
  id: number
  x: number
  y: number
  tone: BurstTone
}

const PALETTE: Record<BurstTone, string[]> = {
  good: ["hsl(262 83% 58%)", "hsl(262 80% 60%)", "hsl(0 0% 96%)"],
  easy: ["hsl(142 70% 55%)", "hsl(262 83% 58%)", "hsl(0 0% 96%)"],
}

export function ParticleBurst({ bursts }: { bursts: Burst[] }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {bursts.map((b) => (
          <BurstGroup key={b.id} burst={b} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function BurstGroup({ burst }: { burst: Burst }) {
  const particles = React.useMemo(() => {
    const colors = PALETTE[burst.tone]
    const n = 28
    return Array.from({ length: n }).map((_, i) => {
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.3
      const dist = 90 + Math.random() * 160
      return {
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 4 + Math.random() * 6,
        rotate: (Math.random() - 0.5) * 360,
        color: colors[i % colors.length],
        duration: 0.7 + Math.random() * 0.5,
      }
    })
  }, [burst.tone])

  const ringColor = burst.tone === "easy" ? "hsl(142 70% 55%)" : "hsl(262 83% 58%)"

  return (
    <div
      className="absolute"
      style={{ left: burst.x, top: burst.y, transform: "translate(-50%, -50%)" }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.dx,
            y: p.dy,
            scale: [0, 1.2, 1, 0],
            opacity: [1, 1, 0.9, 0],
            rotate: p.rotate,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: p.duration, ease: [0.22, 1, 0.36, 1] }}
          className="absolute block rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
      {/* Soft concentric rings */}
      <motion.span
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 2.8, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 100,
          height: 100,
          border: `2px solid ${ringColor}`,
          boxShadow: `0 0 20px ${ringColor}`,
        }}
      />
      <motion.span
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 70,
          height: 70,
          border: `2px solid ${ringColor}`,
        }}
      />
    </div>
  )
}
