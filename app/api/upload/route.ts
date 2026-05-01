// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// ── Konstanta ─────────────────────────────────────────────────
const MAX_SIZE     = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  // ── Auth check ───────────────────────────────────────────────
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("foto") as File | null

    // ── Validasi file ada ────────────────────────────────────────
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    // ── Validasi tipe file ───────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Gunakan JPG, PNG, atau WEBP." },
        { status: 400 }
      )
    }

    // ── Validasi ukuran file ─────────────────────────────────────
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 2MB." },
        { status: 400 }
      )
    }

    // ── Buat folder jika belum ada ───────────────────────────────
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profil")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // ── Generate nama file unik berdasarkan userId + timestamp ───
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const fileName = `${session.user.id}-${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, fileName)

    // ── Tulis file ke disk ───────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // ── URL publik yang akan disimpan ke DB ──────────────────────
    const fotoUrl = `/uploads/profil/${fileName}`

    // ── Update fotoProfil di database ────────────────────────────
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data:  { fotoProfil: fotoUrl },
      select: {
        id:         true,
        nama:       true,
        email:      true,
        role:       true,
        nis:        true,
        kelas:      true,
        fotoProfil: true,
        createdAt:  true,
      },
    })

    return NextResponse.json(
      {
        message: "Foto profil berhasil diperbarui",
        fotoUrl,
        user:    updatedUser,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Gagal mengunggah foto. Coba lagi." },
      { status: 500 }
    )
  }
}