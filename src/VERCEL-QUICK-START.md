# 🚀 Vercel Deployment - Quick Start

## Langkah Cepat Deploy ke Vercel

### 1. Test Build Lokal (WAJIB!)

```bash
npm install
npm run build
```

✅ Jika berhasil, lanjut ke step 2.
❌ Jika gagal, fix error dulu sebelum deploy.

### 2. Push ke Git

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Deploy ke Vercel

#### Via Dashboard (Recommended):
1. Login ke https://vercel.com
2. Click "Add New..." > "Project"
3. Import repository Git Anda
4. **JANGAN UBAH SETTINGS APAPUN** (sudah otomatis dari vercel.json)
5. Click "Deploy"
6. Tunggu ~2-3 menit
7. ✅ Done!

#### Via CLI (Alternative):
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🎯 Settings yang Sudah Dikonfigurasi

File `vercel.json` sudah mengatur semua:
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Framework: Vite
- ✅ Install Command: `npm install`

**PENTING**: Jangan override settings ini di Vercel Dashboard!

## 🐛 Jika Error "No Output Directory 'dist' found"

1. Test build lokal lagi: `npm run build`
2. Check folder `dist/` terbuat
3. Baca file: `/VERCEL-DEPLOYMENT-FIX.md`

## 📚 Dokumentasi Lengkap

- Full deployment guide: `/DEPLOYMENT.md`
- Troubleshooting: `/VERCEL-DEPLOYMENT-FIX.md`

---

**That's it! Deploy seharusnya berhasil dalam 2-3 menit.** 🎉
