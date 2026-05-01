"use client"

import { useEffect } from "react"
import { useUjianStore } from "@/store/ujianStore"
import { Card } from "@/components/ui/card"
import { formatDurasi } from "@/lib/utils"
import { AlertTriangleIcon } from "lucide-react"

interface TimerCountdownProps {
  onTimeUp?: () => void
}

export function TimerCountdown({ onTimeUp }: TimerCountdownProps) {
  const { waktuTersisa, setWaktuTersisa, isUjianSelesai } = useUjianStore()

  // Timer countdown effect
  useEffect(() => {
    if (isUjianSelesai) return

    const interval = setInterval(() => {
      setWaktuTersisa(Math.max(0, waktuTersisa - 1))

      if (waktuTersisa <= 1) {
        clearInterval(interval)
        onTimeUp?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [waktuTersisa, isUjianSelesai, setWaktuTersisa, onTimeUp])

  // Calculate warning state directly from waktuTersisa (no setState needed)
  const isWarning = waktuTersisa <= 300

  const jam = Math.floor(waktuTersisa / 3600)
  const menit = Math.floor((waktuTersisa % 3600) / 60)
  const detik = waktuTersisa % 60

  return (
    <Card className={`p-4 ${isWarning ? "border-destructive bg-destructive/5" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Waktu Tersisa</p>
          <div className="flex items-center gap-2 mt-2">
            {isWarning && <AlertTriangleIcon className="size-5 text-destructive animate-pulse" />}
            <div className="text-3xl font-bold font-mono">
              {String(jam).padStart(2, "0")}:{String(menit).padStart(2, "0")}:
              {String(detik).padStart(2, "0")}
            </div>
          </div>
        </div>
        {isWarning && (
          <div className="text-right">
            <p className="text-sm text-destructive font-semibold">Segera selesaikan!</p>
            <p className="text-xs text-muted-foreground">{formatDurasi(waktuTersisa)}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isWarning ? "bg-destructive" : "bg-primary"
          }`}
          style={{
            width: `${(waktuTersisa / (useUjianStore.getState().ujianAktif?.durasi || 1) / 60) * 100}%`,
          }}
        />
      </div>
    </Card>
  )
}
