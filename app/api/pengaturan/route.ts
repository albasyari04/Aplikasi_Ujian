// app/api/pengaturan/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
import { z } from "zod"

// ── Schema validasi ────────────────────────────────────────────
const updateProfilSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter").optional(),
  nis: z.string().optional(),
  kelas: z.string().optional(),
  fotoProfil: z.string().url("URL foto tidak valid").optional().nullable(),
})

const changePasswordSchema = z
  .object({
    passwordLama: z.string().min(6, "Password lama minimal 6 karakter"),
    passwordBaru: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.passwordBaru === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  })

// ── GET: ambil data pengaturan user ───────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  return NextResponse.json({ user })
}

// ── PATCH: update profil atau ganti password ──────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { action } = body

  // ── Update Profil ──────────────────────────────────────────
  if (action === "update_profil") {
    const parsed = updateProfilSchema.safeParse(body.data)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
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

    return NextResponse.json({ user: updated, message: "Profil berhasil diperbarui" })
  }

  // ── Ganti Password ────────────────────────────────────────
  if (action === "change_password") {
    const parsed = changePasswordSchema.safeParse(body.data)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const match = await bcryptjs.compare(parsed.data.passwordLama, user.password)
    if (!match) {
      return NextResponse.json({ error: "Password lama tidak sesuai" }, { status: 400 })
    }

    const hashed = await bcryptjs.hash(parsed.data.passwordBaru, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "Password berhasil diperbarui" })
  }

  return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 })
}