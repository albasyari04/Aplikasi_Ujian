// app/api/siswa/[id]/route.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"

async function guardAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) return null
  return session
}

// PATCH /api/siswa/[id] — edit siswa
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await guardAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { nama, email, password, nis, kelas } = body

    const updateData: Record<string, string> = {}
    if (nama) updateData.nama = nama
    if (email) updateData.email = email
    if (nis !== undefined) updateData.nis = nis
    if (kelas !== undefined) updateData.kelas = kelas
    if (password) updateData.password = await bcryptjs.hash(password, 10)

    const siswa = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, nama: true, email: true, nis: true, kelas: true, createdAt: true },
    })

    return NextResponse.json(siswa)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal mengupdate siswa" }, { status: 500 })
  }
}

// DELETE /api/siswa/[id] — hapus siswa
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await guardAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal menghapus siswa" }, { status: 500 })
  }
}