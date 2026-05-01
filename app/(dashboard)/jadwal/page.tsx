"use client"

import { useState } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  BookOpen,
  ClipboardList,
  Info,
  GraduationCap,
  Filter,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  Hourglass,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type JadwalType = "ujian" | "pelajaran" | "info" | "ekskul"

interface JadwalItem {
  id: string
  jam: string
  jamSelesai: string
  mataPelajaran: string
  ruang: string
  guru: string
  type: JadwalType
  status?: "selesai" | "berlangsung" | "akan_datang"
  catatan?: string
}

interface DaySchedule {
  date: Date
  items: JadwalItem[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const today = new Date()

const scheduleData: Record<string, JadwalItem[]> = {
  // Hari ini
  [formatKey(today)]: [
    {
      id: "1",
      jam: "07:00",
      jamSelesai: "07:30",
      mataPelajaran: "Upacara Bendera",
      ruang: "Lapangan Utama",
      guru: "Seluruh Warga Sekolah",
      type: "info",
      status: "selesai",
    },
    {
      id: "2",
      jam: "08:00",
      jamSelesai: "09:30",
      mataPelajaran: "Matematika Peminatan",
      ruang: "XII IPA 1",
      guru: "Bpk. Ahmad Fauzi, S.Pd",
      type: "pelajaran",
      status: "selesai",
    },
    {
      id: "3",
      jam: "09:45",
      jamSelesai: "11:15",
      mataPelajaran: "Ujian Fisika",
      ruang: "Lab Komputer Lt. 2",
      guru: "Ibu Sari Dewi, M.Pd",
      type: "ujian",
      status: "berlangsung",
      catatan: "Bawa kartu ujian & alat tulis",
    },
    {
      id: "4",
      jam: "11:30",
      jamSelesai: "13:00",
      mataPelajaran: "Bahasa Indonesia",
      ruang: "XII IPA 1",
      guru: "Ibu Ratna Sari, S.Pd",
      type: "pelajaran",
      status: "akan_datang",
    },
    {
      id: "5",
      jam: "14:00",
      jamSelesai: "15:30",
      mataPelajaran: "Kimia",
      ruang: "Lab Kimia",
      guru: "Bpk. Hendra, M.Si",
      type: "pelajaran",
      status: "akan_datang",
    },
    {
      id: "6",
      jam: "15:45",
      jamSelesai: "17:00",
      mataPelajaran: "Pramuka / Ekskul",
      ruang: "Aula Sekolah",
      guru: "Pembina Ekskul",
      type: "ekskul",
      status: "akan_datang",
    },
  ],
  [formatKey(addDays(today, 1))]: [
    {
      id: "7",
      jam: "08:00",
      jamSelesai: "09:30",
      mataPelajaran: "Ujian Bahasa Inggris",
      ruang: "Lab Bahasa",
      guru: "Ibu Dewi Kusuma, S.Pd",
      type: "ujian",
      status: "akan_datang",
      catatan: "Listening test — hadir 15 menit lebih awal",
    },
    {
      id: "8",
      jam: "10:00",
      jamSelesai: "11:30",
      mataPelajaran: "Sejarah Indonesia",
      ruang: "XII IPA 1",
      guru: "Bpk. Sugeng, S.Pd",
      type: "pelajaran",
      status: "akan_datang",
    },
    {
      id: "9",
      jam: "13:00",
      jamSelesai: "14:30",
      mataPelajaran: "Biologi",
      ruang: "Lab Biologi",
      guru: "Ibu Lestari, M.Pd",
      type: "pelajaran",
      status: "akan_datang",
    },
  ],
  [formatKey(addDays(today, 2))]: [
    {
      id: "10",
      jam: "08:00",
      jamSelesai: "09:30",
      mataPelajaran: "Matematika Wajib",
      ruang: "XII IPA 1",
      guru: "Bpk. Ahmad Fauzi, S.Pd",
      type: "pelajaran",
      status: "akan_datang",
    },
    {
      id: "11",
      jam: "09:45",
      jamSelesai: "11:15",
      mataPelajaran: "Ujian Kimia",
      ruang: "Lab Komputer Lt. 2",
      guru: "Bpk. Hendra, M.Si",
      type: "ujian",
      status: "akan_datang",
      catatan: "Bawa kalkulator scientific",
    },
  ],
  [formatKey(addDays(today, -1))]: [
    {
      id: "12",
      jam: "08:00",
      jamSelesai: "09:30",
      mataPelajaran: "Fisika",
      ruang: "XII IPA 1",
      guru: "Ibu Sari Dewi, M.Pd",
      type: "pelajaran",
      status: "selesai",
    },
    {
      id: "13",
      jam: "10:00",
      jamSelesai: "11:30",
      mataPelajaran: "Bahasa Inggris",
      ruang: "XII IPA 1",
      guru: "Ibu Dewi Kusuma, S.Pd",
      type: "pelajaran",
      status: "selesai",
    },
    {
      id: "14",
      jam: "13:00",
      jamSelesai: "14:30",
      mataPelajaran: "Matematika Peminatan",
      ruang: "XII IPA 1",
      guru: "Bpk. Ahmad Fauzi, S.Pd",
      type: "pelajaran",
      status: "selesai",
    },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function getDayName(date: Date, short = false): string {
  const days = short
    ? ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    : ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  return days[date.getDay()]
}

function getMonthName(date: Date): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ]
  return months[date.getMonth()]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const typeConfig: Record<
  JadwalType,
  {
    label: string
    bgIcon: string
    colorIcon: string
    dot: string
    badge: string
    borderLeft: string
    icon: React.ReactNode
  }
> = {
  ujian: {
    label: "Ujian",
    bgIcon: "bg-red-50 dark:bg-red-900/20",
    colorIcon: "text-red-500",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    borderLeft: "border-l-red-500",
    icon: <ClipboardList size={16} strokeWidth={2} />,
  },
  pelajaran: {
    label: "Pelajaran",
    bgIcon: "bg-teal-50 dark:bg-teal-900/20",
    colorIcon: "text-teal-600",
    dot: "bg-teal-500",
    badge: "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800",
    borderLeft: "border-l-teal-500",
    icon: <BookOpen size={16} strokeWidth={2} />,
  },
  info: {
    label: "Info",
    bgIcon: "bg-slate-100 dark:bg-slate-700",
    colorIcon: "text-slate-500",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600",
    borderLeft: "border-l-slate-400",
    icon: <Info size={16} strokeWidth={2} />,
  },
  ekskul: {
    label: "Ekskul",
    bgIcon: "bg-amber-50 dark:bg-amber-900/20",
    colorIcon: "text-amber-500",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    borderLeft: "border-l-amber-400",
    icon: <GraduationCap size={16} strokeWidth={2} />,
  },
}

const statusConfig = {
  selesai: {
    label: "Selesai",
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    cls: "text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-500",
  },
  berlangsung: {
    label: "Berlangsung",
    icon: <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block" />,
    cls: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
  },
  akan_datang: {
    label: "Akan Datang",
    icon: <Hourglass size={12} strokeWidth={2.5} />,
    cls: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  },
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JadwalPage() {
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekOffset, setWeekOffset] = useState(0)
  const [filterType, setFilterType] = useState<JadwalType | "semua">("semua")
  const [searchQuery, setSearchQuery] = useState("")

  // Generate week days
  const getWeekDays = () => {
    const days: Date[] = []
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7) // Start from Monday
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startOfWeek, i))
    }
    return days
  }

  const weekDays = getWeekDays()
  const key = formatKey(selectedDate)
  const allItems = scheduleData[key] ?? []

  const filteredItems = allItems.filter((item) => {
    const matchType = filterType === "semua" || item.type === filterType
    const matchSearch =
      searchQuery === "" ||
      item.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ruang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.guru.toLowerCase().includes(searchQuery.toLowerCase())
    return matchType && matchSearch
  })

  const isToday = isSameDay(selectedDate, today)
  const ujianCount = allItems.filter((i) => i.type === "ujian").length
  const berlangsung = allItems.find((i) => i.status === "berlangsung")

  return (
    <div className="space-y-5 pb-6">
      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-5 text-white shadow-lg">
        {/* Decorative */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-20 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-emerald-400/20" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={16} className="text-teal-200" strokeWidth={2} />
              <p className="text-xs font-medium text-teal-100 uppercase tracking-wider">Jadwal Belajar</p>
            </div>
            <h1 className="text-2xl font-bold">
              {isToday
                ? "Hari Ini"
                : `${getDayName(selectedDate)}, ${selectedDate.getDate()} ${getMonthName(selectedDate)}`}
            </h1>
            <p className="text-sm text-teal-100 mt-0.5">
              {allItems.length} kegiatan &bull; {ujianCount} ujian
            </p>
          </div>

          {berlangsung && (
            <div className="hidden sm:block rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2 text-right max-w-[160px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[10px] text-teal-100 font-medium">Sedang berlangsung</p>
              </div>
              <p className="text-sm font-bold leading-snug">{berlangsung.mataPelajaran}</p>
              <p className="text-xs text-teal-200">{berlangsung.jam} – {berlangsung.jamSelesai}</p>
            </div>
          )}
        </div>

        {/* Weekly summary pills */}
        <div className="relative mt-3 flex flex-wrap gap-2">
          {[
            { label: `${allItems.filter((i) => i.type === "pelajaran").length} Pelajaran`, color: "bg-white/20" },
            { label: `${ujianCount} Ujian`, color: ujianCount > 0 ? "bg-red-400/30" : "bg-white/20" },
            { label: `${allItems.filter((i) => i.type === "ekskul").length} Ekskul`, color: "bg-white/20" },
          ].map((pill) => (
            <span
              key={pill.label}
              className={`inline-flex items-center rounded-full ${pill.color} px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm`}
            >
              {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Week Selector ── */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {getMonthName(weekDays[0])} {weekDays[0].getFullYear()}
            {weekDays[0].getMonth() !== weekDays[6].getMonth() &&
              ` – ${getMonthName(weekDays[6])}`}
          </p>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day buttons */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            const isTodayDay = isSameDay(day, today)
            const dayKey = formatKey(day)
            const hasItems = (scheduleData[dayKey]?.length ?? 0) > 0
            const hasUjian = scheduleData[dayKey]?.some((i) => i.type === "ujian")

            return (
              <button
                key={dayKey}
                onClick={() => setSelectedDate(day)}
                className={`relative flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-150 ${
                  isSelected
                    ? "bg-teal-600 text-white shadow-sm"
                    : isTodayDay
                    ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                  {getDayName(day, true)}
                </span>
                <span className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>
                  {day.getDate()}
                </span>
                {/* Indicator dots */}
                <div className="flex gap-0.5 h-1">
                  {hasItems && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isSelected ? "bg-white/70" : "bg-teal-400"
                      }`}
                    />
                  )}
                  {hasUjian && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isSelected ? "bg-red-200" : "bg-red-400"
                      }`}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Filter & Search ── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari mata pelajaran, ruang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 h-9 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
          />
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as JadwalType | "semua")}
            className="appearance-none h-9 pl-3 pr-7 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all cursor-pointer"
          >
            <option value="semua">Semua</option>
            <option value="ujian">Ujian</option>
            <option value="pelajaran">Pelajaran</option>
            <option value="ekskul">Ekskul</option>
            <option value="info">Info</option>
          </select>
          <Filter
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* ── Schedule List ── */}
      {filteredItems.length === 0 ? (
        <EmptyState isToday={isToday} hasSearch={searchQuery !== ""} />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[52px] top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-700/80 z-0" />

          <div className="space-y-3">
            {filteredItems.map((item, idx) => (
              <ScheduleCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* ── Ujian Upcoming Warning ── */}
      {(() => {
        const nextUjian = filteredItems.find(
          (i) => i.type === "ujian" && i.status === "akan_datang"
        )
        if (!nextUjian) return null
        return (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 shrink-0">
              <AlertCircle size={16} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Persiapkan dirimu!
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Ujian <span className="font-semibold">{nextUjian.mataPelajaran}</span> pukul{" "}
                {nextUjian.jam} di {nextUjian.ruang}.
                {nextUjian.catatan && ` ${nextUjian.catatan}.`}
              </p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Schedule Card ────────────────────────────────────────────────────────────

function ScheduleCard({ item, index }: { item: JadwalItem; index: number }) {
  const cfg = typeConfig[item.type]
  const sCfg = item.status ? statusConfig[item.status] : null
  const isActive = item.status === "berlangsung"

  return (
    <div className={`relative flex gap-3 ${isActive ? "z-10" : "z-0"}`}>
      {/* Time column */}
      <div className="w-[52px] shrink-0 flex flex-col items-end pt-3 z-10">
        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 pr-1 leading-none">
          {item.jam}
        </span>
        <span className="text-[9px] text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 pr-1 mt-0.5 leading-none">
          {item.jamSelesai}
        </span>
      </div>

      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0 z-10 mt-3.5">
        <div
          className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${cfg.dot} ${
            isActive ? "ring-2 ring-green-400/40 ring-offset-1" : ""
          }`}
        />
      </div>

      {/* Card */}
      <div
        className={`flex-1 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 border-l-4 ${cfg.borderLeft} shadow-sm transition-all duration-200 overflow-hidden ${
          isActive ? "shadow-md ring-1 ring-green-400/20" : "hover:shadow-md"
        }`}
      >
        {/* Active top strip */}
        {isActive && (
          <div className="h-0.5 bg-gradient-to-r from-green-400 to-emerald-400" />
        )}

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            {/* Left: icon + title */}
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${cfg.bgIcon} ${cfg.colorIcon}`}
              >
                {cfg.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                  {sCfg && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sCfg.cls}`}
                    >
                      {sCfg.icon}
                      {sCfg.label}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate">
                  {item.mataPelajaran}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.guru}</p>
              </div>
            </div>

            {/* Right: duration chip */}
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 justify-end">
                <Clock size={11} strokeWidth={2} />
                <span>{getDuration(item.jam, item.jamSelesai)}</span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} strokeWidth={2} />
              {item.ruang}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} strokeWidth={2} />
              {item.jam} – {item.jamSelesai}
            </span>
          </div>

          {/* Catatan */}
          {item.catatan && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5">
              <Bell size={11} strokeWidth={2} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
                {item.catatan}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ isToday, hasSearch }: { isToday: boolean; hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
        <CalendarDays size={28} strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
        {hasSearch ? "Tidak ada hasil" : "Tidak ada jadwal"}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[200px]">
        {hasSearch
          ? "Coba kata kunci lain atau ubah filter"
          : isToday
          ? "Kamu tidak memiliki jadwal hari ini"
          : "Tidak ada kegiatan pada hari ini"}
      </p>
    </div>
  )
}

// ─── Duration helper ──────────────────────────────────────────────────────────

function getDuration(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins >= 60) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}j ${m}m` : `${h} jam`
  }
  return `${mins} mnt`
}