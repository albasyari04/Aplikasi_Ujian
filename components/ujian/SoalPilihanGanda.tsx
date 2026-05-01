"use client"

import { useUjianStore } from "@/store/ujianStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FlagIcon } from "lucide-react"

interface SoalPilihanGandaProps {
  soalId: string
  nomor: number
  pertanyaan: string
  opsiA?: string | null
  opsiB?: string | null
  opsiC?: string | null
  opsiD?: string | null
  opsiE?: string | null
  jawabTerpilih?: string
  onJawabanChange?: (jawaban: string) => void
}

const OPSI = [
  { key: "A", label: "A" },
  { key: "B", label: "B" },
  { key: "C", label: "C" },
  { key: "D", label: "D" },
  { key: "E", label: "E" },
]

export function SoalPilihanGanda({
  soalId,
  nomor,
  pertanyaan,
  opsiA,
  opsiB,
  opsiC,
  opsiD,
  opsiE,
  jawabTerpilih,
  onJawabanChange,
}: SoalPilihanGandaProps) {
  const { setJawaban, isSoalTandai, tandaiSoal, hapusTandaiSoal } = useUjianStore()

  const opsi = [opsiA, opsiB, opsiC, opsiD, opsiE].filter((o) => o !== null && o !== undefined)
  const selectedJawaban = jawabTerpilih || getJawaban(soalId)
  const isTandai = isSoalTandai(soalId)

  function getJawaban(soalId: string) {
    return useUjianStore.getState().getJawaban(soalId)
  }

  const handleJawaban = (key: string) => {
    setJawaban(soalId, key)
    onJawabanChange?.(key)
  }

  const handleTandai = () => {
    if (isTandai) {
      hapusTandaiSoal(soalId)
    } else {
      tandaiSoal(soalId)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">
              Soal No. {nomor}
            </CardTitle>
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

        {/* Opsi Jawaban */}
        <div className="space-y-2">
          {opsi.map((teks, idx) => {
            const key = OPSI[idx]?.label
            const isSelected = selectedJawaban === key

            return (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name={`soal-${soalId}`}
                  value={key}
                  checked={isSelected}
                  onChange={() => handleJawaban(key!)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{key}.</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap text-wrap">
                    {teks}
                  </p>
                </div>
              </label>
            )
          })}
        </div>

        {/* Jawaban terpilih */}
        {selectedJawaban && (
          <div className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded text-sm">
            <p className="text-green-700 dark:text-green-300">
              <strong>Jawaban Anda:</strong> {selectedJawaban}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
