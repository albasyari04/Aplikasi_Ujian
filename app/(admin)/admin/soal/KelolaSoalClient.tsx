"use client"

// app/(admin)/admin/soal/KelolaSoalClient.tsx

import { useState, useTransition, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  Award,
  SlidersHorizontal,
  ChevronDown,
  LibraryBig,
  ClipboardCheck,
  ScrollText,
  GraduationCap,
  Layers,
  Pencil,
  CheckCircle2,
  BookMarked,
  FileUp,
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  Info,
  Sparkles,
  ArrowRight,
  Loader2,
  ChevronRight,
  Hash,
  Target,
  BookCheck,
  BarChart3,
} from "lucide-react"
import * as XLSX from "xlsx"

// ── Types ────────────────────────────────────────────────────
interface Ujian {
  id: string
  judul: string
  mapel: string
  guru?: string
}

interface Soal {
  id: string
  ujianId: string
  nomor: number
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  opsiA: string | null
  opsiB: string | null
  opsiC: string | null
  opsiD: string | null
  opsiE: string | null
  kunciJawaban: string | null
  bobot: number
  ujian: Ujian
}

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

interface ImportResult {
  imported: number
  skipped: number
  errors?: string[]
}

interface Props {
  data: {
    soalList: Soal[]
    ujianList: Ujian[]
  }
}

// ════════════════════════════════════════════════════════════
// HELPERS: Import Parser (unchanged logic)
// ════════════════════════════════════════════════════════════
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")
}

function pick(normalized: Record<string, string>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = normalized[k]
    if (v !== undefined && v !== null && v.trim() !== "" && v.trim().toLowerCase() !== "undefined") {
      return v.trim()
    }
  }
  return null
}

function mapRow(raw: Record<string, unknown>): SoalImportRow | null {
  const normalized: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    const nk = normalizeHeader(k)
    if (nk) normalized[nk] = String(v ?? "").trim()
  }
  const pertanyaan = pick(normalized, "pertanyaan", "soal", "question", "pertanyaansoal", "tekssoal", "teksteks", "isisoal", "deskripsi")
  if (!pertanyaan) return null
  const rawTipe = (pick(normalized, "tipe", "type", "jenis", "jenissoal", "tipsoal") ?? "PILIHAN_GANDA").toUpperCase().replace(/[\s_-]/g, "")
  const tipe: "PILIHAN_GANDA" | "ESSAY" = rawTipe.includes("ESSAY") || rawTipe.includes("ESAI") || rawTipe.includes("URAIAN") || rawTipe === "E" ? "ESSAY" : "PILIHAN_GANDA"
  const opsiA = pick(normalized, "a", "opsia", "opsi_a", "piliha", "pilihana", "jawabana", "optiona", "ansera", "pilihan1", "opsia1")
  const opsiB = pick(normalized, "b", "opsib", "opsi_b", "pilihb", "pilihanb", "jawabanb", "optionb", "anserb", "pilihan2", "opsib2")
  const opsiC = pick(normalized, "c", "opsic", "opsi_c", "pilihc", "pilihanc", "jawabanc", "optionc", "anserc", "pilihan3", "opsic3")
  const opsiD = pick(normalized, "d", "opsid", "opsi_d", "pilihd", "pilihnd", "jawabnd", "optiond", "anserd", "pilihan4", "opsid4")
  const opsiE = pick(normalized, "e", "opsie", "opsi_e", "pilihe", "pilihne", "jawabne", "optione", "ansere", "pilihan5", "opsie5")
  const rawKunci = pick(normalized, "kuncijawaban", "kunci", "jawaban", "answer", "kunci_jawaban", "kuncibenar", "jawabanbenar", "correctanswer", "jawabanku", "kuncisoal", "jawabankunci")
  let kunciJawaban: string | null = null
  if (rawKunci) {
    const match = rawKunci.toUpperCase().match(/[A-E]/)
    kunciJawaban = match ? match[0] : null
  }
  const rawNomor = pick(normalized, "nomor", "no", "nomer", "number", "soalke", "urutan")
  const nomorVal = rawNomor ? parseInt(rawNomor) || undefined : undefined
  const rawBobot = pick(normalized, "bobot", "weight", "nilai", "skor", "score", "poin", "point")
  const bobotVal = rawBobot ? parseInt(rawBobot) || 1 : 1
  return { nomor: nomorVal, pertanyaan, tipe, opsiA, opsiB, opsiC, opsiD, opsiE, kunciJawaban, bobot: bobotVal }
}

async function parseExcel(file: File): Promise<{ rows: SoalImportRow[]; headers: string[] }> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })
  const headers = raw.length > 0 ? Object.keys(raw[0]) : []
  const rows = raw.map((row) => mapRow(row)).filter((r): r is SoalImportRow => r !== null)
  return { rows, headers }
}

async function parseWord(file: File): Promise<SoalImportRow[]> {
  const mammoth = await import("mammoth")
  const buffer = await file.arrayBuffer()
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer })
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const paragraphs = Array.from(doc.querySelectorAll("p, li")).map((el) => el.textContent?.trim() ?? "").filter(Boolean)
  const soalList: SoalImportRow[] = []
  let current: Partial<SoalImportRow> | null = null
  for (const line of paragraphs) {
    const isNomorSoal = /^(soal\s*)?no\.?\s*\d+[\.\)]/i.test(line) || /^\d+[\.\)]\s+[^ABCDE]/i.test(line)
    const opsiMatch = line.match(/^([A-E])[\.\)]\s+(.+)/i)
    const kunciMatch = line.match(/^(kunci|jawaban|answer)[:\s]+([A-E])/i)
    const isEssay = /^(essay|uraian|tipe[:\s]+essay)/i.test(line)
    if (isNomorSoal) {
      if (current?.pertanyaan) soalList.push(current as SoalImportRow)
      const nomorMatch = line.match(/\d+/)
      const nomorVal = nomorMatch ? parseInt(nomorMatch[0]) : undefined
      const pertanyaanText = line.replace(/^(soal\s*)?no\.?\s*\d+[\.\)]\s*/i, "").trim()
      current = { nomor: nomorVal, pertanyaan: pertanyaanText, tipe: "PILIHAN_GANDA", bobot: 1 }
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

function downloadTemplate() {
  const headers = ["nomor", "pertanyaan", "tipe", "opsiA", "opsiB", "opsiC", "opsiD", "opsiE", "kunciJawaban", "bobot"]
  const contoh = [
    [1, "Ibukota Negara Indonesia adalah...", "PILIHAN_GANDA", "Jakarta", "Bandung", "Surabaya", "Medan", "", "A", 1],
    [2, "2 + 2 = ...", "PILIHAN_GANDA", "3", "4", "5", "6", "", "B", 1],
    [3, "Jelaskan apa yang dimaksud dengan fotosintesis!", "ESSAY", "", "", "", "", "", "", 5],
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...contoh])
  ws["!cols"] = [{ wch: 8 }, { wch: 50 }, { wch: 16 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 14 }, { wch: 8 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Template Soal")
  XLSX.writeFile(wb, "template_import_soal.xlsx")
}

// ════════════════════════════════════════════════════════════
// BADGE TIPE
// ════════════════════════════════════════════════════════════
function TipeBadge({ tipe, small = false }: { tipe: "PILIHAN_GANDA" | "ESSAY"; small?: boolean }) {
  const base = small ? "text-[9px] px-1.5 py-[2px] gap-0.5" : "text-[10px] px-2 py-0.5 gap-1"
  if (tipe === "PILIHAN_GANDA") {
    return (
      <span className={`inline-flex items-center rounded-full font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 ${base}`}>
        <ClipboardCheck className={small ? "size-2" : "size-2.5"} />
        PG
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center rounded-full font-bold bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/40 ${base}`}>
      <ScrollText className={small ? "size-2" : "size-2.5"} />
      Essay
    </span>
  )
}

// ════════════════════════════════════════════════════════════
// NATIVE SELECT
// ════════════════════════════════════════════════════════════
function NativeSelect({ value, onChange, children, className = "" }: { value: string; onChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-8 text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 transition-all h-10 font-medium cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DETAIL MODAL
// ════════════════════════════════════════════════════════════
function DetailSoalModal({ soal, onClose }: { soal: Soal | null; onClose: () => void }) {
  if (!soal) return null
  const opsi = [
    { key: "A", val: soal.opsiA },
    { key: "B", val: soal.opsiB },
    { key: "C", val: soal.opsiC },
    { key: "D", val: soal.opsiD },
    { key: "E", val: soal.opsiE },
  ].filter((o) => o.val)

  return (
    <Dialog open={!!soal} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-[28px] border-0 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="relative px-6 py-5 overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-6 right-16 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />
          <DialogTitle className="relative flex items-center gap-3.5 text-white">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm">
              <BookMarked className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em] mb-0.5">Detail Soal</p>
              <p className="text-base font-black leading-tight">Soal No. {soal.nomor}</p>
              <p className="text-white/50 text-[11px] mt-0.5">{soal.ujian.mapel} · {soal.ujian.judul}</p>
            </div>
          </DialogTitle>
        </div>

        <div className="p-5 space-y-3 bg-slate-50 dark:bg-zinc-950 max-h-[65vh] overflow-y-auto">
          {/* Meta */}
          <div className="flex flex-wrap gap-1.5">
            <TipeBadge tipe={soal.tipe} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/60">
              <Award className="size-2.5" />
              Bobot {soal.bobot}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200/60">
              {soal.ujian.mapel}
            </span>
          </div>

          {/* Pertanyaan */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.12em] mb-2">Pertanyaan</p>
            <p className="text-sm text-slate-800 dark:text-white leading-relaxed font-medium">{soal.pertanyaan}</p>
          </div>

          {/* Opsi PG */}
          {soal.tipe === "PILIHAN_GANDA" && opsi.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.12em]">Pilihan Jawaban</p>
              {opsi.map((o) => {
                const isCorrect = soal.kunciJawaban === o.key
                return (
                  <div
                    key={o.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all ${
                      isCorrect
                        ? "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800"
                        : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isCorrect ? "bg-teal-500 text-white shadow-sm shadow-teal-300/50" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"}`}>
                      {o.key}
                    </span>
                    <span className={`flex-1 pt-0.5 leading-snug ${isCorrect ? "text-teal-700 dark:text-teal-300 font-semibold" : "text-slate-700 dark:text-zinc-300"}`}>{o.val}</span>
                    {isCorrect && <CheckCircle2 className="size-4 text-teal-500 shrink-0 mt-0.5" />}
                  </div>
                )
              })}
            </div>
          )}

          {/* Kunci Essay */}
          {soal.tipe === "ESSAY" && soal.kunciJawaban && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
              <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.12em] mb-2">Kunci Jawaban</p>
              <p className="text-sm text-teal-800 dark:text-teal-300 leading-relaxed">{soal.kunciJawaban}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 px-5 py-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
          <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
            Tutup
          </button>
          <Link href={`/admin/soal/${soal.id}/edit`}>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]">
              <Pencil className="size-3.5" />
              Edit Soal
            </button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ════════════════════════════════════════════════════════════
// DELETE MODAL
// ════════════════════════════════════════════════════════════
function DeleteConfirmModal({ soal, onClose, onConfirm, isPending }: { soal: Soal | null; onClose: () => void; onConfirm: () => void; isPending: boolean }) {
  if (!soal) return null
  return (
    <Dialog open={!!soal} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-[28px] border-0 shadow-2xl shadow-black/20">
        <div className="bg-gradient-to-br from-red-500 to-rose-700 px-5 py-5">
          <DialogTitle className="flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
              <Trash2 className="size-4.5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Konfirmasi</p>
              <span className="text-base font-black">Hapus Soal</span>
            </div>
          </DialogTitle>
        </div>
        <div className="p-5 space-y-3 bg-slate-50 dark:bg-zinc-950">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Hapus soal No. <strong className="text-slate-900 dark:text-white font-black">#{soal.nomor}</strong> dari{" "}
            <strong className="text-slate-900 dark:text-white font-black">{soal.ujian.judul}</strong>?
          </p>
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-3.5 text-red-500" />
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed pt-0.5">
              Semua jawaban siswa terkait soal ini juga akan dihapus secara permanen.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 px-5 py-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
          <button onClick={onClose} disabled={isPending} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] disabled:opacity-60">
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            {isPending ? "Menghapus..." : "Hapus"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ════════════════════════════════════════════════════════════
// IMPORT MODAL
// ════════════════════════════════════════════════════════════
function ImportSoalModal({ open, onClose, ujianList, onSuccess }: { open: boolean; onClose: () => void; ujianList: Ujian[]; onSuccess: () => void }) {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsed, setParsed] = useState<SoalImportRow[]>([])
  const [selectedUjian, setSelectedUjian] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([])

  const reset = () => {
    setStep("upload"); setParsed([]); setParseError(null); setImportResult(null); setImportError(null); setSelectedUjian(""); setDetectedHeaders([])
  }
  const handleClose = () => { reset(); onClose() }

  const processFile = async (f: File) => {
    setParseError(null); setIsParsing(true)
    try {
      const ext = f.name.split(".").pop()?.toLowerCase()
      let rows: SoalImportRow[] = []
      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        const result = await parseExcel(f)
        rows = result.rows; setDetectedHeaders(result.headers)
        if (result.rows.length === 0 && result.headers.length > 0) {
          setParseError(`Tidak ada soal valid. Kolom: ${result.headers.join(", ")}. Pastikan ada kolom 'pertanyaan', 'opsiA', 'kunciJawaban'.`); return
        }
      } else if (ext === "docx") {
        rows = await parseWord(f)
      } else {
        setParseError("Format tidak didukung. Gunakan .xlsx, .xls, .csv, atau .docx"); return
      }
      if (rows.length === 0) { setParseError("Tidak ada data soal yang dapat dibaca dari file ini."); return }
      setParsed(rows); setStep("preview")
    } catch { setParseError("Gagal membaca file. Pastikan format sesuai template.") }
    finally { setIsParsing(false) }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files[0]; if (f) processFile(f)
  }

  const handleImport = async () => {
    if (!selectedUjian) { setImportError("Pilih ujian tujuan terlebih dahulu"); return }
    setIsImporting(true); setImportError(null)
    try {
      const res = await fetch("/api/soal/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ujianId: selectedUjian, soalList: parsed }) })
      const data = await res.json()
      if (!res.ok) {
        let errMsg = data.error || "Gagal mengimport soal"
        if (data.details?.length > 0) { errMsg += "\n\nDetail:\n" + data.details.slice(0, 5).join("\n"); if (data.details.length > 5) errMsg += `\n... dan ${data.details.length - 5} lainnya` }
        if (data.hint) errMsg += "\n\n" + data.hint
        setImportError(errMsg); return
      }
      setImportResult(data); setStep("done")
    } catch { setImportError("Koneksi gagal. Coba lagi.") }
    finally { setIsImporting(false) }
  }

  const pgCount = parsed.filter((s) => s.tipe === "PILIHAN_GANDA").length
  const essayCount = parsed.filter((s) => s.tipe === "ESSAY").length

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[28px] border-0 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="relative px-6 py-5 overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15 border border-white/25">
              <FileUp className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em] mb-0.5">Import Soal</DialogTitle>
              <p className="text-base font-black text-white leading-tight">
                {step === "upload" && "Upload File Soal"}
                {step === "preview" && `${parsed.length} soal siap diimport`}
                {step === "done" && "Import Selesai!"}
              </p>
            </div>
            {/* Step indicator */}
            <div className="flex items-center gap-1.5">
              {(["upload", "preview", "done"] as const).map((s) => (
                <div key={s} className={`h-2 rounded-full transition-all duration-300 ${step === s ? "bg-white w-5" : "bg-white/30 w-2"}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-950 max-h-[75vh] overflow-y-auto">
          {/* STEP: UPLOAD */}
          {step === "upload" && (
            <div className="p-5 space-y-3.5">
              {/* Download template */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Download className="size-3.5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-teal-800 dark:text-teal-200">Download Template Excel</p>
                    <p className="text-[11px] text-teal-600/70 dark:text-teal-400/70">Gunakan template agar format sesuai</p>
                  </div>
                </div>
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-white dark:bg-teal-900 border border-teal-200 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-800 transition-all">
                  <FileSpreadsheet className="size-3.5" /> Download
                </button>
              </div>

              {/* Format badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ext: ".xlsx / .xls", label: "Excel", Icon: FileSpreadsheet, bg: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-100 dark:border-emerald-900", text: "text-emerald-700 dark:text-emerald-300", icon: "text-emerald-500" },
                  { ext: ".csv", label: "CSV", Icon: Table2, bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-100 dark:border-blue-900", text: "text-blue-700 dark:text-blue-300", icon: "text-blue-500" },
                  { ext: ".docx", label: "Word", Icon: FileText, bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-100 dark:border-violet-900", text: "text-violet-700 dark:text-violet-300", icon: "text-violet-500" },
                ].map(({ ext, label, Icon, bg, border, text, icon }) => (
                  <div key={ext} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${bg} border ${border}`}>
                    <Icon className={`size-5 ${icon}`} />
                    <span className={`text-xs font-bold ${text}`}>{label}</span>
                    <span className={`text-[9px] font-mono ${icon} opacity-70`}>{ext}</span>
                  </div>
                ))}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("import-file-input")?.click()}
                className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${isDragging ? "border-teal-400 bg-teal-50 dark:bg-teal-950/30 scale-[1.01]" : "border-slate-200 dark:border-zinc-700 hover:border-teal-300 hover:bg-white dark:hover:bg-zinc-900"}`}
              >
                <input id="import-file-input" type="file" className="hidden" accept=".xlsx,.xls,.csv,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = "" }} />
                {isParsing ? (
                  <Loader2 className="size-10 text-teal-500 animate-spin" />
                ) : (
                  <>
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/40">
                      <FileUp className="size-6 text-teal-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">{isDragging ? "Lepaskan file di sini" : "Drag & drop atau klik untuk upload"}</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">.xlsx, .xls, .csv, .docx — maks. 200 soal</p>
                    </div>
                  </>
                )}
              </div>

              {parseError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{parseError}</p>
                </div>
              )}

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900">
                <Info className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Untuk <strong>Word (.docx)</strong>, format tiap soal: nomor (misal <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">1.</code>), opsi <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">A.</code> dst., lalu <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">Kunci: A</code>
                </p>
              </div>
            </div>
          )}

          {/* STEP: PREVIEW */}
          {step === "preview" && (
            <div className="p-5 space-y-3.5">
              {/* Pilih ujian */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.12em]">
                  Ujian Tujuan <span className="text-red-400">*</span>
                </label>
                <NativeSelect value={selectedUjian} onChange={(v) => { setSelectedUjian(v); setImportError(null) }}>
                  <option value="">-- Pilih ujian tujuan --</option>
                  {ujianList.map((u) => (
                    <option key={u.id} value={u.id}>{u.judul} ({u.mapel})</option>
                  ))}
                </NativeSelect>
              </div>

              {/* Column warning */}
              {detectedHeaders.length > 0 && (() => {
                const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")
                const normHeaders = detectedHeaders.map(norm)
                const hasOpsiA = normHeaders.some(h => ["a","opsia","opsi_a","piliha","pilihana","jawabana","optiona","pilihan1"].includes(h))
                const hasKunci = normHeaders.some(h => ["kuncijawaban","kunci","jawaban","answer","kuncibenar","jawabanbenar","correctanswer"].includes(h))
                const missingCols: string[] = []
                if (!hasOpsiA) missingCols.push("Opsi A (rename ke 'opsiA')")
                if (!hasKunci) missingCols.push("Kunci Jawaban (rename ke 'kunciJawaban')")
                if (missingCols.length === 0) return null
                return (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">⚠️ Kolom tidak dikenali:</p>
                    {missingCols.map(col => <p key={col} className="text-xs text-amber-600 dark:text-amber-400">• {col}</p>)}
                    <p className="text-[10px] text-amber-500 mt-1.5 font-mono">{detectedHeaders.join(", ")}</p>
                  </div>
                )
              })()}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Total", value: parsed.length, bg: "bg-teal-50 dark:bg-teal-950/20", border: "border-teal-100 dark:border-teal-900", val: "text-teal-700 dark:text-teal-300", lbl: "text-teal-500" },
                  { label: "Pilihan Ganda", value: pgCount, bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-100 dark:border-blue-900", val: "text-blue-700 dark:text-blue-300", lbl: "text-blue-500" },
                  { label: "Essay", value: essayCount, bg: "bg-violet-50 dark:bg-violet-950/20", border: "border-violet-100 dark:border-violet-900", val: "text-violet-700 dark:text-violet-300", lbl: "text-violet-500" },
                ].map(({ label, value, bg, border, val, lbl }) => (
                  <div key={label} className={`p-3 rounded-xl ${bg} border ${border} text-center`}>
                    <p className={`text-2xl font-black ${val}`}>{value}</p>
                    <p className={`text-[10px] font-bold ${lbl} mt-0.5`}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Preview list */}
              <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                  <Eye className="size-3.5 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.12em]">Preview (10 pertama)</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-52 overflow-y-auto">
                  {parsed.slice(0, 10).map((soal, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg text-white text-[10px] font-black shrink-0 bg-gradient-to-br from-teal-500 to-emerald-700 mt-0.5">
                        {soal.nomor ?? i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <TipeBadge tipe={soal.tipe} small />
                          {soal.kunciJawaban && (
                            <span className="text-[9px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/30 px-1.5 py-[1px] rounded-full border border-teal-200 dark:border-teal-800">
                              Kunci: {soal.kunciJawaban}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-1 leading-snug">{soal.pertanyaan}</p>
                      </div>
                    </div>
                  ))}
                  {parsed.length > 10 && (
                    <div className="px-4 py-2.5 text-center text-xs text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800/30">
                      +{parsed.length - 10} soal lainnya
                    </div>
                  )}
                </div>
              </div>

              {importError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 max-h-40 overflow-y-auto">
                  <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-words font-sans leading-relaxed">{importError}</pre>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
                  <X className="size-3.5" /> Ganti File
                </button>
                <button onClick={handleImport} disabled={isImporting || !selectedUjian} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                  {isImporting ? <><Loader2 className="size-4 animate-spin" /> Mengimport...</> : <><Sparkles className="size-4" /> Import {parsed.length} Soal <ArrowRight className="size-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP: DONE */}
          {step === "done" && importResult && (
            <div className="p-8 flex flex-col items-center text-center gap-5">
              <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-700 shadow-xl shadow-teal-500/30">
                <CheckCircle2 className="size-10 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-800 dark:text-white">Import Berhasil!</p>
                <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">Soal sudah ditambahkan ke ujian</p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
                  <p className="text-3xl font-black text-teal-600 dark:text-teal-400">{importResult.imported}</p>
                  <p className="text-xs font-bold text-teal-500 mt-0.5">Berhasil diimport</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{importResult.skipped}</p>
                  <p className="text-xs font-bold text-amber-500 mt-0.5">Dilewati / error</p>
                </div>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-left max-h-32 overflow-y-auto">
                  <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1.5">Detail error:</p>
                  {importResult.errors.map((e, i) => <p key={i} className="text-xs text-red-600 dark:text-red-400 leading-relaxed">• {e}</p>)}
                </div>
              )}
              <div className="flex gap-2.5 w-full">
                <button onClick={() => { handleClose(); onSuccess() }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-700 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]">
                  <CheckCircle2 className="size-4" /> Selesai & Refresh
                </button>
                <button onClick={reset} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
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

// ════════════════════════════════════════════════════════════
// SOAL ITEM — compact 2-baris
// ════════════════════════════════════════════════════════════
function SoalItem({ soal, onView, onDelete }: { soal: Soal; onView: (s: Soal) => void; onDelete: (s: Soal) => void }) {
  return (
    <div className="group relative flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-all duration-150 border-b border-slate-100 dark:border-zinc-800/60 last:border-0">
      {/* Left accent */}
      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-teal-500 to-emerald-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Nomor badge */}
      <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white text-xs font-black shrink-0 bg-gradient-to-br from-teal-500 to-emerald-700 shadow-sm">
        {soal.nomor}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Baris 1: pertanyaan */}
        <p className="text-[13px] font-semibold text-slate-800 dark:text-white leading-snug line-clamp-1 mb-[3px]">
          {soal.pertanyaan}
        </p>
        {/* Baris 2: meta compact */}
        <div className="flex items-center gap-2 text-[10.5px] text-slate-400 dark:text-zinc-500 flex-wrap">
          <TipeBadge tipe={soal.tipe} small />
          <span className="flex items-center gap-0.5 font-medium text-slate-500 dark:text-zinc-400">
            <BookOpen className="size-2.5 text-teal-500 shrink-0" />
            {soal.ujian.mapel}
          </span>
          <span className="flex items-center gap-0.5">
            <ChevronRight className="size-2.5 shrink-0" />
            <span className="truncate max-w-[100px]">{soal.ujian.judul}</span>
          </span>
          <span className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400 font-semibold">
            <Award className="size-2.5 shrink-0" />
            {soal.bobot}
          </span>
          {soal.kunciJawaban && soal.tipe === "PILIHAN_GANDA" && (
            <span className="text-teal-600 dark:text-teal-500 font-bold">✓ {soal.kunciJawaban}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
        <button onClick={() => onView(soal)} title="Lihat detail" className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 dark:hover:text-teal-400 transition-all">
          <Eye className="size-3.5" />
        </button>
        <Link href={`/admin/soal/${soal.id}/edit`} title="Edit soal" className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-all">
          <Edit2 className="size-3.5" />
        </Link>
        <button onClick={() => onDelete(soal)} title="Hapus soal" className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export function KelolaSoalClient({ data }: Props) {
  const { soalList, ujianList } = data
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState("")
  const [filterUjian, setFilterUjian] = useState("all")
  const [filterTipe, setFilterTipe] = useState("all")
  const [showFilter, setShowFilter] = useState(false)
  const [detailSoal, setDetailSoal] = useState<Soal | null>(null)
  const [deleteSoal, setDeleteSoal] = useState<Soal | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => {
    return soalList.filter((s) => {
      const matchSearch = !search || s.pertanyaan.toLowerCase().includes(search.toLowerCase()) || s.ujian.judul.toLowerCase().includes(search.toLowerCase()) || s.ujian.mapel.toLowerCase().includes(search.toLowerCase())
      const matchUjian = filterUjian === "all" || s.ujianId === filterUjian
      const matchTipe = filterTipe === "all" || s.tipe === filterTipe
      return matchSearch && matchUjian && matchTipe
    })
  }, [soalList, search, filterUjian, filterTipe])

  const totalPG = soalList.filter((s) => s.tipe === "PILIHAN_GANDA").length
  const totalEssay = soalList.filter((s) => s.tipe === "ESSAY").length
  const isFiltered = filterUjian !== "all" || filterTipe !== "all"

  const handleDelete = async () => {
    if (!deleteSoal) return
    setDeleteError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/soal/${deleteSoal.id}`, { method: "DELETE" })
        if (!res.ok) { const err = await res.json(); setDeleteError(err.error || "Gagal menghapus soal"); return }
        setDeleteSoal(null); router.refresh()
      } catch { setDeleteError("Terjadi kesalahan, coba lagi") }
    })
  }

  const heroStats = [
    { label: "Total Soal", value: soalList.length, icon: LibraryBig, gradient: "from-teal-500 to-emerald-600", iconBg: "bg-teal-50 dark:bg-teal-950/40", iconColor: "text-teal-600 dark:text-teal-400", valueColor: "text-teal-700 dark:text-teal-300", labelColor: "text-teal-500/70 dark:text-teal-500", borderColor: "border-teal-100 dark:border-teal-900/50" },
    { label: "Pilihan Ganda", value: totalPG, icon: ClipboardCheck, gradient: "from-blue-500 to-indigo-600", iconBg: "bg-blue-50 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400", valueColor: "text-blue-700 dark:text-blue-300", labelColor: "text-blue-500/70 dark:text-blue-500", borderColor: "border-blue-100 dark:border-blue-900/50" },
    { label: "Essay", value: totalEssay, icon: ScrollText, gradient: "from-violet-500 to-purple-600", iconBg: "bg-violet-50 dark:bg-violet-950/40", iconColor: "text-violet-600 dark:text-violet-400", valueColor: "text-violet-700 dark:text-violet-300", labelColor: "text-violet-500/70 dark:text-violet-500", borderColor: "border-violet-100 dark:border-violet-900/50" },
    { label: "Total Ujian", value: ujianList.length, icon: GraduationCap, gradient: "from-amber-500 to-orange-600", iconBg: "bg-amber-50 dark:bg-amber-950/40", iconColor: "text-amber-600 dark:text-amber-400", valueColor: "text-amber-700 dark:text-amber-300", labelColor: "text-amber-500/70 dark:text-amber-500", borderColor: "border-amber-100 dark:border-amber-900/50" },
  ]

  return (
    <div className="w-full space-y-4 pb-10">

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)` }} />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-8 right-24 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/10 pointer-events-none" />

        <div className="relative px-6 pt-6 pb-0">
          {/* Title row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm shadow-inner">
                <BookOpen className="size-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-tight">Bank Soal</h1>
                <p className="text-xs text-teal-100/60 mt-0.5 font-medium">Kelola semua soal ujian</p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black text-white bg-white/15 border border-white/25 backdrop-blur-sm hover:bg-white/25 active:scale-[0.97] transition-all"
              >
                <FileUp className="size-3.5" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <Link href="/admin/soal/buat">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-teal-800 bg-white hover:bg-teal-50 shadow-xl shadow-black/20 transition-all active:scale-[0.97] hover:-translate-y-0.5">
                  <Plus className="size-3.5" />
                  <span className="hidden sm:inline">Tambah Soal</span>
                  <span className="sm:hidden">Tambah</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {heroStats.map((stat, i) => (
              <div key={i} className={`relative bg-white dark:bg-zinc-900 rounded-t-2xl px-4 pt-4 pb-4 border border-b-0 ${stat.borderColor} shadow-lg overflow-hidden`}>
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.gradient} opacity-60`} />
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${stat.iconBg} mb-2.5`}>
                  <stat.icon className={`size-4 ${stat.iconColor}`} />
                </div>
                <p className={`text-3xl font-black leading-none ${stat.valueColor} tabular-nums`}>{stat.value}</p>
                <p className={`text-[10px] font-black mt-1.5 uppercase tracking-[0.12em] ${stat.labelColor}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm p-3">
        <div className="flex gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm shadow-teal-300/50 dark:shadow-teal-700/50">
              <Search className="size-3.5 text-white" />
            </div>
            <input
              type="text"
              placeholder="Cari pertanyaan, ujian, atau mapel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-10 h-11 text-sm border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 hover:border-slate-300 dark:hover:border-zinc-600 transition-all font-medium"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 flex items-center justify-center transition-colors">
                <X className="size-3.5 text-slate-500 dark:text-zinc-400" />
              </button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`sm:hidden flex items-center gap-1.5 px-3.5 h-11 rounded-xl border text-sm font-bold transition-all ${showFilter || isFiltered ? "bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-300/30" : "border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700"}`}
          >
            <SlidersHorizontal className="size-3.5" />
            {isFiltered && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>

          {/* Desktop filters */}
          <div className="hidden sm:flex gap-2">
            <NativeSelect value={filterUjian} onChange={setFilterUjian} className="w-[185px]">
              <option value="all">Semua Ujian</option>
              {ujianList.map((u) => <option key={u.id} value={u.id}>{u.judul}</option>)}
            </NativeSelect>
            <NativeSelect value={filterTipe} onChange={setFilterTipe} className="w-[145px]">
              <option value="all">Semua Tipe</option>
              <option value="PILIHAN_GANDA">Pilihan Ganda</option>
              <option value="ESSAY">Essay</option>
            </NativeSelect>
          </div>
        </div>

        {/* Mobile expanded filters */}
        {showFilter && (
          <div className="flex gap-2 mt-2.5 sm:hidden">
            <NativeSelect value={filterUjian} onChange={setFilterUjian} className="flex-1">
              <option value="all">Semua Ujian</option>
              {ujianList.map((u) => <option key={u.id} value={u.id}>{u.judul}</option>)}
            </NativeSelect>
            <NativeSelect value={filterTipe} onChange={setFilterTipe} className="w-[130px]">
              <option value="all">Semua Tipe</option>
              <option value="PILIHAN_GANDA">PG</option>
              <option value="ESSAY">Essay</option>
            </NativeSelect>
          </div>
        )}
      </div>

      {/* ── SOAL LIST ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl text-white shadow-sm bg-gradient-to-br from-teal-500 to-emerald-700">
              <Layers className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white leading-tight">Daftar Soal</h2>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">Bank soal ujian</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm">
            <span className="text-xs font-black text-slate-700 dark:text-white tabular-nums">{filtered.length}</span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">/ {soalList.length} soal</span>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-700 opacity-10 mb-5">
              <BookOpen className="size-10 text-white" />
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white mb-1.5">
              {soalList.length === 0 ? "Belum ada soal" : "Soal tidak ditemukan"}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 leading-relaxed max-w-xs mx-auto">
              {soalList.length === 0 ? "Mulai tambahkan atau import soal ujian" : "Coba ubah kata kunci atau filter"}
            </p>
            {soalList.length === 0 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-sm font-bold hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all">
                  <FileUp className="size-4" /> Import Excel
                </button>
                <Link href="/admin/soal/buat" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]">
                  <Plus className="size-4" /> Buat Soal
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((soal) => (
              <SoalItem
                key={soal.id}
                soal={soal}
                onView={(s) => setDetailSoal(s)}
                onDelete={(s) => { setDeleteError(null); setDeleteSoal(s) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────── */}
      <DetailSoalModal soal={detailSoal} onClose={() => setDetailSoal(null)} />
      <DeleteConfirmModal soal={deleteSoal} onClose={() => setDeleteSoal(null)} onConfirm={handleDelete} isPending={isPending} />
      <ImportSoalModal open={showImport} onClose={() => setShowImport(false)} ujianList={ujianList} onSuccess={() => router.refresh()} />

      {/* ── Error Toast ────────────────────────────────────────────── */}
      {deleteError && (
        <div className="fixed bottom-6 right-4 md:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold shadow-2xl shadow-red-500/30 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-3.5" />
          </div>
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-1 flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}