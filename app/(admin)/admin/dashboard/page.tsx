// app/(admin)/admin/dashboard/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminDashboardClient } from "./AdminDashboardClient"

async function getDashboardData() {
  const now = new Date()
  const tujuhHariKedepan = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Generate greeting berdasarkan waktu server
  const hour = now.getHours()
  const greeting =
    hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam"

  const [
    totalSiswa,
    totalUjian,
    ujianAktif,
    ujianMendatang,
    hasilTerbaru,
    semuaHasil,
    ujianHariIni,
  ] = await Promise.all([
    // Total siswa
    prisma.user.count({ where: { role: "SISWA" } }),

    // Total ujian
    prisma.ujian.count(),

    // Ujian sedang berlangsung
    prisma.ujian.findMany({
      where: {
        waktuMulai: { lte: now },
        waktuSelesai: { gte: now },
      },
      include: { soal: true },
      orderBy: { waktuMulai: "asc" },
      take: 3,
    }),

    // Ujian mendatang (7 hari ke depan)
    prisma.ujian.findMany({
      where: {
        waktuMulai: { gt: now, lte: tujuhHariKedepan },
      },
      include: { soal: true },
      orderBy: { waktuMulai: "asc" },
      take: 5,
    }),

    // Hasil ujian terbaru (semua siswa)
    prisma.hasilUjian.findMany({
      include: {
        user: { select: { nama: true, kelas: true } },
        ujian: { select: { judul: true, mapel: true } },
      },
      orderBy: { selesaiAt: "desc" },
      take: 6,
    }),

    // Semua hasil untuk statistik
    prisma.hasilUjian.findMany({
      select: { nilai: true, lulus: true },
    }),

    // Ujian hari ini
    prisma.ujian.findMany({
      where: {
        tanggal: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
      include: { soal: true },
      orderBy: { waktuMulai: "asc" },
    }),
  ])

  const rataRataNilai =
    semuaHasil.length > 0
      ? Math.round(
          semuaHasil.reduce((sum, h) => sum + h.nilai, 0) / semuaHasil.length
        )
      : 0

  const tingkatKelulusan =
    semuaHasil.length > 0
      ? Math.round((semuaHasil.filter((h) => h.lulus).length / semuaHasil.length) * 100)
      : 0

  return {
    greeting,
    currentDate: now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    stats: {
      totalSiswa,
      totalUjian,
      rataRataNilai,
      tingkatKelulusan,
      totalHasil: semuaHasil.length,
    },
    ujianAktif,
    ujianMendatang,
    ujianHariIni,
    hasilTerbaru,
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const data = await getDashboardData()

  return <AdminDashboardClient data={data} user={session.user} />
}