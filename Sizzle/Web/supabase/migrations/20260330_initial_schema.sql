-- ============================================================
-- Sizzle – Initial Schema
-- Applied: 2026-03-30
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type order_status as enum (
  'draft', 'placed', 'accepted', 'rejected', 'preparing', 'ready', 'picked_up', 'cancelled'
);

-- ============================================================
-- PROFILES  (mirrors auth.users)
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        text not null default 'customer', -- 'customer' | 'vendor'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- VENDORS
-- ============================================================
create table vendors (
  id             uuid primary key default uuid_generate_v4(),
  owner_id       uuid not null references profiles(id) on delete cascade,
  name           text not null,
  cuisine        text,
  description    text,
  location_text  text,
  lat            numeric,
  lng            numeric,
  image_url      text,
  rating         numeric not null default 0,
  review_count   integer not null default 0,
  is_live        boolean not null default false,
  is_busy        boolean not null default false,
  verified       boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
create table menu_items (
  id            uuid primary key default uuid_generate_v4(),
  vendor_id     uuid not null references vendors(id) on delete cascade,
  name          text not null,
  price_cents   integer not null,
  description   text,
  image_url     text,
  category      text not null default 'mains',
  prep_time     text,
  dietary_tags  text[] not null default '{}',
  popular       boolean not null default false,
  featured      boolean not null default false,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles(id) on delete cascade,
  vendor_id         uuid not null references vendors(id) on delete cascade,
  status            order_status not null default 'draft',
  subtotal_cents    integer not null default 0,
  tax_cents         integer not null default 0,
  service_fee_cents integer not null default 150,
  total_cents       integer not null default 0,
  notes             text,
  placed_at         timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table order_items (
  id                    uuid primary key default uuid_generate_v4(),
  order_id              uuid not null references orders(id) on delete cascade,
  menu_item_id          uuid references menu_items(id) on delete set null,
  name_snapshot         text not null,
  price_cents_snapshot  integer not null,
  quantity              integer not null default 1,
  notes                 text,
  created_at            timestamptz not null default now()
);

-- ============================================================
-- REVIEWS
-- ============================================================
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  vendor_id   uuid not null references vendors(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (user_id, vendor_id)
);

-- ============================================================
-- FAVORITES
-- ============================================================
create table favorites (
  user_id     uuid not null references profiles(id) on delete cascade,
  vendor_id   uuid not null references vendors(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, vendor_id)
);

-- ============================================================
-- VENDOR HOURS
-- ============================================================
create table vendor_hours (
  id           uuid primary key default uuid_generate_v4(),
  vendor_id    uuid not null references vendors(id) on delete cascade,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  open_time    time,
  close_time   time,
  is_closed    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (vendor_id, day_of_week)
);

-- ============================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================
create or replace function is_vendor_owner(v_id uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from vendors where id = v_id and owner_id = auth.uid());
$$;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at    before update on profiles    for each row execute function set_updated_at();
create trigger vendors_updated_at     before update on vendors     for each row execute function set_updated_at();
create trigger menu_items_updated_at  before update on menu_items  for each row execute function set_updated_at();
create trigger orders_updated_at      before update on orders      for each row execute function set_updated_at();
create trigger vendor_hours_updated_at before update on vendor_hours for each row execute function set_updated_at();

create or replace function update_vendor_rating()
returns trigger language plpgsql security definer as $$
declare
  target_vendor_id uuid;
begin
  target_vendor_id := coalesce(new.vendor_id, old.vendor_id);
  update vendors
  set
    rating       = coalesce((select avg(rating) from reviews where vendor_id = target_vendor_id), 0),
    review_count = (select count(*) from reviews where vendor_id = target_vendor_id),
    updated_at   = now()
  where id = target_vendor_id;
  return coalesce(new, old);
end;
$$;

create trigger on_review_change
  after insert or update or delete on reviews
  for each row execute function update_vendor_rating();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles     enable row level security;
alter table vendors      enable row level security;
alter table menu_items   enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;
alter table reviews      enable row level security;
alter table favorites    enable row level security;
alter table vendor_hours enable row level security;

create policy "profiles_select_own"   on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own"   on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"   on profiles for update using (auth.uid() = id);

create policy "vendors_select_all"    on vendors  for select using (true);
create policy "vendors_insert_owner"  on vendors  for insert with check (auth.uid() = owner_id);
create policy "vendors_update_owner"  on vendors  for update using (auth.uid() = owner_id);
create policy "vendors_delete_owner"  on vendors  for delete using (auth.uid() = owner_id);

create policy "menu_items_select_all"    on menu_items for select using (true);
create policy "menu_items_write_owner"   on menu_items for all    using (is_vendor_owner(vendor_id));

create policy "orders_select_own_or_vendor" on orders for select using (auth.uid() = user_id or is_vendor_owner(vendor_id));
create policy "orders_insert_own"           on orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own_or_vendor" on orders for update using (is_vendor_owner(vendor_id) or auth.uid() = user_id);

create policy "order_items_select_via_order" on order_items for select using (
  exists (select 1 from orders o where o.id = order_items.order_id and (o.user_id = auth.uid() or is_vendor_owner(o.vendor_id)))
);
create policy "order_items_write_via_order"  on order_items for all using (
  exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

create policy "reviews_select_all"         on reviews for select using (true);
create policy "reviews_insert_own"         on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_delete_own"  on reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own"         on reviews for delete using (auth.uid() = user_id);

create policy "favorites_select_own"   on favorites for select using (auth.uid() = user_id);
create policy "favorites_write_own"    on favorites for all    using (auth.uid() = user_id);

create policy "vendor_hours_select_all"    on vendor_hours for select using (true);
create policy "vendor_hours_write_owner"   on vendor_hours for all    using (is_vendor_owner(vendor_id));

-- ============================================================
-- STORAGE
-- ============================================================
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "Public read menu images"   on storage.objects for select using (bucket_id = 'menu-images');
create policy "Auth upload menu images"   on storage.objects for insert with check (bucket_id = 'menu-images' and auth.role() = 'authenticated');
create policy "Owner update menu images"  on storage.objects for update using (bucket_id = 'menu-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owner delete menu images"  on storage.objects for delete using (bucket_id = 'menu-images' and auth.uid()::text = (storage.foldername(name))[1]);
