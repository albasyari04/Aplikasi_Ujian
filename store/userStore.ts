import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

export interface User {
  id: string
  nama: string
  email: string
  role: "SISWA" | "GURU" | "ADMIN"
  nis?: string
  kelas?: string
  fotoProfil?: string | null
  createdAt?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  errorMessage: string | null
}

interface UserStore extends AuthState {
  // Auth Actions
  setUser: (user: User) => void
  clearUser: () => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  setErrorMessage: (message: string | null) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>

  // User Info Actions
  updateUser: (userData: Partial<User>) => void
  updateNama: (nama: string) => void
  updateEmail: (email: string) => void
  updateFotoProfil: (url: string) => void
  updateKelas: (kelas: string) => void
  updateNis: (nis: string) => void

  // Role Check
  isSiswa: () => boolean
  isGuru: () => boolean
  isAdmin: () => boolean
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        errorMessage: null,

        // Set user (setelah login)
        setUser: (user) =>
          set({
            user,
            isAuthenticated: true,
            errorMessage: null,
          }),

        // Clear user (setelah logout)
        clearUser: () =>
          set({
            user: null,
            isAuthenticated: false,
            errorMessage: null,
          }),

        // Set loading status
        setIsLoading: (value) => set({ isLoading: value }),

        // Set authentication status
        setIsAuthenticated: (value) => set({ isAuthenticated: value }),

        // Set error message
        setErrorMessage: (message) => set({ errorMessage: message }),

        // Login function
        login: async (email: string, password: string) => {
          set({ isLoading: true, errorMessage: null })
          try {
            const response = await fetch("/api/auth/signin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
              throw new Error("Login gagal")
            }

            const data = await response.json()
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              errorMessage: null,
            })
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Login gagal"
            set({
              isLoading: false,
              errorMessage: message,
            })
            throw error
          }
        },

        // Logout function
        logout: async () => {
          set({ isLoading: true })
          try {
            await fetch("/api/auth/signout", { method: "POST" })
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              errorMessage: null,
            })
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Logout gagal"
            set({
              isLoading: false,
              errorMessage: message,
            })
          }
        },

        // Update user data
        updateUser: (userData) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          })),

        // Update nama
        updateNama: (nama) =>
          set((state) => ({
            user: state.user ? { ...state.user, nama } : null,
          })),

        // Update email
        updateEmail: (email) =>
          set((state) => ({
            user: state.user ? { ...state.user, email } : null,
          })),

        // Update foto profil
        updateFotoProfil: (fotoProfil) =>
          set((state) => ({
            user: state.user ? { ...state.user, fotoProfil } : null,
          })),

        // Update kelas
        updateKelas: (kelas) =>
          set((state) => ({
            user: state.user ? { ...state.user, kelas } : null,
          })),

        // Update NIS
        updateNis: (nis) =>
          set((state) => ({
            user: state.user ? { ...state.user, nis } : null,
          })),

        // Check role - Siswa
        isSiswa: () => {
          const { user } = get()
          return user?.role === "SISWA"
        },

        // Check role - Guru
        isGuru: () => {
          const { user } = get()
          return user?.role === "GURU"
        },

        // Check role - Admin
        isAdmin: () => {
          const { user } = get()
          return user?.role === "ADMIN"
        },
      }),
      {
        name: "user-storage", // key di localStorage
        // Simpan user data ke localStorage untuk persistence
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
)

// Hooks untuk penggunaan yang lebih mudah
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, errorMessage } = useUserStore()
  return { user, isAuthenticated, isLoading, errorMessage }
}

export const useIsAdmin = () => {
  const isAdmin = useUserStore((state) => state.isAdmin())
  return isAdmin
}

export const useIsGuru = () => {
  const isGuru = useUserStore((state) => state.isGuru())
  return isGuru
}

export const useIsSiswa = () => {
  const isSiswa = useUserStore((state) => state.isSiswa())
  return isSiswa
}
