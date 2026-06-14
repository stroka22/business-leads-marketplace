// Financing Lead Intelligence Engine Types

export type FinancingCategory =
  | 'equipment_financing'
  | 'working_capital'
  | 'sba_loan'
  | 'business_loc'
  | 'commercial_vehicle'
  | 'trucking_fleet'
  | 'construction_equipment'
  | 'inventory_financing'
  | 'debt_consolidation'
  | 'acquisition_financing'
  | 'expansion_capital'
  | 'emergency_cashflow'

export type SignalType =
  | 'ucc_filing'
  | 'ucc_multiple'
  | 'equipment_collateral'
  | 'hiring_equipment_roles'
  | 'multiple_job_postings'
  | 'government_contract'
  | 'expansion_language'
  | 'equipment_purchase'
  | 'dealer_relationship'
  | 'established_business'
  | 'contact_found'
  | 'website_found'
  | 'cashflow_pressure'
  | 'acquisition_signal'
  | 'fleet_growth'
  | 'permit_activity'
  | 'new_authority'

export type Industry =
  | 'construction'
  | 'roofing'
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'concrete'
  | 'excavation'
  | 'landscaping'
  | 'tree_service'
  | 'restoration'
  | 'trucking'
  | 'logistics'
  | 'manufacturing'
  | 'welding_fabrication'
  | 'agriculture'
  | 'auto_repair'
  | 'collision_repair'
  | 'restaurant'
  | 'medical_practice'
  | 'dental_practice'
  | 'med_spa'
  | 'equipment_rental'
  | 'waste_management'
  | 'cleaning_janitorial'
  | 'franchise'
  | 'ecommerce'
  | 'retail'
  | 'other'

export type ContactStatus =
  | 'new'
  | 'researching'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'application_started'
  | 'approved'
  | 'funded'
  | 'not_a_fit'
  | 'follow_up_later'

export type LeadPriority = 'hot' | 'strong' | 'possible' | 'low' | 'ignore'

export interface FinancingLead {
  id: string
  company_name: string
  industry: Industry | null
  website: string | null
  phone: string | null
  email: string | null
  business_address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  owner_name: string | null
  owner_title: string | null
  owner_email: string | null
  owner_phone: string | null
  owner_linkedin: string | null
  source_url: string | null
  source_type: string | null
  date_found: string
  lead_score: number
  lead_priority: LeadPriority
  financing_category: FinancingCategory | null
  likely_reason: string | null
  suggested_outreach: string | null
  ai_summary: string | null
  estimated_capital_need: string | null
  contact_status: ContactStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LeadSignal {
  id: string
  lead_id: string
  signal_type: SignalType
  signal_description: string | null
  signal_data: Record<string, unknown> | null
  source_url: string | null
  score_contribution: number
  found_at: string
}

export interface UCCFiling {
  id: string
  lead_id: string | null
  filing_number: string | null
  filing_date: string | null
  filing_type: string | null
  filing_state: string
  debtor_name: string
  debtor_address: string | null
  debtor_city: string | null
  debtor_state: string | null
  debtor_zip: string | null
  secured_party_name: string | null
  secured_party_address: string | null
  collateral_description: string | null
  collateral_type: string | null
  source_url: string | null
  raw_data: Record<string, unknown> | null
  created_at: string
}

export interface HiringSignal {
  id: string
  lead_id: string | null
  company_name: string
  company_website: string | null
  job_title: string
  job_location: string | null
  job_state: string | null
  job_description: string | null
  job_url: string | null
  job_source: string | null
  job_category: string | null
  equipment_related: boolean
  posted_date: string | null
  found_at: string
  raw_data: Record<string, unknown> | null
}

export interface GovernmentContract {
  id: string
  lead_id: string | null
  contract_number: string | null
  award_date: string | null
  award_amount: number | null
  contract_description: string | null
  awardee_name: string
  awardee_address: string | null
  awardee_city: string | null
  awardee_state: string | null
  awarding_agency: string | null
  agency_type: string | null
  contract_type: string | null
  naics_code: string | null
  source_url: string | null
  source_type: string | null
  raw_data: Record<string, unknown> | null
  created_at: string
}

export interface EquipmentDealer {
  id: string
  dealer_name: string
  equipment_category: string | null
  website: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  contact_page_url: string | null
  sales_manager: string | null
  sales_manager_email: string | null
  sales_manager_phone: string | null
  finance_manager: string | null
  finance_manager_email: string | null
  finance_manager_phone: string | null
  linkedin_url: string | null
  source_url: string | null
  notes: string | null
  is_partner: boolean
  created_at: string
  updated_at: string
}

export interface ScraperJob {
  id: string
  scraper_type: string
  target_state: string | null
  target_params: Record<string, unknown> | null
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string | null
  completed_at: string | null
  leads_found: number
  signals_found: number
  error_message: string | null
  logs: Record<string, unknown> | null
  scheduled_for: string
  created_at: string
}

export interface DailyReport {
  id: string
  report_date: string
  total_leads_found: number
  hot_leads: number
  strong_leads: number
  top_25_leads: FinancingLead[] | null
  generated_at: string
}

export interface SharedFilter {
  id: string
  created_by: string | null
  name: string
  description: string | null
  filters: LeadFilters
  share_token: string
  is_active: boolean
  expires_at: string | null
  view_count: number
  last_viewed_at: string | null
  created_at: string
}

export interface LeadFilters {
  industry?: Industry[]
  state?: string[]
  financing_category?: FinancingCategory[]
  signal_type?: SignalType[]
  lead_priority?: LeadPriority[]
  contact_status?: ContactStatus[]
  min_score?: number
  max_score?: number
  date_from?: string
  date_to?: string
  search?: string
}

// Signal scoring configuration
export const SIGNAL_SCORES: Record<SignalType, number> = {
  ucc_filing: 30,
  ucc_multiple: 20,
  equipment_collateral: 25,
  hiring_equipment_roles: 20,
  multiple_job_postings: 15,
  government_contract: 30,
  expansion_language: 20,
  equipment_purchase: 25,
  dealer_relationship: 20,
  established_business: 10,
  contact_found: 10,
  website_found: 5,
  cashflow_pressure: 15,
  acquisition_signal: 25,
  fleet_growth: 25,
  permit_activity: 20,
  new_authority: 25,
}

// Equipment-related job titles for hiring signal classification
export const EQUIPMENT_JOB_TITLES = [
  'CDL Driver',
  'Truck Driver',
  'Equipment Operator',
  'Heavy Equipment Operator',
  'Field Technician',
  'HVAC Technician',
  'HVAC Installer',
  'Plumber',
  'Electrician',
  'Roofing Installer',
  'Roofing Crew',
  'Construction Laborer',
  'Concrete Finisher',
  'Landscape Crew',
  'Tree Crew',
  'Diesel Mechanic',
  'Fleet Mechanic',
  'Welder',
  'Fabricator',
  'Restoration Technician',
  'Delivery Driver',
  'Service Technician',
]

// Equipment purchase keywords
export const EQUIPMENT_KEYWORDS = [
  'new equipment',
  'new truck',
  'fleet expansion',
  'added another truck',
  'added another crew',
  'new trailer',
  'new excavator',
  'new skid steer',
  'new dump truck',
  'new service van',
  'new machinery',
  'upgraded equipment',
  'expanding fleet',
]

// Expansion keywords
export const EXPANSION_KEYWORDS = [
  'new location',
  'second location',
  'expanding into',
  'now serving',
  'growing our team',
  'opening soon',
  'franchise expansion',
  'new territory',
  'added crews',
  'increased capacity',
]

// Distress/cash flow keywords
export const DISTRESS_KEYWORDS = [
  'temporarily closed',
  'under new ownership',
  'seeking investors',
  'business for sale',
  'restructuring',
  'late payments',
  'payroll issues',
  'supply chain issues',
]

// Industry display labels
export const INDUSTRY_LABELS: Record<Industry, string> = {
  construction: 'Construction',
  roofing: 'Roofing',
  hvac: 'HVAC',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  concrete: 'Concrete',
  excavation: 'Excavation',
  landscaping: 'Landscaping',
  tree_service: 'Tree Service',
  restoration: 'Restoration',
  trucking: 'Trucking',
  logistics: 'Logistics',
  manufacturing: 'Manufacturing',
  welding_fabrication: 'Welding/Fabrication',
  agriculture: 'Agriculture',
  auto_repair: 'Auto Repair',
  collision_repair: 'Collision Repair',
  restaurant: 'Restaurant',
  medical_practice: 'Medical Practice',
  dental_practice: 'Dental Practice',
  med_spa: 'Med Spa',
  equipment_rental: 'Equipment Rental',
  waste_management: 'Waste Management',
  cleaning_janitorial: 'Cleaning/Janitorial',
  franchise: 'Franchise Business',
  ecommerce: 'E-commerce',
  retail: 'Retail',
  other: 'Other',
}

export const FINANCING_CATEGORY_LABELS: Record<FinancingCategory, string> = {
  equipment_financing: 'Equipment Financing',
  working_capital: 'Working Capital',
  sba_loan: 'SBA Loan',
  business_loc: 'Business Line of Credit',
  commercial_vehicle: 'Commercial Vehicle Financing',
  trucking_fleet: 'Trucking/Fleet Financing',
  construction_equipment: 'Construction Equipment Financing',
  inventory_financing: 'Inventory Financing',
  debt_consolidation: 'Debt Consolidation/Refinance',
  acquisition_financing: 'Business Acquisition Financing',
  expansion_capital: 'Expansion Capital',
  emergency_cashflow: 'Emergency Cash Flow Funding',
}

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: 'New',
  researching: 'Researching',
  contacted: 'Contacted',
  replied: 'Replied',
  interested: 'Interested',
  application_started: 'Application Started',
  approved: 'Approved',
  funded: 'Funded',
  not_a_fit: 'Not a Fit',
  follow_up_later: 'Follow Up Later',
}

export const PRIORITY_LABELS: Record<LeadPriority, string> = {
  hot: 'Hot Lead',
  strong: 'Strong Lead',
  possible: 'Possible Lead',
  low: 'Low Priority',
  ignore: 'Ignore',
}

export const PRIORITY_COLORS: Record<LeadPriority, string> = {
  hot: 'bg-red-500 text-white',
  strong: 'bg-orange-500 text-white',
  possible: 'bg-yellow-500 text-black',
  low: 'bg-gray-400 text-white',
  ignore: 'bg-gray-200 text-gray-600',
}
