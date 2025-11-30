# 🎯 Summary: Error Fixes - SikasRT System

## Tanggal: 30 November 2025

---

## ✅ Error #1: "supabase.from(...).insert(...).select is not a function"

### Detail Error:
```
Error adding schedule: TypeError: supabase.from(...).insert(...).select is not a function
```

### Penyebab:
Custom Supabase client di `/lib/supabase.ts` tidak support method chaining seperti official Supabase SDK.

### Solusi:
Update custom Supabase client untuk support chaining:

**File Updated:** `/lib/supabase.ts`

**Fitur Baru:**
```typescript
// INSERT dengan chaining
await supabase.from('table')
  .insert({ data })
  .select()
  .single()

// UPDATE dengan chaining
await supabase.from('table')
  .update({ data })
  .eq('id', id)
  .select()
  .single()

// DELETE dengan chaining
await supabase.from('table')
  .delete()
  .eq('id', id)
```

### Status: ✅ **SELESAI**

---

## ⚠️ Error #2: "Could not find table 'pickup_schedules'"

### Detail Error:
```json
{
  "code": "PGRST205",
  "message": "Could not find the table 'public.pickup_schedules' in the schema cache",
  "hint": "Perhaps you meant the table 'public.schedules'"
}
```

### Penyebab:
Table `pickup_schedules` belum dibuat di database Supabase.

### Solusi:
**ACTION REQUIRED:** Run SQL migration untuk create table.

### Cara Fix (3 Opsi):

#### **Opsi 1: Quick Copy (TERCEPAT)** ⚡
1. Buka file: `/QUICK-FIX-SCHEDULES.txt`
2. Copy semua isi
3. Buka Supabase Dashboard → SQL Editor
4. Paste & Run
5. ✅ Done!

#### **Opsi 2: File SQL Lengkap** 📄
1. Buka file: `/CREATE-PICKUP-SCHEDULES-TABLE.sql`
2. Copy semua SQL (dengan comments)
3. Run di Supabase SQL Editor

#### **Opsi 3: Baca Dokumentasi** 📚
1. Buka file: `/FIX-PICKUP-SCHEDULES-ERROR.md`
2. Follow step-by-step guide
3. Ada troubleshooting & testing checklist

### Status: ⏳ **MIGRATION REQUIRED**

---

## 📋 Files yang Dibuat/Diupdate

### Custom Supabase Client (Error #1)
- ✅ `/lib/supabase.ts` - Updated dengan chaining support

### Migration Files (Error #2)
- ✅ `/CREATE-PICKUP-SCHEDULES-TABLE.sql` - SQL lengkap dengan comments
- ✅ `/QUICK-FIX-SCHEDULES.txt` - SQL simple, siap copy
- ✅ `/FIX-PICKUP-SCHEDULES-ERROR.md` - Dokumentasi lengkap

### Documentation
- ✅ `/REFACTOR-STATUS.md` - Updated dengan warning migration
- ✅ `/ERROR-FIXES-SUMMARY.md` - File ini

---

## 🧪 Testing Checklist

### Test Error #1 (Chaining Support)
- ✅ `createTrashSchedule()` - Insert dengan `.select().single()`
- ✅ `updateSchedule()` - Update dengan `.select().single()`
- ✅ `deleteSchedule()` - Delete dengan chaining
- ✅ `createFee()` - Insert fees
- ✅ `createWasteDeposit()` - Insert deposits

### Test Error #2 (Pickup Schedules Table)
**⚠️ SETELAH RUN MIGRATION:**
1. Login sebagai Admin RT
2. Buka **"Kelola Jadwal Pengangkutan"**
3. Test **"Tambah"** jadwal baru
4. Test **"Selesai"** (update status)
5. Test **"Hapus"** jadwal
6. Login sebagai Warga
7. Cek **Dashboard Warga** → Jadwal harus muncul

---

## 🎯 Next Actions

### Immediate (User Action Required):
1. **RUN MIGRATION** untuk table `pickup_schedules`
   - File: `/QUICK-FIX-SCHEDULES.txt`
   - Where: Supabase Dashboard → SQL Editor

### After Migration:
2. Test semua fitur schedules (Admin & Resident)
3. Verify data RT/RW isolation
4. Continue refactor komponen lain

---

## 💡 Technical Details

### Custom Supabase Client Architecture

**Before Fix:**
```typescript
insert: async (values: any) => {
  // Langsung return promise
  // ❌ Tidak bisa .select()
}
```

**After Fix:**
```typescript
insert: (values: any) => {
  // Return builder object
  return {
    select: () => builder,
    single: () => builder,
    then: () => Promise // ✅ Support chaining & await
  }
}
```

### Database Schema: `pickup_schedules`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| date | DATE | Tanggal pengangkutan |
| area | TEXT | Area/wilayah |
| time | TEXT | Waktu |
| status | TEXT | 'scheduled', 'completed', 'cancelled' |
| rt | TEXT | RT untuk filtering |
| rw | TEXT | RW untuk filtering |
| notes | TEXT | Catatan (optional) |
| created_at | TIMESTAMPTZ | Auto-generated |
| updated_at | TIMESTAMPTZ | Auto-generated |

**RLS Policies:**
- ✅ Admin & Resident bisa **SELECT** jadwal di RT/RW mereka
- ✅ Hanya Admin bisa **INSERT/UPDATE/DELETE**
- ✅ Isolasi per RT/RW otomatis via RLS

---

## 🔍 Related Issues (Already Fixed)

### Previous Errors (Sudah Diatasi):
1. ✅ "Could not find table 'jadwal_admin'" (ResidentDashboard)
2. ✅ "400 Bad Request" saat create schedule (ManageSchedule)
3. ✅ 403 Forbidden edge functions
4. ✅ Missing RT/RW columns di waste_deposits

### Files Updated (Session Ini):
- `/lib/supabase.ts` - Custom client improvements
- `/lib/db-helpers.ts` - Schedule CRUD functions (sudah ok dari sebelumnya)
- `/REFACTOR-STATUS.md` - Documentation update
- Migration SQL files (new)

---

## 📞 Support

Jika setelah run migration masih ada error:

### Common Issues:

**1. "permission denied for table pickup_schedules"**
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickup_schedules TO authenticated;
```

**2. "relation pickup_schedules does not exist"**
→ Migration belum dijalankan, run `/QUICK-FIX-SCHEDULES.txt`

**3. Data tidak muncul**
→ Cek RT/RW di profile cocok dengan schedules

**Debug Query:**
```sql
-- Cek user profile
SELECT id, email, rt, rw FROM admin_profiles WHERE id = auth.uid();

-- Cek schedules
SELECT * FROM pickup_schedules;
```

---

## 🚀 System Status

### Refactor Progress: **42% (8/19 components)**

**Completed:**
- ✅ ManageFees
- ✅ ManageWasteBank
- ✅ AdminDashboardStats
- ✅ AddFeeDialog
- ✅ AddWasteDepositDialog
- ✅ ResidentDashboard (schedules)
- ✅ ManageSchedule ← **BARU**
- ✅ AddScheduleDialog ← **BARU**

**Next Priority:**
- ⏳ Reports.tsx
- ⏳ ResidentDashboard (fees)
- ⏳ EditFeeDialog
- ⏳ FeePaymentDialog

---

**Status:** ✅ Code Fixed | ⏳ Migration Pending  
**Action:** Run SQL migration dari `/QUICK-FIX-SCHEDULES.txt`
