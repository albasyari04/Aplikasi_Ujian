import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/notifikasi
// Notifikasi = ujian baru / ujian akan segera mulai untuk SISWA
// Untuk ADMIN/GURU = ringkasan submission terbaru
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sekarang  = new Date()
    const tigaHari  = new Date(sekarang.getTime() + 3 * 24 * 60 * 60 * 1000)

    if (session.user.role === "SISWA") {
      // ✅ Notifikasi siswa: ujian aktif yang belum dikerjakan dan akan segera mulai
      const ujianBelumDikerjakan = await prisma.ujian.findMany({
        where: {
          status:       "AKTIF",
          waktuSelesai: { gte: sekarang },
          waktuMulai:   { lte: tigaHari },
          ...(session.user.kelas ? { kelas: session.user.kelas } : {}),
          // Hanya yang belum ada hasilnya
          hasil: {
            none: { userId: session.user.id },
          },
        },
        select: {
          id:         true,
          judul:      true,
          mapel:      true,
          waktuMulai: true,
          waktuSelesai: true,
          durasi:     true,
        },
        orderBy: { waktuMulai: "asc" },
        take: 20, // ✅ limit — jangan ambil semua
      })

      const notifikasi = ujianBelumDikerjakan.map((u) => ({
        id:       u.id,
        tipe:     "UJIAN_AKTIF",
        judul:    `Ujian ${u.mapel} menunggu`,
        pesan:    `${u.judul} — berakhir ${new Date(u.waktuSelesai).toLocaleDateString("id-ID")}`,
        href:     `/ujian/${u.id}`,
        tanggal:  u.waktuMulai,
      }))

      return NextResponse.json(notifikasi)
    }

    // ADMIN/GURU: submission terbaru dalam 7 hari
    const tujuhHariLalu = new Date(sekarang.getTime() - 7 * 24 * 60 * 60 * 1000)

    const submissionTerbaru = await prisma.hasilUjian.findMany({
      where: {
        selesaiAt: { gte: tujuhHariLalu },
      },
      select: {
        id:        true,
        nilai:     true,
        lulus:     true,
        selesaiAt: true,
        user:  { select: { nama: true, kelas: true } },
        ujian: { select: { judul: true, mapel: true } },
      },
      orderBy: { selesaiAt: "desc" },
      take: 20, // ✅ limit
    })

    const notifikasi = submissionTerbaru.map((h) => ({
      id:      h.id,
      tipe:    "SUBMISSION_BARU",
      judul:   `${h.user.nama} mengumpulkan ujian`,
      pesan:   `${h.ujian.judul} — Nilai: ${h.nilai.toFixed(1)} (${h.lulus ? "Lulus" : "Tidak Lulus"})`,
      href:    `/admin/hasil`,
      tanggal: h.selesaiAt,
    }))

    return NextResponse.json(notifikasi)
  } catch (error) {
    console.error("GET /api/notifikasi error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/notifikasi — tandai notifikasi sudah dibaca (placeholder)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Notifikasi di-generate dari data ujian, tidak perlu tabel tersendiri
    // Jika kelak butuh "read status", tambahkan model Notifikasi di schema.prisma
    return NextResponse.json({ message: "OK" })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}