# ✅ Perubahan Output Directory Build

## Ringkasan Perubahan

Directory output build telah diubah dari `dist` menjadi `build` untuk konsistensi dengan standar industri dan kemudahan deployment.

## File yang Diupdate

### 1. **vite.config.ts**
```typescript
build: {
  outDir: 'build', // sebelumnya: 'dist'
  // ... config lainnya
}
```

### 2. **vercel.json**
```json
{
  "outputDirectory": "build" // sebelumnya: "dist"
}
```

### 3. **netlify.toml**
```toml
[build]
  publish = "build" # sebelumnya: "dist"
```

### 4. **.gitignore** (file baru)
Ditambahkan file `.gitignore` yang mengabaikan folder `build/` dan `dist/`

## Cara Build

Perintah build tetap sama:

```bash
npm run build
```

Output akan dihasilkan di folder `build/` (bukan lagi `dist/`)

## Deployment

### Vercel
Konfigurasi sudah otomatis terupdate di `vercel.json`:
- Build Command: `npm run build`
- Output Directory: `build`

### Netlify  
Konfigurasi sudah otomatis terupdate di `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `build`

## Testing Build Lokal

```bash
# Build project
npm run build

# Verifikasi folder build
ls -la build/

# Preview hasil build
npm run preview
```

## Catatan Penting

⚠️ **Jika sudah pernah deploy sebelumnya:**
- Hapus deployment lama di dashboard Vercel/Netlify
- Push perubahan ini ke Git
- Trigger deployment baru
- Vercel/Netlify akan otomatis menggunakan konfigurasi baru

✅ **Tidak perlu setting manual** di dashboard karena semua sudah dikonfigurasi via file config.

## Troubleshooting

### Error: "Output directory not found"
1. Pastikan file `vercel.json` atau `netlify.toml` sudah terupdate
2. Clear cache deployment: Redeploy from scratch
3. Verifikasi build lokal berhasil: `npm run build`

### Folder build tidak terbuat
1. Hapus folder `node_modules/`
2. Install ulang: `npm install`
3. Build ulang: `npm run build`
