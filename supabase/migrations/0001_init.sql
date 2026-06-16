-- Enable extensions (these are usually pre-enabled in Supabase)
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Users profile table (mirrors Supabase auth.users via trigger or manual upsert)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null,
  email text unique,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Leads table
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  owner_name text not null,
  phone text not null,
  email text not null,
  state text not null,
  zip_code text not null,
  industry text not null,
  time_in_business text not null,
  monthly_revenue numeric not null,
  loan_purpose text not null,
  loan_amount_requested numeric not null,
  lead_source text not null,
  date_acquired date not null,
  date_added timestamptz not null default now(),
  tags text[] default array[]::text[],
  is_sold boolean not null default false
);

-- Age tag computed view
create or replace view public.leads_with_age as
select 
  l.*,
  case 
    when (now()::date - l.date_acquired) <= 1 then '0-24h'
    when (now()::date - l.date_acquired) between 2 and 3 then '2-3d'
    when (now()::date - l.date_acquired) between 4 and 7 then '4-7d'
    when (now()::date - l.date_acquired) between 8 and 14 then '8-14d'
    else '15+d'
  end as lead_age_tag
from public.leads l;

-- Orders and purchases
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending', -- pending, paid, canceled
  subtotal_cents integer not null default 0,
  discount_rate numeric not null default 0,
  discount_cents integer not null default 0,
  total_cents integer not null default 0,
  provider text, -- stripe|paypal|wallet
  provider_ref text, -- session id / payment id
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete restrict,
  unit_price_cents integer not null,
  age_tag text not null,
  created_at timestamptz not null default now(),
  unique(order_id, lead_id)
);

-- Wallets and transactions
create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_cents integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null, -- positive for top-up, negative for spend
  type text not null, -- topup|purchase|refund|adjustment
  reference_id text,
  created_at timestamptz not null default now()
);

-- Saved filters
create table if not exists public.saved_filters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  filters jsonb not null,
  created_at timestamptz not null default now()
);

-- Carts (optional server-side); clients may also cart locally
create table if not exists public.carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete restrict,
  added_at timestamptz not null default now(),
  unique(cart_id, lead_id)
);

-- Indexes for performance
create index if not exists idx_leads_state on public.leads(state);
create index if not exists idx_leads_industry on public.leads(industry);
create index if not exists idx_leads_loan_purpose on public.leads(loan_purpose);
create index if not exists idx_leads_date_acquired on public.leads(date_acquired);

-- RLS policies (enable RLS)
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.saved_filters enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

-- Profiles: users can read/update own profile
create policy if not exists profiles_select_self on public.profiles for select using (auth.uid() = auth_user_id);
create policy if not exists profiles_update_self on public.profiles for update using (auth.uid() = auth_user_id);

-- Leads: anyone can select unsold leads (masked on app side); only admin can insert/update/delete
create policy if not exists leads_select_all on public.leads for select using (true);
create policy if not exists leads_admin_modify on public.leads for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);

-- Orders: users can see their own orders
create policy if not exists orders_own on public.orders for select using (
  exists(select 1 from public.profiles p where p.id = user_id and p.auth_user_id = auth.uid())
);

-- Order items: via order ownership
create policy if not exists order_items_own on public.order_items for select using (
  exists(
    select 1 from public.orders o join public.profiles p on p.id = o.user_id
    where order_id = o.id and p.auth_user_id = auth.uid()
  )
);

-- Wallets
create policy if not exists wallets_own on public.wallets for select using (
  exists(select 1 from public.profiles p where p.id = user_id and p.auth_user_id = auth.uid())
);
create policy if not exists wallet_tx_own on public.wallet_transactions for select using (
  exists(select 1 from public.profiles p where p.id = user_id and p.auth_user_id = auth.uid())
);

-- Saved filters
create policy if not exists saved_filters_own on public.saved_filters for all using (
  exists(select 1 from public.profiles p where p.id = user_id and p.auth_user_id = auth.uid())
);

-- Carts
create policy if not exists carts_own on public.carts for all using (
  exists(select 1 from public.profiles p where p.id = user_id and p.auth_user_id = auth.uid())
);
create policy if not exists cart_items_own on public.cart_items for all using (
  exists(
    select 1 from public.carts c join public.profiles p on p.id = c.user_id
    where c.id = cart_id and p.auth_user_id = auth.uid()
  )
);

-- --------------------------------------------------------------------
-- 🆕  Automated provisioning & wallet–credit utilities
-- --------------------------------------------------------------------

-- Auto-provision profile + wallet whenever a new auth.users row appears
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- create missing profile
  insert into public.profiles (auth_user_id, email)
  values (new.id, new.email)
  on conflict (auth_user_id) do nothing;

  -- create missing wallet for that profile
  insert into public.wallets (user_id, balance_cents)
  select p.id, 0 from public.profiles p where p.auth_user_id = new.id
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Ensure trigger exists on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Idempotent wallet credit index
create unique index if not exists wallet_tx_unique_reference
  on public.wallet_transactions(user_id, reference_id)
  where reference_id is not null;

-- Atomic wallet credit helper
create or replace function public.credit_wallet_by_profile(
  p_profile_id uuid,
  p_amount_cents integer,
  p_reference text
) returns void
language plpgsql
security definer
as $$
begin
  -- ensure wallet row
  insert into public.wallets(user_id, balance_cents)
  values (p_profile_id, 0)
  on conflict (user_id) do nothing;

  -- attempt insert transaction (no-op if reference already exists)
  insert into public.wallet_transactions(user_id, amount_cents, type, reference_id)
  values (p_profile_id, p_amount_cents, 'topup', p_reference)
  on conflict on constraint wallet_tx_unique_reference do nothing;

  -- only adjust balance if new tx inserted
  if found then
    update public.wallets
    set balance_cents = balance_cents + p_amount_cents,
        updated_at   = now()
    where user_id = p_profile_id;
  end if;
end;
$$;

