"use client"

interface JadwalMiniCardProps {
  jam: string
  mataPelajaran: string
  ruang: string
  type: "ujian" | "pelajaran" | "info"
}

export function JadwalMiniCard({ jam, mataPelajaran, ruang, type }: JadwalMiniCardProps) {
  const typeConfig = {
    ujian: {
      dot: "bg-red-500",
      iconBg: "bg-red-50 dark:bg-red-900/30",
      iconColor: "text-red-500",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    pelajaran: {
      dot: "bg-teal-500",
      iconBg: "bg-teal-50 dark:bg-teal-900/30",
      iconColor: "text-teal-500",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    info: {
      dot: "bg-gray-400",
      iconBg: "bg-gray-100 dark:bg-gray-700",
      iconColor: "text-gray-500",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }

  const cfg = typeConfig[type] || typeConfig.info

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Time column */}
      <div className="flex-shrink-0 text-center w-12">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{jam}</p>
        <div className={`mt-1 mx-auto h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      </div>

      {/* Divider line */}
      <div className="h-8 w-px bg-gray-100 dark:bg-gray-700 flex-shrink-0" />

      {/* Icon */}
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{mataPelajaran}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ruang}</p>
      </div>
    </div>
  )
}