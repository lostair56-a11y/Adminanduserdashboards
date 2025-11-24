-- ============================================
-- SISTEM MANAJEMEN RT - DATABASE SCHEMA
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk setup database lengkap
-- ============================================

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- 2.1 Admin Profiles Table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  kelurahan TEXT,
  kecamatan TEXT,
  kota TEXT,
  bri_account_number TEXT NOT NULL,
  bri_account_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Resident Profiles Table
CREATE TABLE IF NOT EXISTS resident_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  house_number TEXT NOT NULL,
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  kelurahan TEXT NOT NULL,
  kecamatan TEXT NOT NULL,
  kota TEXT NOT NULL,
  waste_bank_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Fee Payments Table
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID NOT NULL REFERENCES resident_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')),
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resident_id, month, year)
);

-- 2.4 Waste Deposits Table
CREATE TABLE IF NOT EXISTS waste_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID NOT NULL REFERENCES resident_profiles(id) ON DELETE CASCADE,
  waste_type TEXT NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  date DATE NOT NULL,
  area TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admin_profiles_rt_rw ON admin_profiles(rt, rw);
CREATE INDEX IF NOT EXISTS idx_resident_profiles_rt_rw ON resident_profiles(rt, rw);
CREATE INDEX IF NOT EXISTS idx_fee_payments_resident ON fee_payments(resident_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_status ON fee_payments(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_month_year ON fee_payments(month, year);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_resident ON waste_deposits(resident_id);
CREATE INDEX IF NOT EXISTS idx_waste_deposits_date ON waste_deposits(date);
CREATE INDEX IF NOT EXISTS idx_schedules_rt_rw ON schedules(rt, rw);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- 5.1 Admin Profiles Policies
CREATE POLICY "Admin can read own profile" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can update own profile" ON admin_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access admin_profiles" ON admin_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- 5.2 Resident Profiles Policies
CREATE POLICY "Resident can read own profile" ON resident_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Resident can update own profile" ON resident_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can read residents in same RT/RW" ON resident_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.rt = resident_profiles.rt
      AND admin_profiles.rw = resident_profiles.rw
    )
  );

CREATE POLICY "Service role full access resident_profiles" ON resident_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- 5.3 Fee Payments Policies
CREATE POLICY "Resident can read own fee payments" ON fee_payments
  FOR SELECT USING (
    resident_id IN (
      SELECT id FROM resident_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin can read fee payments in same RT/RW" ON fee_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles a
      JOIN resident_profiles r ON r.id = fee_payments.resident_id
      WHERE a.id = auth.uid()
      AND a.rt = r.rt
      AND a.rw = r.rw
    )
  );

CREATE POLICY "Service role full access fee_payments" ON fee_payments
  FOR ALL USING (auth.role() = 'service_role');

-- 5.4 Waste Deposits Policies
CREATE POLICY "Resident can read own waste deposits" ON waste_deposits
  FOR SELECT USING (
    resident_id IN (
      SELECT id FROM resident_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin can read waste deposits in same RT/RW" ON waste_deposits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles a
      JOIN resident_profiles r ON r.id = waste_deposits.resident_id
      WHERE a.id = auth.uid()
      AND a.rt = r.rt
      AND a.rw = r.rw
    )
  );

CREATE POLICY "Service role full access waste_deposits" ON waste_deposits
  FOR ALL USING (auth.role() = 'service_role');

-- 5.5 Schedules Policies
CREATE POLICY "Resident can read schedules in same RT/RW" ON schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM resident_profiles
      WHERE resident_profiles.id = auth.uid()
      AND resident_profiles.rt = schedules.rt
      AND resident_profiles.rw = schedules.rw
    )
  );

CREATE POLICY "Admin can read schedules in same RT/RW" ON schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.rt = schedules.rt
      AND admin_profiles.rw = schedules.rw
    )
  );

CREATE POLICY "Service role full access schedules" ON schedules
  FOR ALL USING (auth.role() = 'service_role');

-- 5.6 Notifications Policies
CREATE POLICY "User can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 6. CREATE FUNCTIONS
-- ============================================

-- 6.1 Function to update waste bank balance
CREATE OR REPLACE FUNCTION update_waste_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE resident_profiles
    SET waste_bank_balance = waste_bank_balance + NEW.total_value
    WHERE id = NEW.resident_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE resident_profiles
    SET waste_bank_balance = waste_bank_balance - OLD.total_value
    WHERE id = OLD.resident_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.2 Create trigger for waste bank balance
DROP TRIGGER IF EXISTS trigger_update_waste_bank_balance ON waste_deposits;
CREATE TRIGGER trigger_update_waste_bank_balance
  AFTER INSERT OR DELETE ON waste_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_waste_bank_balance();

-- ============================================
-- 7. CREATE VIEWS (OPTIONAL - FOR REPORTING)
-- ============================================

-- 7.1 View for monthly fee summary
CREATE OR REPLACE VIEW monthly_fee_summary AS
SELECT 
  fp.month,
  fp.year,
  rp.rt,
  rp.rw,
  COUNT(*) as total_residents,
  COUNT(CASE WHEN fp.status = 'paid' THEN 1 END) as paid_count,
  COUNT(CASE WHEN fp.status = 'unpaid' THEN 1 END) as unpaid_count,
  SUM(CASE WHEN fp.status = 'paid' THEN fp.amount ELSE 0 END) as total_collected
FROM fee_payments fp
JOIN resident_profiles rp ON rp.id = fp.resident_id
GROUP BY fp.month, fp.year, rp.rt, rp.rw;

-- 7.2 View for waste bank summary
CREATE OR REPLACE VIEW waste_bank_summary AS
SELECT 
  rp.rt,
  rp.rw,
  wd.waste_type,
  COUNT(*) as deposit_count,
  SUM(wd.weight) as total_weight,
  SUM(wd.total_value) as total_value
FROM waste_deposits wd
JOIN resident_profiles rp ON rp.id = wd.resident_id
GROUP BY rp.rt, rp.rw, wd.waste_type;

-- ============================================
-- SETUP COMPLETED!
-- ============================================
-- Next Steps:
-- 1. Deploy Edge Function: supabase/functions/server/index.tsx
-- 2. Set environment variables in Supabase Dashboard
-- 3. Update /utils/supabase/info.tsx with your project credentials
-- ============================================
