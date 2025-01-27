import { supabase } from '../config/supabaseClient';

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

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id?: string;
  referred_email: string;
  referral_code: string;
  status: 'pending' | 'active' | 'inactive';
  total_rewards: number;
  created_at: string;
  updated_at: string;
  referred_user?: {
    email: string;
    full_name: string;
  };
}

export interface ReferralLink {
  id: string;
  referrer_id: string;
  code: string;
  status: 'active' | 'inactive';
  created_at: string;
  expires_at: string | null;
}

class ReferralServiceClass {
  private async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  async getReferralStats(): Promise<ReferralStats> {
    try {
      const userId = await this.getCurrentUserId();
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('status, total_rewards')
        .eq('referrer_id', userId);

      if (error) throw error;

      const stats = {
        total: referrals.length,
        active: referrals.filter(r => r.status === 'active').length,
        pending: referrals.filter(r => r.status === 'pending').length,
        inactive: referrals.filter(r => r.status === 'inactive').length,
        totalRewards: referrals.reduce((sum, r) => sum + (r.total_rewards || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  async getReferralTree(): Promise<Referral[]> {
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:referred_id(
            email,
            raw_user_meta_data->>'full_name' as full_name
          )
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting referral tree:', error);
      throw error;
    }
  }

  async getReferralLinks(): Promise<ReferralLink[]> {
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting referral links:', error);
      throw error;
    }
  }

  async activateReferralLinks(userId: string): Promise<void> {
    try {
      // First, deactivate any existing active links
      const { error: deactivateError } = await supabase
        .from('referral_links')
        .update({ status: 'inactive' })
        .eq('referrer_id', userId)
        .eq('status', 'active');

      if (deactivateError) throw deactivateError;

      // Create 3 new active referral links
      const newLinks = Array(3).fill(null).map(() => ({
        referrer_id: userId,
        code: this.generateUniqueCode(),
        status: 'active',
        metadata: {
          activation_date: new Date().toISOString(),
          payment_amount: 90000,
          currency: 'UGX'
        }
      }));

      const { error: createError } = await supabase
        .from('referral_links')
        .insert(newLinks);

      if (createError) throw createError;
    } catch (error) {
      console.error('Error activating referral links:', error);
      throw error;
    }
  }

  async createReferral(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Get an active referral link
      const { data: activeLink, error: linkError } = await supabase
        .from('referral_links')
        .select('code')
        .eq('referrer_id', userId)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (linkError || !activeLink) {
        return {
          success: false,
          message: 'No active referral links available. Please make a payment to activate referral links.'
        };
      }

      // Check if email is already referred
      const { data: existingReferral, error: checkError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_email', email)
        .limit(1)
        .single();

      if (existingReferral) {
        return {
          success: false,
          message: 'This email has already been referred'
        };
      }

      // Create the referral
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: userId,
          referred_email: email,
          referral_code: activeLink.code,
          status: 'pending'
        });

      if (referralError) throw referralError;

      return {
        success: true,
        message: 'Referral created successfully'
      };
    } catch (error) {
      console.error('Error creating referral:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create referral'
      };
    }
  }

  generateReferralLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${code}`;
  }

  private generateUniqueCode(): string {
    const prefix = 'BF';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  static async getReferralLinksStatic(userId: string): Promise<ReferralLink[]> {
    try {
      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .eq('referrer_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral links:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReferralLinks:', error);
      throw error;
    }
  }

  static async createReferralLinkStatic(userId: string): Promise<ReferralLink> {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('referral_links')
        .insert([
          {
            referrer_id: userId,
            code,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating referral link:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createReferralLink:', error);
      throw error;
    }
  }

  static async deactivateReferralLinksStatic(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('referral_links')
        .update({ status: 'inactive' })
        .eq('referrer_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error deactivating referral links:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deactivateReferralLinks:', error);
      throw error;
    }
  }
}

export const ReferralService = new ReferralServiceClass();
