-- =====================================================
-- Business Financing Lead Intelligence Engine Schema
-- =====================================================

-- Enum-like lookup tables for controlled vocabularies
create table if not exists public.financing_categories (
  id text primary key,
  label text not null,
  description text
);

insert into public.financing_categories (id, label, description) values
  ('equipment_financing', 'Equipment Financing', 'Financing for business equipment purchases'),
  ('working_capital', 'Working Capital', 'Short-term operational funding'),
  ('sba_loan', 'SBA Loan', 'Small Business Administration backed loans'),
  ('business_loc', 'Business Line of Credit', 'Revolving credit facility'),
  ('commercial_vehicle', 'Commercial Vehicle Financing', 'Trucks, vans, fleet vehicles'),
  ('trucking_fleet', 'Trucking/Fleet Financing', 'Large fleet and trucking operations'),
  ('construction_equipment', 'Construction Equipment Financing', 'Heavy machinery and construction equipment'),
  ('inventory_financing', 'Inventory Financing', 'Financing for inventory purchases'),
  ('debt_consolidation', 'Debt Consolidation/Refinance', 'Consolidating existing business debt'),
  ('acquisition_financing', 'Business Acquisition Financing', 'Capital for buying businesses'),
  ('expansion_capital', 'Expansion Capital', 'Growth and expansion funding'),
  ('emergency_cashflow', 'Emergency Cash Flow Funding', 'Urgent working capital needs')
on conflict (id) do nothing;

create table if not exists public.signal_types (
  id text primary key,
  label text not null,
  base_score integer not null default 0,
  description text
);

insert into public.signal_types (id, label, base_score, description) values
  ('ucc_filing', 'UCC Filing', 30, 'UCC-1 or related secured transaction filing'),
  ('ucc_multiple', 'Multiple UCC Filings', 20, 'Multiple secured filings for same debtor'),
  ('equipment_collateral', 'Equipment-Related Collateral', 25, 'Collateral involves equipment/vehicles'),
  ('hiring_equipment_roles', 'Hiring Equipment-Heavy Roles', 20, 'Job postings for drivers, operators, technicians'),
  ('multiple_job_postings', 'Multiple Active Job Postings', 15, 'Company has several open positions'),
  ('government_contract', 'Government Contract Award', 30, 'Recently awarded public contract'),
  ('expansion_language', 'Expansion Language Found', 20, 'Website/social media mentions expansion'),
  ('equipment_purchase', 'Equipment Purchase Language', 25, 'Mentions of new equipment, trucks, fleet'),
  ('dealer_relationship', 'Dealer/Vendor Relationship', 20, 'Potential equipment seller referral'),
  ('established_business', 'Established Business', 10, 'Business appears well-established'),
  ('contact_found', 'Contact Info Found', 10, 'Email or direct contact available'),
  ('website_found', 'Website Found', 5, 'Business has active website'),
  ('cashflow_pressure', 'Possible Cash Flow Pressure', 15, 'Signals of financial distress'),
  ('acquisition_signal', 'Business Acquisition Signal', 25, 'For sale, new ownership, acquisition'),
  ('fleet_growth', 'Fleet/Trucking Growth', 25, 'Fleet expansion indicators'),
  ('permit_activity', 'Permit/Construction Activity', 20, 'Active construction permits'),
  ('new_authority', 'New DOT/MC Authority', 25, 'Recently registered trucking authority')
on conflict (id) do nothing;

create table if not exists public.industries (
  id text primary key,
  label text not null
);

insert into public.industries (id, label) values
  ('construction', 'Construction'),
  ('roofing', 'Roofing'),
  ('hvac', 'HVAC'),
  ('plumbing', 'Plumbing'),
  ('electrical', 'Electrical'),
  ('concrete', 'Concrete'),
  ('excavation', 'Excavation'),
  ('landscaping', 'Landscaping'),
  ('tree_service', 'Tree Service'),
  ('restoration', 'Restoration'),
  ('trucking', 'Trucking'),
  ('logistics', 'Logistics'),
  ('manufacturing', 'Manufacturing'),
  ('welding_fabrication', 'Welding/Fabrication'),
  ('agriculture', 'Agriculture'),
  ('auto_repair', 'Auto Repair'),
  ('collision_repair', 'Collision Repair'),
  ('restaurant', 'Restaurant'),
  ('medical_practice', 'Medical Practice'),
  ('dental_practice', 'Dental Practice'),
  ('med_spa', 'Med Spa'),
  ('equipment_rental', 'Equipment Rental'),
  ('waste_management', 'Waste Management'),
  ('cleaning_janitorial', 'Cleaning/Janitorial'),
  ('franchise', 'Franchise Business'),
  ('ecommerce', 'E-commerce'),
  ('retail', 'Retail'),
  ('other', 'Other')
on conflict (id) do nothing;

create table if not exists public.contact_statuses (
  id text primary key,
  label text not null,
  sort_order integer not null default 0
);

insert into public.contact_statuses (id, label, sort_order) values
  ('new', 'New', 1),
  ('researching', 'Researching', 2),
  ('contacted', 'Contacted', 3),
  ('replied', 'Replied', 4),
  ('interested', 'Interested', 5),
  ('application_started', 'Application Started', 6),
  ('approved', 'Approved', 7),
  ('funded', 'Funded', 8),
  ('not_a_fit', 'Not a Fit', 9),
  ('follow_up_later', 'Follow Up Later', 10)
on conflict (id) do nothing;

-- =====================================================
-- Core Financing Leads Table
-- =====================================================
create table if not exists public.financing_leads (
  id uuid primary key default uuid_generate_v4(),
  
  -- Company info
  company_name text not null,
  industry text references public.industries(id),
  website text,
  phone text,
  email text,
  business_address text,
  city text,
  state text,
  zip_code text,
  
  -- Contact info
  owner_name text,
  owner_title text,
  owner_email text,
  owner_phone text,
  owner_linkedin text,
  
  -- Lead metadata
  source_url text,
  source_type text, -- scraper name/type
  date_found timestamptz not null default now(),
  
  -- Scoring
  lead_score integer not null default 0 check (lead_score >= 0 and lead_score <= 100),
  lead_priority text generated always as (
    case 
      when lead_score >= 85 then 'hot'
      when lead_score >= 70 then 'strong'
      when lead_score >= 50 then 'possible'
      when lead_score >= 30 then 'low'
      else 'ignore'
    end
  ) stored,
  
  -- AI Classification
  financing_category text references public.financing_categories(id),
  likely_reason text,
  suggested_outreach text,
  ai_summary text,
  estimated_capital_need text,
  
  -- Status tracking
  contact_status text not null default 'new' references public.contact_statuses(id),
  notes text,
  
  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Deduplication
  unique(company_name, state)
);

create index if not exists idx_financing_leads_score on public.financing_leads(lead_score desc);
create index if not exists idx_financing_leads_industry on public.financing_leads(industry);
create index if not exists idx_financing_leads_state on public.financing_leads(state);
create index if not exists idx_financing_leads_priority on public.financing_leads(lead_priority);
create index if not exists idx_financing_leads_status on public.financing_leads(contact_status);
create index if not exists idx_financing_leads_date on public.financing_leads(date_found desc);
create index if not exists idx_financing_leads_category on public.financing_leads(financing_category);

-- =====================================================
-- Lead Signals Table (many signals per lead)
-- =====================================================
create table if not exists public.lead_signals (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.financing_leads(id) on delete cascade,
  signal_type text not null references public.signal_types(id),
  signal_description text,
  signal_data jsonb, -- raw data from scraper
  source_url text,
  score_contribution integer not null default 0,
  found_at timestamptz not null default now(),
  
  unique(lead_id, signal_type, source_url)
);

create index if not exists idx_lead_signals_lead on public.lead_signals(lead_id);
create index if not exists idx_lead_signals_type on public.lead_signals(signal_type);

-- =====================================================
-- UCC Filings Table
-- =====================================================
create table if not exists public.ucc_filings (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.financing_leads(id) on delete set null,
  
  -- Filing info
  filing_number text,
  filing_date date,
  filing_type text, -- UCC-1, UCC-3, etc.
  filing_state text not null,
  
  -- Debtor info
  debtor_name text not null,
  debtor_address text,
  debtor_city text,
  debtor_state text,
  debtor_zip text,
  
  -- Secured party info
  secured_party_name text,
  secured_party_address text,
  
  -- Collateral
  collateral_description text,
  collateral_type text, -- equipment, vehicles, inventory, etc.
  
  -- Metadata
  source_url text,
  raw_data jsonb,
  created_at timestamptz not null default now(),
  
  unique(filing_number, filing_state)
);

create index if not exists idx_ucc_debtor on public.ucc_filings(debtor_name);
create index if not exists idx_ucc_state on public.ucc_filings(filing_state);
create index if not exists idx_ucc_date on public.ucc_filings(filing_date desc);
create index if not exists idx_ucc_lead on public.ucc_filings(lead_id);

-- =====================================================
-- Hiring Signals Table
-- =====================================================
create table if not exists public.hiring_signals (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.financing_leads(id) on delete set null,
  
  -- Company info
  company_name text not null,
  company_website text,
  
  -- Job info
  job_title text not null,
  job_location text,
  job_state text,
  job_description text,
  job_url text,
  job_source text, -- indeed, ziprecruiter, etc.
  
  -- Classification
  job_category text, -- driver, operator, technician, etc.
  equipment_related boolean default false,
  
  -- Metadata
  posted_date date,
  found_at timestamptz not null default now(),
  raw_data jsonb,
  
  unique(company_name, job_title, job_source)
);

create index if not exists idx_hiring_company on public.hiring_signals(company_name);
create index if not exists idx_hiring_lead on public.hiring_signals(lead_id);
create index if not exists idx_hiring_category on public.hiring_signals(job_category);

-- =====================================================
-- Government Contracts Table
-- =====================================================
create table if not exists public.government_contracts (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.financing_leads(id) on delete set null,
  
  -- Contract info
  contract_number text,
  award_date date,
  award_amount numeric,
  contract_description text,
  
  -- Awardee info
  awardee_name text not null,
  awardee_address text,
  awardee_city text,
  awardee_state text,
  
  -- Awarding entity
  awarding_agency text,
  agency_type text, -- federal, state, county, city, school
  
  -- Classification
  contract_type text, -- construction, transportation, maintenance, etc.
  naics_code text,
  
  -- Metadata
  source_url text,
  source_type text, -- sam.gov, state portal, etc.
  raw_data jsonb,
  created_at timestamptz not null default now(),
  
  unique(contract_number, source_type)
);

create index if not exists idx_contracts_awardee on public.government_contracts(awardee_name);
create index if not exists idx_contracts_lead on public.government_contracts(lead_id);
create index if not exists idx_contracts_date on public.government_contracts(award_date desc);

-- =====================================================
-- Equipment Dealers Table
-- =====================================================
create table if not exists public.equipment_dealers (
  id uuid primary key default uuid_generate_v4(),
  
  -- Dealer info
  dealer_name text not null,
  equipment_category text, -- heavy equipment, trucks, trailers, etc.
  website text,
  city text,
  state text,
  phone text,
  email text,
  contact_page_url text,
  
  -- Contacts
  sales_manager text,
  sales_manager_email text,
  sales_manager_phone text,
  finance_manager text,
  finance_manager_email text,
  finance_manager_phone text,
  linkedin_url text,
  
  -- Metadata
  source_url text,
  notes text,
  is_partner boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique(dealer_name, state)
);

create index if not exists idx_dealers_category on public.equipment_dealers(equipment_category);
create index if not exists idx_dealers_state on public.equipment_dealers(state);

-- =====================================================
-- Scraper Jobs Table (for job queue)
-- =====================================================
create table if not exists public.scraper_jobs (
  id uuid primary key default uuid_generate_v4(),
  
  -- Job config
  scraper_type text not null, -- ucc, hiring, contracts, expansion, etc.
  target_state text,
  target_params jsonb, -- custom params per scraper
  
  -- Status
  status text not null default 'pending', -- pending, running, completed, failed
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Results
  leads_found integer default 0,
  signals_found integer default 0,
  error_message text,
  logs jsonb,
  
  -- Scheduling
  scheduled_for timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_scraper_jobs_status on public.scraper_jobs(status);
create index if not exists idx_scraper_jobs_type on public.scraper_jobs(scraper_type);
create index if not exists idx_scraper_jobs_scheduled on public.scraper_jobs(scheduled_for);

-- =====================================================
-- Daily Reports Table
-- =====================================================
create table if not exists public.daily_reports (
  id uuid primary key default uuid_generate_v4(),
  report_date date not null unique,
  
  -- Stats
  total_leads_found integer default 0,
  hot_leads integer default 0,
  strong_leads integer default 0,
  
  -- Top leads (stored as JSON for quick retrieval)
  top_25_leads jsonb,
  
  -- Metadata
  generated_at timestamptz not null default now()
);

-- =====================================================
-- Shared Filter Links Table
-- =====================================================
create table if not exists public.shared_filters (
  id uuid primary key default uuid_generate_v4(),
  
  -- Creator
  created_by uuid references public.profiles(id) on delete set null,
  
  -- Filter config
  name text not null,
  description text,
  filters jsonb not null, -- stores all filter parameters
  
  -- Sharing
  share_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  is_active boolean default true,
  expires_at timestamptz,
  
  -- Stats
  view_count integer default 0,
  last_viewed_at timestamptz,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_shared_filters_token on public.shared_filters(share_token);

-- =====================================================
-- RLS Policies
-- =====================================================
alter table public.financing_categories enable row level security;
alter table public.signal_types enable row level security;
alter table public.industries enable row level security;
alter table public.contact_statuses enable row level security;
alter table public.financing_leads enable row level security;
alter table public.lead_signals enable row level security;
alter table public.ucc_filings enable row level security;
alter table public.hiring_signals enable row level security;
alter table public.government_contracts enable row level security;
alter table public.equipment_dealers enable row level security;
alter table public.scraper_jobs enable row level security;
alter table public.daily_reports enable row level security;
alter table public.shared_filters enable row level security;

-- Lookup tables readable by all authenticated users
create policy "lookup_read_all" on public.financing_categories for select using (true);
create policy "lookup_read_all" on public.signal_types for select using (true);
create policy "lookup_read_all" on public.industries for select using (true);
create policy "lookup_read_all" on public.contact_statuses for select using (true);

-- Admin-only write for core data tables
create policy "financing_leads_admin" on public.financing_leads for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);
create policy "financing_leads_read" on public.financing_leads for select using (
  auth.uid() is not null
);

create policy "lead_signals_admin" on public.lead_signals for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);
create policy "lead_signals_read" on public.lead_signals for select using (
  auth.uid() is not null
);

create policy "ucc_admin" on public.ucc_filings for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);
create policy "ucc_read" on public.ucc_filings for select using (
  auth.uid() is not null
);

create policy "hiring_admin" on public.hiring_signals for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);
create policy "hiring_read" on public.hiring_signals for select using (
  auth.uid() is not null
);

create policy "contracts_admin" on public.government_contracts for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);
create policy "contracts_read" on public.government_contracts for select using (
  auth.uid() is not null
);

create policy "dealers_admin" on public.equipment_dealers for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);
create policy "dealers_read" on public.equipment_dealers for select using (
  auth.uid() is not null
);

create policy "scraper_jobs_admin" on public.scraper_jobs for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);

create policy "daily_reports_read" on public.daily_reports for select using (
  auth.uid() is not null
);
create policy "daily_reports_admin" on public.daily_reports for all using (
  exists(select 1 from public.profiles p where p.auth_user_id = auth.uid() and p.is_admin)
);

-- Shared filters: creator can manage, anyone with token can view
create policy "shared_filters_own" on public.shared_filters for all using (
  exists(select 1 from public.profiles p where p.id = created_by and p.auth_user_id = auth.uid())
);
create policy "shared_filters_read" on public.shared_filters for select using (
  is_active = true
);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to recalculate lead score from signals
create or replace function public.recalculate_lead_score(p_lead_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_score integer;
begin
  select coalesce(sum(score_contribution), 0) into v_score
  from public.lead_signals
  where lead_id = p_lead_id;
  
  -- Cap at 100
  v_score := least(v_score, 100);
  
  update public.financing_leads
  set lead_score = v_score, updated_at = now()
  where id = p_lead_id;
  
  return v_score;
end;
$$;

-- Trigger to update lead score when signals change
create or replace function public.trigger_update_lead_score()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_OP = 'DELETE' then
    perform public.recalculate_lead_score(OLD.lead_id);
    return OLD;
  else
    perform public.recalculate_lead_score(NEW.lead_id);
    return NEW;
  end if;
end;
$$;

create trigger lead_signals_score_update
after insert or update or delete on public.lead_signals
for each row execute function public.trigger_update_lead_score();

-- Function to update timestamps
create or replace function public.trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger financing_leads_updated_at
before update on public.financing_leads
for each row execute function public.trigger_set_updated_at();

create trigger equipment_dealers_updated_at
before update on public.equipment_dealers
for each row execute function public.trigger_set_updated_at();
