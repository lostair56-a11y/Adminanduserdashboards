import { Context } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase credentials not found');
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

// Helper function to decode JWT and get user ID
const getUserIdFromToken = (accessToken: string): string | null => {
  try {
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || null;
  } catch (e) {
    console.error('Error decoding token:', e);
    return null;
  }
};

export async function createFee(c: Context) {
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
    const { resident_id, amount, month, year, description } = body;
    
    if (!resident_id || !amount || !month || !year) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Check if fee already exists for this month/year
    const { data: existingFee } = await supabase
      .from('fee_payments')
      .select('id')
      .eq('resident_id', resident_id)
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (existingFee) {
      return c.json({ error: 'Tagihan untuk bulan ini sudah ada' }, 400);
    }
    
    // Create fee payment record
    const { data: feeData, error: feeError } = await supabase
      .from('fee_payments')
      .insert({
        resident_id,
        amount,
        month,
        year,
        status: 'unpaid'
      })
      .select()
      .single();
    
    if (feeError) {
      console.error('Error creating fee:', feeError);
      return c.json({ error: feeError.message }, 400);
    }
    
    // Store description in KV if provided
    if (description) {
      await kv.set(`fee_description_${feeData.id}`, description);
    }
    
    // Create notification for resident
    await supabase
      .from('notifications')
      .insert({
        user_id: resident_id,
        title: 'Tagihan Baru',
        message: `Anda memiliki tagihan baru sebesar Rp ${amount.toLocaleString('id-ID')} untuk ${month} ${year}`,
        type: 'info'
      });
    
    return c.json({ success: true, fee: feeData });
  } catch (error) {
    console.error('Error in create fee:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function getFees(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin or resident
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('rt, rw')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle to avoid error when not found

    let residentIds: string[] = [];

    if (adminProfile && adminProfile.rt && adminProfile.rw) {
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
      // Resident: Get their own fees
      residentIds = [user.id];
    }

    if (residentIds.length === 0) {
      return c.json({ fees: [] });
    }

    const residentId = c.req.param('residentId');
    
    let query = supabase
      .from('fee_payments')
      .select('*')
      .in('resident_id', residentIds)
      .order('created_at', { ascending: false });

    if (residentId && residentId !== 'undefined') {
      query = query.eq('resident_id', residentId);
    }

    const { data: fees, error } = await query;

    if (error) {
      console.error('Error fetching fees:', error);
      return c.json({ error: error.message }, 400);
    }

    // Fetch descriptions from KV store
    const feesWithDescriptions = await Promise.all(
      (fees || []).map(async (fee) => {
        const description = await kv.get(`fee_description_${fee.id}`);
        return {
          ...fee,
          description: description || fee.description
        };
      })
    );

    return c.json({ fees: feesWithDescriptions });
  } catch (error) {
    console.error('Error in get fees:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function payFee(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - Missing token' }, 401);
    }
    
    const userId = getUserIdFromToken(accessToken);
    if (!userId) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
    
    const supabase = getSupabaseClient();
    
    const body = await c.req.json();
    const { feeId, paymentMethod, paymentProof } = body;
    
    if (!feeId || !paymentMethod) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Verify the fee belongs to the user and is unpaid
    const { data: fee, error: feeError } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('id', feeId)
      .eq('resident_id', userId)
      .eq('status', 'unpaid')
      .single();
    
    if (feeError || !fee) {
      return c.json({ error: 'Fee not found or already paid' }, 404);
    }
    
    // Upload payment proof if provided
    let paymentProofUrl = null;
    if (paymentProof) {
      try {
        // Extract base64 data
        const base64Data = paymentProof.split(',')[1];
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const fileName = `${userId}/${feeId}-${Date.now()}.jpg`;
        const bucketName = 'make-64eec44a-payment-proofs';
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Error uploading payment proof:', uploadError);
        } else {
          // Get signed URL for the uploaded file
          const { data: signedUrlData } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(fileName, 31536000); // 1 year
          
          if (signedUrlData) {
            paymentProofUrl = signedUrlData.signedUrl;
          }
        }
      } catch (uploadError) {
        console.error('Error processing payment proof:', uploadError);
      }
    }
    
    // Store payment proof URL in KV store
    if (paymentProofUrl) {
      await kv.set(`payment_proof_${feeId}`, paymentProofUrl);
    }
    
    // Update fee with payment info but keep status as unpaid (waiting for admin verification)
    // We use unpaid status with payment_date/method filled to indicate pending verification
    const { data: updatedFee, error: updateError } = await supabase
      .from('fee_payments')
      .update({
        payment_date: new Date().toISOString(),
        payment_method: paymentMethod
      })
      .eq('id', feeId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating fee payment:', updateError);
      return c.json({ error: updateError.message }, 400);
    }
    
    // Get resident name
    const { data: residentProfile } = await supabase
      .from('resident_profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    // Create notification for admin (get first admin)
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
          title: 'Pembayaran Menunggu Verifikasi',
          message: `${residentProfile?.name || 'Warga'} telah mengirim bukti pembayaran iuran ${fee.month} ${fee.year} sebesar Rp ${fee.amount.toLocaleString('id-ID')} via ${paymentMethod}`,
          type: 'info'
        });
    }
    
    // Create notification for resident
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Bukti Pembayaran Terkirim',
        message: `Bukti pembayaran iuran ${fee.month} ${fee.year} sebesar Rp ${fee.amount.toLocaleString('id-ID')} telah dikirim. Menunggu verifikasi Admin RT.`,
        type: 'success'
      });
    
    return c.json({ success: true, fee: updatedFee });
  } catch (error) {
    console.error('Error in pay fee:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function getPendingPayments(c: Context) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Check if user is admin and get RT/RW
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id, rt, rw')
      .eq('id', user.id)
      .single();
    
    if (adminError || !adminProfile) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }
    
    // Get all residents in this RT/RW
    const { data: residents, error: residentsError } = await supabase
      .from('resident_profiles')
      .select('id')
      .eq('rt', adminProfile.rt)
      .eq('rw', adminProfile.rw);
    
    if (residentsError) {
      console.error('Error fetching residents:', residentsError);
      return c.json({ error: residentsError.message }, 400);
    }
    
    const residentIds = residents?.map(r => r.id) || [];
    
    if (residentIds.length === 0) {
      return c.json({ fees: [] });
    }
    
    // Get all pending fee payments (unpaid with payment_date filled) for residents in this RT/RW
    const { data: fees, error: feesError } = await supabase
      .from('fee_payments')
      .select(`
        *,
        resident:resident_profiles!resident_id (
          name,
          house_number,
          phone,
          rt,
          rw
        )
      `)
      .in('resident_id', residentIds)
      .eq('status', 'unpaid')
      .not('payment_date', 'is', null)
      .order('payment_date', { ascending: false });
    
    if (feesError) {
      console.error('Error fetching pending fees:', feesError);
      return c.json({ error: feesError.message }, 400);
    }
    
    // Fetch payment proofs from KV store
    const feesWithProofs = await Promise.all(
      (fees || []).map(async (fee) => {
        const proofUrl = await kv.get(`payment_proof_${fee.id}`);
        return {
          ...fee,
          payment_proof: proofUrl
        };
      })
    );
    
    return c.json({ fees: feesWithProofs });
  } catch (error) {
    console.error('Error in get pending fees:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

export async function verifyPayment(c: Context) {
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
    const { feeId, action, reason } = body; // action: 'approve' or 'reject'
    
    if (!feeId || !action) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get the fee
    const { data: fee, error: feeError } = await supabase
      .from('fee_payments')
      .select('*')
      .eq('id', feeId)
      .eq('status', 'unpaid')
      .not('payment_date', 'is', null)
      .single();
    
    if (feeError || !fee) {
      return c.json({ error: 'Fee not found or not pending' }, 404);
    }
    
    let newStatus = 'unpaid';
    let notificationTitle = '';
    let notificationMessage = '';
    
    if (action === 'approve') {
      newStatus = 'paid';
      notificationTitle = 'Pembayaran Disetujui';
      notificationMessage = `Pembayaran iuran ${fee.month} ${fee.year} sebesar Rp ${fee.amount.toLocaleString('id-ID')} telah disetujui oleh Admin RT.`;
    } else if (action === 'reject') {
      newStatus = 'unpaid';
      notificationTitle = 'Pembayaran Ditolak';
      notificationMessage = `Pembayaran iuran ${fee.month} ${fee.year} ditolak. ${reason || 'Silakan hubungi Admin RT untuk informasi lebih lanjut.'}`;
      
      // Delete payment proof from KV when rejected
      await kv.del(`payment_proof_${feeId}`);
    }
    
    // Update fee status
    const updateData: any = {
      status: newStatus,
      payment_date: action === 'approve' ? fee.payment_date : null,
      payment_method: action === 'approve' ? fee.payment_method : null
    };
    
    const { data: updatedFee, error: updateError } = await supabase
      .from('fee_payments')
      .update(updateData)
      .eq('id', feeId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating fee:', updateError);
      return c.json({ error: updateError.message }, 400);
    }
    
    // Create notification for resident
    await supabase
      .from('notifications')
      .insert({
        user_id: fee.resident_id,
        title: notificationTitle,
        message: notificationMessage,
        type: action === 'approve' ? 'success' : 'warning'
      });
    
    return c.json({ success: true, fee: updatedFee });
  } catch (error) {
    console.error('Error in verify payment:', error);
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

// Update fee
export async function updateFee(c: Context) {
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
    
    const feeId = c.req.param('id');
    const body = await c.req.json();
    const { amount, month, year, description } = body;
    
    if (!amount || !month || !year) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const { data, error } = await supabase
      .from('fee_payments')
      .update({
        amount,
        month,
        year,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', feeId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fee:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true, fee: data });
  } catch (error) {
    console.error('Error in update fee:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

// Delete fee
export async function deleteFee(c: Context) {
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
    
    const feeId = c.req.param('id');
    
    const { error } = await supabase
      .from('fee_payments')
      .delete()
      .eq('id', feeId);
    
    if (error) {
      console.error('Error deleting fee:', error);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in delete fee:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}