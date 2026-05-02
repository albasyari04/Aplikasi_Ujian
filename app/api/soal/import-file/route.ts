// LOKASI FILE INI: app/api/soal/import-file/route.ts
// ⚠️  Pastikan folder "import-file" sudah dibuat di dalam app/api/soal/
// Struktur yang benar:
//   app/
//   └── api/
//       └── soal/
//           ├── route.ts              ← GET & POST soal biasa
//           ├── import/
//           │   └── route.ts          ← POST import dari Excel/CSV (JSON)
//           └── import-file/          ← ✅ FOLDER INI YANG HARUS DIBUAT
//               └── route.ts          ← ✅ FILE INI

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import mammoth from "mammoth"

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

async function parseWordFile(buffer: Buffer): Promise<SoalImportRow[]> {
  const result = await mammoth.extractRawText({ buffer })
  const text = result.value

  const soalList: SoalImportRow[] = []
  const lines = text.split(/\r?\n/)
  let currentText = ""
  let currentNomor: number | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const nomorMatch = line.match(/^(\d+)[\.\)]\s*(.*)/)
    if (nomorMatch && currentNomor === null) {
      currentNomor = parseInt(nomorMatch[1])
      currentText = nomorMatch[2]
    } else if (nomorMatch && currentNomor !== null) {
      if (currentText) {
        const parsed = parseSoalText(currentText, currentNomor)
        if (parsed) soalList.push(parsed)
      }
      currentNomor = parseInt(nomorMatch[1])
      currentText = nomorMatch[2]
    } else {
      currentText = currentText ? currentText + " " + line : line
    }
  }

  // Proses soal terakhir
  if (currentText && currentNomor) {
    const parsed = parseSoalText(currentText, currentNomor)
    if (parsed) soalList.push(parsed)
  }

  return soalList
}

function parseSoalText(text: string, nomor: number): SoalImportRow | null {
  const opsi: Record<string, string> = {}
  let remainingText = text

  const optionPattern = /([A-E])\.\s+([^A-E\.][^\n]*?)(?=\s+[A-E]\.\s|\s+Kunci:|\s*$)/gi
  let match
  while ((match = optionPattern.exec(text)) !== null) {
    opsi[match[1].toUpperCase()] = match[2].trim()
    remainingText = remainingText.replace(match[0], "")
  }

  let kunciJawaban: string | null = null
  const kunciMatch = text.match(/Kunci(?:\s+Jawaban)?:\s*([A-E])/i)
  if (kunciMatch) {
    kunciJawaban = kunciMatch[1].toUpperCase()
    remainingText = remainingText.replace(kunciMatch[0], "")
  }

  let pertanyaan = remainingText
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/\s+/g, " ")
    .trim()

  if (!pertanyaan && text) {
    pertanyaan = text.replace(/^\d+[\.\)]\s*/, "").replace(/\s+/g, " ").trim()
  }

  const hasOptions = Object.keys(opsi).length >= 2
  const tipe = hasOptions ? "PILIHAN_GANDA" : "ESSAY"

  if (!pertanyaan) return null

  return {
    nomor,
    pertanyaan,
    tipe,
    opsiA: opsi["A"] || null,
    opsiB: opsi["B"] || null,
    opsiC: opsi["C"] || null,
    opsiD: opsi["D"] || null,
    opsiE: opsi["E"] || null,
    kunciJawaban: kunciJawaban || null,
    bobot: 1,
  }
}

// ✅ Next.js App Router HANYA mengenali named export: GET, POST, PUT, PATCH, DELETE
// Inilah alasan 405 terjadi — jika file tidak ada atau export salah, Next.js return 405
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const ujianId = formData.get("ujianId") as string
    const file = formData.get("file") as File | null

    if (!ujianId || !file) {
      return NextResponse.json(
        { error: "ujianId dan file wajib diisi" },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop()?.toLowerCase()
    if (ext !== "docx") {
      return NextResponse.json(
        { error: "Endpoint ini hanya untuk file .docx" },
        { status: 400 }
      )
    }

    const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } })
    if (!ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const soalList = await parseWordFile(buffer)

    if (soalList.length === 0) {
      return NextResponse.json(
        {
          error:
            "Tidak ada soal yang ditemukan dalam file Word. " +
            "Pastikan format sudah benar: '1. Pertanyaan A. Opsi Kunci: A'",
        },
        { status: 400 }
      )
    }

    if (soalList.length > 200) {
      return NextResponse.json(
        { error: "Maksimal 200 soal per import" },
        { status: 400 }
      )
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
        message: `Berhasil mengimport ${result.count} soal dari file Word`,
        imported: result.count,
        total: soalList.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/soal/import-file error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}