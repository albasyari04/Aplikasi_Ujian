// app/api/soal/import/route.ts
// Endpoint untuk import soal dari Excel/CSV yang sudah di-parse di client
// Data dikirim sebagai JSON array dari ImportSoalModal

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface SoalImportRow {
  nomor?: number
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  opsiA?: string | null
  opsiB?: string | null
  opsiC?: string | null
  opsiD?: string | null
  opsiE?: string | null
  kunciJawaban?: string | null
  bobot?: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ujianId, soalList } = body as { ujianId: string; soalList: SoalImportRow[] }

    if (!ujianId || !Array.isArray(soalList) || soalList.length === 0) {
      return NextResponse.json(
        { error: "ujianId dan soalList wajib diisi" },
        { status: 400 }
      )
    }

    if (soalList.length > 200) {
      return NextResponse.json(
        { error: "Maksimal 200 soal per import" },
        { status: 400 }
      )
    }

    const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } })
    if (!ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }

    const lastSoal = await prisma.soal.findFirst({
      where: { ujianId },
      orderBy: { nomor: "desc" },
      select: { nomor: true },
    })
    let nextNomor = (lastSoal?.nomor ?? 0) + 1

    const errors: string[] = []
    const dataToInsert: {
      ujianId: string
      nomor: number
      pertanyaan: string
      tipe: "PILIHAN_GANDA" | "ESSAY"
      opsiA: string | null
      opsiB: string | null
      opsiC: string | null
      opsiD: string | null
      opsiE: string | null
      kunciJawaban: string | null
      bobot: number
    }[] = []

    for (let i = 0; i < soalList.length; i++) {
      const row = soalList[i]
      const rowLabel = `Soal ${i + 1}`

      if (!row.pertanyaan?.trim()) {
        errors.push(`${rowLabel}: pertanyaan kosong`)
        continue
      }

      if (row.tipe === "PILIHAN_GANDA") {
        if (!row.opsiA?.trim() || !row.opsiB?.trim()) {
          errors.push(`${rowLabel}: opsi A dan B wajib untuk pilihan ganda`)
          continue
        }
        if (!row.kunciJawaban?.trim()) {
          errors.push(`${rowLabel}: kunci jawaban wajib untuk pilihan ganda`)
          continue
        }
      }

      const assignedNomor = row.nomor ?? nextNomor
      if (!row.nomor) nextNomor++

      dataToInsert.push({
        ujianId,
        nomor: assignedNomor,
        pertanyaan: row.pertanyaan.trim(),
        tipe: row.tipe,
        opsiA: row.opsiA?.trim() || null,
        opsiB: row.opsiB?.trim() || null,
        opsiC: row.opsiC?.trim() || null,
        opsiD: row.opsiD?.trim() || null,
        opsiE: row.opsiE?.trim() || null,
        kunciJawaban: row.kunciJawaban?.trim().toUpperCase() || null,
        bobot: typeof row.bobot === "number" ? row.bobot : 1,
      })
    }

    if (dataToInsert.length === 0) {
      return NextResponse.json(
        { error: "Semua soal gagal validasi", details: errors },
        { status: 400 }
      )
    }

    const result = await prisma.soal.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    })

    return NextResponse.json(
      {
        message: `Berhasil mengimport ${result.count} soal`,
        imported: result.count,
        total: soalList.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/soal/import error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}