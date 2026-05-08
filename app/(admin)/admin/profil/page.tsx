"use client"

import { useEffect, useState, useRef } from "react"
import { useUserStore } from "@/store/userStore"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import {
  UserCircle2,
  Mail,
  Hash,
  GraduationCap,
  Camera,
  SaveAll,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BookMarked,
  BarChart3,
  BadgeCheck,
  PencilLine,
  X,
  Loader2,
  CalendarDays,
  Fingerprint,
  LockKeyhole,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

type UserRole = "SISWA" | "GURU" | "ADMIN"
type AlertType = "success" | "error" | null

interface FormData {
  nama: string
  email: string
  nis: string
  kelas: string
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; ring: string }> = {
  ADMIN: { label: "Administrator", color: "text-rose-600", bg: "bg-rose-50 border-rose-200", ring: "ring-rose-400/30" },
  GURU: { label: "Guru", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", ring: "ring-blue-400/30" },
  SISWA: { label: "Siswa", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", ring: "ring-emerald-400/30" },
}

function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]/50">
      <div className="flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon size={16} className={iconColor} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] leading-tight">{title}</h3>
          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function InputField({
  icon: Icon,
  name,
  value,
  type = "text",
  placeholder,
  disabled,
  editing,
  onChange,
}: {
  icon: React.ElementType
  name: string
  value: string
  type?: string
  placeholder?: string
  disabled?: boolean
  editing?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const active = editing && !disabled
  return (
    <div className="relative flex items-center group">
      <span
        className={cn(
          "absolute left-3 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 pointer-events-none z-10",
          active ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-transparent text-[var(--muted-foreground)]/60"
        )}
      >
        <Icon size={14} />
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || !editing}
        placeholder={placeholder}
        className={cn(
          "w-full pl-12 pr-4 py-3 rounded-xl text-[13px] font-medium border transition-all duration-200 outline-none",
          active
            ? "border-[var(--primary)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40"
            : "border-[var(--border)]/50 bg-[var(--muted)]/40 text-[var(--foreground)]/60 cursor-default select-none"
        )}
      />
    </div>
  )
}

function AlertBanner({ type, msg, onClose }: { type: AlertType; msg: string; onClose: () => void }) {
  if (!type) return null
  const isSuccess = type === "success"
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium",
        isSuccess
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-700"
      )}
    >
      {isSuccess ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertCircle size={15} className="shrink-0" />}
      <span className="flex-1 leading-snug">{msg}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  )
}

function AvatarSection({
  initials,
  fotoProfil,
  nama,
  role,
  kelas,
  email,
  onUpload,
}: {
  initials: string
  fotoProfil?: string | null
  nama: string
  role: string
  kelas?: string
  email?: string
  onUpload: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [upError, setUpError] = useState<string | null>(null)

  const cfg = ROLE_CONFIG[role as UserRole] ?? ROLE_CONFIG.SISWA

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setUpError("Format tidak didukung. Gunakan JPG, PNG, atau WEBP.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUpError("Ukuran file maksimal 2MB.")
      return
    }

    setUpError(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append("foto", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Upload gagal")
      setPreview(null)
      onUpload(json.fotoUrl)
    } catch (err: any) {
      setUpError(err.message)
      setPreview(null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const displayFoto = preview ?? fotoProfil

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div
        className="w-28 h-28 rounded-full p-[3px] shadow-xl"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, #0d9488 50%, #99f6e4 100%)" }}
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-[var(--card)] flex items-center justify-center">
          {displayFoto ? (
            <Image src={displayFoto} alt={nama} width={112} height={112} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-black text-white select-none" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.25)" }}>
              {initials}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full flex items-center justify-center border-2 border-[var(--card)] shadow-lg transition-all active:scale-90 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, var(--primary), #0d9488)" }}
      >
        {uploading ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFile} />

      <div className="text-center md:text-left space-y-1.5">
        <h2 className="text-lg font-black text-white leading-tight drop-shadow-sm">{nama}</h2>
        {email && <p className="text-[11px] text-white/65 font-medium">{email}</p>}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border text-white/90 bg-white/15 border-white/25 backdrop-blur-sm">
            <BadgeCheck size={10} />
            {cfg.label}
          </span>
          {kelas && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white/75 bg-white/10 border border-white/20">
              <GraduationCap size={9} />
              {kelas}
            </span>
          )}
        </div>
      </div>

      {upError && (
        <p className="text-[11px] text-red-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-center">{upError}</p>
      )}
    </div>
  )
}

export default function AdminProfilPage() {
  const { data: session } = useSession()
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser)
  const updateUser = useUserStore((s) => s.updateUser)

  const [editing, setEditing] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [profileAlert, setProfileAlert] = useState<{ type: AlertType; msg: string }>({ type: null, msg: "" })
  const [form, setForm] = useState<FormData>({ nama: "", email: "", nis: "", kelas: "" })

  // Check auth
  if (session && !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  useEffect(() => {
    if (!user) {
      fetch("/api/auth/me", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) setUser(d) })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (user) {
      setForm({
        nama: user.nama ?? "",
        email: user.email ?? "",
        nis: user.nis ?? "",
        kelas: user.kelas ?? "",
      })
    }
  }, [user])

  const initials = user
    ? user.nama.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSaveProfil = async () => {
    setLoadingSave(true)
    setProfileAlert({ type: null, msg: "" })
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Gagal menyimpan profil")
      updateUser(form)
      setEditing(false)
      setProfileAlert({ type: "success", msg: "Profil berhasil diperbarui!" })
    } catch (err: any) {
      setProfileAlert({ type: "error", msg: err.message ?? "Terjadi kesalahan" })
    } finally {
      setLoadingSave(false)
    }
  }

  const stats = [
    { label: "Ujian", value: "–", icon: BookMarked },
    { label: "Rata-rata", value: "–", icon: BarChart3 },
    { label: "NIS", value: user?.nis ?? "–", icon: Hash },
  ]

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Hero Card */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(145deg, var(--primary) 0%, #0d9488 55%, #0f766e 100%)",
          boxShadow: "0 20px 60px -12px rgba(20,184,166,0.35)",
        }}
      >
        <div className="relative px-6 pt-7 pb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <AvatarSection
            initials={initials}
            fotoProfil={user?.fotoProfil}
            nama={user?.nama ?? "Memuat..."}
            role={user?.role ?? "ADMIN"}
            kelas={user?.kelas}
            email={user?.email}
            onUpload={(url) => updateUser({ fotoProfil: url })}
          />

          <div className="flex-1 w-full md:pt-3 md:self-end pb-1">
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 px-2 text-center border border-white/20"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <Icon size={15} className="text-white/60" />
                    <span className="text-xl font-black text-white leading-none">{s.value}</span>
                    <span className="text-[9px] font-bold text-white/55 uppercase">{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Pribadi */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <SectionHeader
          icon={UserCircle2}
          iconBg="bg-[var(--primary)]/10"
          iconColor="text-[var(--primary)]"
          title="Informasi Pribadi"
          subtitle="Kelola data profil Anda"
        >
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false)
                    if (user) setForm({ nama: user.nama, email: user.email, nis: user.nis ?? "", kelas: user.kelas ?? "" })
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfil}
                  disabled={loadingSave}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {loadingSave ? <Loader2 size={12} className="animate-spin inline" /> : "Simpan"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors flex items-center gap-1.5"
              >
                <PencilLine size={12} />
                Edit
              </button>
            )}
          </div>
        </SectionHeader>

        {profileAlert.type && <div className="px-6 pt-4"><AlertBanner {...profileAlert} onClose={() => setProfileAlert({ type: null, msg: "" })} /></div>}

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] mb-1.5">Nama</label>
            <InputField icon={UserCircle2} name="nama" value={form.nama} editing={editing} onChange={handleFormChange} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] mb-1.5">Email</label>
            <InputField icon={Mail} name="email" value={form.email} type="email" editing={editing} onChange={handleFormChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] mb-1.5">NIS</label>
              <InputField icon={Hash} name="nis" value={form.nis} editing={editing} onChange={handleFormChange} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] mb-1.5">Kelas</label>
              <InputField icon={GraduationCap} name="kelas" value={form.kelas} editing={editing} onChange={handleFormChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
