# 🚀 Panduan Deployment Sistem Manajemen RT

Panduan lengkap untuk hosting aplikasi Sistem Manajemen RT ke production.

---

## 📋 Checklist Persiapan

- [ ] Akun Supabase (gratis di https://supabase.com)
- [ ] Akun hosting frontend (Vercel/Netlify/Cloudflare Pages)
- [ ] Browser modern (Chrome, Firefox, Edge)
- [ ] 15-30 menit waktu setup

---

## 🗄️ BAGIAN 1: Setup Supabase Database

### Langkah 1.1: Buat Project Supabase

1. **Login ke Supabase**: https://app.supabase.com
2. **Klik "New Project"**
3. **Isi detail project:**
   ```
   Name: sistem-manajemen-rt (atau nama lain)
   Database Password: [Buat password yang kuat, SIMPAN dengan aman!]
   Region: Southeast Asia (Singapore) - untuk performa terbaik di Indonesia
   ```
4. **Klik "Create new project"**
5. **Tunggu 2-3 menit** hingga project selesai dibuat

### Langkah 1.2: Jalankan Database Schema

1. **Buka SQL Editor:**
   - Sidebar kiri → **SQL Editor**
   - Klik **"New query"**

2. **Copy semua isi file `/supabase/schema.sql`**
   - Buka file `schema.sql` di project ini
   - Copy seluruh isinya (Ctrl+A, Ctrl+C)

3. **Paste ke SQL Editor dan Run:**
   - Paste di SQL Editor (Ctrl+V)
   - Klik tombol **"Run"** (atau F5)
   - Tunggu hingga muncul "Success. No rows returned"

4. **Verifikasi tables sudah dibuat:**
   - Sidebar → **Table Editor**
   - Harusnya terlihat 6 tables:
     - ✓ admin_profiles
     - ✓ resident_profiles
     - ✓ fee_payments
     - ✓ waste_deposits
     - ✓ schedules
     - ✓ notifications

### Langkah 1.3: Dapatkan API Credentials

1. **Buka Settings:**
   - Sidebar kiri → **Project Settings** (icon gear)
   - Klik **API**

2. **Copy credentials ini:**
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET!)
   ```

3. **PENTING:** 
   - ✓ Simpan ketiga nilai ini dengan aman
   - ✗ JANGAN share `service_role` key di public!

---

## ☁️ BAGIAN 2: Deploy Edge Functions (Backend)

### Langkah 2.1: Install Supabase CLI

**Windows:**
```bash
# Install via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

### Langkah 2.2: Login ke Supabase CLI

```bash
# Login
supabase login

# Akan membuka browser untuk authenticate
# Ikuti instruksi di browser
```

### Langkah 2.3: Link Project

```bash
# Di folder project, jalankan:
supabase link --project-ref your-project-ref

# Ganti 'your-project-ref' dengan ID dari Project URL
# Contoh: dari https://abcdefgh.supabase.co → project-ref adalah 'abcdefgh'
```

### Langkah 2.4: Deploy Functions

```bash
# Deploy semua functions
supabase functions deploy make-server-64eec44a

# Tunggu hingga selesai
# Output: Function URL: https://xxxxx.supabase.co/functions/v1/make-server-64eec44a
```

### Langkah 2.5: Set Environment Variables di Supabase

1. **Buka Functions:**
   - Dashboard → **Edge Functions**
   - Klik function **make-server-64eec44a**

2. **Tambah Secrets:**
   - Klik tab **"Secrets"**
   - Tambahkan secrets berikut:

```bash
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGci... (anon public key)
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci... (service_role key - RAHASIA!)
```

3. **Simpan secrets**

---

## 🌐 BAGIAN 3: Deploy Frontend

### Opsi A: Deploy ke Vercel (RECOMMENDED)

#### Langkah 3A.1: Setup Vercel

1. **Login ke Vercel:** https://vercel.com
2. **Klik "Add New" → "Project"**
3. **Import Git Repository** atau **Upload folder project**

#### Langkah 3A.2: Configure Build Settings

```bash
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Langkah 3A.3: Set Environment Variables

**PENTING:** Jangan set environment variables di Vercel!
Credentials sudah hardcoded di `/utils/supabase/info.tsx`

Jika Anda ingin menggunakan environment variables:
1. Update file `/lib/supabase.ts`:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

2. Tambahkan di Vercel Environment Variables:
   ```
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci... (anon public key)
   ```

#### Langkah 3A.4: Deploy

1. **Klik "Deploy"**
2. **Tunggu 2-5 menit**
3. **Aplikasi live di:** `https://your-app.vercel.app`

---

### Opsi B: Deploy ke Netlify

#### Langkah 3B.1: Setup Netlify

1. **Login ke Netlify:** https://netlify.com
2. **Klik "Add new site" → "Import an existing project"**
3. **Upload folder project** atau connect Git repository

#### Langkah 3B.2: Configure Build Settings

```bash
Build command: npm run build
Publish directory: dist
```

#### Langkah 3B.3: Deploy

1. **Klik "Deploy site"**
2. **Tunggu 2-5 menit**
3. **Aplikasi live di:** `https://your-app.netlify.app`

---

### Opsi C: Deploy ke Cloudflare Pages

#### Langkah 3C.1: Setup Cloudflare Pages

1. **Login ke Cloudflare Dashboard**
2. **Pages → Create a project**
3. **Upload folder project**

#### Langkah 3C.2: Configure Build

```bash
Framework preset: None
Build command: npm run build
Build output directory: dist
```

#### Langkah 3C.3: Deploy

1. **Klik "Save and Deploy"**
2. **Tunggu 2-5 menit**
3. **Aplikasi live di:** `https://your-app.pages.dev`

---

## ✅ BAGIAN 4: Testing & Verification

### Langkah 4.1: Test Registrasi Admin

1. **Buka aplikasi di browser**
2. **Klik "Daftar sebagai Admin RT"**
3. **Isi semua field:**
   ```
   Nama: Admin Test
   Email: admin@test.com
   Password: Test123456
   Jabatan: Ketua RT
   RT: 001
   RW: 002
   No. Telepon: 08123456789
   Alamat: Jl. Test No. 1
   Nomor Rekening BRI: 1234567890123456
   Nama Pemilik Rekening: Admin Test
   ```
4. **Klik "Daftar"**
5. **Harusnya muncul alert "Pendaftaran berhasil"**

### Langkah 4.2: Test Login Admin

1. **Klik "Login Admin RT"**
2. **Masukkan:**
   ```
   Email: admin@test.com
   Password: Test123456
   ```
3. **Klik "Masuk"**
4. **Harusnya redirect ke Admin Dashboard**

### Langkah 4.3: Test Registrasi Warga

1. **Logout dari admin**
2. **Klik "Daftar sebagai Warga"**
3. **Isi semua field:**
   ```
   Nama: Warga Test
   Email: warga@test.com
   Password: Test123456
   No. Rumah: 10
   RT: 001
   RW: 002
   No. Telepon: 08198765432
   Alamat: Jl. Test No. 10
   Kelurahan: Kelurahan Test
   Kecamatan: Kecamatan Test
   Kota: Jakarta
   ```
4. **Klik "Daftar"**
5. **Login dengan akun warga**

### Langkah 4.4: Verifikasi Fitur

#### Test sebagai Admin:
- [ ] Dashboard statistik tampil
- [ ] Tambah data warga
- [ ] Catat pembayaran iuran
- [ ] Catat setoran bank sampah
- [ ] Buat jadwal pengangkutan
- [ ] Lihat laporan

#### Test sebagai Warga:
- [ ] Dashboard statistik tampil
- [ ] Lihat riwayat iuran
- [ ] Lihat saldo bank sampah
- [ ] Lihat jadwal pengangkutan
- [ ] Bayar iuran dengan saldo bank sampah

---

## 🐛 Troubleshooting

### Problem 1: Error 403 saat login

**Solusi:**
1. Cek apakah RLS policies sudah dibuat (Bagian 1.2)
2. Cek apakah Edge Function sudah deploy (Bagian 2.4)
3. Cek Console browser (F12) untuk error detail

### Problem 2: Build failed di hosting

**Solusi:**
```bash
# Test build di local:
npm install
npm run build

# Jika error, fix error dulu sebelum deploy
```

### Problem 3: Data tidak muncul di dashboard

**Solusi:**
1. Pastikan sudah login dengan role yang benar
2. Cek apakah RT/RW cocok antara Admin dan Warga
3. Buka Console browser untuk lihat error API

### Problem 4: Edge Function timeout

**Solusi:**
1. Buka Supabase Dashboard → Edge Functions → Logs
2. Lihat error message
3. Pastikan SUPABASE_SERVICE_ROLE_KEY sudah di-set

---

## 🔒 Security Checklist

- [ ] `service_role` key TIDAK ada di frontend code
- [ ] RLS policies sudah enabled untuk semua tables
- [ ] Password database Supabase disimpan aman
- [ ] `.env` file (jika ada) di-ignore dari Git
- [ ] Debug panel disabled di production

---

## 📞 Support

### Jika masih ada masalah:

1. **Cek Supabase Logs:**
   - Dashboard → Logs
   - Lihat error messages

2. **Cek Browser Console:**
   - F12 → Console tab
   - Screenshot errors

3. **Cek Network Tab:**
   - F12 → Network tab
   - Lihat request yang gagal (merah)
   - Klik → Response tab untuk detail

4. **Dokumentasi:**
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs
   - Vite: https://vitejs.dev/guide/

---

## 🎉 Selamat!

Aplikasi Sistem Manajemen RT Anda sudah live dan siap digunakan!

### Langkah selanjutnya:

1. **Share URL** ke pengurus RT dan warga
2. **Buat backup** database secara berkala
3. **Monitor usage** di Supabase Dashboard
4. **Collect feedback** dari user

### Tips:

- Backup database: Dashboard → Database → Backups
- Monitor API usage: Dashboard → Usage
- Set up email notifications untuk downtime
- Dokumentasikan password dan credentials dengan aman

---

**Dibuat dengan ❤️ untuk komunitas RT di Indonesia**
