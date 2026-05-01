"use client"

import Link from "next/link"

interface InfoUjianCardProps {
  id: string
  mataPelajaran: string
  kelas: string
  guru: string
  waktu: string
  jumlahSoal: number
  deadline: string
  status: "aktif" | "akan_datang" | "selesai"
}

export function InfoUjianCard({
  id,
  mataPelajaran,
  kelas,
  guru,
  waktu,
  jumlahSoal,
  deadline,
  status,
}: InfoUjianCardProps) {
  const statusConfig = {
    aktif: {
      label: "Berlangsung",
      dot: "bg-green-500",
      badge: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",
      border: "border-l-green-500",
      btnLabel: "Mulai Ujian",
      btnClass:
        "bg-teal-600 hover:bg-teal-700 text-white",
    },
    akan_datang: {
      label: "Akan Datang",
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
      border: "border-l-amber-400",
      btnLabel: "Lihat Detail",
      btnClass:
        "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
    },
    selesai: {
      label: "Selesai",
      dot: "bg-gray-400",
      badge: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400",
      border: "border-l-gray-300",
      btnLabel: "Lihat Hasil",
      btnClass:
        "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
    },
  }

  const cfg = statusConfig[status]

  return (
    <div
      className={`group relative rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 border-l-4 ${cfg.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
    >
      {/* Subtle gradient top strip for aktif */}
      {status === "aktif" && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-400" />
      )}

      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${status === "aktif" ? "animate-pulse" : ""}`} />
                {cfg.label}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-base leading-snug truncate">
              {mataPelajaran}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{guru}</p>
          </div>

          {/* Deadline */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400 dark:text-gray-500">Deadline</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{deadline}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-gray-100 dark:border-gray-700" />

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
            {waktu}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {jumlahSoal} soal
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {kelas}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-3 flex justify-end">
          <Link
            href={status === "selesai" ? `/ujian/${id}/hasil` : `/ujian/${id}`}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${cfg.btnClass}`}
          >
            {cfg.btnLabel}
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}