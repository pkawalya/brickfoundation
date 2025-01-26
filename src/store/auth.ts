import { create } from 'zustand';
import { supabase } from '../config/supabaseClient';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  status: 'pending' | 'active' | 'suspended';
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
  setLoading: (loading: boolean) => void;
  setVerificationEmail: (email: string | null) => void;
  signUp: (email: string, password: string, full_name: string, phone_number: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  resendVerificationEmail: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  initializeSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  verificationEmail: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setVerificationEmail: (email) => set({ verificationEmail: email }),

  initializeSession: async () => {
    try {
      console.log('AuthStore: Initializing session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('AuthStore: Session error:', sessionError);
        throw sessionError;
      }

      console.log('AuthStore: Session data:', session);

      if (session?.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, full_name, phone_number, status, role, avatar_url, bio, last_login')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('AuthStore: User data error:', userError);
          throw userError;
        }

        console.log('AuthStore: User data:', userData);
        set({ user: userData as User });
      } else {
        console.log('AuthStore: No session found');
        set({ user: null });
      }
    } catch (error) {
      console.error('AuthStore: Error initializing session:', error);
      set({ user: null });
    } finally {
      console.log('AuthStore: Setting loading to false');
      set({ loading: false });
    }
  },

  signUp: async (email, password, full_name, phone_number) => {
    try {
      console.log('AuthStore: Attempting sign up...'); 
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
      
      if (error) {
        console.error('AuthStore: Sign up error:', error); 
        throw error;
      }
      
      if (!data.user) {
        console.error('AuthStore: No user data returned from sign up'); 
        throw new Error('Sign up failed');
      }

      // Check if user already exists in users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (checkError) {
        console.error('AuthStore: Error checking existing user:', checkError); 
        throw checkError;
      }

      if (!existingUser) {
        // Insert user data into users table
        const { error: createError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email,
            full_name,
            phone_number,
            status: 'pending',
            role: 'user',
          }]);
        
        if (createError) {
          console.error('AuthStore: Error creating user record:', createError); 
          throw createError;
        }
      }

      console.log('AuthStore: Sign up successful, setting verification email'); 
      set({ verificationEmail: email });
    } catch (error) {
      console.error('AuthStore: Sign up failed:', error); 
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        throw new Error(error.message || 'Sign up failed');
      } else {
        throw new Error('Sign up failed');
      }
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
        .update({ status: 'active' })
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
      console.log('AuthStore: Attempting sign in...'); 
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthStore: Sign in error:', error); 
        throw error;
      }

      if (!data.user) {
        console.error('AuthStore: No user data returned'); 
        throw new Error('No user data returned');
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        console.error('AuthStore: Email not confirmed'); 
        throw new Error('Email not confirmed');
      }

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, phone_number, status, role, avatar_url, bio, last_login')
        .eq('id', data.user.id)
        .limit(1)
        .maybeSingle();

      if (userError) {
        console.error('AuthStore: Error fetching user data:', userError); 
        throw userError;
      }

      if (!userData) {
        console.error('AuthStore: No user record found, creating one...'); 
        // Create user record if it doesn't exist
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || '',
            phone_number: data.user.user_metadata?.phone_number || '',
            status: 'active',
            role: 'user',
            last_login: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('AuthStore: Error creating user record:', createError); 
          throw createError;
        }

        console.log('AuthStore: User record created:', newUser); 
        set({ user: newUser });
        return;
      }

      // Update last login
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      if (updateError) {
        console.error('AuthStore: Error updating last login:', updateError); 
      }

      console.log('AuthStore: Sign in successful, setting user:', userData); 
      set({ user: userData });
    } catch (error) {
      console.error('AuthStore: Sign in failed:', error); 
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        throw new Error(error.message || 'Authentication failed');
      } else {
        throw new Error('Authentication failed');
      }
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  isAdmin: () => {
    const { user } = get();
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