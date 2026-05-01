import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/ujian
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const mapel  = searchParams.get("mapel")

    const where: any = {}

    if (session.user.role === "SISWA") {
      where.status = "AKTIF"

      if (session.user.kelas && session.user.kelas.trim() !== "") {
        where.kelas = session.user.kelas.trim()
      }
    }

    if (search) {
      where.OR = [
        { judul: { contains: search } },
        { mapel:  { contains: search } },
        { guru:   { contains: search } },
      ]
    }
    if (mapel) where.mapel = mapel

    const ujian = await prisma.ujian.findMany({
      where,
      // ✅ FIX: select spesifik — JANGAN include soal di list (bisa ratusan soal)
      // Cukup _count untuk tahu jumlah soal
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
        _count: {
          select: { soal: true, hasil: true },
        },
        // ✅ FIX: hasil SISWA — hanya ambil field yang dibutuhkan UI
        ...(session.user.role === "SISWA"
          ? {
              hasil: {
                where:  { userId: session.user.id },
                select: { nilai: true, lulus: true, selesaiAt: true },
                take:   1, // ✅ siswa hanya punya 1 hasil per ujian
              },
            }
          : {}),
      },
      orderBy: { tanggal: "desc" },
    })

    return NextResponse.json(ujian)
  } catch (error) {
    console.error("GET /api/ujian error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/ujian — hanya ADMIN & GURU
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { judul, mapel, guru, kelas, tanggal, waktuMulai, waktuSelesai, durasi, status } = body

    if (!judul || !mapel || !guru || !kelas || !tanggal || !waktuMulai || !waktuSelesai || !durasi) {
      return NextResponse.json(
        {
          error:
            "Semua field wajib diisi: judul, mapel, guru, kelas, tanggal, waktuMulai, waktuSelesai, durasi",
        },
        { status: 400 }
      )
    }

    const validStatus = ["DRAFT", "AKTIF", "SELESAI"]
    const statusFinal = validStatus.includes(status) ? status : "AKTIF"

    const ujian = await prisma.ujian.create({
      data: {
        judul,
        mapel,
        guru,
        kelas:        kelas.trim(),
        status:       statusFinal,
        tanggal:      new Date(tanggal),
        waktuMulai:   new Date(waktuMulai),
        waktuSelesai: new Date(waktuSelesai),
        durasi:       parseInt(durasi),
      },
      // ✅ FIX: select spesifik di response POST juga
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
      },
    })

    return NextResponse.json(ujian, { status: 201 })
  } catch (error) {
    console.error("POST /api/ujian error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}