"use client"

interface StatsCardProps {
  label: string
  value: string
  icon: string
  trend: string
  color: "teal" | "amber" | "green" | "purple"
}

export function StatsCard({ label, value, icon, trend, color }: StatsCardProps) {
  const colorConfig = {
    teal: {
      bg: "bg-teal-50 dark:bg-teal-900/30",
      text: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100 dark:bg-teal-800",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-800",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-800",
    },
    purple: {
      bg: "bg-violet-50 dark:bg-violet-900/30",
      text: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-100 dark:bg-violet-800",
    },
  }

  const cfg = colorConfig[color]

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
          <p className={`mt-1.5 text-2xl font-bold ${cfg.text}`}>{value}</p>
        </div>
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
          <span className="text-base">{icon}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 truncate">{trend}</p>
    </div>
  )
}