"use client"

import React, { useRef, useState, useCallback } from "react"
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Layers,
  Hash,
  Star,
  ChevronDown,
  File,
  ChevronRight,
  Sparkles,
  TableIcon,
} from "lucide-react"

interface UjianOption {
  id: string
  judul: string
  mapel: string
}

interface ImportSoalModalProps {
  isOpen: boolean
  onClose: () => void
  ujianList: UjianOption[]
  defaultUjianId?: string
  onSuccess?: () => void
}

type FileType = "excel" | "csv" | "docx" | null
type TipeSoal = "PILIHAN_GANDA" | "ESSAY"

interface ParsedSoal {
  nomor?: number
  pertanyaan: string
  tipe: TipeSoal
  opsiA?: string | null
  opsiB?: string | null
  opsiC?: string | null
  opsiD?: string | null
  opsiE?: string | null
  kunciJawaban?: string | null
  bobot?: number
}

// ─── XLSX / CSV parser (client-side) ───────────────────────────────────────
async function parseExcelFile(file: File): Promise<ParsedSoal[]> {
  const XLSX = await import("xlsx")
  const ab = await file.arrayBuffer()
  const wb = XLSX.read(ab, { type: "array" })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: "" })
  return mapRows(rows)
}

async function parseCsvFile(file: File): Promise<ParsedSoal[]> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]))
  })
  return mapRows(rows)
}

function mapRows(rows: Record<string, string>[]): ParsedSoal[] {
  return rows
    .filter((r) => r.pertanyaan?.trim())
    .map((r, i) => {
      const hasOptions = r.opsiA?.trim() && r.opsiB?.trim()
      const tipe: TipeSoal = hasOptions ? "PILIHAN_GANDA" : "ESSAY"
      return {
        nomor: r.nomor ? parseInt(r.nomor) : i + 1,
        pertanyaan: r.pertanyaan?.trim() ?? "",
        tipe,
        opsiA: r.opsiA?.trim() || null,
        opsiB: r.opsiB?.trim() || null,
        opsiC: r.opsiC?.trim() || null,
        opsiD: r.opsiD?.trim() || null,
        opsiE: r.opsiE?.trim() || null,
        kunciJawaban: r.kunciJawaban?.trim().toUpperCase() || null,
        bobot: r.bobot ? parseFloat(r.bobot) : 1,
      }
    })
}

// ─── Download template ──────────────────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import("xlsx")
  const headers = ["nomor", "pertanyaan", "tipe", "opsiA", "opsiB", "opsiC", "opsiD", "opsiE", "kunciJawaban", "bobot"]
  const sample = [
    [1, "Ibu kota Indonesia adalah?", "PILIHAN_GANDA", "Jakarta", "Surabaya", "Bandung", "Medan", "", "A", 1],
    [2, "Jelaskan proses fotosintesis!", "ESSAY", "", "", "", "", "", "", 5],
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Soal")
  XLSX.writeFile(wb, "template-soal.xlsx")
}

// ═══════════════════════════════════════════════════════════════════
//  STEP INDICATOR
// ═══════════════════════════════════════════════════════════════════
function StepIndicator({ current }: { current: "upload" | "preview" }) {
  const steps = [
    { key: "upload", label: "Upload File", num: 1 },
    { key: "preview", label: "Pratinjau & Konfirmasi", num: 2 },
  ]
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const isActive = s.key === current
        const isDone = current === "preview" && s.key === "upload"
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? "bg-white text-teal-700"
                    : isActive
                    ? "bg-white text-teal-700 ring-2 ring-white/50"
                    : "bg-white/20 text-white/60"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : s.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? "text-white" : isDone ? "text-white/80" : "text-white/50"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${isDone ? "bg-white/60" : "bg-white/20"}`} style={{ minWidth: 20 }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export function ImportSoalModal({
  isOpen,
  onClose,
  ujianList,
  defaultUjianId = "",
  onSuccess,
}: ImportSoalModalProps) {
  const [ujianId, setUjianId] = useState(defaultUjianId)
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<FileType>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState<"upload" | "preview">("upload")
  const [parsedSoal, setParsedSoal] = useState<ParsedSoal[]>([])
  const [globalBobot, setGlobalBobot] = useState<string>("1")
  const [globalTipe, setGlobalTipe] = useState<TipeSoal | "">("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string; details?: string[] } | null>(null)
  const [parsing, setParsing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  function detectType(f: File): FileType {
    const ext = f.name.split(".").pop()?.toLowerCase()
    if (ext === "xlsx" || ext === "xls") return "excel"
    if (ext === "csv") return "csv"
    if (ext === "docx") return "docx"
    return null
  }

  async function handleFile(f: File) {
    const ft = detectType(f)
    if (!ft) {
      setResult({ error: "Format file tidak didukung. Gunakan .xlsx, .xls, .csv, atau .docx" })
      return
    }
    setFile(f)
    setFileType(ft)
    setResult(null)

    if (ft === "excel" || ft === "csv") {
      setParsing(true)
      try {
        const rows = ft === "excel" ? await parseExcelFile(f) : await parseCsvFile(f)
        setParsedSoal(rows)
        setStep("preview")
      } catch {
        setResult({ error: "Gagal membaca file. Pastikan format sesuai template." })
      } finally {
        setParsing(false)
      }
    } else {
      setStep("preview")
      setParsedSoal([])
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function applyGlobalBobot() {
    const parsed = parseFloat(globalBobot)
    if (isNaN(parsed) || parsed < 1) return
    setParsedSoal((prev) => prev.map((s) => ({ ...s, bobot: parsed })))
  }

  function applyGlobalTipe() {
    if (!globalTipe) return
    setParsedSoal((prev) =>
      prev.map((s) => ({
        ...s,
        tipe: globalTipe as TipeSoal,
        kunciJawaban: globalTipe === "ESSAY" ? null : s.kunciJawaban,
      }))
    )
  }

  function updateSoal(idx: number, patch: Partial<ParsedSoal>) {
    setParsedSoal((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  function removeSoal(idx: number) {
    setParsedSoal((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    if (!ujianId) { setResult({ error: "Pilih ujian terlebih dahulu" }); return }
    if (!file) { setResult({ error: "Pilih file terlebih dahulu" }); return }
    setLoading(true)
    setResult(null)
    try {
      if (fileType === "docx") {
        const fd = new FormData()
        fd.append("ujianId", ujianId)
        fd.append("file", file)
        const res = await fetch("/api/soal/import-file", { method: "POST", body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Gagal import")
        setResult({ success: json.message, details: json.errors })
        onSuccess?.()
      } else {
        if (parsedSoal.length === 0) { setResult({ error: "Tidak ada soal untuk diimport" }); return }
        const res = await fetch("/api/soal/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ujianId, soalList: parsedSoal }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Gagal import")
        setResult({ success: json.message || `Berhasil import ${json.imported} soal`, details: json.errors })
        onSuccess?.()
      }
    } catch (e: any) {
      setResult({ error: e.message })
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFile(null)
    setFileType(null)
    setStep("upload")
    setParsedSoal([])
    setResult(null)
    setGlobalBobot("1")
    setGlobalTipe("")
    if (inputRef.current) inputRef.current.value = ""
  }

  // ── render ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
      {/* Modal — lebar max 5xl, tinggi hingga 95vh */}
      <div
        className="relative w-full flex flex-col bg-white rounded-3xl shadow-2xl"
        style={{ maxWidth: "72rem", maxHeight: "95vh", overflow: "hidden" }}
      >

        {/* ══════════════════════════════════════════════════
            HEADER — gradient teal, step indicator, badge format
        ══════════════════════════════════════════════════ */}
        <div className="relative shrink-0 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 px-7 py-5 text-white">
          {/* decorative circles */}
          <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-4 right-20 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex items-start gap-4">
            {/* icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
              <Upload className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight">Import Soal</h2>
                {/* format badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: "Excel (.xlsx, .xls)", bg: "bg-emerald-500/30 border-emerald-400/40" },
                    { label: "CSV (.csv)",           bg: "bg-amber-500/30 border-amber-400/40" },
                    { label: "Word (.docx)",          bg: "bg-blue-500/30 border-blue-400/40" },
                  ].map((b) => (
                    <span
                      key={b.label}
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border text-white ${b.bg}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
              {/* step indicator */}
              <div className="mt-3">
                <StepIndicator current={step} />
              </div>
            </div>
          </div>

          {/* close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════
            BODY — scrollable
        ══════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50/60">

          {/* ── STEP 1: Upload ──────────────────────────────── */}
          {step === "upload" && (
            <div className="p-6 sm:p-8 space-y-6">

              {/* ── Pilih Ujian Card ── */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                {/* card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Informasi Import</h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                    Wajib diisi
                  </span>
                </div>

                <div className="px-6 py-5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                      Pilih Ujian <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={ujianId}
                      onChange={(e) => setUjianId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10 transition-shadow"
                    >
                      <option value="">Pilih ujian yang akan diisi soal...</option>
                      {ujianList.map((u) => (
                        <option key={u.id} value={u.id}>{u.judul} — {u.mapel}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* ── Upload File Card ── */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Upload File</h3>
                    <span className="text-red-500 text-sm">*</span>
                  </div>
                  {/* format type icons */}
                  <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                      <FileSpreadsheet className="w-3 h-3" /> Excel
                    </span>
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      <TableIcon className="w-3 h-3" /> CSV
                    </span>
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                      <FileText className="w-3 h-3" /> Word
                    </span>
                  </div>
                </div>

                <div className="px-6 py-6 space-y-5">
                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl py-14 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
                      dragging
                        ? "border-teal-400 bg-teal-50 scale-[1.01]"
                        : "border-gray-200 hover:border-teal-400 hover:bg-teal-50/30"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? "bg-teal-100" : "bg-gray-100"}`}>
                      <Upload className={`w-8 h-8 transition-colors ${dragging ? "text-teal-600" : "text-gray-400"}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-medium text-gray-700">
                        Drag & drop atau{" "}
                        <span className="text-teal-600 underline underline-offset-2 font-semibold">klik untuk upload</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">.xlsx, .xls, .csv, .docx — maks. 200 soal</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel / CSV
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-500" /> Word (.docx)
                      </span>
                    </div>
                  </div>
                  <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.docx" className="hidden" onChange={handleInputChange} />

                  {/* Format info — 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">Excel / CSV</span>
                      </div>
                      <p className="text-xs text-emerald-600 mb-1.5">Kolom wajib:</p>
                      <code className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg block">
                        pertanyaan, opsiA, opsiB, kunciJawaban
                      </code>
                    </div>
                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-blue-700">Word (.docx)</span>
                      </div>
                      <p className="text-xs text-blue-600 mb-1.5">Format:</p>
                      <code className="text-xs text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-lg block">
                        1. Soal? A. Opsi Kunci: A
                      </code>
                    </div>
                  </div>

                  {/* Download template */}
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadTemplate() }}
                    className="w-full flex items-center justify-between px-5 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-teal-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                        <Download className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-700">Download Template Excel</p>
                        <p className="text-xs text-gray-400">Gunakan template agar format soal sesuai</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Parsing loader */}
              {parsing && (
                <div className="flex items-center gap-3 text-teal-600 text-sm bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Membaca file...
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Preview & Edit ──────────────────────── */}
          {step === "preview" && (
            <div className="p-6 sm:p-8 space-y-6">

              {/* File info banner */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-teal-50 border border-teal-200 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <File className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-teal-800 truncate">{file?.name}</p>
                  <p className="text-xs text-teal-600 mt-0.5">
                    {fileType === "docx"
                      ? "File Word akan diproses di server"
                      : `${parsedSoal.length} soal terdeteksi`}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="text-xs font-medium text-teal-600 hover:text-teal-800 bg-white border border-teal-200 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-all shrink-0"
                >
                  Ganti file
                </button>
              </div>

              {/* Informasi Soal Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Informasi Soal</h3>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                    Wajib diisi
                  </span>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Pilih Ujian */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                        Pilih Ujian <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={ujianId}
                        onChange={(e) => setUjianId(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10 transition-shadow"
                      >
                        <option value="">Pilih ujian...</option>
                        {ujianList.map((u) => (
                          <option key={u.id} value={u.id}>{u.judul} — {u.mapel}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Global controls — Tipe & Bobot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tipe global */}
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                      <label className="block text-xs font-semibold text-violet-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Tipe Soal (atur semua)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={globalTipe}
                            onChange={(e) => setGlobalTipe(e.target.value as TipeSoal | "")}
                            className="w-full border border-violet-200 rounded-lg px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 pr-8"
                          >
                            <option value="">— pilih —</option>
                            <option value="PILIHAN_GANDA">Pilihan Ganda</option>
                            <option value="ESSAY">Essay</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={applyGlobalTipe}
                          disabled={!globalTipe}
                          className="px-3.5 py-2 text-xs font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>

                    {/* Bobot global */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <label className="block text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" /> Bobot Nilai (atur semua)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={globalBobot}
                          onChange={(e) => setGlobalBobot(e.target.value)}
                          className="flex-1 border border-amber-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                        />
                        <button
                          onClick={applyGlobalBobot}
                          className="px-3.5 py-2 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daftar Soal preview (Excel/CSV) */}
              {fileType !== "docx" && parsedSoal.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-teal-500" />
                      Pratinjau Soal
                      <span className="ml-1 text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        {parsedSoal.length} soal
                      </span>
                    </h3>
                    <span className="text-xs text-gray-400">Klik untuk edit per soal</span>
                  </div>
                  <div className="p-5 space-y-3 max-h-[38vh] overflow-y-auto">
                    {parsedSoal.map((soal, idx) => (
                      <SoalPreviewCard
                        key={idx}
                        soal={soal}
                        index={idx}
                        onChange={(patch) => updateSoal(idx, patch)}
                        onRemove={() => removeSoal(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Word info notice */}
              {fileType === "docx" && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800">File Word akan diproses di server</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Klik "Import Soal" untuk memulai. Soal di-parse otomatis berdasarkan format:
                      <code className="ml-1 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded text-blue-700">
                        1. Pertanyaan A. Opsi Kunci: A
                      </code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Result messages ── */}
          {result && (
            <div className="px-6 sm:px-8 pb-5">
              {result.success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-800">{result.success}</p>
                    {result.details && result.details.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {result.details.map((d, i) => (
                          <li key={i} className="text-xs text-amber-600 flex items-start gap-1">
                            <span className="mt-0.5">⚠</span> {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              {result.error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-sm text-red-700 font-medium">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════ */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-7 py-4 flex items-center justify-between">
          <button
            onClick={step === "preview" ? reset : onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            {step === "preview" ? "← Kembali" : "Batal"}
          </button>

          {/* step info */}
          <span className="text-xs text-gray-400 hidden sm:block">
            {step === "upload" ? "Langkah 1 dari 2" : `Langkah 2 dari 2${parsedSoal.length > 0 ? ` — ${parsedSoal.length} soal siap diimport` : ""}`}
          </span>

          <button
            onClick={handleSubmit}
            disabled={loading || !ujianId || !file || (fileType !== "docx" && parsedSoal.length === 0)}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm shadow-teal-200 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {loading ? "Mengimport..." : "Import Soal"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
//  SoalPreviewCard — editable per-soal row
// ═══════════════════════════════════════════════════════════════════
function SoalPreviewCard({
  soal,
  index,
  onChange,
  onRemove,
}: {
  soal: ParsedSoal
  index: number
  onChange: (p: Partial<ParsedSoal>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const opsiKeys = ["A", "B", "C", "D", "E"] as const
  const opsiFields: Record<string, keyof ParsedSoal> = {
    A: "opsiA", B: "opsiB", C: "opsiC", D: "opsiD", E: "opsiE",
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 bg-gray-50/80 cursor-pointer hover:bg-gray-100/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {soal.nomor ?? index + 1}
        </div>
        <p className="flex-1 text-sm text-gray-700 truncate">
          {soal.pertanyaan || <span className="text-gray-400 italic">Pertanyaan kosong</span>}
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            soal.tipe === "PILIHAN_GANDA"
              ? "bg-teal-100 text-teal-700 border border-teal-200"
              : "bg-violet-100 text-violet-700 border border-violet-200"
          }`}
        >
          {soal.tipe === "PILIHAN_GANDA" ? "PG" : "Essay"}
        </span>
        <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
          <Star className="w-3 h-3" />{soal.bobot ?? 1}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* body */}
      {expanded && (
        <div className="p-4 space-y-4 border-t border-gray-100">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
              Pertanyaan *
            </label>
            <textarea
              rows={3}
              value={soal.pertanyaan}
              onChange={(e) => onChange({ pertanyaan: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Tulis pertanyaan soal..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Tipe */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
                <Layers className="w-3 h-3 text-violet-500" /> Tipe Soal *
              </label>
              <div className="relative">
                <select
                  value={soal.tipe}
                  onChange={(e) =>
                    onChange({
                      tipe: e.target.value as TipeSoal,
                      kunciJawaban: e.target.value === "ESSAY" ? null : soal.kunciJawaban,
                    })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8"
                >
                  <option value="PILIHAN_GANDA">Pilihan Ganda</option>
                  <option value="ESSAY">Essay</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Nomor */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
                <Hash className="w-3 h-3 text-gray-400" /> Nomor
              </label>
              <input
                type="number"
                min={1}
                value={soal.nomor ?? index + 1}
                onChange={(e) => onChange({ nomor: parseInt(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {/* Bobot */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500" /> Bobot
              </label>
              <input
                type="number"
                min={1}
                value={soal.bobot ?? 1}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  onChange({ bobot: isNaN(val) ? 1 : val })
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Pilihan jawaban */}
          {soal.tipe === "PILIHAN_GANDA" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Pilihan Jawaban
                </label>
                <span className="text-xs text-amber-600">— Klik huruf untuk jadikan kunci</span>
              </div>
              <div className="space-y-2">
                {opsiKeys.map((key) => {
                  const field = opsiFields[key]
                  const isKunci = soal.kunciJawaban === key
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        onClick={() => onChange({ kunciJawaban: key })}
                        className={`w-8 h-8 rounded-full text-sm font-bold border-2 flex items-center justify-center shrink-0 transition-all ${
                          isKunci
                            ? "bg-teal-600 border-teal-600 text-white shadow-md"
                            : "bg-white border-gray-300 text-gray-500 hover:border-teal-400"
                        }`}
                      >
                        {key}
                      </button>
                      <input
                        type="text"
                        value={(soal[field] as string) ?? ""}
                        onChange={(e) => onChange({ [field]: e.target.value })}
                        placeholder={`Opsi ${key}${key === "A" || key === "B" ? " (wajib)" : ""}`}
                        className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                          isKunci ? "border-teal-400 bg-teal-50" : "border-gray-200"
                        }`}
                      />
                    </div>
                  )
                })}
              </div>
              {!soal.kunciJawaban && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Kunci jawaban belum dipilih
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={onRemove}
              className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
            >
              Hapus soal ini
            </button>
          </div>
        </div>
      )}
    </div>
  )
}