// app/(admin)/admin/soal/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { KelolaSoalClient } from "./KelolaSoalClient"

async function getSoalData() {
  const [soalList, ujianList] = await Promise.all([
    prisma.soal.findMany({
      include: {
        ujian: {
          select: { id: true, judul: true, mapel: true, guru: true },
        },
      },
      orderBy: [{ ujianId: "asc" }, { nomor: "asc" }],
    }),
    prisma.ujian.findMany({
      select: { id: true, judul: true, mapel: true },
      orderBy: { tanggal: "desc" },
    }),
  ])

  return { soalList, ujianList }
}

export default async function AdminSoalPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const data = await getSoalData()
  return <KelolaSoalClient data={data} />
}