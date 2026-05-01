import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
 * Normalisasi satu baris data dari client.
 * Menangani berbagai variasi nama kolom (case-insensitive, spasi, dll)
 * agar import dari Excel/CSV tidak gagal hanya karena perbedaan nama header.
 */
function normalizeRow(raw: Record<string, unknown>): SoalImportRow {
  // Buat map key lowercase tanpa spasi untuk lookup fleksibel
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

  // Normalisasi tipe soal — terima berbagai format
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
  // semua selain itu = PILIHAN_GANDA (default)

  // Normalisasi kunci jawaban
  const rawKunci = getString(
    "kuncijawaban", "kunci", "jawaban", "answer",
    "kunciJawaban", "kunci_jawaban"
  )
  const kunciJawaban = rawKunci ? rawKunci.toUpperCase().charAt(0) : null

  return {
    nomor: getNumber("nomor", "no", "number", "nomer") ?? undefined,
    pertanyaan:
      getString(
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
// Body: { ujianId: string, soalList: SoalImportRow[] | Record<string,unknown>[] }
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

    // ── Validasi input dasar ──────────────────────────────────────
    if (!ujianId) {
      return NextResponse.json({ error: "ujianId wajib diisi" }, { status: 400 })
    }
    if (!Array.isArray(rawList) || rawList.length === 0) {
      return NextResponse.json({ error: "soalList tidak boleh kosong" }, { status: 400 })
    }
    if (rawList.length > 200) {
      return NextResponse.json(
        { error: "Maksimal 200 soal per import" },
        { status: 400 }
      )
    }

    // ── Cek ujian ada ─────────────────────────────────────────────
    const ujian = await prisma.ujian.findUnique({ where: { id: ujianId } })
    if (!ujian) {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }

    // ── Normalisasi semua baris ───────────────────────────────────
    const soalList: SoalImportRow[] = rawList.map((row) =>
      normalizeRow(row as Record<string, unknown>)
    )

    // ── Ambil nomor terakhir ──────────────────────────────────────
    const lastSoal = await prisma.soal.findFirst({
      where: { ujianId },
      orderBy: { nomor: "desc" },
    })
    let nextNomor = (lastSoal?.nomor ?? 0) + 1

    // ── Validasi per baris & susun data insert ────────────────────
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
            (row.opsiA ? "" : " (opsi A kosong)") +
            (row.opsiB ? "" : " (opsi B kosong)")
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

    // ── Jika semua baris gagal, tolak dengan detail error ────────
    if (dataToInsert.length === 0) {
      return NextResponse.json(
        {
          error: "Semua baris gagal validasi",
          details: errors,
          // Kirim contoh baris pertama untuk debugging di client
          hint: "Pastikan kolom: pertanyaan, opsiA, opsiB, kunciJawaban terisi untuk soal Pilihan Ganda",
        },
        { status: 400 }
      )
    }

    // ── Batch insert ──────────────────────────────────────────────
    const result = await prisma.soal.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    })

    const importedCount = result.count ?? 0

    return NextResponse.json(
      {
        message: `Berhasil mengimport ${importedCount} soal`,
        imported: importedCount,
        skipped: soalList.length - importedCount - errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/soal/import error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}