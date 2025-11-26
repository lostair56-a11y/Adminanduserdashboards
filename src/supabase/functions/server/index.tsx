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

// Login endpoint - handles both admin and resident login
app.post('/make-server-64eec44a/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, role } = body;
    
    if (!email || !password || !role) {
      return c.json({ error: 'Email, password, dan role wajib diisi' }, 400);
    }
    
    const supabase = getSupabaseClient();
    
    // Sign in with email and password using admin API
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
      
      // Special handling for email provider disabled error
      if (signInError.message.includes('Email logins are disabled') || 
          signInError.message.includes('email_provider_disabled')) {
        return c.json({ 
          error: '⚠️ CRITICAL: Email Provider belum di-enable di Supabase dashboard!\n\n' +
                 'SOLUSI WAJIB (5 menit):\n' +
                 '1. Login ke https://supabase.com/dashboard\n' +
                 '2. Pilih project Anda\n' +
                 '3. Buka: Authentication → Providers → Email\n' +
                 '4. Toggle ON "Enable Email provider"\n' +
                 '5. Check "Enable email signup"\n' +
                 '6. Check "Enable email login"\n' +
                 '7. Uncheck "Confirm email"\n' +
                 '8. Klik "Save"\n\n' +
                 'Baca file: CRITICAL-ENABLE-EMAIL-PROVIDER.md untuk panduan detail.\n\n' +
                 'Aplikasi TIDAK AKAN BERFUNGSI sampai Email Provider di-enable!',
          code: 'EMAIL_PROVIDER_DISABLED',
          action_required: 'ENABLE_EMAIL_PROVIDER_IN_DASHBOARD'
        }, 422);
      }
      
      // Provide user-friendly error messages
      if (signInError.message.includes('Invalid login credentials')) {
        return c.json({ error: 'Email atau password salah' }, 401);
      }
      
      return c.json({ error: signInError.message }, 401);
    }
    
    if (!signInData.user || !signInData.session) {
      return c.json({ error: 'Login gagal' }, 401);
    }
    
    // Verify role by checking profile tables
    const userId = signInData.user.id;
    
    if (role === 'admin') {
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (adminError || !adminProfile) {
        return c.json({ error: 'Akun ini bukan akun Admin RT' }, 403);
      }
      
      return c.json({
        success: true,
        user: signInData.user,
        session: signInData.session,
        profile: adminProfile,
        role: 'admin'
      });
    } else if (role === 'resident') {
      const { data: residentProfile, error: residentError } = await supabase
        .from('resident_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (residentError || !residentProfile) {
        return c.json({ error: 'Akun ini bukan akun Warga' }, 403);
      }
      
      return c.json({
        success: true,
        user: signInData.user,
        session: signInData.session,
        profile: residentProfile,
        role: 'resident'
      });
    } else {
      return c.json({ error: 'Role tidak valid' }, 400);
    }
  } catch (error) {
    console.error('Error in login:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

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

// Admin bank account endpoint - returns bank account for the same RT/RW as the user
app.get('/make-server-64eec44a/admin/bank-account', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized - Missing or invalid token' }, 401);
    }
    
    const accessToken = authHeader.split(' ')[1];
    
    // Decode JWT to get user ID
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      return c.json({ error: 'Unauthorized - Invalid token format' }, 401);
    }
    
    let payload;
    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      payload = JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token:', e);
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
    
    const userId = payload.sub;
    if (!userId) {
      return c.json({ error: 'Unauthorized - No user ID in token' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    // Get user's RT/RW from resident profile
    const { data: residentProfile, error: profileError } = await supabase
      .from('resident_profiles')
      .select('rt, rw')
      .eq('id', userId)
      .single();
    
    if (profileError || !residentProfile) {
      console.error('Error fetching resident profile:', profileError);
      return c.json({ error: 'Profil warga tidak ditemukan' }, 404);
    }
    
    // Get admin's bank account for the same RT/RW
    const { data: admin, error: adminError } = await supabase
      .from('admin_profiles')
      .select('bri_account_number, bri_account_name, name, rt, rw')
      .eq('rt', residentProfile.rt)
      .eq('rw', residentProfile.rw)
      .limit(1)
      .single();
    
    if (adminError || !admin) {
      console.error('Error fetching admin bank account:', adminError);
      return c.json({ error: 'Data rekening Admin RT tidak ditemukan. Hubungi Admin RT Anda.' }, 404);
    }
    
    return c.json({
      bankAccount: {
        accountNumber: admin.bri_account_number,
        accountName: admin.bri_account_name,
        rtName: admin.name,
        rt: admin.rt,
        rw: admin.rw
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