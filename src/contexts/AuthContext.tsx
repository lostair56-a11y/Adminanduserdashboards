import { createContext, useContext, useEffect, useState } from 'react';
import { User, supabase, AdminProfile, ResidentProfile } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'resident' | null;
  profile: AdminProfile | ResidentProfile | null;
  session: { access_token: string; user: any } | null;
  loading: boolean;
  signIn: (email: string, password: string, role: 'admin' | 'resident') => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: 'admin' | 'resident',
    profileData: any
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  profile: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'resident' | null>(null);
  const [profile, setProfile] = useState<AdminProfile | ResidentProfile | null>(null);
  const [session, setSession] = useState<{ access_token: string; user: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
        setSession(session);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
        setSession(session);
      } else {
        setProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading user profile for:', userId);
      }
      
      // Try to load admin profile first
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (process.env.NODE_ENV === 'development') {
          console.log('Admin profile query result:', { adminData, adminError });
        }

        if (adminData && !adminError) {
          if (process.env.NODE_ENV === 'development') {
            console.log('User is admin, setting profile');
          }
          setProfile(adminData);
          setUserRole('admin');
          setLoading(false);
          return 'admin';
        }
      } catch (adminQueryError) {
        // Silently catch admin profile query errors (user is likely a resident)
        if (process.env.NODE_ENV === 'development') {
          console.log('Admin profile not found (expected for residents)');
        }
      }

      // Try to load resident profile
      try {
        const { data: residentData, error: residentError } = await supabase
          .from('resident_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (process.env.NODE_ENV === 'development') {
          console.log('Resident profile query result:', { residentData, residentError });
        }

        if (residentData && !residentError) {
          if (process.env.NODE_ENV === 'development') {
            console.log('User is resident, setting profile');
          }
          setProfile(residentData);
          setUserRole('resident');
          setLoading(false);
          return 'resident';
        }
      } catch (residentQueryError) {
        console.error('Error loading resident profile:', residentQueryError);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('No profile found for user');
      }
      setLoading(false);
      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
      return null;
    }
  };

  const signIn = async (email: string, password: string, role: 'admin' | 'resident') => {
    try {
      console.log('🔐 Attempting login...', { email, role });
      
      // Call backend login endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, role }),
        }
      );

      const data = await response.json();
      console.log('📡 Login response:', { status: response.ok, data });

      if (!response.ok) {
        // Check for specific error types
        if (data.error?.includes('email_provider_disabled') || 
            data.error?.includes('Email logins are disabled')) {
          throw new Error(
            '❌ Email Provider belum di-enable di Supabase!\n\n' +
            'LANGKAH FIX (5 menit):\n' +
            '1. Buka Supabase Dashboard\n' +
            '2. Authentication → Providers → Email\n' +
            '3. Toggle ON "Enable Email provider"\n' +
            '4. Klik "Save"\n\n' +
            'Lihat file: CRITICAL-ENABLE-EMAIL-PROVIDER.md'
          );
        }
        
        if (data.error?.includes('Invalid login credentials')) {
          throw new Error('Email atau password salah. Pastikan Anda sudah registrasi terlebih dahulu.');
        }

        throw new Error(data.error || 'Login gagal');
      }

      // Set session manually using the session from backend
      if (data.session && data.user) {
        console.log('✅ Login successful, setting session...');
        
        // Use Supabase client to set the session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error('❌ Error setting session:', sessionError);
          throw new Error('Gagal membuat sesi login');
        }

        setSession(data.session);
        setUser(data.user);
        setProfile(data.profile);
        setUserRole(data.role);
        
        console.log('✅ Session set successfully');
      } else {
        throw new Error('Data sesi tidak lengkap');
      }
    } catch (error: any) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'admin' | 'resident',
    profileData: any
  ) => {
    try {
      // Call server endpoint for signup
      const endpoint = role === 'admin' 
        ? '/signup/admin' 
        : '/signup/resident';
      
      const payload = role === 'admin' 
        ? {
            email,
            password,
            name: profileData.name,
            position: profileData.position,
            phone: profileData.phone,
            address: profileData.address,
            rt: profileData.rt,
            rw: profileData.rw,
            briAccountNumber: profileData.briAccountNumber,
            briAccountName: profileData.briAccountName,
          }
        : {
            email,
            password,
            name: profileData.name,
            houseNumber: profileData.houseNumber,
            rt: profileData.rt,
            rw: profileData.rw,
            phone: profileData.phone,
            address: profileData.address,
            kelurahan: profileData.kelurahan,
            kecamatan: profileData.kecamatan,
            kota: profileData.kota,
          };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-64eec44a${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Pendaftaran gagal');
      }

      // Now sign in the user using backend endpoint
      await signIn(email, password, role);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setUserRole(null);
    if (error) throw error;
  };

  const value = {
    user,
    userRole,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}