import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as fees from "./fees.tsx";
import * as wastebank from "./wastebank.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Create Supabase client with service role key
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase credentials not found');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

// Initialize storage bucket on startup
const initializeStorage = async () => {
  try {
    const supabase = getSupabaseClient();
    const bucketName = 'make-64eec44a-payment-proofs';
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
      console.log('Payment proofs bucket created');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize demo admin if none exists
const initializeDemoAdmin = async () => {
  try {
    console.log('Checking for existing admins...');
    const supabase = getSupabaseClient();
    
    // Check if any admin exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_profiles')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for admins:', checkError);
      return;
    }
    
    console.log('Existing admins count:', existingAdmins?.length || 0);
    
    if (!existingAdmins || existingAdmins.length === 0) {
      console.log('No admin found, creating demo admin...');
      
      // Create demo admin user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@rt.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: { role: 'admin' }
      });
      
      if (authError) {
        console.error('Error creating demo admin auth:', authError);
        return;
      }
      
      if (authData.user) {
        console.log('Demo admin auth created with ID:', authData.user.id);
        
        // Create admin profile
        const { error: profileError } = await supabase
          .from('admin_profiles')
          .insert({
            id: authData.user.id,
            email: 'admin@rt.com',
            name: 'Admin RT 003',
            position: 'Ketua RT',
            phone: '081234567890',
            address: 'Jl. Contoh No. 1',
            rt: '003',
            rw: '005',
            bri_account_number: '123456789012',
            bri_account_name: 'Admin RT 003'
          });
        
        if (profileError) {
          console.error('Error creating demo admin profile:', profileError);
        } else {
          console.log('Demo admin created successfully with credentials:');
          console.log('  Email: admin@rt.com');
          console.log('  Password: admin123');
        }
      }
    } else {
      console.log('Admin already exists, skipping demo admin creation');
    }
  } catch (error) {
    console.error('Error initializing demo admin:', error);
  }
};

// Initialize on startup
initializeStorage();
initializeDemoAdmin();

// Admin registration endpoint
app.post('/make-server-64eec44a/signup/admin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, position, phone, address, rt, rw, briAccountNumber, briAccountName } = body;
    
    const supabase = getSupabaseClient();
    
    // Create user with auto-confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });
    
    if (authError) {
      console.error('Auth error during admin registration:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    // Create admin profile
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        position,
        phone,
        address,
        rt,
        rw,
        bri_account_number: briAccountNumber,
        bri_account_name: briAccountName
      });
    
    if (profileError) {
      console.error('Profile error during admin registration:', profileError);
      return c.json({ error: profileError.message }, 400);
    }
    
    return c.json({ success: true, user: authData.user });
  } catch (error) {
    console.error('Error in admin registration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Resident registration endpoint
app.post('/make-server-64eec44a/signup/resident', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, houseNumber, rt, rw, phone, address, kelurahan, kecamatan, kota } = body;
    
    const supabase = getSupabaseClient();
    
    // Create user with auto-confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'resident' }
    });
    
    if (authError) {
      console.error('Auth error during resident registration:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    // Create resident profile
    const { error: profileError } = await supabase
      .from('resident_profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        house_number: houseNumber,
        rt,
        rw,
        phone,
        address,
        kelurahan,
        kecamatan,
        kota,
        waste_bank_balance: 0
      });
    
    if (profileError) {
      console.error('Profile error during resident registration:', profileError);
      return c.json({ error: profileError.message }, 400);
    }
    
    return c.json({ success: true, user: authData.user });
  } catch (error) {
    console.error('Error in resident registration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Fee management endpoints
app.post('/make-server-64eec44a/fees/create', fees.createFee);
app.post('/make-server-64eec44a/fees/pay', fees.payFee);
app.get('/make-server-64eec44a/fees/pending', fees.getPendingPayments);
app.post('/make-server-64eec44a/fees/verify', fees.verifyPayment);
app.get('/make-server-64eec44a/fees/:residentId?', fees.getFees);

// Waste bank endpoints
app.post('/make-server-64eec44a/wastebank/deposit', wastebank.addWasteDeposit);
app.post('/make-server-64eec44a/wastebank/pay-fee', wastebank.payFeeWithWasteBank);
app.get('/make-server-64eec44a/wastebank/stats', wastebank.getWasteBankStats);
app.get('/make-server-64eec44a/wastebank/deposits/:residentId?', wastebank.getWasteDeposits);

// Get all residents (Admin only)
app.get('/make-server-64eec44a/residents', async (c) => {
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
    
    // Get all residents
    const { data: residents, error: residentsError } = await supabase
      .from('resident_profiles')
      .select('*')
      .order('name');
    
    if (residentsError) {
      console.error('Error fetching residents:', residentsError);
      return c.json({ error: residentsError.message }, 400);
    }
    
    return c.json({ residents });
  } catch (error) {
    console.error('Error in get residents:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get Admin RT Bank Account Info
app.get('/make-server-64eec44a/admin/bank-account', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Get the first admin's bank account (in production, this would be based on RT/RW)
    const { data: adminProfiles, error: adminError } = await supabase
      .from('admin_profiles')
      .select('bri_account_number, bri_account_name, name, rt, rw')
      .limit(1);
    
    if (adminError) {
      console.error('Error fetching admin bank account:', adminError);
      return c.json({ error: 'Error fetching admin bank account: ' + adminError.message }, 500);
    }
    
    if (!adminProfiles || adminProfiles.length === 0) {
      console.error('No admin profiles found in database');
      return c.json({ error: 'Belum ada Admin RT yang terdaftar. Silakan registrasi Admin RT terlebih dahulu.' }, 404);
    }
    
    const adminProfile = adminProfiles[0];
    
    if (!adminProfile.bri_account_number || !adminProfile.bri_account_name) {
      console.error('Admin bank account information incomplete');
      return c.json({ error: 'Informasi rekening BRI Admin RT belum lengkap' }, 404);
    }
    
    return c.json({ 
      bankAccount: {
        accountNumber: adminProfile.bri_account_number,
        accountName: adminProfile.bri_account_name,
        rtName: adminProfile.name,
        rt: adminProfile.rt,
        rw: adminProfile.rw
      }
    });
  } catch (error) {
    console.error('Error in get admin bank account:', error);
    return c.json({ error: 'Internal server error: ' + error.message }, 500);
  }
});

// Delete resident (Admin only)
app.delete('/make-server-64eec44a/residents/:id', async (c) => {
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
    
    const residentId = c.req.param('id');
    
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
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete resident:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user profile
app.get('/make-server-64eec44a/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Check if admin
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (adminProfile) {
      return c.json({ profile: adminProfile, role: 'admin' });
    }
    
    // Check if resident
    const { data: residentProfile } = await supabase
      .from('resident_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (residentProfile) {
      return c.json({ profile: residentProfile, role: 'resident' });
    }
    
    return c.json({ error: 'Profile not found' }, 404);
  } catch (error) {
    console.error('Error in get profile:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);