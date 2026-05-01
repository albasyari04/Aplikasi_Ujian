"use client"

// app/(dashboard)/dashboard/page.tsx
// ✅ FIX UTAMA: Semua data sebelumnya HARDCODED.
// Sekarang fetch dari API dengan auto-refresh setiap 30 detik (realtime polling).

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  BookOpen, Clock, CheckCircle2, Trophy, ChevronRight,
  Play, Eye, BarChart2, CalendarClock, Loader2, RefreshCw,
  TrendingUp, AlertCircle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────
interface UjianItem {
  id: string
  judul: string
  mapel: string
  guru: string
  kelas: string
  status: string
  tanggal: string
  waktuMulai: string
  waktuSelesai: string
  durasi: number
  _count: { soal: number; hasil: number }
  hasil?: { nilai: number; lulus: boolean; selesaiAt: string }[]
}

interface DashboardStats {
  ujianAktif: number
  ujianAkanDatang: number
  ujianSelesai: number
  rataRataNilai: number | null
  nilaiTerbaik: number | null
}

// ─── Helpers ──────────────────────────────────────────────────
function getStatusWaktu(ujian: UjianItem): "berlangsung" | "akan_datang" | "selesai" {
  const now = new Date()
  const mulai = new Date(ujian.waktuMulai)
  const selesai = new Date(ujian.waktuSelesai)
  if (now >= mulai && now <= selesai) return "berlangsung"
  if (now < mulai) return "akan_datang"
  return "selesai"
}

function formatWaktu(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function formatDeadline(ujian: UjianItem) {
  const tgl = new Date(ujian.waktuSelesai)
  const now = new Date()
  const diffDays = Math.floor((tgl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const jam = formatWaktu(ujian.waktuSelesai)
  if (diffDays === 0) return `Hari ini, ${jam}`
  if (diffDays === 1) return `Besok, ${jam}`
  return tgl.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }) + `, ${jam}`
}

function getNilaiGrade(nilai: number) {
  if (nilai >= 90) return "A"
  if (nilai >= 80) return "A-"
  if (nilai >= 70) return "B+"
  if (nilai >= 60) return "B"
  return "C"
}

const MAPEL_COLORS: Record<string, string> = {
  matematika: "bg-blue-500", fisika: "bg-purple-500", kimia: "bg-orange-500",
  biologi: "bg-green-500", "bahasa indonesia": "bg-pink-500",
  "bahasa inggris": "bg-yellow-500", sejarah: "bg-red-500",
  geografi: "bg-teal-500", ekonomi: "bg-indigo-500",
}
function getMapelColor(mapel: string) {
  const key = mapel.toLowerCase()
  for (const [k, v] of Object.entries(MAPEL_COLORS)) {
    if (key.includes(k)) return v
  }
  return "bg-slate-500"
}

// ─── Main Page ────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()
  const [ujianList, setUjianList] = useState<UjianItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // ✅ Fetch semua ujian dari API — bukan hardcoded
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/ujian", { cache: "no-store" })
      if (!res.ok) return
      const data: UjianItem[] = await res.json()
      setUjianList(data)
      setLastUpdated(new Date())
    } catch (e) {
      console.error("Dashboard fetch error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ✅ Fetch saat mount + polling setiap 30 detik (realtime)
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [fetchData])

  // ── Hitung stats dari data real ──
  const stats: DashboardStats = {
    ujianAktif: ujianList.filter(u => getStatusWaktu(u) === "berlangsung" && !u.hasil?.[0]).length,
    ujianAkanDatang: ujianList.filter(u => getStatusWaktu(u) === "akan_datang").length,
    ujianSelesai: ujianList.filter(u => !!u.hasil?.[0]).length,
    rataRataNilai: (() => {
      const nilais = ujianList.filter(u => u.hasil?.[0]).map(u => u.hasil![0].nilai)
      return nilais.length ? Math.round(nilais.reduce((a, b) => a + b, 0) / nilais.length) : null
    })(),
    nilaiTerbaik: (() => {
      const nilais = ujianList.filter(u => u.hasil?.[0]).map(u => u.hasil![0].nilai)
      return nilais.length ? Math.max(...nilais) : null
    })(),
  }

  // ── Ujian berlangsung (aktif, belum dikerjakan) ──
  const ujianBerlangsung = ujianList.filter(
    u => getStatusWaktu(u) === "berlangsung" && !u.hasil?.[0]
  )

  // ── Ujian akan datang (max 3) ──
  const ujianAkanDatang = ujianList
    .filter(u => getStatusWaktu(u) === "akan_datang")
    .slice(0, 3)

  // ── Nilai terakhir (sudah selesai, max 5) ──
  const nilaiTerakhir = ujianList
    .filter(u => !!u.hasil?.[0])
    .sort((a, b) => new Date(b.hasil![0].selesaiAt).getTime() - new Date(a.hasil![0].selesaiAt).getTime())
    .slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 11 ? "Selamat Pagi 🌤️" : hour < 15 ? "Selamat Siang ☀️" : hour < 18 ? "Selamat Sore 🌆" : "Selamat Malam 🌙"
  const namaUser = session?.user?.name || "Siswa"
  const kelasUser = session?.user?.kelas || ""

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 55%, #134e4a 100%)" }}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-16 bottom-0 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative p-5 md:p-6 flex items-start justify-between gap-4">
          <div>
            {/* ✅ Nama dari session — bukan hardcoded */}
            <p className="text-sm font-medium text-teal-100">{greeting}</p>
            <h2 className="mt-0.5 text-xl font-bold md:text-2xl">{namaUser}</h2>
            {kelasUser && (
              <p className="mt-1 text-sm text-teal-100">{kelasUser} &bull; SMA Al-Istiqomah</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {/* ✅ Count dari data real */}
              {stats.ujianAktif > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
                  {stats.ujianAktif} Ujian Berlangsung
                </span>
              )}
              {stats.ujianAkanDatang > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  📅 {stats.ujianAkanDatang} Akan Datang
                </span>
              )}
              {stats.ujianAktif === 0 && stats.ujianAkanDatang === 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  ✅ Tidak ada ujian berlangsung
                </span>
              )}
            </div>
          </div>

          {/* Last updated indicator */}
          <div className="shrink-0 text-right">
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm text-left min-w-[160px]">
              <p className="text-[10px] text-teal-200 mb-1">📡 Semester Genap 2024/2025</p>
              <p className="text-sm font-bold">{kelasUser || "SMA Al-Istiqomah"}</p>
              {lastUpdated && (
                <p className="text-[10px] text-teal-200 mt-1.5 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-green-400 inline-block" />
                  Update {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row — data real ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Ujian Aktif" value={String(stats.ujianAktif)}
            sub="Berlangsung sekarang" icon={<BookOpen className="size-5" />} color="teal" />
          <StatCard label="Akan Datang" value={String(stats.ujianAkanDatang)}
            sub="Minggu ini" icon={<CalendarClock className="size-5" />} color="blue" />
          <StatCard label="Ujian Selesai" value={String(stats.ujianSelesai)}
            sub="Semester ini" icon={<CheckCircle2 className="size-5" />} color="green" />
          <StatCard label="Rata-rata Nilai"
            value={stats.rataRataNilai !== null ? String(stats.rataRataNilai) : "—"}
            sub={stats.nilaiTerbaik !== null ? `Terbaik: ${stats.nilaiTerbaik}` : "Belum ada ujian"}
            icon={<Trophy className="size-5" />} color="amber" />
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Kerjakan Ujian", sub: "Ujian aktif tersedia", href: "/ujian", color: "bg-teal-500", icon: "📝" },
          { label: "Lihat Jadwal", sub: "Jadwal minggu ini", href: "/jadwal", color: "bg-blue-500", icon: "📅" },
          { label: "Nilai Saya", sub: "Rekap semester ini", href: "/nilai", color: "bg-amber-500", icon: "📊" },
          { label: "Riwayat Ujian", sub: "Semua ujian lalu", href: "/riwayat", color: "bg-rose-500", icon: "🕐" },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <div className={`${a.color} rounded-2xl p-4 text-white hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer`}>
              <p className="text-2xl mb-2">{a.icon}</p>
              <p className="text-sm font-bold leading-tight">{a.label}</p>
              <p className="text-[11px] text-white/70 mt-0.5">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">

        {/* ── Kiri: Ujian berlangsung + akan datang ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Ujian Berlangsung */}
          {ujianBerlangsung.length > 0 && (
            <div className="space-y-3">
              <SectionHeader title="Ujian Berlangsung" href="/ujian" />
              {ujianBerlangsung.map(u => (
                <UjianCardDashboard key={u.id} ujian={u} />
              ))}
            </div>
          )}

          {/* Ujian Akan Datang */}
          {ujianAkanDatang.length > 0 && (
            <div className="space-y-3">
              <SectionHeader title="Akan Datang" href="/ujian" />
              {ujianAkanDatang.map(u => (
                <UjianCardDashboard key={u.id} ujian={u} />
              ))}
            </div>
          )}

          {/* Kosong */}
          {!isLoading && ujianBerlangsung.length === 0 && ujianAkanDatang.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-border/50 gap-3">
              <CheckCircle2 className="size-10 text-teal-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Tidak ada ujian aktif</p>
                <p className="text-xs text-muted-foreground mt-1">Semua ujian sudah selesai atau belum dijadwalkan</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          )}
        </div>

        {/* ── Kanan: Ujian terdekat + nilai terakhir ── */}
        <div className="space-y-4">

          {/* Ujian Terdekat */}
          <div>
            <SectionHeader title="Ujian Terdekat" href="/ujian" />
            <div className="space-y-2 mt-2">
              {isLoading && [...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
              ))}
              {!isLoading && ujianList.filter(u => !u.hasil?.[0]).slice(0, 4).map(u => {
                const sw = getStatusWaktu(u)
                return (
                  <Link key={u.id} href={`/ujian/${u.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/40 hover:border-teal-300 hover:shadow-sm transition-all group">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${getMapelColor(u.mapel)} text-white text-xs font-bold shrink-0`}>
                        {u.mapel.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{u.judul}</p>
                        <p className="text-[10px] text-muted-foreground">{formatWaktu(u.waktuMulai)} WIB</p>
                      </div>
                      {sw === "berlangsung" ? (
                        <span className="text-[9px] font-black text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded-full border border-teal-200 shrink-0">Live</span>
                      ) : (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full border border-blue-200 shrink-0">Segera</span>
                      )}
                    </div>
                  </Link>
                )
              })}
              {!isLoading && ujianList.filter(u => !u.hasil?.[0]).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Tidak ada ujian mendatang</p>
              )}
            </div>
          </div>

          {/* Progress Semester */}
          {!isLoading && (
            <div className="bg-background rounded-2xl border border-border/50 p-4 space-y-3">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">Progress Semester</p>
              <ProgressBar label="Ujian Selesai" value={stats.ujianSelesai} max={ujianList.length} color="bg-teal-500" />
              {stats.nilaiTerbaik !== null && (
                <ProgressBar label="Nilai Terbaik" value={stats.nilaiTerbaik} max={100} color="bg-amber-400" />
              )}
              {stats.rataRataNilai !== null && (
                <ProgressBar label="Rata-rata Kelas" value={stats.rataRataNilai} max={100} color="bg-blue-400" />
              )}
            </div>
          )}

          {/* Nilai Terakhir */}
          {nilaiTerakhir.length > 0 && (
            <div>
              <SectionHeader title="Nilai Terakhir" href="/nilai" />
              <div className="space-y-2 mt-2">
                {nilaiTerakhir.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/40">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${getMapelColor(u.mapel)} text-white text-xs font-bold shrink-0`}>
                      {u.mapel.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{u.mapel}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(u.hasil![0].selesaiAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-base font-black ${u.hasil![0].nilai >= 80 ? "text-teal-600" : u.hasil![0].nilai >= 60 ? "text-blue-600" : "text-red-500"}`}>
                        {u.hasil![0].nilai}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold">{getNilaiGrade(u.hasil![0].nilai)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string
  icon: React.ReactNode; color: "teal" | "blue" | "green" | "amber"
}) {
  const colors = {
    teal:  { bg: "bg-teal-50 dark:bg-teal-950/30",  text: "text-teal-600",  icon: "bg-teal-100 dark:bg-teal-900/50 text-teal-600" },
    blue:  { bg: "bg-blue-50 dark:bg-blue-950/30",  text: "text-blue-600",  icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600" },
    green: { bg: "bg-green-50 dark:bg-green-950/30",text: "text-green-600", icon: "bg-green-100 dark:bg-green-900/50 text-green-600" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30",text: "text-amber-600", icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600" },
  }
  const c = colors[color]
  return (
    <div className={`${c.bg} rounded-2xl p-4 border border-border/30`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
        <div className={`p-1.5 rounded-lg ${c.icon}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-black ${c.text}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

function ProgressBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="text-[11px] font-bold text-foreground">{value}{max !== 100 ? `/${max}` : ""}</span>
      </div>
      <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function UjianCardDashboard({ ujian }: { ujian: UjianItem }) {
  const sw = getStatusWaktu(ujian)
  const iconColor = getMapelColor(ujian.mapel)
  const isBerlangsung = sw === "berlangsung"

  return (
    <div className={`relative bg-background rounded-2xl border overflow-hidden transition-all hover:shadow-sm
      ${isBerlangsung ? "border-teal-400 shadow-sm shadow-teal-100 dark:shadow-teal-900/20" : "border-border/50"}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${iconColor} rounded-l-2xl`} />
      <div className="pl-4 pr-4 pt-3.5 pb-3 ml-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconColor} text-white shrink-0`}>
              <BookOpen className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                {isBerlangsung ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 px-2 py-0.5 rounded-full">
                    <span className="size-1.5 rounded-full bg-teal-500 animate-pulse inline-block" />
                    Berlangsung
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 px-2 py-0.5 rounded-full">
                    <CalendarClock className="size-3" />
                    Akan Datang
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-foreground line-clamp-1">{ujian.judul}</p>
              <p className="text-[11px] text-muted-foreground">{ujian.guru}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground/60">Deadline</p>
            <p className="text-xs font-bold text-foreground">{formatDeadline(ujian)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5">
          <span className="flex items-center gap-1"><Clock className="size-3" />{ujian.durasi} menit</span>
          <span className="flex items-center gap-1"><BookOpen className="size-3" />{ujian._count.soal} soal</span>
          <span>{ujian.kelas}</span>
        </div>

        <Link href={isBerlangsung ? `/ujian/${ujian.id}` : `/ujian/${ujian.id}`}>
          <button
            className={`w-full flex items-center justify-center gap-2 h-8 rounded-xl text-xs font-bold transition-all active:scale-[0.98]
              ${isBerlangsung
                ? "text-white shadow-sm"
                : "text-muted-foreground bg-muted/30 hover:bg-muted/50 border border-border/40"}`}
            style={isBerlangsung ? { background: "linear-gradient(135deg, #0d9488, #0f766e)" } : {}}
          >
            {isBerlangsung ? <><Play className="size-3 fill-white" />Mulai Ujian</> : <><Eye className="size-3" />Lihat Detail</>}
            <ChevronRight className="size-3" />
          </button>
        </Link>
      </div>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
      <Link href={href} className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors">
        Lihat semua →
      </Link>
    </div>
  )
}