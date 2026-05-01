import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

export interface Soal {
  id: string
  ujianId: string
  nomor: number
  pertanyaan: string
  tipe: "PILIHAN_GANDA" | "ESSAY"
  opsiA?: string | null
  opsiB?: string | null
  opsiC?: string | null
  opsiD?: string | null
  opsiE?: string | null
  kunciJawaban?: string | null
  bobot: number
}

export interface Ujian {
  id: string
  judul: string
  mapel: string
  guru: string
  tanggal: string
  waktuMulai: string
  waktuSelesai: string
  durasi: number
  soal?: Soal[]
}

export interface JawabanSiswa {
  [soalId: string]: string // soalId -> jawaban
}

interface UjianState {
  // Data Ujian
  ujianAktif: Ujian | null
  soalList: Soal[]
  currentSoalIndex: number

  // Jawaban & Progress
  jawabanSiswa: JawabanSiswa
  soalTerjawab: string[] // list soalId yang sudah dijawab
  soalDitandai: string[] // list soalId yang ditandai

  // Timer & Status
  waktuTersisa: number // dalam detik
  isSubmitting: boolean
  isUjianSelesai: boolean
  errorMessage: string | null

  // Actions
  setUjianAktif: (ujian: Ujian) => void
  setSoalList: (soal: Soal[]) => void
  setCurrentSoal: (index: number) => void
  setJawaban: (soalId: string, jawaban: string) => void
  getJawaban: (soalId: string) => string | undefined
  tandaiSoal: (soalId: string) => void
  hapusTandaiSoal: (soalId: string) => void
  isSoalTandai: (soalId: string) => boolean
  isSoalTerjawab: (soalId: string) => boolean
  setWaktuTersisa: (detik: number) => void
  kurangiWaktu: () => void
  setIsSubmitting: (value: boolean) => void
  setIsUjianSelesai: (value: boolean) => void
  setErrorMessage: (message: string | null) => void
  goToSoal: (index: number) => void
  goToSoalBerikutnya: () => void
  goToSoalSebelumnya: () => void
  resetUjian: () => void
  getProgressUjian: () => {
    totalSoal: number
    terjawab: number
    tandai: number
    kosong: number
    persentase: number
  }
}

export const useUjianStore = create<UjianState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        ujianAktif: null,
        soalList: [],
        currentSoalIndex: 0,
        jawabanSiswa: {},
        soalTerjawab: [],
        soalDitandai: [],
        waktuTersisa: 0,
        isSubmitting: false,
        isUjianSelesai: false,
        errorMessage: null,

        // Set ujian aktif
        setUjianAktif: (ujian) =>
          set(() => ({
            ujianAktif: ujian,
            waktuTersisa: ujian.durasi * 60, // durasi dalam menit, convert ke detik
          })),

        // Set daftar soal
        setSoalList: (soal) => set({ soalList: soal }),

        // Set soal saat ini (navigate to soal)
        setCurrentSoal: (index) => {
          const { soalList } = get()
          if (index >= 0 && index < soalList.length) {
            set({ currentSoalIndex: index })
          }
        },

        // Simpan jawaban
        setJawaban: (soalId, jawaban) =>
          set((state) => {
            const jawabanBaru = { ...state.jawabanSiswa, [soalId]: jawaban }
            const soalTerjawabBaru = Array.from(
              new Set([...state.soalTerjawab, soalId])
            )
            return {
              jawabanSiswa: jawabanBaru,
              soalTerjawab: soalTerjawabBaru,
            }
          }),

        // Get jawaban soal tertentu
        getJawaban: (soalId) => {
          const { jawabanSiswa } = get()
          return jawabanSiswa[soalId]
        },

        // Tandai soal untuk review
        tandaiSoal: (soalId) =>
          set((state) => ({
            soalDitandai: Array.from(new Set([...state.soalDitandai, soalId])),
          })),

        // Hapus tandai
        hapusTandaiSoal: (soalId) =>
          set((state) => ({
            soalDitandai: state.soalDitandai.filter((id) => id !== soalId),
          })),

        // Check apakah soal ditandai
        isSoalTandai: (soalId) => {
          const { soalDitandai } = get()
          return soalDitandai.includes(soalId)
        },

        // Check apakah soal sudah dijawab
        isSoalTerjawab: (soalId) => {
          const { soalTerjawab } = get()
          return soalTerjawab.includes(soalId)
        },

        // Set waktu tersisa
        setWaktuTersisa: (detik) => set({ waktuTersisa: detik }),

        // Kurangi waktu setiap detik
        kurangiWaktu: () =>
          set((state) => {
            const waktiBaru = Math.max(0, state.waktuTersisa - 1)
            return {
              waktuTersisa: waktiBaru,
              isUjianSelesai: waktiBaru === 0,
            }
          }),

        // Set status submitting
        setIsSubmitting: (value) => set({ isSubmitting: value }),

        // Set status ujian selesai
        setIsUjianSelesai: (value) => set({ isUjianSelesai: value }),

        // Set error message
        setErrorMessage: (message) => set({ errorMessage: message }),

        // Navigate ke soal tertentu
        goToSoal: (index) => {
          const { soalList } = get()
          if (index >= 0 && index < soalList.length) {
            set({ currentSoalIndex: index })
          }
        },

        // Navigate ke soal berikutnya
        goToSoalBerikutnya: () => {
          const { currentSoalIndex, soalList } = get()
          if (currentSoalIndex < soalList.length - 1) {
            set({ currentSoalIndex: currentSoalIndex + 1 })
          }
        },

        // Navigate ke soal sebelumnya
        goToSoalSebelumnya: () => {
          const { currentSoalIndex } = get()
          if (currentSoalIndex > 0) {
            set({ currentSoalIndex: currentSoalIndex - 1 })
          }
        },

        // Reset semua state ujian
        resetUjian: () =>
          set({
            ujianAktif: null,
            soalList: [],
            currentSoalIndex: 0,
            jawabanSiswa: {},
            soalTerjawab: [],
            soalDitandai: [],
            waktuTersisa: 0,
            isSubmitting: false,
            isUjianSelesai: false,
            errorMessage: null,
          }),

        // Get progress ujian
        getProgressUjian: () => {
          const { soalList, soalTerjawab, soalDitandai } = get()
          const totalSoal = soalList.length
          const terjawab = soalTerjawab.length
          const tandai = soalDitandai.length
          const kosong = totalSoal - terjawab

          return {
            totalSoal,
            terjawab,
            tandai,
            kosong,
            persentase: totalSoal > 0 ? (terjawab / totalSoal) * 100 : 0,
          }
        },
      }),
      {
        name: "ujian-storage", // key di localStorage
        // Simpan hanya data yang penting, jangan simpan soal yang terlalu besar
        partialize: (state) => ({
          jawabanSiswa: state.jawabanSiswa,
          soalTerjawab: state.soalTerjawab,
          soalDitandai: state.soalDitandai,
          waktuTersisa: state.waktuTersisa,
        }),
      }
    )
  )
)
