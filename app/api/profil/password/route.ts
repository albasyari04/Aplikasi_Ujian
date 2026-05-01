// app/api/profil/password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { changePasswordSchema } from "@/lib/validasi"
import bcryptjs from "bcryptjs"

// PATCH /api/profil/password — ganti password
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      )
    }

    const { passwordLama, passwordBaru } = parsed.data

    // Ambil user beserta hash password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    // Verifikasi password lama
    const isMatch = await bcryptjs.compare(passwordLama, user.password)
    if (!isMatch) {
      return NextResponse.json({ message: "Password lama tidak sesuai" }, { status: 400 })
    }

    // Hash password baru
    const hashedBaru = await bcryptjs.hash(passwordBaru, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedBaru },
    })

    return NextResponse.json({ message: "Password berhasil diubah" })
  } catch (error) {
    console.error("PATCH /api/profil/password error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}