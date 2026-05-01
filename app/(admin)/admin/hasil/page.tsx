// app/(admin)/admin/hasil/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminHasilClient } from "./AdminHasilClient"

async function getHasilData() {
  const [hasilUjian, semuaUjian, semuaSiswa] = await Promise.all([
    // Semua hasil ujian dengan relasi lengkap
    prisma.hasilUjian.findMany({
      include: {
        user: {
          select: { id: true, nama: true, kelas: true, email: true },
        },
        ujian: {
          // ✅ nilaiKKM dihapus — sesuaikan jika ada di schema kamu
          select: { id: true, judul: true, mapel: true },
        },
      },
      orderBy: { selesaiAt: "desc" },
    }),

    // Daftar ujian untuk filter dropdown
    prisma.ujian.findMany({
      select: { id: true, judul: true, mapel: true },
      // ✅ createdAt diganti waktuMulai yang ada di model Ujian
      orderBy: { waktuMulai: "desc" },
    }),

    // Daftar siswa untuk filter dropdown
    prisma.user.findMany({
      where: { role: "SISWA" },
      select: { id: true, nama: true, kelas: true },
      orderBy: { nama: "asc" },
    }),
  ])

  // Statistik agregat
  const totalHasil = hasilUjian.length
  const rataRataNilai =
    totalHasil > 0
      ? Math.round(hasilUjian.reduce((s, h) => s + h.nilai, 0) / totalHasil)
      : 0
  const totalLulus = hasilUjian.filter((h) => h.lulus).length
  const tingkatKelulusan =
    totalHasil > 0 ? Math.round((totalLulus / totalHasil) * 100) : 0

  // Nilai tertinggi & terendah
  const nilaiList = hasilUjian.map((h) => h.nilai)
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