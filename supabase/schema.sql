create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  business_name text,
  subscription_tier text default 'free',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  type text not null default 'digital',
  price_cents integer not null default 0,
  currency text not null default 'eur',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  email text,
  full_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null default 0,
  currency text not null default 'eur',
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  product_slug text not null,
  file_name text not null,
  download_count integer not null default 0,
  last_downloaded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  asset text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id text primary key,
  contact_email text not null,
  support_email text not null,
  instagram_handle text not null,
  business_availability text not null,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_settings (
  id,
  contact_email,
  support_email,
  instagram_handle,
  business_availability
)
values (
  'default',
  'hello@bizkitai.it',
  'hello@bizkitai.it',
  '@bizkitai',
  'lun-ven, 9:00 - 18:00'
)
on conflict (id) do nothing;

create table if not exists public.generated_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text,
  input_prompt text,
  output_text text not null,
  is_saved boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_usage_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  plan_id text not null default 'free',
  generation_count integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  last_generation_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, usage_date)
);

create table if not exists public.ai_request_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ip_hash text not null,
  generation_type text not null,
  prompt_preview text,
  plan_id text not null default 'free',
  status text not null default 'success',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  error_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text,
  business_type text,
  city text,
  address text,
  website text,
  instagram text,
  tone_of_voice text,
  target_audience text,
  services text,
  unique_selling_points text,
  preferred_cta text,
  preferred_hashtags text,
  salon_specialties text,
  booking_link text,
  opening_hours text,
  stylist_names text,
  products_used text,
  salon_style text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.business_profiles add column if not exists salon_specialties text;
alter table public.business_profiles add column if not exists booking_link text;
alter table public.business_profiles add column if not exists opening_hours text;
alter table public.business_profiles add column if not exists stylist_names text;
alter table public.business_profiles add column if not exists products_used text;
alter table public.business_profiles add column if not exists salon_style text;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  membership_plan text,
  status text not null default 'lead',
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid references public.generated_contents(id) on delete set null,
  type text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_id text not null,
  status text not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, business_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'business_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.downloads enable row level security;
alter table public.leads enable row level security;
alter table public.site_settings enable row level security;
alter table public.generated_contents enable row level security;
alter table public.ai_usage_daily enable row level security;
alter table public.ai_request_logs enable row level security;
alter table public.business_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.saved_contents enable row level security;
alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Products are public read" on public.products;
create policy "Products are public read"
on public.products for select
using (true);

drop policy if exists "Orders owned by user" on public.orders;
create policy "Orders owned by user"
on public.orders for select
using (auth.uid() = user_id);

drop policy if exists "Downloads owned by user" on public.downloads;
create policy "Downloads owned by user"
on public.downloads for select
using (auth.uid() = user_id);

drop policy if exists "Leads insert open" on public.leads;
create policy "Leads insert open"
on public.leads for insert
with check (true);

drop policy if exists "Site settings deny public read" on public.site_settings;
create policy "Site settings deny public read"
on public.site_settings for select
using (false);

drop policy if exists "Generated contents owned by user" on public.generated_contents;
create policy "Generated contents owned by user"
on public.generated_contents for select
using (auth.uid() = user_id);

drop policy if exists "Generated contents insert owned by user" on public.generated_contents;
create policy "Generated contents insert owned by user"
on public.generated_contents for insert
with check (auth.uid() = user_id);

drop policy if exists "Generated contents update owned by user" on public.generated_contents;
create policy "Generated contents update owned by user"
on public.generated_contents for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "AI usage daily owned by user" on public.ai_usage_daily;
create policy "AI usage daily owned by user"
on public.ai_usage_daily for select
using (auth.uid() = user_id);

drop policy if exists "AI usage daily insert owned by user" on public.ai_usage_daily;
create policy "AI usage daily insert owned by user"
on public.ai_usage_daily for insert
with check (auth.uid() = user_id);

drop policy if exists "AI usage daily update owned by user" on public.ai_usage_daily;
create policy "AI usage daily update owned by user"
on public.ai_usage_daily for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "AI request logs owned by user" on public.ai_request_logs;
create policy "AI request logs owned by user"
on public.ai_request_logs for select
using (auth.uid() = user_id);

drop policy if exists "AI request logs insert owned by user" on public.ai_request_logs;
create policy "AI request logs insert owned by user"
on public.ai_request_logs for insert
with check (auth.uid() = user_id);

drop policy if exists "Business profiles owned by user" on public.business_profiles;
create policy "Business profiles owned by user"
on public.business_profiles for select
using (auth.uid() = user_id);

drop policy if exists "Business profiles insert owned by user" on public.business_profiles;
create policy "Business profiles insert owned by user"
on public.business_profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Business profiles update owned by user" on public.business_profiles;
create policy "Business profiles update owned by user"
on public.business_profiles for update
using (auth.uid() = user_id);

drop policy if exists "Clients owned by user" on public.clients;
create policy "Clients owned by user"
on public.clients for select
using (auth.uid() = user_id);

drop policy if exists "Clients insert owned by user" on public.clients;
create policy "Clients insert owned by user"
on public.clients for insert
with check (auth.uid() = user_id);

drop policy if exists "Clients update owned by user" on public.clients;
create policy "Clients update owned by user"
on public.clients for update
using (auth.uid() = user_id);

drop policy if exists "Saved contents owned by user" on public.saved_contents;
create policy "Saved contents owned by user"
on public.saved_contents for select
using (auth.uid() = user_id);

drop policy if exists "Saved contents insert owned by user" on public.saved_contents;
create policy "Saved contents insert owned by user"
on public.saved_contents for insert
with check (auth.uid() = user_id);

drop policy if exists "Customers owned by user" on public.customers;
create policy "Customers owned by user"
on public.customers for select
using (auth.uid() = user_id);

drop policy if exists "Subscriptions owned by user" on public.subscriptions;
create policy "Subscriptions owned by user"
on public.subscriptions for select
using (auth.uid() = user_id);
