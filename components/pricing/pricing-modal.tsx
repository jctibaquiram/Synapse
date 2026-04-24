"use client"

import { motion } from "framer-motion"
import { Check, ShieldCheck, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PricingModal({ open, onOpenChange }: Props) {
  const { t } = useLanguage()

  function handleWompi() {
    // TODO: replace with real Wompi widget / redirect.
    //   const checkout = new WidgetCheckout({
    //     currency: "COP",
    //     amountInCents: 990000,
    //     reference: crypto.randomUUID(),
    //     publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    //   })
    //   checkout.open((result) => { /* verify via backend */ })
    toast.success(t.pricing.paymentSuccess)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-white/10 bg-popover/95 p-0 backdrop-blur-xl">
        {/* Accent top edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, hsl(262 83% 58% / 0.9) 50%, transparent 100%)",
          }}
        />
        {/* Soft bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-50 blur-3xl"
          style={{ background: "hsl(262 83% 58% / 0.35)" }}
        />

        <div className="relative p-7">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/25"
          >
            <Sparkles className="h-3 w-3" strokeWidth={2.2} />
            {t.pricing.pro}
          </motion.div>

          <DialogHeader className="mt-4 text-left">
            <DialogTitle className="font-display text-2xl font-semibold tracking-tight">
              {t.pricing.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t.pricing.subtitle}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex items-baseline gap-2 border-y border-white/[0.06] py-4">
            <span className="font-display text-4xl font-semibold tracking-tight tabnum syn-gradient-text">
              {t.pricing.proPrice}
            </span>
            <span className="text-xs text-muted-foreground">/ {t.pricing.monthly}</span>
            {/* monthly is now a standalone unit ("month"/"mes"/"mês") — we prepend the slash here */}
          </div>

          <ul className="mt-5 flex flex-col gap-2.5">
            {t.pricing.features.pro.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-start gap-2.5 text-sm"
              >
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                <span className="text-foreground/90">{f}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            onClick={handleWompi}
            size="lg"
            className={cn("mt-6 h-12 w-full gap-2 rounded-xl text-sm font-semibold", "syn-btn-primary")}
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
            {t.pricing.proCta}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" strokeWidth={1.8} />
            <span>{t.pricing.secure}</span>
            <span aria-hidden className="text-white/20">·</span>
            <span>{t.pricing.methods}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
