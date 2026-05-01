import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      )
    }

    // Fetch data lengkap user dari database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        nis: true,
        kelas: true,
        fotoProfil: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetch user:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data user" },
      { status: 500 }
    )
  }
}
