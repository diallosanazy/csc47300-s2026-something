import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Vendor = Database['public']['Tables']['vendors']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  vendor: Vendor | null;
  session: Session | null;
  loading: boolean;
  isVendor: boolean;
  refreshProfile: () => Promise<void>;
  refreshVendor: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  vendor: null,
  session: null,
  loading: true,
  isVendor: false,
  refreshProfile: async () => {},
  refreshVendor: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      setProfile(data);
      return data;
    } catch {
      setProfile(null);
      return null;
    }
  };

  const fetchVendor = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();
      setVendor(data);
      return data;
    } catch {
      setVendor(null);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const refreshVendor = async () => {
    if (user) await fetchVendor(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        Promise.all([fetchProfile(s.user.id), fetchVendor(s.user.id)]).then(() =>
          setLoading(false)
        );
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchProfile(s.user.id);
          fetchVendor(s.user.id);
        } else {
          setProfile(null);
          setVendor(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isVendor = profile?.role === 'vendor' || !!vendor;

  return (
    <AuthContext.Provider
      value={{ user, profile, vendor, session, loading, isVendor, refreshProfile, refreshVendor }}
    >
      {children}
    </AuthContext.Provider>
  );
}
