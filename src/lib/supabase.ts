import { projectId, publicAnonKey } from '../utils/supabase/info';

// Use credentials from Supabase info file
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Custom Supabase Client using fetch API
class SupabaseClient {
  private url: string;
  private key: string;
  private session: { access_token: string; refresh_token: string; user: any } | null = null;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
    this.loadSession();
  }

  private loadSession() {
    const stored = localStorage.getItem('supabase.auth.token');
    if (stored) {
      try {
        this.session = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('supabase.auth.token');
      }
    }
  }

  private saveSession(session: any) {
    this.session = session;
    if (session) {
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } else {
      localStorage.removeItem('supabase.auth.token');
    }
  }

  auth = {
    getSession: async () => {
      // Check if session is expired
      if (this.session?.expires_at && this.session.expires_at < Date.now()) {
        // Try to refresh the session
        const refreshed = await this.auth.refreshSession();
        if (refreshed.data.session) {
          return { data: { session: refreshed.data.session }, error: null };
        } else {
          // Clear expired session
          this.saveSession(null);
          return { data: { session: null }, error: null };
        }
      }
      
      return { data: { session: this.session }, error: null };
    },

    refreshSession: async () => {
      try {
        if (!this.session?.refresh_token) {
          return { data: { session: null }, error: { message: 'No refresh token' } };
        }

        const response = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.key,
          },
          body: JSON.stringify({ 
            refresh_token: this.session.refresh_token 
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          this.saveSession(null);
          return { data: { session: null }, error };
        }

        const data = await response.json();
        const session = {
          ...data,
          expires_at: Date.now() + 3600000, // 1 hour
        };
        
        this.saveSession(session);
        return { data: { session }, error: null };
      } catch (error) {
        this.saveSession(null);
        return { data: { session: null }, error };
      }
    },

    setSession: async ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) => {
      try {
        // Verify the token and get user info
        const response = await fetch(`${this.url}/auth/v1/user`, {
          method: 'GET',
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${access_token}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return { data: { session: null }, error };
        }

        const user = await response.json();
        const session = {
          access_token,
          refresh_token,
          user,
          expires_at: Date.now() + 3600000, // 1 hour
        };
        
        this.saveSession(session);
        return { data: { session }, error: null };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },

    getUser: async (token?: string) => {
      try {
        const accessToken = token || this.session?.access_token;
        
        if (!accessToken) {
          return { data: { user: null }, error: { message: 'No access token' } };
        }

        const response = await fetch(`${this.url}/auth/v1/user`, {
          method: 'GET',
          headers: {
            'apikey': this.key,
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return { data: { user: null }, error };
        }

        const user = await response.json();
        return { data: { user }, error: null };
      } catch (error) {
        return { data: { user: null }, error };
      }
    },
    
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.key,
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { data: { user: null, session: null }, error: data };
        }

        this.saveSession(data);
        return { data: { user: data.user, session: data }, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const response = await fetch(`${this.url}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.key,
          },
          body: JSON.stringify({ 
            email, 
            password,
            data: options?.data || {}
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return { data: { user: null, session: null }, error: data };
        }

        this.saveSession(data);
        return { data: { user: data.user, session: data }, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },

    signOut: async () => {
      try {
        if (this.session?.access_token) {
          await fetch(`${this.url}/auth/v1/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.key,
              'Authorization': `Bearer ${this.session.access_token}`,
            },
          });
        }
        
        this.saveSession(null);
        return { error: null };
      } catch (error) {
        this.saveSession(null);
        return { error };
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simple implementation - call callback with current session
      callback('INITIAL_SESSION', this.session);
      
      // Return unsubscribe function
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    },
  };

  from(table: string) {
    return {
      select: (columns: string = '*') => {
        let query = `${this.url}/rest/v1/${table}?select=${columns}`;
        let filters: string[] = [];

        const builder = {
          eq: (column: string, value: any) => {
            filters.push(`${column}=eq.${value}`);
            return builder;
          },
          neq: (column: string, value: any) => {
            filters.push(`${column}=neq.${value}`);
            return builder;
          },
          gt: (column: string, value: any) => {
            filters.push(`${column}=gt.${value}`);
            return builder;
          },
          gte: (column: string, value: any) => {
            filters.push(`${column}=gte.${value}`);
            return builder;
          },
          lt: (column: string, value: any) => {
            filters.push(`${column}=lt.${value}`);
            return builder;
          },
          lte: (column: string, value: any) => {
            filters.push(`${column}=lte.${value}`);
            return builder;
          },
          in: (column: string, values: any[]) => {
            filters.push(`${column}=in.(${values.join(',')})`);
            return builder;
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            const direction = options?.ascending === false ? 'desc' : 'asc';
            filters.push(`order=${column}.${direction}`);
            return builder;
          },
          limit: (count: number) => {
            filters.push(`limit=${count}`);
            return builder;
          },
          single: async () => {
            const finalQuery = filters.length > 0 ? `${query}&${filters.join('&')}` : query;
            try {
              const response = await fetch(finalQuery, {
                headers: {
                  'apikey': this.key,
                  'Authorization': `Bearer ${this.session?.access_token || this.key}`,
                  'Accept': 'application/vnd.pgrst.object+json',
                },
              });

              if (!response.ok) {
                const error = await response.json();
                
                // If no rows found, return null data without error
                if (error.code === 'PGRST116') {
                  console.log('Single query: No data found');
                  return { data: null, error: null };
                }
                
                console.error('Single query error:', error);
                return { data: null, error };
              }

              const data = await response.json();
              console.log('Single query success, data:', data);
              return { data, error: null };
            } catch (error) {
              console.error('Single query exception:', error);
              return { data: null, error };
            }
          },
          maybeSingle: async () => {
            const finalQuery = filters.length > 0 ? `${query}&${filters.join('&')}` : query;
            try {
              const response = await fetch(finalQuery, {
                headers: {
                  'apikey': this.key,
                  'Authorization': `Bearer ${this.session?.access_token || this.key}`,
                  'Accept': 'application/vnd.pgrst.object+json',
                },
              });

              if (response.status === 406 || response.status === 404) {
                return { data: null, error: null };
              }

              if (!response.ok) {
                const error = await response.json();
                return { data: null, error };
              }

              const data = await response.json();
              return { data, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          then: async (resolve: any, reject: any) => {
            const finalQuery = filters.length > 0 ? `${query}&${filters.join('&')}` : query;
            try {
              const response = await fetch(finalQuery, {
                headers: {
                  'apikey': this.key,
                  'Authorization': `Bearer ${this.session?.access_token || this.key}`,
                },
              });

              if (!response.ok) {
                const error = await response.json();
                return reject({ data: null, error });
              }

              const data = await response.json();
              return resolve({ data, error: null });
            } catch (error) {
              return reject({ data: null, error });
            }
          },
        };

        return builder;
      },

      insert: async (values: any) => {
        try {
          const response = await fetch(`${this.url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.key,
              'Authorization': `Bearer ${this.session?.access_token || this.key}`,
              'Prefer': 'return=representation',
            },
            body: JSON.stringify(values),
          });

          if (!response.ok) {
            const error = await response.json();
            return { data: null, error };
          }

          const data = await response.json();
          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },

      update: (values: any) => {
        let filters: string[] = [];

        const builder = {
          eq: (column: string, value: any) => {
            filters.push(`${column}=eq.${value}`);
            return builder;
          },
          execute: async () => {
            const query = filters.length > 0 ? `${this.url}/rest/v1/${table}?${filters.join('&')}` : `${this.url}/rest/v1/${table}`;
            
            try {
              const response = await fetch(query, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': this.key,
                  'Authorization': `Bearer ${this.session?.access_token || this.key}`,
                  'Prefer': 'return=representation',
                },
                body: JSON.stringify(values),
              });

              if (!response.ok) {
                const error = await response.json();
                return { data: null, error };
              }

              const data = await response.json();
              return { data, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
        };

        return builder;
      },

      delete: () => {
        let filters: string[] = [];

        const builder = {
          eq: (column: string, value: any) => {
            filters.push(`${column}=eq.${value}`);
            return builder;
          },
          execute: async () => {
            const query = filters.length > 0 ? `${this.url}/rest/v1/${table}?${filters.join('&')}` : `${this.url}/rest/v1/${table}`;
            
            try {
              const response = await fetch(query, {
                method: 'DELETE',
                headers: {
                  'apikey': this.key,
                  'Authorization': `Bearer ${this.session?.access_token || this.key}`,
                },
              });

              if (!response.ok) {
                const error = await response.json();
                return { data: null, error };
              }

              return { data: null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
        };

        return builder;
      },
    };
  }
}

export const supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);

// Export function to create new client instances
export const createClient = () => new SupabaseClient(supabaseUrl, supabaseAnonKey);

// User type
export interface User {
  id: string;
  email?: string;
  user_metadata?: any;
  [key: string]: any;
}

// Database Types
export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  position: string;
  phone: string;
  address: string;
  rt: string;
  rw: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  bri_account_number: string;
  bri_account_name: string;
  created_at: string;
}

export interface ResidentProfile {
  id: string;
  email: string;
  name: string;
  house_number: string;
  rt: string;
  rw: string;
  phone: string;
  address: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  waste_bank_balance: number;
  created_at: string;
}

export interface FeePayment {
  id: string;
  resident_id: string;
  amount: number;
  month: string;
  year: number;
  status: 'paid' | 'unpaid';
  payment_method?: string;
  payment_date?: string;
  description?: string;
  created_at: string;
}

export interface WasteDeposit {
  id: string;
  resident_id: string;
  waste_type: string;
  weight: number;
  price_per_kg: number;
  total_value: number;
  date: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  date: string;
  area: string;
  time: string;
  status: 'scheduled' | 'completed';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  created_at: string;
}