import { createClient } from "npm:@supabase/supabase-js@2";

const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase credentials not found');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

// Get all schedules for admin's RT/RW
export const getSchedules = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - Missing token' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Get schedules auth error:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get admin profile
    const { data: adminProfile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('rt, rw')
      .eq('id', user.id)
      .single();
    
    if (profileError || !adminProfile) {
      console.error('Error fetching admin profile:', profileError);
      return c.json({ error: 'Admin profile not found' }, 404);
    }
    
    // Get schedules for this RT/RW
    const { data: schedules, error: schedulesError } = await supabase
      .from('pickup_schedules')
      .select('*')
      .eq('rt', adminProfile.rt)
      .eq('rw', adminProfile.rw)
      .order('date', { ascending: false });
    
    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      return c.json({ error: schedulesError.message }, 500);
    }
    
    return c.json({ schedules: schedules || [] });
  } catch (error) {
    console.error('Error in getSchedules:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Create new schedule
export const createSchedule = async (c: any) => {
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
    
    const body = await c.req.json();
    const { date, area, time } = body;
    
    if (!date || !area || !time) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Create schedule
    const { data: schedule, error: insertError } = await supabase
      .from('pickup_schedules')
      .insert({
        date,
        area,
        time,
        rt: adminProfile.rt,
        rw: adminProfile.rw,
        status: 'scheduled',
        created_by: user.id
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating schedule:', insertError);
      return c.json({ error: insertError.message }, 500);
    }
    
    return c.json({ schedule });
  } catch (error) {
    console.error('Error in createSchedule:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Update schedule
export const updateSchedule = async (c: any) => {
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
    
    const scheduleId = c.req.param('id');
    const body = await c.req.json();
    const { date, area, time, status } = body;
    
    // Update schedule
    const { data: schedule, error: updateError } = await supabase
      .from('pickup_schedules')
      .update({
        ...(date && { date }),
        ...(area && { area }),
        ...(time && { time }),
        ...(status && { status })
      })
      .eq('id', scheduleId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating schedule:', updateError);
      return c.json({ error: updateError.message }, 500);
    }
    
    return c.json({ schedule });
  } catch (error) {
    console.error('Error in updateSchedule:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Delete schedule
export const deleteSchedule = async (c: any) => {
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
    
    const scheduleId = c.req.param('id');
    
    // Delete schedule
    const { error: deleteError } = await supabase
      .from('pickup_schedules')
      .delete()
      .eq('id', scheduleId);
    
    if (deleteError) {
      console.error('Error deleting schedule:', deleteError);
      return c.json({ error: deleteError.message }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

// Get schedules for residents (public view for their RT/RW)
export const getPublicSchedules = async (c: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get resident profile
    const { data: residentProfile, error: profileError } = await supabase
      .from('resident_profiles')
      .select('rt, rw')
      .eq('id', user.id)
      .single();
    
    if (profileError || !residentProfile) {
      console.error('Error fetching resident profile:', profileError);
      return c.json({ error: 'Resident profile not found' }, 404);
    }
    
    // Get schedules for this RT/RW (only scheduled and upcoming)
    const { data: schedules, error: schedulesError } = await supabase
      .from('pickup_schedules')
      .select('*')
      .eq('rt', residentProfile.rt)
      .eq('rw', residentProfile.rw)
      .eq('status', 'scheduled')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      return c.json({ error: schedulesError.message }, 500);
    }
    
    return c.json({ schedules: schedules || [] });
  } catch (error) {
    console.error('Error in getPublicSchedules:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
