-- Create table for tracking password reset attempts
CREATE TABLE IF NOT EXISTS auth.password_reset_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cooldown_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_attempts_email 
ON auth.password_reset_attempts(email);

-- Create function to clean up old attempts
CREATE OR REPLACE FUNCTION auth.cleanup_password_reset_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete attempts older than 24 hours
    DELETE FROM auth.password_reset_attempts
    WHERE last_attempt_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION auth.check_password_reset_rate_limit(p_email TEXT)
RETURNS TABLE (
    allowed BOOLEAN,
    wait_time INTERVAL,
    remaining_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    max_attempts CONSTANT INTEGER := 5;
    time_window CONSTANT INTERVAL := INTERVAL '15 minutes';
    cooldown_period CONSTANT INTERVAL := INTERVAL '1 hour';
    v_attempt auth.password_reset_attempts%ROWTYPE;
BEGIN
    -- Get or create attempt record
    SELECT * INTO v_attempt
    FROM auth.password_reset_attempts
    WHERE email = p_email
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO auth.password_reset_attempts (email)
        VALUES (p_email)
        RETURNING * INTO v_attempt;

        RETURN QUERY
        SELECT 
            TRUE as allowed,
            INTERVAL '0' as wait_time,
            max_attempts - 1 as remaining_attempts;
        RETURN;
    END IF;

    -- Check if in cooldown
    IF v_attempt.cooldown_until IS NOT NULL AND v_attempt.cooldown_until > NOW() THEN
        RETURN QUERY
        SELECT 
            FALSE as allowed,
            v_attempt.cooldown_until - NOW() as wait_time,
            0 as remaining_attempts;
        RETURN;
    END IF;

    -- Reset if outside time window
    IF NOW() - v_attempt.first_attempt_at > time_window THEN
        UPDATE auth.password_reset_attempts
        SET 
            attempt_count = 1,
            first_attempt_at = NOW(),
            last_attempt_at = NOW(),
            cooldown_until = NULL
        WHERE id = v_attempt.id;

        RETURN QUERY
        SELECT 
            TRUE as allowed,
            INTERVAL '0' as wait_time,
            max_attempts - 1 as remaining_attempts;
        RETURN;
    END IF;

    -- Check attempts within time window
    IF v_attempt.attempt_count >= max_attempts THEN
        UPDATE auth.password_reset_attempts
        SET cooldown_until = NOW() + cooldown_period
        WHERE id = v_attempt.id;

        RETURN QUERY
        SELECT 
            FALSE as allowed,
            cooldown_period as wait_time,
            0 as remaining_attempts;
        RETURN;
    END IF;

    -- Increment attempt count
    UPDATE auth.password_reset_attempts
    SET 
        attempt_count = attempt_count + 1,
        last_attempt_at = NOW()
    WHERE id = v_attempt.id;

    RETURN QUERY
    SELECT 
        TRUE as allowed,
        INTERVAL '0' as wait_time,
        max_attempts - (v_attempt.attempt_count + 1) as remaining_attempts;
END;
$$;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION auth.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_auth_password_reset_attempts_updated_at
    BEFORE UPDATE ON auth.password_reset_attempts
    FOR EACH ROW
    EXECUTE FUNCTION auth.set_updated_at();

-- Create policy to allow authenticated users to attempt password reset
CREATE POLICY "Allow authenticated users to attempt password reset"
    ON auth.password_reset_attempts
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Schedule cleanup job (requires pg_cron extension)
SELECT cron.schedule(
    'cleanup-password-reset-attempts',
    '0 * * * *',  -- Run every hour
    $$SELECT auth.cleanup_password_reset_attempts()$$
);
