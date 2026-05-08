// app/(admin)/admin/ujian/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { KelolaUjianClient } from "./KelolaUjianClient"

// ✅ FIX: Cache ujian list untuk 60 detik
export const revalidate = 60

async function getUjianList() {
  return prisma.ujian.findMany({
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
    orderBy: { tanggal: "desc" },
  })
}

export default async function AdminUjianPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const ujianList = await getUjianList()
  return <KelolaUjianClient ujianList={ujianList} />
}