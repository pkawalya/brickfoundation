import { supabase } from './supabaseClient';

export interface ReferralTier {
  id: string;
  name: string;
  min_referrals: number;
  reward_multiplier: number;
  benefits: {
    perks: string[];
  };
}

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referred_id: string;
  amount: number;
  status: 'pending' | 'processed' | 'paid';
  reward_type: 'signup' | 'activity' | 'tier_bonus';
  created_at: string;
  processed_at?: string;
}

export interface ReferralStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  totalRewards: number;
}

export interface ReferralLink {
  id: string;
  referrer_id: string;
  code: string;
  status: 'active' | 'inactive';
  created_at: string;
  expires_at: string | null;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referred_email: string;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
  completed_at: string | null;
}

class ReferralServiceClass {
  private async getSession() {
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.session?.user) throw new Error('No authenticated user');
      return session.session.user;
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to authenticate user. Please try logging in again.');
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  async getReferralLinks(): Promise<ReferralLink[]> {
    return this.retryOperation(async () => {
      const user = await this.getSession();

      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral links:', error);
        throw new Error('Failed to load referral links. Please try again.');
      }

      return data || [];
    });
  }

  async createReferralLinks(count: number = 3): Promise<ReferralLink[]> {
    return this.retryOperation(async () => {
      const user = await this.getSession();

      // First deactivate any existing active links
      const { error: deactivateError } = await supabase
        .from('referral_links')
        .update({ 
          status: 'inactive',
          metadata: {
            deactivated_at: new Date().toISOString()
          }
        })
        .eq('referrer_id', user.id)
        .eq('status', 'active');

      if (deactivateError) {
        console.error('Error deactivating existing links:', deactivateError);
        throw new Error('Failed to deactivate existing links. Please try again.');
      }

      // Create new referral links
      const newLinks = Array(count).fill(null).map(() => ({
        referrer_id: user.id,
        code: this.generateReferralCode(),
        status: 'active' as const,
        metadata: {
          created_at: new Date().toISOString()
        }
      }));

      const { data, error } = await supabase
        .from('referral_links')
        .insert(newLinks)
        .select();

      if (error) {
        console.error('Error creating referral links:', error);
        throw new Error('Failed to create new referral links. Please try again.');
      }

      return data || [];
    });
  }

  async getReferrals(): Promise<Referral[]> {
    return this.retryOperation(async () => {
      const user = await this.getSession();

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        throw new Error('Failed to load referrals. Please try again.');
      }

      return data || [];
    });
  }

  private generateReferralCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `BF-${timestamp}${random}`.toUpperCase();
  }
}

export const ReferralService = new ReferralServiceClass();
