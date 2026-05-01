"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  TrendingUp,
  Share2,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Zap,
  Award,
  BarChart3,
} from "lucide-react"
import { useState } from "react"

// ─── Mock Result Data ──────────────────────────────────────────────────────────
const hasilData = {
  mataPelajaran: "Matematika Peminatan",
  mapelIcon: "📐",
  kelas: "XII IPA 1",
  guru: "Bpk. Ahmad Fauzi, S.Pd",
  tanggal: "Rabu, 23 April 2025",
  durasi: "72 menit",
  jumlahSoal: 40,
  benar: 34,
  salah: 4,
  kosong: 2,
  nilai: 88,
  grade: "A−",
  peringkat: 4,
  totalSiswa: 32,
  nilaiMin: 62,
  nilaiMax: 97,
  nilaiRataKelas: 79,
  riwayatNilai: [75, 80, 82, 88],
}

const detailSoal = [
  { no: 1, status: "benar",  jawaban: "A", kunci: "A" },
  { no: 2, status: "benar",  jawaban: "A", kunci: "A" },
  { no: 3, status: "salah",  jawaban: "A", kunci: "B" },
  { no: 4, status: "benar",  jawaban: "A", kunci: "A" },
  { no: 5, status: "kosong", jawaban: "-", kunci: "C" },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UjianHasilPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [showDetail, setShowDetail] = useState(false)
  const { nilai, grade, benar, salah, kosong, jumlahSoal } = hasilData

  const persenBenar = Math.round((benar / jumlahSoal) * 100)
  const isExcellent = nilai >= 90
  const isGood      = nilai >= 75

  const gradeColor = isExcellent
    ? "from-amber-400 to-orange-500"
    : isGood
    ? "from-teal-400 to-emerald-500"
    : "from-red-400 to-orange-500"

  return (
    // Gunakan padding & max-width yang sama dengan halaman daftar ujian
    <div className="w-full px-6 lg:px-8 max-w-screen-xl mx-auto">
      <div className="space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/ujian"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            Daftar Ujian
          </Link>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95">
            <Share2 size={13} />
            Bagikan
          </button>
        </div>

        {/* ── Hero Score Card ─────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradeColor} p-7 text-white shadow-xl`}>
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-20 bottom-0 h-32 w-32 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute left-1/2 -top-6 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between gap-6">
            {/* Left: info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-2xl">
                  {hasilData.mapelIcon}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold truncate">{hasilData.mataPelajaran}</p>
                  <p className="text-xs opacity-75">{hasilData.guru}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                  {hasilData.kelas}
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                  {hasilData.tanggal}
                </span>
              </div>

              {/* Motivasi */}
              <p className="text-sm font-semibold opacity-90 leading-relaxed">
                {isExcellent
                  ? "🎉 Luar biasa! Kamu berada di puncak kelas."
                  : isGood
                  ? "👏 Bagus! Terus pertahankan prestasimu."
                  : "💪 Jangan menyerah, tetap semangat belajar!"}
              </p>

              {/* Quick stats inline */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90">
                  <CheckCircle2 size={13} />
                  <span>{benar} Benar</span>
                </div>
                <div className="w-px h-3 bg-white/30" />
                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90">
                  <XCircle size={13} />
                  <span>{salah} Salah</span>
                </div>
                <div className="w-px h-3 bg-white/30" />
                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90">
                  <Clock size={13} />
                  <span>{hasilData.durasi}</span>
                </div>
              </div>
            </div>

            {/* Right: Score circle */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30 shadow-inner">
                <span className="text-4xl font-black tabular-nums leading-none">{nilai}</span>
                <span className="text-[10px] font-bold opacity-75 mt-0.5 tracking-widest">NILAI</span>
              </div>
              <span className="rounded-full bg-white/25 backdrop-blur-sm px-3.5 py-1 text-sm font-black ring-1 ring-white/20">
                {grade}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Content: 2-column on large screens ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left column (2/3 width) ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatBox
                icon={<CheckCircle2 size={17} className="text-emerald-500" />}
                value={benar}
                label="Benar"
                sub={`${persenBenar}%`}
                bg="bg-emerald-50 dark:bg-emerald-900/20"
                ring="ring-emerald-200 dark:ring-emerald-800"
                valueColor="text-emerald-600 dark:text-emerald-400"
              />
              <StatBox
                icon={<XCircle size={17} className="text-red-500" />}
                value={salah}
                label="Salah"
                sub={`${Math.round((salah / jumlahSoal) * 100)}%`}
                bg="bg-red-50 dark:bg-red-900/20"
                ring="ring-red-200 dark:ring-red-800"
                valueColor="text-red-600 dark:text-red-400"
              />
              <StatBox
                icon={<BookOpen size={17} className="text-gray-400" />}
                value={kosong}
                label="Kosong"
                sub={`${Math.round((kosong / jumlahSoal) * 100)}%`}
                bg="bg-gray-50 dark:bg-gray-800"
                ring="ring-gray-200 dark:ring-gray-700"
                valueColor="text-gray-600 dark:text-gray-300"
              />
            </div>

            {/* Trend Chart */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30">
                    <TrendingUp size={14} className="text-teal-500" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tren Nilai Matematika</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">4 Ujian Terakhir</span>
              </div>
              <div className="flex items-end gap-3 h-20">
                {hasilData.riwayatNilai.map((n, i) => {
                  const isLast   = i === hasilData.riwayatNilai.length - 1
                  const heightPct = ((n - 50) / 50) * 100
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className={`text-xs font-bold ${isLast ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}`}>
                        {n}
                      </span>
                      <div
                        className={`w-full rounded-t-xl transition-all ${isLast ? "bg-gradient-to-t from-teal-500 to-emerald-400 shadow-sm shadow-teal-200" : "bg-gray-100 dark:bg-gray-700"}`}
                        style={{ height: `${heightPct}%`, minHeight: "10px" }}
                      />
                      <span className="text-[10px] text-gray-400">U{i + 1}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detail Soal */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 overflow-hidden">
              <button
                onClick={() => setShowDetail(!showDetail)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <span className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30">
                    <BookOpen size={13} className="text-teal-500" />
                  </div>
                  Detail Jawaban
                </span>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs font-medium">{showDetail ? "Sembunyikan" : "Lihat Detail"}</span>
                  {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {showDetail && (
                <div className="border-t border-gray-100 dark:border-gray-700/60 divide-y divide-gray-50 dark:divide-gray-700/40">
                  {detailSoal.map((soal) => (
                    <div key={soal.no} className="flex items-center gap-4 px-5 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        {soal.no}
                      </span>
                      <div className="flex-1">
                        <span className={`text-xs font-semibold ${
                          soal.status === "benar"  ? "text-emerald-600 dark:text-emerald-400" :
                          soal.status === "salah"  ? "text-red-600 dark:text-red-400" :
                          "text-gray-400"
                        }`}>
                          {soal.status === "benar" ? "✓ Benar" : soal.status === "salah" ? "✗ Salah" : "— Kosong"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span>Jawaban: <strong className="text-gray-600 dark:text-gray-300">{soal.jawaban}</strong></span>
                        {soal.status !== "benar" && (
                          <span>Kunci: <strong className="text-emerald-600 dark:text-emerald-400">{soal.kunci}</strong></span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="px-5 py-3 text-[11px] text-gray-400 text-center bg-gray-50/50 dark:bg-gray-700/20">
                    Menampilkan 5 dari {jumlahSoal} soal · Hubungi guru untuk detail lengkap
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column (1/3 width) ─────────────────────────────────── */}
          <div className="space-y-5">

            {/* Info Cards */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                  <BarChart3 size={13} className="text-indigo-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Statistik Kelas</span>
              </div>

              <InfoCard
                icon={<Clock size={14} className="text-teal-500" />}
                label="Durasi Pengerjaan"
                value={hasilData.durasi}
                bg="bg-teal-50 dark:bg-teal-900/20"
              />
              <InfoCard
                icon={<Trophy size={14} className="text-amber-500" />}
                label="Peringkat Kelas"
                value={`#${hasilData.peringkat} dari ${hasilData.totalSiswa}`}
                bg="bg-amber-50 dark:bg-amber-900/20"
              />
              <InfoCard
                icon={<Target size={14} className="text-indigo-500" />}
                label="Rata-rata Kelas"
                value={String(hasilData.nilaiRataKelas)}
                bg="bg-indigo-50 dark:bg-indigo-900/20"
              />
              <InfoCard
                icon={<Zap size={14} className="text-orange-500" />}
                label="Nilai Tertinggi"
                value={String(hasilData.nilaiMax)}
                bg="bg-orange-50 dark:bg-orange-900/20"
              />
            </div>

            {/* Pencapaian */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
                  <Award size={13} className="text-amber-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pencapaian</span>
              </div>
              <div className="space-y-2.5">
                <AchievementBadge
                  emoji="🎯"
                  label="Akurasi Tinggi"
                  desc={`${persenBenar}% jawaban benar`}
                  active={persenBenar >= 80}
                />
                <AchievementBadge
                  emoji="⚡"
                  label="Penyelesai Cepat"
                  desc="Selesai dalam 72 menit"
                  active={true}
                />
                <AchievementBadge
                  emoji="📈"
                  label="Nilai Meningkat"
                  desc="Naik dari ujian sebelumnya"
                  active={true}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-200/60 dark:shadow-teal-900/30 transition active:scale-95">
                <Star size={15} />
                Simpan Hasil
              </button>
              <Link
                href="/ujian"
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 py-3.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95"
              >
                <ArrowLeft size={14} />
                Kembali ke Daftar
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatBox({
  icon, value, label, sub, bg, ring, valueColor,
}: {
  icon: React.ReactNode
  value: number
  label: string
  sub: string
  bg: string
  ring: string
  valueColor: string
}) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-2xl p-4 ring-1 ${bg} ${ring}`}>
      {icon}
      <span className={`text-2xl font-black tabular-nums mt-0.5 ${valueColor}`}>{value}</span>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      <span className="text-[10px] text-gray-400">{sub}</span>
    </div>
  )
}

function InfoCard({
  icon, label, value, bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  bg: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{value}</p>
      </div>
    </div>
  )
}

function AchievementBadge({
  emoji, label, desc, active,
}: {
  emoji: string
  label: string
  desc: string
  active: boolean
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl p-2.5 transition ${
      active
        ? "bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-200 dark:ring-amber-800"
        : "bg-gray-50 dark:bg-gray-700/30 opacity-40"
    }`}>
      <span className="text-lg">{emoji}</span>
      <div>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-[10px] text-gray-400">{desc}</p>
      </div>
    </div>
  )
}