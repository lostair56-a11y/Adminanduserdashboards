/**
 * Database Helper Functions
 * 
 * Direct Supabase queries to replace edge functions
 * All queries respect RLS policies for RT/RW isolation
 */

import { supabase } from './supabase';
import { projectId } from '../utils/supabase/info';

// ============================================
// RESIDENTS
// ============================================

export async function getResidents() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Fetch residents in same RT/RW
  const { data, error } = await supabase
    .from('resident_profiles')
    .select('*')
    .eq('rt', adminProfile.rt)
    .eq('rw', adminProfile.rw)
    .order('house_number');

  if (error) throw error;
  return data || [];
}

export async function getResidentById(id: string) {
  const { data, error } = await supabase
    .from('resident_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// FEES / IURAN
// ============================================

export async function getFees() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Get all residents in same RT/RW
  const { data: residents } = await supabase
    .from('resident_profiles')
    .select('id')
    .eq('rt', adminProfile.rt)
    .eq('rw', adminProfile.rw);

  const residentIds = residents?.map(r => r.id) || [];

  if (residentIds.length === 0) {
    return [];
  }

  // Fetch fees with resident info
  const { data, error } = await supabase
    .from('fee_payments')
    .select('*, resident:resident_profiles(name, house_number, phone, rt, rw)')
    .in('resident_id', residentIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPendingFees() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Get all residents in same RT/RW
  const { data: residents } = await supabase
    .from('resident_profiles')
    .select('id')
    .eq('rt', adminProfile.rt)
    .eq('rw', adminProfile.rw);

  const residentIds = residents?.map(r => r.id) || [];

  if (residentIds.length === 0) {
    return [];
  }

  // Fetch fees with status 'unpaid' that have payment_proof (waiting for verification)
  const { data, error } = await supabase
    .from('fee_payments')
    .select('*, resident:resident_profiles(name, house_number, phone)')
    .eq('status', 'unpaid')
    .in('resident_id', residentIds)
    .neq('payment_proof', null)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createFee(feeData: {
  resident_id: string;
  amount: number;
  month?: string;
  year?: number;
  description?: string;
  due_date: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  console.log('🎫 createFee called with:', feeData);

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  console.log('👨‍💼 Admin profile:', adminProfile);

  // Get resident to verify RT/RW
  const { data: resident } = await supabase
    .from('resident_profiles')
    .select('rt, rw, name')
    .eq('id', feeData.resident_id)
    .single();

  console.log('🏠 Resident profile:', resident);

  if (!resident || resident.rt !== adminProfile.rt || resident.rw !== adminProfile.rw) {
    throw new Error('Resident not found or not in your RT/RW');
  }

  // Use backend server endpoint to create fee
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/fees/create`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resident_id: feeData.resident_id,
        amount: feeData.amount,
        month: feeData.month || new Date().toLocaleString('id-ID', { month: 'long' }),
        year: feeData.year || new Date().getFullYear(),
        description: feeData.description
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Error from server:', errorData);
    throw new Error(errorData.error || 'Failed to create fee');
  }

  const result = await response.json();
  console.log('✅ Fee created successfully:', result);
  return result.fee;
}

export async function updateFee(feeId: string, updates: {
  amount?: number;
  description?: string;
  due_date?: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('fee_payments')
    .update(updates)
    .eq('id', feeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function verifyPayment(feeId: string, action: 'approve' | 'reject') {
  const status = action === 'approve' ? 'paid' : 'unpaid';
  const verified_at = action === 'approve' ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('fee_payments')
    .update({ 
      status,
      verified_at,
      payment_proof: action === 'reject' ? null : undefined
    })
    .eq('id', feeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFee(feeId: string) {
  const { error } = await supabase
    .from('fee_payments')
    .delete()
    .eq('id', feeId);

  if (error) throw error;
}

// ============================================
// WASTE BANK / BANK SAMPAH
// ============================================

export async function getWasteDeposits() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Fetch waste deposits
  const { data, error } = await supabase
    .from('waste_deposits')
    .select('*, resident:resident_profiles(name, house_number, phone)')
    .eq('rt', adminProfile.rt)
    .eq('rw', adminProfile.rw)
    .order('deposit_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createWasteDeposit(depositData: {
  resident_id: string;
  weight_kg: number;
  waste_type: string;
  value: number;
  deposit_date: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Create deposit
  const { data, error } = await supabase
    .from('waste_deposits')
    .insert({
      ...depositData,
      rt: adminProfile.rt,
      rw: adminProfile.rw
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// TRASH SCHEDULES
// ============================================

export async function getTrashSchedules() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Fetch schedules from pickup_schedules table
  const { data, error } = await supabase
    .from('pickup_schedules')
    .select('*')
    .eq('rt', adminProfile.rt)
    .eq('rw', adminProfile.rw)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

// For residents to view schedules (public schedules in their RT/RW)
export async function getPublicSchedules() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Try to get resident's RT/RW first
  const { data: residentProfile } = await supabase.from('resident_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  // If not resident, try admin
  let rt, rw;
  if (residentProfile) {
    rt = residentProfile.rt;
    rw = residentProfile.rw;
  } else {
    const { data: adminProfile } = await supabase.from('admin_profiles')
      .select('rt, rw')
      .eq('id', session.user.id)
      .single();
    
    if (!adminProfile) {
      throw new Error('Profile not found');
    }
    rt = adminProfile.rt;
    rw = adminProfile.rw;
  }

  // Fetch upcoming schedules only (scheduled status, date >= today)
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('pickup_schedules')
    .select('*')
    .eq('rt', rt)
    .eq('rw', rw)
    .eq('status', 'scheduled')
    .gte('date', today)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createTrashSchedule(scheduleData: {
  date: string;
  area: string;
  time: string;
  notes?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Create schedule in pickup_schedules table
  const { data, error } = await supabase
    .from('pickup_schedules')
    .insert({
      date: scheduleData.date,
      area: scheduleData.area,
      time: scheduleData.time,
      notes: scheduleData.notes,
      status: 'scheduled',
      rt: adminProfile.rt,
      rw: adminProfile.rw,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSchedule(scheduleId: string, updates: {
  date?: string;
  area?: string;
  time?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('pickup_schedules')
    .update(updates)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSchedule(scheduleId: string) {
  const { error } = await supabase
    .from('pickup_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) throw error;
}

// ============================================
// REPORTS / STATISTICS
// ============================================

export async function getReportsData() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Get all residents in same RT/RW first
  const { data: residents } = await supabase
    .from('resident_profiles')
    .select('*')
    .eq('rt', adminProfile.rt)
    .eq('rw', adminProfile.rw);

  const residentIds = residents?.map(r => r.id) || [];

  // Get fees and waste data filtered by resident_ids
  const [feesData, wasteData] = await Promise.all([
    residentIds.length > 0
      ? supabase.from('fee_payments')
          .select('*')
          .in('resident_id', residentIds)
      : Promise.resolve({ data: [] }),
    
    supabase.from('waste_deposits')
      .select('*')
      .eq('rt', adminProfile.rt)
      .eq('rw', adminProfile.rw)
  ]);

  return {
    residents: residents || [],
    fees: feesData.data || [],
    wasteDeposits: wasteData.data || []
  };
}

// ============================================
// RESIDENT SIGNUP (Admin creates resident account)
// ============================================

export async function signupResident(residentData: {
  email: string;
  password: string;
  name: string;
  phone: string;
  house_number: string;
  rt: string;
  rw: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  // Get admin's RT/RW to verify
  const { data: adminProfile } = await supabase.from('admin_profiles')
    .select('rt, rw')
    .eq('id', session.user.id)
    .single();

  if (!adminProfile) {
    throw new Error('Admin profile not found');
  }

  // Verify admin is creating resident in their own RT/RW
  if (residentData.rt !== adminProfile.rt || residentData.rw !== adminProfile.rw) {
    throw new Error('You can only create residents in your own RT/RW');
  }

  // Note: Actual user signup needs server-side Supabase Admin API
  // For now, just create the resident profile directly
  // In production, this should go through an edge function with service role key
  
  const { data, error } = await supabase
    .from('resident_profiles')
    .insert({
      email: residentData.email,
      name: residentData.name,
      phone: residentData.phone,
      house_number: residentData.house_number,
      rt: residentData.rt,
      rw: residentData.rw
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}