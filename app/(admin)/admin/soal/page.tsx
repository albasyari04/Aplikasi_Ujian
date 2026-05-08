// app/(admin)/admin/soal/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { KelolaSoalClient } from "./KelolaSoalClient"

// ✅ FIX BUG 1: Hapus `revalidate = 60` — cache 60 detik menyebabkan data
// tidak update setelah import. Dengan dynamic rendering, data selalu fresh.
// Jika ingin caching tetap ada, ubah ke revalidate = 0 agar selalu re-fetch.
export const dynamic = "force-dynamic"

async function getSoalData() {
  const [soalList, ujianList, totalSoal] = await Promise.all([
    prisma.soal.findMany({
      select: {
        id: true,
        nomor: true,
        pertanyaan: true,
        tipe: true,
        bobot: true,
        kunciJawaban: true,
        opsiA: true,
        opsiB: true,
        opsiC: true,
        opsiD: true,
        opsiE: true,
        ujianId: true,
        ujian: {
          select: { id: true, judul: true, mapel: true, guru: true },
        },
      },
      orderBy: [{ ujianId: "asc" }, { nomor: "asc" }],
      take: 100, // Initial load 100 soal, rest via API pagination
    }),
    prisma.ujian.findMany({
      select: { id: true, judul: true, mapel: true },
      orderBy: { tanggal: "desc" },
    }),
    prisma.soal.count(),
  ])

  return { soalList, ujianList, totalSoal }
}

export default async function AdminSoalPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const data = await getSoalData()
  return <KelolaSoalClient data={data} />
}