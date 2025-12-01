# ⚡ QUICK FIX GUIDE - ERROR 401 & 400

## 🎯 1 FILE, 3 MENIT, SELESAI!

---

## FILE MIGRATION YANG BENAR

### ✅ GUNAKAN INI:
```
/MIGRATION-FIX-RLS-SAFE.sql
```

### ❌ JANGAN GUNAKAN:
```
/MIGRATION-FIX-RLS-POLICIES.sql (ada error)
```

---

## CARA JALANKAN

### Copy File
1. Buka `/MIGRATION-FIX-RLS-SAFE.sql`
2. Copy SEMUA isi (Ctrl+A, Ctrl+C)

### Jalankan di Supabase
1. Buka https://supabase.com/dashboard
2. Pilih project **SikasRT**
3. Klik **SQL Editor** → **New query**
4. Paste (Ctrl+V)
5. Klik **RUN** (atau Ctrl+Enter)

### Tunggu Selesai
```
✅ Status: Success. No rows returned
```

---

## SETELAH MIGRATION

### 1. Clear Cache
```
Ctrl + Shift + R
```

### 2. Test Login
- Login sebagai Admin RT
- Check Console (F12)
- Tidak ada error 401/400

### 3. Verifikasi Data
- Dashboard muncul
- Data warga muncul
- Data iuran muncul
- Jadwal muncul

---

## YANG DIPERBAIKI

| Error | Solusi |
|-------|--------|
| 401 Unauthorized | ✅ RLS policies fixed |
| 400 Bad Request | ✅ Query syntax fixed |
| 404 Favicon | ✅ Reference removed |
| Column rt not exist | ✅ Column added safely |

---

## TROUBLESHOOTING

### Migration gagal?
- Screenshot error
- Laporkan di Console

### Migration success tapi app error?
- Clear cache lagi
- Logout & login
- Check Console (F12)

---

## SUPPORT FILES

| File | Keterangan |
|------|------------|
| `JALANKAN-INI-SEKARANG.md` | Panduan lengkap |
| `START-FIX-NOW.md` | 3 langkah mudah |
| `README-PERBAIKAN-CEPAT.md` | Visual guide |

---

**🚀 JALANKAN `/MIGRATION-FIX-RLS-SAFE.sql` SEKARANG!**
