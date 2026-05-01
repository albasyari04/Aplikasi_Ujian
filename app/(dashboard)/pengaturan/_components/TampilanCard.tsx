"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Palette, Globe, CheckCircle2, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePreferences, useT } from "@/components/PreferencesProvider"
import type { FontSize, Language } from "@/components/PreferencesProvider"

export function TampilanCard() {
  const { theme, setTheme }                    = useTheme()
  const { fontSize, language, setFontSize,
          setLanguage, savePreferences, saved } = usePreferences()
  const t                                      = useT()
  const [mounted, setMounted]                  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const themeOptions = [
    { value: "light",  label: t("temaTerang"), icon: Sun,     desc: t("temaTerangDesc") },
    { value: "dark",   label: t("temaGelap"),  icon: Moon,    desc: t("temaGelapDesc")  },
    { value: "system", label: t("temaSistem"), icon: Monitor, desc: t("temaSistemDesc") },
  ]

  const fontSizeOptions: { value: FontSize; label: string; px: string }[] = [
    { value: "sm",   label: t("ukuranKecil"),  px: "13px" },
    { value: "base", label: t("ukuranNormal"), px: "15px" },
    { value: "lg",   label: t("ukuranBesar"),  px: "17px" },
  ]

  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
    { value: "en", label: "English",          flag: "🇬🇧" },
  ]

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 md:px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
          <Palette size={17} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{t("tampilanTitle")}</h3>
          <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{t("tampilanDesc")}</p>
        </div>
      </div>

      <div className="px-5 md:px-6 py-5 space-y-6">

        {/* Tema */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            {t("temaWarna")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {mounted && themeOptions.map((opt) => {
              const Icon   = opt.icon
              const active = theme === opt.value
              return (
                <button key={opt.value} onClick={() => setTheme(opt.value)}
                  className={cn("relative flex flex-col items-center gap-2 py-3 px-2 rounded-xl border text-center transition-all",
                    active ? "border-[var(--primary)] bg-[var(--accent)]" : "border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/40")}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: active ? "var(--primary)" : "var(--card)", color: active ? "white" : "var(--muted-foreground)" }}>
                    <Icon size={15} />
                  </div>
                  <span className="text-[11px] font-semibold leading-none" style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}>
                    {opt.label}
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{opt.desc}</span>
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Ukuran Font */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
            <Type size={11} /> {t("ukuranTeks")}
          </p>
          <div className="flex gap-2">
            {fontSizeOptions.map((opt) => {
              const active = fontSize === opt.value
              return (
                <button key={opt.value} onClick={() => setFontSize(opt.value)}
                  className={cn("flex-1 py-2.5 rounded-xl border text-center transition-all",
                    active ? "border-[var(--primary)] bg-[var(--accent)]" : "border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/40")}>
                  <span className="font-semibold block" style={{ fontSize: opt.px, color: active ? "var(--primary)" : "var(--muted-foreground)" }}>A</span>
                  <span className="text-[10px] font-medium" style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}>{opt.label}</span>
                </button>
              )
            })}
          </div>
          <div className="rounded-xl px-4 py-3 border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p style={{ color: "var(--foreground)" }} className="font-medium">{t("previewTeks")}</p>
            <p style={{ color: "var(--muted-foreground)" }} className="text-[0.85em] mt-0.5">
              {t("ukuranSaatIni")}: {fontSizeOptions.find(f => f.value === fontSize)?.label}
            </p>
          </div>
        </div>

        {/* Bahasa */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
            <Globe size={11} /> {t("bahasaLabel")}
          </p>
          <div className="flex flex-col gap-2">
            {languageOptions.map((opt) => {
              const active = language === opt.value
              return (
                <button key={opt.value} onClick={() => setLanguage(opt.value)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
                    active ? "border-[var(--primary)] bg-[var(--accent)]" : "border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/40")}>
                  <span className="text-xl">{opt.flag}</span>
                  <span className="text-sm font-semibold flex-1" style={{ color: active ? "var(--primary)" : "var(--foreground)" }}>{opt.label}</span>
                  {active && <CheckCircle2 size={15} style={{ color: "var(--primary)" }} />}
                </button>
              )
            })}
          </div>
          <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t("bahasaNote")}</p>
        </div>

        {/* Save */}
        <button onClick={savePreferences}
          className={cn("w-full h-10 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2",
            saved ? "bg-emerald-500" : "")}
          style={!saved ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" } : {}}>
          {saved && <CheckCircle2 size={15} />}
          {saved ? t("preferensiSimpan") : t("simpanPreferensi")}
        </button>
      </div>
    </div>
  )
}