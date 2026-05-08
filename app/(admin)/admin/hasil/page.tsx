// app/(admin)/admin/hasil/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminHasilClient } from "./AdminHasilClient"

// ✅ FIX: Cache hasil untuk 60 detik
export const revalidate = 60

async function getHasilData() {
  // ✅ FIX: Batasi hasil ke 1000 terakhir untuk performance
  // Jika lebih banyak, gunakan pagination di component client
  const [hasilUjian, semuaUjian, semuaSiswa] = await Promise.all([
    // Semua hasil ujian dengan relasi lengkap - LIMIT 1000
    prisma.hasilUjian.findMany({
      select: {
        id: true,
        nilai: true,
        lulus: true,
        selesaiAt: true,
        userId: true,
        ujianId: true,
        user: {
          select: { id: true, nama: true, kelas: true, email: true },
        },
        ujian: {
          select: { id: true, judul: true, mapel: true },
        },
      },
      orderBy: { selesaiAt: "desc" },
      take: 1000, // ✅ Limit untuk prevent loading ribuan records
    }),

    // Daftar ujian untuk filter dropdown
    prisma.ujian.findMany({
      select: { id: true, judul: true, mapel: true },
      orderBy: { waktuMulai: "desc" },
    }),

    // Daftar siswa untuk filter dropdown
    prisma.user.findMany({
      where: { role: "SISWA" },
      select: { id: true, nama: true, kelas: true },
      orderBy: { nama: "asc" },
    }),
  ])

  // Statistik agregat - hanya dari 1000 hasil yang diambil
  const totalHasil = hasilUjian.length
  const rataRataNilai =
    totalHasil > 0
      ? Math.round(hasilUjian.reduce((s: any, h: any) => s + h.nilai, 0) / totalHasil)
      : 0
  const totalLulus = hasilUjian.filter((h: any) => h.lulus).length
  const tingkatKelulusan =
    totalHasil > 0 ? Math.round((totalLulus / totalHasil) * 100) : 0

  // Nilai tertinggi & terendah
  const nilaiList = hasilUjian.map((h: any) => h.nilai)
  const nilaiTertinggi = nilaiList.length > 0 ? Math.max(...nilaiList) : 0
  const nilaiTerendah = nilaiList.length > 0 ? Math.min(...nilaiList) : 0

  return {
    hasilUjian,
    semuaUjian,
    semuaSiswa,
    statistik: {
      totalHasil,
      rataRataNilai,
      totalLulus,
      totalTidakLulus: totalHasil - totalLulus,
      tingkatKelulusan,
      nilaiTertinggi,
      nilaiTerendah,
    },
  }
}

export default async function AdminHasilPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const data = await getHasilData()

  return <AdminHasilClient data={data} />
}