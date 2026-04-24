import { AppShell } from "@/components/app-shell"
import { PricingSection } from "@/components/pricing/pricing-section"

export default function PricingPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-8 md:py-14">
        <PricingSection />
      </div>
    </AppShell>
  )
}
