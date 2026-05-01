"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  BookOpen,
  Save,
  CheckSquare,
  FileText,
  AlertCircle,
  CheckCircle2,
  Hash,
  Award,
  GraduationCap,
  Loader2,
  PlusCircle,
  Sparkles,
  ListChecks,
  PenLine,
  Target,
  ChevronRight,
  FlaskConical,
  Lightbulb,
  ClipboardList,
  Layers,
  Star,
  Upload,
} from "lucide-react"
import { ImportSoalModal } from "../components/ImportSoalModal"

// ─── Interface definitions (MUST be before usage) ───
interface Ujian {
  id: string
  judul: string
  mapel: string
}

interface Props {
  ujianList: Ujian[]
}

const OPSI_KEYS = ["A", "B", "C", "D", "E"] as const

const OPSI_CONFIG: Record<
  string,
  {
    color: string
    activeBg: string
    activeRing: string
    rowActive: string
    badge: string
  }
> = {
  A: {
    color: "text-blue-600",
    activeBg: "bg-blue-500 text-white",
    activeRing: "ring-2 ring-blue-200",
    rowActive: "bg-blue-50/60 border-blue-200",
    badge: "bg-blue-500 text-white",
  },
  B: {
    color: "text-violet-600",
    activeBg: "bg-violet-500 text-white",
    activeRing: "ring-2 ring-violet-200",
    rowActive: "bg-violet-50/60 border-violet-200",
    badge: "bg-violet-500 text-white",
  },
  C: {
    color: "text-amber-600",
    activeBg: "bg-amber-500 text-white",
    activeRing: "ring-2 ring-amber-200",
    rowActive: "bg-amber-50/60 border-amber-200",
    badge: "bg-amber-500 text-white",
  },
  D: {
    color: "text-rose-600",
    activeBg: "bg-rose-500 text-white",
    activeRing: "ring-2 ring-rose-200",
    rowActive: "bg-rose-50/60 border-rose-200",
    badge: "bg-rose-500 text-white",
  },
  E: {
    color: "text-emerald-600",
    activeBg: "bg-emerald-500 text-white",
    activeRing: "ring-2 ring-emerald-200",
    rowActive: "bg-emerald-50/60 border-emerald-200",
    badge: "bg-emerald-500 text-white",
  },
}

// ─── Field Label helper ────────────────────────────────────────
function FieldLabel({
  icon: Icon,
  children,
  required,
  iconClass = "text-teal-500",
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  required?: boolean
  iconClass?: string
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className={`size-3.5 ${iconClass}`} />
      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-[0.08em]">
        {children}
      </span>
      {required && <span className="text-red-400 text-xs leading-none">*</span>}
    </div>
  )
}

// ─── Section Card helper ───────────────────────────────────────
function SectionCard({
  headerBg,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  badge,
  children,
}: {
  headerBg: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-slate-100"
        style={{ background: headerBg }}
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${iconBg} shadow-sm shrink-0`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
        <span className="text-sm font-bold text-slate-800">{title}</span>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}

// ─── Main Export ───────────────────────────────────────────────
export function BuatSoalClient({ ujianList }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [importModalOpen, setImportModalOpen] = useState(false)

  const [form, setForm] = useState({
    ujianId: "",
    nomor: "",
    pertanyaan: "",
    tipe: "PILIHAN_GANDA" as "PILIHAN_GANDA" | "ESSAY",
    opsiA: "",
    opsiB: "",
    opsiC: "",
    opsiD: "",
    opsiE: "",
    kunciJawaban: "",
    bobot: "1",
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const validate = () => {
    if (!form.ujianId) return "Pilih ujian terlebih dahulu"
    if (!form.pertanyaan.trim()) return "Pertanyaan tidak boleh kosong"
    if (form.tipe === "PILIHAN_GANDA") {
      if (!form.opsiA.trim() || !form.opsiB.trim()) return "Minimal isi opsi A dan B"
      if (!form.kunciJawaban) return "Pilih kunci jawaban"
    }
    return null
  }

  const handleSubmit = async (andContinue = false) => {
    const err = validate()
    if (err) { setError(err); return }

    startTransition(async () => {
      try {
        const res = await fetch("/api/soal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ujianId: form.ujianId,
            nomor: form.nomor ? parseInt(form.nomor) : undefined,
            pertanyaan: form.pertanyaan.trim(),
            tipe: form.tipe,
            opsiA: form.opsiA.trim() || null,
            opsiB: form.opsiB.trim() || null,
            opsiC: form.opsiC.trim() || null,
            opsiD: form.opsiD.trim() || null,
            opsiE: form.opsiE.trim() || null,
            kunciJawaban: form.kunciJawaban || null,
            bobot: parseInt(form.bobot) || 1,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Gagal menyimpan soal")
          return
        }

        if (andContinue) {
          setForm((prev) => ({
            ujianId: prev.ujianId,
            nomor: "",
            pertanyaan: "",
            tipe: prev.tipe,
            opsiA: "",
            opsiB: "",
            opsiC: "",
            opsiD: "",
            opsiE: "",
            kunciJawaban: "",
            bobot: "1",
          }))
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
        } else {
          router.push("/admin/soal")
          router.refresh()
        }
      } catch {
        setError("Terjadi kesalahan koneksi")
      }
    })
  }

  const opsiValues: Record<string, string> = {
    A: form.opsiA,
    B: form.opsiB,
    C: form.opsiC,
    D: form.opsiD,
    E: form.opsiE,
  }

  const selectedUjian = ujianList.find((u) => u.id === form.ujianId)
  const isPG = form.tipe === "PILIHAN_GANDA"

  return (
    <div className="w-full pb-32 max-w-5xl mx-auto">

      {/* ════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6"
        style={{
          background: "linear-gradient(140deg, #0f766e 0%, #0d9488 40%, #14b8a6 75%, #0f766e 100%)",
          boxShadow: "0 8px 32px rgba(13,148,136,0.28)",
        }}
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-60 h-60 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="pointer-events-none absolute -bottom-14 left-1/3 w-44 h-44 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="pointer-events-none absolute top-5 right-1/4 w-24 h-24 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.12)" }} />

        <div className="relative px-5 pt-5 pb-6 sm:px-7 sm:pt-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <Link href="/admin/soal">
              <button
                className="flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(8px)" }}
                aria-label="Kembali"
              >
                <ArrowLeft className="size-3.5 text-white" />
              </button>
            </Link>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span>Bank Soal</span>
              <ChevronRight className="size-3" />
              <span className="font-semibold text-white">Tambah Soal</span>
            </div>
          </div>

          {/* Title row with Import Button */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div
                className="flex items-center justify-center w-11 h-11 rounded-2xl shrink-0"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-[22px] font-extrabold text-white tracking-tight leading-none mb-1.5">
                  Tambah Soal Baru
                </h1>
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Buat soal ujian dengan mudah dan terstruktur
                </p>
              </div>
            </div>

            {/* Type pill */}
            <div
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl shrink-0"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.22)",
              }}
            >
              {isPG ? (
                <>
                  <CheckSquare className="size-3.5 text-teal-100" />
                  <span className="text-[11px] font-bold text-white">Pilihan Ganda</span>
                </>
              ) : (
                <>
                  <PenLine className="size-3.5 text-teal-100" />
                  <span className="text-[11px] font-bold text-white">Essay</span>
                </>
              )}
            </div>
          </div>

          {/* Import Button Row */}
          <div className="mt-4 flex justify-end">
            <ImportSoalModal
              ujianList={ujianList}
              onSuccess={() => router.refresh()}
              open={importModalOpen}
              onOpenChange={setImportModalOpen}
            >
              <Button
                className="gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white shadow-lg rounded-xl"
              >
                <Upload className="size-4" />
                Import Soal
              </Button>
            </ImportSoalModal>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          ALERTS
      ════════════════════════════════════════ */}
      {success && (
        <div
          className="flex items-center gap-3.5 p-4 rounded-2xl mb-5"
          style={{
            background: "linear-gradient(90deg, #059669, #10b981)",
            boxShadow: "0 4px 20px rgba(16,185,129,0.30)",
          }}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 shrink-0">
            <CheckCircle2 className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Soal berhasil disimpan!</p>
            <p className="text-xs text-emerald-100 mt-0.5">Silakan tambah soal berikutnya.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-red-100 bg-red-50 mb-5 shadow-sm">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-100 shrink-0">
            <AlertCircle className="size-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">Terjadi Kesalahan</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SECTION 1 — Informasi Soal
      ════════════════════════════════════════ */}
      <SectionCard
        headerBg="linear-gradient(105deg, #f0fdf9 0%, #ffffff 100%)"
        icon={ClipboardList}
        iconBg="bg-teal-100"
        iconColor="text-teal-700"
        title="Informasi Soal"
        badge={
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
            Wajib diisi
          </span>
        }
      >
        <div className="space-y-5">

          {/* Pilih Ujian */}
          <div>
            <FieldLabel icon={BookOpen} required>Pilih Ujian</FieldLabel>
            <Select value={form.ujianId} onValueChange={(v) => updateForm("ujianId", v)}>
              <SelectTrigger className="h-11 text-sm border-slate-200 bg-slate-50 hover:bg-white hover:border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all rounded-xl font-medium">
                <SelectValue placeholder="Pilih ujian yang akan diisi soal..." />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={6}
                className="rounded-2xl border-slate-200 shadow-2xl z-50 w-[--radix-select-trigger-width] overflow-hidden p-1"
              >
                {ujianList.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <FlaskConical className="size-7 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Belum ada ujian</p>
                    <p className="text-xs text-slate-400 mt-1">Buat ujian terlebih dahulu</p>
                  </div>
                ) : (
                  ujianList.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="rounded-xl my-0.5 cursor-pointer">
                      <div className="flex items-center gap-3 py-0.5">
                        <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                          <BookOpen className="size-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.judul}</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-700">
                            {u.mapel}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedUjian && (
              <div className="mt-2 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-100">
                <CheckCircle2 className="size-3.5 text-teal-500 shrink-0" />
                <p className="text-xs text-teal-700">
                  Terpilih: <span className="font-bold">{selectedUjian.judul}</span>
                  <span className="mx-1 opacity-40">·</span>
                  <span className="font-semibold">{selectedUjian.mapel}</span>
                </p>
              </div>
            )}
          </div>

          {/* Tipe + Nomor + Bobot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Tipe */}
            <div>
              <FieldLabel icon={Layers} required iconClass="text-indigo-500">Tipe Soal</FieldLabel>
              <Select
                value={form.tipe}
                onValueChange={(v) => {
                  updateForm("tipe", v)
                  updateForm("kunciJawaban", "")
                }}
              >
                <SelectTrigger className="h-11 text-sm border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all rounded-xl font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={6} className="rounded-2xl border-slate-200 shadow-2xl z-50 p-1">
                  <SelectItem value="PILIHAN_GANDA" className="rounded-xl my-0.5 cursor-pointer">
                    <div className="flex items-center gap-2.5 py-0.5">
                      <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <CheckSquare className="size-3.5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-slate-800">Pilihan Ganda</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ESSAY" className="rounded-xl my-0.5 cursor-pointer">
                    <div className="flex items-center gap-2.5 py-0.5">
                      <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                        <PenLine className="size-3.5 text-violet-600" />
                      </div>
                      <span className="font-semibold text-slate-800">Essay</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nomor */}
            <div>
              <FieldLabel icon={Hash} iconClass="text-slate-400">Nomor Soal</FieldLabel>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <Input
                  type="number"
                  min={1}
                  placeholder="Auto"
                  value={form.nomor}
                  onChange={(e) => updateForm("nomor", e.target.value)}
                  className="h-11 text-sm pl-9 border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Bobot */}
            <div>
              <FieldLabel icon={Star} iconClass="text-amber-500">Bobot Nilai</FieldLabel>
              <div className="relative">
                <Award className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-amber-400" />
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.bobot}
                  onChange={(e) => updateForm("bobot", e.target.value)}
                  className="h-11 text-sm pl-9 border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all rounded-xl font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ════════════════════════════════════════
          SECTION 2 — Pertanyaan + Pilihan Jawaban
      ════════════════════════════════════════ */}
      <div className={`mt-4 grid gap-4 ${isPG ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

        {/* ── Pertanyaan ── */}
        <SectionCard
          headerBg="linear-gradient(105deg, #faf5ff 0%, #ffffff 100%)"
          icon={PenLine}
          iconBg="bg-violet-100"
          iconColor="text-violet-700"
          title="Pertanyaan"
          badge={
            isPG ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                <CheckSquare className="size-3" />
                Pilihan Ganda
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700">
                <PenLine className="size-3" />
                Essay
              </span>
            )
          }
        >
          <div className="space-y-2">
            <FieldLabel icon={PenLine} required iconClass="text-violet-500">Tulis Pertanyaan</FieldLabel>
            <Textarea
              placeholder="Tulis pertanyaan soal di sini dengan jelas dan terstruktur..."
              value={form.pertanyaan}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateForm("pertanyaan", e.target.value)
              }
              rows={isPG ? 11 : 6}
              className="text-sm resize-none border-slate-200 bg-slate-50 hover:bg-white hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all rounded-xl leading-relaxed font-medium placeholder:font-normal"
            />
            <div className="flex items-center justify-between pt-0.5">
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Lightbulb className="size-3 text-amber-400" />
                Gunakan bahasa yang jelas dan mudah dipahami
              </p>
              <span className={`text-[11px] tabular-nums font-semibold ${form.pertanyaan.length > 0 ? "text-teal-600" : "text-slate-400"}`}>
                {form.pertanyaan.length} karakter
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ── Pilihan Jawaban ── */}
        {isPG && (
          <SectionCard
            headerBg="linear-gradient(105deg, #f0fdf9 0%, #ffffff 100%)"
            icon={Target}
            iconBg="bg-teal-100"
            iconColor="text-teal-700"
            title="Pilihan Jawaban"
            badge={
              form.kunciJawaban ? (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  Kunci: Opsi {form.kunciJawaban}
                </span>
              ) : undefined
            }
          >
            <div className="space-y-3">
              {/* Hint */}
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50/80 border border-amber-100">
                <Lightbulb className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11.5px] text-amber-800 leading-relaxed">
                  Klik <strong>bulatan huruf</strong> untuk menjadikannya kunci jawaban.
                  Opsi <strong>A</strong> dan <strong>B</strong> wajib diisi.
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {OPSI_KEYS.map((key) => {
                  const isActive = form.kunciJawaban === key
                  const cfg = OPSI_CONFIG[key]
                  const isRequired = key === "A" || key === "B"

                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? `${cfg.rowActive} shadow-sm`
                          : "bg-slate-50/70 border-slate-100 hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      {/* Bubble selector */}
                      <button
                        type="button"
                        onClick={() => updateForm("kunciJawaban", key)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 ${
                          isActive
                            ? `${cfg.activeBg} shadow-md ${cfg.activeRing}`
                            : `bg-white border-2 border-slate-200 ${cfg.color} hover:border-current`
                        }`}
                        title={`Jadikan opsi ${key} kunci jawaban`}
                      >
                        {isActive ? <CheckCircle2 className="size-4" /> : key}
                      </button>

                      {/* Text input */}
                      <div className="flex-1 relative">
                        <Input
                          placeholder={`Opsi ${key}${isRequired ? " (wajib)" : " (opsional)"}`}
                          value={opsiValues[key]}
                          onChange={(e) =>
                            updateForm(`opsi${key}` as keyof typeof form, e.target.value)
                          }
                          className={`h-9 text-sm border-0 bg-white shadow-sm focus:ring-2 focus:ring-teal-100 rounded-lg transition-all ${
                            isActive ? "font-semibold pr-16" : ""
                          }`}
                        />
                        {isActive && (
                          <span className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.badge}`}>
                            Kunci
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </SectionCard>
        )}
      </div>

      {/* ════════════════════════════════════════
          SECTION 3 — Essay Key Answer
      ════════════════════════════════════════ */}
      {!isPG && (
        <div className="mt-4">
          <SectionCard
            headerBg="linear-gradient(105deg, #fffbeb 0%, #ffffff 100%)"
            icon={FileText}
            iconBg="bg-amber-100"
            iconColor="text-amber-700"
            title="Kunci Jawaban / Pedoman Penilaian"
          >
            <div className="space-y-2">
              <FieldLabel icon={PenLine} iconClass="text-amber-500">Isi Kunci Jawaban</FieldLabel>
              <Textarea
                placeholder="Tulis kunci jawaban atau pedoman penilaian untuk guru/admin..."
                value={form.kunciJawaban}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateForm("kunciJawaban", e.target.value)
                }
                rows={5}
                className="text-sm resize-none border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all rounded-xl leading-relaxed font-medium placeholder:font-normal"
              />
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <GraduationCap className="size-3 text-teal-400" />
                Kunci jawaban hanya terlihat oleh admin dan guru
              </p>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ════════════════════════════════════════
          STICKY ACTION BAR
      ════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 z-50 p-3 sm:p-4">
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-200/80"
          style={{
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
          }}
        >
          {/* Cancel */}
          <Link href="/admin/soal">
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl h-10 px-4 font-semibold gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Batal
            </Button>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Save & continue */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={isPending || ujianList.length === 0}
              className="h-10 px-4 rounded-xl border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 font-semibold text-xs sm:text-sm gap-1.5 transition-all"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <PlusCircle className="size-3.5" />
              )}
              <span className="hidden sm:inline">Simpan &amp; Tambah Lagi</span>
              <span className="sm:hidden">Tambah Lagi</span>
            </Button>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isPending || ujianList.length === 0}
              className="flex items-center gap-1.5 h-10 px-5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                boxShadow: "0 4px 16px rgba(13,148,136,0.38)",
              }}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? "Menyimpan..." : "Simpan Soal"}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-2" />
    </div>
  )
}