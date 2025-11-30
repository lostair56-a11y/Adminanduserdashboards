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
    
    // Get resident's RT/RW
    const { data: residentData, error: residentError } = await supabase
      .from('resident_profiles')
      .select('rt, rw')
      .eq('id', resident_id)
      .single();
    
    if (residentError || !residentData) {
      return c.json({ error: 'Resident not found' }, 404);
    }
    
    // Create waste deposit record
    const { data: depositData, error: depositError } = await supabase
      .from('waste_deposits')
      .insert({
        resident_id,
        waste_type,
        weight,
        price_per_kg,
        total_value,
        rt: residentData.rt,
        rw: residentData.rw,
        date: new Date().toISOString()
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

// Get waste deposits for a resident or all residents (Admin only)
export async function getWasteDeposits(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get admin profile to get their location
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('rt, rw')
      .eq('id', user.id)
      .single();

    let residentIds: string[] = [];

    if (adminProfile) {
      // Admin: Get only residents from same RT/RW
      const { data: residents, error: residentsError } = await supabase
        .from('resident_profiles')
        .select('id')
        .eq('rt', adminProfile.rt)
        .eq('rw', adminProfile.rw);

      if (residentsError) {
        console.error('Error fetching residents:', residentsError);
        return c.json({ error: residentsError.message }, 400);
      }

      residentIds = residents?.map(r => r.id) || [];
    } else {
      // Resident: Get their own deposits
      residentIds = [user.id];
    }

    if (residentIds.length === 0) {
      return c.json({ deposits: [] });
    }

    const residentId = c.req.param('residentId');
    
    let query = supabase
      .from('waste_deposits')
      .select(`
        *,
        resident:resident_profiles!waste_deposits_resident_id_fkey (
          name,
          house_number
        )
      `)
      .in('resident_id', residentIds)
      .order('date', { ascending: false });

    if (residentId && residentId !== 'undefined') {
      query = query.eq('resident_id', residentId);
    }

    const { data: deposits, error } = await query;

    if (error) {
      console.error('Error fetching waste deposits:', error);
      return c.json({ error: error.message }, 400);
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
      .select('waste_bank_balance, name, rt, rw')
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
        rt: residentProfile.rt,
        rw: residentProfile.rw,
        date: new Date().toISOString()
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
      .gte('date', startOfMonth)
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

// Update waste deposit (Admin only)
export async function updateWasteDeposit(c: Context) {
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
    
    const depositId = c.req.param('id');
    const body = await c.req.json();
    const { waste_type, weight, price_per_kg } = body;
    
    if (!waste_type || !weight || !price_per_kg) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get old deposit to calculate balance difference
    const { data: oldDeposit, error: oldDepositError } = await supabase
      .from('waste_deposits')
      .select('*, resident_id, total_value')
      .eq('id', depositId)
      .single();
    
    if (oldDepositError || !oldDeposit) {
      return c.json({ error: 'Deposit not found' }, 404);
    }
    
    const newTotalValue = weight * price_per_kg;
    const balanceDiff = newTotalValue - oldDeposit.total_value;
    
    // Update deposit
    const { data: updatedDeposit, error: updateError } = await supabase
      .from('waste_deposits')
      .update({
        waste_type,
        weight,
        price_per_kg,
        total_value: newTotalValue
      })
      .eq('id', depositId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating deposit:', updateError);
      return c.json({ error: updateError.message }, 400);
    }
    
    // Update resident's balance
    const { data: residentProfile, error: profileError } = await supabase
      .from('resident_profiles')
      .select('waste_bank_balance')
      .eq('id', oldDeposit.resident_id)
      .single();
    
    if (profileError) {
      return c.json({ error: profileError.message }, 400);
    }
    
    const newBalance = (residentProfile.waste_bank_balance || 0) + balanceDiff;
    
    const { error: balanceError } = await supabase
      .from('resident_profiles')
      .update({ waste_bank_balance: newBalance })
      .eq('id', oldDeposit.resident_id);
    
    if (balanceError) {
      console.error('Error updating balance:', balanceError);
      return c.json({ error: balanceError.message }, 400);
    }
    
    return c.json({ success: true, deposit: updatedDeposit, newBalance });
  } catch (error) {
    console.error('Error in update waste deposit:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Delete waste deposit (Admin only)
export async function deleteWasteDeposit(c: Context) {
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
    
    const depositId = c.req.param('id');
    
    // Get deposit to subtract from balance
    const { data: deposit, error: depositError } = await supabase
      .from('waste_deposits')
      .select('resident_id, total_value')
      .eq('id', depositId)
      .single();
    
    if (depositError || !deposit) {
      return c.json({ error: 'Deposit not found' }, 404);
    }
    
    // Update resident's balance (subtract the deposit value)
    const { data: residentProfile, error: profileError } = await supabase
      .from('resident_profiles')
      .select('waste_bank_balance')
      .eq('id', deposit.resident_id)
      .single();
    
    if (profileError) {
      return c.json({ error: profileError.message }, 400);
    }
    
    const newBalance = (residentProfile.waste_bank_balance || 0) - deposit.total_value;
    
    const { error: balanceError } = await supabase
      .from('resident_profiles')
      .update({ waste_bank_balance: newBalance >= 0 ? newBalance : 0 })
      .eq('id', deposit.resident_id);
    
    if (balanceError) {
      console.error('Error updating balance:', balanceError);
    }
    
    // Delete deposit
    const { error: deleteError } = await supabase
      .from('waste_deposits')
      .delete()
      .eq('id', depositId);
    
    if (deleteError) {
      console.error('Error deleting deposit:', deleteError);
      return c.json({ error: deleteError.message }, 400);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete waste deposit:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}