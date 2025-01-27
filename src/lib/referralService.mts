import { supabase } from '../config/supabaseClient';

// Types
export type ReferralStatus = 'active' | 'inactive';

export interface ReferralLink {
  id: string;
  code: string;
  referrer_id: string;
  status: ReferralStatus;
  clicks: number;
  created_at: string;
}

export interface ReferralStats {
  total: number;
  active: number;
  inactive: number;
  clicks: number;
}

// Create a new referral link
export async function createReferralLink(userId: string): Promise<ReferralLink> {
  try {
    const code = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    
    const { data, error } = await supabase
      .from('referral_links')
      .insert({
        referrer_id: userId,
        code,
        status: 'active',
        clicks: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating referral link:', error);
    throw error;
  }
}

// Get all referral links for a user
export async function getReferralLinks(userId: string): Promise<ReferralLink[]> {
  try {
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

// Get referral stats for a user
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    const { data: links, error } = await supabase
      .from('referral_links')
      .select('*')
      .eq('referrer_id', userId);

    if (error) throw error;

    const stats: ReferralStats = {
      total: links?.length || 0,
      active: links?.filter(link => link.status === 'active').length || 0,
      inactive: links?.filter(link => link.status === 'inactive').length || 0,
      clicks: links?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0
    };

    return stats;
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
}

// Track a click on a referral link
export async function trackReferralClick(code: string): Promise<ReferralLink> {
  try {
    const { data, error } = await supabase
      .from('referral_links')
      .update({ clicks: supabase.sql`clicks + 1` })
      .eq('code', code)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error tracking referral click:', error);
    throw error;
  }
}

// Share a referral link
export async function shareReferralLink(code: string, method: 'copy' | 'email' | 'share'): Promise<{ success: boolean; message: string }> {
  const url = `${window.location.origin}/join?ref=${code}`;
  const title = 'Join The Brick Foundation';
  const text = "I'd like to invite you to join The Brick Foundation!";

  try {
    switch (method) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        return { success: true, message: 'Link copied to clipboard!' };
      
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        return { success: true, message: 'Email client opened!' };
      
      case 'share':
        if (!navigator.share) {
          throw new Error('Web Share API not supported');
        }
        await navigator.share({ url, title, text });
        return { success: true, message: 'Link shared successfully!' };
      
      default:
        throw new Error('Invalid share method');
    }
  } catch (error) {
    console.error('Error sharing referral link:', error);
    throw error;
  }
}
