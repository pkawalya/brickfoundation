import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  is_active: boolean;
  role: 'admin' | 'user';
  avatar_url?: string;
  bio?: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  verificationEmail: string | null;
  setUser: (user: User | null) => void;
  setVerificationEmail: (email: string | null) => void;
  signUp: (email: string, password: string, full_name: string, phone_number: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  resendVerificationEmail: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  verificationEmail: null,
  setUser: (user) => set({ user }),
  setVerificationEmail: (email) => set({ verificationEmail: email }),
  signUp: async (email, password, full_name, phone_number) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone_number,
        },
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email,
            full_name,
            phone_number,
            is_active: false,
            role: 'user',
          },
        ]);
      
      if (userError) throw userError;
      set({ verificationEmail: email });
    }
  },
  verifyOTP: async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', data.user.id);
      
      if (updateError) throw updateError;
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) throw userError;
      
      set({ user: userData as User, verificationEmail: null });
    }
  },
  signIn: async (email, password) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Fetch user data including role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (userError) throw userError;
        
        if (!userData.is_active) {
          set({ verificationEmail: email });
          throw new Error('Please verify your email address to continue');
        }
        
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authData.user.id);
        
        // Set user with role from database
        set({ user: { ...userData, role: userData.role } as User });
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid login credentials');
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  },
  resendVerificationEmail: async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify`,
      }
    });
    
    if (error) throw error;
  },
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    if (error) throw error;
  },
}));