"use client"

import { useState } from "react"
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Filter,
  GraduationCap,
  Zap,
  Trophy,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  Info,
  Star,
  ChevronRight,
  Settings2,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
type NotifCategory = "semua" | "ujian" | "nilai" | "sistem" | "pengumuman"
type NotifPriority = "high" | "medium" | "low"

interface Notifikasi {
  id: string
  title: string
  body: string
  time: string
  timeAgo: string
  category: Omit<NotifCategory, "semua">
  priority: NotifPriority
  isRead: boolean
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  actionLabel?: string
  actionHref?: string
  meta?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const initialNotifs: Notifikasi[] = [
  {
    id: "1",
    title: "Ujian Matematika Peminatan Berlangsung",
    body: "Ujian sedang berlangsung. Deadline: hari ini pukul 20:00 WIB. Segera kerjakan sebelum waktu habis!",
    time: "10:15 WIB",
    timeAgo: "5 menit lalu",
    category: "ujian",
    priority: "high",
    isRead: false,
    icon: <GraduationCap size={16} />,
    iconBg: "bg-teal-500",
    iconColor: "text-white",
    actionLabel: "Mulai Ujian",
    actionHref: "/ujian/1",
    meta: "XII IPA 1 • Bpk. Ahmad Fauzi, S.Pd",
  },
  {
    id: "2",
    title: "Pengingat: Ujian Fisika Besok",
    body: "Ujian Fisika dijadwalkan besok pukul 08:00 WIB. Persiapkan diri dan pastikan perangkatmu siap.",
    time: "09:00 WIB",
    timeAgo: "1 jam lalu",
    category: "ujian",
    priority: "high",
    isRead: false,
    icon: <Zap size={16} />,
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    actionLabel: "Lihat Detail",
    actionHref: "/ujian/2",
    meta: "XII IPA 1 • Ibu Sari Dewi, M.Pd",
  },
  {
    id: "3",
    title: "Nilai Bahasa Inggris Telah Keluar",
    body: "Selamat! Kamu mendapatkan nilai 92 (Grade A) pada ujian Bahasa Inggris. Nilai ini berada di atas rata-rata kelas.",
    time: "Kemarin",
    timeAgo: "1 hari lalu",
    category: "nilai",
    priority: "medium",
    isRead: false,
    icon: <Trophy size={16} />,
    iconBg: "bg-amber-500",
    iconColor: "text-white",
    actionLabel: "Lihat Nilai",
    actionHref: "/nilai",
    meta: "Nilai: 92 • Grade A • #5 dari 32",
  },
  {
    id: "4",
    title: "Jadwal Ujian Bahasa Indonesia Ditambahkan",
    body: "Ujian Bahasa Indonesia telah dijadwalkan pada hari Kamis, pukul 10:00 WIB. Durasi 75 menit.",
    time: "Kemarin",
    timeAgo: "1 hari lalu",
    category: "ujian",
    priority: "medium",
    isRead: true,
    icon: <BookOpen size={16} />,
    iconBg: "bg-violet-500",
    iconColor: "text-white",
    actionLabel: "Lihat Jadwal",
    actionHref: "/jadwal",
    meta: "Kamis, 10:00 WIB • 75 menit",
  },
  {
    id: "5",
    title: "Nilai Biologi Telah Keluar",
    body: "Kamu mendapatkan nilai 88 (Grade A−) pada ujian Biologi. Pertahankan prestasimu!",
    time: "2 hari lalu",
    timeAgo: "2 hari lalu",
    category: "nilai",
    priority: "low",
    isRead: true,
    icon: <TrendingUp size={16} />,
    iconBg: "bg-green-500",
    iconColor: "text-white",
    actionLabel: "Lihat Nilai",
    actionHref: "/nilai",
    meta: "Nilai: 88 • Grade A− • #7 dari 32",
  },
  {
    id: "6",
    title: "Pengumuman: Libur Nasional",
    body: "Sekolah akan libur pada tanggal 1 Mei 2025 dalam rangka Hari Buruh Internasional. Tidak ada ujian pada hari tersebut.",
    time: "3 hari lalu",
    timeAgo: "3 hari lalu",
    category: "pengumuman",
    priority: "low",
    isRead: true,
    icon: <Info size={16} />,
    iconBg: "bg-sky-500",
    iconColor: "text-white",
    meta: "SMA Al-Istiqomah",
  },
  {
    id: "7",
    title: "Pembaruan Sistem Berhasil",
    body: "Sistem Ujian Online telah diperbarui ke versi terbaru. Nikmati fitur-fitur baru yang lebih baik.",
    time: "4 hari lalu",
    timeAgo: "4 hari lalu",
    category: "sistem",
    priority: "low",
    isRead: true,
    icon: <Settings2 size={16} />,
    iconBg: "bg-gray-500",
    iconColor: "text-white",
    meta: "Versi 2.1.0",
  },
  {
    id: "8",
    title: "Peringkat Kelas Diperbarui",
    body: "Peringkat kelas semester ini telah diperbarui. Kamu berada di posisi ke-5 dari 32 siswa. Terus semangat!",
    time: "5 hari lalu",
    timeAgo: "5 hari lalu",
    category: "nilai",
    priority: "low",
    isRead: true,
    icon: <Star size={16} />,
    iconBg: "bg-orange-500",
    iconColor: "text-white",
    actionLabel: "Lihat Peringkat",
    actionHref: "/nilai",
    meta: "#5 dari 32 siswa",
  },
]

const categories: { key: NotifCategory; label: string; icon: React.ReactNode }[] = [
  { key: "semua",       label: "Semua",        icon: <Bell size={12} />         },
  { key: "ujian",       label: "Ujian",         icon: <GraduationCap size={12} /> },
  { key: "nilai",       label: "Nilai",         icon: <Trophy size={12} />       },
  { key: "pengumuman",  label: "Pengumuman",    icon: <Info size={12} />         },
  { key: "sistem",      label: "Sistem",        icon: <Settings2 size={12} />    },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NotifikasiPage() {
  const [notifs, setNotifs]           = useState<Notifikasi[]>(initialNotifs)
  const [activeCategory, setCategory] = useState<NotifCategory>("semua")
  const [showUnreadOnly, setUnreadOnly] = useState(false)

  const unreadCount = notifs.filter((n) => !n.isRead).length

  const filtered = notifs.filter((n) => {
    const matchCat    = activeCategory === "semua" || n.category === activeCategory
    const matchUnread = !showUnreadOnly || !n.isRead
    return matchCat && matchUnread
  })

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))

  const markRead = (id: string) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )

  const deleteNotif = (id: string) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id))

  const clearAll = () =>
    setNotifs((prev) => prev.filter((n) => !n.isRead ||
      filtered.every((f) => f.id !== n.id)))

  return (
    <div className="space-y-6">

      {/* ── Banner Header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-5 md:p-6 text-white shadow-lg">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-16 bottom-0 h-24 w-24 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-emerald-400/20" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell size={14} className="text-teal-200" />
              <p className="text-sm font-medium text-teal-100">Pusat Notifikasi</p>
            </div>
            <h2 className="text-xl font-bold md:text-2xl">Notifikasi</h2>
            <p className="mt-1 text-sm text-teal-100">
              {unreadCount > 0
                ? `${unreadCount} notifikasi belum dibaca`
                : "Semua notifikasi sudah dibaca"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-300" />
                {unreadCount} Belum Dibaca
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <CheckCircle2 size={11} />
                {notifs.length - unreadCount} Sudah Dibaca
              </span>
            </div>
          </div>

          {/* Quick actions card */}
          <div className="hidden md:flex flex-col gap-2">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-sm hover:bg-white/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCheck size={13} />
              Tandai Semua Dibaca
            </button>
            <button
              onClick={() => setUnreadOnly((v) => !v)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold backdrop-blur-sm transition ${
                showUnreadOnly ? "bg-white text-teal-600" : "bg-white/15 hover:bg-white/25"
              }`}
            >
              <Filter size={13} />
              {showUnreadOnly ? "Semua Notif" : "Belum Dibaca"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <MiniStat
          icon={<Bell size={16} />}
          label="Total"
          value={notifs.length}
          colorClass="text-teal-600 dark:text-teal-400"
          bgClass="bg-teal-50 dark:bg-teal-900/20"
          ringClass="ring-teal-200 dark:ring-teal-800"
        />
        <MiniStat
          icon={<AlertCircle size={16} />}
          label="Belum Dibaca"
          value={unreadCount}
          colorClass="text-red-600 dark:text-red-400"
          bgClass="bg-red-50 dark:bg-red-900/20"
          ringClass="ring-red-200 dark:ring-red-800"
        />
        <MiniStat
          icon={<GraduationCap size={16} />}
          label="Ujian"
          value={notifs.filter((n) => n.category === "ujian").length}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50 dark:bg-blue-900/20"
          ringClass="ring-blue-200 dark:ring-blue-800"
        />
        <MiniStat
          icon={<Trophy size={16} />}
          label="Nilai"
          value={notifs.filter((n) => n.category === "nilai").length}
          colorClass="text-amber-600 dark:text-amber-400"
          bgClass="bg-amber-50 dark:bg-amber-900/20"
          ringClass="ring-amber-200 dark:ring-amber-800"
        />
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">

        {/* ── Kiri: Notif List ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Mobile actions */}
          <div className="flex gap-2 md:hidden">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
            >
              <CheckCheck size={13} />
              Tandai Dibaca
            </button>
            <button
              onClick={() => setUnreadOnly((v) => !v)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                showUnreadOnly
                  ? "border-teal-500 bg-teal-500 text-white"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter size={13} />
              {showUnreadOnly ? "Tampilkan Semua" : "Belum Dibaca"}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => {
              const count =
                cat.key === "semua"
                  ? notifs.length
                  : notifs.filter((n) => n.category === cat.key).length
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    activeCategory === cat.key
                      ? "bg-teal-500 text-white shadow-md shadow-teal-200/50 dark:shadow-teal-900/30"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeCategory === cat.key
                      ? "bg-white/20"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              {filtered.length} Notifikasi
            </h3>
            {filtered.some((n) => n.isRead) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={11} />
                Hapus Sudah Dibaca
              </button>
            )}
          </div>

          {/* Notif Cards */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 py-16 text-center">
                <BellOff size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Tidak ada notifikasi
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {showUnreadOnly ? "Semua notifikasi sudah dibaca" : "Belum ada notifikasi di kategori ini"}
                </p>
              </div>
            ) : (
              filtered.map((notif) => (
                <NotifCard
                  key={notif.id}
                  notif={notif}
                  onRead={markRead}
                  onDelete={deleteNotif}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Kanan: Ringkasan & Pengaturan ─────────────────────────── */}
        <div className="space-y-4">

          {/* Notif Penting */}
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
            Prioritas Tinggi
          </h3>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden">
            {notifs
              .filter((n) => n.priority === "high")
              .map((n) => (
                <div key={n.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${n.iconBg} ${n.iconColor}`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{n.title}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={9} />{n.timeAgo}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </div>
              ))}
            {notifs.filter((n) => n.priority === "high").length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-gray-400">Tidak ada notifikasi prioritas tinggi</p>
              </div>
            )}
          </div>

          {/* Kategori Ringkasan */}
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
            Ringkasan Kategori
          </h3>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/50 p-4 space-y-3">
            {[
              { label: "Ujian",      count: notifs.filter((n) => n.category === "ujian").length,      color: "bg-teal-500",  unread: notifs.filter((n) => n.category === "ujian" && !n.isRead).length },
              { label: "Nilai",      count: notifs.filter((n) => n.category === "nilai").length,      color: "bg-amber-500", unread: notifs.filter((n) => n.category === "nilai" && !n.isRead).length },
              { label: "Pengumuman", count: notifs.filter((n) => n.category === "pengumuman").length, color: "bg-sky-500",   unread: notifs.filter((n) => n.category === "pengumuman" && !n.isRead).length },
              { label: "Sistem",     count: notifs.filter((n) => n.category === "sistem").length,     color: "bg-gray-400",  unread: notifs.filter((n) => n.category === "sistem" && !n.isRead).length },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    {item.label}
                    {item.unread > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold">
                        {item.unread}
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">{item.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${item.color}`}
                    style={{ width: `${(item.count / notifs.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tips card */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell size={13} className="text-teal-600 dark:text-teal-400" />
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Pengingat Aktif</p>
            </div>
            <p className="text-xs text-teal-600 dark:text-teal-400 leading-relaxed">
              Ujian Matematika berlangsung <strong>hari ini pukul 20:00</strong>. Pastikan kamu sudah siap!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NotifCard ────────────────────────────────────────────────────────────────
function NotifCard({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notifikasi
  onRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const priorityAccent =
    notif.priority === "high"
      ? "bg-teal-500"
      : notif.priority === "medium"
      ? "bg-blue-400"
      : "bg-gray-300 dark:bg-gray-600"

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-800/50 transition-all hover:shadow-md ${
        !notif.isRead
          ? "border-teal-200 dark:border-teal-800 shadow-sm shadow-teal-50 dark:shadow-teal-900/10"
          : "border-gray-100 dark:border-gray-700/60"
      }`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${priorityAccent}`} />

      <div className="pl-4 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notif.iconBg} ${notif.iconColor} shadow-sm`}>
            {notif.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={notif.category as string} />
                {!notif.isRead && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 text-[9px] font-bold text-teal-600 dark:text-teal-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    Baru
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1">
                <Clock size={9} />
                {notif.timeAgo}
              </span>
            </div>

            <h4 className={`text-sm font-bold leading-snug ${
              !notif.isRead ? "text-gray-900 dark:text-gray-50" : "text-gray-700 dark:text-gray-200"
            }`}>
              {notif.title}
            </h4>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
              {notif.body}
            </p>

            {notif.meta && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                <CalendarClock size={9} />
                {notif.meta}
              </p>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notif.actionLabel && notif.actionHref && (
                  <a
                    href={notif.actionHref}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                      notif.priority === "high" && !notif.isRead
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md shadow-teal-200/50 dark:shadow-teal-900/30"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {notif.actionLabel}
                    <ChevronRight size={11} />
                  </a>
                )}
                {!notif.isRead && (
                  <button
                    onClick={() => onRead(notif.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <CheckCheck size={12} />
                    Tandai Dibaca
                  </button>
                )}
              </div>
              <button
                onClick={() => onDelete(notif.id)}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CategoryBadge ────────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    ujian:       { label: "Ujian",       cls: "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"   },
    nilai:       { label: "Nilai",       cls: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
    pengumuman:  { label: "Pengumuman",  cls: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"       },
    sistem:      { label: "Sistem",      cls: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"     },
  }
  const cfg = map[category] ?? { label: category, cls: "bg-gray-100 text-gray-500" }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── MiniStat ─────────────────────────────────────────────────────────────────
function MiniStat({
  icon, label, value, colorClass, bgClass, ringClass,
}: {
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
  bgClass: string
  ringClass: string
}) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${bgClass} ${ringClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-black tabular-nums ${colorClass}`}>{value}</p>
    </div>
  )
}