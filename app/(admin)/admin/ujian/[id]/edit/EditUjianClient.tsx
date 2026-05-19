"use client"

// app/(admin)/admin/ujian/[id]/edit/EditUjianClient.tsx

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  Clock3,
  TimerIcon,
  UserRound,
  ClipboardList,
  Loader2,
  Info,
  LayoutDashboard,
  Users,
  ToggleLeft,
  Eye,
  EyeOff,
} from "lucide-react"

const DAFTAR_KELAS = [
  "X IPA 1", "X IPA 2", "X IPS 1", "X IPS 2",
  "XI IPA 1", "XI IPA 2", "XI IPS 1", "XI IPS 2",
  "XII IPA 1", "XII IPA 2", "XII IPS 1", "XII IPS 2",
]

interface Ujian {
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
}

interface Props {
  initialData: Ujian
}

export function EditUjianClient({ initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    judul: initialData.judul,
    mapel: initialData.mapel,
    guru: initialData.guru,
    kelas: initialData.kelas,
    tanggal: initialData.tanggal,
    waktuMulai: initialData.waktuMulai,
    waktuSelesai: initialData.waktuSelesai,
    durasi: String(initialData.durasi),
    status: initialData.status,
  })

  const [error, setError] = useState<string | null>(null)

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const validate = () => {
    if (!form.judul.trim()) return "Judul ujian wajib diisi"
    if (!form.mapel.trim()) return "Mata pelajaran wajib diisi"
    if (!form.guru.trim()) return "Nama guru wajib diisi"
    if (!form.kelas) return "Kelas target wajib dipilih"
    if (!form.tanggal) return "Tanggal ujian wajib diisi"
    if (!form.waktuMulai) return "Waktu mulai wajib diisi"
    if (!form.waktuSelesai) return "Waktu selesai wajib diisi"
    if (form.waktuMulai >= form.waktuSelesai) return "Waktu selesai harus setelah waktu mulai"
    if (!form.durasi || parseInt(form.durasi) < 1) return "Durasi minimal 1 menit"
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    startTransition(async () => {
      try {
        const waktuMulai = new Date(`${form.tanggal}T${form.waktuMulai}:00`).toISOString()
        const waktuSelesai = new Date(`${form.tanggal}T${form.waktuSelesai}:00`).toISOString()
        const tanggal = new Date(`${form.tanggal}T00:00:00`).toISOString()

        const res = await fetch(`/api/ujian/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            judul: form.judul.trim(),
            mapel: form.mapel.trim(),
            guru: form.guru.trim(),
            kelas: form.kelas,
            status: form.status,
            tanggal,
            waktuMulai,
            waktuSelesai,
            durasi: parseInt(form.durasi),
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Gagal memperbarui ujian")
          return
        }

        router.push("/admin/ujian")
        router.refresh()
      } catch {
        setError("Terjadi kesalahan koneksi")
      }
    })
  }

  const hasSchedulePreview = form.tanggal && form.waktuMulai && form.waktuSelesai

  return (
    <div className="w-full space-y-5 pb-24">

      {/* ══ HERO BANNER ══════════════════════════════════════════ */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 55%, #134e4a 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-12 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative px-6 pt-5 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-teal-200/60 text-[11px] font-semibold">
              <LayoutDashboard className="size-3.5" />
              <span>Manajemen Ujian</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/ujian">
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 transition-all">
                  <ArrowLeft className="size-3.5" />
                  Kembali
                </button>
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-white hover:bg-teal-50 shadow-lg shadow-black/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white mb-1">Edit Ujian</h1>
            <p className="text-teal-200/70 text-sm">Perbarui informasi ujian di bawah ini</p>
          </div>
        </div>
      </div>

      {/* ══ Error Alert ══════════════════════════════════════════ */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40">
          <AlertTriangle className="size-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* ══ Section: Informasi Ujian ══════════════════════════════ */}
      <div className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/10">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-2xl text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
          >
            <ClipboardList className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-tight">Informasi Ujian</h2>
            <p className="text-[10px] text-muted-foreground/60 font-medium">Detail dan identitas ujian</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Judul Ujian */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <ClipboardList className="size-3 text-teal-500" />
              Judul Ujian <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              placeholder="contoh: Ulangan Harian Bab 3 – Sistem Persamaan"
              value={form.judul}
              onChange={(e) => updateForm("judul", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            />
          </div>

          {/* Mata Pelajaran */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <BookOpen className="size-3 text-teal-500" />
              Mata Pelajaran <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              placeholder="contoh: Matematika"
              value={form.mapel}
              onChange={(e) => updateForm("mapel", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            />
          </div>

          {/* Nama Guru */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <UserRound className="size-3 text-teal-500" />
              Nama Guru <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              placeholder="contoh: Budi Santoso, S.Pd."
              value={form.guru}
              onChange={(e) => updateForm("guru", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            />
          </div>

          {/* Kelas Target */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <Users className="size-3 text-teal-500" />
              Kelas Target <span className="text-red-400 ml-0.5">*</span>
            </label>
            <select
              value={form.kelas}
              onChange={(e) => updateForm("kelas", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            >
              <option value="">— Pilih Kelas —</option>
              {DAFTAR_KELAS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Status Publish */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <ToggleLeft className="size-3 text-teal-500" />
              Status Publish <span className="text-red-400 ml-0.5">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            >
              <option value="AKTIF">✅ Aktif — siswa dapat melihat & mengerjakan</option>
              <option value="DRAFT">🔒 Draft — tersembunyi dari siswa</option>
            </select>

            {form.status === "AKTIF" ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/40">
                <Eye className="size-3 text-teal-600 shrink-0" />
                <p className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                  Ujian akan langsung terlihat oleh siswa kelas {form.kelas || "yang dipilih"}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40">
                <EyeOff className="size-3 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  Siswa tidak dapat melihat ujian ini. Ubah ke Aktif agar muncul.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ Section: Jadwal & Durasi ══════════════════════════════ */}
      <div className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/10">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-2xl text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
          >
            <CalendarDays className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-tight">Jadwal & Durasi</h2>
            <p className="text-[10px] text-muted-foreground/60 font-medium">Waktu pelaksanaan ujian</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tanggal */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <CalendarDays className="size-3 text-teal-500" />
              Tanggal Ujian <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => updateForm("tanggal", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            />
          </div>

          {/* Waktu Mulai */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <Clock3 className="size-3 text-teal-500" />
              Waktu Mulai <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="time"
              value={form.waktuMulai}
              onChange={(e) => updateForm("waktuMulai", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            />
          </div>

          {/* Waktu Selesai */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <Clock3 className="size-3 text-teal-500" />
              Waktu Selesai <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="time"
              value={form.waktuSelesai}
              onChange={(e) => updateForm("waktuSelesai", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            />
          </div>

          {/* Durasi */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
              <TimerIcon className="size-3 text-teal-500" />
              Durasi (menit) <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={480}
              placeholder="90"
              value={form.durasi}
              onChange={(e) => updateForm("durasi", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 hover:border-border transition-all"
            />
          </div>
        </div>

        {/* Schedule Preview */}
        {hasSchedulePreview && (
          <div className="mx-5 mb-5">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40">
              <CheckCircle2 className="size-4 text-teal-500 shrink-0" />
              <p className="text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
                Ujian dijadwalkan pada{" "}
                <strong>
                  {new Date(`${form.tanggal}T00:00:00`).toLocaleDateString("id-ID", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </strong>
                {" "}pukul <strong>{form.waktuMulai}</strong> – <strong>{form.waktuSelesai}</strong>
                {form.durasi && <> (durasi <strong>{form.durasi} menit</strong>)</>}
                {form.kelas && <> untuk kelas <strong>{form.kelas}</strong></>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ══ Info Note ════════════════════════════════════════════ */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-muted/30 border border-border/40">
        <Info className="size-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Semua perubahan pada ujian ini akan disimpan. Ujian dengan status{" "}
          <strong className="text-muted-foreground">Aktif</strong> akan langsung terlihat oleh siswa sesuai
          kelas target. Perubahan jadwal tidak akan mempengaruhi hasil ujian yang sudah ada.
        </p>
      </div>

      {/* ══ Sticky Bottom Bar (mobile) ═══════════════════════════ */}
      <div className="fixed bottom-4 left-0 right-0 px-4 z-20 sm:hidden">
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-background/90 backdrop-blur-sm border border-border/50 shadow-2xl shadow-black/10">
          <Link href="/admin/ujian">
            <button
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <ArrowLeft className="size-3.5" />
              Batal
            </button>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  )
}
