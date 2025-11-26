import { createClient } from "npm:@supabase/supabase-js@2";

const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase credentials not found');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export const getReports = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('rt, rw')
      .eq('id', user.id)
      .single();
    
    if (profileError || !adminProfile) {
      return c.json({ error: 'Admin profile not found' }, 404);
    }
    
    const month = c.req.query('month') || '01';
    const year = c.req.query('year') || '2025';
    
    // Calculate date range for the selected month
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    
    // Get all residents for this RT/RW
    const { data: residents, error: residentsError } = await supabase
      .from('resident_profiles')
      .select('id')
      .eq('rt', adminProfile.rt)
      .eq('rw', adminProfile.rw);
    
    if (residentsError) {
      console.error('Error fetching residents:', residentsError);
      return c.json({ error: residentsError.message }, 500);
    }
    
    const totalResidents = residents?.length || 0;
    const residentIds = residents?.map(r => r.id) || [];
    
    if (residentIds.length === 0) {
      // No residents, return empty data
      return c.json({
        fees: { total: 0, paid: 0, pending: 0, totalAmount: 0, paidAmount: 0 },
        wasteBank: { totalDeposits: 0, totalWeight: 0, totalValue: 0, byType: [] },
        participation: { totalResidents: 0, feePayersCount: 0, wasteBankParticipantsCount: 0 },
        financial: { totalIncome: 0, feeIncome: 0, wasteBankIncome: 0 },
        yearlyData: [],
      });
    }
    
    // Get fee_payments data for the selected month and residents
    const monthName = getMonthName(parseInt(month));
    const { data: feePayments, error: feesError } = await supabase
      .from('fee_payments')
      .select('*')
      .in('resident_id', residentIds)
      .eq('month', monthName)
      .eq('year', parseInt(year));
    
    if (feesError) {
      console.error('Error fetching fees:', feesError);
      return c.json({ error: feesError.message }, 500);
    }
    
    const totalFees = feePayments?.length || 0;
    const paidFees = feePayments?.filter(f => f.status === 'paid') || [];
    const pendingFees = feePayments?.filter(f => f.status === 'pending') || [];
    const totalAmount = feePayments?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    const paidAmount = paidFees.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
    
    // Get unique residents who paid fees
    const feePayersSet = new Set(paidFees.map(f => f.resident_id));
    
    // Get waste bank deposits for the selected month (from residents in this RT/RW)
    const { data: deposits, error: depositsError } = await supabase
      .from('waste_deposits')
      .select('*')
      .in('resident_id', residentIds)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (depositsError) {
      console.error('Error fetching deposits:', depositsError);
      return c.json({ error: depositsError.message }, 500);
    }
    
    const totalDeposits = deposits?.length || 0;
    const totalWeight = deposits?.reduce((sum, d) => sum + (d.weight || 0), 0) || 0;
    const totalValue = deposits?.reduce((sum, d) => sum + (d.total_value || 0), 0) || 0;
    
    // Group by waste type
    const byTypeMap = new Map();
    deposits?.forEach(d => {
      if (!byTypeMap.has(d.waste_type)) {
        byTypeMap.set(d.waste_type, { type: d.waste_type, weight: 0, value: 0 });
      }
      const item = byTypeMap.get(d.waste_type);
      item.weight += d.weight || 0;
      item.value += d.total_value || 0;
    });
    const byType = Array.from(byTypeMap.values());
    
    // Get unique residents who deposited waste
    const wasteBankParticipantsSet = new Set(deposits?.map(d => d.resident_id) || []);
    
    // Get yearly data (all months in the selected year)
    const yearlyData = [];
    const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    for (let m = 1; m <= 12; m++) {
      const monthStr = m.toString().padStart(2, '0');
      const monthStartDate = `${year}-${monthStr}-01`;
      const monthEndDate = new Date(parseInt(year), m, 0).toISOString().split('T')[0];
      
      // Get fees for this month from residents in this RT/RW
      const currentMonthName = getMonthName(m);
      const { data: monthFees } = await supabase
        .from('fee_payments')
        .select('amount, payment_date')
        .in('resident_id', residentIds)
        .eq('status', 'paid')
        .eq('month', currentMonthName)
        .eq('year', parseInt(year));
      
      const monthFeesAmount = monthFees?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
      
      // Get waste bank deposits for this month
      const { data: monthDeposits } = await supabase
        .from('waste_deposits')
        .select('total_value')
        .in('resident_id', residentIds)
        .gte('date', monthStartDate)
        .lte('date', monthEndDate);
      
      const monthWasteBankValue = monthDeposits?.reduce((sum, d) => sum + (d.total_value || 0), 0) || 0;
      
      yearlyData.push({
        month: shortMonthNames[m - 1],
        fees: monthFeesAmount,
        wasteBank: monthWasteBankValue,
      });
    }
    
    return c.json({
      fees: {
        total: totalFees,
        paid: paidFees.length,
        pending: pendingFees.length,
        totalAmount,
        paidAmount,
      },
      wasteBank: {
        totalDeposits,
        totalWeight,
        totalValue,
        byType,
      },
      participation: {
        totalResidents,
        feePayersCount: feePayersSet.size,
        wasteBankParticipantsCount: wasteBankParticipantsSet.size,
      },
      financial: {
        totalIncome: paidAmount + totalValue,
        feeIncome: paidAmount,
        wasteBankIncome: totalValue,
      },
      yearlyData,
    });
  } catch (error) {
    console.error('Error in getReports:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

const getMonthName = (month: number) => {
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return monthNames[month - 1];
};