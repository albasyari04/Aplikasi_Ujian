import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"
import mammoth from "mammoth"

export interface SoalImportRow {
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

/**
 * Parse soal dari file Word (.docx)
 * Format yang didukung:
 * 1. Soal diawali dengan nomor (1., 1), 
 * 2. Opsi A., B., C., D., E.
 * 3. Kunci: A atau Kunci Jawaban: A
 */
async function parseWordFile(buffer: Buffer): Promise<SoalImportRow[]> {
  const result = await mammoth.extractRawText({ buffer })
  const text = result.value
  
  const soalList: SoalImportRow[] = []
  
  // Split berdasarkan nomor soal (1., 1), 2., dst) - tanpa flag /s
  // Menggunakan regex tanpa flag s dengan cara manual
  const lines = text.split(/\r?\n/)
  let currentSoal: Partial<SoalImportRow> = {}
  let currentText = ""
  let inQuestion = true
  let currentNomor: number | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Check if line starts with number (new question)
    const nomorMatch = line.match(/^(\d+)[\.\)]\s*(.*)/)
    if (nomorMatch && currentNomor === null) {
      // First question
      currentNomor = parseInt(nomorMatch[1])
      currentText = nomorMatch[2]
      inQuestion = true
    } 
    else if (nomorMatch && currentNomor !== null) {
      // Save previous question and start new
      if (currentText) {
        const parsed = parseSoalText(currentText, currentNomor)
        if (parsed) soalList.push(parsed)
      }
      currentNomor = parseInt(nomorMatch[1])
      currentText = nomorMatch[2]
      inQuestion = true
    }
    else {
      // Continue current question
      if (currentText) {
        currentText += " " + line
      } else {
        currentText = line
      }
    }
  }
  
  // Save last question
  if (currentText && currentNomor) {
    const parsed = parseSoalText(currentText, currentNomor)
    if (parsed) soalList.push(parsed)
  }
  
  return soalList
}

function parseSoalText(text: string, nomor: number): SoalImportRow | null {
  // Extract opsi A-E
  const opsi: Record<string, string> = {}
  let remainingText = text
  
  // Look for options pattern (A. text, B. text, etc)
  const optionPattern = /([A-E])\.\s+([^A-E\.][^\n]*?)(?=\s+[A-E]\.\s|\s+Kunci:|\s*$)/gi
  let match
  while ((match = optionPattern.exec(text)) !== null) {
    opsi[match[1]] = match[2].trim()
    // Remove option from remaining text
    remainingText = remainingText.replace(match[0], "")
  }
  
  // Extract kunci jawaban
  let kunciJawaban: string | null = null
  const kunciRegex = /Kunci(?:\s+Jawaban)?:\s*([A-E])/i
  const kunciMatch = text.match(kunciRegex)
  if (kunciMatch) {
    kunciJawaban = kunciMatch[1].toUpperCase()
    remainingText = remainingText.replace(kunciMatch[0], "")
  }
  
  // Clean up pertanyaan (remove nomor from beginning)
  let pertanyaan = remainingText
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
  
  if (!pertanyaan && text) {
    pertanyaan = text.replace(/^\d+[\.\)]\s*/, "").replace(/\s+/g, " ").trim()
  }
  
  // Tentukan tipe soal
  const hasOptions = Object.keys(opsi).length >= 2
  const tipe = hasOptions ? "PILIHAN_GANDA" : "ESSAY"
  
  if (!pertanyaan) return null
  
  return {
    nomor,
    pertanyaan,
    tipe,
    opsiA: opsi.A || null,
    opsiB: opsi.B || null,
    opsiC: opsi.C || null,
    opsiD: opsi.D || null,
    opsiE: opsi.E || null,
    kunciJawaban: tipe === "PILIHAN_GANDA" ? kunciJawaban : (kunciJawaban || null),
    bobot: 1,
  }
}

/**
 * Parse soal dari Excel/CSV
 */
function parseExcelFile(buffer: Buffer, fileType: string): SoalImportRow[] {
  let workbook
  if (fileType === "csv") {
    const csvContent = buffer.toString("utf-8")
    const rows = csvContent.split(/\r?\n/).filter(row => row.trim())
    const headers = rows[0].split(",").map(h => h.trim())
    const dataRows = rows.slice(1)
    
    return dataRows.map(row => {
      const values = row.split(",").map(v => v.trim())
      const rowData: Record<string, unknown> = {}
      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || ""
      })
      return normalizeRow(rowData)
    }).filter(row => row.pertanyaan)
  } else {
    workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet)
    return data.map(row => normalizeRow(row as Record<string, unknown>))
  }
}

/**
 * Normalisasi satu baris data dari client
 */
function normalizeRow(raw: Record<string, unknown>): SoalImportRow {
  const lc: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    lc[k.toLowerCase().replace(/\s+/g, "")] = v
  }

  const getString = (...keys: string[]): string | null => {
    for (const k of keys) {
      const val = lc[k]
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        return String(val).trim()
      }
    }
    return null
  }

  const getNumber = (...keys: string[]): number | undefined => {
    for (const k of keys) {
      const val = lc[k]
      if (val !== undefined && val !== null) {
        const n = Number(val)
        if (!isNaN(n)) return n
      }
    }
    return undefined
  }

  const rawTipe = getString("tipe", "type", "jenissoal", "jenis") ?? ""
  let tipe: "PILIHAN_GANDA" | "ESSAY" = "PILIHAN_GANDA"
  const tipeUpper = rawTipe.toUpperCase().replace(/[\s_-]/g, "")
  if (
    tipeUpper === "ESSAY" ||
    tipeUpper === "ESAI" ||
    tipeUpper === "URAIAN" ||
    tipeUpper === "E"
  ) {
    tipe = "ESSAY"
  }

  const rawKunci = getString(
    "kuncijawaban", "kunci", "jawaban", "answer",
    "kunciJawaban", "kunci_jawaban"
  )
  const kunciJawaban = rawKunci ? rawKunci.toUpperCase().charAt(0) : null

  return {
    nomor: getNumber("nomor", "no", "number", "nomer") ?? undefined,
    pertanyaan: getString(
      "pertanyaan", "soal", "question", "pertanyaan_soal",
      "tekssoal", "teks_soal"
    ) ?? "",
    tipe,
    opsiA: getString("opsia", "opsi_a", "a", "piliha", "option_a", "optiona"),
    opsiB: getString("opsib", "opsi_b", "b", "pilihb", "option_b", "optionb"),
    opsiC: getString("opsic", "opsi_c", "c", "pilihc", "option_c", "optionc"),
    opsiD: getString("opsid", "opsi_d", "d", "pilihd", "option_d", "optiond"),
    opsiE: getString("opsie", "opsi_e", "e", "pilihe", "option_e", "optione"),
    kunciJawaban,
    bobot: getNumber("bobot", "weight", "nilai", "skor", "score") ?? 1,
  }
}

// POST /api/soal/import
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { ujianId, soalList: rawList } = body as {
      ujianId: string
      soalList: unknown[]
    }

    if (!ujianId) {
      return NextResponse.json({ error: "ujianId wajib diisi" }, { status: 400 })
    }

    if (!Array.isArray(rawList)) {
      return NextResponse.json({ error: "soalList harus berupa array" }, { status: 400 })
    }

    // Cek ujian ada
    const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } })
    if (!ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }

    const soalList: SoalImportRow[] = rawList.map(row =>
      normalizeRow(row as Record<string, unknown>)
    )

    if (soalList.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada soal yang ditemukan dalam file" },
        { status: 400 }
      )
    }

    if (soalList.length > 200) {
      return NextResponse.json(
        { error: "Maksimal 200 soal per import" },
        { status: 400 }
      )
    }

    // Ambil nomor terakhir
    const lastSoal = await prisma.soal.findFirst({
      where: { ujianId },
      orderBy: { nomor: "desc" },
    })
    let nextNomor = (lastSoal?.nomor ?? 0) + 1

    // Validasi per baris & susun data insert
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
      const rowLabel = `Baris ${i + 1}`

      if (!row.pertanyaan?.trim()) {
        errors.push(`${rowLabel}: pertanyaan kosong`)
        continue
      }

      const tipe = row.tipe ?? "PILIHAN_GANDA"

      if (tipe === "PILIHAN_GANDA") {
        if (!row.opsiA?.trim() || !row.opsiB?.trim()) {
          errors.push(
            `${rowLabel}: opsi A dan B wajib untuk pilihan ganda` +
            (!row.opsiA?.trim() ? " (opsi A kosong)" : "") +
            (!row.opsiB?.trim() ? " (opsi B kosong)" : "")
          )
          continue
        }
        if (!row.kunciJawaban?.trim()) {
          errors.push(`${rowLabel}: kunci jawaban wajib untuk pilihan ganda`)
          continue
        }
        const kunci = row.kunciJawaban.toUpperCase()
        if (!["A", "B", "C", "D", "E"].includes(kunci)) {
          errors.push(
            `${rowLabel}: kunci jawaban tidak valid "${row.kunciJawaban}" (harus A/B/C/D/E)`
          )
          continue
        }
      }

      const assignedNomor = row.nomor ?? nextNomor
      if (!row.nomor) nextNomor++

      dataToInsert.push({
        ujianId,
        nomor: assignedNomor,
        pertanyaan: row.pertanyaan.trim(),
        tipe,
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
        {
          error: "Semua baris gagal validasi",
          details: errors,
          hint: "Pastikan kolom: pertanyaan, opsiA, opsiB, kunciJawaban terisi untuk soal Pilihan Ganda",
        },
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