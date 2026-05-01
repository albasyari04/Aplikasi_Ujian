import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BuatSoalClient } from "./BuatSoalClient"

async function getUjianList() {
  return prisma.ujian.findMany({
    select: { id: true, judul: true, mapel: true },
    orderBy: { tanggal: "desc" },
  })
}

export default async function BuatSoalPage() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    redirect("/login")
  }

  const ujianList = await getUjianList()
  return <BuatSoalClient ujianList={ujianList} />
}