
-- Enums
create type public.app_role as enum ('admin', 'csm');
create type public.channel as enum ('in-app nudge', 'email', 'Slack message');
create type public.signal_weight as enum ('high', 'med', 'low');
create type public.trend as enum ('up', 'down', 'flat');
create type public.log_status as enum ('Awaiting response', 'Responded', 'Re-engaged');

-- Profiles (mirrors auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Roles (separate table to avoid privilege escalation)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Accounts
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  team text not null,
  plan text not null,
  seats integer not null default 0,
  owner_name text not null,
  owner_role text not null,
  owner_avatar text,
  days_since_signup integer not null default 0,
  risk_score integer not null check (risk_score between 0 and 100),
  trend public.trend not null default 'flat',
  top_reason text not null,
  quote_text text,
  quote_source text,
  quote_channel text,
  mrr numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Signals (1-many to accounts)
create table public.signals (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  label text not null,
  detail text not null,
  weight public.signal_weight not null,
  position integer not null default 0
);
create index on public.signals(account_id);

-- Actions (recommended + alternates, flagged via is_recommended)
create table public.actions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  title text not null,
  preview text not null,
  channel public.channel not null,
  expected_lift text not null,
  is_recommended boolean not null default false,
  position integer not null default 0
);
create index on public.actions(account_id);

-- Intervention logs
create table public.intervention_logs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  action_id uuid not null references public.actions(id) on delete restrict,
  channel public.channel not null,
  status public.log_status not null default 'Awaiting response',
  sent_by uuid not null references auth.users(id) on delete restrict,
  sent_at timestamptz not null default now()
);
create index on public.intervention_logs(account_id);
create index on public.intervention_logs(sent_by);

-- Snoozes (one active snooze per account; uniqueness enforced)
create table public.snoozes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts(id) on delete cascade,
  snoozed_at timestamptz not null default now(),
  duration_ms bigint not null,
  snoozed_by uuid not null references auth.users(id) on delete restrict
);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger accounts_set_updated_at before update on public.accounts
  for each row execute function public.tg_set_updated_at();

-- Auto-create profile + default csm role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'csm');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.accounts enable row level security;
alter table public.signals enable row level security;
alter table public.actions enable row level security;
alter table public.intervention_logs enable row level security;
alter table public.snoozes enable row level security;

-- Profiles: users can read all (internal tool), edit own
create policy "Profiles readable by authenticated" on public.profiles
  for select to authenticated using (true);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Roles: users can read their own; only admins manage
create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Accounts/Signals/Actions: any authenticated CSM can read; admins manage
create policy "Authenticated read accounts" on public.accounts for select to authenticated using (true);
create policy "Admins manage accounts" on public.accounts for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Authenticated read signals" on public.signals for select to authenticated using (true);
create policy "Admins manage signals" on public.signals for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Authenticated read actions" on public.actions for select to authenticated using (true);
create policy "Admins manage actions" on public.actions for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Intervention logs: any authenticated user can read; insert as self; only sender or admin updates
create policy "Authenticated read logs" on public.intervention_logs for select to authenticated using (true);
create policy "Insert own logs" on public.intervention_logs for insert to authenticated
  with check (auth.uid() = sent_by);
create policy "Sender or admin update logs" on public.intervention_logs for update to authenticated
  using (auth.uid() = sent_by or public.has_role(auth.uid(), 'admin'));

-- Snoozes: any authenticated read; insert/delete as self or admin
create policy "Authenticated read snoozes" on public.snoozes for select to authenticated using (true);
create policy "Insert own snoozes" on public.snoozes for insert to authenticated
  with check (auth.uid() = snoozed_by);
create policy "Owner or admin delete snoozes" on public.snoozes for delete to authenticated
  using (auth.uid() = snoozed_by or public.has_role(auth.uid(), 'admin'));
