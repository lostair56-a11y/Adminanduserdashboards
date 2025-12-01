# 🔄 REBUILD REQUIRED - Clear Cache & Rebuild App

## Masalah

Error masih muncul di browser karena:
```
index-BWcOgO7t.js:387 GET .../rest/v1/residents?... 404 (Not Found)
index-BWcOgO7t.js:387 GET .../rest/v1/fees?...resident:residents... 400 (Bad Request)
```

**Root Cause**: Browser Anda menggunakan **build lama** (`index-BWcOgO7t.js`) yang belum ter-update dengan fix terbaru.

## ✅ Kode Sudah Diperbaiki

File `/lib/db-helpers.ts` sudah diperbaiki:
- ✅ `'residents'` → `'resident_profiles'` (8 tempat)
- ✅ Join queries sudah benar
- ✅ Tidak ada lagi referensi ke table `residents`

## 🔧 Solusi: Rebuild Aplikasi

### LANGKAH 1: Clear Build Cache (Lokal)

Jika Anda sedang development lokal:

```bash
# Stop development server (Ctrl+C)

# Hapus folder dist/build lama
rm -rf dist/
rm -rf .vite/
rm -rf node_modules/.vite/

# Rebuild
npm run build

# Jalankan preview untuk test
npm run preview
```

### LANGKAH 2: Hard Refresh Browser

Setelah rebuild, buka browser dan **clear cache**:

#### Chrome / Edge:
1. Buka DevTools (F12)
2. **Klik kanan** pada tombol Refresh
3. Pilih **"Empty Cache and Hard Reload"**

Atau:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### Firefox:
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### LANGKAH 3: Verifikasi di Console

Setelah hard refresh, buka Console dan pastikan:

✅ **TIDAK ADA** error seperti:
```
GET .../rest/v1/residents?... 404
GET .../fees?...resident:residents... 400
```

✅ **HARUS ADA** request ke:
```
GET .../rest/v1/resident_profiles?... 200 ✓
GET .../fees?...resident:resident_profiles... 200 ✓
```

---

## 🚀 Deploy ke Vercel (Production)

Jika Anda deploy ke Vercel:

### Option A: Git Push (Recommended)

```bash
# Commit perubahan
git add lib/db-helpers.ts vercel.json
git commit -m "Fix: Update table names to resident_profiles"
git push origin main
```

Vercel akan **auto-deploy** dengan build baru (sekitar 2-3 menit).

### Option B: Manual Deploy via Vercel Dashboard

1. Buka **Vercel Dashboard**
2. Pilih project **SikasRT**
3. Tab **Deployments**
4. Klik **"Redeploy"** pada deployment terakhir
5. ✅ Centang **"Use existing Build Cache"** = OFF (force rebuild)
6. Klik **"Redeploy"**

### Option C: Vercel CLI

```bash
# Deploy dengan force rebuild
vercel --prod --force
```

---

## 🔍 Troubleshooting

### Masih error setelah rebuild?

#### 1. Cek Service Worker (PWA)
Jika app Anda menggunakan Service Worker:

```javascript
// Di Console browser, jalankan:
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});

// Lalu refresh lagi
location.reload(true);
```

#### 2. Clear Browser Cache Completely

**Chrome/Edge**:
- Settings → Privacy → Clear browsing data
- Pilih "Cached images and files"
- Time range: "All time"
- Clear data

**Firefox**:
- Settings → Privacy → Clear Data
- Pilih "Cached Web Content"
- Clear

#### 3. Coba Incognito/Private Mode

Buka app di **Incognito/Private window** untuk test tanpa cache:
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`

#### 4. Check Build Output

Pastikan build berhasil tanpa error:

```bash
npm run build
```

Output yang benar:
```
✓ built in 2.3s
✓ 147 modules transformed.
dist/index.html                   0.45 kB
dist/assets/index-[NEW_HASH].css  12.34 kB
dist/assets/index-[NEW_HASH].js   234.56 kB
```

**PENTING**: Hash harus berbeda dari `BWcOgO7t` (yang lama).

---

## ✅ Checklist

Sebelum menganggap masalah selesai:

- [ ] Kode di `/lib/db-helpers.ts` sudah tidak ada `'residents'`
- [ ] Rebuild lokal berhasil (`npm run build`)
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Console tidak ada error 404/400
- [ ] Request ke `resident_profiles` berhasil (200)
- [ ] Deploy ke Vercel jika production

---

## 📊 Expected Console Output

Setelah fix, console harus menampilkan:

```
✅ Single query success, data: {id: '...', email: '...', ...}
✅ GET .../resident_profiles?... 200 (OK)
✅ GET .../fees?...resident:resident_profiles... 200 (OK)
✅ Schedules fetched: 1
```

**TIDAK BOLEH** ada:
```
❌ GET .../residents?... 404
❌ GET .../fees?...resident:residents... 400
```

---

**Status**: ⚠️ NEEDS REBUILD - Jalankan `npm run build` dan hard refresh browser
