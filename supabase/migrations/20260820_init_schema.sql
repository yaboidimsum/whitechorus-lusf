-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. PROFILES TABLE
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  avatar_url text,
  is_anonymous boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint username_length_check check (char_length(username) >= 2 and char_length(username) <= 30),
  constraint username_format_check check (username ~ '^[a-zA-Z0-9_]+$')
);

create unique index if not exists idx_profiles_username_lower on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ==============================================================================
-- 3. OUTFITS TABLE
-- ==============================================================================
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text default 'Untitled Look' not null,
  scene_id text not null,
  looks jsonb not null default '{}'::jsonb,
  custom_scene jsonb,
  custom_kaos jsonb,
  rating_avg numeric(3, 2) default 0.00 not null,
  ratings_count integer default 0 not null,
  is_public boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_outfits_user_id on public.outfits (user_id);
create index if not exists idx_outfits_created_at on public.outfits (created_at desc);
create index if not exists idx_outfits_rating_sort on public.outfits (rating_avg desc, ratings_count desc, created_at desc);
create index if not exists idx_outfits_scene_id on public.outfits (scene_id);

alter table public.outfits enable row level security;

create policy "Public outfits are viewable by everyone"
  on public.outfits for select
  to anon, authenticated
  using (is_public = true or (select auth.uid()) = user_id);

create policy "Authenticated users can create outfits"
  on public.outfits for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own outfits"
  on public.outfits for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own outfits"
  on public.outfits for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ==============================================================================
-- 4. OUTFIT RATINGS TABLE
-- ==============================================================================
create table if not exists public.outfit_ratings (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stars smallint not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint stars_range_check check (stars >= 1 and stars <= 5),
  constraint one_rating_per_user_outfit unique (outfit_id, user_id)
);

create index if not exists idx_outfit_ratings_outfit_id on public.outfit_ratings (outfit_id);
create index if not exists idx_outfit_ratings_user_id on public.outfit_ratings (user_id);

alter table public.outfit_ratings enable row level security;

create policy "Ratings are viewable by everyone"
  on public.outfit_ratings for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can rate other users outfits"
  on public.outfit_ratings for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and not exists (
      select 1 from public.outfits
      where id = outfit_id and user_id = (select auth.uid())
    )
  );

create policy "Users can update their own rating"
  on public.outfit_ratings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own rating"
  on public.outfit_ratings for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ==============================================================================
-- 5. ATOMIC AGGREGATE TRIGGER
-- ==============================================================================
create or replace function public.handle_outfit_rating_change()
returns trigger
language plpgsql
security definer
as $$
declare
  target_outfit_id uuid;
begin
  target_outfit_id := coalesce(new.outfit_id, old.outfit_id);

  update public.outfits
  set
    ratings_count = sub.cnt,
    rating_avg = coalesce(sub.avg_score, 0.00),
    updated_at = now()
  from (
    select
      count(*)::integer as cnt,
      round(avg(stars)::numeric, 2) as avg_score
    from public.outfit_ratings
    where outfit_id = target_outfit_id
  ) sub
  where public.outfits.id = target_outfit_id;

  return null;
end;
$$;

create or replace trigger on_outfit_rating_mutation
after insert or update or delete on public.outfit_ratings
for each row execute function public.handle_outfit_rating_change();

-- ==============================================================================
-- 6. AUTOMATIC USER PROFILE PROVISIONING TRIGGER
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  raw_name text;
  clean_username text;
  unique_suffix text;
begin
  raw_name := coalesce(
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, 'stylist'), '@', 1)
  );
  
  clean_username := regexp_replace(raw_name, '[^a-zA-Z0-9_]', '', 'g');
  if char_length(clean_username) < 2 then
    clean_username := 'stylist';
  end if;

  unique_suffix := substr(replace(new.id::text, '-', ''), 1, 4);

  insert into public.profiles (id, username, display_name, avatar_url, is_anonymous)
  values (
    new.id,
    lower(clean_username || '_' || unique_suffix),
    coalesce(new.raw_user_meta_data->>'full_name', clean_username),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_app_meta_data->>'provider') = 'anonymous', false)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET & RLS POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('outfit-assets', 'outfit-assets', true)
on conflict (id) do nothing;

create policy "Public Asset Access"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'outfit-assets');

create policy "Authenticated User Uploads"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'outfit-assets' 
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owner Asset Updates"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'outfit-assets' 
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owner Asset Deletion"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'outfit-assets' 
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
