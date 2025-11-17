import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, AdminProfile, ResidentProfile } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'resident' | null;
  profile: AdminProfile | ResidentProfile | null;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
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
      // Try to load admin profile
      const { data: adminData } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (adminData) {
        setProfile(adminData);
        setUserRole('admin');
        setLoading(false);
        return 'admin';
      }

      // Try to load resident profile
      const { data: residentData } = await supabase
        .from('resident_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (residentData) {
        setProfile(residentData);
        setUserRole('resident');
        setLoading(false);
        return 'resident';
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const actualRole = await loadUserProfile(data.user.id);
      
      // Verify role matches
      if (role === 'admin' && actualRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Akun ini bukan akun Admin RT');
      }
      if (role === 'resident' && actualRole !== 'resident') {
        await supabase.auth.signOut();
        throw new Error('Akun ini bukan akun Warga');
      }
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

      // Now sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error('Pendaftaran berhasil, tapi login gagal: ' + signInError.message);
      }

      if (signInData.user) {
        await loadUserProfile(signInData.user.id);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    userRole,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}