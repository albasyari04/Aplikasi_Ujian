"use client"

import { useState } from "react"
import {
  Bell,
  BellRing,
  CheckCircle2,
  CalendarDays,
  FileText,
  Trophy,
  Megaphone,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NotifSetting {
  id: string
  label: string
  desc: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  enabled: boolean
}

const defaultSettings: NotifSetting[] = [
  {
    id: "ujian_baru",
    label: "Ujian Baru",
    desc: "Notifikasi ketika ada ujian baru tersedia",
    icon: FileText,
    enabled: true,
  },
  {
    id: "jadwal_reminder",
    label: "Pengingat Jadwal",
    desc: "Ingatkan 30 menit sebelum ujian dimulai",
    icon: CalendarDays,
    enabled: true,
  },
  {
    id: "hasil_ujian",
    label: "Hasil Ujian",
    desc: "Notifikasi ketika hasil ujian tersedia",
    icon: Trophy,
    enabled: true,
  },
  {
    id: "pengumuman",
    label: "Pengumuman Sekolah",
    desc: "Informasi dan pengumuman dari sekolah",
    icon: Megaphone,
    enabled: false,
  },
]

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0",
        enabled ? "bg-[var(--primary)]" : "bg-[var(--border)]"
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300",
          enabled ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

export function NotifikasiCard() {
  const [settings, setSettings] = useState<NotifSetting[]>(defaultSettings)
  const [masterEnabled, setMasterEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  const toggle = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const toggleAll = () => {
    const next = !masterEnabled
    setMasterEnabled(next)
    setSettings((prev) => prev.map((s) => ({ ...s, enabled: next })))
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 md:px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <BellRing size={17} style={{ color: "var(--primary)" }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            Notifikasi
          </h3>
          <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Kelola notifikasi yang Anda terima
          </p>
        </div>
        <Toggle enabled={masterEnabled} onToggle={toggleAll} />
      </div>

      <div className="px-5 md:px-6 py-5 space-y-4">
        {/* Master label */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold"
          style={{
            background: masterEnabled ? "var(--accent)" : "var(--muted)",
            color: masterEnabled ? "var(--primary)" : "var(--muted-foreground)",
          }}
        >
          <Bell size={12} />
          {masterEnabled ? "Semua notifikasi aktif" : "Semua notifikasi dinonaktifkan"}
        </div>

        {/* List settings */}
        <div className="space-y-2">
          {settings.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl border transition-all",
                  s.enabled
                    ? "border-[var(--border)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--card)] opacity-60"
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: s.enabled ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={2}
                    style={{ color: s.enabled ? "var(--primary)" : "var(--muted-foreground)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                    {s.label}
                  </p>
                  <p className="text-[10px] leading-tight mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {s.desc}
                  </p>
                </div>
                <Toggle enabled={s.enabled} onToggle={() => toggle(s.id)} />
              </div>
            )
          })}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={cn(
            "w-full h-10 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2",
            saved ? "bg-emerald-500" : ""
          )}
          style={!saved ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" } : {}}
        >
          {saved && <CheckCircle2 size={15} />}
          {saved ? "Pengaturan Disimpan!" : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  )
}