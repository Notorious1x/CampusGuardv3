-- CampusGuard Schema

-- Profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  student_id text,
  phone text,
  role text default 'student' check (role in ('student', 'security', 'guardian')),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, student_id, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'student_id', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.security_ids (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  used boolean default false,
  used_by uuid references public.profiles(id),
  used_by_name text,
  claimed_at timestamptz,
  created_at timestamptz default now()
);

create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  user_name text,
  user_phone text,
  alert_type text not null,
  severity text default 'high',
  message text,
  latitude double precision,
  longitude double precision,
  status text default 'pending',
  responder_id uuid references public.profiles(id),
  responder_name text,
  archived boolean default false,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.safe_walks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  user_name text,
  destination text not null,
  latitude double precision,
  longitude double precision,
  status text default 'active',
  shared_with text[] default '{}',
  checkin_deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.incidents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  user_name text,
  title text not null,
  description text,
  location_description text,
  latitude double precision,
  longitude double precision,
  image_url text,
  status text default 'pending',
  severity text default 'medium',
  created_at timestamptz default now()
);

create table public.guardians (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) not null,
  guardian_user_id uuid references public.profiles(id),
  name text not null,
  phone text,
  email text,
  relationship text,
  created_at timestamptz default now()
);

create table public.broadcasts (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) not null,
  created_by_name text,
  title text not null,
  message text not null,
  severity text default 'medium',
  created_at timestamptz default now()
);

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null,
  message text,
  type text default 'info',
  read boolean default false,
  created_at timestamptz default now()
);

create table public.settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) unique not null,
  notifications_sos boolean default true,
  notifications_incidents boolean default true,
  notifications_broadcasts boolean default true,
  location_sharing boolean default true,
  dark_mode boolean default false,
  mute_non_emergency boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.security_ids enable row level security;
alter table public.alerts enable row level security;
alter table public.safe_walks enable row level security;
alter table public.incidents enable row level security;
alter table public.guardians enable row level security;
alter table public.broadcasts enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;

create policy "profiles_all" on public.profiles for all using (true) with check (true);
create policy "security_ids_all" on public.security_ids for all using (true) with check (true);
create policy "alerts_all" on public.alerts for all using (true) with check (true);
create policy "safe_walks_all" on public.safe_walks for all using (true) with check (true);
create policy "incidents_all" on public.incidents for all using (true) with check (true);
create policy "guardians_all" on public.guardians for all using (true) with check (true);
create policy "broadcasts_all" on public.broadcasts for all using (true) with check (true);
create policy "notifications_all" on public.notifications for all using (true) with check (true);
create policy "settings_all" on public.settings for all using (true) with check (true);

insert into public.security_ids (code) values
  ('KNS100001'), ('KNS100002'), ('KNS100003'), ('KNS100004'), ('KNS100005'),
  ('KNS100006'), ('KNS100007'), ('KNS100008'), ('KNS100009'), ('KNS100010');

alter publication supabase_realtime add table public.safe_walks;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.notifications;
