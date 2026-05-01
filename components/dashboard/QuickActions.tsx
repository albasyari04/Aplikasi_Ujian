"use client"

import Link from "next/link"

const actions = [
  {
    label: "Kerjakan Ujian",
    desc: "Ujian aktif tersedia",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    href: "/ujian",
    bg: "bg-teal-500",
    hoverBg: "hover:bg-teal-600",
  },
  {
    label: "Lihat Jadwal",
    desc: "Jadwal minggu ini",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    href: "/jadwal",
    bg: "bg-indigo-500",
    hoverBg: "hover:bg-indigo-600",
  },
  {
    label: "Nilai Saya",
    desc: "Rekap semester ini",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    href: "/nilai",
    bg: "bg-amber-500",
    hoverBg: "hover:bg-amber-600",
  },
  {
    label: "Riwayat Ujian",
    desc: "Semua ujian lalu",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: "/riwayat",
    bg: "bg-rose-500",
    hoverBg: "hover:bg-rose-600",
  },
]

export function QuickActions() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
        Akses Cepat
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex items-center gap-3 rounded-2xl ${action.bg} ${action.hoverBg} p-4 text-white shadow-sm hover:shadow-md transition-all duration-200 active:scale-95`}
          >
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
              {action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">{action.label}</p>
              <p className="text-xs text-white/80 truncate">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}