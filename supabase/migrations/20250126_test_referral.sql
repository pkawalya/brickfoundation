-- Insert test data for referrals system
DO $$
DECLARE
    test_referrer_id UUID;
    test_referred_id UUID;
    test_referral_id UUID;
BEGIN
    -- Get a test referrer (first active user we find)
    SELECT id INTO test_referrer_id
    FROM auth.users
    WHERE status = 'active'
    LIMIT 1;

    -- Get a test referred user (second active user we find)
    SELECT id INTO test_referred_id
    FROM auth.users
    WHERE status = 'active'
    AND id != test_referrer_id
    LIMIT 1;

    IF test_referrer_id IS NOT NULL AND test_referred_id IS NOT NULL THEN
        -- Insert test referral
        INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, total_rewards)
        VALUES (test_referrer_id, test_referred_id, 'TEST123', 'active', 0)
        RETURNING id INTO test_referral_id;

        -- Insert test rewards
        INSERT INTO public.rewards (user_id, referral_id, amount, action, status)
        VALUES 
            (test_referrer_id, test_referral_id, 50.00, 'signup', 'approved'),
            (test_referrer_id, test_referral_id, 25.00, 'purchase', 'approved'),
            (test_referrer_id, test_referral_id, 100.00, 'milestone', 'pending');

        RAISE NOTICE 'Test data inserted successfully';
    ELSE
        RAISE NOTICE 'Could not find test users. Please ensure there are at least two active users in the system.';
    END IF;
END $$;
