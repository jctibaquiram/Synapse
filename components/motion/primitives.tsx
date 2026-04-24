"use client"

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  type HTMLMotionProps,
  type MotionValue,
} from "framer-motion"
import * as React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* TiltCard — soft 3D tilt with indigo glare (premium feel)            */
/* ------------------------------------------------------------------ */
interface TiltCardProps extends HTMLMotionProps<"div"> {
  maxTilt?: number
  glare?: boolean
}

export function TiltCard({
  children,
  className,
  maxTilt = 4,
  glare = true,
  ...props
}: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const sx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 180, damping: 22, mass: 0.5 })

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt])
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt])

  const glareX = useTransform(sx, [0, 1], ["0%", "100%"])
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"])
  const glareBg = useMotionTemplate`radial-gradient(55% 55% at ${glareX} ${glareY}, hsla(244, 80%, 70%, 0.18), transparent 70%)`

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }
  const handleLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative will-change-transform", className)}
      {...props}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          style={{ background: glareBg, borderRadius: "inherit" }}
          className="pointer-events-none absolute inset-0 mix-blend-screen"
        />
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Stagger helpers — smooth premium easing                             */
/* ------------------------------------------------------------------ */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ------------------------------------------------------------------ */
/* AnimatedNumber — buttery tabular ticker                             */
/* ------------------------------------------------------------------ */
export function AnimatedNumber({
  value,
  duration = 1.1,
  className,
  suffix = "",
  prefix = "",
}: {
  value: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}) {
  const [display, setDisplay] = React.useState(0)
  React.useEffect(() => {
    const start = performance.now()
    const from = display
    const to = value
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <span className={cn("tabnum", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Typewriter — reveals text char by char (no caret)                   */
/* ------------------------------------------------------------------ */
export function Typewriter({
  text,
  speed = 22,
  className,
}: {
  text: string
  speed?: number
  className?: string
  /** Legacy brutalist caret flag — ignored in premium build. */
  caret?: boolean
}) {
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    setI(0)
    const id = setInterval(() => {
      setI((v) => {
        if (v >= text.length) {
          clearInterval(id)
          return v
        }
        return v + 1
      })
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return <span className={cn(className)}>{text.slice(0, i)}</span>
}

/* ------------------------------------------------------------------ */
/* MousePos hook                                                       */
/* ------------------------------------------------------------------ */
export function useCardSpotlight(): {
  ref: React.RefObject<HTMLDivElement | null>
  mx: MotionValue<number>
  my: MotionValue<number>
} {
  const ref = React.useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      mx.set(e.clientX - rect.left)
      my.set(e.clientY - rect.top)
    }
    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [mx, my])

  return { ref, mx, my }
}
