import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Use credentials from Supabase info file
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Export function to create new client instances
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  position: string;
  phone: string;
  address: string;
  rt: string;
  rw: string;
  bri_account_number: string;
  bri_account_name: string;
  created_at: string;
}

export interface ResidentProfile {
  id: string;
  email: string;
  name: string;
  house_number: string;
  rt: string;
  rw: string;
  phone: string;
  address: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  waste_bank_balance: number;
  created_at: string;
}

export interface FeePayment {
  id: string;
  resident_id: string;
  amount: number;
  month: string;
  year: number;
  status: 'paid' | 'unpaid';
  payment_method?: string;
  payment_date?: string;
  description?: string;
  created_at: string;
}

export interface WasteDeposit {
  id: string;
  resident_id: string;
  waste_type: string;
  weight: number;
  price_per_kg: number;
  total_value: number;
  date: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  date: string;
  area: string;
  time: string;
  status: 'scheduled' | 'completed';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  created_at: string;
}