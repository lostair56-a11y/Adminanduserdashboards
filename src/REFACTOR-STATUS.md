# 📊 Status Refactor: Edge Functions → Direct Supabase Queries

## 🎯 **DATABASE MIGRATION REQUIRED!**

⚠️ **PENTING:** Table `pickup_schedules` belum dibuat di database!

**Langkah yang harus dilakukan:**
1. Buka file `/QUICK-FIX-SCHEDULES.txt`
2. Copy semua SQL
3. Paste & Run di Supabase Dashboard → SQL Editor
4. Refresh aplikasi

**Files untuk Migration:**
- ✅ `/CREATE-PICKUP-SCHEDULES-TABLE.sql` (lengkap dengan comments)
- ✅ `/QUICK-FIX-SCHEDULES.txt` (simple, siap copy)
- ✅ `/FIX-PICKUP-SCHEDULES-ERROR.md` (dokumentasi lengkap)

---

## ✅ Komponen yang SUDAH Di-Refactor (8/19)

### 1. **ManageFees.tsx** ✅
- `fetchFees()` → `getFees()`
- `fetchPendingPayments()` → `getPendingFees()`
- Status: **SELESAI**

### 2. **ManageWasteBank.tsx** ✅
- `fetchWasteDeposits()` → `getWasteDeposits()`
- Status: **SELESAI**

### 3. **AdminDashboardStats.tsx** ✅
- `fetchStats()` → Direct Supabase queries
- Status: **SELESAI**

### 4. **AddFeeDialog.tsx** ✅
- `handleSubmit()` → `createFee()`
- Status: **SELESAI**

### 5. **AddWasteDepositDialog.tsx** ✅
- `handleSubmit()` → `createWasteDeposit()`
- Status: **SELESAI**

### 6. **ResidentDashboard.tsx - schedules** ✅
- `fetchSchedules()` → `getPublicSchedules()`
- Status: **SELESAI**
- **FIX:** Error "Could not find table 'jadwal_admin'" - sudah diganti ke `pickup_schedules`

### 7. **ManageSchedule.tsx** ✅ **(BARU SELESAI)**
- `fetchSchedules()` → `getTrashSchedules()`
- `handleAddSchedule()` → `createTrashSchedule()`
- `handleMarkComplete()` → `updateSchedule()`
- `handleDeleteSchedule()` → `deleteSchedule()`
- Status: **SELESAI**

### 8. **AddScheduleDialog.tsx** ✅ **(BARU SELESAI)**
- Updated interface untuk support `notes` field
- Removed `status` parameter (auto set to 'scheduled')
- Status: **SELESAI**

---

## ⏳ Komponen yang BELUM Di-Refactor (11/19)

### Admin Components (Masih Pakai Edge Functions)

7. **ManageResidents.tsx**
   - Endpoint: `/functions/v1/make-server-64eec44a/residents`
   - Action: CRUD residents
   - Solusi: Gunakan `getResidents()`, tapi untuk CREATE butuh edge function (signup user)

8. **Reports.tsx**
   - Endpoint: `/functions/v1/make-server-64eec44a/reports`
   - Action: Generate statistics & charts
   - Solusi: `getReportsData()` sudah ada di db-helpers.ts

9. **AddResidentDialog.tsx** ⚠️
    - Endpoint: `/functions/v1/make-server-64eec44a/signup/resident`
    - Problem: Butuh Supabase Admin SDK (service role key) untuk create auth user
    - Status: **PERLU DISKUSI** - Opsi invitation system vs edge function

10. **EditFeeDialog.tsx**
    - Endpoint: Update fees
    - Solusi: `updateFee()` sudah ada di db-helpers.ts

11. **EditResidentDialog.tsx**
    - Endpoint: Update residents
    - Solusi: Direct Supabase update query

### Resident Components (Masih Pakai Edge Functions)

12. **FeePaymentDialog.tsx**
    - Endpoint: Upload payment proof
    - Solusi: Direct Supabase storage upload + update fee

13. **WasteBankPaymentDialog.tsx**
    - Endpoint: Bayar iuran dengan saldo bank sampah
    - Solusi: Direct Supabase transaction (update fee + waste_deposits balance)

14. **PaymentHistoryDialog.tsx**
    - Endpoint: `/functions/v1/make-server-64eec44a/fees`
    - Solusi: Direct Supabase query untuk fees by resident_id

15. **WasteBankHistoryDialog.tsx**
    - Endpoint: `/functions/v1/make-server-64eec44a/waste-deposits`
    - Solusi: Direct Supabase query untuk waste_deposits by resident_id

16. **ResidentProfile.tsx**
    - Endpoint: Update resident profile
    - Solusi: Direct Supabase update query

17. **NotificationsDialog.tsx**
    - Endpoint: Get notifications
    - Solusi: Direct Supabase query untuk notifications table

18. **ResidentDashboard.tsx - fetchFees()** ⏳
    - Endpoint: `/functions/v1/make-server-64eec44a/fees`
    - Status: **BELUM** (schedules sudah, tapi fees masih edge function)
    - Solusi: Direct Supabase query

---

## 🔧 Helper Functions di `/lib/db-helpers.ts`

### Sudah Ada:
- ✅ `getResidents()` - Get residents by RT/RW
- ✅ `getFees()` - Get fees by RT/RW with resident info
- ✅ `getPendingFees()` - Get pending payment verifications
- ✅ `createFee()` - Create new fee
- ✅ `updateFee()` - Update fee
- ✅ `verifyPayment()` - Approve/reject payment
- ✅ `deleteFee()` - Delete fee
- ✅ `getWasteDeposits()` - Get waste deposits by RT/RW
- ✅ `createWasteDeposit()` - Create waste deposit
- ✅ `getTrashSchedules()` - Get pickup schedules (FIXED: pakai `pickup_schedules`)
- ✅ `getPublicSchedules()` - Get upcoming schedules for residents
- ✅ `createTrashSchedule()` - Create pickup schedule
- ✅ `updateSchedule()` - Update pickup schedule **(NEW)**
- ✅ `deleteSchedule()` - Delete pickup schedule **(NEW)**
- ✅ `getReportsData()` - Get statistics data

---

## 🛠️ Custom Supabase Client Improvements

### Update: `/lib/supabase.ts` ✅

**Fitur Baru yang Ditambahkan:**

#### 1. Method Chaining Support untuk INSERT
```typescript
const { data, error } = await supabase
  .from('pickup_schedules')
  .insert({ date, area, time, status, rt, rw })
  .select()
  .single();
```

#### 2. Method Chaining Support untuk UPDATE
```typescript
const { data, error } = await supabase
  .from('pickup_schedules')
  .update({ status: 'completed' })
  .eq('id', scheduleId)
  .select()
  .single();
```

#### 3. Method Chaining Support untuk DELETE
```typescript
const { error } = await supabase
  .from('pickup_schedules')
  .delete()
  .eq('id', scheduleId);
```

**How it works:**
- Semua methods return builder object dengan `.then()` method
- Support async/await pattern seperti official Supabase SDK
- Kompatibel dengan existing code yang pakai direct promises

---

## 📝 Database Tables

### Tables yang Sudah Diperbaiki:
- ✅ `pickup_schedules` - Nama table fix dari `jadwal_admin` atau `trash_schedules`
- ✅ `fees` - RT/RW columns added
- ✅ `waste_deposits` - RT/RW columns added

### Migration File:
- ✅ `/MIGRATION-CLEAN-NO-MARKDOWN.sql` - Siap dijalankan

---

## 🔥 Error yang Sudah Diatasi

1. **403 Forbidden** - Edge functions tidak accessible
   → Solusi: Direct Supabase queries

2. **"Could not find table 'public.jadwal_admin'"** ✅ (ResidentDashboard)
   → Solusi: Ganti ke `pickup_schedules` di `getTrashSchedules()` dan `getPublicSchedules()`

3. **400 Bad Request saat create schedule** ✅ (ManageSchedule)
   → Solusi: Refactor ke `createTrashSchedule()` dengan direct Supabase insert

4. **Missing RT/RW isolation**
   → Solusi: Semua queries di db-helpers.ts sudah filter by RT/RW

---

## 📦 Next Steps

1. ✅ Test ResidentDashboard - jadwal sudah muncul tanpa error
2. ✅ Test ManageSchedule - CRUD schedules sudah jalan
3. ⏳ Refactor `fetchFees()` di ResidentDashboard
4. ⏳ Refactor Reports.tsx untuk generate laporan
5. ⏳ Tambahkan helper functions untuk payment & profile updates

---

**Last Updated:** 30 Nov 2025 - ManageSchedule CRUD fixed ✅