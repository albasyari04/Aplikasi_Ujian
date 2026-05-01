// lib/auth.ts
import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"

// ── Type augmentation ────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      nama: string        // ✅ tambah: alias konsisten dengan DB & seluruh komponen
      role: string
      kelas: string | null
      image?: string | null
    }
  }

  interface User {
    role?: string
    nama?: string        // ✅ tambah
    kelas?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    nama: string        // ✅ tambah
    kelas: string | null
  }
}

// ── Auth Options ─────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@sekolah.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi")
        }

        try {
          const { prisma } = await import("./prisma")

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) throw new Error("Email atau password salah")

          const passwordMatch = await bcryptjs.compare(
            credentials.password,
            user.password
          )

          if (!passwordMatch) throw new Error("Email atau password salah")

          return {
            id: user.id,
            email: user.email,
            name: user.nama,   // next-auth default field
            nama: user.nama,   // ✅ field kustom agar konsisten
            role: user.role,
            kelas: user.kelas ?? null,
            image: user.fotoProfil ?? null,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw new Error("Email atau password salah")
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id    = (user as any).id
        token.nama  = (user as any).nama  // ✅ simpan nama ke token
        token.role  = (user as any).role || "SISWA"
        token.kelas = (user as any).kelas ?? null
        token.email = user.email
        token.name  = user.name
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.id    as string
        session.user.nama  = token.nama  as string  // ✅ expose ke client
        session.user.role  = token.role  as string
        session.user.kelas = token.kelas ?? null
        session.user.email = token.email as string
        session.user.name  = token.name  as string
      }
      return session
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`✅ User signed in: ${user.email}`)
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}