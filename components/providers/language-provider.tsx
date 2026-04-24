"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { dict, type Dict, type Locale } from "@/lib/i18n"

type LanguageContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dict
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = "synapse.locale"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es")

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) as Locale | null) : null
    if (saved && saved in dict) setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l)
  }

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t: dict[locale] as Dict }),
    [locale],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>")
  return ctx
}
