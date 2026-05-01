"use client"

import { useState, useRef } from "react"
import { useUserStore } from "@/store/userStore"
import {
  User,
  Hash,
  BookOpen,
  CheckCircle2,
  Loader2,
  Camera,
  X,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import Image from "next/image"

// ── Tipe Role union literal — konsisten dengan userStore ────────
type UserRole = "SISWA" | "GURU" | "ADMIN"

interface ProfilData {
  id: string
  nama: string
  email: string
  role: UserRole
  nis?: string | null
  kelas?: string | null
  fotoProfil?: string | null
  createdAt: string
}

interface ProfilCardProps {
  user: ProfilData
  onUpdate: (data: Partial<ProfilData>) => void
}

function getInitials(nama: string) {
  return nama.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function getRoleColor(role: UserRole) {
  const map: Record<UserRole, string> = {
    ADMIN: "bg-red-100 text-red-700 border-red-200",
    GURU:  "bg-blue-100 text-blue-700 border-blue-200",
    SISWA: "bg-emerald-100 text-emerald-700 border-emerald-200",
  }
  return map[role] ?? "bg-gray-100 text-gray-700"
}

function getRoleLabel(role: UserRole) {
  const map: Record<UserRole, string> = {
    ADMIN: "Administrator",
    GURU:  "Guru",
    SISWA: "Siswa",
  }
  return map[role] ?? role
}

export function ProfilCard({ user, onUpdate }: ProfilCardProps) {
  const setUser = useUserStore((s) => s.setUser)

  // ── State form profil ────────────────────────────────────────
  const [nama,    setNama]    = useState(user.nama)
  const [nis,     setNis]     = useState(user.nis ?? "")
  const [kelas,   setKelas]   = useState(user.kelas ?? "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ── State foto profil ────────────────────────────────────────
  const [fotoUrl,       setFotoUrl]       = useState<string | null>(user.fotoProfil ?? null)
  const [fotoPreview,   setFotoPreview]   = useState<string | null>(null)
  const [fotoFile,      setFotoFile]      = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError,   setUploadError]   = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Ref ke <input type="file"> tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isDirty =
    nama  !== user.nama       ||
    nis   !== (user.nis   ?? "") ||
    kelas !== (user.kelas ?? "")

  // ── Pilih file dari device ───────────────────────────────────
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi sisi client sebelum upload
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Format tidak didukung. Gunakan JPG, PNG, atau WEBP.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 2MB.")
      return
    }

    setUploadError(null)
    setFotoFile(file)

    // Tampilkan preview lokal sebelum upload
    const objectUrl = URL.createObjectURL(file)
    setFotoPreview(objectUrl)
  }

  // ── Upload foto ke server ────────────────────────────────────
  const handleUploadFoto = async () => {
    if (!fotoFile) return

    setUploadLoading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append("foto", fotoFile)

      const res  = await fetch("/api/upload", {
        method: "POST",
        body:   formData,
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error ?? "Gagal mengunggah foto")

      // Simpan URL baru dari server
      setFotoUrl(json.fotoUrl)
      setFotoPreview(null)
      setFotoFile(null)
      setUploadSuccess(true)

      // Beritahu parent komponen
      onUpdate({ fotoProfil: json.fotoUrl })

      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (e: any) {
      setUploadError(e.message)
    } finally {
      setUploadLoading(false)
      // Reset input agar file yang sama bisa dipilih ulang
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ── Batal preview (buang pilihan file) ──────────────────────
  const handleBatalFoto = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    setFotoPreview(null)
    setFotoFile(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Simpan perubahan profil (nama/nis/kelas) ─────────────────
  const handleSave = async () => {
    if (!isDirty) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/pengaturan", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_profil",
          data:   { nama, nis: nis || undefined, kelas: kelas || undefined },
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan")

      setSuccess(true)
      onUpdate(json.user)

      // Sync ke global store — user.role sudah UserRole, aman
      setUser({
        id:    user.id,
        nama:  json.user.nama,
        email: user.email,
        role:  user.role,
      })

      setTimeout(() => setSuccess(false), 2500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Foto yang ditampilkan: preview lokal > URL tersimpan > null (inisial)
  const displayFoto = fotoPreview ?? fotoUrl

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  "var(--card)",
        borderColor: "var(--border)",
        boxShadow:   "var(--shadow-card)",
      }}
    >
      {/* ── Header gradient ──────────────────────────────────── */}
      <div
        className="relative h-24 md:h-28"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 left-1/3 w-20 h-20 rounded-full bg-white/8" />
      </div>

      <div className="px-5 md:px-6">
        {/* ── Avatar + tombol kamera ─────────────────────────── */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="relative">
            {/* Avatar — tampilkan foto jika ada, atau inisial */}
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white font-bold text-2xl border-4 border-[var(--card)] shadow-lg"
              style={{
                background: displayFoto ? "var(--muted)" : "var(--gradient-card)",
              }}
            >
              {displayFoto ? (
                <Image
                  src={displayFoto}
                  alt="Foto profil"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  // blob: URL dari preview lokal tidak perlu dioptimasi Next.js
                  unoptimized={displayFoto.startsWith("blob:")}
                />
              ) : (
                getInitials(user.nama)
              )}
            </div>

            {/* Tombol kamera — klik membuka file picker */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              title="Ganti foto profil"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--primary)" }}
            >
              {uploadLoading
                ? <Loader2 size={12} className="animate-spin" />
                : <Camera size={13} strokeWidth={2.5} />
              }
            </button>

            {/* Input file tersembunyi */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>

          <div
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border",
              getRoleColor(user.role)
            )}
          >
            {getRoleLabel(user.role)}
          </div>
        </div>

        {/* ── Action bar preview foto ────────────────────────── */}
        {fotoPreview && (
          <div
            className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl border"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            <ImageIcon size={14} style={{ color: "var(--primary)" }} className="flex-shrink-0" />
            <span
              className="text-xs flex-1 truncate"
              style={{ color: "var(--muted-foreground)" }}
            >
              {fotoFile?.name}
            </span>

            {/* Tombol batal */}
            <button
              type="button"
              onClick={handleBatalFoto}
              title="Batal"
              className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X size={13} className="text-red-500" />
            </button>

            {/* Tombol simpan foto */}
            <Button
              type="button"
              onClick={handleUploadFoto}
              disabled={uploadLoading}
              className="h-7 px-3 rounded-lg text-xs font-semibold text-white flex-shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              {uploadLoading ? (
                <><Loader2 size={11} className="animate-spin mr-1.5" />Mengunggah...</>
              ) : (
                "Simpan Foto"
              )}
            </Button>
          </div>
        )}

        {/* ── Notifikasi upload berhasil ─────────────────────── */}
        {uploadSuccess && !fotoPreview && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
            <span className="text-xs text-emerald-600 font-medium">
              Foto profil berhasil diperbarui!
            </span>
          </div>
        )}

        {/* ── Error upload ───────────────────────────────────── */}
        {uploadError && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100 mb-4">
            {uploadError}
          </p>
        )}

        {/* ── Nama & email ───────────────────────────────────── */}
        <div className="mb-5">
          <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
            {user.nama}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {user.email}
          </p>
        </div>

        {/* ── Form fields ────────────────────────────────────── */}
        <div className="space-y-4 pb-5 md:pb-6">

          {/* Nama */}
          <div className="space-y-1.5">
            <Label
              className="text-xs font-semibold flex items-center gap-1.5"
              style={{ color: "var(--foreground)" }}
            >
              <User size={12} style={{ color: "var(--primary)" }} />
              Nama Lengkap
            </Label>
            <Input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="h-10 text-sm rounded-xl border-[var(--border)] bg-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="Nama lengkap"
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-1.5">
            <Label
              className="text-xs font-semibold"
              style={{ color: "var(--muted-foreground)" }}
            >
              Email
            </Label>
            <div
              className="flex items-center h-10 px-3 rounded-xl text-sm"
              style={{
                background: "var(--accent)",
                color:      "var(--muted-foreground)",
                border:     "1px solid var(--border)",
              }}
            >
              {user.email}
              <span
                className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-lg"
                style={{ background: "var(--border)", color: "var(--muted-foreground)" }}
              >
                Tidak dapat diubah
              </span>
            </div>
          </div>

          {/* NIS + Kelas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                className="text-xs font-semibold flex items-center gap-1.5"
                style={{ color: "var(--foreground)" }}
              >
                <Hash size={12} style={{ color: "var(--primary)" }} />
                NIS
              </Label>
              <Input
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="h-10 text-sm rounded-xl border-[var(--border)] bg-[var(--muted)]"
                placeholder="Nomor Induk"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                className="text-xs font-semibold flex items-center gap-1.5"
                style={{ color: "var(--foreground)" }}
              >
                <BookOpen size={12} style={{ color: "var(--primary)" }} />
                Kelas
              </Label>
              <Input
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="h-10 text-sm rounded-xl border-[var(--border)] bg-[var(--muted)]"
                placeholder="XII IPA 1"
              />
            </div>
          </div>

          {/* Error simpan profil */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          {/* Tombol simpan profil */}
          <Button
            onClick={handleSave}
            disabled={!isDirty || loading}
            className={cn(
              "w-full h-10 rounded-xl text-sm font-semibold transition-all",
              success
                ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                : "text-white"
            )}
            style={
              !success
                ? {
                    background: "var(--gradient-primary)",
                    boxShadow:  isDirty ? "var(--shadow-primary)" : "none",
                  }
                : {}
            }
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin mr-2" />
            ) : success ? (
              <CheckCircle2 size={15} className="mr-2" />
            ) : null}
            {loading ? "Menyimpan..." : success ? "Tersimpan!" : "Simpan Perubahan"}
          </Button>
        </div>
      </div>
    </div>
  )
}