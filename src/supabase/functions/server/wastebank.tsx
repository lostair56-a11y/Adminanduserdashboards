import { Context } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";

const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase credentials not found');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

// Add waste deposit (Admin only)
export async function addWasteDeposit(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Check if user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (adminError || !adminProfile) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    const body = await c.req.json();
    const { resident_id, waste_type, weight, price_per_kg } = body;
    
    if (!resident_id || !waste_type || !weight || !price_per_kg) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const total_value = weight * price_per_kg;
    
    // Create waste deposit record
    const { data: depositData, error: depositError } = await supabase
      .from('waste_deposits')
      .insert({
        resident_id,
        waste_type,
        weight,
        price_per_kg,
        total_value,
        deposit_date: new Date().toISOString()
      })
      .select()
      .single();
    
    if (depositError) {
      console.error('Error creating waste deposit:', depositError);
      return c.json({ error: depositError.message }, 400);
    }
    
    // Update resident's waste bank balance
    const { data: residentProfile, error: profileError } = await supabase
      .from('resident_profiles')
      .select('waste_bank_balance, name')
      .eq('id', resident_id)
      .single();
    
    if (profileError) {
      console.error('Error fetching resident profile:', profileError);
      return c.json({ error: profileError.message }, 400);
    }
    
    const newBalance = (residentProfile.waste_bank_balance || 0) + total_value;
    
    const { error: updateError } = await supabase
      .from('resident_profiles')
      .update({ waste_bank_balance: newBalance })
      .eq('id', resident_id);
    
    if (updateError) {
      console.error('Error updating balance:', updateError);
      return c.json({ error: updateError.message }, 400);
    }
    
    // Create notification for resident
    await supabase
      .from('notifications')
      .insert({
        user_id: resident_id,
        title: 'Setoran Sampah Berhasil',
        message: `Setoran ${waste_type} seberat ${weight} kg senilai Rp ${total_value.toLocaleString('id-ID')} telah ditambahkan ke saldo Anda. Saldo baru: Rp ${newBalance.toLocaleString('id-ID')}`,
        type: 'success'
      });
    
    return c.json({ success: true, deposit: depositData, newBalance });
  } catch (error) {
    console.error('Error in add waste deposit:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Get waste deposits
export async function getWasteDeposits(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const residentId = c.req.param('residentId');
    
    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    let query = supabase
      .from('waste_deposits')
      .select(`
        *,
        resident:resident_profiles!resident_id (
          name,
          house_number
        )
      `);
    
    if (adminProfile) {
      // Admin can see all or specific resident
      if (residentId) {
        query = query.eq('resident_id', residentId);
      }
    } else {
      // Resident can only see their own
      query = query.eq('resident_id', user.id);
    }
    
    const { data: deposits, error: depositsError } = await query.order('deposit_date', { ascending: false });
    
    if (depositsError) {
      console.error('Error fetching waste deposits:', depositsError);
      return c.json({ error: depositsError.message }, 400);
    }
    
    return c.json({ deposits });
  } catch (error) {
    console.error('Error in get waste deposits:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Pay fee with waste bank balance
export async function payFeeWithWasteBank(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const { feeId } = body;
    
    if (!feeId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get the fee
    const { data: fee, error: feeError } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('id', feeId)
      .eq('resident_id', user.id)
      .eq('status', 'unpaid')
      .single();
    
    if (feeError || !fee) {
      return c.json({ error: 'Fee not found or already paid' }, 404);
    }
    
    // Get resident's balance
    const { data: residentProfile, error: profileError } = await supabase
      .from('resident_profiles')
      .select('waste_bank_balance, name')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      return c.json({ error: 'Resident profile not found' }, 404);
    }
    
    const currentBalance = residentProfile.waste_bank_balance || 0;
    
    // Check if balance is sufficient
    if (currentBalance < fee.amount) {
      return c.json({ error: 'Saldo bank sampah tidak mencukupi' }, 400);
    }
    
    const newBalance = currentBalance - fee.amount;
    
    // Update resident's balance
    const { error: updateBalanceError } = await supabase
      .from('resident_profiles')
      .update({ waste_bank_balance: newBalance })
      .eq('id', user.id);
    
    if (updateBalanceError) {
      console.error('Error updating balance:', updateBalanceError);
      return c.json({ error: updateBalanceError.message }, 400);
    }
    
    // Update fee status to paid
    const { data: updatedFee, error: updateFeeError } = await supabase
      .from('fee_payments')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        payment_method: 'Saldo Bank Sampah'
      })
      .eq('id', feeId)
      .select()
      .single();
    
    if (updateFeeError) {
      console.error('Error updating fee:', updateFeeError);
      return c.json({ error: updateFeeError.message }, 400);
    }
    
    // Create waste bank transaction record
    await supabase
      .from('waste_deposits')
      .insert({
        resident_id: user.id,
        waste_type: 'Pembayaran Iuran',
        weight: 0,
        price_per_kg: 0,
        total_value: -fee.amount,
        deposit_date: new Date().toISOString()
      });
    
    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Pembayaran Berhasil',
        message: `Iuran ${fee.month} ${fee.year} sebesar Rp ${fee.amount.toLocaleString('id-ID')} telah dibayar menggunakan saldo bank sampah. Sisa saldo: Rp ${newBalance.toLocaleString('id-ID')}`,
        type: 'success'
      });
    
    // Notify admin
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('id')
      .limit(1)
      .single();
    
    if (adminProfile) {
      await supabase
        .from('notifications')
        .insert({
          user_id: adminProfile.id,
          title: 'Pembayaran Iuran via Bank Sampah',
          message: `${residentProfile.name} telah membayar iuran ${fee.month} ${fee.year} sebesar Rp ${fee.amount.toLocaleString('id-ID')} menggunakan saldo bank sampah`,
          type: 'info'
        });
    }
    
    return c.json({ success: true, fee: updatedFee, newBalance });
  } catch (error) {
    console.error('Error in pay fee with waste bank:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Get waste bank statistics (Admin only)
export async function getWasteBankStats(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Check if user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (adminError || !adminProfile) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    // Get current month deposits
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
    
    const { data: monthlyDeposits, error: depositsError } = await supabase
      .from('waste_deposits')
      .select('*')
      .gte('deposit_date', startOfMonth)
      .gt('total_value', 0); // Only positive values (actual deposits, not payments)
    
    if (depositsError) {
      console.error('Error fetching deposits:', depositsError);
      return c.json({ error: depositsError.message }, 400);
    }
    
    const totalWeight = monthlyDeposits?.reduce((sum, d) => sum + (d.weight || 0), 0) || 0;
    const totalValue = monthlyDeposits?.reduce((sum, d) => sum + (d.total_value || 0), 0) || 0;
    const totalTransactions = monthlyDeposits?.length || 0;
    
    return c.json({
      stats: {
        totalTransactions,
        totalWeight,
        totalValue,
        month: currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    console.error('Error in get waste bank stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
