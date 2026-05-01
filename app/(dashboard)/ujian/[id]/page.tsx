"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Send,
  GraduationCap,
  ListChecks,
  BarChart3,
  Target,
  Zap,
  Loader2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Soal {
  id: string
  nomor: number
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  opsiA?: string | null
  opsiB?: string | null
  opsiC?: string | null
  opsiD?: string | null
  opsiE?: string | null
  bobot: number
}

interface UjianData {
  id: string
  judul: string
  mapel: string
  guru: string
  kelas: string
  durasi: number
  soal: Soal[]
  _count: { soal: number }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UjianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ FIX #1: Unwrap params dengan React.use()
  const { id } = use(params)
  const router = useRouter()

  // ─── State ───────────────────────────────────────────────────────────────
  const [ujian, setUjian]           = useState<UjianData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [soalIndex, setSoalIndex]   = useState(0)
  const [jawaban, setJawaban]       = useState<Record<string, string>>({})
  const [ditandai, setDitandai]     = useState<Set<string>>(new Set())
  const [sisaWaktu, setSisaWaktu]   = useState(0)
  const [showSubmit, setShowSubmit] = useState(false)
  const [showAllNav, setShowAllNav] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─── FIX #2: Fetch data ujian berdasarkan id dari params ─────────────────
  useEffect(() => {
    const fetchUjian = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/ujian/${id}`)

        if (!res.ok) {
          if (res.status === 403) {
            setError("Ujian ini tidak tersedia untuk kelas Anda atau sudah berakhir.")
          } else if (res.status === 404) {
            setError("Ujian tidak ditemukan.")
          } else {
            setError("Terjadi kesalahan saat memuat ujian.")
          }
          return
        }

        const data: UjianData = await res.json()
        setUjian(data)
        // Set timer berdasarkan durasi ujian dari DB
        setSisaWaktu(data.durasi * 60)
      } catch (err) {
        setError("Gagal menghubungi server. Periksa koneksi internet Anda.")
      } finally {
        setLoading(false)
      }
    }

    fetchUjian()
  }, [id])

  // ─── Timer countdown ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!ujian || sisaWaktu <= 0) return

    const t = setInterval(() => {
      setSisaWaktu((s) => {
        if (s <= 1) {
          clearInterval(t)
          // Auto-submit saat waktu habis
          handleSubmit()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [ujian, sisaWaktu <= 0]) // hanya mulai timer setelah ujian loaded

  const formatWaktu = (detik: number) => {
    const h = Math.floor(detik / 3600)
    const m = Math.floor((detik % 3600) / 60)
    const s = detik % 60
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  // ─── FIX #3: Submit ke API dengan id yang benar ───────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!ujian || isSubmitting) return
    setIsSubmitting(true)

    try {
      const jawabanArray = Object.entries(jawaban).map(([soalId, jawab]) => ({
        soalId,
        jawaban: jawab,
      }))

      const res = await fetch(`/api/ujian/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jawaban: jawabanArray }),
      })

      if (res.ok) {
        // ✅ FIX #3: Redirect ke hasil dengan id yang benar (bukan hardcoded /ujian/1/hasil)
        router.push(`/ujian/${id}/hasil`)
      } else {
        const data = await res.json()
        alert(data.error || "Gagal mengumpulkan ujian. Coba lagi.")
        setIsSubmitting(false)
        setShowSubmit(false)
      }
    } catch (err) {
      alert("Gagal menghubungi server saat mengumpulkan ujian.")
      setIsSubmitting(false)
      setShowSubmit(false)
    }
  }, [ujian, id, jawaban, isSubmitting, router])

  // ─── Derived state ────────────────────────────────────────────────────────
  const soalList    = ujian?.soal ?? []
  const totalSoal   = ujian?._count.soal ?? 0
  const soal        = soalList[soalIndex]
  const sudahDijawab  = Object.keys(jawaban).length
  const persenSelesai = totalSoal > 0 ? Math.round((sudahDijawab / totalSoal) * 100) : 0
  const isWarning     = sisaWaktu > 0 && sisaWaktu < 600

  const toggleTandai = useCallback(() => {
    if (!soal) return
    setDitandai((prev) => {
      const next = new Set(prev)
      next.has(soal.id) ? next.delete(soal.id) : next.add(soal.id)
      return next
    })
  }, [soal?.id])

  const pilihJawaban = (key: string) => {
    if (!soal) return
    setJawaban((prev) => ({ ...prev, [soal.id]: key }))
  }

  const goNext = () => { if (soalIndex < soalList.length - 1) setSoalIndex(soalIndex + 1) }
  const goPrev = () => { if (soalIndex > 0) setSoalIndex(soalIndex - 1) }

  const navSoal = showAllNav
    ? Array.from({ length: totalSoal }, (_, i) => i)
    : Array.from({ length: Math.min(15, totalSoal) }, (_, i) => i)

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Memuat soal ujian...</p>
      </div>
    )
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error || !ujian) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 max-w-md text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Tidak Dapat Memuat Ujian</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Link
            href="/ujian"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition"
          >
            <ArrowLeft size={14} />
            Kembali ke Daftar Ujian
          </Link>
        </div>
      </div>
    )
  }

  // ─── Helper: opsi soal ────────────────────────────────────────────────────
  const getOpsi = (s: Soal) => {
    const opsiMap: { key: string; teks: string }[] = []
    if (s.opsiA) opsiMap.push({ key: "A", teks: s.opsiA })
    if (s.opsiB) opsiMap.push({ key: "B", teks: s.opsiB })
    if (s.opsiC) opsiMap.push({ key: "C", teks: s.opsiC })
    if (s.opsiD) opsiMap.push({ key: "D", teks: s.opsiD })
    if (s.opsiE) opsiMap.push({ key: "E", teks: s.opsiE })
    return opsiMap
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href="/ujian"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Kembali
        </Link>
        {/* Timer */}
        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold tabular-nums ring-1 transition-colors ${
            isWarning
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-red-200 dark:ring-red-800 animate-pulse"
              : "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 ring-teal-200 dark:ring-teal-800"
          }`}
        >
          <Clock size={14} />
          {formatWaktu(sisaWaktu)}
        </div>
      </div>

      {/* ── Hero Meta Card ────────────────────────────────────────────────── */}
      {/* ✅ FIX: Gunakan data dari ujian (API), bukan hardcoded */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-5 md:p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-16 bottom-0 h-24 w-24 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-emerald-400/20" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* ✅ mapel dari data API */}
            <p className="text-sm font-medium text-teal-100">📚 {ujian.mapel}</p>
            {/* ✅ kelas + judul dari data API */}
            <h2 className="mt-0.5 text-xl font-bold md:text-2xl">{ujian.kelas} · {ujian.judul}</h2>
            {/* ✅ guru dari data API */}
            <p className="mt-1 text-sm text-teal-100">{ujian.guru}</p>

            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-teal-100 mb-1.5">
                <span>Progress Pengerjaan</span>
                <span>{sudahDijawab} / {totalSoal} soal ({persenSelesai}%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-500"
                  style={{ width: `${persenSelesai}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 text-center rounded-2xl bg-white/20 px-4 py-3">
            <p className="text-2xl font-black">{soalIndex + 1}</p>
            <p className="text-[11px] text-teal-100">dari {totalSoal} soal</p>
          </div>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

        {/* ── Kolom Kiri: Soal ───────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Navigasi Soal */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListChecks size={14} className="text-teal-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Navigasi Soal
                </span>
              </div>
              {totalSoal > 15 && (
                <button
                  onClick={() => setShowAllNav(!showAllNav)}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {showAllNav ? "Sembunyikan" : "Tampilkan semua"}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {navSoal.map((i) => {
                const s = soalList[i]
                const sid = s?.id
                const isActive   = i === soalIndex
                const isTerjawab = sid ? jawaban[sid] !== undefined : false
                const isDitandai = sid ? ditandai.has(sid) : false

                return (
                  <button
                    key={i}
                    onClick={() => setSoalIndex(i)}
                    className={`h-8 w-8 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-teal-500 text-white shadow-md scale-110"
                        : isTerjawab
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : isDitandai
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-4 mt-3">
              {[
                { color: "bg-emerald-400", label: "Dijawab" },
                { color: "bg-amber-400",   label: "Ditandai" },
                { color: "bg-gray-200 dark:bg-gray-600", label: "Belum" },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Card Soal */}
          {soal && (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {soalIndex + 1} dari {totalSoal} soal
                </span>
                <button
                  onClick={toggleTandai}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    ditandai.has(soal.id)
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  }`}
                >
                  <Flag size={12} />
                  Tandai
                </button>
              </div>

              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed mb-5">
                {soal.pertanyaan}
              </p>

              {/* Pilihan Ganda */}
              {soal.tipe === "PILIHAN_GANDA" && (
                <div className="space-y-2.5">
                  {getOpsi(soal).map(({ key, teks }) => {
                    const isSelected = jawaban[soal.id] === key
                    return (
                      <button
                        key={key}
                        onClick={() => pilihJawaban(key)}
                        className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left transition-all ${
                          isSelected
                            ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 shadow-sm"
                            : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-teal-200 hover:bg-teal-50/50 dark:hover:bg-teal-900/10"
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}>
                          {key}
                        </span>
                        {teks}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Essay */}
              {soal.tipe === "ESSAY" && (
                <textarea
                  rows={6}
                  placeholder="Tulis jawaban kamu di sini..."
                  value={jawaban[soal.id] ?? ""}
                  onChange={(e) => pilihJawaban(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              )}

              {/* Navigasi Prev/Next */}
              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={goPrev}
                  disabled={soalIndex === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={15} />
                  Sebelumnya
                </button>

                {soalIndex < soalList.length - 1 ? (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 px-4 py-2 text-sm font-medium text-white transition"
                  >
                    Berikutnya
                    <ChevronRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition"
                  >
                    <Send size={12} />
                    Selesai & Kumpul
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Kolom Kanan Sidebar ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
            Ringkasan Ujian
          </h3>

          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden">
            <SidebarRow
              icon={<CheckCircle2 size={13} className="text-emerald-500" />}
              label="Dijawab"
              value={`${sudahDijawab} soal`}
              valueColor="text-emerald-600 dark:text-emerald-400"
            />
            <SidebarRow
              icon={<BookOpen size={13} className="text-gray-400" />}
              label="Belum Dijawab"
              value={`${totalSoal - sudahDijawab} soal`}
              valueColor="text-gray-600 dark:text-gray-300"
            />
            <SidebarRow
              icon={<Flag size={13} className="text-amber-500" />}
              label="Ditandai"
              value={`${ditandai.size} soal`}
              valueColor="text-amber-600 dark:text-amber-400"
            />
            <SidebarRow
              icon={<Target size={13} className="text-teal-500" />}
              label="Total Soal"
              value={`${totalSoal} soal`}
              valueColor="text-teal-600 dark:text-teal-400"
            />
          </div>

          {/* Progress Bar */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-teal-500" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Progress</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Dijawab",  value: sudahDijawab,              total: totalSoal, color: "bg-emerald-500" },
                { label: "Ditandai", value: ditandai.size,             total: totalSoal, color: "bg-amber-400" },
                { label: "Belum",    value: totalSoal - sudahDijawab,  total: totalSoal, color: "bg-gray-200 dark:bg-gray-600" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: totalSoal > 0 ? `${(item.value / item.total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Ujian — ✅ data dari API */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden">
            <SidebarRow
              icon={<GraduationCap size={13} className="text-teal-500" />}
              label="Mata Pelajaran"
              value={ujian.mapel}
              valueColor="text-gray-700 dark:text-gray-200"
            />
            <SidebarRow
              icon={<Clock size={13} className="text-blue-500" />}
              label="Durasi"
              value={`${ujian.durasi} menit`}
              valueColor="text-gray-700 dark:text-gray-200"
            />
            <SidebarRow
              icon={<Zap size={13} className="text-orange-500" />}
              label="Soal Saat Ini"
              value={`No. ${soalIndex + 1}`}
              valueColor="text-teal-600 dark:text-teal-400"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmit(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-200/60 dark:shadow-teal-900/30 transition active:scale-95"
          >
            <Send size={14} />
            Selesai & Kumpulkan
          </button>

          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800/40 p-4">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">💡 Tips</p>
            <p className="text-xs text-teal-600 dark:text-teal-400 leading-relaxed">
              Tandai soal yang belum yakin, lalu kembali setelah menjawab soal lainnya.
            </p>
          </div>
        </div>
      </div>

      {/* ── Submit Modal ─────────────────────────────────────────────────── */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-1 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-2">
                <AlertTriangle size={28} className="text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Kumpulkan Ujian?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                Kamu sudah menjawab{" "}
                <strong className="text-gray-700 dark:text-gray-200">{sudahDijawab}</strong> dari{" "}
                <strong className="text-gray-700 dark:text-gray-200">{totalSoal}</strong> soal.{" "}
                {totalSoal - sudahDijawab > 0 &&
                  `Masih ada ${totalSoal - sudahDijawab} soal yang belum dijawab.`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-5">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{sudahDijawab}</p>
                <p className="text-[10px] text-gray-400">Dijawab</p>
              </div>
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-3">
                <p className="text-base font-bold text-gray-700 dark:text-gray-200">{totalSoal - sudahDijawab}</p>
                <p className="text-[10px] text-gray-400">Kosong</p>
              </div>
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-3">
                <p className="text-base font-bold text-amber-600 dark:text-amber-400">{ditandai.size}</p>
                <p className="text-[10px] text-gray-400">Ditandai</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-600 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Kembali
              </button>
              {/* ✅ FIX #3: Gunakan button + handleSubmit, bukan Link hardcoded ke /ujian/1/hasil */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-200/60 hover:from-teal-600 hover:to-emerald-600 transition disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><Loader2 size={13} className="animate-spin" /> Mengumpulkan...</>
                ) : (
                  <><Send size={13} /> Kumpulkan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SidebarRow ───────────────────────────────────────────────────────────────
function SidebarRow({
  icon, label, value, valueColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueColor: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700">
        {icon}
      </div>
      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
        <p className={`text-xs font-bold truncate ${valueColor}`}>{value}</p>
      </div>
    </div>
  )
}