// app/api/siswa/route.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"

// Guard: hanya ADMIN dan GURU
async function guardAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
    return null
  }
  return session
}

// GET /api/siswa — daftar semua siswa
export async function GET(req: NextRequest) {
  const session = await guardAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const kelas = searchParams.get("kelas") ?? ""

  const siswa = await prisma.user.findMany({
    where: {
      role: "SISWA",
      ...(q
        ? {
            OR: [
              { nama: { contains: q } },
              { email: { contains: q } },
              { nis: { contains: q } },
            ],
          }
        : {}),
      ...(kelas ? { kelas: { contains: kelas } } : {}),
    },
    select: {
      id: true,
      nama: true,
      email: true,
      nis: true,
      kelas: true,
      fotoProfil: true,
      createdAt: true,
      _count: { select: { hasilUjian: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(siswa)
}

// POST /api/siswa — tambah siswa baru
export async function POST(req: NextRequest) {
  const session = await guardAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { nama, email, password, nis, kelas } = body

    if (!nama || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      )
    }

    const hashed = await bcryptjs.hash(password, 10)
    const siswa = await prisma.user.create({
      data: { nama, email, password: hashed, role: "SISWA", nis, kelas },
      select: { id: true, nama: true, email: true, nis: true, kelas: true, createdAt: true },
    })

    return NextResponse.json(siswa, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Gagal menambah siswa" }, { status: 500 })
  }
}