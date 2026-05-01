"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  ClipboardList,
  Award,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Bell,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  FileText,
  Zap,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InfoUjianCard } from "@/components/dashboard/InfoUjianCard"
import { JadwalMiniCard } from "@/components/dashboard/JadwalMiniCard"

// ─── Types ────────────────────────────────────────────────────────────────────
interface HasilTerbaru {
  id: string
  nilai: number
  lulus: boolean
  selesaiAt: Date
  user: { nama: string; kelas: string | null }
  ujian: { judul: string; mapel: string }
}

interface UjianData {
  id: string
  judul: string
  mapel: string
  guru: string
  tanggal: Date | string
  waktuMulai: Date | string
  waktuSelesai: Date | string
  durasi: number
  soal?: { id: string }[]
}

interface DashboardData {
  greeting?: string
  currentDate?: string
  stats: {
    totalSiswa: number
    totalUjian: number
    rataRataNilai: number
    tingkatKelulusan: number
    totalHasil: number
  }
  ujianAktif: UjianData[]
  ujianMendatang: UjianData[]
  ujianHariIni: UjianData[]
  hasilTerbaru: HasilTerbaru[]
}

interface Props {
  data: DashboardData
  user: { name: string; role: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toIso(d: Date | string) {
  return typeof d === "string" ? d : d.toISOString()
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ─── Mini SVG Bar Chart ───────────────────────────────────────────────────────
function BarChartWidget({ hasilTerbaru }: { hasilTerbaru: HasilTerbaru[] }) {
  // group nilai into buckets: <60, 60-70, 70-80, 80-90, 90-100
  const buckets = [
    { label: "<60",    min: 0,  max: 60,  color: "#ef4444" },
    { label: "60–70", min: 60, max: 70,  color: "#f59e0b" },
    { label: "70–80", min: 70, max: 80,  color: "#3b82f6" },
    { label: "80–90", min: 80, max: 90,  color: "#0d9488" },
    { label: "90+",   min: 90, max: 101, color: "#10b981" },
  ]

  const counts = buckets.map((b) =>
    hasilTerbaru.filter((h) => h.nilai >= b.min && h.nilai < b.max).length
  )
  const maxCount = Math.max(...counts, 1)

  const W = 260
  const H = 100
  const barW = 36
  const gap = (W - buckets.length * barW) / (buckets.length + 1)

  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" style={{ maxHeight: 140 }}>
      {counts.map((c, i) => {
        const barH = Math.max(4, (c / maxCount) * H)
        const x = gap + i * (barW + gap)
        const y = H - barH
        return (
          <g key={i}>
            {/* bg bar */}
            <rect x={x} y={0} width={barW} height={H} rx={8} fill="#f0fdfa" />
            {/* value bar */}
            <rect x={x} y={y} width={barW} height={barH} rx={8} fill={buckets[i].color} opacity={0.85} />
            {/* count label */}
            {c > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight="700" fill={buckets[i].color}>
                {c}
              </text>
            )}
            {/* x label */}
            <text x={x + barW / 2} y={H + 18} textAnchor="middle" fontSize={9} fill="#6b7a7a" fontWeight="500">
              {buckets[i].label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ lulus, total }: { lulus: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((lulus / total) * 100)
  const r = 38
  const circumference = 2 * Math.PI * r
  const strokeDash = (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
        {/* track */}
        <circle cx={50} cy={50} r={r} fill="none" stroke="#f0fdfa" strokeWidth={12} />
        {/* lulus */}
        <circle
          cx={50} cy={50} r={r} fill="none"
          stroke="#0d9488" strokeWidth={12}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        {/* tidak lulus */}
        <circle
          cx={50} cy={50} r={r} fill="none"
          stroke="#ef4444" strokeWidth={12}
          strokeDasharray={`${circumference - strokeDash} ${circumference}`}
          strokeDashoffset={-strokeDash}
          strokeLinecap="round"
          opacity={0.3}
        />
      </svg>
      {/* center label */}
      <div className="-mt-[88px] mb-[64px] flex flex-col items-center pointer-events-none">
        <span className="text-xl font-800 text-[var(--primary)]">{pct}%</span>
        <span className="text-[9px] text-[var(--muted-foreground)] font-500 uppercase tracking-wide">Lulus</span>
      </div>
      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] inline-block" />
          <span className="text-[10px] text-[var(--muted-foreground)]">Lulus ({lulus})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block opacity-50" />
          <span className="text-[10px] text-[var(--muted-foreground)]">Tidak ({total - lulus})</span>
        </div>
      </div>
    </div>
  )
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ values, color = "#0d9488" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const W = 80
  const H = 28
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W
    const y = H - (v / max) * H
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-16 h-6">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r={2.5} fill={color} />
    </svg>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  valueCls: string
  trend?: { label: string; up: boolean }
  sparkValues?: number[]
  sparkColor?: string
}

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, valueCls, trend, sparkValues, sparkColor }: StatCardProps) {
  return (
    <div className="card-stat p-4 flex flex-col gap-2 animate-fade-up">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-600 text-[var(--muted-foreground)] uppercase tracking-wide leading-tight">{title}</p>
        <span className={`icon-badge w-9 h-9 shrink-0 rounded-2xl ${iconBg}`} style={{ color: iconColor }}>
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <div>
        <p className={`text-2xl font-800 tabular-nums tracking-tight ${valueCls}`}>{value}</p>
        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-tight">{subtitle}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        {trend && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-700 px-2 py-0.5 rounded-full"
            style={{
              background: trend.up ? "rgba(13,148,136,0.12)" : "rgba(239,68,68,0.10)",
              color: trend.up ? "var(--primary)" : "#ef4444",
            }}
          >
            {trend.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend.label}
          </span>
        )}
        {sparkValues && <Sparkline values={sparkValues} color={sparkColor ?? "#0d9488"} />}
      </div>
    </div>
  )
}

// ─── Nilai Progress Bar ───────────────────────────────────────────────────────
function NilaiBar({ nilai }: { nilai: number }) {
  const pct = Math.min(100, Math.max(0, nilai))
  const color = pct >= 80 ? "#0d9488" : pct >= 70 ? "#3b82f6" : "#ef4444"
  return (
    <div className="flex items-center gap-2 min-w-[72px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-700 w-7 text-right tabular-nums" style={{ color }}>{Math.round(nilai)}</span>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  badge,
  href,
  iconColor = "var(--primary)",
}: {
  icon: React.ElementType
  title: string
  badge?: string | number
  href?: string
  iconColor?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-7 h-7 rounded-xl" style={{ background: "var(--accent)" }}>
          <Icon size={14} strokeWidth={2} color={iconColor} />
        </span>
        <span className="text-sm font-700 text-[var(--foreground)]">{title}</span>
        {badge !== undefined && (
          <span
            className="text-[10px] font-700 px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent)", color: "var(--primary)" }}
          >
            {badge}
          </span>
        )}
      </div>
      {href && (
        <Link href={href}>
          <button className="flex items-center gap-1 text-[11px] font-600 px-2.5 py-1 rounded-xl transition-all hover:bg-[var(--accent)]" style={{ color: "var(--primary)" }}>
            Semua <ArrowRight size={11} />
          </button>
        </Link>
      )}
    </div>
  )
}

// ─── Card Shell ───────────────────────────────────────────────────────────────
function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border bg-[var(--card)] overflow-hidden ${className}`}
      style={{
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminDashboardClient({ data, user }: Props) {
  const { stats, ujianAktif, ujianMendatang, ujianHariIni, hasilTerbaru } = data
  const [chartTab, setChartTab] = useState<"bar" | "donut">("bar")

  // Gunakan greeting dari server untuk menghindari hydration mismatch
  const greeting = data.greeting || "Selamat Datang"
  const firstName = user.name.split(" ")[0]

  const toUjianProps = (u: UjianData) => ({
    ...u,
    tanggal: toIso(u.tanggal),
    waktuMulai: toIso(u.waktuMulai),
    waktuSelesai: toIso(u.waktuSelesai),
    soal: u.soal?.map((s) => ({
      id: s.id,
      ujianId: u.id,
      nomor: 0,
      pertanyaan: "",
      tipe: "PILIHAN_GANDA" as const,
      bobot: 1,
    })),
  })

  // Date formatting yang aman untuk hydration
  const formatTanggal = (tanggal: string | Date) => {
    const date = new Date(tanggal)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatWaktu = (waktu: string | Date) => {
    const date = new Date(waktu)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const hasNotif =
    ujianAktif.length > 0 ||
    ujianHariIni.length > 0 ||
    (stats.tingkatKelulusan < 70 && stats.totalHasil > 0)

  const lulusCount = hasilTerbaru.filter((h) => h.lulus).length

  // sparkline dummy based on hasilTerbaru (latest 6)
  const sparkNilai = hasilTerbaru.slice(0, 6).reverse().map((h) => h.nilai)

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="animate-fade-up">
          {/* Live badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-700 text-emerald-600 uppercase tracking-widest">Live Dashboard</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-800 text-[var(--foreground)] leading-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {data.currentDate || new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <Link href="/admin/ujian/buat" className="flex-1 sm:flex-none">
              <button
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-5 text-sm font-700 rounded-2xl"
              >
                <Zap size={15} strokeWidth={2.5} />
                Buat Ujian
              </button>
            </Link>
            <Link href="/admin/soal/buat" className="flex-1 sm:flex-none">
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-5 text-sm font-600 rounded-2xl border transition-all hover:bg-[var(--accent)] hover:border-[var(--primary)] active:scale-[0.98]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
              >
                <FileText size={14} strokeWidth={2} />
                Tambah Soal
              </button>
            </Link>
          </div>
        </div>

        {/* ── STAT CARDS 2×2 ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard
            title="Total Siswa"
            value={stats.totalSiswa}
            subtitle="terdaftar"
            icon={Users}
            iconBg="rgba(13,148,136,0.12)"
            iconColor="var(--primary)"
            valueCls="text-[var(--primary)]"
            trend={{ label: "Aktif", up: true }}
            sparkValues={[2, 3, 2, 4, 3, stats.totalSiswa]}
            sparkColor="var(--primary)"
          />
          <StatCard
            title="Total Ujian"
            value={stats.totalUjian}
            subtitle={`${stats.totalHasil} submission`}
            icon={ClipboardList}
            iconBg="rgba(139,92,246,0.12)"
            iconColor="#8b5cf6"
            valueCls="text-violet-600"
            sparkValues={[1, 1, 2, 1, 2, stats.totalUjian]}
            sparkColor="#8b5cf6"
          />
          <StatCard
            title="Rata-rata Nilai"
            value={stats.rataRataNilai}
            subtitle="dari semua ujian"
            icon={BarChart3}
            iconBg="rgba(245,158,11,0.12)"
            iconColor="#f59e0b"
            valueCls="text-amber-600"
            sparkValues={sparkNilai.length > 1 ? sparkNilai : [0, 0, stats.rataRataNilai]}
            sparkColor="#f59e0b"
          />
          <StatCard
            title="Tingkat Lulus"
            value={`${stats.tingkatKelulusan}%`}
            subtitle="siswa lulus KKM"
            icon={Award}
            iconBg="rgba(16,185,129,0.12)"
            iconColor="#10b981"
            valueCls="text-emerald-600"
            trend={
              stats.totalHasil > 0
                ? { label: stats.tingkatKelulusan >= 70 ? "Baik" : "Perlu Perhatian", up: stats.tingkatKelulusan >= 70 }
                : undefined
            }
          />
        </div>

        {/* ── UJIAN AKTIF ALERT ──────────────────────────────────────── */}
        {ujianAktif.length > 0 && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border animate-fade-up"
            style={{
              background: "rgba(239,68,68,0.06)",
              borderColor: "rgba(239,68,68,0.25)",
            }}
          >
            <Activity size={16} className="text-red-500 animate-pulse shrink-0" />
            <p className="text-sm font-600 text-red-600 flex-1">
              {ujianAktif.length} ujian sedang berlangsung sekarang
            </p>
            <Link href="/admin/ujian">
              <button className="text-[11px] font-700 px-3 py-1 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                Pantau
              </button>
            </Link>
          </div>
        )}

        {/* ── MAIN GRID ──────────────────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* LEFT COL */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── CHART CARD ── */}
            <CardShell className="animate-fade-up stagger-1">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-xl" style={{ background: "var(--accent)" }}>
                      <BarChart3 size={14} color="var(--primary)" />
                    </span>
                    <span className="text-sm font-700 text-[var(--foreground)]">Statistik Nilai</span>
                  </div>
                  {/* Tab toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--muted)" }}>
                    {(["bar", "donut"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setChartTab(t)}
                        className="text-[10px] font-700 px-3 py-1 rounded-lg transition-all"
                        style={{
                          background: chartTab === t ? "var(--card)" : "transparent",
                          color: chartTab === t ? "var(--primary)" : "var(--muted-foreground)",
                          boxShadow: chartTab === t ? "var(--shadow-card)" : "none",
                        }}
                      >
                        {t === "bar" ? "Distribusi" : "Kelulusan"}
                      </button>
                    ))}
                  </div>
                </div>

                {hasilTerbaru.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <BarChart3 size={32} color="var(--border)" />
                    <p className="text-xs text-[var(--muted-foreground)]">Belum ada data hasil ujian</p>
                  </div>
                ) : chartTab === "bar" ? (
                  <div className="px-2 pb-2">
                    <BarChartWidget hasilTerbaru={hasilTerbaru} />
                    <p className="text-center text-[10px] text-[var(--muted-foreground)] mt-1">Distribusi Nilai (rentang)</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2 pb-4">
                    <DonutChart lulus={lulusCount} total={hasilTerbaru.length} />
                  </div>
                )}
              </div>
            </CardShell>

            {/* ── UJIAN HARI INI ── */}
            {ujianHariIni.length > 0 && (
              <CardShell className="animate-fade-up stagger-2">
                <div className="px-4 pt-4 pb-1">
                  <SectionHeader
                    icon={CalendarCheck}
                    title="Ujian Hari Ini"
                    badge={`${ujianHariIni.length} ujian`}
                    iconColor="var(--primary)"
                  />
                </div>
                <div>
                  {ujianHariIni.map((u, idx) => {
                    const mulai = new Date(u.waktuMulai)
                    const selesai = new Date(u.waktuSelesai)
                    const now = new Date()
                    const isNow = mulai <= now && now <= selesai
                    return (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--muted)]"
                        style={{ borderTop: idx === 0 ? "none" : `1px solid var(--border)` }}
                      >
                        <span
                          className="flex-shrink-0 w-2 h-2 rounded-full"
                          style={{ background: isNow ? "#ef4444" : "#f59e0b", boxShadow: isNow ? "0 0 0 3px rgba(239,68,68,0.2)" : "none" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-600 truncate text-[var(--foreground)]">{u.judul}</p>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            {u.mapel} · {u.soal?.length ?? 0} soal
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-600 tabular-nums text-[var(--foreground)]">
                            {mulai.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}–
                            {selesai.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <span
                            className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                            style={{
                              background: isNow ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                              color: isNow ? "#ef4444" : "#d97706",
                            }}
                          >
                            {isNow ? "Berlangsung" : "Menunggu"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {ujianAktif.map((u) => (
                    <InfoUjianCard key={u.id} ujian={toUjianProps(u)} showAction={false} />
                  ))}
                </div>
              </CardShell>
            )}

            {/* ── UJIAN MENDATANG ── */}
            <CardShell className="animate-fade-up stagger-2">
              <div className="px-4 pt-4 pb-2">
                <SectionHeader
                  icon={BookOpen}
                  title="Ujian Mendatang"
                  badge="7 hari"
                  href="/admin/ujian"
                  iconColor="#8b5cf6"
                />
              </div>
              <div className="px-4 pb-4">
                {ujianMendatang.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--muted)" }}>
                      <BookOpen size={20} color="var(--muted-foreground)" />
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">Tidak ada ujian dalam 7 hari ke depan</p>
                    <Link href="/admin/ujian/buat">
                      <button className="flex items-center gap-1.5 text-sm font-600 px-4 py-2 rounded-2xl border transition-all hover:bg-[var(--accent)]"
                        style={{ borderColor: "var(--border)", color: "var(--primary)" }}>
                        <Plus size={14} /> Buat Ujian
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ujianMendatang.map((u) => (
                      <JadwalMiniCard
                        key={u.id}
                        jadwal={{
                          id: u.id,
                          judul: u.judul,
                          mapel: u.mapel,
                          tanggal: toIso(u.tanggal),
                          waktuMulai: toIso(u.waktuMulai),
                        }}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardShell>

            {/* ── HASIL TERBARU ── */}
            <CardShell className="animate-fade-up stagger-3">
              <div className="px-4 pt-4 pb-2">
                <SectionHeader
                  icon={GraduationCap}
                  title="Hasil Ujian Terbaru"
                  href="/admin/hasil"
                  iconColor="#10b981"
                />
              </div>
              {hasilTerbaru.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2 px-4 pb-4">
                  <BarChart3 size={28} color="var(--border)" />
                  <p className="text-sm text-[var(--muted-foreground)]">Belum ada hasil ujian</p>
                </div>
              ) : (
                <div>
                  {hasilTerbaru.map((h, idx) => (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--muted)]"
                      style={{ borderTop: idx === 0 ? "none" : `1px solid var(--border)` }}
                    >
                      {/* avatar */}
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-2xl text-[11px] font-800 shrink-0"
                        style={{
                          background: h.lulus ? "rgba(13,148,136,0.12)" : "rgba(239,68,68,0.10)",
                          color: h.lulus ? "var(--primary)" : "#ef4444",
                        }}
                      >
                        {getInitials(h.user.nama)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-600 truncate text-[var(--foreground)]">{h.user.nama}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                          {h.ujian.mapel} · {h.ujian.judul}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {h.lulus
                          ? <CheckCircle2 size={15} className="text-[var(--primary)]" />
                          : <XCircle size={15} className="text-red-500 opacity-60" />
                        }
                        <NilaiBar nilai={h.nilai} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardShell>
          </div>

          {/* RIGHT COL ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* ── STATUS SISTEM ── */}
            <CardShell className="animate-fade-up stagger-1">
              <div className="px-4 pt-4 pb-2">
                <SectionHeader icon={Activity} title="Status Sistem" iconColor="#f59e0b" />
              </div>
              <div className="px-4 pb-4 space-y-2">
                {[
                  {
                    label: "Ujian Berlangsung",
                    value: ujianAktif.length,
                    icon: Clock,
                    active: ujianAktif.length > 0,
                    color: ujianAktif.length > 0 ? "#ef4444" : "var(--muted-foreground)",
                    bg: ujianAktif.length > 0 ? "rgba(239,68,68,0.08)" : "var(--muted)",
                  },
                  {
                    label: "Ujian Hari Ini",
                    value: ujianHariIni.length,
                    icon: CalendarCheck,
                    active: false,
                    color: "var(--primary)",
                    bg: "var(--accent)",
                  },
                  {
                    label: "Ujian Minggu Ini",
                    value: ujianMendatang.length,
                    icon: BookOpen,
                    active: false,
                    color: "#8b5cf6",
                    bg: "rgba(139,92,246,0.10)",
                  },
                  {
                    label: "Total Submission",
                    value: stats.totalHasil,
                    icon: ClipboardList,
                    active: false,
                    color: "#10b981",
                    bg: "rgba(16,185,129,0.10)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl"
                    style={{ background: item.bg }}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        size={14}
                        strokeWidth={2}
                        style={{ color: item.color, flexShrink: 0 }}
                        className={item.active ? "animate-pulse" : ""}
                      />
                      <span className="text-[11px] font-500 text-[var(--muted-foreground)]">{item.label}</span>
                    </div>
                    <span className="text-sm font-800 tabular-nums" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardShell>

            {/* ── NOTIFIKASI ── */}
            <CardShell className="animate-fade-up stagger-2">
              <div className="px-4 pt-4 pb-2">
                <SectionHeader icon={Bell} title="Notifikasi" iconColor="#f59e0b" />
              </div>
              <div className="px-4 pb-4 space-y-2">
                {ujianAktif.length > 0 && (
                  <div className="flex gap-3 p-3 rounded-2xl border" style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                    <Activity size={14} className="text-red-500 animate-pulse mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-700 text-red-600">Ujian Aktif</p>
                      <p className="text-[11px] text-red-500/80 mt-0.5">{ujianAktif.length} ujian sedang berlangsung</p>
                    </div>
                  </div>
                )}
                {ujianHariIni.length > 0 && (
                  <div className="flex gap-3 p-3 rounded-2xl border" style={{ background: "var(--accent)", borderColor: "rgba(13,148,136,0.25)" }}>
                    <CalendarCheck size={14} style={{ color: "var(--primary)" }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-700 text-[var(--primary)]">Jadwal Hari Ini</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                        {ujianHariIni.map((u) => u.judul).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {stats.tingkatKelulusan < 70 && stats.totalHasil > 0 && (
                  <div className="flex gap-3 p-3 rounded-2xl border" style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}>
                    <TrendingDown size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-700 text-amber-600">Lulus Rendah</p>
                      <p className="text-[11px] text-amber-500/80 mt-0.5">Hanya {stats.tingkatKelulusan}% siswa lulus KKM</p>
                    </div>
                  </div>
                )}
                {!hasNotif && (
                  <div className="flex gap-3 p-3 rounded-2xl border" style={{ background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }}>
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-700 text-emerald-600">Semua Baik</p>
                      <p className="text-[11px] text-emerald-500/80 mt-0.5">Tidak ada notifikasi penting saat ini</p>
                    </div>
                  </div>
                )}
              </div>
            </CardShell>

            {/* ── AKSI CEPAT ── */}
            <CardShell className="animate-fade-up stagger-3">
              <div className="px-4 pt-4 pb-2">
                <SectionHeader icon={Zap} title="Aksi Cepat" iconColor="var(--primary)" />
              </div>
              <div className="px-3 pb-3 space-y-1">
                {[
                  { href: "/admin/ujian/buat", icon: Zap,       label: "Buat Ujian Baru", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)" },
                  { href: "/admin/soal/buat",  icon: FileText,   label: "Tambah Soal",     color: "var(--primary)", bg: "var(--accent)" },
                  { href: "/admin/siswa",       icon: Users,      label: "Kelola Siswa",    color: "#10b981", bg: "rgba(16,185,129,0.10)" },
                  { href: "/admin/hasil",       icon: Eye,        label: "Rekap Nilai",     color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
                ].map((a) => (
                  <Link key={a.href} href={a.href}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl group transition-all hover:bg-[var(--muted)] active:scale-[0.98]">
                      <span
                        className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                        style={{ background: a.bg, color: a.color }}
                      >
                        <a.icon size={14} strokeWidth={2} />
                      </span>
                      <span className="text-sm font-600 flex-1 text-[var(--foreground)]">{a.label}</span>
                      <ChevronRight size={14} className="text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardShell>

          </div>
        </div>
      </div>
    </div>
  )
}