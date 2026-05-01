// app/api/nilai/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/nilai
// SISWA  → nilai milik sendiri
// ADMIN/GURU → semua nilai (bisa filter by ujianId / userId)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ujianId = searchParams.get("ujianId")
    const userId  = searchParams.get("userId")
    const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit   = Math.min(100, parseInt(searchParams.get("limit") ?? "20"))
    const skip    = (page - 1) * limit

    const where: any = {}

    if (session.user.role === "SISWA") {
      // SISWA hanya boleh lihat nilai dirinya sendiri
      where.userId = session.user.id
    } else {
      // ADMIN/GURU bisa filter
      if (ujianId) where.ujianId = ujianId
      if (userId)  where.userId  = userId
    }

    // ✅ Paralel: count + data sekaligus
    const [total, nilai] = await Promise.all([
      prisma.hasilUjian.count({ where }),
      prisma.hasilUjian.findMany({
        where,
        select: {
          id:        true,
          nilai:     true,
          lulus:     true,
          selesaiAt: true,
          ujian: {
            select: {
              id:    true,
              judul: true,
              mapel: true,
              guru:  true,
              kelas: true,
            },
          },
          user: {
            select: {
              id:    true,
              nama:  true,
              nis:   true,
              kelas: true,
            },
          },
        },
        orderBy: { selesaiAt: "desc" },
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      data: nilai,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/nilai error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}