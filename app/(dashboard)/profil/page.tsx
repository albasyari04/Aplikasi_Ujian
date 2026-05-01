"use client"

import { useEffect, useState, useRef } from "react"
import { useUserStore } from "@/store/userStore"
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

// ─── Types ────────────────────────────────────────────────────
type UserRole   = "SISWA" | "GURU" | "ADMIN"
type AlertType  = "success" | "error" | null

interface FormData {
  nama:  string
  email: string
  nis:   string
  kelas: string
}

interface PasswordData {
  passwordLama:    string
  passwordBaru:    string
  confirmPassword: string
}

// ─── Role config ──────────────────────────────────────────────
const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; ring: string }> = {
  ADMIN: {
    label: "Administrator",
    color: "text-rose-600",
    bg:    "bg-rose-50 border-rose-200",
    ring:  "ring-rose-400/30",
  },
  GURU: {
    label: "Guru",
    color: "text-blue-600",
    bg:    "bg-blue-50 border-blue-200",
    ring:  "ring-blue-400/30",
  },
  SISWA: {
    label: "Siswa",
    color: "text-emerald-600",
    bg:    "bg-emerald-50 border-emerald-200",
    ring:  "ring-emerald-400/30",
  },
}

// ─── Sub-components ───────────────────────────────────────────

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] mb-1.5 ml-0.5">
      {children}
    </label>
  )
}

function InputField({
  icon: Icon,
  iconActive,
  name,
  value,
  type = "text",
  placeholder,
  disabled,
  editing,
  onChange,
  suffix,
}: {
  icon: React.ElementType
  iconActive?: boolean
  name: string
  value: string
  type?: string
  placeholder?: string
  disabled?: boolean
  editing?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  suffix?: React.ReactNode
}) {
  const active = editing && !disabled
  return (
    <div className="relative flex items-center group">
      <span
        className={cn(
          "absolute left-3 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 pointer-events-none z-10",
          active
            ? "bg-[var(--primary)]/10 text-[var(--primary)]"
            : "bg-transparent text-[var(--muted-foreground)]/60"
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
            : "border-[var(--border)]/50 bg-[var(--muted)]/40 text-[var(--foreground)]/60 cursor-default select-none",
          suffix ? "pr-10" : ""
        )}
      />
      {suffix && (
        <span className="absolute right-3.5 text-[var(--muted-foreground)] z-10">{suffix}</span>
      )}
    </div>
  )
}

function PasswordInputField({
  name,
  value,
  show,
  placeholder,
  onChange,
  onToggle,
}: {
  name: string
  value: string
  show: boolean
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onToggle: () => void
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] pointer-events-none z-10">
        <LockKeyhole size={14} />
      </span>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-11 py-3 rounded-xl text-[13px] font-medium border border-[var(--primary)]/30 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 bg-[var(--card)] text-[var(--foreground)] outline-none transition-all duration-200 placeholder:text-[var(--muted-foreground)]/40"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors z-10"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

function AlertBanner({ type, message, onClose }: { type: AlertType; message: string; onClose: () => void }) {
  if (!type) return null
  const isSuccess = type === "success"
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium",
        isSuccess
          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-400"
          : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-400"
      )}
    >
      {isSuccess
        ? <CheckCircle2 size={15} className="shrink-0" />
        : <AlertCircle    size={15} className="shrink-0" />
      }
      <span className="flex-1 leading-snug">{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </div>
  )
}

// Password strength
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const len      = password.length
  const strength = len < 6 ? 1 : len < 8 ? 2 : len < 12 ? 3 : 4
  const labels   = ["", "Terlalu pendek", "Lemah", "Cukup kuat", "Sangat kuat"]
  const colors   = ["", "#ef4444", "#f97316", "#10b981", "#14b8a6"]
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="h-1 flex-1 rounded-full transition-all duration-400"
            style={{ background: lvl <= strength ? colors[strength] : "var(--border)" }}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </div>
  )
}

// ─── Avatar Section ───────────────────────────────────────────
function AvatarSection({
  initials,
  fotoProfil,
  nama,
  role,
  kelas,
  email,
  onUpload,
}: {
  initials:   string
  fotoProfil?: string | null
  nama:       string
  role:       string
  kelas?:     string
  email?:     string
  onUpload:   (url: string) => void
}) {
  const inputRef             = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [upError,   setUpError]   = useState<string | null>(null)

  const cfg = ROLE_CONFIG[role as UserRole] ?? ROLE_CONFIG.SISWA

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg","image/jpg","image/png","image/webp"].includes(file.type)) {
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
      const res  = await fetch("/api/upload", { method: "POST", body: fd })
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
      {/* Avatar ring */}
      <div className="relative">
        <div
          className="w-28 h-28 rounded-full p-[3px] shadow-xl"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, #0d9488 50%, #99f6e4 100%)",
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[var(--card)] flex items-center justify-center">
            {displayFoto ? (
              <Image
                src={displayFoto}
                alt={nama}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                unoptimized={displayFoto.startsWith("blob:")}
              />
            ) : (
              <span
                className="text-2xl font-black text-white select-none"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.25)" }}
              >
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* Camera button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Ganti foto profil"
          className="absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full flex items-center justify-center border-2 border-[var(--card)] shadow-lg transition-all active:scale-90 hover:brightness-110 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--primary), #0d9488)" }}
        >
          {uploading
            ? <Loader2 size={14} className="text-white animate-spin" />
            : <Camera  size={14} className="text-white" />
          }
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleFile} />
      </div>

      {/* Name + role badge */}
      <div className="text-center md:text-left space-y-1.5">
        <h2 className="text-lg font-black text-white leading-tight drop-shadow-sm">{nama}</h2>
        {email && (
          <p className="text-[11px] text-white/65 font-medium">{email}</p>
        )}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border text-white/90 bg-white/15 border-white/25 backdrop-blur-sm"
          >
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

      {/* Upload error */}
      {upError && (
        <p className="text-[11px] text-red-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-center">
          {upError}
        </p>
      )}
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function ProfilPage() {
  const user      = useUserStore((s) => s.user)
  const setUser   = useUserStore((s) => s.setUser)
  const updateUser= useUserStore((s) => s.updateUser)

  const [editing,      setEditing]      = useState(false)
  const [loadingSave,  setLoadingSave]  = useState(false)
  const [loadingPwd,   setLoadingPwd]   = useState(false)
  const [profileAlert, setProfileAlert] = useState<{ type: AlertType; msg: string }>({ type: null, msg: "" })
  const [pwdAlert,     setPwdAlert]     = useState<{ type: AlertType; msg: string }>({ type: null, msg: "" })
  const [showPwd, setShowPwd] = useState({ lama: false, baru: false, confirm: false })

  const [form, setForm] = useState<FormData>({ nama: "", email: "", nis: "", kelas: "" })
  const [pwdForm, setPwdForm] = useState<PasswordData>({
    passwordLama: "", passwordBaru: "", confirmPassword: "",
  })

  // Fetch user jika belum ada di store
  useEffect(() => {
    if (!user) {
      fetch("/api/auth/me", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) setUser(d) })
        .catch(() => {})
    }
  }, [])

  // Sync form saat user load
  useEffect(() => {
    if (user) {
      setForm({
        nama:  user.nama  ?? "",
        email: user.email ?? "",
        nis:   user.nis   ?? "",
        kelas: user.kelas ?? "",
      })
    }
  }, [user])

  const initials = user
    ? user.nama.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwdForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSaveProfil = async () => {
    setLoadingSave(true)
    setProfileAlert({ type: null, msg: "" })
    try {
      const res  = await fetch("/api/profil", {
        method:  "PATCH",
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.passwordBaru !== pwdForm.confirmPassword) {
      setPwdAlert({ type: "error", msg: "Konfirmasi password tidak cocok" })
      return
    }
    if (pwdForm.passwordBaru.length < 6) {
      setPwdAlert({ type: "error", msg: "Password baru minimal 6 karakter" })
      return
    }
    setLoadingPwd(true)
    setPwdAlert({ type: null, msg: "" })
    try {
      const res  = await fetch("/api/profil/password", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(pwdForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Gagal mengubah password")
      setPwdAlert({ type: "success", msg: "Password berhasil diubah!" })
      setPwdForm({ passwordLama: "", passwordBaru: "", confirmPassword: "" })
    } catch (err: any) {
      setPwdAlert({ type: "error", msg: err.message ?? "Terjadi kesalahan" })
    } finally {
      setLoadingPwd(false)
    }
  }

  const stats = [
    { label: "Ujian Diikuti",   value: "–", icon: BookMarked  },
    { label: "Rata-rata Nilai", value: "–", icon: BarChart3    },
    { label: "NIS",             value: user?.nis ?? "–", icon: Hash },
  ]

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "–"

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ══════════════════════════════════════════════════
          HERO CARD — avatar + stats
      ══════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(145deg, var(--primary) 0%, #0d9488 55%, #0f766e 100%)",
          boxShadow: "0 20px 60px -12px rgba(20,184,166,0.35)",
        }}
      >
        {/* Subtle mesh background */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }} />
        <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07), transparent 70%)" }} />

        <div className="relative px-6 pt-7 pb-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <AvatarSection
            initials={initials}
            fotoProfil={user?.fotoProfil}
            nama={user?.nama ?? "Memuat..."}
            role={user?.role ?? "SISWA"}
            kelas={user?.kelas}
            email={user?.email}
            onUpload={(url) => updateUser({ fotoProfil: url })}
          />

          {/* Stats */}
          <div className="flex-1 w-full md:pt-3 md:self-end pb-1">
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-4 px-2 text-center border border-white/20 backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <Icon size={15} className="text-white/60" />
                    <span className="text-xl font-black text-white leading-none tracking-tight">
                      {s.value}
                    </span>
                    <span className="text-[9px] font-bold text-white/55 uppercase tracking-widest leading-tight">
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          INFORMASI PRIBADI
      ══════════════════════════════════════════════════ */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{
          background:   "var(--card)",
          borderColor:  "var(--border)",
          boxShadow:    "0 1px 20px rgba(0,0,0,0.06)",
        }}
      >
        <SectionHeader
          icon={UserCircle2}
          iconBg="bg-[var(--primary)]/10"
          iconColor="text-[var(--primary)]"
          title="Informasi Pribadi"
          subtitle="Kelola data profil Anda"
        >
          {/* Edit / Save / Cancel buttons */}
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false)
                    if (user) setForm({ nama: user.nama, email: user.email, nis: user.nis ?? "", kelas: user.kelas ?? "" })
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all hover:bg-[var(--accent)] active:scale-95"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  <X size={12} /> Batal
                </button>
                <button
                  onClick={handleSaveProfil}
                  disabled={loadingSave}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, var(--primary), #0d9488)" }}
                >
                  {loadingSave
                    ? <Loader2 size={12} className="animate-spin" />
                    : <SaveAll size={12} />
                  }
                  {loadingSave ? "Menyimpan..." : "Simpan"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border transition-all active:scale-95 hover:shadow-sm"
                style={{
                  borderColor: "var(--primary)/40",
                  color:       "var(--primary)",
                  background:  "var(--primary)/5",
                }}
              >
                <PencilLine size={12} /> Edit Profil
              </button>
            )}
          </div>
        </SectionHeader>

        <div className="p-6 space-y-5">
          {profileAlert.type && (
            <AlertBanner
              type={profileAlert.type}
              message={profileAlert.msg}
              onClose={() => setProfileAlert({ type: null, msg: "" })}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Nama */}
            <div>
              <FieldLabel>Nama Lengkap</FieldLabel>
              <InputField
                icon={UserCircle2}
                name="nama"
                value={form.nama}
                placeholder="Masukkan nama lengkap"
                editing={editing}
                onChange={handleFormChange}
              />
            </div>

            {/* Email */}
            <div>
              <FieldLabel>Alamat Email</FieldLabel>
              <InputField
                icon={Mail}
                name="email"
                type="email"
                value={form.email}
                placeholder="email@sekolah.com"
                editing={editing}
                onChange={handleFormChange}
              />
            </div>

            {/* NIS */}
            <div>
              <FieldLabel>NIS (Nomor Induk Siswa)</FieldLabel>
              <InputField
                icon={Hash}
                name="nis"
                value={form.nis}
                placeholder="Contoh: 2024001"
                editing={editing}
                onChange={handleFormChange}
              />
            </div>

            {/* Kelas */}
            <div>
              <FieldLabel>Kelas</FieldLabel>
              <InputField
                icon={GraduationCap}
                name="kelas"
                value={form.kelas}
                placeholder="Contoh: XII IPA 1"
                editing={editing}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {/* Role — readonly */}
          <div>
            <FieldLabel>Peran Akun</FieldLabel>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ background: "var(--muted)/40", borderColor: "var(--border)/50" }}
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--primary)]/10">
                <ShieldCheck size={14} style={{ color: "var(--primary)" }} />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-[var(--foreground)]">
                  {ROLE_CONFIG[user?.role as UserRole]?.label ?? "Siswa"}
                </p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">Tidak dapat diubah sendiri</p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wide",
                  ROLE_CONFIG[user?.role as UserRole]?.bg ?? "bg-emerald-50 border-emerald-200",
                  ROLE_CONFIG[user?.role as UserRole]?.color ?? "text-emerald-600"
                )}
              >
                {user?.role ?? "SISWA"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          KEAMANAN AKUN — ganti password
      ══════════════════════════════════════════════════ */}
      <div
        className="rounded-3xl border overflow-hidden"
        style={{
          background:  "var(--card)",
          borderColor: "var(--border)",
          boxShadow:   "0 1px 20px rgba(0,0,0,0.06)",
        }}
      >
        <SectionHeader
          icon={KeyRound}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
          title="Keamanan Akun"
          subtitle="Ubah password untuk menjaga keamanan akun"
        />

        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          {pwdAlert.type && (
            <AlertBanner
              type={pwdAlert.type}
              message={pwdAlert.msg}
              onClose={() => setPwdAlert({ type: null, msg: "" })}
            />
          )}

          <div>
            <FieldLabel>Password Saat Ini</FieldLabel>
            <PasswordInputField
              name="passwordLama"
              value={pwdForm.passwordLama}
              show={showPwd.lama}
              placeholder="Masukkan password lama"
              onChange={handlePwdChange}
              onToggle={() => setShowPwd((s) => ({ ...s, lama: !s.lama }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Password Baru</FieldLabel>
              <PasswordInputField
                name="passwordBaru"
                value={pwdForm.passwordBaru}
                show={showPwd.baru}
                placeholder="Min. 6 karakter"
                onChange={handlePwdChange}
                onToggle={() => setShowPwd((s) => ({ ...s, baru: !s.baru }))}
              />
            </div>
            <div>
              <FieldLabel>Konfirmasi Password Baru</FieldLabel>
              <PasswordInputField
                name="confirmPassword"
                value={pwdForm.confirmPassword}
                show={showPwd.confirm}
                placeholder="Ulangi password baru"
                onChange={handlePwdChange}
                onToggle={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))}
              />
            </div>
          </div>

          {/* Strength meter */}
          <PasswordStrength password={pwdForm.passwordBaru} />

          <div className="pt-1 flex items-center gap-3">
            <button
              type="submit"
              disabled={
                loadingPwd ||
                !pwdForm.passwordLama ||
                !pwdForm.passwordBaru ||
                !pwdForm.confirmPassword
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
            >
              {loadingPwd
                ? <Loader2 size={14} className="animate-spin" />
                : <Fingerprint size={14} />
              }
              {loadingPwd ? "Mengubah..." : "Ubah Password"}
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════
          FOOTER INFO AKUN
      ══════════════════════════════════════════════════ */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border"
        style={{
          background:   "var(--muted)/30",
          borderColor:  "var(--border)/50",
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--primary)/10" }}
        >
          <CalendarDays size={14} style={{ color: "var(--primary)" }} />
        </div>
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Akun terdaftar sejak{" "}
          <span className="font-bold text-[var(--foreground)]">{joinDate}</span>
          {" "}· Data Anda dijaga keamanannya oleh sistem SMA Al-Istiqomah.
        </p>
      </div>

    </div>
  )
}