/*"use client"

import { useState } from "react"

export function LangToggle() {
  const [lang, setLang] = useState<"vi" | "en">("vi")
  const base = "rounded-full px-3 py-1 text-[11px] font-bold transition"

  return (
    <div className="inline-flex rounded-full bg-line p-0.5">
      <button
        onClick={() => setLang("vi")}
        className={`${base} ${lang === "vi" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
      >
        VIE
      </button>
      <button
        onClick={() => setLang("en")}
        className={`${base} ${lang === "en" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
      >
        ENG
      </button>
    </div>
  )
}*/

"use client"

import { useT } from "@/lib/i18n/language-provider"

export function LangToggle() {
  const { lang, setLang } = useT()
  const base = "rounded-full px-3 py-1 text-[11px] font-bold transition"

  return (
    <div className="inline-flex rounded-full bg-line p-0.5">
      <button
        onClick={() => setLang("vi")}
        className={`${base} ${lang === "vi" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
      >
        VIE
      </button>
      <button
        onClick={() => setLang("en")}
        className={`${base} ${lang === "en" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
      >
        ENG
      </button>
    </div>
  )
}