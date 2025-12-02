# 🔧 Fix "Failed to Fetch" Error

## ❌ Error Message
```
Error creating bill: TypeError: Failed to fetch
```

## ✅ Sudah Diperbaiki

### 1. **Frontend Code** - `/lib/db-helpers.ts`
- ✅ Ditambahkan `due_date` ke request body
- ✅ Frontend sekarang mengirim semua data yang diperlukan ke backend

### 2. **Backend Code** - `/supabase/functions/server/fees.tsx`
- ✅ Backend siap menerima `due_date` (meskipun belum disimpan ke database)

## 🔍 Kemungkinan Penyebab Error

### 1. **Edge Function Belum Selesai Deploy**
Setelah edit file backend, Edge Function perlu waktu untuk deploy (30-60 detik).

**Solusi:**
- Tunggu 1-2 menit setelah save
- Cek deployment status di browser console
- Refresh halaman setelah deployment selesai

### 2. **Browser Cache**
Browser mungkin masih menggunakan kode lama.

**Solusi:**
```bash
1. Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
2. Clear browser cache
3. Refresh ulang halaman
```

### 3. **Session Expired**
Token autentikasi mungkin sudah expired.

**Solusi:**
```bash
1. Logout dari aplikasi
2. Login kembali
3. Coba create bill lagi
```

### 4. **Network Issue**
Koneksi ke Supabase mungkin timeout.

**Solusi:**
```bash
1. Cek koneksi internet
2. Coba lagi setelah beberapa detik
3. Periksa browser console untuk error detail
```

## 🧪 Testing

### Test 1: Cek Endpoint Backend
Buka browser console dan jalankan:
```javascript
// Get session token
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token ? 'Ada' : 'Tidak ada');

// Test endpoint
const response = await fetch(
  'https://wsvugwzpxhvnwqtyjrhe.supabase.co/functions/v1/make-server-64eec44a/fees/create',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      resident_id: 'test',
      amount: 50000,
      month: 'Januari',
      year: 2025,
      description: 'Test'
    })
  }
);

console.log('Status:', response.status);
console.log('Response:', await response.json());
```

### Test 2: Create Bill Normal Flow
1. Login sebagai Admin RT
2. Menu Tagihan → Buat Tagihan Baru
3. Isi form:
   - Pilih warga
   - Jumlah: Rp 50.000
   - Bulan: Januari 2025
   - Keterangan: Test tagihan
4. Klik "Buat Tagihan"
5. Periksa toast notification

**Expected:**
- ✅ Toast success: "Tagihan berhasil dibuat untuk [Nama Warga]"
- ✅ Dialog tertutup
- ✅ Tagihan muncul di list

## 🚨 Jika Masih Error

### Check 1: Browser Console
```bash
1. Tekan F12
2. Tab "Console"
3. Cari error message lengkap
4. Screenshot dan share error detail
```

### Check 2: Network Tab
```bash
1. F12 → Tab "Network"
2. Coba create bill lagi
3. Klik request yang failed
4. Check:
   - Request URL
   - Request Headers
   - Request Payload
   - Response (jika ada)
```

### Check 3: Supabase Edge Functions
```bash
1. Buka Supabase Dashboard
2. Menu Edge Functions
3. Pilih "make-server"
4. Check status: Should be "Active"
5. Lihat logs untuk error
```

## ✨ After Fix Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Logout dan login kembali
- [ ] Test create bill dengan data valid
- [ ] Verify tagihan muncul di list
- [ ] Check warga menerima notifikasi

## 📝 Notes

- Backend sekarang sudah **100% siap** untuk menerima request
- `due_date` dikirim dari frontend tapi **belum disimpan** ke database (karena kolom belum ada)
- Untuk menyimpan `due_date`, perlu migration SQL untuk add column

### Optional: Add due_date Column
Jika ingin menyimpan due_date di database:

```sql
ALTER TABLE fee_payments 
ADD COLUMN due_date TIMESTAMPTZ;
```

Lalu update backend `createFee`:
```typescript
const { data: feeData, error: feeError } = await supabase
  .from('fee_payments')
  .insert({
    resident_id,
    amount,
    month,
    year,
    status: 'unpaid',
    due_date: body.due_date  // ← Add this
  })
  .select()
  .single();
```

---

**Last Updated:** December 1, 2025
**Status:** ✅ Ready to test
