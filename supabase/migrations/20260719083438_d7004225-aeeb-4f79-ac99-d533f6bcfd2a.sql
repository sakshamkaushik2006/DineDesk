
-- profiles
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles self read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles self insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- menu categories
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.menu_categories to anon, authenticated;
grant all on public.menu_categories to service_role;
alter table public.menu_categories enable row level security;
create policy "categories public read" on public.menu_categories for select to anon, authenticated using (true);

-- menu items
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  tags text[] not null default '{}',
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.menu_items to anon, authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "items public read" on public.menu_items for select to anon, authenticated using (true);

-- tables
create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  capacity int not null check (capacity > 0),
  created_at timestamptz not null default now()
);
grant select on public.restaurant_tables to anon, authenticated;
grant all on public.restaurant_tables to service_role;
alter table public.restaurant_tables enable row level security;
create policy "tables public read" on public.restaurant_tables for select to anon, authenticated using (true);

-- bookings
create type public.booking_status as enum ('pending','confirmed','cancelled','completed');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  table_id uuid references public.restaurant_tables(id) on delete set null,
  guest_name text not null,
  guest_phone text,
  party_size int not null check (party_size > 0 and party_size <= 20),
  booking_date date not null,
  booking_time time not null,
  special_requests text,
  status public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "bookings self read" on public.bookings for select to authenticated using (auth.uid() = user_id);
create policy "bookings self insert" on public.bookings for insert to authenticated with check (auth.uid() = user_id);
create policy "bookings self update" on public.bookings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public availability view: aggregate booked seats per date/time slot without exposing user info
create or replace view public.booking_slot_load as
  select booking_date, booking_time, sum(party_size)::int as booked_seats
  from public.bookings
  where status in ('pending','confirmed')
  group by booking_date, booking_time;
grant select on public.booking_slot_load to anon, authenticated;

-- Seed categories
insert into public.menu_categories (name, slug, sort_order) values
  ('Starters', 'starters', 1),
  ('Mains', 'mains', 2),
  ('Pasta', 'pasta', 3),
  ('Desserts', 'desserts', 4),
  ('Cocktails', 'cocktails', 5),
  ('Wine', 'wine', 6);

-- Seed tables
insert into public.restaurant_tables (label, capacity) values
  ('T1', 2), ('T2', 2), ('T3', 4), ('T4', 4),
  ('T5', 6), ('T6', 6), ('T7', 8), ('T8', 10);

-- Seed menu items
with c as (select id, slug from public.menu_categories)
insert into public.menu_items (category_id, name, description, price, image_url, tags) values
  ((select id from c where slug='starters'), 'Kumamoto Oysters', 'Half dozen, mignonette, lemon, seaweed salt.', 28.00, '/src/assets/dish-oysters.jpg', '{"chef-pick","gluten-free"}'),
  ((select id from c where slug='starters'), 'Seared Hokkaido Scallops', 'Cauliflower purée, brown butter, gold caviar.', 34.00, '/src/assets/dish-scallops.jpg', '{"signature"}'),
  ((select id from c where slug='starters'), 'Tuna Tartare', 'Yellowfin, avocado, yuzu, crispy shallot.', 26.00, null, '{"raw"}'),
  ((select id from c where slug='mains'), 'A5 Wagyu Ribeye', '8oz, bone marrow jus, charred leek, gold dust.', 128.00, '/src/assets/dish-steak.jpg', '{"signature","chef-pick"}'),
  ((select id from c where slug='mains'), 'Miso Black Cod', '48hr marinated, pickled ginger, dashi glaze.', 62.00, null, '{"gluten-free"}'),
  ((select id from c where slug='mains'), 'Duck à l''Orange', 'Confit leg, blood orange gastrique, potato mille-feuille.', 54.00, null, '{}'),
  ((select id from c where slug='pasta'), 'Black Truffle Tagliatelle', 'Fresh pasta, aged parmigiano, shaved truffle.', 48.00, '/src/assets/dish-pasta.jpg', '{"signature","vegetarian"}'),
  ((select id from c where slug='pasta'), 'Lobster Cavatelli', 'Maine lobster, tomato cream, basil oil.', 56.00, null, '{}'),
  ((select id from c where slug='desserts'), 'Molten Chocolate & Gold', 'Warm valrhona, salted caramel, edible gold, berries.', 22.00, '/src/assets/dish-dessert.jpg', '{"signature"}'),
  ((select id from c where slug='desserts'), 'Vanilla Bean Panna Cotta', 'Madagascar vanilla, wild honey, saffron pear.', 18.00, null, '{"vegetarian"}'),
  ((select id from c where slug='cocktails'), 'Smoked Old Fashioned', 'Bourbon, applewood smoke, gold flake.', 24.00, '/src/assets/dish-cocktail.jpg', '{"signature"}'),
  ((select id from c where slug='cocktails'), 'Elderflower Spritz', 'Prosecco, elderflower, cucumber, mint.', 18.00, null, '{}');
