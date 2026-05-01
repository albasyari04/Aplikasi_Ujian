import { z } from "zod"

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    nama: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    nis: z.string().optional(),
    kelas: z.string().optional(),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof registerSchema>

// Soal Schemas
export const soalSchema = z.object({
  nomor: z.number().int().positive("Nomor soal harus positif"),
  pertanyaan: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  tipe: z.enum(["PILIHAN_GANDA", "ESSAY"]),
  opsiA: z.string().optional().nullable(),
  opsiB: z.string().optional().nullable(),
  opsiC: z.string().optional().nullable(),
  opsiD: z.string().optional().nullable(),
  opsiE: z.string().optional().nullable(),
  kunciJawaban: z.string().optional().nullable(),
  bobot: z.number().int().positive().default(1),
})

export type SoalInput = z.infer<typeof soalSchema>

// Ujian Schemas
export const ujianSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  mapel: z.string().min(2, "Mata pelajaran minimal 2 karakter"),
  guru: z.string().min(3, "Nama guru minimal 3 karakter"),
  tanggal: z.date(),
  waktuMulai: z.date(),
  waktuSelesai: z.date(),
  durasi: z.number().int().positive("Durasi harus positif (dalam menit)"),
})

export type UjianInput = z.infer<typeof ujianSchema>

// Jawaban Schemas
export const jawabanSchema = z.object({
  soalId: z.string().cuid("ID Soal tidak valid"),
  jawaban: z.string().min(1, "Jawaban tidak boleh kosong"),
})

export type JawabanInput = z.infer<typeof jawabanSchema>

export const submitUjianSchema = z.array(jawabanSchema)

export type SubmitUjianInput = z.infer<typeof submitUjianSchema>

// Update User Profile
export const updateProfilSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  nis: z.string().optional(),
  kelas: z.string().optional(),
  fotoProfil: z.string().url("URL foto tidak valid").optional().nullable(),
})

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>

// Change Password
export const changePasswordSchema = z
  .object({
    passwordLama: z.string().min(6, "Password minimal 6 karakter"),
    passwordBaru: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.passwordBaru === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
