import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInSeconds, formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

// Class Merge Utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format tanggal ke format lokal Indonesia
export function formatTanggal(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd MMMM yyyy", { locale: id })
}

// Format tanggal dengan jam
export function formatTanggalJam(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "dd MMMM yyyy HH:mm", { locale: id })
}

// Format hanya jam
export function formatJam(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return format(d, "HH:mm", { locale: id })
}

// Format waktu relatif (e.g., "2 jam lalu")
export function formatWaktuRelatif(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: id })
}

// Hitung selisih waktu dalam detik
export function hitungSelisihDetik(tanggalMulai: Date, tanggalSelesai: Date) {
  return differenceInSeconds(tanggalSelesai, tanggalMulai)
}

// Format durasi menjadi jam:menit:detik
export function formatDurasi(detik: number) {
  const jam = Math.floor(detik / 3600)
  const menit = Math.floor((detik % 3600) / 60)
  const sisa = detik % 60

  const parts = []
  if (jam > 0) parts.push(`${jam}j`)
  if (menit > 0) parts.push(`${menit}m`)
  if (sisa > 0 || parts.length === 0) parts.push(`${sisa}d`)

  return parts.join(" ")
}

// Konversi durasi dalam menit ke jam:menit
export function formatDurasiMenit(menit: number) {
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  if (jam > 0) {
    return `${jam} jam ${sisa} menit`
  }
  return `${sisa} menit`
}

// Cek apakah ujian masih berlangsung
export function ujianBerlangsung(
  waktuMulai: Date,
  waktuSelesai: Date,
  now?: Date
) {
  const sekarang = now || new Date()
  return sekarang >= waktuMulai && sekarang <= waktuSelesai
}

// Cek apakah ujian sudah selesai
export function ujianSelesai(waktuSelesai: Date, now?: Date) {
  const sekarang = now || new Date()
  return sekarang > waktuSelesai
}

// Cek apakah ujian belum dimulai
export function ujianBelumDimulai(waktuMulai: Date, now?: Date) {
  const sekarang = now || new Date()
  return sekarang < waktuMulai
}

// Hitung nilai berdasarkan jawaban
export function hitungNilai(
  jawabanBenar: number,
  totalSoal: number,
  skalaMax: number = 100
) {
  return (jawabanBenar / totalSoal) * skalaMax
}

// Cek apakah siswa lulus (KKM 70)
export function cekLulus(nilai: number, kkm: number = 70) {
  return nilai >= kkm
}

// Slug generator
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

// Truncate text
export function truncate(text: string, length: number = 100) {
  if (text.length <= length) return text
  return text.substring(0, length) + "..."
}

// Generate random string
export function generateRandomString(length: number = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Hash password (untuk client-side hashing jika diperlukan)
// Gunakan bcryptjs di server-side untuk password storage
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Get initials dari nama
export function getInitials(nama: string) {
  return nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Decode JWT tanpa verifikasi (hanya untuk membaca payload)
export function decodeToken(token: string) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const decoded = JSON.parse(Buffer.from(parts[1], "base64").toString())
    return decoded
  } catch {
    return null
  }
}
