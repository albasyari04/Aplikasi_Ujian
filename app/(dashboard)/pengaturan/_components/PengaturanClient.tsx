"use client"

import { useState } from "react"
import {
  User,
  ShieldCheck,
  Palette,
  Bell,
  Laptop2,
  Settings2,
} from "lucide-react"
import { ProfilCard }     from "./ProfilCard"
import { PasswordCard }   from "./PasswordCard"
import { TampilanCard }   from "./TampilanCard"
import { NotifikasiCard } from "./NotifikasiCard"
import { SesiCard }       from "./SesiCard"
import { cn } from "@/lib/utils"

// ── Tipe Role harus sama persis dengan yang ada di ProfilCard.tsx ──
// Kedua file mendefinisikan ProfilData, jadi tipe "role" wajib konsisten
type UserRole = "SISWA" | "GURU" | "ADMIN"

interface ProfilData {
  id: string
  nama: string
  email: string
  role: UserRole      // ← diperbaiki: bukan lagi "string" biasa
  nis?: string | null
  kelas?: string | null
  fotoProfil?: string | null
  createdAt: string
}

interface PengaturanClientProps {
  initialUser: ProfilData
}

const tabs = [
  { id: "profil",     label: "Profil",      icon: User,        short: "Profil"   },
  { id: "keamanan",   label: "Keamanan",    icon: ShieldCheck, short: "Aman"     },
  { id: "tampilan",   label: "Tampilan",    icon: Palette,     short: "Tampilan" },
  { id: "notifikasi", label: "Notifikasi",  icon: Bell,        short: "Notif"    },
  { id: "sesi",       label: "Sesi & Akun", icon: Laptop2,     short: "Sesi"     },
]

export function PengaturanClient({ initialUser }: PengaturanClientProps) {
  const [activeTab, setActiveTab] = useState("profil")
  const [user, setUser]           = useState<ProfilData>(initialUser)

  const handleUserUpdate = (updated: Partial<ProfilData>) => {
    setUser((prev) => ({ ...prev, ...updated }))
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
        >
          <Settings2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Pengaturan
          </h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Kelola akun dan preferensi Anda
          </p>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
        style={{
          background:    "var(--muted)",
          border:        "1px solid var(--border)",
          scrollbarWidth:"none",
        }}
      >
        {tabs.map((tab) => {
          const Icon   = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200",
                active
                  ? "text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              )}
              style={
                active
                  ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }
                  : {}
              }
            >
              <Icon size={13} strokeWidth={active ? 2.5 : 2} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          )
        })}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="animate-scale-in" key={activeTab}>
        {activeTab === "profil"     && <ProfilCard user={user} onUpdate={handleUserUpdate} />}
        {activeTab === "keamanan"   && <PasswordCard />}
        {activeTab === "tampilan"   && <TampilanCard />}
        {activeTab === "notifikasi" && <NotifikasiCard />}
        {activeTab === "sesi"       && <SesiCard />}
      </div>
    </div>
  )
}