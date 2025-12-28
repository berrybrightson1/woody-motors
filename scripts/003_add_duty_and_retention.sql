-- Adding support for Phase B trust badges and Phase D retention logic
alter table public.vehicles 
add column if not exists is_duty_paid boolean default true,
add column if not exists vin_verified boolean default false,
add column if not exists condition text default 'foreign_used' check (condition in ('foreign_used', 'brand_new'));

-- Adding next service calculation logic for Phase D
alter table public.service_bookings
add column if not exists current_mileage integer,
add column if not exists next_service_date date,
add column if not exists voice_diagnostic_url text;

-- Function to calculate next service (6 months or 5000 miles default)
create or replace function public.calculate_next_service()
returns trigger as $$
begin
  if new.status = 'completed' then
    new.next_service_date = current_date + interval '6 months';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_service_completed
  before update on public.service_bookings
  for each row 
  when (old.status != 'completed' and new.status = 'completed')
  execute procedure public.calculate_next_service();
