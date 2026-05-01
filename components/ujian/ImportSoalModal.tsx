"use client"

import { useState, useCallback, useRef } from "react"
import * as XLSX from "xlsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Table2,
  Eye,
  ChevronRight,
  Info,
  Sparkles,
  ClipboardCheck,
  ScrollText,
  ArrowRight,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────
interface SoalImportRow {
  nomor?: number
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  opsiA?: string | null
  opsiB?: string | null
  opsiC?: string | null
  opsiD?: string | null
  opsiE?: string | null
  kunciJawaban?: string | null
  bobot?: number
}

interface Ujian {
  id: string
  judul: string
  mapel: string
}

interface ImportResult {
  imported: number
  skipped: number
  errors?: string[]
}

interface Props {
  open: boolean
  onClose: () => void
  ujianList: Ujian[]
  onSuccess: () => void
}

// ── Helper: normalise header ───────────────────────────────────
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
}

// ── Helper: map raw row → SoalImportRow ───────────────────────
function mapRow(raw: Record<string, unknown>, index: number): SoalImportRow | null {
  // Normalize keys
  const normalized: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    normalized[normalizeHeader(k)] = String(v ?? "").trim()
  }

  const pertanyaan =
    normalized["pertanyaan"] ||
    normalized["soal"] ||
    normalized["question"] ||
    ""

  if (!pertanyaan) return null

  const rawTipe = (
    normalized["tipe"] ||
    normalized["type"] ||
    normalized["jenis"] ||
    "PILIHAN_GANDA"
  ).toUpperCase()

  const tipe: "PILIHAN_GANDA" | "ESSAY" =
    rawTipe.includes("ESSAY") || rawTipe === "E"
      ? "ESSAY"
      : "PILIHAN_GANDA"

  return {
    nomor: normalized["nomor"] ? parseInt(normalized["nomor"]) || undefined : undefined,
    pertanyaan,
    tipe,
    opsiA: normalized["opsia"] || normalized["a"] || null,
    opsiB: normalized["opsib"] || normalized["b"] || null,
    opsiC: normalized["opsic"] || normalized["c"] || null,
    opsiD: normalized["opsid"] || normalized["d"] || null,
    opsiE: normalized["opsie"] || normalized["e"] || null,
    kunciJawaban:
      normalized["kuncijawaban"] ||
      normalized["kunci"] ||
      normalized["jawaban"] ||
      normalized["answer"] ||
      null,
    bobot: normalized["bobot"] ? parseInt(normalized["bobot"]) || 1 : 1,
  }
}

// ── Helper: parse Excel/CSV ───────────────────────────────────
async function parseExcel(file: File): Promise<SoalImportRow[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })
  return raw
    .map((row, i) => mapRow(row, i))
    .filter((r): r is SoalImportRow => r !== null)
}

// ── Helper: parse Word (.docx) using mammoth ──────────────────
async function parseWord(file: File): Promise<SoalImportRow[]> {
  // Dynamic import — mammoth adalah library besar
  const mammoth = await import("mammoth")
  const buffer = await file.arrayBuffer()
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer })

  // Parse dari HTML ke soal list
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const paragraphs = Array.from(doc.querySelectorAll("p, li"))
    .map((el) => el.textContent?.trim() ?? "")
    .filter(Boolean)

  const soalList: SoalImportRow[] = []
  let current: Partial<SoalImportRow> | null = null

  for (const line of paragraphs) {
    // Deteksi nomor soal: "1." "1)" "Soal 1" "No. 1"
    const isNomorSoal = /^(soal\s*)?no\.?\s*\d+[\.\)]/i.test(line) ||
      /^\d+[\.\)]\s+[^ABCDE]/i.test(line)

    // Deteksi opsi: "A. ..." atau "A) ..."
    const opsiMatch = line.match(/^([A-E])[\.\)]\s+(.+)/i)

    // Deteksi kunci: "Kunci: A" atau "Jawaban: B"
    const kunciMatch = line.match(/^(kunci|jawaban|answer)[:\s]+([A-E])/i)

    // Deteksi ESSAY
    const isEssay = /^(essay|uraian|tipe[:\s]+essay)/i.test(line)

    if (isNomorSoal) {
      if (current?.pertanyaan) soalList.push(current as SoalImportRow)
      const nomorMatch = line.match(/\d+/)
      const nomorVal = nomorMatch ? parseInt(nomorMatch[0]) : undefined
      const pertanyaanText = line.replace(/^(soal\s*)?no\.?\s*\d+[\.\)]\s*/i, "").trim()
      current = {
        nomor: nomorVal,
        pertanyaan: pertanyaanText,
        tipe: "PILIHAN_GANDA",
        bobot: 1,
      }
    } else if (opsiMatch && current) {
      const key = opsiMatch[1].toUpperCase() as "A" | "B" | "C" | "D" | "E"
      ;(current as Record<string, unknown>)[`opsi${key}`] = opsiMatch[2].trim()
    } else if (kunciMatch && current) {
      current.kunciJawaban = kunciMatch[2].toUpperCase()
    } else if (isEssay && current) {
      current.tipe = "ESSAY"
    } else if (current && !current.pertanyaan && line.length > 5) {
      current.pertanyaan = line
    }
  }

  if (current?.pertanyaan) soalList.push(current as SoalImportRow)
  return soalList
}

// ── Preview row badge ─────────────────────────────────────────
function TipeBadge({ tipe }: { tipe: "PILIHAN_GANDA" | "ESSAY" }) {
  if (tipe === "PILIHAN_GANDA") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200/60">
        <ClipboardCheck className="size-2.5" /> PG
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200/60">
      <ScrollText className="size-2.5" /> Essay
    </span>
  )
}

// ── Download template Excel ───────────────────────────────────
function downloadTemplate() {
  const headers = [
    "nomor", "pertanyaan", "tipe", "opsiA", "opsiB", "opsiC", "opsiD", "opsiE",
    "kunciJawaban", "bobot",
  ]
  const contoh = [
    [1, "Ibukota Negara Indonesia adalah...", "PILIHAN_GANDA", "Jakarta", "Bandung", "Surabaya", "Medan", "", "A", 1],
    [2, "2 + 2 = ...", "PILIHAN_GANDA", "3", "4", "5", "6", "", "B", 1],
    [3, "Jelaskan apa yang dimaksud dengan fotosintesis!", "ESSAY", "", "", "", "", "", "", 5],
  ]

  const ws = XLSX.utils.aoa_to_sheet([headers, ...contoh])

  // Style lebar kolom
  ws["!cols"] = [
    { wch: 8 }, { wch: 50 }, { wch: 16 }, { wch: 25 }, { wch: 25 },
    { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 14 }, { wch: 8 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Template Soal")
  XLSX.writeFile(wb, "template_import_soal.xlsx")
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export function ImportSoalModal({ open, onClose, ujianList, onSuccess }: Props) {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<SoalImportRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [selectedUjian, setSelectedUjian] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep("upload")
    setFile(null)
    setParsed([])
    setParseError(null)
    setImportResult(null)
    setImportError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // ── File processing ──────────────────────────────────────────
  const processFile = useCallback(async (f: File) => {
    setFile(f)
    setParseError(null)
    setIsParsing(true)
    try {
      let rows: SoalImportRow[] = []
      const ext = f.name.split(".").pop()?.toLowerCase()

      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        rows = await parseExcel(f)
      } else if (ext === "docx") {
        rows = await parseWord(f)
      } else {
        setParseError("Format file tidak didukung. Gunakan .xlsx, .xls, .csv, atau .docx")
        return
      }

      if (rows.length === 0) {
        setParseError("Tidak ada data soal yang bisa dibaca dari file ini.")
        return
      }

      setParsed(rows)
      setStep("preview")
    } catch (err: unknown) {
      console.error(err)
      setParseError("Gagal membaca file. Pastikan format sesuai template.")
    } finally {
      setIsParsing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) processFile(f)
    },
    [processFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  // ── Submit import ────────────────────────────────────────────
  const handleImport = async () => {
    if (!selectedUjian) {
      setImportError("Pilih ujian tujuan terlebih dahulu")
      return
    }

    setIsImporting(true)
    setImportError(null)

    try {
      const res = await fetch("/api/soal/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ujianId: selectedUjian, soalList: parsed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setImportError(data.error || "Gagal mengimport soal")
        return
      }

      setImportResult(data)
      setStep("done")
    } catch {
      setImportError("Koneksi gagal. Coba lagi.")
    } finally {
      setIsImporting(false)
    }
  }

  const pgCount = parsed.filter((s) => s.tipe === "PILIHAN_GANDA").length
  const essayCount = parsed.filter((s) => s.tipe === "ESSAY").length

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl rounded-3xl border-0 p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="relative px-6 py-5 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-4 right-20 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 border border-white/20">
              <Upload className="size-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-bold text-base leading-tight">
                Import Soal
              </DialogTitle>
              <p className="text-white/60 text-xs mt-0.5">
                {step === "upload" && "Upload file Excel, CSV, atau Word"}
                {step === "preview" && `${parsed.length} soal siap diimport`}
                {step === "done" && "Import selesai"}
              </p>
            </div>
            {/* Step indicator */}
            <div className="ml-auto flex items-center gap-1.5">
              {(["upload", "preview", "done"] as const).map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step === s
                      ? "bg-white w-5"
                      : i < ["upload", "preview", "done"].indexOf(step)
                      ? "bg-white/60"
                      : "bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-background max-h-[75vh] overflow-y-auto">
          {/* ── STEP: UPLOAD ── */}
          {step === "upload" && (
            <div className="p-6 space-y-4">
              {/* Download template */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900">
                    <Download className="size-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
                      Download Template Excel
                    </p>
                    <p className="text-xs text-teal-600/70 dark:text-teal-400/70">
                      Gunakan template agar format sesuai
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-teal-900 border border-teal-200 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-800 transition-all"
                >
                  <FileSpreadsheet className="size-3.5" />
                  Download
                </button>
              </div>

              {/* Format info */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ext: ".xlsx / .xls", label: "Excel", icon: FileSpreadsheet, color: "emerald" },
                  { ext: ".csv", label: "CSV", icon: Table2, color: "blue" },
                  { ext: ".docx", label: "Word", icon: FileText, color: "violet" },
                ].map(({ ext, label, icon: Icon, color }) => (
                  <div
                    key={ext}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-${color}-50 dark:bg-${color}-950/20 border border-${color}-100 dark:border-${color}-900`}
                  >
                    <Icon className={`size-5 text-${color}-500`} />
                    <span className={`text-xs font-bold text-${color}-700 dark:text-${color}-300`}>
                      {label}
                    </span>
                    <span className={`text-[10px] text-${color}-500/70 font-mono`}>{ext}</span>
                  </div>
                ))}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-teal-400 bg-teal-50 dark:bg-teal-950/30 scale-[1.01]"
                    : "border-border hover:border-teal-300 hover:bg-muted/30"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv,.docx"
                  onChange={handleFileChange}
                />
                {isParsing ? (
                  <Loader2 className="size-10 text-teal-500 animate-spin" />
                ) : (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-teal-100 dark:bg-teal-900/40">
                      <Upload className="size-7 text-teal-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">
                        {isDragging ? "Lepaskan file di sini" : "Drag & drop atau klik untuk upload"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        .xlsx, .xls, .csv, .docx — maks. 200 soal
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Error parse */}
              {parseError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{parseError}</p>
                </div>
              )}

              {/* Word format hint */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
                <Info className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Untuk file <strong>Word (.docx)</strong>, format tiap soal: baris pertama nomor soal
                  (misal <code>1.</code>), lalu opsi <code>A.</code> <code>B.</code> dst., lalu{" "}
                  <code>Kunci: A</code>
                </p>
              </div>
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === "preview" && (
            <div className="p-6 space-y-4">
              {/* Pilih ujian */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Ujian Tujuan <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedUjian}
                  onChange={(e) => { setSelectedUjian(e.target.value); setImportError(null) }}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">-- Pilih ujian --</option>
                  {ujianList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.judul} ({u.mapel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Statistik */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Soal", value: parsed.length, color: "teal" },
                  { label: "Pilihan Ganda", value: pgCount, color: "blue" },
                  { label: "Essay", value: essayCount, color: "violet" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-950/20 border border-${color}-100 dark:border-${color}-900 text-center`}
                  >
                    <p className={`text-2xl font-extrabold text-${color}-600 dark:text-${color}-400`}>
                      {value}
                    </p>
                    <p className={`text-[10px] font-semibold text-${color}-500 mt-0.5`}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Preview tabel */}
              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/20 border-b border-border">
                  <Eye className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Preview (maks. 10 baris pertama)
                  </span>
                </div>
                <div className="divide-y divide-border/50 max-h-64 overflow-y-auto">
                  {parsed.slice(0, 10).map((soal, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-xl text-white text-xs font-extrabold shrink-0"
                        style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
                      >
                        {soal.nomor ?? i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TipeBadge tipe={soal.tipe} />
                          {soal.kunciJawaban && (
                            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200">
                              Kunci: {soal.kunciJawaban}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/60">
                            Bobot {soal.bobot ?? 1}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2 leading-snug">
                          {soal.pertanyaan}
                        </p>
                        {soal.tipe === "PILIHAN_GANDA" && (
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {["A", "B", "C", "D", "E"].map((k) => {
                              const val = (soal as unknown as Record<string, string | null>)[`opsi${k}`]
                              if (!val) return null
                              return (
                                <span key={k} className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                                  {k}. {val.slice(0, 20)}{val.length > 20 ? "…" : ""}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {parsed.length > 10 && (
                    <div className="px-4 py-3 text-center text-xs text-muted-foreground bg-muted/10">
                      +{parsed.length - 10} soal lainnya tidak ditampilkan
                    </div>
                  )}
                </div>
              </div>

              {/* Error import */}
              {importError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200">
                  <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{importError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <X className="size-3.5" />
                  Ganti File
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting || !selectedUjian}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                    boxShadow: "0 4px 16px rgba(13,148,136,0.3)",
                  }}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Mengimport...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Import {parsed.length} Soal
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === "done" && importResult && (
            <div className="p-8 flex flex-col items-center text-center gap-6">
              <div
                className="flex items-center justify-center w-20 h-20 rounded-3xl"
                style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}
              >
                <CheckCircle2 className="size-10 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-foreground">Import Berhasil!</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Soal sudah ditambahkan ke ujian
                </p>
              </div>

              {/* Stat result */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200">
                  <p className="text-3xl font-extrabold text-teal-600">{importResult.imported}</p>
                  <p className="text-xs font-semibold text-teal-500 mt-0.5">Soal berhasil diimport</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                  <p className="text-3xl font-extrabold text-amber-600">{importResult.skipped}</p>
                  <p className="text-xs font-semibold text-amber-500 mt-0.5">Soal dilewati / error</p>
                </div>
              </div>

              {/* Errors detail */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-left max-h-32 overflow-y-auto">
                  <p className="text-xs font-bold text-red-700 mb-1.5">Detail error:</p>
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 leading-relaxed">• {e}</p>
                  ))}
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { reset(); onSuccess() }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" }}
                >
                  <CheckCircle2 className="size-4" />
                  Selesai & Refresh
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground border border-border hover:bg-muted/50 transition-all"
                >
                  Import Lagi
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}