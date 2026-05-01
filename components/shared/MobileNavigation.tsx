"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  Clock3,
  BookOpen,
  Users2,
  GraduationCap,
  BarChart3,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const siswaItems: NavItem[] = [
  { label: "Beranda",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Ujian",    href: "/ujian",       icon: ClipboardList   },
  { label: "Jadwal",   href: "/jadwal",      icon: CalendarDays    },
  { label: "Nilai",    href: "/nilai",       icon: TrendingUp      },
  { label: "Riwayat",  href: "/riwayat",     icon: Clock3          },
]

const adminItems: NavItem[] = [
  { label: "Beranda",  href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Soal",     href: "/admin/soal",       icon: BookOpen        },
  { label: "Ujian",    href: "/admin/ujian",      icon: GraduationCap   },
  { label: "Siswa",    href: "/admin/siswa",      icon: Users2          },
  { label: "Hasil",    href: "/admin/hasil",      icon: BarChart3       },
]

// Root hrefs yang tidak pakai prefix matching
const ROOT_HREFS = ["/dashboard", "/admin/dashboard"]

export function MobileNavigation() {
  const pathname = usePathname()
  const items    = pathname.startsWith("/admin") ? adminItems : siswaItems

  const isActive = (href: string) => {
    if (ROOT_HREFS.includes(href)) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <nav
      className="mobile-nav fixed bottom-0 left-0 right-0 md:hidden z-50"
      style={{ height: "68px" }}
    >
      <div
        className="grid h-full"
        style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      >
        {items.map((item) => {
          const Icon   = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`mobile-nav-item${active ? " active" : ""}`}
              aria-label={item.label}
              scroll={false}
              replace={false}
            >
              <span className="nav-icon-wrap">
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}