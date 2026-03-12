-- ============================================================
-- GLAM.CO — Full Database Schema
-- Run via: supabase db push  OR  paste into Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy search

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type user_role as enum ('client', 'artist');
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type product_label as enum ('artist_pick', 'new', 'sale');
create type order_status as enum ('pending', 'paid', 'shipped', 'delivered');
create type genre as enum (
  'wedding', 'glam', 'drag', 'editorial',
  'natural', 'sfx', 'avant-garde', 'quinceanera', 'bridal', 'prom'
);

-- ─── PROFILES ────────────────────────────────────────────────────────────────

create table profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null unique,
  full_name     text not null,
  avatar_url    text,
  role          user_role not null default 'client',
  location      text,
  created_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── ARTIST PROFILES ─────────────────────────────────────────────────────────

create table artist_profiles (
  id                  uuid default uuid_generate_v4() primary key,
  profile_id          uuid references profiles(id) on delete cascade not null unique,
  bio                 text,
  genres              genre[] default '{}',
  hourly_rate         numeric(10,2) default 0,
  session_rate        numeric(10,2) default 0,
  stripe_account_id   text unique,
  stripe_onboarded    boolean default false,
  instagram_url       text,
  avg_rating          numeric(3,2) default 0,
  total_reviews       int default 0,
  total_bookings      int default 0,
  created_at          timestamptz default now()
);

-- ─── PORTFOLIO IMAGES ─────────────────────────────────────────────────────────

create table portfolio_images (
  id            uuid default uuid_generate_v4() primary key,
  artist_id     uuid references artist_profiles(id) on delete cascade not null,
  url           text not null,
  caption       text,
  genre         genre,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

-- ─── AVAILABILITY ─────────────────────────────────────────────────────────────

create table artist_availability (
  id            uuid default uuid_generate_v4() primary key,
  artist_id     uuid references artist_profiles(id) on delete cascade not null,
  day_of_week   smallint not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time    time not null,
  end_time      time not null
);

-- ─── BOOKINGS ─────────────────────────────────────────────────────────────────

create table bookings (
  id                          uuid default uuid_generate_v4() primary key,
  client_id                   uuid references profiles(id) on delete set null,
  artist_id                   uuid references artist_profiles(id) on delete set null,
  service_type                text not null,
  date                        date not null,
  start_time                  time,
  location                    text not null,
  notes                       text,
  status                      booking_status default 'pending',
  subtotal                    numeric(10,2) not null,
  platform_fee                numeric(10,2) not null,
  total                       numeric(10,2) not null,
  stripe_payment_intent_id    text unique,
  stripe_transfer_id          text,
  created_at                  timestamptz default now()
);

-- Update artist booking count on confirmation
create or replace function update_artist_booking_count()
returns trigger as $$
begin
  if new.status = 'confirmed' and old.status != 'confirmed' then
    update artist_profiles
    set total_bookings = total_bookings + 1
    where id = new.artist_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_booking_confirmed
  after update on bookings
  for each row execute procedure update_artist_booking_count();

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────

create table reviews (
  id          uuid default uuid_generate_v4() primary key,
  booking_id  uuid references bookings(id) on delete cascade not null unique,
  client_id   uuid references profiles(id) on delete set null,
  artist_id   uuid references artist_profiles(id) on delete cascade not null,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz default now()
);

-- Recalculate artist avg rating after each review
create or replace function update_artist_rating()
returns trigger as $$
begin
  update artist_profiles
  set
    avg_rating = (select avg(rating) from reviews where artist_id = new.artist_id),
    total_reviews = (select count(*) from reviews where artist_id = new.artist_id)
  where id = new.artist_id;
  return new;
end;
$$ language plpgsql;

create trigger on_review_created
  after insert or update on reviews
  for each row execute procedure update_artist_rating();

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────

create table products (
  id            uuid default uuid_generate_v4() primary key,
  artist_id     uuid references artist_profiles(id) on delete cascade not null,
  name          text not null,
  brand         text not null,
  description   text,
  price         numeric(10,2) not null,
  sale_price    numeric(10,2),
  image_url     text,
  label         product_label default 'new',
  in_stock      boolean default true,
  created_at    timestamptz default now()
);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────

create table orders (
  id                        uuid default uuid_generate_v4() primary key,
  user_id                   uuid references profiles(id) on delete set null,
  subtotal                  numeric(10,2) not null,
  total                     numeric(10,2) not null,
  stripe_payment_intent_id  text unique,
  status                    order_status default 'pending',
  created_at                timestamptz default now()
);

create table order_items (
  id            uuid default uuid_generate_v4() primary key,
  order_id      uuid references orders(id) on delete cascade not null,
  product_id    uuid references products(id) on delete set null,
  product_name  text not null, -- snapshot at time of purchase
  quantity      int not null default 1,
  unit_price    numeric(10,2) not null
);

-- ─── FAVORITES ────────────────────────────────────────────────────────────────

create table favorites (
  user_id     uuid references profiles(id) on delete cascade,
  artist_id   uuid references artist_profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (user_id, artist_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

create index idx_artist_genres on artist_profiles using gin(genres);
create index idx_artist_rating on artist_profiles(avg_rating desc);
create index idx_bookings_client on bookings(client_id);
create index idx_bookings_artist on bookings(artist_id);
create index idx_bookings_date on bookings(date);
create index idx_products_artist on products(artist_id);
create index idx_reviews_artist on reviews(artist_id);

-- Full-text search on artist profiles
create index idx_profiles_name_search on profiles using gin(to_tsvector('english', full_name));

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table artist_profiles enable row level security;
alter table portfolio_images enable row level security;
alter table artist_availability enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table favorites enable row level security;

-- Profiles: public read, own write
create policy "Profiles are publicly readable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Artist profiles: public read, own write
create policy "Artist profiles are publicly readable" on artist_profiles for select using (true);
create policy "Artists can manage own profile" on artist_profiles for all using (
  auth.uid() = profile_id
);

-- Portfolio images: public read, artist write
create policy "Portfolio images are public" on portfolio_images for select using (true);
create policy "Artists manage own portfolio" on portfolio_images for all using (
  exists (
    select 1 from artist_profiles where id = portfolio_images.artist_id and profile_id = auth.uid()
  )
);

-- Bookings: client and artist can read own, client can create
create policy "Clients can view own bookings" on bookings for select using (
  auth.uid() = client_id
);
create policy "Artists can view bookings for them" on bookings for select using (
  exists (select 1 from artist_profiles where id = bookings.artist_id and profile_id = auth.uid())
);
create policy "Clients can create bookings" on bookings for insert with check (
  auth.uid() = client_id
);
create policy "Artists can update booking status" on bookings for update using (
  exists (select 1 from artist_profiles where id = bookings.artist_id and profile_id = auth.uid())
);

-- Reviews: public read, client (post-booking) write
create policy "Reviews are publicly readable" on reviews for select using (true);
create policy "Clients can review completed bookings" on reviews for insert with check (
  auth.uid() = client_id and
  exists (
    select 1 from bookings
    where id = reviews.booking_id and client_id = auth.uid() and status = 'completed'
  )
);

-- Products: public read, artist write
create policy "Products are publicly readable" on products for select using (true);
create policy "Artists manage own products" on products for all using (
  exists (select 1 from artist_profiles where id = products.artist_id and profile_id = auth.uid())
);

-- Orders: own user only
create policy "Users view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users create own orders" on orders for insert with check (auth.uid() = user_id);

-- Favorites: own user only
create policy "Users manage own favorites" on favorites for all using (auth.uid() = user_id);
