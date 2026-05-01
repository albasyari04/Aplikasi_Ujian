"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { translations, type TranslationKey } from "@/lib/translations"

// ─── Types ────────────────────────────────────────────────────────────────────
export type FontSize = "sm" | "base" | "lg"
export type Language = "id" | "en"

interface PreferencesContextValue {
  fontSize:        FontSize
  language:        Language
  setFontSize:     (v: FontSize) => void
  setLanguage:     (v: Language) => void
  savePreferences: () => void
  saved:           boolean
  t:               (key: TranslationKey) => string
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm:   "13px",
  base: "15px",
  lg:   "17px",
}

const PreferencesContext = createContext<PreferencesContextValue>({
  fontSize:        "base",
  language:        "id",
  setFontSize:     () => {},
  setLanguage:     () => {},
  savePreferences: () => {},
  saved:           false,
  t:               (key) => key,
})

export function usePreferences() {
  return useContext(PreferencesContext)
}

// Hook ringkas untuk terjemahan saja
export function useT() {
  return useContext(PreferencesContext).t
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("base")
  const [language, setLanguageState] = useState<Language>("id")
  const [saved, setSaved]            = useState(false)

  useEffect(() => {
    const storedFont = localStorage.getItem("pref_fontSize") as FontSize | null
    const storedLang = localStorage.getItem("pref_language") as Language | null

    if (storedFont && ["sm", "base", "lg"].includes(storedFont)) {
      setFontSizeState(storedFont)
      document.documentElement.style.fontSize = FONT_SIZE_MAP[storedFont]
    }
    if (storedLang && ["id", "en"].includes(storedLang)) {
      setLanguageState(storedLang)
      document.documentElement.lang = storedLang
    }
  }, [])

  const setFontSize = useCallback((v: FontSize) => {
    setFontSizeState(v)
    document.documentElement.style.fontSize = FONT_SIZE_MAP[v]
  }, [])

  const setLanguage = useCallback((v: Language) => {
    setLanguageState(v)
    document.documentElement.lang = v
  }, [])

  const savePreferences = useCallback(() => {
    localStorage.setItem("pref_fontSize", fontSize)
    localStorage.setItem("pref_language", language)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [fontSize, language])

  const t = useCallback(
    (key: TranslationKey): string => translations[language][key] ?? key,
    [language]
  )

  return (
    <PreferencesContext.Provider
      value={{ fontSize, language, setFontSize, setLanguage, savePreferences, saved, t }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}