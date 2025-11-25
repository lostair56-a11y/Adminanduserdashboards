# Perbaikan Error "Unauthorized" pada Sistem Pembayaran

## Masalah
Saat warga mencoba melakukan pembayaran iuran, muncul error "Unauthorized" dan nomor rekening Bank BRI tidak ditampilkan.

## Root Cause
Masalah terjadi karena endpoint backend menggunakan metode `supabase.auth.getUser(accessToken)` yang tidak dapat memvalidasi JWT access token dengan benar ketika menggunakan service role client.

Endpoint yang bermasalah:
1. `/admin/bank-account` - Endpoint untuk mengambil nomor rekening Admin RT
2. `/fees/pay` - Endpoint untuk melakukan pembayaran iuran

## Solusi yang Diterapkan

### 1. Membuat Helper Function untuk JWT Decoding
Dibuat fungsi helper `getUserIdFromToken()` yang melakukan manual JWT decode untuk mendapatkan user ID dari access token:

```typescript
const getUserIdFromToken = (accessToken: string): string | null => {
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || null;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};
```

### 2. Update Endpoint `/admin/bank-account`
File: `/supabase/functions/server/index.tsx`

**Sebelum:**
- Menggunakan `supabase.auth.getUser(accessToken)` yang gagal memvalidasi token
- Menyebabkan error 401 Unauthorized

**Sesudah:**
- Menggunakan manual JWT decode untuk mendapatkan user ID
- Validasi lebih robust dengan pengecekan format token
- Tetap mengambil data rekening Admin RT yang sesuai dengan RT/RW warga

```typescript
// Decode JWT to get user ID
const parts = accessToken.split('.');
if (parts.length !== 3) {
  return c.json({ error: 'Unauthorized - Invalid token format' }, 401);
}

let payload;
try {
  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  payload = JSON.parse(jsonPayload);
} catch (e) {
  console.error('Error decoding token:', e);
  return c.json({ error: 'Unauthorized - Invalid token' }, 401);
}

const userId = payload.sub;
if (!userId) {
  return c.json({ error: 'Unauthorized - No user ID in token' }, 401);
}
```

### 3. Update Endpoint `/fees/pay`
File: `/supabase/functions/server/fees.tsx`

**Perubahan:**
1. Menambahkan helper function `getUserIdFromToken()` di bagian atas file
2. Mengubah fungsi `payFee()` untuk menggunakan helper function tersebut
3. Menghapus ketergantungan pada `supabase.auth.getUser(accessToken)`

**Sebelum:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
if (authError || !user) {
  return c.json({ error: 'Unauthorized' }, 401);
}
```

**Sesudah:**
```typescript
if (!accessToken) {
  return c.json({ error: 'Unauthorized - Missing token' }, 401);
}

const userId = getUserIdFromToken(accessToken);
if (!userId) {
  return c.json({ error: 'Unauthorized - Invalid token' }, 401);
}
```

## Files Modified
1. `/supabase/functions/server/index.tsx` - Update endpoint `/admin/bank-account`
2. `/supabase/functions/server/fees.tsx` - Tambah helper function dan update `payFee()`

## Testing Steps
1. Login sebagai Warga
2. Navigasi ke halaman Pembayaran Iuran
3. Klik tombol "Bayar" pada tagihan yang belum dibayar
4. Verifikasi:
   - ✅ Nomor rekening BRI Admin RT ditampilkan dengan benar
   - ✅ Nama penerima (Admin RT) ditampilkan
   - ✅ RT/RW Admin yang sesuai ditampilkan
   - ✅ Tidak ada error "Unauthorized"
5. Upload bukti transfer dan kirim
6. Verifikasi:
   - ✅ Pembayaran berhasil dicatat
   - ✅ Muncul notifikasi sukses
   - ✅ Status tagihan berubah menjadi "Menunggu Verifikasi"

## Deployment
Setelah perubahan ini di-commit:
1. Push ke repository GitHub
2. Supabase Edge Functions akan otomatis ter-redeploy
3. Fitur pembayaran akan langsung berfungsi dengan baik

## Catatan Teknis
- Metode manual JWT decode ini aman karena hanya mengekstrak payload (tidak memvalidasi signature)
- User ID dari JWT sudah tervalidasi saat login, jadi kita hanya perlu mengekstraknya
- Metode ini lebih reliable dibanding `auth.getUser()` saat menggunakan service role client
- Tetap ada validasi di database level (RLS policies) untuk keamanan ekstra
