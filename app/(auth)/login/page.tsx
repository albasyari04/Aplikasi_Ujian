"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Eye, EyeOff, LogIn, AlertCircle, Loader2,
  GraduationCap, Mail, Lock, Shield,
} from "lucide-react"
import Image from "next/image"

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  rememberMe: z.boolean().optional(),
})
type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null)
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    })
    if (result?.error) {
      setErrorMessage("Email atau password salah. Silakan coba lagi.")
      return
    }
    const session = await getSession()
    const role = (session?.user as any)?.role
    router.push(role === "ADMIN" || role === "GURU" ? "/admin/dashboard" : "/dashboard")
    router.refresh()
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* ════════════════════════════════════════════════════════
          PANEL KIRI — Hero / Branding
          Warna: navy gelap (#0a1628 → #0d2150) sesuai desain_login.png
      ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden">

        {/* ── Layer 1: Foto gedung sebagai background ── */}
        <Image
          src="/gedung.png"
          alt="Gedung SMA Al-Istiqomah"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />

        {/* ── Layer 2: Overlay navy sangat gelap — sesuai desain_login.png ── */}
        {/*
          desain_login.png panel kiri = navy hampir hitam di atas + sedikit lebih biru di bawah.
          Warna dominan: #0a1628 (atas) → #0e2154 (bawah)
          Opacity tinggi agar gedung hanya samar-samar terlihat (~20–25%)
        */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg, rgba(8,18,40,0.93) 0%, rgba(10,25,70,0.90) 50%, rgba(13,30,90,0.88) 100%)",
          }}
        />

        {/* ── Layer 3: Subtle diagonal line texture ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              125deg,
              rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px,
              transparent 1px, transparent 60px
            )`,
          }}
        />

        {/* ── Layer 4: Glow accent lines kanan atas (seperti desain_login.png) ── */}
        <svg
          className="absolute top-0 right-0 pointer-events-none"
          width="320" height="400" viewBox="0 0 320 400" fill="none"
          style={{ opacity: 0.12 }}
        >
          <path d="M320 0 Q220 120 280 260 Q340 380 260 420" stroke="#4a9eff" strokeWidth="1.2" fill="none" />
          <path d="M360 -30 Q240 130 310 300" stroke="#3b82f6" strokeWidth="0.7" fill="none" />
          <path d="M290 0 Q180 100 240 220" stroke="#60a5fa" strokeWidth="0.5" fill="none" />
        </svg>

        {/* ── Layer 5: Subtle glow blob pojok kanan atas ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-80px", right: "-80px",
            width: "300px", height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* ── Konten utama panel kiri ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">

          {/* ════ LOGO ════
              FIX KOTAK PUTIH:
              - Gunakan mix-blend-mode: screen → background putih logo jadi transparan
              - Karena panel gelap navy, screen akan membuat putih menjadi invisible
              - Hanya warna logo (kuning, hijau, hitam) yang terlihat
          */}
          <div className="mb-6 flex items-center justify-center" style={{ height: "130px" }}>
            <Image
              src="/logo.png"
              alt="Logo SMA Al-Istiqomah"
              width={130}
              height={130}
              className="object-contain"
              priority
              style={{
                mixBlendMode: "screen",        /* ← menghilangkan background putih */
                filter: "drop-shadow(0 0 20px rgba(100,160,255,0.3))",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none"
                ;(e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove("hidden")
              }}
            />
            <GraduationCap
              className="hidden w-20 h-20 text-white"
              style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.6))" }}
            />
          </div>

          {/* Nama sekolah */}
          <h1
            className="text-[2.2rem] font-extrabold text-white tracking-tight leading-tight"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            SMA Al-Istiqomah
          </h1>

          {/* Divider — garis biru seperti desain_login.png */}
          <div className="flex items-center gap-0 mt-4 mb-2">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-blue-400 to-blue-500 rounded-full" />
          </div>

          {/* Subjudul */}
          <p className="text-blue-400 text-[14.5px] font-medium tracking-wide mb-9"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
          >
            Sistem Ujian Online Terpadu
          </p>

          {/* Feature list — sama seperti desain_login.png: icon square biru, teks putih */}
          <div className="w-full max-w-[310px] space-y-3">
            {[
              {
                svgPath: (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                ),
                title: "Ujian Digital",
                desc: "Kerjakan soal secara online kapan saja",
              },
              {
                svgPath: (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ),
                title: "Timer Otomatis",
                desc: "Sistem menghitung waktu ujian secara real-time",
              },
              {
                svgPath: (
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                ),
                title: "Hasil Instan",
                desc: "Nilai langsung tersedia setelah ujian selesai",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {/* Icon badge — biru solid seperti desain_login.png */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: "44px", height: "44px",
                    borderRadius: "12px",
                    background: "rgba(37,99,235,0.55)",
                    border: "1px solid rgba(96,165,250,0.25)",
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {f.svgPath}
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-[13.5px] leading-tight">{f.title}</p>
                  <p className="text-blue-200/65 text-[11.5px] mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer kiri */}
          <p className="text-white/25 text-[11px] mt-10 tracking-wide">
            © {new Date().getFullYear()} SMA Al-Istiqomah • v1.0.0
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          PANEL KANAN — Form Login
          Background: abu-abu kebiruan lembut (#edf0f7)
          Card: putih, rounded-3xl, shadow tipis seperti desain_login.png
      ════════════════════════════════════════════════════════ */}
      <div
        className="flex-1 lg:w-1/2 h-full flex items-center justify-center overflow-y-auto bg-[#eaeff8] p-4"
        style={{ background: "#eaeff8" }}
      >
        <div className="w-full max-w-[460px]">

          {/* Card utama */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              boxShadow: "0 8px 48px -8px rgba(15,40,130,0.14), 0 2px 16px -4px rgba(0,0,0,0.07)",
            }}
          >

            {/* ── Header: Shield lingkaran + Judul ── */}
            <div className="px-8 pt-7 pb-3 text-center">
              {/* Shield icon — lingkaran biru muda seperti desain_login.png */}
              <div
                className="inline-flex items-center justify-center mb-4"
                style={{
                  width: "66px", height: "66px",
                  borderRadius: "50%",
                  background: "#eff6ff",
                  border: "1.5px solid #dbeafe",
                  boxShadow: "0 4px 16px -4px rgba(37,99,235,0.18)",
                }}
              >
                <Shield
                  style={{ width: "32px", height: "32px", color: "#3b82f6", strokeWidth: 1.5 }}
                />
              </div>

              <h2
                className="text-[1.6rem] font-extrabold tracking-tight leading-tight"
                style={{ color: "#111827" }}
              >
                Selamat Datang
              </h2>
              <p className="text-[13.5px] mt-1.5" style={{ color: "#9ca3af" }}>
                Masuk untuk mengakses sistem ujian
              </p>
            </div>

            {/* ── Form ── */}
            <div className="px-7 pb-4">
              {errorMessage && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px]"
                  style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626" }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[13px] font-semibold mb-1.5" style={{ color: "#374151" }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ width: "15px", height: "15px", color: "#9ca3af" }}
                    />
                    <input
                      id="email" type="email" autoComplete="email"
                      placeholder="andi@sma-istiqomah.sch.id"
                      disabled={isSubmitting}
                      {...register("email")}
                      className="w-full pl-[40px] pr-4 py-[12px] text-[13.5px] outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        borderRadius: "12px",
                        border: errors.email ? "1.5px solid #f87171" : "1.5px solid #e5e7eb",
                        background: errors.email ? "#fff5f5" : "#f9fafb",
                        color: "#111827",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = errors.email ? "1.5px solid #f87171" : "1.5px solid #3b82f6"
                        e.currentTarget.style.background = "#fff"
                        e.currentTarget.style.boxShadow = errors.email
                          ? "0 0 0 3px rgba(239,68,68,0.12)"
                          : "0 0 0 3px rgba(59,130,246,0.12)"
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = errors.email ? "1.5px solid #f87171" : "1.5px solid #e5e7eb"
                        e.currentTarget.style.background = errors.email ? "#fff5f5" : "#f9fafb"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-[11.5px] flex items-center gap-1" style={{ color: "#ef4444" }}>
                      <AlertCircle className="w-3 h-3 shrink-0" />{errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-[13px] font-semibold mb-1.5" style={{ color: "#374151" }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ width: "15px", height: "15px", color: "#9ca3af" }}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      {...register("password")}
                      className="w-full pl-[40px] pr-11 py-[12px] text-[13.5px] outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        borderRadius: "12px",
                        border: errors.password ? "1.5px solid #f87171" : "1.5px solid #e5e7eb",
                        background: errors.password ? "#fff5f5" : "#f9fafb",
                        color: "#111827",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = errors.password ? "1.5px solid #f87171" : "1.5px solid #3b82f6"
                        e.currentTarget.style.background = "#fff"
                        e.currentTarget.style.boxShadow = errors.password
                          ? "0 0 0 3px rgba(239,68,68,0.12)"
                          : "0 0 0 3px rgba(59,130,246,0.12)"
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = errors.password ? "1.5px solid #f87171" : "1.5px solid #e5e7eb"
                        e.currentTarget.style.background = errors.password ? "#fff5f5" : "#f9fafb"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors rounded p-0.5"
                      style={{ color: "#9ca3af" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#6b7280")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                    >
                      {showPassword
                        ? <EyeOff style={{ width: "16px", height: "16px" }} />
                        : <Eye style={{ width: "16px", height: "16px" }} />
                      }
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-[11.5px] flex items-center gap-1" style={{ color: "#ef4444" }}>
                      <AlertCircle className="w-3 h-3 shrink-0" />{errors.password.message}
                    </p>
                  )}
                </div>

                {/* Ingat saya + Lupa password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register("rememberMe")}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: "#2563eb" }}
                    />
                    <span className="text-[13px]" style={{ color: "#6b7280" }}>Ingat saya</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Hubungi administrator sekolah untuk reset password.")}
                    className="text-[13px] font-semibold transition-colors"
                    style={{ color: "#2563eb" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1d4ed8")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2563eb")}
                  >
                    Lupa password?
                  </button>
                </div>

                {/* Tombol Masuk */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 text-white font-bold text-[14.5px] py-[13px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 20px -4px rgba(37,99,235,0.5), 0 1px 4px rgba(37,99,235,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)"
                      ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"
                      ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px -4px rgba(37,99,235,0.55)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                    ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px -4px rgba(37,99,235,0.5), 0 1px 4px rgba(37,99,235,0.2)"
                  }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Memproses...</span></>
                  ) : (
                    <><LogIn className="w-4 h-4" /><span>Masuk</span></>
                  )}
                </button>
              </form>
            </div>

            {/* ── Footer badge ── */}
            <div className="flex items-center justify-center gap-1.5 pb-5 text-[11px]" style={{ color: "#9ca3af" }}>
              <Shield style={{ width: "14px", height: "14px", strokeWidth: 1.7 }} />
              <span>Sistem aman &amp; terpercaya</span>
            </div>

          </div>
          {/* END CARD */}

        </div>
      </div>

    </div>
  )
}