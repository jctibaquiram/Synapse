// Synapse — AI generation placeholder.
// In production this function calls a Supabase Edge Function that proxies OpenAI.
//
// Production shape (to implement when OpenAI/Supabase is connected):
//
//   const { data, error } = await supabase.functions.invoke("generate-cards", {
//     body: { sourceData, targetLanguage, count },
//   })
//
// The Edge Function should use a System Prompt similar to:
//   "You are an expert in mnemonics and spaced-repetition pedagogy.
//    Generate N high-quality flashcards as strict JSON: [{ question, answer }].
//    Language of output: [targetLanguage].
//    Rules: atomic concepts, no duplicates, answer under 2 sentences,
//    prefer cloze-style for definitions."
//
// Then persist via:  supabase.from("flashcards").insert(rows)

import type { Locale } from "@/lib/i18n"

export type GeneratedCard = {
  id: string
  question: string
  answer: string
}

export type SourceData =
  | { type: "text"; text: string }
  | { type: "url"; url: string }
  | { type: "pdf"; fileName: string; size: number }

type GenerateOptions = {
  count?: number
  signal?: AbortSignal
}

const SAMPLE_QA: Record<Locale, { q: string; a: string }[]> = {
  en: [
    { q: "Define spaced repetition.", a: "A learning technique where reviews are scheduled at increasing intervals to exploit the spacing effect." },
    { q: "What does the SM-2 algorithm adjust after each review?", a: "The ease factor, interval, and repetition count — determining when the card appears next." },
    { q: "Why does active recall outperform re-reading?", a: "Retrieving information strengthens memory traces far more than passive exposure." },
    { q: "What is the testing effect?", a: "Long-term retention improves when learners are tested on material rather than simply restudying it." },
    { q: "Describe the forgetting curve.", a: "Ebbinghaus showed memory decays exponentially over time without reinforcement." },
    { q: "What makes a flashcard 'atomic'?", a: "It tests a single, indivisible fact — making retrieval unambiguous and fast." },
    { q: "When should you use cloze deletion?", a: "For definitions, dates, and context-rich facts where the surrounding sentence aids retrieval." },
    { q: "Why interleave topics during study?", a: "Interleaving forces discrimination between concepts and improves transfer to novel problems." },
    { q: "What is desirable difficulty?", a: "A level of challenge that slows initial learning but strengthens long-term retention." },
    { q: "How does sleep consolidate memory?", a: "Slow-wave and REM sleep replay and stabilize neural patterns encoded during the day." },
  ],
  es: [
    { q: "Define la repetición espaciada.", a: "Técnica que programa repasos en intervalos crecientes para aprovechar el efecto de espaciamiento." },
    { q: "¿Qué ajusta el algoritmo SM-2 tras cada repaso?", a: "El factor de facilidad, el intervalo y el número de repeticiones; determinan el próximo repaso." },
    { q: "¿Por qué el recuerdo activo supera a la relectura?", a: "Recuperar información refuerza las huellas de memoria mucho más que la exposición pasiva." },
    { q: "¿Qué es el efecto de la evaluación?", a: "La retención a largo plazo mejora cuando te evalúan en vez de solo releer el material." },
    { q: "Describe la curva del olvido.", a: "Ebbinghaus mostró que la memoria decae exponencialmente sin refuerzo." },
    { q: "¿Qué hace 'atómica' a una tarjeta?", a: "Evalúa un único hecho indivisible, haciendo la recuperación inequívoca y veloz." },
    { q: "¿Cuándo usar cloze deletion?", a: "En definiciones, fechas y hechos con contexto donde la frase ayuda a recuperar el dato." },
    { q: "¿Por qué intercalar temas al estudiar?", a: "Obliga a discriminar entre conceptos y mejora la transferencia a problemas nuevos." },
    { q: "¿Qué es la dificultad deseable?", a: "Un reto que ralentiza el aprendizaje inicial pero fortalece la retención a largo plazo." },
    { q: "¿Cómo consolida la memoria el sueño?", a: "El sueño de ondas lentas y REM reproduce y estabiliza los patrones neuronales del día." },
  ],
  pt: [
    { q: "Defina repetição espaçada.", a: "Técnica que agenda revisões em intervalos crescentes para explorar o efeito de espaçamento." },
    { q: "O que o algoritmo SM-2 ajusta após cada revisão?", a: "O fator de facilidade, o intervalo e a repetição — determinam a próxima revisão." },
    { q: "Por que a recordação ativa supera a releitura?", a: "Recuperar informação fortalece os traços de memória muito mais do que a exposição passiva." },
    { q: "O que é o efeito do teste?", a: "A retenção a longo prazo melhora quando o aluno é testado em vez de apenas reestudar." },
    { q: "Descreva a curva do esquecimento.", a: "Ebbinghaus mostrou que a memória decai exponencialmente sem reforço." },
    { q: "O que torna um cartão 'atômico'?", a: "Testa um único fato indivisível, tornando a recuperação inequívoca e rápida." },
    { q: "Quando usar cloze deletion?", a: "Em definições, datas e fatos contextuais onde a frase ajuda a recuperar o dado." },
    { q: "Por que intercalar tópicos durante o estudo?", a: "Obriga a discriminar conceitos e melhora a transferência para problemas novos." },
    { q: "O que é dificuldade desejável?", a: "Um desafio que retarda o aprendizado inicial, mas fortalece a retenção a longo prazo." },
    { q: "Como o sono consolida a memória?", a: "O sono de ondas lentas e REM reproduz e estabiliza os padrões neurais do dia." },
  ],
}

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(t)
      reject(new DOMException("Aborted", "AbortError"))
    })
  })
}

/**
 * generateCards — simulates an OpenAI call via a Supabase Edge Function.
 * Replace the body with a real `supabase.functions.invoke(...)` once connected.
 */
export async function generateCards(
  sourceData: SourceData,
  targetLanguage: Locale,
  options: GenerateOptions = {},
): Promise<GeneratedCard[]> {
  const count = options.count ?? 8
  // Simulate network + model latency
  await delay(2400, options.signal)

  const pool = SAMPLE_QA[targetLanguage]
  const picks = Array.from({ length: count }).map((_, i) => pool[i % pool.length])

  return picks.map((p, i) => ({
    id: `gen-${Date.now()}-${i}`,
    question: p.q,
    answer: p.a,
  }))
}

/**
 * generateCardsStream — emits each card as soon as the "model" produces it.
 * In production this would wrap a Server-Sent Events / ReadableStream response
 * from the Edge Function.
 */
export async function generateCardsStream(
  sourceData: SourceData,
  targetLanguage: Locale,
  onCard: (card: GeneratedCard, index: number, total: number) => void,
  options: GenerateOptions = {},
): Promise<GeneratedCard[]> {
  const count = options.count ?? 8
  const pool = SAMPLE_QA[targetLanguage]
  const out: GeneratedCard[] = []

  // Initial warm-up delay (simulates first token latency)
  await delay(900, options.signal)

  for (let i = 0; i < count; i++) {
    // Jittered per-card latency
    await delay(280 + Math.random() * 220, options.signal)
    const p = pool[i % pool.length]
    const card: GeneratedCard = {
      id: `gen-${Date.now()}-${i}`,
      question: p.q,
      answer: p.a,
    }
    out.push(card)
    onCard(card, i, count)
  }

  // Small settle delay
  await delay(300, options.signal)
  return out
}
