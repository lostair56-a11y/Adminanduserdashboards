# SikasRT - Sistem Informasi Kelola dan Administrasi RT Digital

Platform digital untuk manajemen iuran dan bank sampah RT yang terintegrasi dengan Supabase.

## 🌟 Fitur Utama

### Admin RT
- ✅ Dashboard statistik real-time (iuran, bank sampah, warga)
- ✅ Manajemen data warga
- ✅ Pencatatan dan pelacakan iuran bulanan
- ✅ Sistem bank sampah digital
- ✅ Jadwal pengangkutan sampah
- ✅ Laporan dan visualisasi data (grafik)
- ✅ Setting rekening BRI untuk pembayaran

### Warga
- ✅ Lihat status iuran pribadi
- ✅ Upload bukti pembayaran iuran
- ✅ Lihat saldo bank sampah
- ✅ Cairkan saldo bank sampah
- ✅ Lihat jadwal pengangkutan sampah
- ✅ Notifikasi tagihan

## 🛠️ Teknologi

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components dengan Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase

## 🚀 Setup & Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd sikasrt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

#### a. Buat Project Supabase Baru
1. Kunjungi [supabase.com](https://supabase.com)
2. Buat project baru
3. Catat Project ID dan Anon Key

#### b. Jalankan SQL Migration
1. Buka SQL Editor di Supabase Dashboard
2. Jalankan file `supabase-schema.sql` untuk membuat semua tabel

#### c. Setup Supabase Credentials
File `/utils/supabase/info.tsx` sudah diatur secara otomatis oleh Figma Make. Jika perlu mengganti credentials:

```typescript
// /utils/supabase/info.tsx
export const projectId = "your-project-id"
export const publicAnonKey = "your-anon-key"
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📦 Build untuk Production

```bash
npm run build
```

Output akan berada di folder `dist/`

## 🌐 Deploy ke Vercel

### Via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Via Vercel Dashboard
1. Import repository ke Vercel
2. Vercel akan otomatis mendeteksi settings dari `vercel.json`
3. Deploy!

**PENTING**: Pastikan Email Provider sudah diaktifkan di Supabase:
1. Buka Supabase Dashboard > Authentication > Providers
2. Aktifkan Email provider
3. (Opsional) Setup SMTP untuk production

## 🔐 Autentikasi

### Admin RT
- Daftar dengan email + data lengkap (nama, RT/RW, nomor rekening BRI)
- Login menggunakan email & password
- Akses penuh untuk mengelola warga di RT/RW yang sama

### Warga
- Daftar dengan email + data lengkap (nama, RT/RW, alamat)
- Login menggunakan email & password
- Akses terbatas untuk melihat data pribadi dan melakukan transaksi

## 📊 Struktur Database

### Tables
- `admin_profiles` - Data admin RT
- `resident_profiles` - Data warga
- `fee_payments` - Pembayaran iuran
- `waste_deposits` - Setoran bank sampah
- `schedules` - Jadwal pengangkutan sampah
- `notifications` - Notifikasi pengguna

Lihat detail schema di `supabase-schema.sql`

## 🎯 Fitur Keamanan

- ✅ Row Level Security (RLS) aktif untuk semua tabel
- ✅ Admin hanya bisa akses data warga di RT/RW yang sama
- ✅ Warga hanya bisa akses data pribadi mereka sendiri
- ✅ Session management dengan refresh token
- ✅ Protected routes berdasarkan role

## 💳 Sistem Pembayaran

Aplikasi menggunakan sistem pembayaran via **transfer Bank BRI**:
1. Admin RT memasukkan nomor rekening BRI saat registrasi
2. Warga melakukan transfer ke rekening tersebut
3. Warga upload bukti transfer di aplikasi
4. Admin verifikasi dan update status pembayaran

## 🔧 Troubleshooting

### Error "Email login is disabled"
- Aktifkan Email Provider di Supabase Dashboard > Authentication > Providers

### Error "Could not find the table"
- Jalankan SQL migration `supabase-schema.sql` di Supabase SQL Editor

### Data Warga tidak muncul di Admin Dashboard
- Pastikan RT/RW admin dan warga sama persis (case-sensitive)
- Periksa RLS policies di Supabase

### Session expired
- Aplikasi otomatis refresh token
- Jika masih error, logout dan login kembali

## 📝 License

MIT License - Lihat file LICENSE untuk detail

## 👨‍💻 Support

Untuk pertanyaan atau issues, silakan buka issue di repository ini.

---

**SikasRT** - Digitalisasi Manajemen RT untuk Indonesia yang Lebih Baik 🇮🇩
