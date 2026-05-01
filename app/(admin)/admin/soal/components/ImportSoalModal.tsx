"use client"

import { useState, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  FileSpreadsheet,
  FileText,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Database,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Ujian {
  id: string
  judul: string
  mapel: string
}

interface ImportSoalModalProps {
  ujianList: Ujian[]
  onSuccess?: () => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

type FileType = "excel" | "word" | "csv" | null

export function ImportSoalModal({ ujianList, onSuccess, children, open, onOpenChange }: ImportSoalModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [ujianId, setUjianId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }, [])

  const getFileIcon = () => {
    if (!file) return <Upload className="size-12 text-slate-300" />
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext === "xlsx" || ext === "xls") return <FileSpreadsheet className="size-12 text-emerald-500" />
    if (ext === "docx") return <FileText className="size-12 text-blue-500" />
    if (ext === "csv") return <File className="size-12 text-amber-500" />
    return <File className="size-12 text-slate-400" />
  }

  const getFileType = (): FileType => {
    if (!file) return null
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext === "xlsx" || ext === "xls") return "excel"
    if (ext === "docx") return "word"
    if (ext === "csv") return "csv"
    return null
  }

  const handleImport = async () => {
    if (!ujianId || !file) return

    setIsLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("ujianId", ujianId)

    try {
      const response = await fetch("/api/soal/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data.errors,
        })
        setTimeout(() => {
          setIsOpen(false)
          setFile(null)
          setUjianId("")
          setResult(null)
          onSuccess?.()
        }, 2000)
      } else {
        setResult({
          success: false,
          message: data.error || "Gagal mengimport soal",
          details: data.details,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Terjadi kesalahan saat mengimport",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setUjianId("")
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const selectedUjian = ujianList.find((u) => u.id === ujianId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm()
      setIsOpen(open)
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 shadow-lg">
            <Upload className="size-4" />
            Import Soal
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <div className="relative">
          {/* Header Gradient */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-6 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-100">
                <Database className="size-5 text-teal-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800">Import Soal</DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">Upload file soal dalam berbagai format</p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Supported Formats */}
            <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-sm">
                <FileSpreadsheet className="size-3.5 text-emerald-500" />
                <span className="text-[11px] font-medium text-slate-600">Excel (.xlsx, .xls)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-sm">
                <File className="size-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-slate-600">CSV (.csv)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white shadow-sm">
                <FileText className="size-3.5 text-blue-500" />
                <span className="text-[11px] font-medium text-slate-600">Word (.docx)</span>
              </div>
            </div>

            {/* Pilih Ujian */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal-500" />
                Pilih Ujian
              </Label>
              <Select value={ujianId} onValueChange={setUjianId}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:border-teal-400 focus:ring-2 focus:ring-teal-100">
                  <SelectValue placeholder="Pilih ujian yang akan diisi soal" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ujianList.map((ujian) => (
                    <SelectItem key={ujian.id} value={ujian.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ujian.judul}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-teal-600">{ujian.mapel}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUjian && (
                <p className="text-[11px] text-teal-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="size-3" />
                  Terpilih: {selectedUjian.judul} ({selectedUjian.mapel})
                </p>
              )}
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal-500" />
                Upload File
              </Label>

              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer",
                  file
                    ? "border-teal-300 bg-teal-50/30"
                    : "border-slate-200 bg-slate-50/50 hover:border-teal-300 hover:bg-teal-50/20"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center text-center gap-3">
                  {getFileIcon()}
                  
                  {!file ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Drag & drop atau <span className="text-teal-600">klik untuk upload</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          .xlsx, .xls, .csv, .docx – maks. 200 soal
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">📊 Excel/CSV</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1">📝 Word (.docx)</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-sm font-medium text-slate-700">{file.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="p-1 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <X className="size-4 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Format Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="size-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Excel / CSV</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Kolom: <span className="font-mono">pertanyaan, opsiA, opsiB, opsiC, opsiD, opsiE, kunciJawaban, bobot</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">Word (.docx)</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Format: <span className="font-mono">1. Pertanyaan? A. Opsi A B. Opsi B Kunci: A</span>
                </p>
              </div>
            </div>

            {/* Result Alert */}
            {result && (
              <div className={cn(
                "p-4 rounded-xl border",
                result.success
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-semibold",
                      result.success ? "text-emerald-700" : "text-red-700"
                    )}>
                      {result.message}
                    </p>
                    {result.details && result.details.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] font-medium text-red-600">Detail error:</p>
                        <ul className="text-[10px] text-red-500 space-y-0.5 list-disc list-inside">
                          {result.details.slice(0, 5).map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                          {result.details.length > 5 && (
                            <li>...dan {result.details.length - 5} error lainnya</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template Download */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 rounded-xl border-slate-200 hover:border-teal-300 hover:bg-teal-50"
                onClick={() => window.open("/templates/template-soal.xlsx", "_blank")}
              >
                <Download className="size-4" />
                Download Template Excel
              </Button>
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Gunakan template agar format sesuai
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 pt-0">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!ujianId || !file || isLoading}
              className="gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Import Soal
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}