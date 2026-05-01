// lib/translations.ts
// Tambahkan key baru di sini sesuai kebutuhan

export const translations = {
  id: {
    // ── Sidebar / Nav ──────────────────────────────────────
    menuUtama:        "MENU UTAMA",
    dashboard:        "Dashboard",
    ujian:            "Ujian",
    jadwal:           "Jadwal",
    akademik:         "AKADEMIK",
    nilai:            "Nilai",
    riwayat:          "Riwayat",
    notifikasi:       "Notifikasi",
    akun:             "AKUN",
    profil:           "Profil",
    pengaturan:       "Pengaturan",

    // ── Navbar ─────────────────────────────────────────────
    editProfil:       "Edit Profil",
    keluar:           "Keluar",

    // ── Pengaturan ─────────────────────────────────────────
    pengaturanTitle:  "Pengaturan",
    pengaturanDesc:   "Kelola akun dan preferensi Anda",
    tabProfil:        "Profil",
    tabKeamanan:      "Keamanan",
    tabTampilan:      "Tampilan",
    tabNotifikasi:    "Notifikasi",
    tabSesiAkun:      "Sesi & Akun",

    // ── TampilanCard ───────────────────────────────────────
    tampilanTitle:    "Tampilan & Preferensi",
    tampilanDesc:     "Sesuaikan tampilan aplikasi",
    temaWarna:        "Tema Warna",
    temaTerang:       "Terang",
    temaGelap:        "Gelap",
    temaSistem:       "Sistem",
    temaTerangDesc:   "Tampilan cerah",
    temaGelapDesc:    "Hemat baterai",
    temaSistemDesc:   "Ikuti perangkat",
    ukuranTeks:       "Ukuran Teks",
    ukuranKecil:      "Kecil",
    ukuranNormal:     "Normal",
    ukuranBesar:      "Besar",
    previewTeks:      "Preview: Teks akan tampil seperti ini di seluruh aplikasi.",
    ukuranSaatIni:    "Ukuran saat ini",
    bahasaLabel:      "Bahasa",
    bahasaNote:       "* Perubahan bahasa berlaku untuk label UI. Konten ujian tetap dalam bahasa aslinya.",
    simpanPreferensi: "Simpan Preferensi",
    preferensiSimpan: "Preferensi Disimpan!",

    // ── Notifikasi ─────────────────────────────────────────
    pusatNotifikasi:   "Pusat Notifikasi",
    notifikasiTitle:   "Notifikasi",
    tandaiSemuaDibaca: "Tandai Semua Dibaca",
    belumDibaca:       "Belum Dibaca",
    belumDibacaLabel:  "Belum Dibaca",
    sudahDibaca:       "Sudah Dibaca",
    hapusSudahDibaca:  "Hapus Sudah Dibaca",
    tandaiDibaca:      "Tandai Dibaca",
    prioritasTinggi:   "PRIORITAS TINGGI",
    ringkasanKategori: "RINGKASAN KATEGORI",
    total:             "Total",

    // ── Greeting ───────────────────────────────────────────
    selamatPagi:   "Selamat Pagi",
    selamatSiang:  "Selamat Siang",
    selamatSore:   "Selamat Sore",
    selamatMalam:  "Selamat Malam",
  },

  en: {
    // ── Sidebar / Nav ──────────────────────────────────────
    menuUtama:        "MAIN MENU",
    dashboard:        "Dashboard",
    ujian:            "Exams",
    jadwal:           "Schedule",
    akademik:         "ACADEMIC",
    nilai:            "Grades",
    riwayat:          "History",
    notifikasi:       "Notifications",
    akun:             "ACCOUNT",
    profil:           "Profile",
    pengaturan:       "Settings",

    // ── Navbar ─────────────────────────────────────────────
    editProfil:       "Edit Profile",
    keluar:           "Sign Out",

    // ── Pengaturan ─────────────────────────────────────────
    pengaturanTitle:  "Settings",
    pengaturanDesc:   "Manage your account and preferences",
    tabProfil:        "Profile",
    tabKeamanan:      "Security",
    tabTampilan:      "Appearance",
    tabNotifikasi:    "Notifications",
    tabSesiAkun:      "Session & Account",

    // ── TampilanCard ───────────────────────────────────────
    tampilanTitle:    "Appearance & Preferences",
    tampilanDesc:     "Customize the app appearance",
    temaWarna:        "Color Theme",
    temaTerang:       "Light",
    temaGelap:        "Dark",
    temaSistem:       "System",
    temaTerangDesc:   "Bright display",
    temaGelapDesc:    "Battery saving",
    temaSistemDesc:   "Follow device",
    ukuranTeks:       "Text Size",
    ukuranKecil:      "Small",
    ukuranNormal:     "Normal",
    ukuranBesar:      "Large",
    previewTeks:      "Preview: Text will appear like this throughout the app.",
    ukuranSaatIni:    "Current size",
    bahasaLabel:      "Language",
    bahasaNote:       "* Language change applies to UI labels. Exam content remains in its original language.",
    simpanPreferensi: "Save Preferences",
    preferensiSimpan: "Preferences Saved!",

    // ── Notifikasi ─────────────────────────────────────────
    pusatNotifikasi:   "Notification Center",
    notifikasiTitle:   "Notifications",
    tandaiSemuaDibaca: "Mark All as Read",
    belumDibaca:       "Unread",
    belumDibacaLabel:  "Unread",
    sudahDibaca:       "Read",
    hapusSudahDibaca:  "Delete Read",
    tandaiDibaca:      "Mark as Read",
    prioritasTinggi:   "HIGH PRIORITY",
    ringkasanKategori: "CATEGORY SUMMARY",
    total:             "Total",

    // ── Greeting ───────────────────────────────────────────
    selamatPagi:   "Good Morning",
    selamatSiang:  "Good Afternoon",
    selamatSore:   "Good Evening",
    selamatMalam:  "Good Night",
  },
} as const

export type TranslationKey = keyof typeof translations.id