// app/(dashboard)/layout.tsx
//
// ✅ Sama seperti admin layout — tambah Suspense boundaries
// agar browser dapat shell HTML instan tanpa menunggu Sidebar/Navbar.

import type { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/shared/Navbar"
import { Sidebar } from "@/components/shared/Sidebar"
import { MobileNavigation } from "@/components/shared/MobileNavigation"

export const metadata: Metadata = {
  title: "Dashboard – SMA Al-Istiqomah Ujian",
  description: "Dashboard siswa untuk mengikuti ujian online SMA Al-Istiqomah",
}

function SidebarSkeleton() {
  return (
    <div className="hidden md:flex w-60 h-screen flex-col bg-white border-r border-gray-100 animate-pulse p-4 gap-3 shrink-0">
      <div className="h-16 w-full rounded-xl bg-gray-100 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-9 w-full rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

function NavbarSkeleton() {
  return (
    <div className="h-14 w-full bg-white border-b border-gray-100 animate-pulse shrink-0" />
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>

        <main className="flex-1 overflow-y-auto bg-[var(--background)] pb-[76px] md:pb-0">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        <MobileNavigation />
      </Suspense>
    </div>
  )
}