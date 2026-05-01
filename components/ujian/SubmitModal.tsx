"use client"

import { useUjianStore } from "@/store/ujianStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon } from "lucide-react"

interface SubmitModalProps {
  isOpen: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function SubmitModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: SubmitModalProps) {
  const { getProgressUjian } = useUjianStore()
  const progress = getProgressUjian()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Submit Ujian</DialogTitle>
          <DialogDescription>
            Pastikan semua jawaban sudah benar sebelum mengirim
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="space-y-3 border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <div className="flex gap-3">
            <AlertTriangleIcon className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                Perhatian!
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Setelah Anda submit ujian, Anda tidak dapat mengubah jawaban lagi.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="space-y-3 border-y py-4">
          <p className="font-medium text-sm">Ringkasan Jawaban:</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Soal</p>
              <p className="text-2xl font-bold">{progress.totalSoal}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Sudah Dijawab</p>
              <div className="text-2xl font-bold text-green-600">
                {progress.terjawab}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Ditandai Review</p>
              <p className="text-2xl font-bold text-yellow-600">{progress.tandai}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Belum Dijawab</p>
              <p className="text-2xl font-bold text-red-600">{progress.kosong}</p>
            </div>
          </div>

          {/* Warning jika ada soal kosong */}
          {progress.kosong > 0 && (
            <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded text-sm">
              <p className="text-red-700 dark:text-red-300">
                <strong>{progress.kosong} soal</strong> masih kosong dan akan dinilai 0.
              </p>
            </div>
          )}
        </div>

        {/* Confirmation */}
        <div className="text-sm">
          <p className="font-medium mb-2">Apakah Anda yakin ingin mengirim ujian ini?</p>
          <p className="text-muted-foreground text-xs">
            Proses tidak dapat dibatalkan setelah dikonfirmasi.
          </p>
        </div>

        <DialogFooter className="gap-2 flex-row justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Mengirim..." : "Ya, Kirim Ujian"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
