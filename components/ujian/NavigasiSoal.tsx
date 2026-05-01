"use client"

import { useUjianStore } from "@/store/ujianStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, FlagIcon } from "lucide-react"

interface NavigasiSoalProps {
  onSoalChange?: (index: number) => void
}

export function NavigasiSoal({ onSoalChange }: NavigasiSoalProps) {
  const {
    soalList,
    currentSoalIndex,
    soalTerjawab,
    soalDitandai,
    goToSoal,
    goToSoalBerikutnya,
    goToSoalSebelumnya,
    getProgressUjian,
  } = useUjianStore()

  const progress = getProgressUjian()

  const handleSoalClick = (index: number) => {
    goToSoal(index)
    onSoalChange?.(index)
  }

  const handleNext = () => {
    goToSoalBerikutnya()
    onSoalChange?.(currentSoalIndex + 1)
  }

  const handlePrev = () => {
    goToSoalSebelumnya()
    onSoalChange?.(currentSoalIndex - 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Navigasi Soal</CardTitle>
        <div className="text-sm text-muted-foreground mt-2">
          Soal {currentSoalIndex + 1} dari {soalList.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {progress.terjawab}/{progress.totalSoal}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${progress.persentase}%`,
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(progress.persentase)}% selesai
          </div>
        </div>

        {/* Grid Soal */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Pilih Soal:</p>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {soalList.map((soal, idx) => {
              const isAnswered = soalTerjawab.includes(soal.id)
              const isFlagged = soalDitandai.includes(soal.id)
              const isCurrent = idx === currentSoalIndex

              return (
                <Button
                  key={soal.id}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className="relative"
                  onClick={() => handleSoalClick(idx)}
                >
                  <span>{idx + 1}</span>
                  {isAnswered && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  {isFlagged && (
                    <FlagIcon className="absolute -bottom-1 -right-1 size-3 text-yellow-500" />
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1 text-xs border-t pt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Soal Saat Ini</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Sudah Dijawab</span>
          </div>
          <div className="flex items-center gap-2">
            <FlagIcon className="size-3 text-yellow-500" />
            <span>Ditandai Review</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentSoalIndex === 0}
            className="flex-1"
          >
            <ChevronLeftIcon className="size-4 mr-1" />
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentSoalIndex === soalList.length - 1}
            className="flex-1"
          >
            Berikutnya
            <ChevronRightIcon className="size-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
