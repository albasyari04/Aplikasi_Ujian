// app/(admin)/admin/dashboard/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminDashboardClient } from "./AdminDashboardClient"

// ✅ FIX: Cache dashboard untuk 60 detik
// User akan lihat data yang sedikit lama, tapi navigasi jadi sangat cepat
// Setiap kunjungan setelah 60s akan di-revalidate di background
export const revalidate = 60

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

    // ✅ FIX: Ujian sedang berlangsung - JANGAN include soal
    // Cukup _count untuk jumlah soal, tidak perlu data soal sendiri
    prisma.ujian.findMany({
      where: {
        waktuMulai: { lte: now },
        waktuSelesai: { gte: now },
      },
      select: {
        id: true,
        judul: true,
        mapel: true,
        guru: true,
        tanggal: true,
        waktuMulai: true,
        waktuSelesai: true,
        durasi: true,
        _count: { select: { soal: true } },
      },
      orderBy: { waktuMulai: "asc" },
      take: 3,
    }),

    // ✅ FIX: Ujian mendatang - JANGAN include soal
    prisma.ujian.findMany({
      where: {
        waktuMulai: { gt: now, lte: tujuhHariKedepan },
      },
      select: {
        id: true,
        judul: true,
        mapel: true,
        guru: true,
        tanggal: true,
        waktuMulai: true,
        waktuSelesai: true,
        durasi: true,
        _count: { select: { soal: true } },
      },
      orderBy: { waktuMulai: "asc" },
      take: 5,
    }),

    // Hasil ujian terbaru (semua siswa)
    prisma.hasilUjian.findMany({
      select: {
        id: true,
        nilai: true,
        lulus: true,
        selesaiAt: true,
        user: { select: { nama: true, kelas: true } },
        ujian: { select: { judul: true, mapel: true } },
      },
      orderBy: { selesaiAt: "desc" },
      take: 6,
    }),

    // ✅ FIX: Semua hasil - ambil aggregation, tidak perlu select semua
    // Hanya butuh nilai dan lulus untuk statistik
    prisma.hasilUjian.findMany({
      select: { nilai: true, lulus: true },
    }),

    // ✅ FIX: Ujian hari ini - JANGAN include soal
    prisma.ujian.findMany({
      where: {
        tanggal: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
      select: {
        id: true,
        judul: true,
        mapel: true,
        guru: true,
        waktuMulai: true,
        waktuSelesai: true,
        durasi: true,
        _count: { select: { soal: true } },
      },
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