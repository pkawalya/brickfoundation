-- Create users table with email verification
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  phone text unique not null,
  full_name text not null,
  status text not null default 'pending',
  verification_code text,
  verification_code_expires_at timestamp with time zone,
  is_admin boolean default false,
  earnings_total numeric default 0,
  activation_payment_status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up RLS (Row Level Security)
alter table public.users enable row level security;

-- Create policies
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on public.users
  for update using (auth.uid() = id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, phone, full_name, status)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'full_name',
    'pending'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to generate verification code
create or replace function generate_verification_code(user_id uuid)
returns text as $$
declare
  code text;
begin
  -- Generate a 6-digit code
  code := floor(random() * 900000 + 100000)::text;
  
  -- Update the user's verification code and expiry
  update public.users
  set 
    verification_code = code,
    verification_code_expires_at = now() + interval '15 minutes'
  where id = user_id;
  
  return code;
end;
$$ language plpgsql security definer;
