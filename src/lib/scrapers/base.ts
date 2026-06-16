import { createClient, SupabaseClient } from '@supabase/supabase-js'
import PQueue from 'p-queue'
import type { 
  SignalType, 
  Industry,
} from '@/types/financing'

// Lazy-initialized admin client for scrapers (bypasses RLS)
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }
    
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  }
  return _supabaseAdmin
}

// For backwards compatibility
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseAdmin() as Record<string, unknown>)[prop as string]
  }
})

// Rate limiting queue - max 2 concurrent requests, 500ms between
export const fetchQueue = new PQueue({ concurrency: 2, interval: 500, intervalCap: 1 })

export interface ScraperResult {
  leadsFound: number
  signalsFound: number
  errors: string[]
}

export interface RawLeadData {
  company_name: string
  industry?: Industry
  website?: string
  phone?: string
  email?: string
  business_address?: string
  city?: string
  state?: string
  zip_code?: string
  owner_name?: string
  owner_title?: string
  owner_email?: string
  owner_phone?: string
  owner_linkedin?: string
  source_url?: string
  source_type?: string
}

export interface RawSignalData {
  signal_type: SignalType
  signal_description?: string
  signal_data?: Record<string, unknown>
  source_url?: string
}

export abstract class BaseScraper {
  protected jobId: string | null = null
  protected result: ScraperResult = { leadsFound: 0, signalsFound: 0, errors: [] }

  abstract name: string
  abstract scrapeType: string

  async run(params?: Record<string, unknown>): Promise<ScraperResult> {
    // Create job record
    const { data: job, error: jobError } = await supabaseAdmin
      .from('scraper_jobs')
      .insert({
        scraper_type: this.scrapeType,
        target_state: params?.state as string || null,
        target_params: params || null,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (jobError) {
      console.error('Failed to create scraper job:', jobError)
    } else {
      this.jobId = job.id
    }

    try {
      await this.execute(params)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      this.result.errors.push(errMsg)
      console.error(`Scraper ${this.name} failed:`, error)
    }

    // Update job record
    if (this.jobId) {
      await supabaseAdmin
        .from('scraper_jobs')
        .update({
          status: this.result.errors.length > 0 ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          leads_found: this.result.leadsFound,
          signals_found: this.result.signalsFound,
          error_message: this.result.errors.join('; ') || null,
        })
        .eq('id', this.jobId)
    }

    return this.result
  }

  protected abstract execute(params?: Record<string, unknown>): Promise<void>

  protected async upsertLead(data: RawLeadData): Promise<string | null> {
    const { data: lead, error } = await supabaseAdmin
      .from('financing_leads')
      .upsert({
        company_name: data.company_name,
        industry: data.industry || null,
        website: data.website || null,
        phone: data.phone || null,
        email: data.email || null,
        business_address: data.business_address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
        owner_name: data.owner_name || null,
        owner_title: data.owner_title || null,
        owner_email: data.owner_email || null,
        owner_phone: data.owner_phone || null,
        owner_linkedin: data.owner_linkedin || null,
        source_url: data.source_url || null,
        source_type: data.source_type || this.scrapeType,
      }, {
        onConflict: 'company_name,state',
        ignoreDuplicates: false,
      })
      .select('id')
      .single()

    if (error) {
      // Try to get existing lead if upsert conflict
      if (error.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('financing_leads')
          .select('id')
          .eq('company_name', data.company_name)
          .eq('state', data.state || '')
          .single()
        return existing?.id || null
      }
      console.error('Failed to upsert lead:', error)
      this.result.errors.push(`Failed to upsert lead ${data.company_name}: ${error.message}`)
      return null
    }

    this.result.leadsFound++
    return lead.id
  }

  protected async addSignal(leadId: string, signal: RawSignalData): Promise<boolean> {
    // Get base score for signal type
    const { data: signalType } = await supabaseAdmin
      .from('signal_types')
      .select('base_score')
      .eq('id', signal.signal_type)
      .single()

    const scoreContribution = signalType?.base_score || 0

    const { error } = await supabaseAdmin
      .from('lead_signals')
      .upsert({
        lead_id: leadId,
        signal_type: signal.signal_type,
        signal_description: signal.signal_description || null,
        signal_data: signal.signal_data || null,
        source_url: signal.source_url || null,
        score_contribution: scoreContribution,
      }, {
        onConflict: 'lead_id,signal_type,source_url',
        ignoreDuplicates: true,
      })

    if (error) {
      console.error('Failed to add signal:', error)
      return false
    }

    this.result.signalsFound++
    return true
  }

  protected async fetch(url: string, options?: RequestInit): Promise<Response> {
    return fetchQueue.add(async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          ...options?.headers,
        },
      })
      return response
    }) as Promise<Response>
  }

  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`)
  }

  protected detectIndustry(text: string): Industry | undefined {
    const lowered = text.toLowerCase()
    
    const patterns: [RegExp, Industry][] = [
      [/\b(hvac|heating|cooling|air condition)/i, 'hvac'],
      [/\b(plumb)/i, 'plumbing'],
      [/\b(electric)/i, 'electrical'],
      [/\b(roof)/i, 'roofing'],
      [/\b(concrete|cement)/i, 'concrete'],
      [/\b(excavat|earthwork|grading)/i, 'excavation'],
      [/\b(landscap|lawn)/i, 'landscaping'],
      [/\b(tree\s*(service|care|trim|remov))/i, 'tree_service'],
      [/\b(restor|water damage|fire damage|mold)/i, 'restoration'],
      [/\b(truck|transport|freight|hauling|cdl)/i, 'trucking'],
      [/\b(logistic|warehouse|distribution)/i, 'logistics'],
      [/\b(manufactur|factory|production)/i, 'manufacturing'],
      [/\b(weld|fabricat)/i, 'welding_fabrication'],
      [/\b(farm|agricult|ranch)/i, 'agriculture'],
      [/\b(auto\s*repair|mechanic|garage)/i, 'auto_repair'],
      [/\b(collision|body\s*shop)/i, 'collision_repair'],
      [/\b(restaurant|food\s*service|cafe|diner)/i, 'restaurant'],
      [/\b(medical|clinic|physician|doctor)/i, 'medical_practice'],
      [/\b(dental|dentist)/i, 'dental_practice'],
      [/\b(med\s*spa|aesthetic|cosmetic)/i, 'med_spa'],
      [/\b(equipment\s*rental|rent.*equipment)/i, 'equipment_rental'],
      [/\b(waste|garbage|trash|disposal)/i, 'waste_management'],
      [/\b(clean|janitor)/i, 'cleaning_janitorial'],
      [/\b(franchise)/i, 'franchise'],
      [/\b(ecommerce|online\s*store)/i, 'ecommerce'],
      [/\b(retail|store|shop)/i, 'retail'],
      [/\b(construct|build|contractor|general\s*contractor)/i, 'construction'],
    ]

    for (const [pattern, industry] of patterns) {
      if (pattern.test(lowered)) {
        return industry
      }
    }

    return undefined
  }

  protected classifyCollateralType(description: string): string | undefined {
    const lowered = description.toLowerCase()
    
    if (/\b(truck|vehicle|trailer|van|fleet|automobile|car)/i.test(lowered)) {
      return 'vehicles'
    }
    if (/\b(equipment|machine|machinery|tool)/i.test(lowered)) {
      return 'equipment'
    }
    if (/\b(inventory|stock|merchandise)/i.test(lowered)) {
      return 'inventory'
    }
    if (/\b(account.*receiv|a\/r)/i.test(lowered)) {
      return 'accounts_receivable'
    }
    if (/\b(all\s*assets|business\s*assets)/i.test(lowered)) {
      return 'all_assets'
    }
    
    return undefined
  }
}

// Utility to wait
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
