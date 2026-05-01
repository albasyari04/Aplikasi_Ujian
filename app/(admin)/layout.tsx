import type { Metadata } from "next"
import { Navbar } from "@/components/shared/Navbar"
import { Sidebar } from "@/components/shared/Sidebar"
import { MobileNavigation } from "@/components/shared/MobileNavigation"

export const metadata: Metadata = {
  title: "Admin – SMA Al-Istiqomah Ujian",
  description: "Panel admin untuk mengelola sistem ujian online SMA Al-Istiqomah",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-[var(--background)] pb-[76px] md:pb-0">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      <MobileNavigation />
    </div>
  )
}