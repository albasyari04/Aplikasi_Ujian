"use client"

import { useUjianStore } from "@/store/ujianStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FlagIcon } from "lucide-react"
import { useState } from "react"

interface SoalEssayProps {
  soalId: string
  nomor: number
  pertanyaan: string
  jawabanAwal?: string
  onJawabanChange?: (jawaban: string) => void
}

export function SoalEssay({
  soalId,
  nomor,
  pertanyaan,
  jawabanAwal,
  onJawabanChange,
}: SoalEssayProps) {
  const { setJawaban, isSoalTandai, tandaiSoal, hapusTandaiSoal, getJawaban } =
    useUjianStore()
  const [jawaban, setJawabanLocal] = useState(jawabanAwal || getJawaban(soalId) || "")
  const isTandai = isSoalTandai(soalId)

  const handleJawabanChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJawaban = e.target.value
    setJawabanLocal(newJawaban)
    setJawaban(soalId, newJawaban)
    onJawabanChange?.(newJawaban)
  }

  const handleTandai = () => {
    if (isTandai) {
      hapusTandaiSoal(soalId)
    } else {
      tandaiSoal(soalId)
    }
  }

  const wordCount = jawaban.trim().split(/\s+/).filter((w) => w.length > 0).length
  const charCount = jawaban.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">Soal No. {nomor}</CardTitle>
          </div>
          <Button
            variant={isTandai ? "default" : "outline"}
            size="icon-sm"
            onClick={handleTandai}
            title="Tandai untuk review"
          >
            <FlagIcon className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pertanyaan */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {pertanyaan}
          </p>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <textarea
            value={jawaban}
            onChange={handleJawabanChange}
            placeholder="Ketik jawaban Anda di sini..."
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none resize-none bg-background text-foreground"
            rows={8}
          />

          {/* Character Count */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{charCount} karakter</span>
            <span>{wordCount} kata</span>
          </div>
        </div>

        {/* Status Jawaban */}
        {jawaban.trim().length > 0 && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded text-sm">
            <p className="text-blue-700 dark:text-blue-300">
              <strong>Jawaban disimpan otomatis</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
