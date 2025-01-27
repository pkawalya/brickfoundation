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
          ),
          referred_user_email:referred_email(
            email
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

  async createReferral(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const userId = await this.getCurrentUserId();
      
      // First create or get a referral link
      const { data: existingLink, error: linkError } = await supabase
        .from('referral_links')
        .select('code')
        .eq('referrer_id', userId)
        .eq('status', 'active')
        .limit(1)
        .single();

      let referralCode: string;
      
      if (linkError || !existingLink) {
        // Create new referral link
        const code = this.generateUniqueCode();
        const { error: createLinkError } = await supabase
          .from('referral_links')
          .insert({
            referrer_id: userId,
            code,
            status: 'active'
          });

        if (createLinkError) throw createLinkError;
        referralCode = code;
      } else {
        referralCode = existingLink.code;
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
          referral_code: referralCode,
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

  generateReferralLink(userId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${userId}`;
  }

  private generateUniqueCode(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

export const ReferralService = new ReferralServiceClass();
