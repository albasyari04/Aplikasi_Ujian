// app/(admin)/admin/ujian/buat/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BuatUjianClient } from "./BuatUjianClient"

// ✅ Cache halaman "Buat Ujian" selama 5 detik untuk mempercepat load
export const revalidate = 5

export default async function BuatUjianPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  return <BuatUjianClient />
}