"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useUserStore } from "@/store/userStore"
import Image from "next/image"
import {
  LayoutDashboardIcon,
  FileTextIcon,
  CalendarIcon,
  BarChart3Icon,
  HistoryIcon,
  BellIcon,
  SettingsIcon,
  UserIcon,
  BookOpenIcon,
  UsersIcon,
  PlusCircleIcon,
  ClipboardListIcon,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const siswaGroups: NavGroup[] = [
  {
    title: "Menu Utama",
    items: [
      { label: "Dashboard",  href: "/dashboard",   icon: LayoutDashboardIcon },
      { label: "Ujian",      href: "/ujian",        icon: FileTextIcon        },
      { label: "Jadwal",     href: "/jadwal",       icon: CalendarIcon        },
    ],
  },
  {
    title: "Akademik",
    items: [
      { label: "Nilai",      href: "/nilai",        icon: BarChart3Icon       },
      { label: "Riwayat",    href: "/riwayat",      icon: HistoryIcon         },
      { label: "Notifikasi", href: "/notifikasi",   icon: BellIcon            },
    ],
  },
  {
    title: "Akun",
    items: [
      { label: "Profil",     href: "/profil",       icon: UserIcon            },
      { label: "Pengaturan", href: "/pengaturan",   icon: SettingsIcon        },
    ],
  },
]

const adminGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard",    href: "/admin/dashboard",  icon: LayoutDashboardIcon },
    ],
  },
  {
    title: "Manajemen Soal",
    items: [
      { label: "Kelola Soal",  href: "/admin/soal",       icon: BookOpenIcon        },
      { label: "Buat Soal",    href: "/admin/soal/buat",  icon: PlusCircleIcon      },
    ],
  },
  {
    title: "Manajemen Ujian",
    items: [
      { label: "Kelola Ujian", href: "/admin/ujian",      icon: ClipboardListIcon   },
      { label: "Buat Ujian",   href: "/admin/ujian/buat", icon: PlusCircleIcon      },
    ],
  },
  {
    title: "Data & Laporan",
    items: [
      { label: "Kelola Siswa", href: "/admin/siswa",      icon: UsersIcon           },
      { label: "Hasil Ujian",  href: "/admin/hasil",      icon: BarChart3Icon       },
    ],
  },
]

const SCROLLBAR_STYLE = `
  .sidebar-nav::-webkit-scrollbar { width: 3px; }
  .sidebar-nav::-webkit-scrollbar-track { background: transparent; margin: 8px 0; }
  .sidebar-nav::-webkit-scrollbar-thumb { background-color: hsl(var(--border)); border-radius: 999px; min-height: 40px; }
  .sidebar-nav::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--primary) / 0.5); }
  .sidebar-logo-area { background: linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%); }
`

const ROOT_HREFS = ["/dashboard", "/admin/dashboard"]

export function Sidebar() {
  const pathname = usePathname()

  // ✅ FIX: Pakai useSession — TIDAK fetch /api/auth/me lagi
  // Navbar sudah sync ke userStore, Sidebar cukup baca dari store
  const { data: session } = useSession()
  const setUser = useUserStore((state) => state.setUser)
  const user    = useUserStore((state) => state.user)

  // Sync sekali saat session tersedia (Navbar mungkin belum mount)
  useEffect(() => {
    if (session?.user && !user) {
      setUser(session.user as any)
    }
  }, [session, user, setUser])

  const isAdmin = pathname.startsWith("/admin")
  const groups  = isAdmin ? adminGroups : siswaGroups

  const isActive = (href: string) => {
    if (ROOT_HREFS.includes(href)) return pathname === href
    // Exact match takes priority
    if (pathname === href) return true
    // Only prefix match if no other item will have exact match
    // This prevents "Kelola Soal" from being active when on "Buat Soal"
    if (pathname.startsWith(href + "/")) {
      // Check if any sibling path with same parent should be prioritized
      // e.g., /admin/soal/buat should match /admin/soal/buat exactly, not /admin/soal as prefix
      const pathParts = pathname.split("/").filter(Boolean)
      const hrefParts = href.split("/").filter(Boolean)
      // If current path has one more segment after this href, it might be a sub-route
      if (pathParts.length > hrefParts.length) {
        // Only match if href ends with a "master" pattern (not buat/edit/etc)
        // For now, allow prefix match but let exact matches be more specific elsewhere
        return !pathname.match(/\/(buat|edit|import)($|\/)/i)
      }
      return true
    }
    return false
  }

  const displayUser = user ?? (session?.user as any)

  return (
    <>
      <style>{SCROLLBAR_STYLE}</style>

      {/* Spacer */}
      <div className="hidden md:block w-60 shrink-0" />

      {/* Sidebar fixed */}
      <aside
        className="hidden md:flex flex-col bg-background border-r border-border/60"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "240px",
          height: "100dvh",
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          className="sidebar-logo-area shrink-0 flex flex-col items-center justify-center gap-2 border-b border-border/40"
          style={{ height: "120px", paddingTop: "18px", paddingBottom: "14px" }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ width: "72px", height: "72px" }}
          >
            <Image
              src="/logo.png"
              alt="Logo SMA Al-Istiqomah"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div className="text-center leading-none">
            <p className="font-bold text-foreground" style={{ fontSize: "11px", letterSpacing: "0.04em" }}>
              SMA Al-Istiqomah
            </p>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "9px", letterSpacing: "0.06em" }}>
              SISTEM UJIAN ONLINE
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav
          className="sidebar-nav flex-1"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            scrollbarWidth: "thin",
            scrollbarColor: "hsl(var(--border)) transparent",
            padding: "12px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.title && (
                <p
                  className="px-2 mb-1.5 font-bold uppercase text-muted-foreground/70"
                  style={{ fontSize: "9px", letterSpacing: "0.1em" }}
                >
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon   = item.icon
                  const active = isActive(item.href)

                  return (
                    // ✅ FIX: Ganti button + router.push → <Link> 
                    // Link otomatis prefetch saat hover → navigasi instan
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 transition-transform duration-150 ${
                          active ? "" : "group-hover:scale-110"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/60 shrink-0" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer user info */}
        {displayUser && (
          <div className="mx-3 mb-3 p-2.5 rounded-xl border border-border/60 bg-muted/30 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold shrink-0"
                style={{ fontSize: "10px" }}
              >
                {(displayUser.nama ?? displayUser.name ?? "?")
                  .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {displayUser.nama ?? displayUser.name}
                </p>
                <p className="text-muted-foreground truncate" style={{ fontSize: "9px" }}>
                  {displayUser.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}