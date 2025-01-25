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

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  tier_id?: string;
  signup_date?: string;
  last_active?: string;
  total_rewards: number;
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

export const referralService = {
  // Create a new referral
  async createReferral(referredEmail: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: user.user.id,
        referred_email: referredEmail,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's referral tree
  async getReferralTree() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_referral_tree', {
        user_id: user.user.id
      });

    if (error) throw error;
    return data;
  },

  // Get user's current tier
  async getCurrentTier() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: tierId, error: tierError } = await supabase
      .rpc('get_user_tier', {
        user_id: user.user.id
      });

    if (tierError) throw tierError;

    if (tierId) {
      const { data: tier, error: tierDataError } = await supabase
        .from('referral_tiers')
        .select('*')
        .eq('id', tierId)
        .single();

      if (tierDataError) throw tierDataError;
      return tier;
    }

    return null;
  },

  // Get all tiers
  async getAllTiers() {
    const { data, error } = await supabase
      .from('referral_tiers')
      .select('*')
      .order('min_referrals', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get user's rewards
  async getRewards() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('referrer_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get referral statistics
  async getReferralStats() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('status, total_rewards')
      .eq('referrer_id', user.user.id);

    if (referralsError) throw referralsError;

    const stats = {
      total: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      totalRewards: 0,
    };

    if (referrals) {
      referrals.forEach(referral => {
        stats.total++;
        stats[referral.status]++;
        stats.totalRewards += referral.total_rewards || 0;
      });
    }

    return stats;
  },

  // Share referral link
  async shareReferralLink(method: 'email' | 'copy' | 'share') {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const referralLink = `${window.location.origin}/join?ref=${user.user.id}`;

    switch (method) {
      case 'email':
        window.location.href = `mailto:?subject=Join%20The%20Brick%20Foundation&body=Join%20me%20on%20The%20Brick%20Foundation!%20Use%20my%20referral%20link:%20${encodeURIComponent(referralLink)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(referralLink);
        break;
      case 'share':
        if (navigator.share) {
          await navigator.share({
            title: 'Join The Brick Foundation',
            text: 'Join me on The Brick Foundation!',
            url: referralLink,
          });
        }
        break;
    }

    return referralLink;
  },
};
