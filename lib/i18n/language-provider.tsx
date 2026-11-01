"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { dictionary, type Lang, type TranslationKey } from "./dictionary"

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang")
      if (saved === "vi" || saved === "en") setLangState(saved)
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem("lang", l)
    } catch {}
  }, [])

  const t = useCallback((key: TranslationKey) => dictionary[lang][key], [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useT phải nằm trong LanguageProvider")
  return ctx
}