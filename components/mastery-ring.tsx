"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  value: number // 0..100
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

/**
 * Premium mastery ring — smooth animated stroke with a soft glow,
 * rounded strokeLinecap and a subtle inner label.
 */
export function MasteryRing({
  value,
  size = 48,
  strokeWidth = 3,
  className,
  showLabel = true,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const progress = useMotionValue(0)
  const offset = useTransform(progress, (p) => circumference - (p / 100) * circumference)

  React.useEffect(() => {
    const controls = animate(progress, clamped, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    })
    return controls.stop
  }, [clamped, progress])

  const stroke =
    clamped >= 90
      ? "hsl(142 70% 55%)"
      : clamped >= 60
        ? "hsl(262 83% 58%)"
        : clamped >= 30
          ? "hsl(262 80% 60%)"
          : "hsl(0 72% 55%)"

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Mastery ${clamped}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="hsla(0 0% 100% / 0.08)"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={stroke}
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            filter: `drop-shadow(0 0 4px ${stroke}88)`,
          }}
          fill="transparent"
        />
      </svg>
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="absolute text-[11px] font-semibold tabnum"
          style={{ color: stroke }}
        >
          {clamped}
        </motion.span>
      )}
    </div>
  )
}
