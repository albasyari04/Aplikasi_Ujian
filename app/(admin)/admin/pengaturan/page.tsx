import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PengaturanClient } from "../../../(dashboard)/pengaturan/_components/PengaturanClient"

// ✅ Cache halaman pengaturan admin untuk 60 detik
export const revalidate = 60

export const metadata = {
  title: "Pengaturan – SMA Al-Istiqomah",
  description: "Kelola akun, keamanan, tampilan, dan notifikasi Anda",
}

export default async function AdminPengaturanPage() {
  // ── Auth check ──────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  // Hanya admin/guru
  if (!["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  // ── Fetch user dari DB ───────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id:         true,
      nama:       true,
      email:      true,
      role:       true,
      nis:        true,
      kelas:      true,
      fotoProfil: true,
      createdAt:  true,
    },
  })

  if (!user) redirect("/login")

  // Serialise: kirim sebagai plain object ke client
  const userData = {
    ...user,
    createdAt: user.createdAt.toISOString(),
  }

  return <PengaturanClient initialUser={userData} />
}
