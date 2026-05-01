// app/api/profil/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProfilSchema } from "@/lib/validasi"

// GET /api/profil — ambil profil user yang sedang login
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        nis: true,
        kelas: true,
        fotoProfil: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("GET /api/profil error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// PATCH /api/profil — update profil user yang sedang login
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validasi dengan zod
    const parsed = updateProfilSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      )
    }

    const { nama, email, nis, kelas, fotoProfil } = parsed.data

    // Cek email tidak dipakai user lain
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: session.user.id },
        },
      })
      if (existing) {
        return NextResponse.json({ message: "Email sudah digunakan akun lain" }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(nama && { nama }),
        ...(email && { email }),
        ...(nis !== undefined && { nis }),
        ...(kelas !== undefined && { kelas }),
        ...(fotoProfil !== undefined && { fotoProfil }),
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        nis: true,
        kelas: true,
        fotoProfil: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ message: "Profil berhasil diperbarui", user: updated })
  } catch (error) {
    console.error("PATCH /api/profil error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}