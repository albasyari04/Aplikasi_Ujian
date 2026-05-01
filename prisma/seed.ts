import { PrismaClient } from "@prisma/client"
import bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Mulai seeding database...")

  const saltRounds = 10
  const passwordAdmin  = await bcryptjs.hash("admin123", saltRounds)
  const passwordGuru   = await bcryptjs.hash("guru123", saltRounds)
  const passwordSiswa1 = await bcryptjs.hash("siswa123", saltRounds)
  const passwordSiswa2 = await bcryptjs.hash("siswa123", saltRounds)

  // ── USERS ─────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@sma-istiqomah.sch.id" },
    update: {},
    create: {
      nama: "Administrator",
      email: "admin@sma-istiqomah.sch.id",
      password: passwordAdmin,
      role: "ADMIN",
    },
  })

  const guru = await prisma.user.upsert({
    where: { email: "guru@sma-istiqomah.sch.id" },
    update: {},
    create: {
      nama: "Budi Santoso",
      email: "guru@sma-istiqomah.sch.id",
      password: passwordGuru,
      role: "GURU",
    },
  })

  // ✅ FIX 1: update: { kelas } agar kelas ter-update jika user sudah ada
  // tapi field kelas masih kosong/null dari seed lama
  const siswa1 = await prisma.user.upsert({
    where: { email: "andi@sma-istiqomah.sch.id" },
    update: { kelas: "XII IPA 1" },
    create: {
      nama: "Andi Pratama",
      email: "andi@sma-istiqomah.sch.id",
      password: passwordSiswa1,
      role: "SISWA",
      nis: "2024001",
      kelas: "XII IPA 1",
    },
  })

  // ✅ FIX 2: siti diubah ke "XII IPA 1" agar bisa melihat ujian yang sama
  // Sebelumnya "XII IPA 2" → ujian kelas "XII IPA 1" tidak pernah muncul untuk siti
  const siswa2 = await prisma.user.upsert({
    where: { email: "siti@sma-istiqomah.sch.id" },
    update: { kelas: "XII IPA 1" },
    create: {
      nama: "Siti Rahayu",
      email: "siti@sma-istiqomah.sch.id",
      password: passwordSiswa2,
      role: "SISWA",
      nis: "2024002",
      kelas: "XII IPA 1", // ✅ sama persis dengan ujian di bawah
    },
  })

  // ── UJIAN SEED ────────────────────────────────────────────────
  // ✅ FIX 3: tambah ujian awal berstatus AKTIF
  // Tanpa ini DB kosong → siswa tidak melihat ujian apapun saat pertama login
  const ujian1 = await prisma.ujian.upsert({
    where: { id: "seed-ujian-001" },
    update: {},
    create: {
      id: "seed-ujian-001",
      judul: "Ulangan Harian Matematika Peminatan",
      mapel: "Matematika",
      guru: "Budi Santoso",
      kelas: "XII IPA 1",  // ✅ HARUS sama persis dengan kelas siswa
      status: "AKTIF",      // ✅ AKTIF → muncul di halaman siswa
      tanggal: new Date("2026-04-27T00:00:00"),
      waktuMulai: new Date("2026-04-27T08:00:00"),
      waktuSelesai: new Date("2026-04-27T09:30:00"),
      durasi: 90,
    },
  })

  const ujian2 = await prisma.ujian.upsert({
    where: { id: "seed-ujian-002" },
    update: {},
    create: {
      id: "seed-ujian-002",
      judul: "Ulangan Harian Bahasa Indonesia",
      mapel: "Bahasa Indonesia",
      guru: "Budi Santoso",
      kelas: "XII IPA 1",
      status: "AKTIF",
      tanggal: new Date("2026-04-28T00:00:00"),
      waktuMulai: new Date("2026-04-28T10:00:00"),
      waktuSelesai: new Date("2026-04-28T11:00:00"),
      durasi: 60,
    },
  })

  const ujian3 = await prisma.ujian.upsert({
    where: { id: "seed-ujian-003" },
    update: {},
    create: {
      id: "seed-ujian-003",
      judul: "Latihan Soal Kimia Bab 5",
      mapel: "Kimia",
      guru: "Budi Santoso",
      kelas: "XII IPA 1",
      status: "DRAFT",      // 🔒 DRAFT → tidak muncul di siswa (contoh)
      tanggal: new Date("2026-04-30T00:00:00"),
      waktuMulai: new Date("2026-04-30T13:00:00"),
      waktuSelesai: new Date("2026-04-30T14:30:00"),
      durasi: 90,
    },
  })

  // ── LOG ───────────────────────────────────────────────────────
  console.log("✅ Seeding selesai! Akun yang dibuat:")
  console.log("")
  console.log("┌─────────────────────────────────────────────────────────────┐")
  console.log("│                     AKUN TEST LOGIN                        │")
  console.log("├──────────┬──────────────────────────────────┬──────────────┤")
  console.log("│  Role    │  Email                           │  Password    │")
  console.log("├──────────┼──────────────────────────────────┼──────────────┤")
  console.log(`│  ADMIN   │  ${admin.email.padEnd(32)}  │  admin123    │`)
  console.log(`│  GURU    │  ${guru.email.padEnd(32)}  │  guru123     │`)
  console.log(`│  SISWA   │  ${siswa1.email.padEnd(32)}  │  siswa123    │`)
  console.log(`│  SISWA   │  ${siswa2.email.padEnd(32)}  │  siswa123    │`)
  console.log("└──────────┴──────────────────────────────────┴──────────────┘")
  console.log("")
  console.log("📋 Ujian yang di-seed:")
  console.log(`  ✅ AKTIF - ${ujian1.judul} (${ujian1.kelas})`)
  console.log(`  ✅ AKTIF - ${ujian2.judul} (${ujian2.kelas})`)
  console.log(`  🔒 DRAFT - ${ujian3.judul} (tidak muncul di siswa)`)
  console.log("")
  console.log("Redirect setelah login:")
  console.log("  ADMIN  → /admin/dashboard")
  console.log("  GURU   → /admin/dashboard")
  console.log("  SISWA  → /dashboard")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed gagal:", e)
    await prisma.$disconnect()
    process.exit(1)
  })