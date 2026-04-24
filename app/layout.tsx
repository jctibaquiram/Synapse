import type { Metadata, Viewport } from "next"
import { Inter, Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LanguageProvider } from "@/components/providers/language-provider"
import { UsageProvider } from "@/components/providers/usage-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-inter-tight",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Synapse — AI Spaced Repetition",
  description:
    "Synapse turns any document into a scientific study plan. Spaced repetition, AI-generated flashcards, multi-language.",
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} dark bg-background`}
    >
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <LanguageProvider>
          <UsageProvider>
            {children}
            <Toaster position="bottom-right" />
          </UsageProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
