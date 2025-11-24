import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as fees from "./fees.tsx";
import * as wastebank from "./wastebank.tsx";
import * as residents from "./residents.tsx";
import * as schedule from "./schedule.tsx";
import * as reports from "./reports.tsx";

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
      console.log('Admin(s) already exist');
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
    
    // Check if email already exists in auth.users
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const emailExists = existingUser?.users?.some(user => user.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' }, 400);
    }
    
    // Create user with auto-confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });
    
    if (authError) {
      console.error('Auth error during admin registration:', authError);
      
      // Handle specific error cases
      if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
        return c.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' }, 400);
      }
      
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
      
      // If profile creation fails, delete the auth user to keep data consistent
      await supabase.auth.admin.deleteUser(authData.user.id);
      
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
    
    // Check if email already exists in auth.users
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const emailExists = existingUser?.users?.some(user => user.email === email);
    
    if (emailExists) {
      return c.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' }, 400);
    }
    
    // Create user with auto-confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'resident' }
    });
    
    if (authError) {
      console.error('Auth error during resident registration:', authError);
      
      // Handle specific error cases
      if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
        return c.json({ error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' }, 400);
      }
      
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
      
      // If profile creation fails, delete the auth user to keep data consistent
      await supabase.auth.admin.deleteUser(authData.user.id);
      
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
app.put('/make-server-64eec44a/fees/:id', fees.updateFee);
app.delete('/make-server-64eec44a/fees/:id', fees.deleteFee);
app.post('/make-server-64eec44a/fees/pay', fees.payFee);
app.get('/make-server-64eec44a/fees/pending', fees.getPendingPayments);
app.post('/make-server-64eec44a/fees/verify', fees.verifyPayment);
app.get('/make-server-64eec44a/fees/:residentId?', fees.getFees);

// Waste bank endpoints
app.post('/make-server-64eec44a/wastebank/deposit', wastebank.addWasteDeposit);
app.put('/make-server-64eec44a/wastebank/deposit/:id', wastebank.updateWasteDeposit);
app.delete('/make-server-64eec44a/wastebank/deposit/:id', wastebank.deleteWasteDeposit);
app.post('/make-server-64eec44a/wastebank/pay-fee', wastebank.payFeeWithWasteBank);
app.get('/make-server-64eec44a/wastebank/stats', wastebank.getWasteBankStats);
app.get('/make-server-64eec44a/wastebank/deposits/:residentId?', wastebank.getWasteDeposits);

// Residents endpoints
app.get('/make-server-64eec44a/residents', residents.getResidents);
app.put('/make-server-64eec44a/residents/:id', residents.updateResident);
app.delete('/make-server-64eec44a/residents/:id', residents.deleteResident);

// Schedule endpoints
app.get('/make-server-64eec44a/schedules', schedule.getSchedules);
app.get('/make-server-64eec44a/schedules/public', schedule.getPublicSchedules);
app.post('/make-server-64eec44a/schedules/create', schedule.createSchedule);
app.put('/make-server-64eec44a/schedules/:id', schedule.updateSchedule);
app.delete('/make-server-64eec44a/schedules/:id', schedule.deleteSchedule);

// Admin bank account endpoint
app.get('/make-server-64eec44a/admin/bank-account', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Get the first admin's bank account info
    const { data: admin, error } = await supabase
      .from('admin_profiles')
      .select('bri_account_number, bri_account_name, name')
      .limit(1)
      .single();
    
    if (error || !admin) {
      console.error('Error fetching admin bank account:', error);
      return c.json({ error: 'Data rekening tidak ditemukan' }, 404);
    }
    
    return c.json({
      bankAccount: {
        accountNumber: admin.bri_account_number,
        accountName: admin.bri_account_name,
        adminName: admin.name
      }
    });
  } catch (error) {
    console.error('Error in bank account endpoint:', error);
    return c.json({ error: 'Gagal mengambil data rekening' }, 500);
  }
});

// Reports endpoints
app.get('/make-server-64eec44a/reports', reports.getReports);

Deno.serve(app.fetch);