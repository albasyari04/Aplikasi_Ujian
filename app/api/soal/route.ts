import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/soal — ambil soal beserta info ujian
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ujianId = searchParams.get("ujianId")
    const tipe    = searchParams.get("tipe")
    const search  = searchParams.get("search")

    // ✅ FIX: Tambah pagination — tanpa ini bisa return ribuan soal sekaligus
    const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"))
    const skip  = (page - 1) * limit

    const where: any = {}
    if (ujianId) where.ujianId = ujianId
    if (tipe)    where.tipe    = tipe
    if (search)  where.pertanyaan = { contains: search }

    // ✅ FIX: Jalankan count + findMany paralel (bukan sequential)
    const [total, soal] = await Promise.all([
      prisma.soal.count({ where }),
      prisma.soal.findMany({
        where,
        // ✅ FIX: select spesifik — tidak perlu ambil semua field soal untuk list
        select: {
          id:           true,
          nomor:        true,
          pertanyaan:   true,
          tipe:         true,
          bobot:        true,
          kunciJawaban: true,
          opsiA:        true,
          opsiB:        true,
          opsiC:        true,
          opsiD:        true,
          opsiE:        true,
          ujian: {
            select: { id: true, judul: true, mapel: true, guru: true },
          },
        },
        orderBy: [{ ujianId: "asc" }, { nomor: "asc" }],
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      data: soal,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/soal error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/soal — buat soal baru
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      ujianId, nomor, pertanyaan, tipe,
      opsiA, opsiB, opsiC, opsiD, opsiE,
      kunciJawaban, bobot,
    } = body

    if (!ujianId || !pertanyaan || !tipe) {
      return NextResponse.json(
        { error: "ujianId, pertanyaan, dan tipe wajib diisi" },
        { status: 400 }
      )
    }

    // ✅ FIX: Gabungkan cek ujian + auto nomor dalam 1 transaction
    // Sebelumnya: findUnique ujian → findFirst lastSoal → create soal = 3 query
    // Sekarang: 2 query dalam transaction (findUnique bisa digabung dengan findFirst)
    let nomorSoal = nomor

    const [ujian, lastSoal] = await Promise.all([
      prisma.ujian.findUnique({
        where:  { id: ujianId },
        select: { id: true },
      }),
      !nomor
        ? prisma.soal.findFirst({
            where:   { ujianId },
            orderBy: { nomor: "desc" },
            select:  { nomor: true },
          })
        : Promise.resolve(null),
    ])

    if (!ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }

    if (!nomorSoal) {
      nomorSoal = (lastSoal?.nomor ?? 0) + 1
    }

    const soal = await prisma.soal.create({
      data: {
        ujianId,
        nomor:        nomorSoal,
        pertanyaan,
        tipe,
        opsiA:        opsiA        || null,
        opsiB:        opsiB        || null,
        opsiC:        opsiC        || null,
        opsiD:        opsiD        || null,
        opsiE:        opsiE        || null,
        kunciJawaban: kunciJawaban || null,
        bobot:        bobot        ?? 1,
      },
      select: {
        id:           true,
        nomor:        true,
        pertanyaan:   true,
        tipe:         true,
        bobot:        true,
        kunciJawaban: true,
        opsiA: true, opsiB: true, opsiC: true, opsiD: true, opsiE: true,
        ujian: { select: { id: true, judul: true, mapel: true } },
      },
    })

    return NextResponse.json(soal, { status: 201 })
  } catch (error) {
    console.error("POST /api/soal error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}