import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/soal/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const soal = await prisma.soal.findUnique({
      where: { id },
      include: {
        ujian: { select: { id: true, judul: true, mapel: true } },
      },
    })

    if (!soal) {
      return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(soal)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/soal/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      nomor,
      pertanyaan,
      tipe,
      opsiA,
      opsiB,
      opsiC,
      opsiD,
      opsiE,
      kunciJawaban,
      bobot,
    } = body

    const { id } = await params
    const soal = await prisma.soal.update({
      where: { id },
      data: {
        nomor,
        pertanyaan,
        tipe,
        opsiA: opsiA || null,
        opsiB: opsiB || null,
        opsiC: opsiC || null,
        opsiD: opsiD || null,
        opsiE: opsiE || null,
        kunciJawaban: kunciJawaban || null,
        bobot: bobot ?? 1,
      },
      include: {
        ujian: { select: { id: true, judul: true, mapel: true } },
      },
    })

    return NextResponse.json(soal)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/soal/[id]
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
    // Cek ada jawaban terkait
    const jawabanCount = await prisma.jawaban.count({
      where: { soalId: id },
    })

    if (jawabanCount > 0) {
      // Hapus jawaban dulu
      await prisma.jawaban.deleteMany({ where: { soalId: id } })
    }

    await prisma.soal.delete({ where: { id } })

    return NextResponse.json({ message: "Soal berhasil dihapus" })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}