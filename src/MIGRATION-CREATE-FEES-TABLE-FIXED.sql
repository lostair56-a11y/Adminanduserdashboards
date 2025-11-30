-- ============================================
-- CREATE FEES TABLE (FIXED VERSION)
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
-- FIXED: Removed OLD reference from WITH CHECK
CREATE POLICY "Residents can update their own fees"
  ON public.fees FOR UPDATE
  USING (
    resident_id = auth.uid()
  )
  WITH CHECK (
    resident_id = auth.uid()
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
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================

-- Run this to verify:
-- SELECT COUNT(*) FROM fees;
-- SELECT * FROM fees LIMIT 5;
