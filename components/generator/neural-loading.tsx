"use client"

import { useLanguage } from "@/components/providers/language-provider"

// Nodes distributed in three layers to suggest a small neural network.
const LAYERS: { x: number; ys: number[] }[] = [
  { x: 60, ys: [60, 140, 220] },
  { x: 200, ys: [40, 100, 160, 220] },
  { x: 340, ys: [80, 160, 240] },
]

export function NeuralLoading() {
  const { t } = useLanguage()

  // Build lines between consecutive layers.
  const lines: { x1: number; y1: number; x2: number; y2: number; delay: number }[] = []
  for (let i = 0; i < LAYERS.length - 1; i++) {
    const a = LAYERS[i]
    const b = LAYERS[i + 1]
    a.ys.forEach((y1) => {
      b.ys.forEach((y2) => {
        lines.push({
          x1: a.x,
          y1,
          x2: b.x,
          y2,
          delay: Math.random() * 1.5,
        })
      })
    })
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <svg
        viewBox="0 0 400 300"
        role="img"
        aria-label="AI neural processing"
        className="h-56 w-full max-w-md"
      >
        <defs>
          <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#6366f1"
            strokeWidth="1"
            strokeOpacity="0.35"
            className="neural-line"
            style={{ animationDelay: `${l.delay}s` }}
          />
        ))}

        {LAYERS.flatMap((layer, li) =>
          layer.ys.map((y, ni) => (
            <g key={`${li}-${ni}`} style={{ animationDelay: `${(li * 0.3 + ni * 0.15).toFixed(2)}s` }}>
              <circle cx={layer.x} cy={y} r="16" fill="url(#node-glow)" className="neural-node" />
              <circle cx={layer.x} cy={y} r="5" fill="#6366f1" />
              <circle cx={layer.x} cy={y} r="2" fill="#fafafa" />
            </g>
          )),
        )}
      </svg>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium">{t.generator.processing}</p>
        <p className="max-w-sm text-xs text-muted-foreground">{t.generator.processingHint}</p>
      </div>
    </div>
  )
}
