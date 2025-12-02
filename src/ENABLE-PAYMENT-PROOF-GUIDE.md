# 🔄 Enable Payment Proof Feature - Quick Guide

## ⚡ 3-Step Process (5 Minutes)

---

## STEP 1: Add Database Column (30 seconds)

### Open Supabase → SQL Editor → Run:

```sql
ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
```

**Verify it worked:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'fee_payments' 
AND column_name = 'payment_proof';
```

You should see: `payment_proof`

---

## STEP 2: Uncomment Code (2 minutes)

### File 1: `/components/resident/FeePaymentDialog.tsx`

**Lines 139-148 - Change FROM:**
```typescript
// NOTE: payment_proof column needs to be added to database first
// Run this SQL in Supabase: ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
// Temporarily disabled to prevent PGRST204 error
// try {
//   await supabase
//     .from('fee_payments')
//     .update({ payment_proof: paymentProof })
//     .eq('id', feeId);
// } catch (err) {
//   console.error('Error updating payment_proof:', err);
// }
```

**TO:**
```typescript
// Save payment proof to database
try {
  await supabase
    .from('fee_payments')
    .update({ payment_proof: paymentProof })
    .eq('id', feeId);
} catch (err) {
  console.error('Error updating payment_proof:', err);
}
```

---

### File 2: `/supabase/functions/server/fees.tsx`

**Line 302 - Change FROM:**
```typescript
payment_date: new Date().toISOString(),
payment_method: paymentMethod,
// payment_proof: paymentProofUrl  // Disabled - column doesn't exist yet
```

**TO:**
```typescript
payment_date: new Date().toISOString(),
payment_method: paymentMethod,
payment_proof: paymentProofUrl
```

---

### File 3: `/lib/db-helpers.ts`

**Line 271 - Change FROM:**
```typescript
if (action === 'reject') {
  // NOTE: payment_proof column disabled until added to database
  // updateData.payment_proof = null;
  updateData.payment_date = null;
  updateData.payment_method = null;
}
```

**TO:**
```typescript
if (action === 'reject') {
  updateData.payment_proof = null;
  updateData.payment_date = null;
  updateData.payment_method = null;
}
```

---

## STEP 3: Test (2 minutes)

### Test as Warga:
1. Refresh aplikasi (F5)
2. Login sebagai Warga
3. Go to "Iuran Bulanan"
4. Click "Bayar" on any unpaid fee
5. Upload bukti transfer (screenshot/foto)
6. Click "Kirim Pembayaran"
7. ✅ Should see success message
8. ✅ No errors in console

### Test as Admin:
1. Login sebagai Admin RT
2. Go to "Iuran Bulanan"
3. Click "Pending Payments" button
4. Find the payment you just made
5. Click "Lihat Bukti Transfer"
6. ✅ Should see the uploaded image
7. ✅ Can verify or reject payment

---

## ✅ Success Checklist

- [ ] Database column added
- [ ] All 3 files uncommented
- [ ] Application refreshed
- [ ] Payment submission works
- [ ] Proof upload works
- [ ] No PGRST204 errors
- [ ] Admin can view proofs
- [ ] Verify/reject works

---

## 🆘 Troubleshooting

### Issue: Still getting PGRST204 error
**Solution:**
- Wait 1-2 minutes for Supabase schema cache to refresh
- Hard refresh browser (Ctrl+Shift+R)
- Restart Supabase project if needed

### Issue: Proof not showing in admin view
**Solution:**
- Check browser console for errors
- Verify payment_proof value in database
- Check if KV store still has the proof

### Issue: Column already exists error
**Solution:**
- This is fine! Column was added before
- Skip Step 1, go directly to Step 2

---

## 📊 Expected Result

### Database Schema:
```
fee_payments
├── id
├── resident_id
├── amount
├── month
├── year
├── status
├── payment_date
├── payment_method
├── payment_proof ← SHOULD BE HERE NOW
├── rt
├── rw
├── created_at
└── updated_at
```

### Feature Flow:
```
Warga uploads proof 
    ↓
Saved to database (payment_proof column)
    ↓
Admin views pending payments
    ↓
Admin clicks "Lihat Bukti"
    ↓
Image displayed
    ↓
Admin verifies payment
    ↓
✅ Payment marked as paid
```

---

## 🎯 Quick Commands

### Add column (safe):
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fee_payments' 
    AND column_name = 'payment_proof'
  ) THEN
    ALTER TABLE fee_payments ADD COLUMN payment_proof TEXT;
  END IF;
END $$;
```

### Verify column:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fee_payments' 
AND column_name = 'payment_proof';
```

### Check data:
```sql
SELECT id, payment_proof 
FROM fee_payments 
WHERE payment_proof IS NOT NULL 
LIMIT 5;
```

---

**Time Required:** 5 minutes  
**Difficulty:** ⭐ Easy  
**Risk:** 🟢 Low  
**Impact:** ✅ Restores full payment proof feature

---

## 📚 Related Files

- [URGENT-PAYMENT-PROOF-DISABLED.md](./URGENT-PAYMENT-PROOF-DISABLED.md) - What was disabled
- [FIX-NOW.sql](./FIX-NOW.sql) - Quick SQL fix
- [READ-THIS-FIRST.md](./READ-THIS-FIRST.md) - Overview
- [FIX-SUMMARY.md](./FIX-SUMMARY.md) - Complete summary
