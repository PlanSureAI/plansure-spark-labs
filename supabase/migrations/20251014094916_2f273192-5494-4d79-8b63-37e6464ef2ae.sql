-- Properties Table
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  address text not null,
  property_type varchar(50) not null,
  size_sqft integer,
  city varchar(100) not null,
  state varchar(100),
  postal_code varchar(20),
  country varchar(50) default 'United Kingdom',
  status varchar(20) default 'active' check (status in ('active', 'inactive', 'sold')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Compliance Requirements Table
create table public.compliance_requirements (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  jurisdiction varchar(100) not null,
  description text,
  applicable_property_types text[], -- array of property types
  threshold_values jsonb,
  renewal_period_days integer,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Compliance Tracking Table
create table public.compliance_tracking (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  compliance_id uuid references public.compliance_requirements(id) on delete cascade not null,
  status varchar(10) check (status in ('green', 'amber', 'red')) not null default 'green',
  last_audit_date date,
  next_deadline date not null,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(property_id, compliance_id)
);

-- Compliance Alerts Table
create table public.compliance_alerts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  compliance_id uuid references public.compliance_requirements(id) on delete cascade not null,
  alert_type varchar(50) not null,
  alert_date date not null,
  resolved boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on all tables
alter table public.properties enable row level security;
alter table public.compliance_requirements enable row level security;
alter table public.compliance_tracking enable row level security;
alter table public.compliance_alerts enable row level security;

-- Properties policies
create policy "Users can view own properties"
  on public.properties for select
  using (auth.uid() = user_id);

create policy "Users can insert own properties"
  on public.properties for insert
  with check (auth.uid() = user_id);

create policy "Users can update own properties"
  on public.properties for update
  using (auth.uid() = user_id);

create policy "Users can delete own properties"
  on public.properties for delete
  using (auth.uid() = user_id);

-- Compliance Requirements policies (everyone can read, only admins can modify)
create policy "Anyone can view compliance requirements"
  on public.compliance_requirements for select
  using (true);

create policy "Only admins can insert compliance requirements"
  on public.compliance_requirements for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update compliance requirements"
  on public.compliance_requirements for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete compliance requirements"
  on public.compliance_requirements for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Compliance Tracking policies
create policy "Users can view own compliance tracking"
  on public.compliance_tracking for select
  using (exists (
    select 1 from public.properties
    where properties.id = compliance_tracking.property_id
    and properties.user_id = auth.uid()
  ));

create policy "Users can insert own compliance tracking"
  on public.compliance_tracking for insert
  with check (exists (
    select 1 from public.properties
    where properties.id = compliance_tracking.property_id
    and properties.user_id = auth.uid()
  ));

create policy "Users can update own compliance tracking"
  on public.compliance_tracking for update
  using (exists (
    select 1 from public.properties
    where properties.id = compliance_tracking.property_id
    and properties.user_id = auth.uid()
  ));

create policy "Users can delete own compliance tracking"
  on public.compliance_tracking for delete
  using (exists (
    select 1 from public.properties
    where properties.id = compliance_tracking.property_id
    and properties.user_id = auth.uid()
  ));

-- Compliance Alerts policies
create policy "Users can view own alerts"
  on public.compliance_alerts for select
  using (exists (
    select 1 from public.properties
    where properties.id = compliance_alerts.property_id
    and properties.user_id = auth.uid()
  ));

create policy "Users can insert own alerts"
  on public.compliance_alerts for insert
  with check (exists (
    select 1 from public.properties
    where properties.id = compliance_alerts.property_id
    and properties.user_id = auth.uid()
  ));

create policy "Users can update own alerts"
  on public.compliance_alerts for update
  using (exists (
    select 1 from public.properties
    where properties.id = compliance_alerts.property_id
    and properties.user_id = auth.uid()
  ));

create policy "Users can delete own alerts"
  on public.compliance_alerts for delete
  using (exists (
    select 1 from public.properties
    where properties.id = compliance_alerts.property_id
    and properties.user_id = auth.uid()
  ));

-- Triggers for updated_at
create trigger update_properties_updated_at
  before update on public.properties
  for each row
  execute function public.handle_updated_at();

create trigger update_compliance_requirements_updated_at
  before update on public.compliance_requirements
  for each row
  execute function public.handle_updated_at();

create trigger update_compliance_tracking_updated_at
  before update on public.compliance_tracking
  for each row
  execute function public.handle_updated_at();

create trigger update_compliance_alerts_updated_at
  before update on public.compliance_alerts
  for each row
  execute function public.handle_updated_at();

-- Insert default compliance requirements (UK Future Homes Standard focus)
insert into public.compliance_requirements (name, jurisdiction, description, applicable_property_types, renewal_period_days) values
  ('Future Homes Standard', 'England', '75-80% reduction in carbon emissions via low-carbon heating and enhanced fabric efficiency', array['residential', 'new_build'], 365),
  ('EPC Rating', 'England & Wales', 'Energy Performance Certificate - minimum band C required for rentals', array['residential', 'commercial'], 3650),
  ('Building Regulations Part L', 'England', 'Conservation of fuel and power standards', array['residential', 'commercial', 'new_build'], 365),
  ('BREEAM Certification', 'UK', 'Building Research Establishment Environmental Assessment Method', array['commercial', 'new_build'], 1825),
  ('Approved Document O', 'England', 'Overheating standards for new residential buildings', array['residential', 'new_build'], 365),
  ('EV Charging Infrastructure', 'UK', 'Electric vehicle charging point requirements for new homes', array['residential', 'new_build'], null);