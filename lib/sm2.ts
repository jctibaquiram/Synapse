// Minimal SM-2 implementation used by the Study Engine.
// See: https://super-memory.com/english/ol/sm2.htm

export type Rating = "again" | "hard" | "good" | "easy"

export type Sm2State = {
  easeFactor: number
  interval: number // days
  repetitions: number
}

const RATING_Q: Record<Rating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
}

export function applySm2(state: Sm2State, rating: Rating): Sm2State {
  const q = RATING_Q[rating]

  let { easeFactor, interval, repetitions } = state

  if (q < 3) {
    repetitions = 0
    interval = 0 // review again in the same session
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  )

  return { easeFactor, interval, repetitions }
}
