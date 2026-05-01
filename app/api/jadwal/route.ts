import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/jadwal
// Menampilkan jadwal ujian yang akan datang / sedang aktif
// SISWA  → hanya ujian sesuai kelasnya
// ADMIN/GURU → semua ujian
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mapel = searchParams.get("mapel")

    // ✅ FIX: Filter tanggal di query DB — bukan filter di JS setelah fetch semua
    const sekarang = new Date()

    const where: any = {
      status: { in: ["AKTIF", "DRAFT"] },
      // Hanya tampilkan ujian yang belum selesai (waktuSelesai >= sekarang)
      waktuSelesai: { gte: sekarang },
    }

    if (session.user.role === "SISWA") {
      where.status = "AKTIF" // SISWA tidak lihat DRAFT
      if (session.user.kelas && session.user.kelas.trim() !== "") {
        where.kelas = session.user.kelas.trim()
      }
    }

    if (mapel) where.mapel = mapel

    const jadwal = await prisma.ujian.findMany({
      where,
      select: {
        id:           true,
        judul:        true,
        mapel:        true,
        guru:         true,
        kelas:        true,
        status:       true,
        tanggal:      true,
        waktuMulai:   true,
        waktuSelesai: true,
        durasi:       true,
        _count: { select: { soal: true } },
        // SISWA: cek apakah sudah ikut ujian ini
        ...(session.user.role === "SISWA"
          ? {
              hasil: {
                where:  { userId: session.user.id },
                select: { nilai: true, lulus: true, selesaiAt: true },
                take:   1,
              },
            }
          : {}),
      },
      orderBy: { waktuMulai: "asc" }, // urut dari yang paling dekat
      take: 50, // batasi maksimal 50 jadwal sekaligus
    })

    return NextResponse.json(jadwal)
  } catch (error) {
    console.error("GET /api/jadwal error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}