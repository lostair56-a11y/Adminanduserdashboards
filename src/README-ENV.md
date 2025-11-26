# 📝 Panduan Setup Environment Variables - SikasRT

Dokumen ini berisi panduan lengkap untuk setup environment variables yang diperlukan untuk menjalankan aplikasi **SikasRT** (Sistem Manajemen RT).

---

## 📋 Daftar Environment Variables

Aplikasi SikasRT memerlukan 4 environment variables utama dari Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
```

---

## 🚀 Langkah-Langkah Setup

### 1️⃣ Buat Project Supabase Baru

1. Buka [https://supabase.com](https://supabase.com)
2. Login atau daftar akun baru (gratis)
3. Klik **"New Project"**
4. Isi informasi project:
   - **Organization**: Pilih atau buat organization baru
   - **Name**: `sikasrt` atau nama yang Anda inginkan
   - **Database Password**: Buat password yang kuat (SIMPAN PASSWORD INI!)
   - **Region**: Pilih `Southeast Asia (Singapore)` untuk Indonesia
   - **Pricing Plan**: Pilih **Free** (gratis)
5. Klik **"Create new project"**
6. Tunggu 2-3 menit sampai project selesai dibuat

---

### 2️⃣ Dapatkan API Keys & URL

Setelah project selesai dibuat:

#### A. Dapatkan Project URL dan Anon Key

1. Di dashboard Supabase, buka **Settings** (ikon gear) di sidebar kiri
2. Pilih **API**
3. Di bagian **Project URL**, copy URL-nya:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Simpan sebagai `VITE_SUPABASE_URL`

4. Di bagian **Project API keys**, copy **anon public** key:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Simpan sebagai `VITE_SUPABASE_ANON_KEY`

5. Copy juga **service_role** key (akan ada warning, ini normal):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ⚠️ **PENTING**: Service role key harus dijaga kerahasiaannya!
   Simpan sebagai `SUPABASE_SERVICE_ROLE_KEY`

#### B. Dapatkan Database URL

1. Masih di **Settings**, pilih **Database**
2. Scroll ke bagian **Connection string**
3. Pilih tab **URI**
4. Copy connection string-nya:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. **GANTI** `[YOUR-PASSWORD]` dengan database password yang Anda buat di langkah 1
6. Simpan sebagai `SUPABASE_DB_URL`

---

### 3️⃣ Setup Database Schema

Setelah mendapatkan semua environment variables:

1. Di dashboard Supabase, buka **SQL Editor** di sidebar
2. Klik **"New query"**
3. Buka file `/supabase/schema.sql` dari project ini
4. Copy semua isinya dan paste ke SQL Editor
5. Klik **"Run"** atau tekan `Ctrl+Enter`
6. Tunggu sampai muncul **"Success"**

Schema akan membuat:
- ✅ Tabel `admin_profiles` untuk data Admin RT
- ✅ Tabel `resident_profiles` untuk data Warga
- ✅ Tabel `fee_payments` untuk pembayaran iuran
- ✅ Tabel `waste_deposits` untuk setoran bank sampah
- ✅ Tabel `pickup_schedules` untuk jadwal pengangkutan
- ✅ Tabel `notifications` untuk notifikasi
- ✅ Row Level Security (RLS) policies
- ✅ Functions dan triggers otomatis

---

### 4️⃣ Setup Edge Functions (Backend)

#### A. Install Supabase CLI

**Windows:**
```bash
npm install -g supabase
```

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

#### B. Login ke Supabase

```bash
supabase login
```

Ikuti instruksi untuk generate access token dan paste ke terminal.

#### C. Link Project Anda

```bash
supabase link --project-ref your-project-id
```

Ganti `your-project-id` dengan ID project Anda (bagian dari URL: `https://[your-project-id].supabase.co`)

#### D. Deploy Edge Functions

```bash
supabase functions deploy make-server-64eec44a
```

Tunggu sampai muncul **"Deployed successfully"**

#### E. Set Environment Variables untuk Edge Functions

```bash
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
```

---

### 5️⃣ Setup Environment Variables di Local Development

#### A. Buat file `.env` di root project

```bash
touch .env
```

#### B. Isi file `.env` dengan format berikut:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Ganti semua nilai di atas dengan values Anda sendiri!**

#### C. Pastikan `.env` ada di `.gitignore`

File `.env` **TIDAK BOLEH** di-commit ke Git karena berisi credentials rahasia!

Cek file `.gitignore` memiliki baris:
```
.env
.env.local
```

---

### 6️⃣ Setup untuk Deployment (Vercel/Netlify)

#### Vercel

1. Login ke [Vercel](https://vercel.com)
2. Import project dari GitHub
3. Di **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DB_URL`
4. Deploy!

#### Netlify

1. Login ke [Netlify](https://netlify.com)
2. Import project dari GitHub
3. Di **Site settings** → **Environment variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DB_URL`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

---

## 🔐 Keamanan Environment Variables

### ⚠️ JANGAN PERNAH:

- ❌ Commit file `.env` ke Git
- ❌ Share service role key di publik
- ❌ Hardcode credentials di source code
- ❌ Screenshot atau share credentials di chat/forum

### ✅ SELALU:

- ✅ Simpan credentials di password manager
- ✅ Gunakan environment variables untuk semua credentials
- ✅ Rotate keys secara berkala
- ✅ Setup different projects untuk dev/staging/production

---

## 🧪 Verifikasi Setup

Setelah setup selesai, test apakah environment variables sudah benar:

### Test Local Development

```bash
npm install
npm run dev
```

Buka browser di `http://localhost:5173`

### Test Login Demo Admin

Aplikasi otomatis membuat demo admin saat pertama kali dijalankan:

- **Email**: `admin@rt.com`
- **Password**: `admin123`
- **RT/RW**: 003/005

### Test Koneksi Backend

1. Login sebagai admin
2. Buka menu **Data Warga**
3. Jika data loading berhasil, backend sudah terhubung ✅

---

## 🐛 Troubleshooting

### Error: "Supabase credentials not found"

**Solusi**: Pastikan semua environment variables sudah di-set dengan benar di:
- File `.env` untuk local development
- Vercel/Netlify dashboard untuk production
- Supabase secrets untuk edge functions

### Error: "Invalid token" atau "Unauthorized"

**Solusi**: 
1. Cek apakah `VITE_SUPABASE_ANON_KEY` dan `SUPABASE_SERVICE_ROLE_KEY` sudah benar
2. Regenerate keys di Supabase dashboard jika perlu
3. Update semua environment variables dengan keys yang baru

### Error: Database connection failed

**Solusi**:
1. Cek apakah `SUPABASE_DB_URL` sudah benar
2. Pastikan password di URL sudah diganti dengan password yang benar
3. Test koneksi database di Supabase dashboard

### Error: "relation does not exist"

**Solusi**:
1. Jalankan migration schema lagi di SQL Editor
2. Pastikan semua tabel sudah dibuat
3. Cek di **Database** → **Tables** apakah semua tabel ada

### Edge Functions tidak jalan

**Solusi**:
```bash
# Re-deploy edge functions
supabase functions deploy make-server-64eec44a

# Check logs
supabase functions logs make-server-64eec44a

# Set secrets lagi
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

---

## 📞 Kontak & Support

Jika masih ada masalah:

1. **Check Supabase Logs**: Dashboard → Logs → Edge Functions
2. **Check Browser Console**: F12 → Console tab
3. **Check Network Tab**: F12 → Network tab untuk melihat API calls
4. **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
5. **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)

---

## ✅ Checklist Setup Lengkap

Gunakan checklist ini untuk memastikan setup sudah benar:

- [ ] Project Supabase sudah dibuat
- [ ] Sudah mendapatkan `VITE_SUPABASE_URL`
- [ ] Sudah mendapatkan `VITE_SUPABASE_ANON_KEY`
- [ ] Sudah mendapatkan `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Sudah mendapatkan `SUPABASE_DB_URL`
- [ ] Database schema sudah di-run di SQL Editor
- [ ] Supabase CLI sudah terinstall
- [ ] Sudah login ke Supabase CLI
- [ ] Project sudah di-link dengan `supabase link`
- [ ] Edge functions sudah di-deploy
- [ ] Secrets sudah di-set untuk edge functions
- [ ] File `.env` sudah dibuat di local
- [ ] Aplikasi bisa jalan di local (`npm run dev`)
- [ ] Bisa login dengan demo admin
- [ ] Environment variables sudah di-set di Vercel/Netlify
- [ ] Aplikasi sudah di-deploy dan bisa diakses online

---

## 🎉 Setup Selesai!

Jika semua checklist di atas sudah ✅, maka setup environment Anda sudah **100% lengkap** dan aplikasi SikasRT siap digunakan!

**Happy coding! 🚀**
