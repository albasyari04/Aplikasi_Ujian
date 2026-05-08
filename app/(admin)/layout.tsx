// app/(admin)/layout.tsx
//
// ✅ ROOT CAUSE #5 LOADING LAMBAT:
// Layout sebelumnya render Sidebar dan Navbar secara SYNCHRONOUS.
// Jika Sidebar/Navbar melakukan getServerSession() atau query DB,
// seluruh layout menunggu selesai sebelum apapun dikirim ke browser.
//
// FIX: Pisahkan concern — layout hanya struktur shell, data di dalam
// Suspense boundary masing-masing. Browser langsung terima HTML shell,
// data stream belakangan.

import type { Metadata } from "next"
import { Suspense } from "react"
import { Navbar } from "@/components/shared/Navbar"
import { Sidebar } from "@/components/shared/Sidebar"
import { MobileNavigation } from "@/components/shared/MobileNavigation"

export const metadata: Metadata = {
  title: "Admin – SMA Al-Istiqomah Ujian",
  description: "Panel admin untuk mengelola sistem ujian online SMA Al-Istiqomah",
}

// ✅ FIX: Skeleton untuk Sidebar saat loading
function SidebarSkeleton() {
  return (
    <div className="hidden md:flex w-60 h-screen flex-col bg-white border-r border-gray-100 animate-pulse p-4 gap-3 shrink-0">
      {/* Logo */}
      <div className="h-16 w-full rounded-xl bg-gray-100 mb-4" />
      {/* Nav items */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-9 w-full rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

// ✅ FIX: Skeleton untuk Navbar saat loading
function NavbarSkeleton() {
  return (
    <div className="h-14 w-full bg-white border-b border-gray-100 animate-pulse shrink-0" />
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/*
       * ✅ FIX: Wrap Sidebar dalam Suspense.
       * Jika Sidebar fetch data (session, notifikasi, dll), browser tetap
       * dapat shell layout segera — tidak nunggu Sidebar selesai.
       */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>

        {/*
         * ✅ FIX: overflow-y-auto HANYA di main — bukan di parent.
         * Sebelumnya overflow bisa menyebabkan double scrollbar atau
         * layout recalculation yang lambat di halaman panjang.
         */}
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