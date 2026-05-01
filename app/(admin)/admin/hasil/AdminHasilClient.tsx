"use client"

// app/(admin)/admin/hasil/AdminHasilClient.tsx

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  TrendingUp,
  Award,
  Target,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  BookOpen,
  GraduationCap,
  Sigma,
  X,
  Users,
  Percent,
  Trophy,
  AlertCircle,
  ClipboardCheck,
  SlidersHorizontal,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────
interface HasilUjian {
  id: string
  nilai: number
  lulus: boolean
  selesaiAt: Date | string
  user: { id: string; nama: string; kelas: string | null; email: string }
  ujian: { id: string; judul: string; mapel: string }
}

interface UjianOption {
  id: string
  judul: string
  mapel: string
}

interface SiswaOption {
  id: string
  nama: string
  kelas: string | null
}

interface Statistik {
  totalHasil: number
  rataRataNilai: number
  totalLulus: number
  totalTidakLulus: number
  tingkatKelulusan: number
  nilaiTertinggi: number
  nilaiTerendah: number
}

interface Props {
  data: {
    hasilUjian: HasilUjian[]
    semuaUjian: UjianOption[]
    semuaSiswa: SiswaOption[]
    statistik: Statistik
  }
}

type SortKey = "nama" | "ujian" | "mapel" | "nilai" | "lulus" | "selesaiAt"
type SortDir = "asc" | "desc"

// ── Constants ────────────────────────────────────────────────────
const tealGradient = "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)"

// ── Helpers ──────────────────────────────────────────────────────
function formatTanggal(d: Date | string) {
  const date = new Date(d)
  const day = date.getDate()
  const month = date.toLocaleString("default", { month: "short" })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

function formatWaktu(d: Date | string) {
  const date = new Date(d)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getNilaiColor(nilai: number) {
  if (nilai >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
  if (nilai >= 70) return { bar: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" }
  return { bar: "bg-red-500", text: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
}

// ── Sub-components ───────────────────────────────────────────────
function StatCard({
  title, value, subtitle, icon: Icon, gradient, textColor,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  gradient: string
  textColor: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div
        className="absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: gradient }}
      />
      <div className="relative">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center mb-2.5 shadow-sm"
          style={{ background: gradient }}
        >
          <Icon className="size-4 text-white" />
        </div>
        <p className={`text-2xl font-black tracking-tight leading-none ${textColor}`}>{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{title}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{subtitle}</p>
      </div>
    </div>
  )
}

function NilaiBar({ nilai }: { nilai: number }) {
  const pct = Math.min(100, Math.max(0, nilai))
  const c = getNilaiColor(nilai)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[48px]">
        <div
          className={`h-full ${c.bar} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums ${c.text}`}>
        {Math.round(nilai)}
      </span>
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey)
    return <ChevronsUpDown className="size-3 text-slate-300 ml-1 inline" />
  return sortDir === "asc"
    ? <ChevronUp className="size-3 ml-1 inline text-teal-500" />
    : <ChevronDown className="size-3 ml-1 inline text-teal-500" />
}

// ── Export CSV ───────────────────────────────────────────────────
function exportCSV(data: HasilUjian[]) {
  const header = ["Nama", "Kelas", "Email", "Ujian", "Mata Pelajaran", "Nilai", "Status", "Tanggal Selesai"]
  const rows = data.map((h) => [
    h.user.nama,
    h.user.kelas ?? "-",
    h.user.email,
    h.ujian.judul,
    h.ujian.mapel,
    h.nilai,
    h.lulus ? "LULUS" : "TIDAK LULUS",
    formatTanggal(h.selesaiAt) + " " + formatWaktu(h.selesaiAt),
  ])
  const csvContent = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `hasil-ujian-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main Component ───────────────────────────────────────────────
export function AdminHasilClient({ data }: Props) {
  const { hasilUjian, semuaUjian, semuaSiswa, statistik } = data

  const [search, setSearch] = useState("")
  const [filterUjian, setFilterUjian] = useState("semua")
  const [filterMapel, setFilterMapel] = useState("semua")
  const [filterStatus, setFilterStatus] = useState("semua")
  const [filterKelas, setFilterKelas] = useState("semua")
  const [sortKey, setSortKey] = useState<SortKey>("selesaiAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [page, setPage] = useState(1)
  const perPage = 15

  const mapelList = useMemo(() => [...new Set(semuaUjian.map((u) => u.mapel))].sort(), [semuaUjian])
  const kelasList = useMemo(
    () => [...new Set(semuaSiswa.map((s) => s.kelas).filter(Boolean))].sort() as string[],
    [semuaSiswa]
  )

  const filtered = useMemo(() => {
    let res = hasilUjian.filter((h) => {
      const q = search.toLowerCase()
      const matchSearch = !q || h.user.nama.toLowerCase().includes(q) || h.ujian.judul.toLowerCase().includes(q) || h.ujian.mapel.toLowerCase().includes(q) || (h.user.kelas ?? "").toLowerCase().includes(q)
      const matchUjian = filterUjian === "semua" || h.ujian.id === filterUjian
      const matchMapel = filterMapel === "semua" || h.ujian.mapel === filterMapel
      const matchStatus = filterStatus === "semua" ? true : filterStatus === "lulus" ? h.lulus : !h.lulus
      const matchKelas = filterKelas === "semua" || h.user.kelas === filterKelas
      return matchSearch && matchUjian && matchMapel && matchStatus && matchKelas
    })

    res = [...res].sort((a, b) => {
      let va: string | number = 0
      let vb: string | number = 0
      if (sortKey === "nama") { va = a.user.nama; vb = b.user.nama }
      else if (sortKey === "ujian") { va = a.ujian.judul; vb = b.ujian.judul }
      else if (sortKey === "mapel") { va = a.ujian.mapel; vb = b.ujian.mapel }
      else if (sortKey === "nilai") { va = a.nilai; vb = b.nilai }
      else if (sortKey === "lulus") { va = a.lulus ? 1 : 0; vb = b.lulus ? 1 : 0 }
      else if (sortKey === "selesaiAt") { va = new Date(a.selesaiAt).getTime(); vb = new Date(b.selesaiAt).getTime() }
      if (va < vb) return sortDir === "asc" ? -1 : 1
      if (va > vb) return sortDir === "asc" ? 1 : -1
      return 0
    })

    return res
  }, [hasilUjian, search, filterUjian, filterMapel, filterStatus, filterKelas, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
    setPage(1)
  }

  function resetFilter() {
    setSearch(""); setFilterUjian("semua"); setFilterMapel("semua")
    setFilterStatus("semua"); setFilterKelas("semua"); setPage(1)
  }

  const hasFilter = search || filterUjian !== "semua" || filterMapel !== "semua" || filterStatus !== "semua" || filterKelas !== "semua"

  return (
    <div className="space-y-5 pb-8">

      {/* ── Hero Header (Teal Gradient Appbar) ───────────────────── */}
      <div className="rounded-2xl px-5 py-5 relative overflow-hidden" style={{ background: tealGradient }}>
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute top-3 right-20 w-14 h-14 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-6 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="shrink-0 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg"
              style={{ width: 44, height: 44 }}
            >
              <BarChart3 className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-white tracking-tight leading-tight">Hasil Ujian</h1>
              <p className="text-xs text-white/70 font-medium leading-tight">Rekap nilai &amp; statistik seluruh siswa</p>
            </div>
          </div>
          <button
            onClick={() => exportCSV(filtered)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-xs font-bold shadow-lg transition-transform active:scale-95 hover:shadow-xl whitespace-nowrap"
            style={{ color: "#0d9488" }}
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>

        {/* Mini stats 4-col inside hero */}
        <div className="relative grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: statistik.totalHasil, icon: ClipboardCheck },
            { label: "Lulus", value: statistik.totalLulus, icon: Trophy },
            { label: "Lulus%", value: `${statistik.tingkatKelulusan}%`, icon: Percent },
            { label: "Rata2", value: statistik.rataRataNilai, icon: Sigma },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-1 py-2.5 text-center border border-white/20">
              <s.icon className="size-3.5 text-white/80 mx-auto mb-1" />
              <p className="text-base font-black text-white leading-none">{s.value}</p>
              <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards — hidden on mobile (shown in hero) ─────────── */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Total Pengerjaan" value={statistik.totalHasil} subtitle="submission masuk" icon={BarChart3} gradient="linear-gradient(135deg,#0d9488,#0891b2)" textColor="text-teal-700" />
        <StatCard title="Rata-rata Nilai" value={statistik.rataRataNilai} subtitle="dari semua ujian" icon={Sigma} gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" textColor="text-violet-700" />
        <StatCard title="Tingkat Lulus" value={`${statistik.tingkatKelulusan}%`} subtitle="siswa di atas KKM" icon={TrendingUp} gradient="linear-gradient(135deg,#10b981,#059669)" textColor="text-emerald-700" />
        <StatCard title="Total Lulus" value={statistik.totalLulus} subtitle="siswa lulus KKM" icon={CheckCircle2} gradient="linear-gradient(135deg,#10b981,#059669)" textColor="text-emerald-700" />
        <StatCard title="Tidak Lulus" value={statistik.totalTidakLulus} subtitle="perlu remedial" icon={XCircle} gradient="linear-gradient(135deg,#ef4444,#dc2626)" textColor="text-red-600" />
        <StatCard title="Nilai Tertinggi" value={statistik.nilaiTertinggi} subtitle={`terendah: ${statistik.nilaiTerendah}`} icon={Award} gradient="linear-gradient(135deg,#f59e0b,#d97706)" textColor="text-amber-600" />
      </div>

      {/* ── Filter Card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5">
        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: tealGradient }}
            >
              <Search className="size-2.5 text-white" />
            </div>
            <Input
              placeholder="Cari siswa, ujian, mata pelajaran..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-8 text-xs border-slate-200 bg-slate-50 hover:bg-white focus:bg-white rounded-xl focus-visible:ring-teal-400 focus-visible:ring-2"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="size-2.5 text-slate-500" />
              </button>
            )}
          </div>
          {hasFilter && (
            <button
              onClick={resetFilter}
              className="shrink-0 h-8 w-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
              title="Reset filter"
            >
              <X className="size-3.5 text-red-400" />
            </button>
          )}
        </div>

        {/* Filter dropdowns — horizontal scroll on mobile, wrap on desktop */}
        <div
          className="flex gap-2 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.filter-scroll::-webkit-scrollbar{display:none}`}</style>

          <Select value={filterMapel} onValueChange={(v) => { setFilterMapel(v); setPage(1) }}>
            <SelectTrigger
              className="h-7 text-[11px] rounded-lg border-slate-200 bg-slate-50 gap-1 shrink-0"
              style={{ minWidth: 120 }}
            >
              <BookOpen className="size-2.5 text-teal-500 shrink-0" />
              <SelectValue placeholder="Mapel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Mapel</SelectItem>
              {mapelList.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterUjian} onValueChange={(v) => { setFilterUjian(v); setPage(1) }}>
            <SelectTrigger
              className="h-7 text-[11px] rounded-lg border-slate-200 bg-slate-50 gap-1 shrink-0"
              style={{ minWidth: 130 }}
            >
              <Filter className="size-2.5 text-teal-500 shrink-0" />
              <SelectValue placeholder="Ujian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Ujian</SelectItem>
              {semuaUjian.map((u) => <SelectItem key={u.id} value={u.id}>{u.judul}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterKelas} onValueChange={(v) => { setFilterKelas(v); setPage(1) }}>
            <SelectTrigger
              className="h-7 text-[11px] rounded-lg border-slate-200 bg-slate-50 gap-1 shrink-0"
              style={{ minWidth: 110 }}
            >
              <GraduationCap className="size-2.5 text-teal-500 shrink-0" />
              <SelectValue placeholder="Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kelas</SelectItem>
              {kelasList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1) }}>
            <SelectTrigger
              className="h-7 text-[11px] rounded-lg border-slate-200 bg-slate-50 gap-1 shrink-0"
              style={{ minWidth: 110 }}
            >
              <Target className="size-2.5 text-teal-500 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="lulus">Lulus</SelectItem>
              <SelectItem value="tidak_lulus">Tidak Lulus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Result count — compact */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
          <p className="text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">{filtered.length}</span> dari{" "}
            <span className="font-bold text-slate-700">{hasilUjian.length}</span> hasil ujian
          </p>
        </div>
      </div>

      {/* ── List/Table Card ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: tealGradient }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-white" />
            <span className="text-sm font-bold text-white">Daftar Hasil Ujian</span>
          </div>
          <span className="text-xs text-white/70 font-medium">{filtered.length} hasil</span>
        </div>

        {/* ── MOBILE: Card list (hidden md+) ── */}
        <div className="md:hidden">
          {paginated.length === 0 ? (
            <div className="text-center py-14 px-6">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)" }}
              >
                <BarChart3 className="size-6 text-teal-400" />
              </div>
              <p className="text-sm font-bold text-slate-500">Tidak ada hasil ujian ditemukan</p>
              {hasFilter && (
                <button onClick={resetFilter} className="mt-2 text-xs font-semibold text-teal-600 hover:underline">
                  Reset filter
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {paginated.map((h, idx) => {
                const rowNum = (page - 1) * perPage + idx + 1
                const c = getNilaiColor(h.nilai)
                return (
                  <div key={h.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors">
                    {/* Avatar */}
                    <div
                      className="size-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black shadow-sm"
                      style={{ background: tealGradient }}
                    >
                      {getInitials(h.user.nama)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: nama + status */}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{h.user.nama}</p>
                        {h.lulus ? (
                          <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="size-2.5 text-emerald-500" />
                            <span className="text-[9px] font-bold text-emerald-600">Lulus</span>
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-red-50 border border-red-200">
                            <XCircle className="size-2.5 text-red-500" />
                            <span className="text-[9px] font-bold text-red-600">Tdk Lulus</span>
                          </span>
                        )}
                      </div>
                      {/* Row 2: mapel · kelas · ujian */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-violet-600">{h.ujian.mapel}</span>
                        <span className="text-slate-300">·</span>
                        <span className="px-1.5 py-0 rounded bg-slate-100 text-slate-500 text-[9px] font-bold border border-slate-200">{h.user.kelas ?? "-"}</span>
                        <span className="text-slate-300">·</span>
                        <span className="truncate text-slate-500">{h.ujian.judul}</span>
                      </div>
                      {/* Row 3: nilai bar */}
                      <NilaiBar nilai={h.nilai} />
                    </div>

                    {/* Tanggal */}
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold text-slate-600 whitespace-nowrap">{formatTanggal(h.selesaiAt)}</p>
                      <p className="text-[9px] text-slate-400">{formatWaktu(h.selesaiAt)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── DESKTOP: Full table (hidden on mobile) ── */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="w-8 text-center text-xs font-bold text-slate-400">#</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 cursor-pointer select-none hover:text-teal-600 transition-colors" onClick={() => handleSort("nama")}>
                  Nama Siswa <SortIcon col="nama" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500">Kelas</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 cursor-pointer select-none hover:text-teal-600 transition-colors" onClick={() => handleSort("mapel")}>
                  Mapel <SortIcon col="mapel" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 cursor-pointer select-none hover:text-teal-600 transition-colors" onClick={() => handleSort("ujian")}>
                  Judul Ujian <SortIcon col="ujian" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 cursor-pointer select-none hover:text-teal-600 transition-colors" onClick={() => handleSort("nilai")}>
                  Nilai <SortIcon col="nilai" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 cursor-pointer select-none hover:text-teal-600 transition-colors" onClick={() => handleSort("lulus")}>
                  Status <SortIcon col="lulus" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 cursor-pointer select-none hover:text-teal-600 transition-colors" onClick={() => handleSort("selesaiAt")}>
                  Selesai <SortIcon col="selesaiAt" sortKey={sortKey} sortDir={sortDir} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)" }}>
                      <BarChart3 className="size-7 text-teal-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Tidak ada hasil ujian ditemukan</p>
                    {hasFilter && <button onClick={resetFilter} className="mt-2 text-xs font-semibold text-teal-600 hover:underline">Reset filter</button>}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((h, idx) => {
                  const rowNum = (page - 1) * perPage + idx + 1
                  return (
                    <TableRow key={h.id} className="hover:bg-teal-50/30 transition-colors border-b border-slate-50">
                      <TableCell className="text-center text-xs text-slate-400 font-bold w-8">{rowNum}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black shadow-sm" style={{ background: tealGradient }}>
                            {getInitials(h.user.nama)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{h.user.nama}</p>
                            <p className="text-[10px] text-slate-400 truncate">{h.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">{h.user.kelas ?? "-"}</span>
                      </TableCell>
                      <TableCell><span className="text-xs font-semibold text-violet-600">{h.ujian.mapel}</span></TableCell>
                      <TableCell><p className="text-xs text-slate-700 truncate max-w-[160px]" title={h.ujian.judul}>{h.ujian.judul}</p></TableCell>
                      <TableCell className="min-w-[100px]"><NilaiBar nilai={h.nilai} /></TableCell>
                      <TableCell>
                        {h.lulus ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                            <span className="text-[10px] font-bold text-emerald-600">Lulus</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200">
                            <XCircle className="size-3 text-red-500 shrink-0" />
                            <span className="text-[10px] font-bold text-red-600">Tidak Lulus</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-slate-700 whitespace-nowrap">{formatTanggal(h.selesaiAt)}</p>
                        <p className="text-[10px] text-slate-400">{formatWaktu(h.selesaiAt)}</p>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Hal. <span className="font-bold text-slate-700">{page}</span>/<span className="font-bold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="h-7 px-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">«</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-7 px-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
                  acc.push(p); return acc
                }, [])
                .map((p, i) => p === "..." ? (
                  <span key={`e-${i}`} className="text-xs px-1 text-slate-400">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`h-7 w-7 text-xs rounded-lg font-bold transition-all ${p === page ? "text-white shadow-sm" : "border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600"}`}
                    style={p === page ? { background: tealGradient } : {}}
                  >{p}</button>
                ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-7 px-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="h-7 px-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}