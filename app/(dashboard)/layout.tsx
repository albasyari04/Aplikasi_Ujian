import type { Metadata } from "next"
import { Navbar } from "@/components/shared/Navbar"
import { Sidebar } from "@/components/shared/Sidebar"
import { MobileNavigation } from "@/components/shared/MobileNavigation"

export const metadata: Metadata = {
  title: "Dashboard – SMA Al-Istiqomah Ujian",
  description: "Dashboard siswa untuk mengikuti ujian online SMA Al-Istiqomah",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* sidebar hanya tampil di desktop */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar: mobile = teal topbar, desktop = putih sticky */}
        <Navbar />

        <main className="flex-1 overflow-auto bg-[var(--background)] pb-[76px] md:pb-0">
          {/* mobile: padding lebih ringan agar konten tidak sesak */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* bottom nav hanya tampil di mobile */}
      <MobileNavigation />
    </div>
  )
}