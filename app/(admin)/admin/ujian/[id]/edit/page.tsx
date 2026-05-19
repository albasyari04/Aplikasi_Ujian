// app/(admin)/admin/ujian/[id]/edit/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EditUjianClient } from "./EditUjianClient"

export const revalidate = 5

async function getUjianById(id: string) {
  return prisma.ujian.findUnique({
    where: { id },
    select: {
      id: true,
      judul: true,
      mapel: true,
      guru: true,
      kelas: true,
      status: true,
      tanggal: true,
      waktuMulai: true,
      waktuSelesai: true,
      durasi: true,
      _count: { select: { soal: true, hasil: true } },
    },
  })
}

export default async function EditUjianPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const { id } = await params
  const ujian = await getUjianById(id)

  if (!ujian) {
    redirect("/admin/ujian")
  }

  // Convert dates to ISO strings for form (YYYY-MM-DD and HH:MM format)
  const tanggal = new Date(ujian.tanggal).toISOString().split("T")[0]
  const waktuMulai = new Date(ujian.waktuMulai)
    .toISOString()
    .split("T")[1]
    .slice(0, 5)
  const waktuSelesai = new Date(ujian.waktuSelesai)
    .toISOString()
    .split("T")[1]
    .slice(0, 5)

  const initialData = {
    ...ujian,
    tanggal,
    waktuMulai,
    waktuSelesai,
  }

  return <EditUjianClient initialData={initialData} />
}
