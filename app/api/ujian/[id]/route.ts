import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/ujian/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const isSiswa = session.user.role === "SISWA"

    // ✅ FIX UTAMA: strip kunciJawaban langsung di query Prisma (bukan di JS)
    // Sebelumnya: ambil semua field → spread → buang kunci → kirim
    // Sekarang:   query sudah tidak ambil kunci sama sekali untuk SISWA
    // Ini jauh lebih efisien: data lebih kecil, tidak perlu map() di JS
    const ujian = await prisma.ujian.findUnique({
      where: { id },
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
        createdAt:    true,
        _count: { select: { soal: true, hasil: true } },
        soal: {
          orderBy: { nomor: "asc" },
          select: {
            id:         true,
            nomor:      true,
            pertanyaan: true,
            tipe:       true,
            opsiA:      true,
            opsiB:      true,
            opsiC:      true,
            opsiD:      true,
            opsiE:      true,
            bobot:      true,
            // ✅ kunciJawaban hanya diambil untuk ADMIN/GURU
            kunciJawaban: isSiswa ? false : true,
          },
        },
      },
    })

    if (!ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }

    // Validasi akses SISWA
    if (isSiswa) {
      if (ujian.status !== "AKTIF") {
        return NextResponse.json({ error: "Ujian tidak tersedia" }, { status: 403 })
      }
      if (session.user.kelas && ujian.kelas !== session.user.kelas) {
        return NextResponse.json({ error: "Ujian tidak untuk kelas Anda" }, { status: 403 })
      }
    }

    return NextResponse.json(ujian)
  } catch (error) {
    console.error("GET /api/ujian/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/ujian/[id] — hanya ADMIN & GURU
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { judul, mapel, guru, kelas, tanggal, waktuMulai, waktuSelesai, durasi, status } = body

    if (!judul || !mapel || !guru || !kelas || !tanggal || !waktuMulai || !waktuSelesai || !durasi) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 })
    }

    // ✅ FIX: gunakan update langsung dengan upsert check via Prisma
    // Tidak perlu findUnique dulu hanya untuk cek exist — update akan throw jika tidak ada
    try {
      const ujian = await prisma.ujian.update({
        where: { id },
        data: {
          judul,
          mapel,
          guru,
          kelas,
          ...(status ? { status } : {}),
          tanggal:      new Date(tanggal),
          waktuMulai:   new Date(waktuMulai),
          waktuSelesai: new Date(waktuSelesai),
          durasi:       parseInt(durasi),
        },
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
          _count: { select: { soal: true, hasil: true } },
        },
      })

      return NextResponse.json(ujian)
    } catch (e: any) {
      if (e?.code === "P2025") {
        return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
      }
      throw e
    }
  } catch (error) {
    console.error("PUT /api/ujian/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/ujian/[id] — hanya ADMIN & GURU
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // ✅ FIX: Gunakan transaction — semua operasi delete atomic & 1 round-trip ke DB
    // Sebelumnya: findMany soalIds → deleteMany jawaban → deleteMany soal → deleteMany hasil → delete ujian
    // = 5 query terpisah. Sekarang: 1 transaction dengan 4 deleteMany otomatis ordered
    await prisma.$transaction(async (tx) => {
      // Ambil semua soalId milik ujian ini
      const soalIds = await tx.soal.findMany({
        where:  { ujianId: id },
        select: { id: true },
      })

      if (soalIds.length > 0) {
        await tx.jawaban.deleteMany({
          where: { soalId: { in: soalIds.map((s) => s.id) } },
        })
      }

      await tx.soal.deleteMany({ where: { ujianId: id } })
      await tx.hasilUjian.deleteMany({ where: { ujianId: id } })

      try {
        await tx.ujian.delete({ where: { id } })
      } catch (e: any) {
        if (e?.code === "P2025") {
          throw new Error("NOT_FOUND")
        }
        throw e
      }
    })

    return NextResponse.json({ message: "Ujian berhasil dihapus" })
  } catch (error: any) {
    if (error?.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }
    console.error("DELETE /api/ujian/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}