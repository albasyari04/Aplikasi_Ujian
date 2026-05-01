"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon?: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <Label
        className="text-xs font-semibold flex items-center gap-1.5"
        style={{ color: "var(--foreground)" }}
      >
        {icon}
        {label}
      </Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 text-sm rounded-xl pr-10 border-[var(--border)] bg-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}

// Strength meter
function StrengthMeter({ password }: { password: string }) {
  const checks = [
    { label: "Min. 8 karakter", ok: password.length >= 8 },
    { label: "Huruf besar", ok: /[A-Z]/.test(password) },
    { label: "Huruf kecil", ok: /[a-z]/.test(password) },
    { label: "Angka", ok: /[0-9]/.test(password) },
    { label: "Simbol", ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const label  = ["", "Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][score]
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"]

  if (!password) return null

  return (
    <div className="space-y-2 p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          Kekuatan Password
        </span>
        <span className="text-[11px] font-bold" style={{ color: colors[score] }}>
          {label}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : "var(--border)" }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 mt-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: c.ok ? "#10b98120" : "var(--border)" }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: c.ok ? "#10b981" : "var(--muted-foreground)" }}
              />
            </div>
            <span className="text-[10px]" style={{ color: c.ok ? "var(--foreground)" : "var(--muted-foreground)" }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PasswordCard() {
  const [passwordLama, setPasswordLama]   = useState("")
  const [passwordBaru, setPasswordBaru]   = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const mismatch = confirmPassword.length > 0 && passwordBaru !== confirmPassword
  const canSubmit = passwordLama.length >= 6 && passwordBaru.length >= 8 && !mismatch

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/pengaturan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          data: { passwordLama, passwordBaru, confirmPassword },
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Gagal mengubah password")

      setSuccess(true)
      setPasswordLama("")
      setPasswordBaru("")
      setConfirmPassword("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 md:px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <ShieldCheck size={17} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            Ubah Password
          </h3>
          <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Gunakan password yang kuat dan unik
          </p>
        </div>
      </div>

      <div className="px-5 md:px-6 py-5 space-y-4">
        <PasswordInput
          label="Password Saat Ini"
          value={passwordLama}
          onChange={setPasswordLama}
          placeholder="Masukkan password lama"
          icon={<Lock size={12} style={{ color: "var(--primary)" }} />}
        />

        <PasswordInput
          label="Password Baru"
          value={passwordBaru}
          onChange={setPasswordBaru}
          placeholder="Min. 8 karakter"
          icon={<Lock size={12} style={{ color: "var(--primary)" }} />}
        />

        {passwordBaru && <StrengthMeter password={passwordBaru} />}

        <div className="space-y-1.5">
          <Label
            className="text-xs font-semibold flex items-center gap-1.5"
            style={{ color: "var(--foreground)" }}
          >
            <Lock size={12} style={{ color: "var(--primary)" }} />
            Konfirmasi Password Baru
          </Label>
          <div className="relative">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "h-10 text-sm rounded-xl border-[var(--border)] bg-[var(--muted)]",
                mismatch && "border-red-400 focus:border-red-400"
              )}
              placeholder="Ulangi password baru"
            />
          </div>
          {mismatch && (
            <p className="text-[11px] flex items-center gap-1 text-red-500">
              <AlertTriangle size={11} /> Password tidak cocok
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
            {error}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={cn(
            "w-full h-10 rounded-xl text-sm font-semibold text-white transition-all",
            success ? "bg-emerald-500 hover:bg-emerald-500" : ""
          )}
          style={!success ? { background: canSubmit ? "var(--gradient-primary)" : undefined, boxShadow: canSubmit ? "var(--shadow-primary)" : "none" } : {}}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin mr-2" />
          ) : success ? (
            <CheckCircle2 size={15} className="mr-2" />
          ) : null}
          {loading ? "Menyimpan..." : success ? "Password Diperbarui!" : "Perbarui Password"}
        </Button>
      </div>
    </div>
  )
}