"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useUserStore } from "@/store/userStore"
import {
  MonitorSmartphone,
  Smartphone,
  Monitor,
  Laptop2,
  LogOut,
  Trash2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Session {
  id: string
  device: string
  deviceType: "desktop" | "mobile" | "tablet"
  browser: string
  location: string
  lastActive: string
  isCurrent: boolean
}

// Data sesi dummy (dalam implementasi nyata, dari API)
const mockSessions: Session[] = [
  {
    id: "1",
    device: "Windows 11 · Chrome 124",
    deviceType: "desktop",
    browser: "Chrome",
    location: "Palembang, ID",
    lastActive: "Sekarang",
    isCurrent: true,
  },
  {
    id: "2",
    device: "Android · Chrome Mobile",
    deviceType: "mobile",
    browser: "Chrome",
    location: "Palembang, ID",
    lastActive: "2 jam lalu",
    isCurrent: false,
  },
]

function DeviceIcon({ type }: { type: Session["deviceType"] }) {
  const iconProps = { size: 16, strokeWidth: 2, style: { color: "var(--primary)" } }
  if (type === "mobile") return <Smartphone {...iconProps} />
  if (type === "tablet") return <MonitorSmartphone {...iconProps} />
  return <Monitor {...iconProps} />
}

export function SesiCard() {
  const router  = useRouter()
  const logout  = useUserStore((s) => s.logout)
  const [sessions, setSessions] = useState<Session[]>(mockSessions)
  const [showDanger, setShowDanger] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)

  const handleLogoutAll = async () => {
    setLoadingLogout(true)
    await signOut({ redirect: false })
    logout()
    router.push("/login")
  }

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
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
          <Laptop2 size={17} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            Sesi Aktif
          </h3>
          <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Perangkat yang sedang login
          </p>
        </div>
      </div>

      <div className="px-5 md:px-6 py-5 space-y-4">
        {/* Sessions list */}
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                s.isCurrent
                  ? "border-[var(--primary)]/40 bg-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--muted)]"
              )}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: s.isCurrent ? "var(--primary)" + "20" : "var(--card)" }}
              >
                <DeviceIcon type={s.deviceType} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>
                    {s.device}
                  </p>
                  {s.isCurrent && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg"
                      style={{ background: "var(--primary)", color: "white" }}
                    >
                      PERANGKAT INI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    <MapPin size={9} /> {s.location}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    <Clock size={9} /> {s.lastActive}
                  </span>
                </div>
              </div>
              {!s.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(s.id)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all flex-shrink-0"
                  title="Cabut sesi"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Logout all */}
        <button
          onClick={handleLogoutAll}
          disabled={loadingLogout}
          className="w-full h-9 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted-foreground)",
          }}
        >
          <LogOut size={13} />
          Keluar dari Semua Perangkat
        </button>

        {/* Danger Zone */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "#fca5a520" }}
        >
          <button
            onClick={() => setShowDanger((p) => !p)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left"
            style={{ background: "#fef2f2" }}
          >
            <ShieldAlert size={15} className="text-red-500 flex-shrink-0" />
            <span className="text-xs font-bold text-red-600 flex-1">Zona Berbahaya</span>
            <span className="text-[10px] text-red-400">{showDanger ? "Sembunyikan ▲" : "Tampilkan ▼"}</span>
          </button>

          {showDanger && (
            <div className="px-4 py-4 space-y-3" style={{ background: "#fff5f5" }}>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                <AlertTriangle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-red-600 leading-relaxed">
                  Menghapus akun bersifat permanen dan tidak dapat dibatalkan. Semua data ujian, nilai, dan riwayat akan hilang.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-9 rounded-xl text-xs font-semibold"
                onClick={() => alert("Fitur hapus akun memerlukan konfirmasi administrator.")}
              >
                <Trash2 size={13} className="mr-2" />
                Hapus Akun Saya
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}