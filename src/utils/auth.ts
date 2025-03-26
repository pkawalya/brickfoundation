import { supabase } from '../config/supabaseClient';

export async function checkPaymentStatus(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('payment_status')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking payment status:', error);
      return false;
    }

    return userData?.payment_status === 'completed';
  } catch (error) {
    console.error('Error checking payment status:', error);
    return false;
  }
}
