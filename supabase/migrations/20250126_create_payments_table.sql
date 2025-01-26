-- Drop existing table if exists
DROP TABLE IF EXISTS public.payments CASCADE;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    flw_tx_id TEXT NOT NULL,
    flw_tx_ref TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'UGX',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    provider TEXT NOT NULL DEFAULT 'flutterwave',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_flw_tx_id_idx ON public.payments(flw_tx_id);
CREATE INDEX IF NOT EXISTS payments_flw_tx_ref_idx ON public.payments(flw_tx_ref);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

-- Grant permissions
GRANT SELECT, INSERT ON public.payments TO authenticated;
