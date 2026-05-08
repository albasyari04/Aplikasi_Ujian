// app/(admin)/admin/siswa/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminSiswaClient } from "./AdminSiswaClient"

// ✅ FIX: Cache siswa list untuk 60 detik
export const revalidate = 60

async function getSiswaData() {
  const siswa = await prisma.user.findMany({
    where: { role: "SISWA" },
    select: {
      id: true,
      nama: true,
      email: true,
      nis: true,
      kelas: true,
      fotoProfil: true,
      createdAt: true,
      _count: { select: { hasilUjian: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Ambil semua kelas unik untuk filter
  const kelasUnik = [...new Set(
    siswa.map((s) => s.kelas).filter(Boolean) as string[]
  )].sort()

  return {
    siswa: siswa.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
    kelasUnik,
    total: siswa.length,
  }
}

export default async function AdminSiswaPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const data = await getSiswaData()
  return <AdminSiswaClient data={data} />
}