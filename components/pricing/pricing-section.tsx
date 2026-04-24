"use client"

import { Check, ShieldCheck, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"
import { toast } from "sonner"

// In production this component triggers the Wompi Widget.
// Public key is read from env and the payment is verified server-side via webhook.
// Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web
function openWompiCheckout(_amountCop: number) {
  // Example (when the Wompi script is loaded in layout):
  // const checkout = new (window as any).WidgetCheckout({
  //   currency: "COP",
  //   amountInCents: _amountCop * 100,
  //   reference: crypto.randomUUID(),
  //   publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
  //   redirectUrl: `${location.origin}/pricing/success`,
  // })
  // checkout.open((result) => { /* backend verifies via webhook */ })
}

export function PricingSection() {
  const { t } = useLanguage()

  function handleWompi() {
    openWompiCheckout(9900)
    toast.success(t.pricing.paymentSuccess)
  }

  const plans = [
    {
      id: "free",
      name: t.pricing.free,
      price: t.pricing.freePrice,
      features: t.pricing.features.free,
      cta: t.pricing.freeCta,
      onCta: () => {},
      highlighted: false,
      ctaDisabled: true,
    },
    {
      id: "pro",
      name: t.pricing.pro,
      price: t.pricing.proPrice,
      features: t.pricing.features.pro,
      cta: t.pricing.proCta,
      onCta: handleWompi,
      highlighted: true,
      ctaDisabled: false,
    },
  ]

  return (
    <section className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]"
        aria-hidden
      />

      <header className="mx-auto max-w-2xl text-center">
        <Badge className="mb-4 gap-1 bg-primary/15 text-primary hover:bg-primary/20">
          <Sparkles className="h-3 w-3" />
          {t.pricing.pro}
        </Badge>
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          {t.pricing.title}
        </h1>
        <p className="mt-3 text-pretty text-sm text-muted-foreground md:text-base">
          {t.pricing.subtitle}
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-6 transition-colors",
              plan.highlighted
                ? "border-primary/50 bg-gradient-to-b from-primary/[0.06] to-card shadow-[0_0_0_1px_rgba(99,102,241,0.2)]"
                : "border-border",
            )}
          >
            {plan.highlighted ? (
              <div className="absolute -top-3 left-6 rounded-full border border-primary/40 bg-background px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                {t.pricing.recommended}
              </div>
            ) : null}

            <header className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold tracking-tight">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/ {t.pricing.monthly}</span>
                </div>
              </div>
              {plan.highlighted ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              ) : null}
            </header>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      plan.highlighted ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={plan.onCta}
              disabled={plan.ctaDisabled}
              size="lg"
              variant={plan.highlighted ? "default" : "outline"}
              className={cn("mt-6 w-full gap-2", !plan.highlighted && "bg-transparent")}
            >
              {plan.highlighted ? <ShieldCheck className="h-4 w-4" /> : null}
              {plan.cta}
            </Button>

            {plan.highlighted ? (
              <div className="mt-4 flex flex-col items-center gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  <span>{t.pricing.secure}</span>
                </div>
                <PaymentMethods />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function PaymentMethods() {
  const { t } = useLanguage()
  const methods = ["PSE", t.pricing.creditCard, "Bancolombia", "Nequi"]
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {methods.map((m) => (
        <span
          key={m}
          className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground"
        >
          {m}
        </span>
      ))}
    </div>
  )
}
