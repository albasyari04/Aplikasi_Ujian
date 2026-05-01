"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Search,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  Mail,
  Hash,
  BookOpen,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  UserCheck,
  Eye,
  EyeOff,
  SlidersHorizontal,
  UserPlus,
  CheckCircle2,
  BarChart2,
  CalendarDays,
  Download,
  Filter,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog"

// ── Types ─────────────────────────────────────────────────────────────────────
interface Siswa {
  id: string
  nama: string
  email: string
  nis: string | null
  kelas: string | null
  fotoProfil: string | null
  createdAt: string
  _count: { hasilUjian: number }
}

interface Props {
  data: {
    siswa: Siswa[]
    kelasUnik: string[]
    total: number
  }
}

type SortKey = "nama" | "kelas" | "nis" | "createdAt" | "ujian"
type SortDir = "asc" | "desc"

const EMPTY_FORM = { nama: "", email: "", password: "", nis: "", kelas: "" }

// ── Avatar ─────────────────────────────────────────────────────────────────────
const PALETTES = [
  "from-teal-400 to-teal-600",
  "from-violet-400 to-violet-600",
  "from-blue-400 to-blue-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-rose-600",
  "from-cyan-400 to-cyan-600",
  "from-indigo-400 to-indigo-600",
  "from-fuchsia-400 to-fuchsia-600",
]

function Avatar({
  nama,
  foto,
  size = "md",
}: {
  nama: string
  foto?: string | null
  size?: "xs" | "sm" | "md" | "lg"
}) {
  const initials = nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  const sizeClass = {
    xs: "w-7 h-7 text-[10px]",
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
  }[size]
  const grad = PALETTES[nama.charCodeAt(0) % PALETTES.length]

  if (foto)
    return <img src={foto} alt={nama} className={`${sizeClass} rounded-2xl object-cover ring-2 ring-white/60 shadow-sm shrink-0`} />
  return (
    <div className={`${sizeClass} rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center font-bold text-white shadow-sm shrink-0 select-none`}>
      {initials}
    </div>
  )
}

// ── Sort Icon ──────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="size-3 opacity-25" />
  return sortDir === "asc"
    ? <ChevronUp className="size-3 text-teal-500" />
    : <ChevronDown className="size-3 text-teal-500" />
}

// ── Kelas Badge ────────────────────────────────────────────────────────────────
function KelasBadge({ kelas }: { kelas: string | null }) {
  if (!kelas) return <span className="text-xs text-muted-foreground/30">—</span>
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700 border border-teal-200/60 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/40">
      {kelas}
    </span>
  )
}

// ── Ujian Badge ────────────────────────────────────────────────────────────────
function UjianBadge({ count }: { count: number }) {
  if (count === 0)
    return <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold bg-muted text-muted-foreground/60">0</span>
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      {count}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AdminSiswaClient({ data }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [siswaList, setSiswaList] = useState<Siswa[]>(data.siswa)
  const [q, setQ] = useState("")
  const [filterKelas, setFilterKelas] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [showFilter, setShowFilter] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Siswa | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showPass, setShowPass] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const [deleteTarget, setDeleteTarget] = useState<Siswa | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Filtered + Sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...siswaList]
    if (q) {
      const lower = q.toLowerCase()
      list = list.filter(
        (s) =>
          s.nama.toLowerCase().includes(lower) ||
          s.email.toLowerCase().includes(lower) ||
          (s.nis ?? "").toLowerCase().includes(lower) ||
          (s.kelas ?? "").toLowerCase().includes(lower)
      )
    }
    if (filterKelas !== "all") list = list.filter((s) => s.kelas === filterKelas)
    list.sort((a, b) => {
      let va: string | number = ""
      let vb: string | number = ""
      switch (sortKey) {
        case "nama":      va = a.nama;              vb = b.nama;              break
        case "kelas":     va = a.kelas ?? "";       vb = b.kelas ?? "";       break
        case "nis":       va = a.nis ?? "";          vb = b.nis ?? "";         break
        case "createdAt": va = a.createdAt;          vb = b.createdAt;         break
        case "ujian":     va = a._count.hasilUjian; vb = b._count.hasilUjian; break
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1
      if (va > vb) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return list
  }, [siswaList, q, filterKelas, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  const kelasSummary = useMemo(() => {
    const map: Record<string, number> = {}
    siswaList.forEach((s) => {
      const k = s.kelas ?? "Tanpa Kelas"
      map[k] = (map[k] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [siswaList])

  const totalUjianDiikuti = siswaList.reduce((s, x) => s + x._count.hasilUjian, 0)

  // ── CRUD ──────────────────────────────────────────────────────────────────
  function openTambah() {
    setEditTarget(null); setForm(EMPTY_FORM); setFormError(""); setShowPass(false); setModalOpen(true)
  }
  function openEdit(s: Siswa) {
    setEditTarget(s)
    setForm({ nama: s.nama, email: s.email, password: "", nis: s.nis ?? "", kelas: s.kelas ?? "" })
    setFormError(""); setShowPass(false); setModalOpen(true)
  }
  async function handleSubmit() {
    setFormError("")
    if (!form.nama.trim() || !form.email.trim()) { setFormError("Nama dan email wajib diisi."); return }
    if (!editTarget && !form.password.trim()) { setFormError("Password wajib diisi untuk siswa baru."); return }
    setFormLoading(true)
    try {
      const body: Record<string, string> = { nama: form.nama, email: form.email, nis: form.nis, kelas: form.kelas }
      if (form.password) body.password = form.password
      const res = editTarget
        ? await fetch(`/api/siswa/${editTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/siswa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) { const err = await res.json(); setFormError(err.error ?? "Terjadi kesalahan."); return }
      const result = await res.json()
      if (editTarget) {
        setSiswaList((prev) => prev.map((s) => s.id === editTarget.id ? { ...s, ...result } : s))
      } else {
        setSiswaList((prev) => [{ ...result, fotoProfil: null, _count: { hasilUjian: 0 } }, ...prev])
      }
      setModalOpen(false)
      startTransition(() => router.refresh())
    } catch { setFormError("Gagal terhubung ke server.") }
    finally { setFormLoading(false) }
  }
  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/siswa/${deleteTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        setSiswaList((prev) => prev.filter((s) => s.id !== deleteTarget.id))
        setDeleteTarget(null)
        startTransition(() => router.refresh())
      }
    } finally { setDeleteLoading(false) }
  }
  function exportCSV() {
    const header = ["Nama", "Email", "NIS", "Kelas", "Ujian Diikuti", "Bergabung"]
    const rows = filtered.map((s) => [s.nama, s.email, s.nis ?? "-", s.kelas ?? "-", s._count.hasilUjian, new Date(s.createdAt).toLocaleDateString("id-ID")])
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "data-siswa.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  // ── Stat cards — identik pola Bank Soal ──────────────────────────────────
  const stats = [
    {
      label: "Total Siswa",
      value: siswaList.length,
      sub: "terdaftar",
      icon: Users,
      iconBg: "bg-teal-500",
      cardBg: "bg-teal-50 dark:bg-teal-950/20",
      border: "border-teal-100 dark:border-teal-900/30",
      valueCls: "text-teal-700 dark:text-teal-300",
      labelCls: "text-teal-500/80 dark:text-teal-400/70",
    },
    {
      label: "Kelas Aktif",
      value: data.kelasUnik.length,
      sub: "kelas berbeda",
      icon: BookOpen,
      iconBg: "bg-violet-500",
      cardBg: "bg-violet-50 dark:bg-violet-950/20",
      border: "border-violet-100 dark:border-violet-900/30",
      valueCls: "text-violet-700 dark:text-violet-300",
      labelCls: "text-violet-500/80 dark:text-violet-400/70",
    },
    {
      label: "Ujian Diikuti",
      value: totalUjianDiikuti,
      sub: "submission",
      icon: UserCheck,
      iconBg: "bg-emerald-500",
      cardBg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-100 dark:border-emerald-900/30",
      valueCls: "text-emerald-700 dark:text-emerald-300",
      labelCls: "text-emerald-500/80 dark:text-emerald-400/70",
    },
    {
      label: "Hasil Filter",
      value: filtered.length,
      sub: `dari ${siswaList.length}`,
      icon: Filter,
      iconBg: "bg-amber-500",
      cardBg: "bg-amber-50 dark:bg-amber-950/20",
      border: "border-amber-100 dark:border-amber-900/30",
      valueCls: "text-amber-700 dark:text-amber-300",
      labelCls: "text-amber-500/80 dark:text-amber-400/70",
    },
  ]

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* ── HERO HEADER — identik pola Bank Soal ────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d9488 0%, #0a7c71 55%, #115e59 100%)",
          paddingBottom: "80px",
        }}
      >
        <div
          className="absolute -top-12 -right-12 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-6 right-28 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-7 pb-0 max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm mb-3">
                <GraduationCap className="size-3 text-white/80" />
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
                  Manajemen Siswa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={exportCSV}
                className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm text-white hover:bg-white/25 active:scale-95 transition-all"
                title="Export CSV"
              >
                <Download className="size-4" />
              </button>
              <button
                onClick={openTambah}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-teal-700 text-sm font-bold shadow-xl shadow-black/20 hover:shadow-2xl hover:bg-white/95 active:scale-95 transition-all border border-white/80"
              >
                <UserPlus className="size-4" />
                <span className="hidden sm:inline">Tambah Siswa</span>
                <span className="sm:hidden">Tambah</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT — float up, identik pola Bank Soal ──────────────────────── */}
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-5"
        style={{ marginTop: "-64px" }}
      >

        {/* ── STAT CARDS — identik persis Bank Soal ───────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className={`relative rounded-2xl p-4 sm:p-5 border shadow-md ${s.cardBg} ${s.border} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden`}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-25 -translate-y-10 translate-x-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
                />
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-3 text-white shadow-sm ${s.iconBg}`}>
                    <Icon className="size-5" strokeWidth={1.8} />
                  </div>
                  <p className={`text-3xl font-extrabold leading-none tracking-tight ${s.valueCls}`}>
                    {s.value}
                  </p>
                  <p className={`text-xs font-semibold mt-1.5 ${s.labelCls}`}>
                    {s.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium">{s.sub}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── SEARCH & FILTER ─────────────────────────────────────────────── */}
        <div className="bg-background rounded-2xl shadow-sm border border-border/50 p-4">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-lg bg-muted pointer-events-none">
                <Search className="size-3.5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Cari nama, email, NIS, kelas..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-11 pr-9 h-10 text-sm rounded-xl border border-border/60 bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/50 transition-all"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
                >
                  <X className="size-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`sm:hidden flex items-center gap-1.5 px-3.5 h-10 rounded-xl border text-sm font-semibold transition-all ${
                showFilter || filterKelas !== "all"
                  ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                  : "border-border/60 text-muted-foreground bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <SlidersHorizontal className="size-3.5" />
              Filter
              {filterKelas !== "all" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>

            {/* Desktop kelas filter */}
            <div className="hidden sm:block">
              <div className="relative w-[190px]">
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-8 py-0 text-sm rounded-xl border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/60 transition-all h-10 font-medium cursor-pointer"
                >
                  <option value="all">Semua Kelas</option>
                  {data.kelasUnik.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile expanded filter */}
          {showFilter && (
            <div className="mt-2.5 sm:hidden">
              <div className="relative">
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-8 py-0 text-sm rounded-xl border border-border/60 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/60 transition-all h-10 font-medium cursor-pointer"
                >
                  <option value="all">Semua Kelas</option>
                  {data.kelasUnik.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* ── DAFTAR SISWA ────────────────────────────────────────────────── */}
        <div className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/10">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-2xl text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
              >
                <Users className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-tight">Daftar Siswa</h2>
                <p className="text-[10px] text-muted-foreground/60 font-medium">Data siswa terdaftar</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40">
              <span className="text-xs font-bold text-foreground">{filtered.length}</span>
              <span className="text-xs text-muted-foreground">/ {siswaList.length} siswa</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl opacity-15 mb-5"
                style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
              >
                <Users className="size-10 text-white" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">
                {siswaList.length === 0 ? "Belum ada siswa" : "Siswa tidak ditemukan"}
              </p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-xs mx-auto">
                {siswaList.length === 0
                  ? "Mulai tambahkan data siswa pertama"
                  : "Coba ubah kata kunci atau filter kelas"}
              </p>
              {siswaList.length === 0 && (
                <button
                  onClick={openTambah}
                  className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-teal-500/20"
                  style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
                >
                  <UserPlus className="size-4" />
                  Tambah Siswa Pertama
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── DESKTOP TABLE ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-muted-foreground border-b border-border/40 uppercase tracking-wide bg-muted/10">
                      {(
                        [
                          { key: "nama",      label: "Siswa",     align: "left"   },
                          { key: "nis",       label: "NIS",       align: "left"   },
                          { key: "kelas",     label: "Kelas",     align: "left"   },
                          { key: "ujian",     label: "Ujian",     align: "center" },
                          { key: "createdAt", label: "Bergabung", align: "left"   },
                        ] as { key: SortKey; label: string; align: string }[]
                      ).map(({ key, label, align }) => (
                        <th key={key} className={`px-5 py-3.5 font-semibold text-${align}`}>
                          <button
                            onClick={() => toggleSort(key)}
                            className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${align === "center" ? "mx-auto" : ""}`}
                          >
                            {label}
                            <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                          </button>
                        </th>
                      ))}
                      <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-border/30 group transition-colors duration-150 hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar nama={s.nama} foto={s.fotoProfil} size="sm" />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">{s.nama}</p>
                              <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {s.nis
                            ? <span className="font-mono text-xs px-2.5 py-1 rounded-xl font-semibold bg-muted text-foreground">{s.nis}</span>
                            : <span className="text-xs text-muted-foreground/30">—</span>
                          }
                        </td>
                        <td className="px-5 py-4"><KelasBadge kelas={s.kelas} /></td>
                        <td className="px-5 py-4 text-center"><UjianBadge count={s._count.hasilUjian} /></td>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="size-3 text-muted-foreground/40" />
                            {new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150">
                            <button
                              onClick={() => openEdit(s)}
                              title="Edit"
                              className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(s)}
                              title="Hapus"
                              className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARD LIST ── */}
              <div className="md:hidden divide-y divide-border/30">
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors duration-150 group"
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-2xl text-white text-xs font-extrabold shrink-0 mt-0.5 shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${
                        ["#0d9488,#0f766e","#7c3aed,#6d28d9","#2563eb,#1d4ed8","#d97706,#b45309","#e11d48,#be123c","#0891b2,#0e7490","#4f46e5,#4338ca","#c026d3,#a21caf"][s.nama.charCodeAt(0) % 8]
                      })` }}
                    >
                      {s.nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <KelasBadge kelas={s.kelas} />
                        {s.nis && (
                          <span className="font-mono text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted/60 rounded-full border border-border/40">
                            {s.nis}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          s._count.hasilUjian > 0
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                            : "bg-muted/60 text-muted-foreground border-border/40"
                        }`}>
                          {s._count.hasilUjian} ujian
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{s.nama}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <ChevronRight className="size-3 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground/60 font-medium truncate">{s.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 mt-0.5">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── DISTRIBUSI KELAS ──────────────────────────────────────────────── */}
        {kelasSummary.length > 0 && (
          <div className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/10">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-2xl text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                <BarChart2 className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-tight">Distribusi per Kelas</h2>
                <p className="text-[10px] text-muted-foreground/60 font-medium">Jumlah siswa per kelas</p>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {kelasSummary.map(([kelas, count]) => {
                const pct = Math.round((count / siswaList.length) * 100)
                const isActive = filterKelas === kelas
                return (
                  <button
                    key={kelas}
                    onClick={() => setFilterKelas(kelas === filterKelas ? "all" : kelas)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-150 active:scale-[0.97] ${
                      isActive
                        ? "border-teal-400/50 bg-teal-50 dark:bg-teal-950/30 shadow-md"
                        : "border-border/50 bg-background hover:border-teal-300/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] text-muted-foreground font-semibold truncate">{kelas}</p>
                      {isActive && <CheckCircle2 className="size-3 text-teal-500 shrink-0" />}
                    </div>
                    <p className="text-2xl font-black text-foreground tabular-nums leading-none">{count}</p>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-muted/60">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0d9488, #10b981)" }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">{pct}% dari total</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL TAMBAH / EDIT ───────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-0 p-0 overflow-hidden shadow-2xl">
          <div
            className="relative px-6 py-5 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute top-2 right-16 w-10 h-10 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                {editTarget ? <Pencil className="size-5 text-white" /> : <UserPlus className="size-5 text-white" />}
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-tight">
                  {editTarget ? "Edit Data Siswa" : "Tambah Siswa Baru"}
                </h2>
                <p className="text-white/60 text-xs mt-0.5">
                  {editTarget ? "Perbarui informasi siswa" : "Isi data untuk mendaftarkan siswa"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 bg-background">
            {editTarget && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/40">
                <Avatar nama={editTarget.nama} foto={editTarget.fotoProfil} size="md" />
                <div>
                  <p className="font-semibold text-sm text-foreground">{editTarget.nama}</p>
                  <p className="text-xs text-muted-foreground">{editTarget.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Contoh: Budi Santoso"
                  value={form.nama}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  className="w-full h-10 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="siswa@sma-istiqomah.sch.id"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Password {!editTarget && <span className="text-red-500">*</span>}
                  {editTarget && <span className="text-[10px] text-muted-foreground font-normal normal-case ml-1">(kosongkan jika tidak diubah)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={editTarget ? "••••••••" : "Min. 6 karakter"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full h-10 px-4 pr-10 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">NIS</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      placeholder="2024001"
                      value={form.nis}
                      onChange={(e) => setForm((f) => ({ ...f, nis: e.target.value }))}
                      className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide">Kelas</label>
                  <input
                    placeholder="XII IPA 1"
                    value={form.kelas}
                    onChange={(e) => setForm((f) => ({ ...f, kelas: e.target.value }))}
                    className="w-full h-10 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
                <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{formError}</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModalOpen(false)}
                disabled={formLoading}
                className="flex-1 h-10 rounded-2xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-teal-500/20"
                style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
              >
                {formLoading
                  ? <><Loader2 className="size-3.5 animate-spin" /> Menyimpan...</>
                  : editTarget
                    ? <><Pencil className="size-3.5" /> Simpan Perubahan</>
                    : <><UserPlus className="size-3.5" /> Tambah Siswa</>
                }
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ALERT DIALOG HAPUS ───────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-sm rounded-3xl border-0 p-0 overflow-hidden shadow-2xl">
          <div className="relative px-6 py-5 overflow-hidden bg-gradient-to-br from-red-500 to-rose-600">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 border border-white/20">
                <Trash2 className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Hapus Siswa</h2>
                <p className="text-white/65 text-xs mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              <strong className="text-foreground">{deleteTarget?.nama}</strong>?
            </p>
            {deleteTarget && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/40">
                <Avatar nama={deleteTarget.nama} foto={deleteTarget.fotoProfil} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{deleteTarget.nama}</p>
                  <p className="text-xs text-muted-foreground truncate">{deleteTarget.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
              <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                Semua data ujian dan jawaban siswa ini akan ikut terhapus secara permanen.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 h-10 rounded-2xl border border-border/60 text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 h-10 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-red-500/20"
              >
                {deleteLoading
                  ? <><Loader2 className="size-3.5 animate-spin" /> Menghapus...</>
                  : <><Trash2 className="size-3.5" /> Ya, Hapus</>
                }
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}