-- Admin Profiles Table
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  rt TEXT NOT NULL,
  rw TEXT NOT NULL,
  bri_account_number TEXT NOT NULL,
  bri_account_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resident Profiles Table
CREATE TABLE resident_profiles (
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
  waste_bank_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee Payments Table
CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES resident_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')),
  payment_method TEXT,
  payment_date TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resident_id, month, year)
);

-- Waste Deposits Table
CREATE TABLE waste_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES resident_profiles(id) ON DELETE CASCADE,
  waste_type TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  price_per_kg INTEGER NOT NULL,
  total_value INTEGER NOT NULL,
  date DATE NOT NULL,
  rt TEXT,
  rw TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules Table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_profiles
CREATE POLICY "Admins can view their own profile"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can update their own profile"
  ON admin_profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for resident_profiles
CREATE POLICY "Residents can view their own profile"
  ON resident_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Residents can update their own profile"
  ON resident_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all resident profiles"
  ON resident_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for fee_payments
CREATE POLICY "Residents can view their own payments"
  ON fee_payments FOR SELECT
  USING (resident_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON fee_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert payments"
  ON fee_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update payments"
  ON fee_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for waste_deposits
CREATE POLICY "Residents can view their own deposits"
  ON waste_deposits FOR SELECT
  USING (resident_id = auth.uid());

CREATE POLICY "Admins can view all deposits"
  ON waste_deposits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert deposits"
  ON waste_deposits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for schedules
CREATE POLICY "Everyone can view schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Function to update waste bank balance after deposit
CREATE OR REPLACE FUNCTION update_waste_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE resident_profiles
  SET waste_bank_balance = waste_bank_balance + NEW.total_value
  WHERE id = NEW.resident_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_waste_deposit
  AFTER INSERT ON waste_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_waste_bank_balance();

-- Function to deduct waste bank balance when used for payment
CREATE OR REPLACE FUNCTION deduct_waste_bank_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'Bank Sampah' AND NEW.status = 'paid' THEN
    UPDATE resident_profiles
    SET waste_bank_balance = waste_bank_balance - NEW.amount
    WHERE id = NEW.resident_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_payment_update
  AFTER UPDATE ON fee_payments
  FOR EACH ROW
  WHEN (OLD.status = 'unpaid' AND NEW.status = 'paid')
  EXECUTE FUNCTION deduct_waste_bank_balance();