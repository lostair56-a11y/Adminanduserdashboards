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

// Get all residents (filtered by admin's location)
export async function getResidents(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    if (!accessToken) {
      console.error('Get residents error: No access token provided');
      return c.json({ error: 'Unauthorized - No access token provided' }, 401);
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error('Get residents auth error:', authError);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
    
    // Get admin profile to get their location
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('rt, rw')
      .eq('id', user.id)
      .single();
    
    if (adminError) {
      console.error('Error fetching admin profile:', adminError);
      return c.json({ 
        error: 'Admin profile not found. Please make sure you are logged in as an admin.',
        details: adminError.message 
      }, 404);
    }
    
    if (!adminProfile) {
      console.error('Admin profile is null for user:', user.id);
      return c.json({ error: 'Admin profile not found' }, 404);
    }
    
    // Get residents with same RT/RW as admin
    const { data: residents, error } = await supabase
      .from('resident_profiles')
      .select('*')
      .eq('rt', adminProfile.rt)
      .eq('rw', adminProfile.rw)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching residents:', error);
      return c.json({ 
        error: 'Failed to fetch residents data',
        details: error.message 
      }, 400);
    }
    
    return c.json({ 
      residents: residents || [],
      adminLocation: {
        rt: adminProfile.rt,
        rw: adminProfile.rw,
        kelurahan: 'N/A',
        kecamatan: 'N/A',
        kota: 'N/A'
      }
    });
  } catch (error) {
    console.error('Error in get residents:', error);
    return c.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// Update resident
export async function updateResident(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
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
    
    const residentId = c.req.param('id');
    const body = await c.req.json();
    const { name, email, phone, house_number, address } = body;
    
    if (!name || !email || !phone || !house_number || !address) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const { data, error } = await supabase
      .from('resident_profiles')
      .update({
        name,
        email,
        phone,
        house_number,
        address,
        updated_at: new Date().toISOString()
      })
      .eq('id', residentId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating resident:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true, resident: data });
  } catch (error) {
    console.error('Error in update resident:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Delete resident
export async function deleteResident(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
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
    
    const residentId = c.req.param('id');
    
    // Delete related records first (fees, waste deposits, notifications)
    await supabase.from('fee_payments').delete().eq('resident_id', residentId);
    await supabase.from('waste_deposits').delete().eq('resident_id', residentId);
    await supabase.from('notifications').delete().eq('user_id', residentId);
    
    // Delete resident profile
    const { error: deleteError } = await supabase
      .from('resident_profiles')
      .delete()
      .eq('id', residentId);
    
    if (deleteError) {
      console.error('Error deleting resident:', deleteError);
      return c.json({ error: deleteError.message }, 400);
    }
    
    // Delete auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(residentId);
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Continue anyway since profile is deleted
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete resident:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}