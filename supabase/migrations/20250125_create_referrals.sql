-- Drop existing policies if they exist
do $$ 
begin
    -- Drop policies only if their tables exist
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'referrals') then
        execute format('drop policy if exists "Users can view their referral tree" on public.referrals');
        execute format('drop policy if exists "Users can create referrals" on public.referrals');
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'referral_rewards') then
        execute format('drop policy if exists "Users can view their rewards" on public.referral_rewards');
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'referral_activities') then
        execute format('drop policy if exists "Users can view their referral activities" on public.referral_activities');
    end if;

    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'referral_tiers') then
        execute format('drop policy if exists "Anyone can view referral tiers" on public.referral_tiers');
    end if;
end $$;

-- Drop existing tables if they exist
drop table if exists public.referral_activities cascade;
drop table if exists public.referral_rewards cascade;
drop table if exists public.referrals cascade;
drop table if exists public.referral_tiers cascade;

-- Create referral tiers table
create table if not exists public.referral_tiers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    min_referrals int not null,
    reward_multiplier decimal(4,2) not null default 1.0,
    benefits jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default tiers
insert into public.referral_tiers (name, min_referrals, reward_multiplier, benefits) 
select * from (values
    ('Bronze', 0, 1.0, '{"perks": ["Basic rewards", "Email support"]}'::jsonb),
    ('Silver', 5, 1.25, '{"perks": ["10% bonus rewards", "Priority support", "Monthly newsletter"]}'::jsonb),
    ('Gold', 15, 1.5, '{"perks": ["25% bonus rewards", "VIP support", "Exclusive events", "Monthly rewards"]}'::jsonb),
    ('Platinum', 30, 2.0, '{"perks": ["50% bonus rewards", "Dedicated account manager", "All benefits", "Special recognition"]}'::jsonb)
) as v (name, min_referrals, reward_multiplier, benefits)
where not exists (
    select 1 from public.referral_tiers
);

-- Create referral rewards table
create table if not exists public.referral_rewards (
    id uuid default gen_random_uuid() primary key,
    referrer_id uuid references auth.users(id) on delete cascade not null,
    referred_id uuid references auth.users(id) on delete cascade not null,
    amount decimal(10,2) not null,
    status text check (status in ('pending', 'processed', 'paid')) default 'pending' not null,
    reward_type text check (status in ('signup', 'activity', 'tier_bonus')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    processed_at timestamp with time zone
);

-- Create referrals table with enhanced tracking
create table if not exists public.referrals (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    referrer_id uuid references auth.users(id) on delete cascade not null,
    referred_email text not null,
    status text check (status in ('pending', 'active', 'inactive')) default 'pending' not null,
    tier_id uuid references public.referral_tiers(id),
    signup_date timestamp with time zone,
    last_active timestamp with time zone,
    total_rewards decimal(10,2) default 0.0,
    metadata jsonb default '{}'::jsonb,
    level int generated always as (1) stored
);

-- Create referral activities table
create table if not exists public.referral_activities (
    id uuid default gen_random_uuid() primary key,
    referral_id uuid references public.referrals(id) on delete cascade not null,
    activity_type text not null,
    points int default 0,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.referrals enable row level security;
alter table public.referral_rewards enable row level security;
alter table public.referral_activities enable row level security;
alter table public.referral_tiers enable row level security;

-- Referrals policies
create policy "Users can view their referral tree"
    on public.referrals for select
    using (
        auth.uid() in (
            WITH RECURSIVE referral_tree AS (
                -- Base case: direct referrals
                SELECT r.id, r.referrer_id, r.referred_email, 1 as depth
                FROM referrals r
                WHERE r.referrer_id = auth.uid()
                
                UNION ALL
                
                -- Recursive case: referrals of referrals
                SELECT r.id, r.referrer_id, r.referred_email, rt.depth + 1
                FROM referrals r
                JOIN referral_tree rt ON r.referrer_id = rt.referred_email::uuid
                WHERE rt.depth < 5  -- Limit depth to prevent infinite recursion
            )
            SELECT DISTINCT referrer_id FROM referral_tree
        )
    );

create policy "Users can create referrals"
    on public.referrals for insert
    with check (auth.uid() = referrer_id);

-- Referral rewards policies
create policy "Users can view their rewards"
    on public.referral_rewards for select
    using (auth.uid() = referrer_id);

-- Referral activities policies
create policy "Users can view their referral activities"
    on public.referral_activities for select
    using (
        exists (
            select 1 from public.referrals
            where referrals.id = referral_activities.referral_id
            and referrals.referrer_id = auth.uid()
        )
    );

-- Referral tiers policies
create policy "Anyone can view referral tiers"
    on public.referral_tiers for select
    using (true);

-- Drop existing functions if they exist
drop function if exists get_user_tier(uuid);
drop function if exists update_user_rewards();
drop function if exists get_referral_tree(uuid);

-- Create indexes for faster lookups
create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);
create index if not exists referrals_referred_email_idx on public.referrals(referred_email);
create index if not exists referral_rewards_referrer_id_idx on public.referral_rewards(referrer_id);
create index if not exists referral_activities_referral_id_idx on public.referral_activities(referral_id);

-- Function to calculate user's current tier
create function get_user_tier(user_id uuid)
returns uuid
language plpgsql security definer
as $$
declare
    active_referrals int;
    tier_id uuid;
begin
    -- Count active referrals
    select count(*)
    into active_referrals
    from public.referrals
    where referrer_id = user_id
    and status = 'active';

    -- Get appropriate tier
    select id
    into tier_id
    from public.referral_tiers
    where min_referrals <= active_referrals
    order by min_referrals desc
    limit 1;

    return tier_id;
end;
$$;

-- Function to update user's rewards
create function update_user_rewards()
returns trigger
language plpgsql security definer
as $$
declare
    reward_amount decimal(10,2);
    tier_multiplier decimal(4,2);
begin
    -- Only process for active status changes
    if NEW.status = 'active' and OLD.status != 'active' then
        -- Get base reward amount (e.g., $50 for signup)
        reward_amount := 50.0;
        
        -- Get tier multiplier
        select reward_multiplier
        into tier_multiplier
        from public.referral_tiers
        where id = (select get_user_tier(NEW.referrer_id));
        
        -- Apply tier multiplier
        reward_amount := reward_amount * tier_multiplier;
        
        -- Create reward record
        insert into public.referral_rewards (
            referrer_id,
            referred_id,
            amount,
            status,
            reward_type
        ) values (
            NEW.referrer_id,
            NEW.referred_email::uuid,
            reward_amount,
            'pending',
            'signup'
        );
        
        -- Update total rewards in referral
        update public.referrals
        set total_rewards = total_rewards + reward_amount
        where id = NEW.id;
    end if;
    
    return NEW;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_referral_status_change on public.referrals;

-- Create trigger for reward updates
create trigger on_referral_status_change
    after update on public.referrals
    for each row
    when (OLD.status is distinct from NEW.status)
    execute function update_user_rewards();

-- Function to get referral tree with enhanced information
create function get_referral_tree(user_id uuid)
returns table (
    id uuid,
    referrer_id uuid,
    referred_email text,
    status text,
    created_at timestamptz,
    tier_id uuid,
    total_rewards decimal(10,2),
    last_active timestamptz,
    depth int,
    path uuid[]
)
language plpgsql security definer
as $$
begin
    return query
    with recursive referral_tree as (
        -- Base case: direct referrals
        select 
            r.id,
            r.referrer_id,
            r.referred_email,
            r.status,
            r.created_at,
            r.tier_id,
            r.total_rewards,
            r.last_active,
            1 as depth,
            array[r.id] as path
        from referrals r
        where r.referrer_id = user_id

        union all

        -- Recursive case: indirect referrals
        select
            r.id,
            r.referrer_id,
            r.referred_email,
            r.status,
            r.created_at,
            r.tier_id,
            r.total_rewards,
            r.last_active,
            rt.depth + 1,
            rt.path || r.id
        from referrals r
        join referral_tree rt on r.referrer_id = rt.referred_email::uuid
        where rt.depth < 5  -- Limit depth to prevent infinite recursion
        and not r.id = any(rt.path)  -- Prevent cycles
    )
    select * from referral_tree
    order by path;
end;
$$;
