"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { useUserStore } from "@/store/userStore"
import { ThemeToggle } from "./ThemeToggle"
import { Bell, LogOut, Settings, User, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// ─── helpers ──────────────────────────────────────────────────────────────────
function getInitials(nama: string): string {
  return nama.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = { ADMIN: "Administrator", GURU: "Guru", SISWA: "Siswa" }
  return map[role] ?? role
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 11) return "Selamat Pagi"
  if (h < 15) return "Selamat Siang"
  if (h < 18) return "Selamat Sore"
  return "Selamat Malam"
}

// ─── component ────────────────────────────────────────────────────────────────
export function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [hasNotif, setHasNotif] = useState(true)

  // ✅ FIX: Ambil session dari next-auth — TIDAK perlu fetch /api/auth/me
  // Data user sudah ada di JWT token, tidak perlu round-trip ke server
  const { data: session, status } = useSession()

  // Sync ke userStore agar komponen lain (Sidebar) bisa pakai tanpa fetch ulang
  const setUser = useUserStore((s) => s.setUser)
  const logout  = useUserStore((s) => s.logout)

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as any)
    }
  }, [session, setUser])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    logout()
    router.push("/login")
  }

  // Gunakan data dari session langsung
  const user     = session?.user as any
  const isAdmin  = user?.role === "ADMIN" || user?.role === "GURU"
  const initials = user ? getInitials(user.nama ?? user.name ?? "?") : "?"
  const loading  = status === "loading"

  const profileHref  = isAdmin ? "/admin/dashboard/profil" : "/profil"
  const settingsHref = isAdmin ? "/admin/dashboard/pengaturan" : "/pengaturan"
  const notifHref    = isAdmin ? "/admin/dashboard/notifikasi" : "/notifikasi"

  // ── SSR / Loading skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <div className="md:hidden h-[72px] animate-pulse" style={{ background: "var(--primary)" }} />
        <nav className="hidden md:flex sticky top-0 z-40 w-full bg-background border-b border-border/40 h-14" />
      </>
    )
  }

  // ── MOBILE TOP BAR ────────────────────────────────────────────────────────
  const MobileBar = (
    <div className="md:hidden mobile-topbar px-5 pt-4 pb-5 relative z-40">
      <div className="flex items-center justify-between">
        {/* greeting */}
        <div className="flex-1 min-w-0 animate-fade-up">
          {user ? (
            <>
              <p className="text-[11px] font-medium text-white/70 leading-none mb-1 tracking-wide uppercase">
                {getGreeting()} 👋
              </p>
              <p className="text-[15px] font-bold text-white leading-tight truncate max-w-[180px]">
                {user.nama ?? user.name}
              </p>
            </>
          ) : (
            <p className="text-[15px] font-bold text-white">Dashboard</p>
          )}
        </div>

        {/* actions */}
        <div className="flex items-center gap-2">
          {/* notif */}
          <Link
            href={notifHref}
            prefetch
            className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-sm text-white transition-all active:scale-95"
            aria-label="Notifikasi"
          >
            <Bell size={17} strokeWidth={2} />
            {hasNotif && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400 border border-white/60" />
            )}
          </Link>

          {/* theme */}
          <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-sm [&_button]:text-white [&_button]:hover:bg-white/10 [&_button]:rounded-xl [&_svg]:size-4">
            <ThemeToggle />
          </div>

          {/* avatar / user dialog */}
          {user ? (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-2xl bg-white/25 text-white text-[11px] font-bold tracking-wide transition-all active:scale-95 backdrop-blur-sm border border-white/30"
                  aria-label="Profil saya"
                >
                  {initials}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-xs mx-4 rounded-3xl border-0 p-0 overflow-hidden"
                style={{ background: "var(--card)" }}>
                {/* header */}
                <div className="mobile-topbar px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/25 text-white text-sm font-bold border border-white/30">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-sm truncate">{user.nama ?? user.name}</p>
                      <p className="text-white/70 text-[11px] truncate mt-0.5">{user.email}</p>
                      <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-lg bg-white/20 text-white text-[9px] font-bold uppercase tracking-widest">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* menu */}
                <div className="p-3 space-y-1">
                  {[
                    { icon: User,     label: "Edit Profil",  href: profileHref  },
                    { icon: Settings, label: "Pengaturan",   href: settingsHref },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link key={href} href={href} prefetch>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold hover:bg-[var(--accent)] transition-all active:scale-[0.98] group"
                        style={{ color: "var(--foreground)" }}>
                        <span className="icon-badge w-8 h-8 rounded-xl">
                          <Icon size={15} strokeWidth={2} />
                        </span>
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={14} className="text-[var(--muted-foreground)]" />
                      </div>
                    </Link>
                  ))}
                  <div className="pt-1 border-t" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 text-red-500">
                        <LogOut size={15} strokeWidth={2} />
                      </span>
                      <span className="flex-1 text-left">Keluar</span>
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Link href="/login" className="flex items-center justify-center w-9 h-9 rounded-2xl bg-white/20 text-white text-xs font-bold">
              ?
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  // ── DESKTOP NAV ───────────────────────────────────────────────────────────
  const DesktopNav = (
    <nav
      className={`hidden md:flex sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-background border-b border-border/40"
      }`}
    >
      <div className="flex h-14 w-full items-center justify-end px-4 md:px-6">
        <div className="flex items-center gap-1">
          <Link href={notifHref} prefetch>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
              <Bell className="size-4" />
              {hasNotif && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />}
            </Button>
          </Link>

          <ThemeToggle />
          <div className="w-px h-5 bg-border mx-1" />

          {user ? (
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-accent transition-colors group" type="button">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">{user.nama ?? user.name}</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{user.role}</span>
                  </div>
                  <ChevronDown className="size-3 text-muted-foreground hidden md:block" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-xs">
                <DialogHeader>
                  <DialogTitle className="text-base">Akun Saya</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{user.nama ?? user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {[
                      { icon: User,     label: "Edit Profil", href: profileHref  },
                      { icon: Settings, label: "Pengaturan",  href: settingsHref },
                    ].map(({ icon: Icon, label, href }) => (
                      <Link key={`${href}-${label}`} href={href} prefetch>
                        <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-sm font-medium">
                          <Icon className="size-3.5 mr-2.5 text-muted-foreground" />
                          {label}
                        </Button>
                      </Link>
                    ))}
                    <div className="pt-1 border-t border-border/50">
                      <Button
                        variant="ghost" size="sm"
                        className="w-full justify-start h-9 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="size-3.5 mr-2.5" />
                        Keluar
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Link href="/login">
              <Button size="sm" className="h-8 text-xs">Masuk</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )

  return (
    <>
      {MobileBar}
      {DesktopNav}
    </>
  )
}