# ⚡ Quick Start Guide - Sistem Manajemen RT

Panduan cepat untuk deploy aplikasi dalam 15 menit!

---

## 🎯 Langkah 1: Setup Supabase (5 menit)

### 1.1 Buat Project
1. Login ke https://app.supabase.com
2. Klik **"New Project"**
3. Isi:
   - **Name:** `sistem-rt`
   - **Database Password:** [Buat password kuat & SIMPAN!]
   - **Region:** `Southeast Asia (Singapore)`
4. Klik **"Create new project"**
5. Tunggu 2-3 menit

### 1.2 Setup Database
1. Klik **"SQL Editor"** di sidebar
2. Klik **"New query"**
3. Copy **SEMUA ISI** file `/supabase/schema.sql`
4. Paste di editor
5. Klik **"Run"** (F5)
6. Tunggu hingga success ✅

### 1.3 Copy API Keys
1. Sidebar → **Project Settings** → **API**
2. Copy & simpan:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGci...
   service_role: eyJhbGci... (RAHASIA!)
   ```

---

## 🚀 Langkah 2: Deploy Backend (5 menit)

### 2.1 Install Supabase CLI

**Windows (PowerShell sebagai Admin):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

### 2.2 Login & Deploy
```bash
# Login
supabase login

# Link project (ganti xxxxx dengan project ID Anda)
supabase link --project-ref xxxxx

# Deploy function
supabase functions deploy make-server-64eec44a

# Set secrets
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGci...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

✅ Backend DONE!

---

## 🌐 Langkah 3: Deploy Frontend (5 menit)

### Opsi A: Vercel (PALING MUDAH)

1. Login ke https://vercel.com
2. Klik **"Add New"** → **"Project"**
3. **Import** folder project ini
4. **Build Settings:**
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
5. Klik **"Deploy"**
6. Tunggu 2-3 menit
7. **SELESAI!** ✅

### Opsi B: Netlify

1. Login ke https://netlify.com
2. **Drag & drop** folder project
3. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
4. **Deploy!**

---

## ✅ Langkah 4: Test Aplikasi (2 menit)

### Test 1: Daftar Admin
1. Buka URL aplikasi
2. Klik **"Daftar sebagai Admin RT"**
3. Isi form lengkap (termasuk nomor BRI!)
4. Klik **"Daftar"**
5. Login dengan email/password yang baru dibuat

### Test 2: Daftar Warga
1. Logout dari admin
2. Klik **"Daftar sebagai Warga"**
3. Isi form lengkap
4. **PENTING:** RT/RW harus sama dengan Admin!
5. Login dengan akun warga

### Test 3: Cek Fitur
✅ Admin dashboard muncul?  
✅ Bisa tambah data warga?  
✅ Warga bisa bayar iuran?  

**Jika semua ✅ → APLIKASI SIAP PAKAI!** 🎉

---

## 🐛 Masalah Umum

### Problem: Error 403
**Solusi:**
```bash
# Pastikan schema.sql sudah di-run
# Cek di Supabase → Table Editor
# Harus ada 6 tables
```

### Problem: Build gagal
**Solusi:**
```bash
npm install
npm run build
# Fix error yang muncul dulu
```

### Problem: Login gagal
**Solusi:**
- Pastikan RT/RW sama antara Admin & Warga
- Cek Console browser (F12)
- Lihat error message

---

## 📞 Butuh Bantuan?

1. **Baca:** `DEPLOYMENT_GUIDE.md` untuk panduan lengkap
2. **Troubleshoot:** `TROUBLESHOOTING_403.md` untuk fix error
3. **Docs:** `README.md` untuk dokumentasi lengkap

---

## 🎊 SELAMAT!

Aplikasi Sistem Manajemen RT Anda sudah live! 🚀

**Next Steps:**
- Share URL ke pengurus RT
- Input data warga
- Mulai catat iuran & bank sampah
- Monitor di dashboard

---

**Total waktu: ~15 menit** ⏱️

Dibuat dengan ❤️ untuk komunitas RT Indonesia
