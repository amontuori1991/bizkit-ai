create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  business_name text,
  subscription_tier text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  membership_plan text,
  status text not null default 'lead',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text,
  input_prompt text,
  output_text text not null,
  is_saved boolean not null default false,
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
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
  created_at timestamptz not null default now()
);

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  is_primary boolean not null default false,
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
  sports_subcategory text,
  salon_specialties text,
  booking_link text,
  opening_hours text,
  stylist_names text,
  products_used text,
  salon_style text,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'business_profiles_user_id_key'
      and conrelid = 'public.business_profiles'::regclass
  ) then
    alter table public.business_profiles drop constraint business_profiles_user_id_key;
  end if;
end $$;

alter table public.business_profiles add column if not exists is_primary boolean not null default false;
alter table public.business_profiles add column if not exists sports_subcategory text;
alter table public.business_profiles add column if not exists salon_specialties text;
alter table public.business_profiles add column if not exists booking_link text;
alter table public.business_profiles add column if not exists opening_hours text;
alter table public.business_profiles add column if not exists stylist_names text;
alter table public.business_profiles add column if not exists products_used text;
alter table public.business_profiles add column if not exists salon_style text;

create unique index if not exists business_profiles_one_primary_per_user_idx
  on public.business_profiles(user_id)
  where is_primary = true;

with primary_profiles as (
  select distinct on (user_id) id
  from public.business_profiles
  order by user_id, is_primary desc, created_at desc
)
update public.business_profiles
set is_primary = true
where id in (select id from primary_profiles);

create table if not exists public.site_settings (
  id text primary key,
  contact_email text not null,
  support_email text not null,
  instagram_handle text not null,
  business_availability text not null,
  updated_at timestamptz not null default now()
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

create table if not exists public.saved_contents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid references public.generated_contents(id) on delete set null,
  type text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.content_calendars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_type text,
  title text not null,
  period_days integer not null,
  calendar_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nuova conversazione',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  plan_id text not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.subscriptions add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.subscriptions add column if not exists stripe_customer_id text;
alter table public.subscriptions add column if not exists stripe_price_id text;
alter table public.subscriptions add column if not exists current_period_start timestamptz;
alter table public.subscriptions add column if not exists cancel_at_period_end boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.generated_contents enable row level security;
alter table public.ai_usage_daily enable row level security;
alter table public.ai_request_logs enable row level security;
alter table public.business_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.saved_contents enable row level security;
alter table public.content_calendars enable row level security;
alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "clients all own" on public.clients;
create policy "clients all own" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "generated contents all own" on public.generated_contents;
create policy "generated contents all own" on public.generated_contents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ai usage daily all own" on public.ai_usage_daily;
create policy "ai usage daily all own" on public.ai_usage_daily
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ai request logs all own" on public.ai_request_logs;
create policy "ai request logs all own" on public.ai_request_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "business profiles all own" on public.business_profiles;
create policy "business profiles all own" on public.business_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "site settings deny public read" on public.site_settings;
create policy "site settings deny public read" on public.site_settings
  for select using (false);

drop policy if exists "saved contents all own" on public.saved_contents;
create policy "saved contents all own" on public.saved_contents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "content calendars all own" on public.content_calendars;
create policy "content calendars all own" on public.content_calendars
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "assistant conversations all own" on public.assistant_conversations;
create policy "assistant conversations all own" on public.assistant_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "assistant messages all own" on public.assistant_messages;
create policy "assistant messages all own" on public.assistant_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subscriptions select own" on public.subscriptions;
create policy "subscriptions select own" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "subscriptions insert own" on public.subscriptions;
create policy "subscriptions insert own" on public.subscriptions
  for insert with check (auth.uid() = user_id);
