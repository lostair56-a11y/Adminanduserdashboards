# 🚀 Panduan Deployment ke Vercel

Dokumen ini berisi langkah-langkah lengkap untuk deploy aplikasi SikasRT ke Vercel.

## ✅ Checklist Sebelum Deploy

- [ ] Semua fitur sudah ditest dan berfungsi dengan baik
- [ ] Database Supabase sudah disetup (migration SQL sudah dijalankan)
- [ ] Email Provider sudah diaktifkan di Supabase
- [ ] Credentials Supabase sudah benar di `/utils/supabase/info.tsx`
- [ ] Build lokal berhasil (`npm run build`)

## 📋 Langkah-langkah Deployment

### 1. Persiapan Repository

Pastikan repository Git Anda sudah bersih dan siap deploy:

```bash
# Commit semua perubahan
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Deploy via Vercel Dashboard (Recommended)

#### a. Login ke Vercel
1. Kunjungi [vercel.com](https://vercel.com)
2. Login dengan GitHub/GitLab/Bitbucket

#### b. Import Project
1. Click "Add New..." > "Project"
2. Pilih repository SikasRT
3. Vercel akan otomatis detect settings dari `vercel.json`

#### c. Configure Build Settings
Vercel akan otomatis menggunakan settings berikut (dari `vercel.json`):
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### d. Deploy
1. Click "Deploy"
2. Tunggu proses build selesai (±2-3 menit)
3. Aplikasi akan live di URL seperti: `https://sikasrt-xxxxx.vercel.app`

### 3. Deploy via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

## ⚙️ Configuration

### File yang Sudah Dikonfigurasi

#### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

File ini memastikan:
- ✅ Client-side routing berfungsi (SPA)
- ✅ Build command yang benar
- ✅ Output directory yang sesuai

#### `package.json`
Build script sudah dikonfigurasi dengan benar:
```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

## 🔧 Post-Deployment

### 1. Verifikasi Deployment

Setelah deploy, check hal-hal berikut:

#### ✅ Halaman Utama
- [ ] Landing page muncul dengan benar
- [ ] Button Login/Register berfungsi
- [ ] Styling terlihat sempurna

#### ✅ Autentikasi
- [ ] Registrasi Admin RT berhasil
- [ ] Registrasi Warga berhasil
- [ ] Login Admin RT berhasil
- [ ] Login Warga berhasil
- [ ] Logout berhasil

#### ✅ Dashboard Admin
- [ ] Statistik muncul dengan benar
- [ ] CRUD Warga berfungsi
- [ ] CRUD Iuran berfungsi
- [ ] CRUD Bank Sampah berfungsi
- [ ] CRUD Jadwal berfungsi
- [ ] Laporan/grafik muncul

#### ✅ Dashboard Warga
- [ ] Data pribadi muncul
- [ ] Status iuran terlihat
- [ ] Saldo bank sampah terlihat
- [ ] Upload bukti pembayaran berhasil
- [ ] Cairkan saldo berhasil

### 2. Custom Domain (Optional)

1. Buka Project Settings di Vercel Dashboard
2. Ke tab "Domains"
3. Tambahkan custom domain Anda
4. Update DNS records sesuai instruksi Vercel

### 3. Environment Variables (Jika Diperlukan)

Jika Anda menggunakan environment variables tambahan:

1. Buka Project Settings > Environment Variables
2. Tambahkan variables yang diperlukan
3. Redeploy aplikasi

**Note**: Aplikasi ini menggunakan credentials dari `/utils/supabase/info.tsx` yang sudah di-bundle saat build, jadi tidak perlu environment variables tambahan.

## 🔍 Monitoring & Logs

### Lihat Deployment Logs
1. Buka project di Vercel Dashboard
2. Click pada deployment tertentu
3. Lihat "Build Logs" atau "Function Logs"

### Lihat Analytics
1. Buka tab "Analytics" di Vercel Dashboard
2. Lihat visitor stats, performance, dll

### Lihat Errors
1. Buka tab "Runtime Logs"
2. Filter by error level

## 🐛 Troubleshooting

### Build Failed

**Error**: Dependencies installation failed
```bash
# Solution: Update package.json dependencies
npm install
npm run build  # Test locally first
```

**Error**: TypeScript compilation error
```bash
# Solution: Fix TypeScript errors
npm run build  # See exact errors
```

### 404 on Refresh

**Problem**: Getting 404 when refreshing on routes like `/admin` or `/resident`

**Solution**: `vercel.json` sudah menghandle ini dengan rewrite rules. Jika masih terjadi, check:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### API Connection Issues

**Problem**: Tidak bisa connect ke Supabase

**Solution**: 
1. Check Supabase URL dan API key di `/utils/supabase/info.tsx`
2. Pastikan Supabase project aktif
3. Check CORS settings di Supabase

### Session/Auth Issues

**Problem**: User selalu ter-logout atau session expire

**Solution**:
1. Check localStorage tidak di-block oleh browser
2. Pastikan cookies enabled
3. Check Supabase auth settings

## 🔄 Update & Redeploy

### Untuk Update Aplikasi

```bash
# 1. Buat perubahan
git add .
git commit -m "Update: description"
git push origin main

# 2. Vercel akan otomatis redeploy
```

### Rollback ke Version Sebelumnya

1. Buka Deployments di Vercel Dashboard
2. Pilih deployment yang ingin di-restore
3. Click "Promote to Production"

## 📊 Performance Tips

### 1. Enable Analytics
- Aktifkan Vercel Analytics untuk monitor performa

### 2. Add Speed Insights
```bash
npm install @vercel/speed-insights
```

### 3. Optimize Images
- Gunakan format WebP
- Compress images sebelum upload

### 4. Enable Caching
Vercel otomatis cache static assets, tapi Anda bisa optimize dengan:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🎉 Selesai!

Aplikasi SikasRT Anda sekarang sudah live dan dapat diakses oleh Admin RT dan Warga!

### Next Steps:
1. Share URL dengan calon pengguna
2. Buat tutorial penggunaan untuk Admin dan Warga
3. Monitor feedback dan usage
4. Plan untuk iterasi selanjutnya

---

**Happy Deploying! 🚀**
