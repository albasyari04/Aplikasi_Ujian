"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
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
  Database,
  BookOpen,
  ChevronDown,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Mapel color map ──────────────────────────────────────────────────────────
const MAPEL_COLORS: Record<string, { bg: string; text: string; badgeBg: string; badgeText: string }> = {
  default:    { bg: "#ccfbf1", text: "#0f766e", badgeBg: "#ccfbf1", badgeText: "#0f766e" },
  Matematika: { bg: "#dbeafe", text: "#1d4ed8", badgeBg: "#dbeafe", badgeText: "#1d4ed8" },
  Kimia:      { bg: "#ede9fe", text: "#7c3aed", badgeBg: "#ede9fe", badgeText: "#7c3aed" },
  Fisika:     { bg: "#ffedd5", text: "#c2410c", badgeBg: "#ffedd5", badgeText: "#c2410c" },
  Biologi:    { bg: "#d1fae5", text: "#065f46", badgeBg: "#d1fae5", badgeText: "#065f46" },
  "B. Indonesia": { bg: "#fce7f3", text: "#be185d", badgeBg: "#fce7f3", badgeText: "#be185d" },
  "B. Inggris":   { bg: "#e0f2fe", text: "#0369a1", badgeBg: "#e0f2fe", badgeText: "#0369a1" },
}

function getMapelStyle(mapel: string) {
  return MAPEL_COLORS[mapel] ?? MAPEL_COLORS.default
}

// ─── Custom Ujian Dropdown ────────────────────────────────────────────────────
function UjianDropdown({
  ujianList,
  value,
  onChange,
}: {
  ujianList: Ujian[]
  value: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = ujianList.find((u) => u.id === value)
  const filtered = ujianList.filter(
    (u) =>
      u.judul.toLowerCase().includes(search.toLowerCase()) ||
      u.mapel.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpen = () => {
    setOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
    setSearch("")
  }

  // ✅ PERBAIKAN: Pindahkan event listener ke dalam useEffect
  // agar tidak menambahkan listener berulang kali setiap render
  const handleMouseDownOutside = useCallback((e: MouseEvent) => {
    if (!containerRef.current?.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleMouseDownOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleMouseDownOutside)
    }
  }, [open, handleMouseDownOutside])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={open ? () => setOpen(false) : handleOpen}
        className="w-full h-11 flex items-center gap-3 px-3.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left"
        style={{
          backgroundColor: "#ffffff",
          borderColor: open ? "#14b8a6" : "#e2e8f0",
          boxShadow: open ? "0 0 0 3px rgba(20,184,166,0.12)" : "none",
        }}
      >
        {selected ? (
          <>
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-extrabold"
              style={{ backgroundColor: getMapelStyle(selected.mapel).bg, color: getMapelStyle(selected.mapel).text }}
            >
              {selected.mapel.substring(0, 2).toUpperCase()}
            </div>
            <span className="flex-1 font-semibold text-slate-800 truncate">{selected.judul}</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: getMapelStyle(selected.mapel).badgeBg,
                color: getMapelStyle(selected.mapel).badgeText,
              }}
            >
              {selected.mapel}
            </span>
          </>
        ) : (
          <>
            <BookOpen className="size-4 text-slate-400 shrink-0" />
            <span className="flex-1 text-slate-400">Pilih ujian yang akan diisi soal...</span>
          </>
        )}
        <ChevronDown
          className="size-4 text-slate-400 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            zIndex: 99999,
          }}
        >
          {/* Search */}
          <div className="p-2" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <Search className="size-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ujian atau mata pelajaran..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="max-h-52 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="size-8 mx-auto mb-2" style={{ color: "#cbd5e1" }} />
                <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                  {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada ujian"}
                </p>
              </div>
            ) : (
              filtered.map((u) => {
                const style = getMapelStyle(u.mapel)
                const isSelected = u.id === value
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(u.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left"
                    style={{
                      backgroundColor: isSelected ? "#f0fdfa" : "transparent",
                      border: `1px solid ${isSelected ? "#99f6e4" : "transparent"}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc"
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-extrabold"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }}
                    >
                      {u.mapel.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                        {u.judul}
                      </p>
                      <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                        style={{ backgroundColor: style.badgeBg, color: style.badgeText }}
                      >
                        {u.mapel}
                      </span>
                    </div>

                    {/* Checkmark */}
                    {isSelected && <CheckCircle2 className="size-4 shrink-0" style={{ color: "#14b8a6" }} />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ImportSoalModal({
  ujianList,
  onSuccess,
  children,
  open,
  onOpenChange,
}: ImportSoalModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [ujianId, setUjianId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setResult(null) }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setResult(null) }
  }, [])

  const getFileIcon = (size = "size-10") => {
    if (!file) return <Upload className={`${size} text-slate-300`} />
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext === "xlsx" || ext === "xls") return <FileSpreadsheet className={`${size} text-emerald-500`} />
    if (ext === "docx") return <FileText className={`${size} text-blue-500`} />
    if (ext === "csv") return <File className={`${size} text-amber-500`} />
    return <File className={`${size} text-slate-400`} />
  }

  const handleImport = async () => {
    if (!ujianId || !file) return
    setIsLoading(true)
    setResult(null)

    try {
      const ext = file.name.split(".").pop()?.toLowerCase()

      if (ext === "xlsx" || ext === "xls" || ext === "csv") {
        const XLSX = await import("xlsx")
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const soalList = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]

        if (soalList.length === 0) {
          setResult({ success: false, message: "File kosong atau tidak ada data soal" })
          return
        }

        // ✅ PERBAIKAN: Tambahkan credentials: "include" agar session NextAuth terkirim
        const response = await fetch("/api/soal/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ujianId, soalList }),
        })
        const data = await response.json()

        if (response.ok) {
          setResult({ success: true, message: data.message, details: data.errors })
          setTimeout(() => { setIsOpen(false); resetForm(); onSuccess?.() }, 2000)
        } else {
          setResult({ success: false, message: data.error || "Gagal mengimport soal", details: data.details })
        }

      } else if (ext === "docx") {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("ujianId", ujianId)

        // ✅ PERBAIKAN: Tambahkan credentials: "include" agar session NextAuth terkirim
        // Jangan set Content-Type header manual — biarkan browser set boundary FormData secara otomatis
        const response = await fetch("/api/soal/import-file", {
          method: "POST",
          credentials: "include",
          body: formData,
        })

        // ✅ PERBAIKAN: Cek apakah response berhasil sebelum parse JSON
        if (!response.ok) {
          let errorMessage = "Gagal mengimport soal"
          let details: string[] | undefined
          try {
            const data = await response.json()
            errorMessage = data.error || errorMessage
            details = data.details
          } catch {
            // Jika response bukan JSON (misal 404 HTML page), tangani dengan aman
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
          setResult({ success: false, message: errorMessage, details })
          return
        }

        const data = await response.json()
        setResult({ success: true, message: data.message, details: data.errors })
        setTimeout(() => { setIsOpen(false); resetForm(); onSuccess?.() }, 2000)

      } else {
        setResult({ success: false, message: "Format tidak didukung. Gunakan .xlsx, .xls, .csv, atau .docx" })
      }
    } catch (err) {
      // ✅ PERBAIKAN: Tampilkan pesan error yang lebih spesifik
      console.error("Import error:", err)
      if (err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network"))) {
        setResult({
          success: false,
          message: "Tidak dapat terhubung ke server. Pastikan server berjalan dan coba lagi.",
        })
      } else {
        setResult({ success: false, message: "Terjadi kesalahan saat membaca atau mengimport file" })
      }
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
  const canImport = !!ujianId && !!file && !isLoading

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(o) => { if (!o) resetForm(); setIsOpen(o) }}
    >
      <DialogPrimitive.Trigger asChild>
        {children || (
          <Button
            className="gap-2 rounded-xl shadow-md font-semibold"
            style={{ background: "linear-gradient(135deg, #0d9488, #14b8a6)" }}
          >
            <Upload className="size-4" />
            Import Soal
          </Button>
        )}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 9998 }}
        />

        {/* Dialog — fully opaque using inline styles, never uses CSS variables */}
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl flex flex-col rounded-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          style={{
            zIndex: 9999,
            backgroundColor: "#ffffff",
            boxShadow: "0 32px 96px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.12)",
            maxHeight: "90vh",
          }}
        >

          {/* ════ HEADER ════ */}
          <div
            className="shrink-0 relative flex items-center justify-between px-6 pt-5 pb-4 rounded-t-2xl"
            style={{
              background: "linear-gradient(135deg, #f0fdfa 0%, #ffffff 70%)",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            {/* Decorative */}
            <div
              className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
              style={{ background: "rgba(20,184,166,0.06)" }}
            />

            <div className="flex items-center gap-3 relative">
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                  boxShadow: "0 4px 14px rgba(13,148,136,0.30)",
                }}
              >
                <Database className="size-5 text-white" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-[18px] font-extrabold text-slate-800 leading-tight">
                  Import Soal
                </DialogPrimitive.Title>
                <p className="text-xs text-slate-500 mt-0.5">Upload file soal dalam berbagai format</p>
              </div>
            </div>

            <DialogPrimitive.Close
              className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-all"
              style={{ color: "#94a3b8" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f1f5f9"
                e.currentTarget.style.color = "#475569"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.color = "#94a3b8"
              }}
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          {/* ════ BODY (scrollable) ════ */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="p-6 space-y-5">

              {/* ── Format Badges ── */}
              <div
                className="flex flex-wrap gap-2 p-3 rounded-xl"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                {[
                  { icon: <FileSpreadsheet className="size-3.5 text-emerald-500" />, label: "Excel (.xlsx, .xls)", bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
                  { icon: <File className="size-3.5 text-amber-500" />,             label: "CSV (.csv)",          bg: "#fffbeb", border: "#fde68a", color: "#78350f" },
                  { icon: <FileText className="size-3.5 text-blue-500" />,          label: "Word (.docx)",        bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
                ].map(({ icon, label, bg, border, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                  >
                    {icon}
                    <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* ── Pilih Ujian ── */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <BookOpen className="size-3.5 text-teal-500" />
                  Pilih Ujian
                  <span className="text-red-400 text-xs leading-none">*</span>
                </label>

                <UjianDropdown ujianList={ujianList} value={ujianId} onChange={setUjianId} />

                {selectedUjian && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "#f0fdfa", border: "1px solid #99f6e4" }}
                  >
                    <CheckCircle2 className="size-3.5 shrink-0" style={{ color: "#14b8a6" }} />
                    <p className="text-xs font-medium" style={{ color: "#0f766e" }}>
                      Terpilih:{" "}
                      <span className="font-bold">{selectedUjian.judul}</span>
                      <span className="mx-1.5" style={{ color: "#99f6e4" }}>·</span>
                      <span className="font-semibold">{selectedUjian.mapel}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* ── Upload Area ── */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Upload className="size-3.5 text-teal-500" />
                  Upload File
                  <span className="text-red-400 text-xs leading-none">*</span>
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex flex-col items-center justify-center gap-3 p-7 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: isDragging ? "#14b8a6" : file ? "#5eead4" : "#cbd5e1",
                    backgroundColor: isDragging ? "#f0fdfa" : file ? "#f8fffd" : "#fafafa",
                    transform: isDragging ? "scale(1.01)" : "scale(1)",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!file ? (
                    <>
                      <div
                        className="flex items-center justify-center w-16 h-16 rounded-2xl"
                        style={{ backgroundColor: "#f1f5f9" }}
                      >
                        <Upload className="size-7 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700">
                          Drag & drop atau{" "}
                          <span style={{ color: "#0d9488", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                            klik untuk upload
                          </span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          .xlsx, .xls, .csv, .docx — maks. 200 soal
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <FileSpreadsheet className="size-3.5 text-emerald-400" /> Excel / CSV
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1.5">
                          <FileText className="size-3.5 text-blue-400" /> Word (.docx)
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-4 w-full">
                      <div
                        className="flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
                        style={{ backgroundColor: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                      >
                        {getFileIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div
                            className="h-1.5 w-20 rounded-full overflow-hidden"
                            style={{ backgroundColor: "#ccfbf1" }}
                          >
                            <div className="h-full w-full rounded-full" style={{ backgroundColor: "#14b8a6" }} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: "#0d9488" }}>
                            Siap diimport
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-xl transition-colors shrink-0"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Format Guide Cards ── */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FileSpreadsheet className="size-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-extrabold text-emerald-800">Excel / CSV</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Kolom wajib:{" "}
                    <code
                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                      style={{ backgroundColor: "#dcfce7", color: "#166534" }}
                    >
                      pertanyaan, opsiA, opsiB, kunciJawaban
                    </code>
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="size-4 text-blue-600" />
                    </div>
                    <span className="text-xs font-extrabold text-blue-800">Word (.docx)</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Format:{" "}
                    <code
                      className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                      style={{ backgroundColor: "#dbeafe", color: "#1e40af" }}
                    >
                      1. Soal? A. Opsi Kunci: A
                    </code>
                  </p>
                </div>
              </div>

              {/* ── Result Alert ── */}
              {result && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    backgroundColor: result.success ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${result.success ? "#bbf7d0" : "#fecaca"}`,
                  }}
                >
                  {result.success ? (
                    <CheckCircle2 className="size-5 shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                  ) : (
                    <AlertCircle className="size-5 shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                  )}
                  <div className="flex-1">
                    <p
                      className="text-sm font-bold"
                      style={{ color: result.success ? "#166534" : "#991b1b" }}
                    >
                      {result.message}
                    </p>
                    {result.details && result.details.length > 0 && (
                      <ul className="mt-2 space-y-0.5 list-disc list-inside text-[11px]" style={{ color: "#dc2626" }}>
                        {result.details.slice(0, 5).map((d, i) => <li key={i}>{d}</li>)}
                        {result.details.length > 5 && (
                          <li>...dan {result.details.length - 5} error lainnya</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* ── Template Download ── */}
              <button
                type="button"
                onClick={() => window.open("/templates/template-soal.xlsx", "_blank")}
                className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 group"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0fdfa"
                  e.currentTarget.style.borderColor = "#99f6e4"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc"
                  e.currentTarget.style.borderColor = "#e2e8f0"
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{ backgroundColor: "#ccfbf1" }}
                >
                  <Download className="size-4" style={{ color: "#0d9488" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">Download Template Excel</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gunakan template agar format soal sesuai</p>
                </div>
                <ChevronDown
                  className="size-4 text-slate-300 -rotate-90 shrink-0"
                />
              </button>

            </div>
          </div>

          {/* ════ FOOTER (always visible) ════ */}
          <div
            className="shrink-0 flex items-center justify-between gap-3 px-6 py-4 rounded-b-2xl"
            style={{ backgroundColor: "#ffffff", borderTop: "1px solid #f1f5f9" }}
          >
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="flex items-center h-10 px-5 rounded-xl text-sm font-semibold transition-all"
                style={{ color: "#64748b" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9"
                  e.currentTarget.style.color = "#1e293b"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "#64748b"
                }}
              >
                Batal
              </button>
            </DialogPrimitive.Close>

            <button
              type="button"
              onClick={handleImport}
              disabled={!canImport}
              className="flex items-center gap-2 h-10 px-6 rounded-xl text-white text-sm font-bold transition-all disabled:cursor-not-allowed"
              style={{
                background: canImport
                  ? "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)"
                  : "#cbd5e1",
                boxShadow: canImport ? "0 4px 16px rgba(13,148,136,0.35)" : "none",
                opacity: canImport ? 1 : 0.7,
              }}
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
            </button>
          </div>

        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}