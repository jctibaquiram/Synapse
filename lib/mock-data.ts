// Mock data shaped like what Supabase will return from `flashcards` and `decks` tables.
// Replace with real Supabase queries once the integration is connected.

export type Deck = {
  id: string
  title: string
  description: string
  emoji: string
  totalCards: number
  dueCards: number
  mastery: number // 0..100
  accent: "indigo" | "emerald" | "amber" | "rose" | "sky"
  isPro?: boolean
}

export type Flashcard = {
  id: string
  deckId: string
  question: string
  answer: string
  // SM-2 fields
  easeFactor: number
  interval: number
  repetitions: number
  dueAt: string // ISO date
}

export const mockDecks: Deck[] = [
  {
    id: "neuroscience-101",
    title: "Neuroscience 101",
    description: "Neurons, synapses, and neurotransmitters.",
    emoji: "🧠",
    totalCards: 142,
    dueCards: 24,
    mastery: 78,
    accent: "indigo",
  },
  {
    id: "organic-chem",
    title: "Organic Chemistry",
    description: "Functional groups and reaction mechanisms.",
    emoji: "⚗️",
    totalCards: 98,
    dueCards: 12,
    mastery: 64,
    accent: "emerald",
  },
  {
    id: "spanish-b2",
    title: "Español B2",
    description: "Advanced vocabulary and idioms.",
    emoji: "🗣️",
    totalCards: 210,
    dueCards: 9,
    mastery: 91,
    accent: "amber",
  },
  {
    id: "constitutional-law",
    title: "Constitutional Law",
    description: "Landmark rulings and doctrines.",
    emoji: "⚖️",
    totalCards: 76,
    dueCards: 0,
    mastery: 100,
    accent: "rose",
    isPro: true,
  },
  {
    id: "macroeconomics",
    title: "Macroeconomics",
    description: "Policy, inflation, and growth models.",
    emoji: "📈",
    totalCards: 54,
    dueCards: 18,
    mastery: 42,
    accent: "sky",
  },
  {
    id: "anatomy-pro",
    title: "Human Anatomy",
    description: "Systems, structures, and landmarks.",
    emoji: "🫀",
    totalCards: 188,
    dueCards: 31,
    mastery: 55,
    accent: "indigo",
    isPro: true,
  },
]

export function getDeckById(id: string): Deck | undefined {
  return mockDecks.find((d) => d.id === id)
}

export const mockStudyCards: Flashcard[] = [
  {
    id: "c1",
    deckId: "neuroscience-101",
    question: "What is long-term potentiation (LTP)?",
    answer:
      "A persistent strengthening of synapses based on recent patterns of activity — a cellular mechanism underlying learning and memory.",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "c2",
    deckId: "neuroscience-101",
    question: "Name the three main parts of a neuron.",
    answer: "Dendrites (input), soma (cell body), and axon (output).",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "c3",
    deckId: "neuroscience-101",
    question: "Which neurotransmitter is most associated with reward and motivation?",
    answer: "Dopamine, especially via the mesolimbic pathway.",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "c4",
    deckId: "neuroscience-101",
    question: "What role do glial cells play?",
    answer:
      "They support, insulate (myelination), and maintain homeostasis around neurons — essential for proper signaling and repair.",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "c5",
    deckId: "neuroscience-101",
    question: "Define the action potential threshold.",
    answer:
      "The minimum depolarization (~ -55 mV) required to open voltage-gated Na⁺ channels and trigger an all-or-nothing nerve impulse.",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    dueAt: new Date().toISOString(),
  },
  {
    id: "c6",
    deckId: "neuroscience-101",
    question: "What is the function of the myelin sheath?",
    answer: "To insulate axons and enable saltatory conduction, dramatically increasing signal speed.",
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    dueAt: new Date().toISOString(),
  },
]
