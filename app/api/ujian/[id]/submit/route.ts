import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/ujian/[id]/submit
// Body: { jawaban: { soalId: string; jawaban: string }[] }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: ujianId } = await params
    const body = await request.json()
    const { jawaban } = body as {
      jawaban: { soalId: string; jawaban: string }[]
    }

    if (!jawaban || !Array.isArray(jawaban)) {
      return NextResponse.json({ error: "Data jawaban tidak valid" }, { status: 400 })
    }

    const userId = session.user.id

    // ✅ FIX UTAMA: Gabungkan semua query dalam 1 transaction
    // Sebelumnya:
    //   1. findUnique ujian + include soal (ambil semua field soal)
    //   2. findFirst hasilUjian (cek sudah submit)
    //   3. Promise.all N upsert jawaban  ← N query paralel = masalah besar
    //   4. for loop hitung nilai         ← tidak perlu, bisa di DB
    //   5. create hasilUjian
    // = bisa 3 + N query!
    //
    // Sekarang: 1 transaction dengan query yang jauh lebih efisien
    const hasil = await prisma.$transaction(async (tx) => {
      // Query 1: cek ujian ada + ambil soal — select HANYA field yang diperlukan
      const ujian = await tx.ujian.findUnique({
        where:  { id: ujianId },
        select: {
          id:     true,
          status: true,
          soal: {
            select: {
              id:           true,
              tipe:         true,
              kunciJawaban: true,
              bobot:        true,
            },
          },
        },
      })

      if (!ujian) {
        throw new Error("UJIAN_NOT_FOUND")
      }

      // Query 2: cek sudah submit (select minimal)
      const sudahSubmit = await tx.hasilUjian.findFirst({
        where:  { userId, ujianId },
        select: { id: true },
      })

      if (sudahSubmit) {
        throw new Error("SUDAH_SUBMIT")
      }

      // ✅ FIX: Buat lookup map jawaban dari client — O(1) akses per soal
      const jawabanMap = new Map(
        jawaban.map((j) => [j.soalId, j.jawaban])
      )

      // ✅ FIX: Hitung nilai di JS dengan lookup map — tidak perlu query tambahan
      // Semua data soal sudah ada dari query pertama
      let totalBobot = 0
      let nilaiDapat = 0

      for (const soal of ujian.soal) {
        totalBobot += soal.bobot
        if (soal.tipe === "PILIHAN_GANDA" && soal.kunciJawaban) {
          const jwb = jawabanMap.get(soal.id)
          if (jwb && jwb === soal.kunciJawaban) {
            nilaiDapat += soal.bobot
          }
        }
      }

      const nilai = totalBobot > 0 ? (nilaiDapat / totalBobot) * 100 : 0
      const KKM   = 70
      const lulus  = nilai >= KKM

      // ✅ FIX: Simpan jawaban dengan createMany (1 query) bukan N upsert
      // Sebelumnya: Promise.all(jawaban.map(j => prisma.jawaban.upsert(...)))
      // = N query paralel yang membebani koneksi DB pool
      //
      // Catatan: createMany tidak support upsert di semua DB
      // Tapi untuk submit pertama (sudah dicek di atas), createMany aman
      if (jawaban.length > 0) {
        await tx.jawaban.createMany({
          data: jawaban.map((j) => ({
            userId,
            soalId:  j.soalId,
            jawaban: j.jawaban,
          })),
          skipDuplicates: true, // aman jika ada duplikat soalId dari client
        })
      }

      // Query terakhir: simpan hasil ujian
      const hasilBaru = await tx.hasilUjian.create({
        data: {
          userId,
          ujianId,
          nilai,
          lulus,
          selesaiAt: new Date(),
        },
        select: {
          id:        true,
          nilai:     true,
          lulus:     true,
          selesaiAt: true,
        },
      })

      return { hasil: hasilBaru, nilai, lulus }
    })

    return NextResponse.json(
      {
        message: "Ujian berhasil dikumpulkan",
        hasil:   hasil.hasil,
        nilai:   hasil.nilai,
        lulus:   hasil.lulus,
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error?.message === "UJIAN_NOT_FOUND") {
      return NextResponse.json({ error: "Ujian tidak ditemukan" }, { status: 404 })
    }
    if (error?.message === "SUDAH_SUBMIT") {
      return NextResponse.json({ error: "Anda sudah mengumpulkan ujian ini" }, { status: 409 })
    }
    console.error("POST /api/ujian/[id]/submit error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}