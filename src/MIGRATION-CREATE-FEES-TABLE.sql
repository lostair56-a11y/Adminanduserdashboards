-- ⚠️ URGENT: CREATE FEES TABLE
-- Error: "Could not find the table 'public.fees' in the schema cache"
-- 
-- PROBLEM: Backend menggunakan tabel 'fees' tapi di database hanya ada 'fee_payments'
-- SOLUTION: Buat tabel 'fees' baru yang compatible dengan backend

-- ============================================
-- CREATE FEES TABLE
-- ============================================

-- Drop existing if any
DROP TABLE IF EXISTS public.fees CASCADE;

-- Create fees table
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES resident_profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'unpaid')),
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  payment_proof TEXT,
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_fees_resident_id ON public.fees(resident_id);
CREATE INDEX idx_fees_status ON public.fees(status);
CREATE INDEX idx_fees_rt_rw ON public.fees(rt, rw);
CREATE INDEX idx_fees_due_date ON public.fees(due_date);
CREATE INDEX idx_fees_payment_date ON public.fees(payment_date);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR FEES
-- ============================================

-- Policy: Residents can view their own fees
CREATE POLICY "Residents can view their own fees"
  ON public.fees FOR SELECT
  USING (resident_id = auth.uid());

-- Policy: Admins can view all fees in their RT/RW
CREATE POLICY "Admins can view fees in their RT/RW"
  ON public.fees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = fees.rt 
      AND rw = fees.rw
    )
  );

-- Policy: Admins can insert fees in their RT/RW
CREATE POLICY "Admins can insert fees in their RT/RW"
  ON public.fees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = fees.rt 
      AND rw = fees.rw
    )
  );

-- Policy: Admins can update fees in their RT/RW
CREATE POLICY "Admins can update fees in their RT/RW"
  ON public.fees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = fees.rt 
      AND rw = fees.rw
    )
  );

-- Policy: Admins can delete fees in their RT/RW
CREATE POLICY "Admins can delete fees in their RT/RW"
  ON public.fees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE id = auth.uid() 
      AND rt = fees.rt 
      AND rw = fees.rw
    )
  );

-- Policy: Residents can update their own fees (for payment proof upload)
CREATE POLICY "Residents can update their own fees"
  ON public.fees FOR UPDATE
  USING (resident_id = auth.uid())
  WITH CHECK (
    resident_id = auth.uid() 
    AND (OLD.status = 'unpaid' OR OLD.status = 'pending')
  );

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fees_updated_at
  BEFORE UPDATE ON public.fees
  FOR EACH ROW
  EXECUTE FUNCTION update_fees_updated_at();

-- ============================================
-- FUNCTION: Auto-fill RT/RW from resident
-- ============================================

CREATE OR REPLACE FUNCTION auto_fill_fee_rt_rw()
RETURNS TRIGGER AS $$
BEGIN
  -- Get RT/RW from resident_profiles
  SELECT rt, rw INTO NEW.rt, NEW.rw
  FROM resident_profiles
  WHERE id = NEW.resident_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_fill_fee_rt_rw
  BEFORE INSERT ON public.fees
  FOR EACH ROW
  WHEN (NEW.rt IS NULL OR NEW.rw IS NULL)
  EXECUTE FUNCTION auto_fill_fee_rt_rw();

-- ============================================
-- MIGRATION: Copy data from fee_payments to fees
-- ============================================

-- Insert existing fee_payments data into fees table
INSERT INTO public.fees (
  id,
  resident_id,
  amount,
  description,
  due_date,
  status,
  payment_method,
  payment_date,
  rt,
  rw,
  created_at
)
SELECT 
  fp.id,
  fp.resident_id,
  fp.amount,
  COALESCE(fp.description, fp.month || ' ' || fp.year::TEXT),
  -- Convert month/year to due_date (last day of month)
  (DATE(fp.year || '-' || 
    CASE fp.month
      WHEN 'Januari' THEN '01'
      WHEN 'Februari' THEN '02'
      WHEN 'Maret' THEN '03'
      WHEN 'April' THEN '04'
      WHEN 'Mei' THEN '05'
      WHEN 'Juni' THEN '06'
      WHEN 'Juli' THEN '07'
      WHEN 'Agustus' THEN '08'
      WHEN 'September' THEN '09'
      WHEN 'Oktober' THEN '10'
      WHEN 'November' THEN '11'
      WHEN 'Desember' THEN '12'
      ELSE '01'
    END || '-01') + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
  fp.status,
  fp.payment_method,
  fp.payment_date,
  rp.rt,
  rp.rw,
  fp.created_at
FROM fee_payments fp
JOIN resident_profiles rp ON fp.resident_id = rp.id
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify the migration:
-- SELECT COUNT(*) as fee_payments_count FROM fee_payments;
-- SELECT COUNT(*) as fees_count FROM fees;
-- SELECT * FROM fees LIMIT 10;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;
GRANT USAGE ON SEQUENCE fees_id_seq TO authenticated;
