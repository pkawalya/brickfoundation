import { supabase } from '../config/supabaseClient';
import crypto from 'crypto';

export const ReferralService = {
  // Generate referral link with UTM parameters
  generateReferralLink: (referralCode) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralCode}&utm_source=referral&utm_medium=user&utm_campaign=member_referral`;
  },

  // Share referral link on social media
  shareReferralLink: async (platform, referralLink) => {
    const shareData = {
      title: 'Join Brick Foundation',
      text: 'Join me on Brick Foundation and start your journey!',
      url: referralLink,
    };

    try {
      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareData.text
            )}&url=${encodeURIComponent(shareData.url)}`,
            '_blank'
          );
          break;
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareData.url
            )}`,
            '_blank'
          );
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareData.url
            )}`,
            '_blank'
          );
          break;
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(
              `${shareData.text} ${shareData.url}`
            )}`,
            '_blank'
          );
          break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(
            shareData.title
          )}&body=${encodeURIComponent(
            `${shareData.text}\n\n${shareData.url}`
          )}`;
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share(shareData);
          }
          break;
        default:
          throw new Error('Unsupported platform');
      }
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  },

  // Share referral link via different platforms
  shareReferralLinkVia: {
    // Copy link to clipboard
    async copyToClipboard(link) {
      try {
        await navigator.clipboard.writeText(link);
        return { success: true, message: 'Link copied to clipboard!' };
      } catch (error) {
        console.error('Failed to copy link:', error);
        return { success: false, message: 'Failed to copy link. Please try selecting and copying manually.' };
      }
    },

    // Share via WhatsApp
    whatsApp(link) {
      const text = `Join me on Brick Foundation! Use my referral link: ${link}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
      return { success: true, message: 'Opening WhatsApp...' };
    },

    // Share via Email
    email(link) {
      const subject = 'Join me on Brick Foundation';
      const body = `Hey! I thought you might be interested in joining Brick Foundation. Use my referral link: ${link}`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      return { success: true, message: 'Opening email client...' };
    },

    // Share via Twitter/X
    twitter(link) {
      const text = `Join me on Brick Foundation! Use my referral link: ${link}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank');
      return { success: true, message: 'Opening Twitter...' };
    },

    // Share via Facebook
    facebook(link) {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
      window.open(facebookUrl, '_blank');
      return { success: true, message: 'Opening Facebook...' };
    },

    // Share via Telegram
    telegram(link) {
      const text = `Join me on Brick Foundation! Use my referral link: ${link}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
      window.open(telegramUrl, '_blank');
      return { success: true, message: 'Opening Telegram...' };
    }
  },

  // Calculate rewards based on tier and action
  calculateReward: (tier, action) => {
    const baseRewards = {
      signup: 10,
      purchase: 25,
      milestone: 50,
    };

    return baseRewards[action] * (tier?.reward_multiplier || 1);
  },

  // Process new referral
  processReferral: async (referrerId, referredId, referralCode) => {
    try {
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_id: referredId,
          referral_code: referralCode,
          status: 'confirmed',
        })
        .select()
        .single();

      if (referralError) throw referralError;

      // Create signup reward
      const { data: referrerData } = await supabase
        .from('users')
        .select('referral_tier_id')
        .eq('id', referrerId)
        .single();

      const { data: tierData } = await supabase
        .from('referral_tiers')
        .select('*')
        .eq('id', referrerData.referral_tier_id)
        .single();

      const rewardAmount = ReferralService.calculateReward(tierData, 'signup');

      const { error: rewardError } = await supabase
        .from('referral_rewards')
        .insert({
          user_id: referrerId,
          referral_id: referral.id,
          amount: rewardAmount,
          type: 'signup',
          status: 'approved',
        });

      if (rewardError) throw rewardError;

      // Update user's stats
      const { error: updateError } = await supabase.rpc('update_referral_stats', {
        user_id: referrerId,
      });

      if (updateError) throw updateError;

      return { success: true, referral };
    } catch (error) {
      console.error('Error processing referral:', error);
      return { success: false, error };
    }
  },

  // Check and update user's tier
  checkAndUpdateTier: async (userId) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_referrals, referral_tier_id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: tiers, error: tiersError } = await supabase
        .from('referral_tiers')
        .select('*')
        .order('level', { ascending: true });

      if (tiersError) throw tiersError;

      const newTier = [...tiers]
        .reverse()
        .find((tier) => userData.total_referrals >= tier.min_referrals);

      if (newTier && newTier.id !== userData.referral_tier_id) {
        // Update user's tier
        const { error: updateError } = await supabase
          .from('users')
          .update({ referral_tier_id: newTier.id })
          .eq('id', userId);

        if (updateError) throw updateError;

        // Create milestone reward if upgrading
        if (newTier.level > 1) {
          const rewardAmount = ReferralService.calculateReward(
            newTier,
            'milestone'
          );

          const { error: rewardError } = await supabase
            .from('referral_rewards')
            .insert({
              user_id: userId,
              amount: rewardAmount,
              type: 'milestone',
              status: 'approved',
              metadata: { tier_name: newTier.name },
            });

          if (rewardError) throw rewardError;
        }

        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: 'New Tier Achievement!',
            message: `Congratulations! You've reached the ${newTier.name} tier.`,
            type: 'achievement',
          });

        if (notificationError) throw notificationError;

        return { success: true, newTier };
      }

      return { success: true, newTier: null };
    } catch (error) {
      console.error('Error updating tier:', error);
      return { success: false, error };
    }
  },

  // Get referral analytics
  getReferralAnalytics: async (userId) => {
    try {
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(
          `
          id,
          created_at,
          status,
          level,
          referred:referred_id(
            email,
            full_name,
            created_at
          )
        `
        )
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      const { data: rewards, error: rewardsError } = await supabase
        .from('referral_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (rewardsError) throw rewardsError;

      // Calculate statistics
      const stats = {
        totalReferrals: referrals.length,
        activeReferrals: referrals.filter(
          (ref) => ref.status === 'confirmed'
        ).length,
        totalEarnings: rewards.reduce((sum, reward) => sum + reward.amount, 0),
        conversionRate:
          referrals.length > 0
            ? (
                (referrals.filter((ref) => ref.status === 'confirmed').length /
                  referrals.length) *
                100
              ).toFixed(2)
            : 0,
      };

      // Group referrals by month for trend analysis
      const monthlyReferrals = referrals.reduce((acc, ref) => {
        const month = new Date(ref.created_at).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          referrals,
          rewards,
          stats,
          trends: {
            monthly: monthlyReferrals,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { success: false, error };
    }
  },

  // Get leaderboard
  getLeaderboard: async (period = 'all') => {
    try {
      let query = supabase
        .from('users')
        .select(
          `
          id,
          full_name,
          avatar_url,
          total_referrals,
          referral_earnings,
          referral_tier:referral_tier_id(name, benefits)
        `
        )
        .order('total_referrals', { ascending: false })
        .limit(10);

      if (period !== 'all') {
        const startDate = new Date();
        switch (period) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { success: false, error };
    }
  },

  // Get referral tree
  getReferralTree: async (userId, maxDepth = 3) => {
    try {
      const buildTree = async (currentId, currentDepth = 0) => {
        if (currentDepth >= maxDepth) return null;

        const { data: referrals, error } = await supabase
          .from('referrals')
          .select(
            `
            referred_id,
            referred:referred_id(
              id,
              full_name,
              avatar_url,
              total_referrals,
              created_at
            )
          `
          )
          .eq('referrer_id', currentId)
          .eq('status', 'confirmed');

        if (error) throw error;

        const children = await Promise.all(
          referrals.map(async (ref) => ({
            ...ref.referred,
            children: await buildTree(ref.referred_id, currentDepth + 1),
          }))
        );

        return children;
      };

      const tree = await buildTree(userId);
      return { success: true, data: tree };
    } catch (error) {
      console.error('Error fetching referral tree:', error);
      return { success: false, error };
    }
  },

  // Get referral stats for a user
  async getReferralStats(userId) {
    try {
      if (!userId) {
        console.error('No userId provided to getReferralStats');
        return {
          total: 0,
          active: 0,
          pending: 0,
          inactive: 0,
          totalRewards: 0,
          referrals: []
        };
      }

      console.log('Fetching referral stats for user:', userId);

      // First get all referrals for the user
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('id, status, total_rewards, metadata, referred_id')
        .eq('referrer_id', userId);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        throw referralsError;
      }

      if (!referrals) {
        return {
          total: 0,
          active: 0,
          pending: 0,
          inactive: 0,
          totalRewards: 0,
          referrals: []
        };
      }

      // For each referral with a referred_id, fetch the user details
      const referralsWithUsers = await Promise.all(
        referrals.map(async (referral) => {
          if (referral.referred_id) {
            try {
              const { data: userData, error: userError } = await supabase
                .from('auth.users')
                .select('id, email, created_at')
                .eq('id', referral.referred_id)
                .single();

              if (userError) {
                console.error('Error fetching user:', userError);
                return {
                  ...referral,
                  referredUser: null
                };
              }

              return {
                ...referral,
                referredUser: userData
              };
            } catch (error) {
              console.error('Error processing referral:', error);
              return {
                ...referral,
                referredUser: null
              };
            }
          }
          return {
            ...referral,
            referredUser: null
          };
        })
      );

      // Calculate stats
      const stats = {
        total: referrals.length,
        active: referrals.filter(r => r.status === 'active').length,
        pending: referrals.filter(r => r.status === 'pending').length,
        inactive: referrals.filter(r => r.status === 'inactive').length,
        totalRewards: referrals.reduce((sum, r) => sum + (parseFloat(r.total_rewards) || 0), 0),
        referrals: referralsWithUsers.map(r => ({
          id: r.id,
          status: r.status,
          rewards: parseFloat(r.total_rewards) || 0,
          referredUser: r.referredUser,
          metadata: r.metadata
        }))
      };

      console.log('Referral stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getReferralStats:', error);
      // Return empty stats instead of throwing
      return {
        total: 0,
        active: 0,
        pending: 0,
        inactive: 0,
        totalRewards: 0,
        referrals: []
      };
    }
  },

  // Get all active referrals for a user
  async getActiveReferrals(userId) {
    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referral_code,
          status,
          metadata,
          referred:referred_id (
            id,
            email,
            created_at
          )
        `)
        .eq('referrer_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      return referrals;
    } catch (error) {
      console.error('Error fetching active referrals:', error);
      throw error;
    }
  },

  // Get daily referral stats
  async getDailyStats(days = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('referrals')
        .select('created_at, status')
        .eq('referrer_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Create a map of dates
      const dailyMap = new Map();
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { total: 0, active: 0, pending: 0 });
      }

      // Fill in the actual data
      data.forEach(record => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        if (dailyMap.has(date)) {
          const stats = dailyMap.get(date);
          stats.total++;
          if (record.status === 'active') stats.active++;
          if (record.status === 'pending') stats.pending++;
        }
      });

      // Convert to array and sort by date
      return Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
          date,
          ...stats
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      return [];
    }
  },

  // Generate multiple referral codes
  async generateReferralCodes(userId, count = 3) {
    try {
      const codes = [];
      for (let i = 0; i < count; i++) {
        // Generate a unique code with timestamp and user ID for uniqueness
        const timestamp = Date.now().toString(36);
        const userFragment = userId.slice(-4);
        const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
        const code = `BF${timestamp}${userFragment}${randomPart}`;
        codes.push(code);
      }
      return codes;
    } catch (error) {
      console.error('Error generating referral codes:', error);
      throw error;
    }
  },

  // Generate a unique referral code
  generateReferralCode(userId) {
    // Generate a unique code with timestamp and user ID for uniqueness
    const timestamp = Date.now().toString(36);
    const userFragment = userId.slice(-4);
    const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `BF${timestamp}${userFragment}${randomPart}`;
  },

  // Generate authenticated referral link
  generateReferralLink(code) {
    // Use window.location.origin as fallback for baseUrl
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    // Create a timestamp for link expiry verification
    const ts = Date.now();
    
    // Get JWT secret from environment or use a default for development
    const jwtSecret = process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET || 'your-development-secret';
    
    // Create a signature for security
    const sig = crypto
      .createHmac('sha256', jwtSecret)
      .update(`${code}-${ts}`)
      .digest('hex')
      .slice(0, 8);

    // Return the full referral link
    return `${baseUrl}/register?ref=${code}&t=${ts}&s=${sig}`;
  },

  // Create a new referral link
  async createReferralLink(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Generate a unique referral code
      const referralCode = this.generateReferralCode(userId);

      // Create the referral record
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: userId,
          referral_code: referralCode,
          status: 'active',
          total_rewards: 0,
          metadata: {}
        })
        .select()
        .single();

      if (referralError) {
        console.error('Error creating referral:', referralError);
        throw referralError;
      }

      // Generate the full referral link
      const referralLink = this.generateReferralLink(referralCode);

      return {
        success: true,
        referral: {
          ...referral,
          link: referralLink
        }
      };
    } catch (error) {
      console.error('Error in createReferralLink:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Activate referral links after successful payment
  async activateReferralLinks(userId) {
    try {
      console.log('Activating referral links for user:', userId);
      
      // Generate 3 referral codes
      const referralCodes = await this.generateReferralCodes(userId);
      
      // Create referral entries with authenticated links
      const referrals = await Promise.all(referralCodes.map(async code => {
        const ts = Date.now();
        const sig = crypto
          .createHmac('sha256', process.env.NEXT_PUBLIC_SUPABASE_JWT_SECRET || '')
          .update(`${code}-${ts}`)
          .digest('hex')
          .slice(0, 8);

        const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/refer/${code}?t=${ts}&s=${sig}`;
        
        return {
          referrer_id: userId,
          referral_code: code,
          status: 'active',
          total_rewards: 0,
          metadata: {
            referral_link: referralLink,
            ts,
            sig,
            activated_at: new Date().toISOString()
          }
        };
      }));

      console.log('Creating referral entries:', referrals);

      const { data, error } = await supabase
        .from('referrals')
        .insert(referrals)
        .select();

      if (error) {
        console.error('Error creating referrals:', error);
        throw error;
      }

      // Create activity entries for the referrals
      const activities = data.map(referral => ({
        referral_id: referral.id,
        user_id: userId,
        activity_type: 'signup',
        description: 'Referral link activated after payment'
      }));

      const { error: activityError } = await supabase
        .from('referral_activities')
        .insert(activities);

      if (activityError) {
        console.error('Error creating activities:', activityError);
        throw activityError;
      }

      // Return referral links instead of just codes
      return {
        success: true,
        referralLinks: data.map(r => r.metadata.referral_link),
        message: 'Referral links activated successfully'
      };
    } catch (error) {
      console.error('Error activating referral links:', error);
      throw error;
    }
  },
};
