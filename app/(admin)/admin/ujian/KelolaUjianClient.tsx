"use client"

// app/(admin)/admin/ujian/KelolaUjianClient.tsx

import { useState, useTransition, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ClipboardList,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Clock,
  BookOpen,
  Users,
  AlertTriangle,
  X,
  GraduationCap,
  Timer,
  ChevronRight,
  FileQuestion,
  TrendingUp,
  CheckCircle2,
  CalendarDays,
  Loader2,
  Activity,
  Award,
  LayoutGrid,
  Calendar,
  Sparkles,
  School,
  ToggleLeft,
  Zap,
  BarChart3,
  Target,
  BookCheck,
  Shield,
  ArrowRight,
  FlameKindling,
  CircleDot,
  CheckCheck,
  Hourglass,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────
interface Ujian {
  id: string
  judul: string
  mapel: string
  guru: string
  kelas: string
  status: string
  tanggal: Date
  waktuMulai: Date
  waktuSelesai: Date
  durasi: number
  _count: { soal: number; hasil: number }
}

interface Props {
  ujianList: Ujian[]
}

// ── Helpers ───────────────────────────────────────────────────
function formatTanggal(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatWaktu(date: Date) {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

type StatusInfo = {
  label: string
  color: string
  bg: string
  border: string
  dot: string
  pulse: boolean
  icon: React.ElementType
  gradient: string
}

function getStatusUjian(ujian: Ujian): StatusInfo {
  const now = new Date()
  const mulai = new Date(ujian.waktuMulai)
  const selesai = new Date(ujian.waktuSelesai)

  if (now < mulai)
    return {
      label: "Mendatang",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800/60",
      dot: "bg-blue-500",
      pulse: false,
      icon: Hourglass,
      gradient: "from-blue-500 to-indigo-600",
    }
  if (now >= mulai && now <= selesai)
    return {
      label: "Berlangsung",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
      pulse: true,
      icon: Zap,
      gradient: "from-emerald-500 to-teal-600",
    }
  return {
    label: "Selesai",
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/40",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    pulse: false,
    icon: CheckCheck,
    gradient: "from-slate-400 to-slate-500",
  }
}

function getStatusPublish(status: string) {
  if (status === "AKTIF") {
    return {
      label: "Aktif",
      color: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-200 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
      dotRing: "ring-emerald-300 dark:ring-emerald-700",
    }
  }
  return {
    label: "Draft",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800/60",
    dot: "bg-amber-500",
    dotRing: "ring-amber-300 dark:ring-amber-700",
  }
}

// ── Detail Modal ──────────────────────────────────────────────
function DetailUjianModal({ ujian, onClose }: { ujian: Ujian | null; onClose: () => void }) {
  if (!ujian) return null
  const status = getStatusUjian(ujian)
  const statusPublish = getStatusPublish(ujian.status)
  const StatusIcon = status.icon

  return (
    <Dialog open={!!ujian} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-[28px] border-0 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="relative px-6 py-5 overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-8 right-16 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-black/10 pointer-events-none" />

          <DialogTitle className="relative flex items-center gap-3.5 text-white">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm shadow-inner">
              <ClipboardList className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em] mb-0.5">Detail Ujian</p>
              <p className="text-lg font-black leading-tight tracking-tight">Informasi Ujian</p>
            </div>
          </DialogTitle>
        </div>

        <div className="p-5 space-y-3 bg-slate-50 dark:bg-zinc-950">
          {/* Judul card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug tracking-tight">{ujian.judul}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <BookOpen className="size-3 text-teal-500 shrink-0" />
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-bold">{ujian.mapel}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {/* Status waktu badge */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${status.bg} ${status.border} ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.pulse ? "animate-pulse" : ""}`} />
                  {status.label}
                </span>
                {/* Status publish badge */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusPublish.bg} ${statusPublish.border} ${statusPublish.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ring-2 ${statusPublish.dot} ${statusPublish.dotRing}`} />
                  {statusPublish.label}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: GraduationCap, label: "Guru", value: ujian.guru, iconBg: "bg-violet-100 dark:bg-violet-900/30", iconColor: "text-violet-600 dark:text-violet-400" },
              { icon: BookOpen, label: "Mata Pelajaran", value: ujian.mapel, iconBg: "bg-teal-100 dark:bg-teal-900/30", iconColor: "text-teal-600 dark:text-teal-400" },
              { icon: School, label: "Kelas Target", value: ujian.kelas || "-", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400" },
              { icon: ToggleLeft, label: "Status Publish", value: ujian.status === "AKTIF" ? "Aktif" : "Draft", iconBg: ujian.status === "AKTIF" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30", iconColor: ujian.status === "AKTIF" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400" },
              { icon: FileQuestion, label: "Jumlah Soal", value: `${ujian._count.soal} soal`, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
              { icon: Users, label: "Peserta Submit", value: `${ujian._count.hasil} siswa`, iconBg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-600 dark:text-amber-400" },
              { icon: Timer, label: "Durasi", value: `${ujian.durasi} menit`, iconBg: "bg-rose-100 dark:bg-rose-900/30", iconColor: "text-rose-600 dark:text-rose-400" },
              { icon: CalendarDays, label: "Tanggal", value: formatTanggal(ujian.tanggal), iconBg: "bg-sky-100 dark:bg-sky-900/30", iconColor: "text-sky-600 dark:text-sky-400" },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-slate-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                    <item.icon className={`size-3.5 ${item.iconColor}`} />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.12em]">{item.label}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight pl-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Waktu Pelaksanaan */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Clock className="size-3.5 text-slate-500 dark:text-zinc-400" />
              </div>
              <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.12em]">Waktu Pelaksanaan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-xl px-3 py-2.5 text-center border border-teal-100 dark:border-teal-900/50">
                <p className="text-[9px] text-teal-600 dark:text-teal-500 font-black uppercase tracking-wider mb-1">Mulai</p>
                <p className="text-sm font-black text-teal-700 dark:text-teal-300">{formatWaktu(ujian.waktuMulai)}</p>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-[1px] bg-slate-300 dark:bg-zinc-600" />
                <ArrowRight className="size-3 text-slate-300 dark:text-zinc-600" />
                <div className="w-5 h-[1px] bg-slate-300 dark:bg-zinc-600" />
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-zinc-800/50 rounded-xl px-3 py-2.5 text-center border border-slate-100 dark:border-zinc-700">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-1">Selesai</p>
                <p className="text-sm font-black text-slate-700 dark:text-white">{formatWaktu(ujian.waktuSelesai)}</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 rounded-xl px-3 py-2.5 text-center shrink-0 border border-rose-100 dark:border-rose-900/50">
                <p className="text-[9px] text-rose-500 font-black uppercase tracking-wider mb-1">Durasi</p>
                <p className="text-sm font-black text-rose-600 dark:text-rose-400">{ujian.durasi}m</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 px-5 py-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
          >
            Tutup
          </button>
          <Link href={`/admin/ujian/${ujian.id}/edit`}>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]">
              <Edit3 className="size-3.5" />
              Edit Ujian
            </button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Modal ──────────────────────────────────────────────
function DeleteUjianModal({
  ujian, onClose, onConfirm, isPending,
}: {
  ujian: Ujian | null
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  if (!ujian) return null
  return (
    <Dialog open={!!ujian} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-[28px] border-0 shadow-2xl shadow-black/20">
        <div className="bg-gradient-to-br from-red-500 to-rose-700 px-5 py-5">
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
              <Trash2 className="size-4.5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Konfirmasi</p>
              <span className="text-base font-black">Hapus Ujian</span>
            </div>
          </DialogTitle>
        </div>
        <div className="p-5 space-y-3 bg-slate-50 dark:bg-zinc-950">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Apakah Anda yakin ingin menghapus ujian{" "}
            <strong className="text-slate-900 dark:text-white font-black">&ldquo;{ujian.judul}&rdquo;</strong>?
          </p>
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4 text-red-500" />
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed pt-0.5">
              Semua soal <strong>({ujian._count.soal})</strong>, jawaban, dan hasil ujian <strong>({ujian._count.hasil} siswa)</strong> akan ikut terhapus secara permanen dan tidak dapat dipulihkan.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 px-5 py-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            {isPending ? "Menghapus..." : "Hapus Permanen"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Ujian Card Item ───────────────────────────────────────────
function UjianItem({
  ujian,
  onView,
  onDelete,
}: {
  ujian: Ujian
  onView: (u: Ujian) => void
  onDelete: (u: Ujian) => void
}) {
  const status = getStatusUjian(ujian)
  const statusPublish = getStatusPublish(ujian.status)

  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-all duration-150 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
      {/* Left accent */}
      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-teal-500 to-emerald-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Icon avatar */}
      <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white shrink-0 shadow-sm bg-gradient-to-br from-teal-500 to-emerald-700">
        <ClipboardList className="size-4" />
      </div>

      {/* Content — 2 baris compact */}
      <div className="flex-1 min-w-0">
        {/* Baris 1: judul + badge status waktu + badge publish */}
        <div className="flex items-center gap-1.5 mb-[3px]">
          <h3 className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight truncate">{ujian.judul}</h3>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-[2px] rounded-full border shrink-0 ${status.bg} ${status.border} ${status.color}`}>
            <span className={`w-1 h-1 rounded-full ${status.dot} ${status.pulse ? "animate-pulse" : ""}`} />
            {status.label}
          </span>
          <span className={`hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-[2px] rounded-full border shrink-0 ${statusPublish.bg} ${statusPublish.border} ${statusPublish.color}`}>
            <span className={`w-1 h-1 rounded-full ${statusPublish.dot}`} />
            {statusPublish.label}
          </span>
        </div>

        {/* Baris 2: semua meta dalam satu baris padat */}
        <div className="flex items-center gap-2 text-[10.5px] text-slate-400 dark:text-zinc-500 flex-wrap">
          <span className="flex items-center gap-0.5 font-medium text-slate-500 dark:text-zinc-400">
            <BookOpen className="size-2.5 text-teal-500 shrink-0" />
            {ujian.mapel}
          </span>
          {ujian.kelas && (
            <span className="flex items-center gap-0.5">
              <School className="size-2.5 text-blue-400 shrink-0" />
              {ujian.kelas}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Clock className="size-2.5 shrink-0" />
            {formatWaktu(ujian.waktuMulai)}–{formatWaktu(ujian.waktuSelesai)}
          </span>
          <span className="flex items-center gap-0.5 text-teal-600 dark:text-teal-500 font-semibold">
            <FileQuestion className="size-2.5 shrink-0" />
            {ujian._count.soal}
          </span>
          <span className="flex items-center gap-0.5 text-violet-500 dark:text-violet-400 font-semibold">
            <Users className="size-2.5 shrink-0" />
            {ujian._count.hasil}
          </span>
          <span className="flex items-center gap-0.5 text-rose-500 dark:text-rose-400 font-semibold">
            <Timer className="size-2.5 shrink-0" />
            {ujian.durasi}m
          </span>
        </div>
      </div>

      {/* Actions — always visible on mobile, hover on desktop */}
      <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onView(ujian)}
          title="Lihat detail"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 dark:hover:text-teal-400 transition-all"
        >
          <Eye className="size-3.5" />
        </button>
        <Link
          href={`/admin/ujian/${ujian.id}/edit`}
          title="Edit ujian"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-all"
        >
          <Edit3 className="size-3.5" />
        </Link>
        <button
          onClick={() => onDelete(ujian)}
          title="Hapus ujian"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export function KelolaUjianClient({ ujianList }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [detailUjian, setDetailUjian] = useState<Ujian | null>(null)
  const [deleteUjian, setDeleteUjian] = useState<Ujian | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search) return ujianList
    const q = search.toLowerCase()
    return ujianList.filter(
      (u) =>
        u.judul.toLowerCase().includes(q) ||
        u.mapel.toLowerCase().includes(q) ||
        u.guru.toLowerCase().includes(q) ||
        u.kelas.toLowerCase().includes(q)
    )
  }, [ujianList, search])

  const stats = useMemo(() => {
    const now = new Date()
    return {
      total: ujianList.length,
      berlangsung: ujianList.filter((u) => {
        const mulai = new Date(u.waktuMulai)
        const selesai = new Date(u.waktuSelesai)
        return now >= mulai && now <= selesai
      }).length,
      mendatang: ujianList.filter((u) => new Date(u.waktuMulai) > now).length,
      selesai: ujianList.filter((u) => new Date(u.waktuSelesai) < now).length,
    }
  }, [ujianList])

  const handleDelete = () => {
    if (!deleteUjian) return
    setDeleteError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/ujian/${deleteUjian.id}`, { method: "DELETE" })
        if (!res.ok) {
          const err = await res.json()
          setDeleteError(err.error || "Gagal menghapus ujian")
          return
        }
        setDeleteUjian(null)
        router.refresh()
      } catch {
        setDeleteError("Terjadi kesalahan koneksi")
      }
    })
  }

  const heroStats = [
    {
      icon: LayoutGrid,
      label: "Total Ujian",
      value: stats.total,
      gradient: "from-teal-500 to-emerald-600",
      iconBg: "bg-teal-50 dark:bg-teal-950/40",
      iconColor: "text-teal-600 dark:text-teal-400",
      valueColor: "text-teal-700 dark:text-teal-300",
      labelColor: "text-teal-500/70 dark:text-teal-500",
      borderColor: "border-teal-100 dark:border-teal-900/50",
    },
    {
      icon: Zap,
      label: "Berlangsung",
      value: stats.berlangsung,
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-emerald-700 dark:text-emerald-300",
      labelColor: "text-emerald-500/70 dark:text-emerald-500",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
    },
    {
      icon: Hourglass,
      label: "Mendatang",
      value: stats.mendatang,
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-700 dark:text-blue-300",
      labelColor: "text-blue-500/70 dark:text-blue-500",
      borderColor: "border-blue-100 dark:border-blue-900/50",
    },
    {
      icon: CheckCheck,
      label: "Selesai",
      value: stats.selesai,
      gradient: "from-slate-400 to-slate-600",
      iconBg: "bg-slate-100 dark:bg-zinc-800",
      iconColor: "text-slate-500 dark:text-zinc-400",
      valueColor: "text-slate-600 dark:text-zinc-300",
      labelColor: "text-slate-400 dark:text-zinc-500",
      borderColor: "border-slate-200 dark:border-zinc-700",
    },
  ]

  return (
    <div className="w-full space-y-4 pb-10">

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)`
          }}
        />
        {/* Geometric decorations */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-8 right-24 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full bg-black/10 pointer-events-none" />

        <div className="relative px-6 pt-6 pb-0">
          {/* Title + action button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm shadow-inner">
                <ClipboardList className="size-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Kelola Ujian</h1>
                <p className="text-xs text-teal-100/60 mt-0.5 font-medium">Manajemen ujian &amp; asesmen sekolah</p>
              </div>
            </div>
            <Link href="/admin/ujian/buat" className="shrink-0">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-teal-800 bg-white hover:bg-teal-50 shadow-xl shadow-black/20 transition-all active:scale-[0.97] hover:-translate-y-0.5">
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">+ Buat Ujian</span>
                <span className="sm:hidden">Buat</span>
              </button>
            </Link>
          </div>

          {/* Stats cards row — attached to bottom of hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {heroStats.map((stat, i) => (
              <div
                key={i}
                className={`relative bg-white dark:bg-zinc-900 rounded-t-2xl px-4 pt-4 pb-4 border border-b-0 ${stat.borderColor} shadow-lg overflow-hidden`}
              >
                {/* Subtle top accent */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.gradient} opacity-60`} />
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${stat.iconBg} mb-2.5`}>
                  <stat.icon className={`size-4 ${stat.iconColor}`} />
                </div>
                <p className={`text-3xl font-black leading-none ${stat.valueColor} tabular-nums`}>
                  {stat.value}
                </p>
                <p className={`text-[10px] font-black mt-1.5 uppercase tracking-[0.12em] ${stat.labelColor}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm p-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm shadow-teal-300/50 dark:shadow-teal-700/50">
            <Search className="size-3.5 text-white" />
          </div>
          <input
            type="text"
            placeholder="Cari ujian, mata pelajaran, guru, atau kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-10 h-11 text-sm border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 dark:focus:border-teal-600 hover:border-slate-300 dark:hover:border-zinc-600 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 flex items-center justify-center transition-colors"
            >
              <X className="size-3.5 text-slate-500 dark:text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* ── Ujian List ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">

        {/* List Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl text-white shadow-sm bg-gradient-to-br from-teal-500 to-emerald-700">
              <ClipboardList className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white leading-tight">Daftar Ujian</h2>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">Semua paket ujian</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm">
            <span className="text-xs font-black text-slate-700 dark:text-white tabular-nums">{filtered.length}</span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">/ {ujianList.length} ujian</span>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-700 opacity-10 mb-5">
              <Sparkles className="size-10 text-white" />
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white mb-1.5">
              {ujianList.length === 0 ? "Belum ada ujian" : "Ujian tidak ditemukan"}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 leading-relaxed max-w-xs mx-auto font-medium">
              {ujianList.length === 0
                ? "Mulai buat ujian pertama untuk siswa Anda"
                : "Coba ubah kata kunci pencarian"}
            </p>
            {ujianList.length === 0 && (
              <Link href="/admin/ujian/buat">
                <button className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 transition-all active:scale-[0.98] shadow-lg shadow-teal-500/25">
                  <Plus className="size-4" />
                  Buat Ujian Pertama
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((ujian) => (
              <UjianItem
                key={ujian.id}
                ujian={ujian}
                onView={(u) => setDetailUjian(u)}
                onDelete={(u) => { setDeleteError(null); setDeleteUjian(u) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <DetailUjianModal ujian={detailUjian} onClose={() => setDetailUjian(null)} />
      <DeleteUjianModal
        ujian={deleteUjian}
        onClose={() => setDeleteUjian(null)}
        onConfirm={handleDelete}
        isPending={isPending}
      />

      {/* ── Error Toast ──────────────────────────────────────── */}
      {deleteError && (
        <div className="fixed bottom-6 right-4 md:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold shadow-2xl shadow-red-500/30 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-3.5" />
          </div>
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-1 flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}