"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  CheckCircle,
  BookOpen,
  Users,
  CalendarClock,
  ChevronRight,
  AlarmClock,
  BarChart3,
  Trophy,
  FileText,
  Zap,
  GraduationCap,
  ListChecks,
  TimerReset,
  ClipboardList,
  Star,
  TrendingUp,
  Bell,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type UjianStatus = "aktif" | "akan_datang" | "selesai"

// Shape dari API /api/ujian (disesuaikan dengan Prisma schema)
interface UjianFromAPI {
  id: string
  judul: string
  mapel: string
  guru: string
  kelas: string
  durasi: number
  status: "AKTIF" | "DRAFT" | "SELESAI"
  tanggal: string
  waktuMulai: string
  waktuSelesai: string
  _count: { soal: number; hasil: number }
  hasil?: { nilai: number; lulus: boolean; selesaiAt: string }[]
}

// Shape yang dipakai UI
interface Ujian {
  id: string
  mataPelajaran: string
  kelas: string
  guru: string
  waktu: string
  jumlahSoal: number
  deadline: string
  deadlineRaw: string // untuk sorting
  status: UjianStatus
  nilai?: number
  grade?: string
  iconBg: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Map status dari DB ke status UI
function mapStatus(dbStatus: string): UjianStatus {
  if (dbStatus === "AKTIF") return "aktif"
  if (dbStatus === "SELESAI") return "selesai"
  return "akan_datang" // DRAFT → tampil sebagai akan_datang
}

// Hitung grade dari nilai
function getGrade(nilai: number): string {
  if (nilai >= 90) return "A"
  if (nilai >= 85) return "A−"
  if (nilai >= 80) return "B+"
  if (nilai >= 75) return "B"
  if (nilai >= 70) return "B−"
  if (nilai >= 65) return "C+"
  return "C"
}

// Format deadline dari waktuSelesai
function formatDeadline(waktuSelesai: string): string {
  const d = new Date(waktuSelesai)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffMs = target.getTime() - today.getTime()
  const diffDay = Math.round(diffMs / (1000 * 60 * 60 * 24))

  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

  if (diffDay === 0) return `Hari ini, ${jam} WIB`
  if (diffDay === 1) return `Besok, ${jam} WIB`
  if (diffDay === -1) return `Kemarin, ${jam} WIB`
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

// Pilih warna icon berdasarkan mapel
const MAPEL_COLORS: Record<string, string> = {
  matematika: "bg-teal-500",
  fisika: "bg-blue-500",
  kimia: "bg-orange-500",
  biologi: "bg-green-500",
  "bahasa indonesia": "bg-violet-500",
  "bahasa inggris": "bg-amber-500",
  sejarah: "bg-rose-500",
  geografi: "bg-cyan-500",
  ekonomi: "bg-indigo-500",
  sosiologi: "bg-pink-500",
}

function getIconBg(mapel: string): string {
  const key = mapel.toLowerCase()
  for (const [k, v] of Object.entries(MAPEL_COLORS)) {
    if (key.includes(k)) return v
  }
  return "bg-gray-500"
}

// Transform API response → UI shape
function transformUjian(u: UjianFromAPI): Ujian {
  const status = mapStatus(u.status)
  const hasilSiswa = u.hasil?.[0]
  const nilai = hasilSiswa?.nilai

  return {
    id: u.id,
    mataPelajaran: u.mapel,
    kelas: u.kelas,
    guru: u.guru,
    waktu: `${u.durasi} menit`,
    jumlahSoal: u._count.soal,
    deadline: formatDeadline(u.waktuSelesai),
    deadlineRaw: u.waktuSelesai,
    status,
    nilai: nilai ?? undefined,
    grade: nilai !== undefined ? getGrade(nilai) : undefined,
    iconBg: getIconBg(u.mapel),
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DaftarUjianPage() {
  const [ujianList, setUjianList]   = useState<Ujian[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [activeTab, setActiveTab]   = useState<string>("semua")
  const [search, setSearch]         = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ── Fetch data dari API ──────────────────────────────────────────────────
  const fetchUjian = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else if (ujianList.length === 0) setLoading(true)

    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)

      const res = await fetch(`/api/ujian?${params.toString()}`, {
        // ✅ no-store: jangan cache, selalu ambil data terbaru dari server
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      if (!res.ok) throw new Error("Gagal mengambil data ujian")

      const data: UjianFromAPI[] = await res.json()
      const transformed = data.map(transformUjian)

      // Sort: aktif dulu, lalu akan_datang (urut deadline), lalu selesai
      transformed.sort((a, b) => {
        const order = { aktif: 0, akan_datang: 1, selesai: 2 }
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
        return new Date(a.deadlineRaw).getTime() - new Date(b.deadlineRaw).getTime()
      })

      setUjianList(transformed)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError("Gagal memuat data ujian. Periksa koneksi internet kamu.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [search])

  // ── Initial fetch & polling setiap 30 detik (realtime) ──────────────────
  useEffect(() => {
    fetchUjian()

    // ✅ Polling: refetch otomatis setiap 30 detik → data selalu sinkron dengan admin
    const interval = setInterval(() => fetchUjian(), 30_000)
    return () => clearInterval(interval)
  }, [fetchUjian])

  // ── Re-fetch saat search berubah (debounced 400ms) ───────────────────────
  useEffect(() => {
    const timer = setTimeout(() => fetchUjian(), 400)
    return () => clearTimeout(timer)
  }, [search])

  // ── Derived stats ────────────────────────────────────────────────────────
  const countAktif      = ujianList.filter((u) => u.status === "aktif").length
  const countAkanDatang = ujianList.filter((u) => u.status === "akan_datang").length
  const countSelesai    = ujianList.filter((u) => u.status === "selesai").length
  const totalUjian      = ujianList.length

  const nilaiList = ujianList.filter((u) => u.nilai !== undefined).map((u) => u.nilai!)
  const rataRata  = nilaiList.length > 0
    ? Math.round(nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length)
    : 0
  const nilaiTerbaik = nilaiList.length > 0 ? Math.max(...nilaiList) : 0

  // ── Filtered untuk list ──────────────────────────────────────────────────
  const filtered = ujianList.filter((u) => {
    const matchTab    = activeTab === "semua" || u.status === activeTab
    const matchSearch =
      u.mataPelajaran.toLowerCase().includes(search.toLowerCase()) ||
      u.guru.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  // Ujian aktif paling dekat (untuk notif)
  const ujianAktifTerdekat = ujianList.find((u) => u.status === "aktif")

  const tabs = [
    { key: "semua",       label: "Semua",       icon: <ListChecks size={13} />,  count: totalUjian },
    { key: "aktif",       label: "Aktif",       icon: <Flame size={13} />,       count: countAktif },
    { key: "akan_datang", label: "Akan Datang", icon: <AlarmClock size={13} />,  count: countAkanDatang },
    { key: "selesai",     label: "Selesai",     icon: <CheckCircle size={13} />, count: countSelesai },
  ]

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-6 h-36 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 h-24 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && ujianList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 max-w-md text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Gagal Memuat Data</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchUjian(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-5 md:p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-16 bottom-0 h-24 w-24 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-emerald-400/20" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-teal-100">Semester Genap 2024/2025</p>
            <h2 className="mt-0.5 text-xl font-bold md:text-2xl">Daftar Ujian</h2>
            {/* ✅ kelas dari data API (ambil dari item pertama) */}
            <p className="mt-1 text-sm text-teal-100">
              {ujianList[0]?.kelas ?? "—"} &bull; SMA Al-Istiqomah
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {countAktif > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
                  {countAktif} Ujian Berlangsung
                </span>
              )}
              {countAkanDatang > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <AlarmClock size={11} />
                  {countAkanDatang} Akan Datang
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-2">
            {/* ✅ Tombol refresh manual */}
            <button
              onClick={() => fetchUjian(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition disabled:opacity-50"
            >
              <RefreshCw size={11} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Memperbarui..." : "Perbarui"}
            </button>
            {/* ✅ Timestamp last updated */}
            {lastUpdated && (
              <p className="text-[10px] text-teal-200">
                Diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            <div className="max-w-[200px]">
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <p className="text-xs text-teal-100">📋 Kelas Kamu</p>
                <p className="mt-1 text-sm font-medium leading-snug">
                  {totalUjian} ujian terdaftar semester ini. Yuk selesaikan semuanya!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      {/* ✅ Semua value dari data API, bukan hardcoded */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatsCard
          label="Ujian Aktif"
          value={String(countAktif)}
          icon={<Flame size={18} />}
          trend="Berlangsung sekarang"
          colorClass="text-teal-600 dark:text-teal-400"
          bgClass="bg-teal-50 dark:bg-teal-900/20"
          ringClass="ring-teal-200 dark:ring-teal-800"
        />
        <StatsCard
          label="Akan Datang"
          value={String(countAkanDatang)}
          icon={<AlarmClock size={18} />}
          trend="Minggu ini"
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-900/20"
          ringClass="ring-blue-200 dark:ring-blue-800"
        />
        <StatsCard
          label="Ujian Selesai"
          value={String(countSelesai)}
          icon={<CheckCircle size={18} />}
          trend="Semester ini"
          colorClass="text-green-600 dark:text-green-400"
          bgClass="bg-green-50 dark:bg-green-900/20"
          ringClass="ring-green-200 dark:ring-green-800"
        />
        <StatsCard
          label="Rata-rata Nilai"
          value={nilaiList.length > 0 ? String(rataRata) : "—"}
          icon={<Trophy size={18} />}
          trend={nilaiList.length > 0 ? `dari ${nilaiList.length} ujian` : "Belum ada ujian"}
          colorClass="text-amber-600 dark:text-amber-400"
          bgClass="bg-amber-50 dark:bg-amber-900/20"
          ringClass="ring-amber-200 dark:ring-amber-800"
        />
      </div>

      {/* ── Main Content Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">

        {/* ── Kolom Kiri ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari mata pelajaran atau guru..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
              />
            </div>
            <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>

          {/* Tabs — count dari data API */}
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-teal-500 text-white shadow-md shadow-teal-200/50 dark:shadow-teal-900/30"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.key ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}

            {/* ✅ Indikator real-time di mobile */}
            {isRefreshing && (
              <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
                <Loader2 size={10} className="animate-spin" />
                Memperbarui...
              </span>
            )}
          </div>

          <SectionHeader
            title={
              activeTab === "semua"       ? "Semua Ujian" :
              activeTab === "aktif"       ? "Ujian Berlangsung" :
              activeTab === "akan_datang" ? "Akan Datang" :
              "Ujian Selesai"
            }
          />

          {/* Ujian List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 py-12 text-center">
                <ClipboardList size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tidak ada ujian ditemukan</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              filtered.map((ujian) => (
                <UjianCard key={ujian.id} ujian={ujian} />
              ))
            )}
          </div>
        </div>

        {/* ── Kolom Kanan Sidebar ──────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Ujian Terdekat — dari data API */}
          <SectionHeader title="Ujian Terdekat" />
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden">
            {ujianList.filter((u) => u.status !== "selesai").slice(0, 3).length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 text-center">Tidak ada ujian mendatang</p>
            ) : (
              ujianList
                .filter((u) => u.status !== "selesai")
                .slice(0, 3)
                .map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold ${u.iconBg}`}>
                      {u.mataPelajaran.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{u.mataPelajaran}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <CalendarClock size={9} />
                        {u.deadline}
                      </p>
                    </div>
                    {u.status === "aktif" && (
                      <span className="shrink-0 flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
                        Live
                      </span>
                    )}
                    {u.status === "akan_datang" && (
                      <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        Segera
                      </span>
                    )}
                  </div>
                ))
            )}
          </div>

          {/* Progress Semester — dari data API */}
          <SectionHeader title="Progress Semester" />
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-4 space-y-3">
            {[
              { label: "Ujian Selesai",   value: countSelesai,  total: totalUjian || 1, color: "bg-teal-500",  display: `${countSelesai}/${totalUjian}` },
              { label: "Nilai Terbaik",   value: nilaiTerbaik,  total: 100,             color: "bg-amber-500", display: nilaiTerbaik || "—" },
              { label: "Rata-rata Nilai", value: rataRata,      total: 100,             color: "bg-blue-400",  display: rataRata || "—" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.label}</span>
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">{item.display}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${item.color}`}
                    style={{ width: `${Math.min(100, (item.value / item.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Nilai Terakhir — dari data API */}
          <SectionHeader title="Nilai Terakhir" href="/nilai" />
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden">
            {ujianList.filter((u) => u.status === "selesai").length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 text-center">Belum ada ujian selesai</p>
            ) : (
              ujianList
                .filter((u) => u.status === "selesai")
                .map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold ${u.iconBg}`}>
                      {u.mataPelajaran.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{u.mataPelajaran}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{u.deadline}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-teal-600 dark:text-teal-400">{u.nilai}</p>
                      <p className="text-[10px] font-bold text-gray-400">{u.grade}</p>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Notif card — dari data API */}
          {ujianAktifTerdekat && (
            <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={13} className="text-teal-600 dark:text-teal-400" />
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Pengingat</p>
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-400 leading-relaxed">
                Ujian <strong>{ujianAktifTerdekat.mataPelajaran}</strong> berlangsung{" "}
                <strong>{ujianAktifTerdekat.deadline}</strong>. Pastikan kamu sudah siap!
              </p>
            </div>
          )}

          {/* Error non-fatal: ada data lama, tapi refresh gagal */}
          {error && ujianList.length > 0 && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle size={12} />
                Gagal memperbarui. Menampilkan data terakhir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── UjianCard ────────────────────────────────────────────────────────────────
function UjianCard({ ujian }: { ujian: Ujian }) {
  const isAktif   = ujian.status === "aktif"
  const isSelesai = ujian.status === "selesai"

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-800/50 transition-all hover:shadow-md ${
      isAktif   ? "border-teal-300 dark:border-teal-700 shadow-sm shadow-teal-100 dark:shadow-teal-900/20"
                : "border-gray-100 dark:border-gray-700/60"
    }`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
        isAktif   ? "bg-teal-500" :
        isSelesai ? "bg-green-400" :
                    "bg-blue-400"
      }`} />

      <div className="pl-4 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Icon — huruf pertama mapel */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold ${ujian.iconBg}`}>
              {ujian.mataPelajaran.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <StatusBadge status={ujian.status} />
              </div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">{ujian.mataPelajaran}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{ujian.guru}</p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            {isSelesai ? (
              <div>
                <p className="text-xl font-black text-teal-600 dark:text-teal-400">{ujian.nilai ?? "—"}</p>
                <p className="text-[10px] font-bold text-gray-400">{ujian.grade}</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-gray-400 flex items-center justify-end gap-0.5">
                  <CalendarClock size={9} /> Deadline
                </p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mt-0.5">{ujian.deadline}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={11} /> {ujian.waktu}
          </span>
          <span className="flex items-center gap-1">
            <FileText size={11} /> {ujian.jumlahSoal} soal
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={11} /> {ujian.kelas}
          </span>
        </div>

        {!isSelesai && (
          <div className="mt-3 flex justify-end">
            <Link
              href={`/ujian/${ujian.id}`}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
                isAktif
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md shadow-teal-200/60 dark:shadow-teal-900/30"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {isAktif ? <><Zap size={12} /> Mulai Ujian</> : <><TimerReset size={12} /> Lihat Detail</>}
              <ChevronRight size={12} />
            </Link>
          </div>
        )}

        {isSelesai && (
          <div className="mt-3 flex justify-end">
            <Link
              href={`/ujian/${ujian.id}/hasil`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
            >
              <BarChart3 size={12} />
              Lihat Hasil
              <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UjianStatus }) {
  if (status === "aktif") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-900/30 px-2.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
        Berlangsung
      </span>
    )
  }
  if (status === "akan_datang") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
        <AlarmClock size={9} />
        Akan Datang
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2.5 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
      <CheckCircle size={9} />
      Selesai
    </span>
  )
}

// ─── StatsCard ────────────────────────────────────────────────────────────────
function StatsCard({ label, value, icon, trend, colorClass, bgClass, ringClass }: {
  label: string; value: string; icon: React.ReactNode
  trend: string; colorClass: string; bgClass: string; ringClass: string
}) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${bgClass} ${ringClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-black tabular-nums ${colorClass}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">{trend}</p>
    </div>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
        {title}
      </h3>
      {href && (
        <a href={href} className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors">
          Lihat semua →
        </a>
      )}
    </div>
  )
}