import { BaseScraper, sleep } from './base'
import { supabaseAdmin } from './base'

interface UCCRecord {
  filing_number: string
  filing_date: string
  filing_type: string
  debtor_name: string
  debtor_address?: string
  debtor_city?: string
  debtor_state?: string
  debtor_zip?: string
  secured_party_name?: string
  secured_party_address?: string
  collateral_description?: string
}

// State UCC search URLs (public data portals)
const STATE_UCC_SOURCES: Record<string, { url: string; type: 'api' | 'html' }> = {
  // These are public Secretary of State UCC search portals
  // Most require scraping HTML, some have APIs
  TX: { url: 'https://direct.sos.state.tx.us/UCC/search.asp', type: 'html' },
  FL: { url: 'https://ccfcorp.dos.state.fl.us/ucc/ucc_search.html', type: 'html' },
  CA: { url: 'https://bizfileonline.sos.ca.gov/search/ucc', type: 'html' },
  NY: { url: 'https://appext20.dos.ny.gov/pls/ucc_public/web_search.main_frame', type: 'html' },
  // Add more states as needed
}

// Known equipment lenders (secured parties) to watch for
const EQUIPMENT_LENDERS = [
  'cat financial',
  'caterpillar financial',
  'john deere financial',
  'de lage landen',
  'wells fargo equipment',
  'cit bank',
  'tcf equipment',
  'leaf commercial',
  'balboa capital',
  'currency capital',
  'beacon funding',
  'channel partners',
  'liberty capital',
  'marlin leasing',
  'navitas credit',
  'pawnee leasing',
  'signature financial',
  'taycor financial',
  'verdant commercial',
  'ascentium capital',
  'approve funding',
  'financial pacific',
  'direct capital',
  'currency',
  'quickbridge',
  'bluevine',
  'ondeck',
  'fundbox',
  'kabbage',
]

export class UCCScraper extends BaseScraper {
  name = 'UCC Filing Scraper'
  scrapeType = 'ucc'

  protected async execute(params?: Record<string, unknown>): Promise<void> {
    const targetState = params?.state as string
    
    if (targetState) {
      await this.scrapeState(targetState)
    } else {
      // Scrape all configured states
      for (const state of Object.keys(STATE_UCC_SOURCES)) {
        await this.scrapeState(state)
        await sleep(2000) // Delay between states
      }
    }
  }

  private async scrapeState(state: string): Promise<void> {
    this.log(`Scraping UCC filings for ${state}...`)
    
    const source = STATE_UCC_SOURCES[state]
    if (!source) {
      this.log(`No UCC source configured for ${state}`)
      return
    }

    // For MVP, we'll simulate with a demo data approach
    // In production, you'd implement proper scraping for each state portal
    // Many state portals require session handling, CAPTCHAs, etc.
    
    try {
      // Demo: Generate sample UCC data for testing
      // Replace this with actual scraping logic per state
      const sampleRecords = await this.fetchUCCRecords(state)
      
      for (const record of sampleRecords) {
        await this.processUCCRecord(record, state)
      }
      
      this.log(`Completed ${state}: processed ${sampleRecords.length} records`)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      this.result.errors.push(`${state}: ${errMsg}`)
      this.log(`Error scraping ${state}: ${errMsg}`)
    }
  }

  private async fetchUCCRecords(_state: string): Promise<UCCRecord[]> {
    // This is where you'd implement actual scraping
    // For now, returning empty array - implement per state
    
    // Example implementation for a state with API access:
    // const response = await this.fetch(`https://api.example.com/ucc?state=${state}`)
    // return response.json()
    
    // Example implementation for HTML scraping:
    // const response = await this.fetch(STATE_UCC_SOURCES[state].url)
    // const html = await response.text()
    // const $ = cheerio.load(html)
    // Parse and return records
    
    this.log(`Note: UCC scraping requires state-specific implementation. Checking for existing data...`)
    return []
  }

  private async processUCCRecord(record: UCCRecord, sourceState: string): Promise<void> {
    // Check if equipment-related based on collateral or secured party
    const isEquipmentRelated = this.isEquipmentRelated(record)
    const collateralType = this.classifyCollateralType(record.collateral_description || '')
    
    // Save to ucc_filings table
    const { data: filing, error: filingError } = await supabaseAdmin
      .from('ucc_filings')
      .upsert({
        filing_number: record.filing_number,
        filing_date: record.filing_date || null,
        filing_type: record.filing_type || 'UCC-1',
        filing_state: sourceState,
        debtor_name: record.debtor_name,
        debtor_address: record.debtor_address || null,
        debtor_city: record.debtor_city || null,
        debtor_state: record.debtor_state || sourceState,
        debtor_zip: record.debtor_zip || null,
        secured_party_name: record.secured_party_name || null,
        secured_party_address: record.secured_party_address || null,
        collateral_description: record.collateral_description || null,
        collateral_type: collateralType || null,
        source_url: STATE_UCC_SOURCES[sourceState]?.url,
        raw_data: record,
      }, {
        onConflict: 'filing_number,filing_state',
        ignoreDuplicates: true,
      })
      .select('id')
      .single()

    if (filingError && filingError.code !== '23505') {
      this.log(`Failed to save UCC filing: ${filingError.message}`)
      return
    }

    // Create or update financing lead
    const industry = this.detectIndustry(
      `${record.debtor_name} ${record.collateral_description || ''}`
    )

    const leadId = await this.upsertLead({
      company_name: record.debtor_name,
      industry,
      business_address: record.debtor_address,
      city: record.debtor_city,
      state: record.debtor_state || sourceState,
      zip_code: record.debtor_zip,
      source_url: STATE_UCC_SOURCES[sourceState]?.url,
      source_type: 'ucc_filing',
    })

    if (!leadId) return

    // Link UCC filing to lead
    if (filing?.id) {
      await supabaseAdmin
        .from('ucc_filings')
        .update({ lead_id: leadId })
        .eq('id', filing.id)
    }

    // Add signals
    await this.addSignal(leadId, {
      signal_type: 'ucc_filing',
      signal_description: `UCC filing ${record.filing_number} dated ${record.filing_date}`,
      signal_data: {
        filing_number: record.filing_number,
        filing_date: record.filing_date,
        secured_party: record.secured_party_name,
      },
      source_url: STATE_UCC_SOURCES[sourceState]?.url,
    })

    if (isEquipmentRelated) {
      await this.addSignal(leadId, {
        signal_type: 'equipment_collateral',
        signal_description: `Collateral: ${record.collateral_description?.slice(0, 200)}`,
        signal_data: {
          collateral_type: collateralType,
          collateral_description: record.collateral_description,
        },
        source_url: STATE_UCC_SOURCES[sourceState]?.url,
      })
    }

    // Check for multiple filings (requires separate query)
    await this.checkMultipleFilings(leadId, record.debtor_name, sourceState)
  }

  private isEquipmentRelated(record: UCCRecord): boolean {
    const collateral = (record.collateral_description || '').toLowerCase()
    const securedParty = (record.secured_party_name || '').toLowerCase()
    
    // Check if secured party is a known equipment lender
    for (const lender of EQUIPMENT_LENDERS) {
      if (securedParty.includes(lender)) {
        return true
      }
    }
    
    // Check collateral description for equipment keywords
    const equipmentKeywords = [
      'equipment', 'vehicle', 'truck', 'trailer', 'machinery',
      'tool', 'excavator', 'loader', 'forklift', 'tractor',
      'fleet', 'van', 'crane', 'bulldozer', 'backhoe',
    ]
    
    for (const keyword of equipmentKeywords) {
      if (collateral.includes(keyword)) {
        return true
      }
    }
    
    return false
  }

  private async checkMultipleFilings(
    leadId: string, 
    debtorName: string, 
    state: string
  ): Promise<void> {
    const { data: filings } = await supabaseAdmin
      .from('ucc_filings')
      .select('id')
      .eq('debtor_name', debtorName)
      .eq('filing_state', state)

    if (filings && filings.length > 1) {
      await this.addSignal(leadId, {
        signal_type: 'ucc_multiple',
        signal_description: `${filings.length} UCC filings found for this company`,
        signal_data: { filing_count: filings.length },
      })
    }
  }
}

// For importing UCC data from CSV or other sources
export async function importUCCFromCSV(records: UCCRecord[], state: string): Promise<void> {
  const scraper = new UCCScraper()
  
  for (const record of records) {
    await (scraper as unknown as { processUCCRecord: (r: UCCRecord, s: string) => Promise<void> }).processUCCRecord(record, state)
  }
}
