"use client"

import { useState } from "react"
import {
  Clock3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  BookOpen,
  FileText,
  BarChart3,
  Timer,
  Hash,
  Trophy,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  ChevronRight,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusUjian = "lulus" | "tidak_lulus" | "tidak_hadir"
type FilterStatus = "semua" | StatusUjian
type FilterMapel = "semua" | string

interface DetailJawaban {
  nomor: number
  status: "benar" | "salah" | "kosong"
}

interface RiwayatItem {
  id: string
  namaUjian: string
  mataPelajaran: string
  guru: string
  tanggal: string       // "12 Januari 2025"
  jamMulai: string      // "08:00"
  jamSelesai: string    // "09:30"
  durasiDikerjakan: string // "85 menit"
  totalDurasi: string   // "90 menit"
  nilai: number
  nilaiMaks: number
  benar: number
  salah: number
  kosong: number
  totalSoal: number
  kkm: number
  status: StatusUjian
  peringkat?: number    // peringkat di kelas
  totalSiswa?: number
  kelas: string
  catatan?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const riwayatData: RiwayatItem[] = [
  {
    id: "1",
    namaUjian: "UAS Matematika Peminatan",
    mataPelajaran: "Matematika Peminatan",
    guru: "Bpk. Ahmad Fauzi, S.Pd",
    tanggal: "10 Juni 2025",
    jamMulai: "08:00",
    jamSelesai: "09:30",
    durasiDikerjakan: "85 menit",
    totalDurasi: "90 menit",
    nilai: 95,
    nilaiMaks: 100,
    benar: 38,
    salah: 2,
    kosong: 0,
    totalSoal: 40,
    kkm: 75,
    status: "lulus",
    peringkat: 2,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "2",
    namaUjian: "UAS Fisika",
    mataPelajaran: "Fisika",
    guru: "Ibu Sari Dewi, M.Pd",
    tanggal: "12 Juni 2025",
    jamMulai: "09:45",
    jamSelesai: "11:15",
    durasiDikerjakan: "80 menit",
    totalDurasi: "90 menit",
    nilai: 88,
    nilaiMaks: 100,
    benar: 26,
    salah: 3,
    kosong: 1,
    totalSoal: 30,
    kkm: 75,
    status: "lulus",
    peringkat: 5,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "3",
    namaUjian: "UAS Kimia",
    mataPelajaran: "Kimia",
    guru: "Bpk. Hendra, M.Si",
    tanggal: "14 Juni 2025",
    jamMulai: "08:00",
    jamSelesai: "09:30",
    durasiDikerjakan: "88 menit",
    totalDurasi: "90 menit",
    nilai: 90,
    nilaiMaks: 100,
    benar: 36,
    salah: 3,
    kosong: 1,
    totalSoal: 40,
    kkm: 75,
    status: "lulus",
    peringkat: 3,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "4",
    namaUjian: "UAS Biologi",
    mataPelajaran: "Biologi",
    guru: "Ibu Lestari, M.Pd",
    tanggal: "16 Juni 2025",
    jamMulai: "10:00",
    jamSelesai: "11:30",
    durasiDikerjakan: "85 menit",
    totalDurasi: "90 menit",
    nilai: 93,
    nilaiMaks: 100,
    benar: 37,
    salah: 3,
    kosong: 0,
    totalSoal: 40,
    kkm: 75,
    status: "lulus",
    peringkat: 2,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "5",
    namaUjian: "UAS Bahasa Indonesia",
    mataPelajaran: "Bahasa Indonesia",
    guru: "Ibu Ratna Sari, S.Pd",
    tanggal: "06 Juni 2025",
    jamMulai: "08:00",
    jamSelesai: "09:30",
    durasiDikerjakan: "90 menit",
    totalDurasi: "90 menit",
    nilai: 80,
    nilaiMaks: 100,
    benar: 32,
    salah: 5,
    kosong: 3,
    totalSoal: 40,
    kkm: 75,
    status: "lulus",
    peringkat: 12,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "6",
    namaUjian: "UTS Sejarah Indonesia",
    mataPelajaran: "Sejarah Indonesia",
    guru: "Bpk. Sugeng, S.Pd",
    tanggal: "19 Maret 2025",
    jamMulai: "13:00",
    jamSelesai: "14:30",
    durasiDikerjakan: "75 menit",
    totalDurasi: "90 menit",
    nilai: 68,
    nilaiMaks: 100,
    benar: 27,
    salah: 10,
    kosong: 3,
    totalSoal: 40,
    kkm: 75,
    status: "tidak_lulus",
    peringkat: 28,
    totalSiswa: 32,
    kelas: "XII IPA 1",
    catatan: "Perlu remedial pada bab Kemerdekaan",
  },
  {
    id: "7",
    namaUjian: "UTS Matematika Peminatan",
    mataPelajaran: "Matematika Peminatan",
    guru: "Bpk. Ahmad Fauzi, S.Pd",
    tanggal: "20 Maret 2025",
    jamMulai: "08:00",
    jamSelesai: "09:30",
    durasiDikerjakan: "88 menit",
    totalDurasi: "90 menit",
    nilai: 90,
    nilaiMaks: 100,
    benar: 36,
    salah: 3,
    kosong: 1,
    totalSoal: 40,
    kkm: 75,
    status: "lulus",
    peringkat: 3,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "8",
    namaUjian: "Ulangan Harian 2 – Turunan",
    mataPelajaran: "Matematika Peminatan",
    guru: "Bpk. Ahmad Fauzi, S.Pd",
    tanggal: "15 April 2025",
    jamMulai: "10:00",
    jamSelesai: "11:00",
    durasiDikerjakan: "58 menit",
    totalDurasi: "60 menit",
    nilai: 92,
    nilaiMaks: 100,
    benar: 37,
    salah: 2,
    kosong: 1,
    totalSoal: 40,
    kkm: 75,
    status: "lulus",
    peringkat: 2,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "9",
    namaUjian: "UTS Fisika",
    mataPelajaran: "Fisika",
    guru: "Ibu Sari Dewi, M.Pd",
    tanggal: "22 Maret 2025",
    jamMulai: "09:45",
    jamSelesai: "11:15",
    durasiDikerjakan: "82 menit",
    totalDurasi: "90 menit",
    nilai: 82,
    nilaiMaks: 100,
    benar: 25,
    salah: 4,
    kosong: 1,
    totalSoal: 30,
    kkm: 75,
    status: "lulus",
    peringkat: 7,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
  {
    id: "10",
    namaUjian: "Ulangan Harian 1 – Gerak",
    mataPelajaran: "Fisika",
    guru: "Ibu Sari Dewi, M.Pd",
    tanggal: "12 Februari 2025",
    jamMulai: "08:00",
    jamSelesai: "09:00",
    durasiDikerjakan: "55 menit",
    totalDurasi: "60 menit",
    nilai: 78,
    nilaiMaks: 100,
    benar: 23,
    salah: 5,
    kosong: 2,
    totalSoal: 30,
    kkm: 75,
    status: "lulus",
    peringkat: 10,
    totalSiswa: 32,
    kelas: "XII IPA 1",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNilaiColor(nilai: number, kkm: number) {
  if (nilai >= 90) return "text-emerald-600 dark:text-emerald-400"
  if (nilai >= 80) return "text-teal-600 dark:text-teal-400"
  if (nilai >= kkm) return "text-blue-600 dark:text-blue-400"
  return "text-red-500 dark:text-red-400"
}

function getBarColor(nilai: number, kkm: number) {
  if (nilai >= 90) return "bg-emerald-500"
  if (nilai >= 80) return "bg-teal-500"
  if (nilai >= kkm) return "bg-blue-500"
  return "bg-red-500"
}

const statusCfg: Record<
  StatusUjian,
  { label: string; badge: string; dot: string; icon: React.ReactNode }
> = {
  lulus: {
    label: "Lulus",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
    icon: <CheckCircle2 size={11} strokeWidth={2.5} />,
  },
  tidak_lulus: {
    label: "Tidak Lulus",
    badge: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    dot: "bg-red-500",
    icon: <XCircle size={11} strokeWidth={2.5} />,
  },
  tidak_hadir: {
    label: "Tidak Hadir",
    badge: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600",
    dot: "bg-gray-400",
    icon: <AlertCircle size={11} strokeWidth={2.5} />,
  },
}

const uniqueMapel = ["semua", ...Array.from(new Set(riwayatData.map((r) => r.mataPelajaran)))]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RiwayatPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua")
  const [filterMapel, setFilterMapel] = useState<FilterMapel>("semua")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showFilter, setShowFilter] = useState(false)

  const filtered = riwayatData.filter((r) => {
    const matchStatus = filterStatus === "semua" || r.status === filterStatus
    const matchMapel = filterMapel === "semua" || r.mataPelajaran === filterMapel
    const matchSearch =
      search === "" ||
      r.namaUjian.toLowerCase().includes(search.toLowerCase()) ||
      r.mataPelajaran.toLowerCase().includes(search.toLowerCase()) ||
      r.guru.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchMapel && matchSearch
  })

  // Summary stats
  const totalLulus = riwayatData.filter((r) => r.status === "lulus").length
  const rataRata = riwayatData.length
    ? Math.round(riwayatData.reduce((s, r) => s + r.nilai, 0) / riwayatData.length)
    : 0
  const tertinggi = riwayatData.reduce((m, r) => (r.nilai > m.nilai ? r : m), riwayatData[0])

  const toggle = (id: string) => setExpandedId((p) => (p === id ? null : id))

  return (
    <div className="space-y-5 pb-6">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-20 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-emerald-400/20" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock3 size={16} className="text-teal-200" strokeWidth={2} />
              <p className="text-xs font-medium text-teal-100 uppercase tracking-wider">Rekam Jejak</p>
            </div>
            <h1 className="text-2xl font-bold">Riwayat Ujian</h1>
            <p className="text-sm text-teal-100 mt-0.5">
              {riwayatData.length} ujian diikuti &bull; Semester ini
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <CheckCircle2 size={11} /> {totalLulus} Lulus
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <BarChart3 size={11} /> Rata-rata {rataRata}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Trophy size={11} /> Terbaik {tertinggi?.nilai}
              </span>
            </div>
          </div>

          {/* Score circle */}
          <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
            <span className="text-2xl font-black">{rataRata}</span>
            <span className="text-[10px] text-teal-100 font-medium">Rata-rata</span>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: <Hash size={15} strokeWidth={2} />,
            value: riwayatData.length,
            label: "Total Ujian",
            sub: "diikuti",
            color: "text-teal-600 dark:text-teal-400",
            bg: "bg-teal-50 dark:bg-teal-900/20",
          },
          {
            icon: <Trophy size={15} strokeWidth={2} />,
            value: tertinggi?.nilai ?? "-",
            label: "Nilai Terbaik",
            sub: tertinggi?.mataPelajaran?.split(" ")[0] ?? "",
            color: "text-amber-500 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
          },
          {
            icon: <TrendingUp size={15} strokeWidth={2} />,
            value: `${Math.round((totalLulus / riwayatData.length) * 100)}%`,
            label: "Tingkat Lulus",
            sub: `${totalLulus} dari ${riwayatData.length}`,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-3 flex flex-col gap-1.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <p className={`text-lg font-black leading-none ${s.color}`}>{s.value}</p>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari ujian, mata pelajaran, guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 h-9 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center justify-center h-9 w-9 rounded-xl border transition-all ${
              showFilter || filterStatus !== "semua" || filterMapel !== "semua"
                ? "bg-teal-600 border-teal-600 text-white"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-teal-400"
            }`}
          >
            <Filter size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="flex items-center gap-2 flex-wrap rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-3">
            <div className="flex-1 min-w-[140px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Status</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full h-8 px-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="semua">Semua Status</option>
                <option value="lulus">Lulus</option>
                <option value="tidak_lulus">Tidak Lulus</option>
                <option value="tidak_hadir">Tidak Hadir</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Mata Pelajaran</p>
              <select
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                {uniqueMapel.map((m) => (
                  <option key={m} value={m}>
                    {m === "semua" ? "Semua Mapel" : m}
                  </option>
                ))}
              </select>
            </div>
            {(filterStatus !== "semua" || filterMapel !== "semua") && (
              <button
                onClick={() => { setFilterStatus("semua"); setFilterMapel("semua") }}
                className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors mt-auto"
              >
                <RotateCcw size={10} /> Reset
              </button>
            )}
          </div>
        )}

        {/* Result count */}
        <p className="text-xs text-gray-400 dark:text-gray-500 px-0.5">
          Menampilkan <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> dari {riwayatData.length} ujian
        </p>
      </div>

      {/* ── Riwayat List ── */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <RiwayatCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Riwayat Card ─────────────────────────────────────────────────────────────

function RiwayatCard({
  item,
  expanded,
  onToggle,
}: {
  item: RiwayatItem
  expanded: boolean
  onToggle: () => void
}) {
  const cfg = statusCfg[item.status]
  const pct = Math.round((item.benar / item.totalSoal) * 100)
  const barColor = getBarColor(item.nilai, item.kkm)
  const nilaiColor = getNilaiColor(item.nilai, item.kkm)

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Top strip for lulus */}
      {item.status === "lulus" && (
        <div className="h-0.5 bg-gradient-to-r from-teal-400 to-emerald-400" />
      )}
      {item.status === "tidak_lulus" && (
        <div className="h-0.5 bg-gradient-to-r from-red-400 to-orange-400" />
      )}

      <button className="w-full text-left p-4" onClick={onToggle}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
            item.status === "lulus"
              ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
              : item.status === "tidak_lulus"
              ? "bg-red-50 dark:bg-red-900/20 text-red-500"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400"
          }`}>
            <FileText size={16} strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate">
                  {item.namaUjian}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {item.mataPelajaran} &bull; {item.guru}
                </p>
              </div>
              {/* Score */}
              <div className="text-right shrink-0">
                <p className={`text-xl font-black leading-none ${nilaiColor}`}>{item.nilai}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">/{item.nilaiMaks}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${item.nilai}%` }}
              />
            </div>

            {/* Meta row */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                {cfg.icon} {cfg.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <CalendarDays size={9} strokeWidth={2} /> {item.tanggal}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <Timer size={9} strokeWidth={2} /> {item.durasiDikerjakan}
              </span>
              {item.peringkat && (
                <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                  <Trophy size={9} /> #{item.peringkat} dari {item.totalSiswa}
                </span>
              )}
            </div>
          </div>

          {/* Chevron */}
          <div className="text-gray-400 shrink-0 mt-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* ── Expanded Detail ── */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
          {/* Catatan remedial */}
          {item.catatan && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-amber-700 dark:text-amber-400">{item.catatan}</p>
            </div>
          )}

          {/* Jawaban breakdown */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
              Analisis Jawaban
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Benar", value: item.benar, pct: Math.round((item.benar / item.totalSoal) * 100), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", bar: "bg-emerald-500", icon: <CheckCircle2 size={13} strokeWidth={2.5} /> },
                { label: "Salah", value: item.salah, pct: Math.round((item.salah / item.totalSoal) * 100), color: "text-red-500 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", bar: "bg-red-500", icon: <XCircle size={13} strokeWidth={2.5} /> },
                { label: "Kosong", value: item.kosong, pct: Math.round((item.kosong / item.totalSoal) * 100), color: "text-gray-500 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-700", bar: "bg-gray-400", icon: <AlertCircle size={13} strokeWidth={2.5} /> },
              ].map((row) => (
                <div key={row.label} className={`rounded-xl ${row.bg} p-3 text-center`}>
                  <div className={`flex items-center justify-center mb-1 ${row.color}`}>
                    {row.icon}
                  </div>
                  <p className={`text-xl font-black leading-none ${row.color}`}>{row.value}</p>
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{row.label}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{row.pct}%</p>
                </div>
              ))}
            </div>

            {/* Visual bar breakdown */}
            <div className="mt-3 h-2 rounded-full overflow-hidden flex gap-px">
              <div className="bg-emerald-500 h-full rounded-l-full transition-all" style={{ width: `${(item.benar / item.totalSoal) * 100}%` }} />
              <div className="bg-red-400 h-full transition-all" style={{ width: `${(item.salah / item.totalSoal) * 100}%` }} />
              <div className="bg-gray-300 dark:bg-gray-600 h-full rounded-r-full transition-all" style={{ width: `${(item.kosong / item.totalSoal) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-gray-400">
              <span>{item.totalSoal} total soal</span>
              <span>KKM {item.kkm}</span>
            </div>
          </div>

          {/* Detail info grid */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
              Detail Pelaksanaan
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Tanggal", value: item.tanggal, icon: <CalendarDays size={12} strokeWidth={2} /> },
                { label: "Waktu", value: `${item.jamMulai} – ${item.jamSelesai}`, icon: <Clock3 size={12} strokeWidth={2} /> },
                { label: "Durasi Dikerjakan", value: item.durasiDikerjakan, icon: <Timer size={12} strokeWidth={2} /> },
                { label: "Total Durasi", value: item.totalDurasi, icon: <Timer size={12} strokeWidth={2} /> },
                { label: "Kelas", value: item.kelas, icon: <BookOpen size={12} strokeWidth={2} /> },
                { label: "Peringkat", value: item.peringkat ? `#${item.peringkat} / ${item.totalSiswa}` : "-", icon: <Trophy size={12} strokeWidth={2} /> },
              ].map((info) => (
                <div key={info.label} className="flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-gray-700/40 px-3 py-2.5">
                  <span className="text-gray-400 mt-0.5 shrink-0">{info.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{info.label}</p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <a
            href={`/ujian/${item.id}/hasil`}
            className="flex items-center justify-between w-full rounded-xl bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border border-teal-200 dark:border-teal-800 px-4 py-2.5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-teal-600 dark:text-teal-400" strokeWidth={2} />
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">Lihat Pembahasan Soal</span>
            </div>
            <ChevronRight size={14} className="text-teal-500" strokeWidth={2} />
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
        <Clock3 size={28} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Tidak ada riwayat</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[200px]">
        Coba ubah filter atau kata kunci pencarian
      </p>
    </div>
  )
}