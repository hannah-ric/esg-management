-- Create api_keys table if it doesn't exist
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable row level security
alter table api_keys enable row level security;

-- Create policies
create policy "Public read access to api_keys"
  on api_keys for select
  using (true);

create policy "Admin users can manage api_keys"
  on api_keys for all
  using (auth.role() = 'service_role');

-- Insert the Clerk publishable key
insert into api_keys (key, value)
values ('CLERK_PUBLISHABLE_KEY', 'pk_test_Y2xlcmstbW9jay1rZXktZm9yLWRldmVsb3BtZW50LWVudmlyb25tZW50')
on conflict (key) do update set value = excluded.value, updated_at = now();
