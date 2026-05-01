"use client"

import { useState } from "react"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Star,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Grade = "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D"
type Semester = "1" | "2"

interface NilaiUjian {
  id: string
  namaUjian: string
  tanggal: string
  nilai: number
  nilaiMaks: number
  benar: number
  salah: number
  kosong: number
  totalSoal: number
  durasi: string // e.g. "45 menit"
  status: "lulus" | "tidak_lulus"
}

interface NilaiMapel {
  id: string
  mataPelajaran: string
  guru: string
  semester: Semester
  nilaiHarian: number
  nilaiUTS: number
  nilaiUAS: number
  nilaiAkhir: number
  grade: Grade
  kkm: number
  trend: "naik" | "turun" | "stabil"
  ujianList: NilaiUjian[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const nilaiData: NilaiMapel[] = [
  {
    id: "1",
    mataPelajaran: "Matematika Peminatan",
    guru: "Bpk. Ahmad Fauzi, S.Pd",
    semester: "1",
    nilaiHarian: 88,
    nilaiUTS: 90,
    nilaiUAS: 95,
    nilaiAkhir: 92,
    grade: "A",
    kkm: 75,
    trend: "naik",
    ujianList: [
      { id: "u1", namaUjian: "Ulangan Harian 1 – Limit", tanggal: "10 Feb 2025", nilai: 85, nilaiMaks: 100, benar: 34, salah: 4, kosong: 2, totalSoal: 40, durasi: "60 menit", status: "lulus" },
      { id: "u2", namaUjian: "UTS Matematika", tanggal: "20 Mar 2025", nilai: 90, nilaiMaks: 100, benar: 36, salah: 3, kosong: 1, totalSoal: 40, durasi: "90 menit", status: "lulus" },
      { id: "u3", namaUjian: "Ulangan Harian 2 – Turunan", tanggal: "15 Apr 2025", nilai: 92, nilaiMaks: 100, benar: 37, salah: 2, kosong: 1, totalSoal: 40, durasi: "60 menit", status: "lulus" },
      { id: "u4", namaUjian: "UAS Matematika", tanggal: "10 Jun 2025", nilai: 95, nilaiMaks: 100, benar: 38, salah: 2, kosong: 0, totalSoal: 40, durasi: "90 menit", status: "lulus" },
    ],
  },
  {
    id: "2",
    mataPelajaran: "Fisika",
    guru: "Ibu Sari Dewi, M.Pd",
    semester: "1",
    nilaiHarian: 80,
    nilaiUTS: 82,
    nilaiUAS: 88,
    nilaiAkhir: 85,
    grade: "B+",
    kkm: 75,
    trend: "naik",
    ujianList: [
      { id: "u5", namaUjian: "Ulangan Harian 1 – Gerak", tanggal: "12 Feb 2025", nilai: 78, nilaiMaks: 100, benar: 23, salah: 5, kosong: 2, totalSoal: 30, durasi: "60 menit", status: "lulus" },
      { id: "u6", namaUjian: "UTS Fisika", tanggal: "22 Mar 2025", nilai: 82, nilaiMaks: 100, benar: 25, salah: 4, kosong: 1, totalSoal: 30, durasi: "90 menit", status: "lulus" },
      { id: "u7", namaUjian: "UAS Fisika", tanggal: "12 Jun 2025", nilai: 88, nilaiMaks: 100, benar: 26, salah: 3, kosong: 1, totalSoal: 30, durasi: "90 menit", status: "lulus" },
    ],
  },
  {
    id: "3",
    mataPelajaran: "Kimia",
    guru: "Bpk. Hendra, M.Si",
    semester: "1",
    nilaiHarian: 85,
    nilaiUTS: 87,
    nilaiUAS: 90,
    nilaiAkhir: 88,
    grade: "A-",
    kkm: 75,
    trend: "naik",
    ujianList: [
      { id: "u8", namaUjian: "Ulangan Harian 1 – Ikatan Kimia", tanggal: "14 Feb 2025", nilai: 83, nilaiMaks: 100, benar: 33, salah: 5, kosong: 2, totalSoal: 40, durasi: "60 menit", status: "lulus" },
      { id: "u9", namaUjian: "UTS Kimia", tanggal: "24 Mar 2025", nilai: 87, nilaiMaks: 100, benar: 35, salah: 4, kosong: 1, totalSoal: 40, durasi: "90 menit", status: "lulus" },
      { id: "u10", namaUjian: "UAS Kimia", tanggal: "14 Jun 2025", nilai: 90, nilaiMaks: 100, benar: 36, salah: 3, kosong: 1, totalSoal: 40, durasi: "90 menit", status: "lulus" },
    ],
  },
  {
    id: "4",
    mataPelajaran: "Biologi",
    guru: "Ibu Lestari, M.Pd",
    semester: "1",
    nilaiHarian: 89,
    nilaiUTS: 91,
    nilaiUAS: 93,
    nilaiAkhir: 91,
    grade: "A",
    kkm: 75,
    trend: "stabil",
    ujianList: [
      { id: "u11", namaUjian: "Ulangan Harian 1 – Sel", tanggal: "08 Feb 2025", nilai: 89, nilaiMaks: 100, benar: 36, salah: 3, kosong: 1, totalSoal: 40, durasi: "60 menit", status: "lulus" },
      { id: "u12", namaUjian: "UTS Biologi", tanggal: "18 Mar 2025", nilai: 91, nilaiMaks: 100, benar: 36, salah: 4, kosong: 0, totalSoal: 40, durasi: "90 menit", status: "lulus" },
      { id: "u13", namaUjian: "UAS Biologi", tanggal: "08 Jun 2025", nilai: 93, nilaiMaks: 100, benar: 37, salah: 3, kosong: 0, totalSoal: 40, durasi: "90 menit", status: "lulus" },
    ],
  },
  {
    id: "5",
    mataPelajaran: "Bahasa Indonesia",
    guru: "Ibu Ratna Sari, S.Pd",
    semester: "1",
    nilaiHarian: 75,
    nilaiUTS: 77,
    nilaiUAS: 80,
    nilaiAkhir: 78,
    grade: "B",
    kkm: 75,
    trend: "naik",
    ujianList: [
      { id: "u14", namaUjian: "Ulangan Harian 1", tanggal: "06 Feb 2025", nilai: 72, nilaiMaks: 100, benar: 29, salah: 8, kosong: 3, totalSoal: 40, durasi: "60 menit", status: "lulus" },
      { id: "u15", namaUjian: "UTS Bahasa Indonesia", tanggal: "16 Mar 2025", nilai: 77, nilaiMaks: 100, benar: 31, salah: 6, kosong: 3, totalSoal: 40, durasi: "90 menit", status: "lulus" },
      { id: "u16", namaUjian: "UAS Bahasa Indonesia", tanggal: "06 Jun 2025", nilai: 80, nilaiMaks: 100, benar: 32, salah: 5, kosong: 3, totalSoal: 40, durasi: "90 menit", status: "lulus" },
    ],
  },
  {
    id: "6",
    mataPelajaran: "Bahasa Inggris",
    guru: "Ibu Dewi Kusuma, S.Pd",
    semester: "1",
    nilaiHarian: 82,
    nilaiUTS: 80,
    nilaiUAS: 83,
    nilaiAkhir: 82,
    grade: "B+",
    kkm: 75,
    trend: "stabil",
    ujianList: [
      { id: "u17", namaUjian: "Ulangan Harian 1", tanggal: "11 Feb 2025", nilai: 80, nilaiMaks: 100, benar: 32, salah: 5, kosong: 3, totalSoal: 40, durasi: "60 menit", status: "lulus" },
      { id: "u18", namaUjian: "UTS Bahasa Inggris", tanggal: "21 Mar 2025", nilai: 80, nilaiMaks: 100, benar: 32, salah: 6, kosong: 2, totalSoal: 40, durasi: "90 menit", status: "lulus" },
      { id: "u19", namaUjian: "UAS Bahasa Inggris", tanggal: "11 Jun 2025", nilai: 83, nilaiMaks: 100, benar: 33, salah: 5, kosong: 2, totalSoal: 40, durasi: "90 menit", status: "lulus" },
    ],
  },
  {
    id: "7",
    mataPelajaran: "Sejarah Indonesia",
    guru: "Bpk. Sugeng, S.Pd",
    semester: "1",
    nilaiHarian: 70,
    nilaiUTS: 68,
    nilaiUAS: 72,
    nilaiAkhir: 70,
    grade: "B-",
    kkm: 75,
    trend: "turun",
    ujianList: [
      { id: "u20", namaUjian: "Ulangan Harian 1", tanggal: "09 Feb 2025", nilai: 72, nilaiMaks: 100, benar: 29, salah: 8, kosong: 3, totalSoal: 40, durasi: "60 menit", status: "lulus" },
      { id: "u21", namaUjian: "UTS Sejarah", tanggal: "19 Mar 2025", nilai: 68, nilaiMaks: 100, benar: 27, salah: 10, kosong: 3, totalSoal: 40, durasi: "90 menit", status: "tidak_lulus" },
      { id: "u22", namaUjian: "UAS Sejarah", tanggal: "09 Jun 2025", nilai: 72, nilaiMaks: 100, benar: 29, salah: 8, kosong: 3, totalSoal: 40, durasi: "90 menit", status: "lulus" },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGradeColor(grade: Grade): string {
  const map: Record<Grade, string> = {
    "A":  "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    "A-": "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800",
    "B+": "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    "B":  "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    "B-": "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    "C+": "text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
    "C":  "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
    "D":  "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400",
  }
  return map[grade]
}

function getNilaiColor(nilai: number, kkm: number): string {
  if (nilai >= 90) return "text-emerald-600 dark:text-emerald-400"
  if (nilai >= 80) return "text-teal-600 dark:text-teal-400"
  if (nilai >= kkm) return "text-blue-600 dark:text-blue-400"
  return "text-red-500 dark:text-red-400"
}

function getBarColor(nilai: number, kkm: number): string {
  if (nilai >= 90) return "bg-emerald-500"
  if (nilai >= 80) return "bg-teal-500"
  if (nilai >= kkm) return "bg-blue-500"
  return "bg-red-500"
}

function getRataRata(data: NilaiMapel[]): number {
  if (!data.length) return 0
  return Math.round(data.reduce((s, m) => s + m.nilaiAkhir, 0) / data.length)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NilaiPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"mapel" | "nilai" | "grade">("nilai")
  const [semester, setSemester] = useState<Semester | "semua">("semua")

  const filtered = nilaiData
    .filter((m) => {
      const matchSemester = semester === "semua" || m.semester === semester
      const matchSearch =
        search === "" ||
        m.mataPelajaran.toLowerCase().includes(search.toLowerCase()) ||
        m.guru.toLowerCase().includes(search.toLowerCase())
      return matchSemester && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === "nilai") return b.nilaiAkhir - a.nilaiAkhir
      if (sortBy === "grade") return a.grade.localeCompare(b.grade)
      return a.mataPelajaran.localeCompare(b.mataPelajaran)
    })

  const rataRata = getRataRata(filtered)
  const tertinggi = filtered.reduce((m, c) => (c.nilaiAkhir > m.nilaiAkhir ? c : m), filtered[0])
  const terendah = filtered.reduce((m, c) => (c.nilaiAkhir < m.nilaiAkhir ? c : m), filtered[0])
  const lulusCount = filtered.filter((m) => m.nilaiAkhir >= m.kkm).length

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

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
              <BarChart3 size={16} className="text-teal-200" strokeWidth={2} />
              <p className="text-xs font-medium text-teal-100 uppercase tracking-wider">Rekap Akademik</p>
            </div>
            <h1 className="text-2xl font-bold">Nilai Saya</h1>
            <p className="text-sm text-teal-100 mt-0.5">
              Semester {semester === "semua" ? "1 & 2" : semester} &bull; {filtered.length} mata pelajaran
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Star size={11} /> Rata-rata {rataRata}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <CheckCircle2 size={11} /> {lulusCount}/{filtered.length} Lulus KKM
              </span>
            </div>
          </div>

          {/* Big score circle */}
          <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
            <span className="text-2xl font-black">{rataRata}</span>
            <span className="text-[10px] text-teal-100 font-medium">Rata-rata</span>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Tertinggi",
            value: tertinggi?.nilaiAkhir ?? "-",
            sub: tertinggi?.mataPelajaran ?? "",
            icon: <TrendingUp size={16} strokeWidth={2} />,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            label: "Terendah",
            value: terendah?.nilaiAkhir ?? "-",
            sub: terendah?.mataPelajaran ?? "",
            icon: <TrendingDown size={16} strokeWidth={2} />,
            color: "text-red-500 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-900/20",
          },
          {
            label: "Lulus KKM",
            value: `${lulusCount}/${filtered.length}`,
            sub: "mata pelajaran",
            icon: <Target size={16} strokeWidth={2} />,
            color: "text-teal-600 dark:text-teal-400",
            bg: "bg-teal-50 dark:bg-teal-900/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-3 flex flex-col gap-1.5"
          >
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

      {/* ── Filter & Search ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari mata pelajaran atau guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 h-9 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-9 px-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all cursor-pointer"
        >
          <option value="nilai">Nilai ↓</option>
          <option value="grade">Grade</option>
          <option value="mapel">A–Z</option>
        </select>
      </div>

      {/* ── Nilai List ── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
              <BookOpen size={24} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Tidak ada data</p>
            <p className="text-xs text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          filtered.map((mapel) => (
            <NilaiCard
              key={mapel.id}
              mapel={mapel}
              expanded={expandedId === mapel.id}
              onToggle={() => toggle(mapel.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Nilai Card ───────────────────────────────────────────────────────────────

function NilaiCard({
  mapel,
  expanded,
  onToggle,
}: {
  mapel: NilaiMapel
  expanded: boolean
  onToggle: () => void
}) {
  const isLulus = mapel.nilaiAkhir >= mapel.kkm
  const pct = Math.min((mapel.nilaiAkhir / 100) * 100, 100)

  const trendIcon =
    mapel.trend === "naik" ? (
      <TrendingUp size={12} strokeWidth={2.5} className="text-emerald-500" />
    ) : mapel.trend === "turun" ? (
      <TrendingDown size={12} strokeWidth={2.5} className="text-red-400" />
    ) : (
      <Minus size={12} strokeWidth={2.5} className="text-gray-400" />
    )

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shrink-0">
          <BookOpen size={16} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {mapel.mataPelajaran}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {/* Grade badge */}
              <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-bold ${getGradeColor(mapel.grade)}`}>
                {mapel.grade}
              </span>
              {/* Chevron */}
              <span className="text-gray-400">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{mapel.guru}</p>

          {/* Progress bar */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(mapel.nilaiAkhir, mapel.kkm)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center gap-1">
              {trendIcon}
              <span className={`text-sm font-black ${getNilaiColor(mapel.nilaiAkhir, mapel.kkm)}`}>
                {mapel.nilaiAkhir}
              </span>
            </div>
          </div>

          {/* KKM indicator */}
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${isLulus ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {isLulus
                ? <><CheckCircle2 size={10} /> Lulus KKM {mapel.kkm}</>
                : <><XCircle size={10} /> Di bawah KKM {mapel.kkm}</>
              }
            </span>
            <span className="text-[10px] text-gray-400">
              UH {mapel.nilaiHarian} · UTS {mapel.nilaiUTS} · UAS {mapel.nilaiUAS}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded: Component breakdown + Ujian list */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 pt-3 space-y-4">
          {/* Breakdown chart */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Komponen Nilai
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Nilai Harian", value: mapel.nilaiHarian, weight: "40%" },
                { label: "UTS", value: mapel.nilaiUTS, weight: "30%" },
                { label: "UAS", value: mapel.nilaiUAS, weight: "30%" },
              ].map((comp) => (
                <div
                  key={comp.label}
                  className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-2.5 text-center"
                >
                  <p className={`text-lg font-black ${getNilaiColor(comp.value, mapel.kkm)}`}>
                    {comp.value}
                  </p>
                  <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 leading-tight mt-0.5">
                    {comp.label}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Bobot {comp.weight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ujian history */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Riwayat Ujian
            </p>
            <div className="space-y-2">
              {mapel.ujianList.map((ujian) => (
                <UjianRow key={ujian.id} ujian={ujian} kkm={mapel.kkm} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Ujian Row ────────────────────────────────────────────────────────────────

function UjianRow({ ujian, kkm }: { ujian: NilaiUjian; kkm: number }) {
  const pct = Math.round((ujian.benar / ujian.totalSoal) * 100)

  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 p-3">
      <div className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${ujian.status === "lulus" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-red-50 dark:bg-red-900/20 text-red-400"}`}>
        <FileText size={13} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
            {ujian.namaUjian}
          </p>
          <span className={`text-sm font-black shrink-0 ${getNilaiColor(ujian.nilai, kkm)}`}>
            {ujian.nilai}
          </span>
        </div>
        <div className="flex items-center gap-2.5 mt-1 text-[10px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={9} strokeWidth={2} /> {ujian.tanggal}
          </span>
          <span className="flex items-center gap-1 text-emerald-500">
            <CheckCircle2 size={9} /> {ujian.benar} benar
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <XCircle size={9} /> {ujian.salah} salah
          </span>
        </div>
      </div>
    </div>
  )
}