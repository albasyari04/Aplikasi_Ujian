"use client"

interface NilaiItem {
  mapel: string
  nilai: number
  grade: string
}

interface NilaiRingkasanProps {
  data: NilaiItem[]
}

export function NilaiRingkasan({ data }: NilaiRingkasanProps) {
  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-600 dark:text-emerald-400"
    if (grade.startsWith("B")) return "text-teal-600 dark:text-teal-400"
    if (grade.startsWith("C")) return "text-amber-600 dark:text-amber-400"
    return "text-red-500"
  }

  const getBarWidth = (nilai: number) => `${nilai}%`

  const getBarColor = (nilai: number) => {
    if (nilai >= 90) return "bg-emerald-500"
    if (nilai >= 80) return "bg-teal-500"
    if (nilai >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="p-4 space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">{item.mapel}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.nilai}</span>
                <span className={`text-xs font-bold w-7 text-right ${getGradeColor(item.grade)}`}>{item.grade}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.nilai)}`}
                style={{ width: getBarWidth(item.nilai) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Average footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Rata-rata Keseluruhan</span>
          <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
            {Math.round(data.reduce((a, b) => a + b.nilai, 0) / data.length)}
          </span>
        </div>
      </div>
    </div>
  )
}