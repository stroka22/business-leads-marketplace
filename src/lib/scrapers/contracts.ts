import { BaseScraper, sleep, supabaseAdmin } from './base'

interface ContractAward {
  contract_number?: string
  award_date?: string
  award_amount?: number
  contract_description?: string
  awardee_name: string
  awardee_address?: string
  awardee_city?: string
  awardee_state?: string
  awarding_agency?: string
  agency_type?: 'federal' | 'state' | 'county' | 'city' | 'school'
  contract_type?: string
  naics_code?: string
  source_url?: string
  source_type?: string
}

// NAICS codes that often indicate equipment/financing needs
const TARGET_NAICS_CODES = [
  '236', // Construction of Buildings
  '237', // Heavy and Civil Engineering Construction
  '238', // Specialty Trade Contractors
  '484', // Truck Transportation
  '492', // Couriers and Messengers
  '531', // Real Estate (construction-related)
  '541', // Professional Services
  '561', // Administrative Services
  '562', // Waste Management
  '811', // Repair and Maintenance
]

// Contract types that typically need capital
const HIGH_VALUE_CONTRACT_TYPES = [
  'construction',
  'renovation',
  'transportation',
  'maintenance',
  'infrastructure',
  'road',
  'building',
  'repair',
  'installation',
  'equipment',
]

export class GovernmentContractScraper extends BaseScraper {
  name = 'Government Contract Scraper'
  scrapeType = 'contracts'

  protected async execute(params?: Record<string, unknown>): Promise<void> {
    // Scrape SAM.gov for federal contracts
    await this.scrapeSAMGov(params)
    
    // Add state-specific scrapers as needed
    if (params?.state) {
      await this.scrapeStatePortal(params.state as string)
    }
  }

  private async scrapeSAMGov(params?: Record<string, unknown>): Promise<void> {
    this.log('Scraping SAM.gov for recent contract awards...')
    
    // SAM.gov has a public API for contract awards
    // https://api.sam.gov/opportunities/v2/search
    // Requires API key registration at https://sam.gov/content/entity-information/entity-information-api-documentation
    
    const apiKey = process.env.SAM_GOV_API_KEY
    
    if (!apiKey) {
      this.log('SAM.gov API key not configured. Set SAM_GOV_API_KEY environment variable.')
      this.log('Register for free at: https://sam.gov/content/opportunities-api')
      return
    }

    try {
      // Search for recent awards in target NAICS codes
      for (const naicsPrefix of TARGET_NAICS_CODES.slice(0, 5)) { // Limit for MVP
        await this.searchSAMContracts(apiKey, naicsPrefix, params?.state as string)
        await sleep(1000)
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      this.result.errors.push(`SAM.gov: ${errMsg}`)
    }
  }

  private async searchSAMContracts(
    apiKey: string, 
    naicsCode: string,
    state?: string
  ): Promise<void> {
    // SAM.gov Opportunities API endpoint
    const baseUrl = 'https://api.sam.gov/opportunities/v2/search'
    
    const params = new URLSearchParams({
      api_key: apiKey,
      naicsCode: naicsCode,
      postedFrom: this.getDateDaysAgo(30), // Last 30 days
      postedTo: this.getDateDaysAgo(0),
      limit: '100',
      ...(state && { state: state }),
    })

    try {
      const response = await this.fetch(`${baseUrl}?${params}`)
      
      if (!response.ok) {
        this.log(`SAM.gov returned ${response.status} for NAICS ${naicsCode}`)
        return
      }

      const data = await response.json()
      const opportunities = data.opportunitiesData || []
      
      this.log(`Found ${opportunities.length} opportunities for NAICS ${naicsCode}`)
      
      for (const opp of opportunities) {
        // Check if this is an award notice (not just a solicitation)
        if (opp.type === 'Award Notice' || opp.type === 'Award') {
          await this.processContractAward({
            contract_number: opp.solicitationNumber || opp.noticeId,
            award_date: opp.responseDate || opp.postedDate,
            award_amount: opp.award?.amount,
            contract_description: opp.title || opp.description,
            awardee_name: opp.award?.awardee?.name || opp.pointOfContact?.[0]?.name || 'Unknown',
            awardee_address: opp.award?.awardee?.location?.streetAddress,
            awardee_city: opp.award?.awardee?.location?.city,
            awardee_state: opp.award?.awardee?.location?.state || state,
            awarding_agency: opp.department || opp.fullParentPathName,
            agency_type: 'federal',
            contract_type: this.classifyContractType(opp.title || opp.description || ''),
            naics_code: naicsCode,
            source_url: `https://sam.gov/opp/${opp.noticeId}`,
            source_type: 'sam.gov',
          })
        }
      }
    } catch (error) {
      this.log(`Error fetching SAM.gov: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async scrapeStatePortal(state: string): Promise<void> {
    this.log(`Scraping state procurement portal for ${state}...`)
    
    // State portals vary widely - implement per state as needed
    // Common portals:
    // TX: https://www.txsmartbuy.com/
    // FL: https://www.dms.myflorida.com/business_operations/state_purchasing
    // CA: https://caleprocure.ca.gov/
    // NY: https://www.ogs.ny.gov/procurement
    
    // For MVP, just log that this would need state-specific implementation
    this.log(`State portal scraping for ${state} not implemented in MVP`)
  }

  private async processContractAward(contract: ContractAward): Promise<void> {
    // Save to government_contracts table
    const { error: contractError } = await supabaseAdmin
      .from('government_contracts')
      .upsert({
        contract_number: contract.contract_number || null,
        award_date: contract.award_date || null,
        award_amount: contract.award_amount || null,
        contract_description: contract.contract_description || null,
        awardee_name: contract.awardee_name,
        awardee_address: contract.awardee_address || null,
        awardee_city: contract.awardee_city || null,
        awardee_state: contract.awardee_state || null,
        awarding_agency: contract.awarding_agency || null,
        agency_type: contract.agency_type || null,
        contract_type: contract.contract_type || null,
        naics_code: contract.naics_code || null,
        source_url: contract.source_url || null,
        source_type: contract.source_type || null,
        raw_data: contract,
      }, {
        onConflict: 'contract_number,source_type',
        ignoreDuplicates: true,
      })

    if (contractError && contractError.code !== '23505') {
      this.log(`Failed to save contract: ${contractError.message}`)
      return
    }

    // Detect industry from contract description and NAICS
    const industry = this.detectIndustryFromNAICS(contract.naics_code) ||
                    this.detectIndustry(contract.contract_description || '')

    // Create or update financing lead
    const leadId = await this.upsertLead({
      company_name: contract.awardee_name,
      industry,
      business_address: contract.awardee_address,
      city: contract.awardee_city,
      state: contract.awardee_state,
      source_url: contract.source_url,
      source_type: 'government_contract',
    })

    if (!leadId) return

    // Link contract to lead
    await supabaseAdmin
      .from('government_contracts')
      .update({ lead_id: leadId })
      .eq('contract_number', contract.contract_number)
      .eq('source_type', contract.source_type)

    // Add signals
    const amountStr = contract.award_amount 
      ? `$${contract.award_amount.toLocaleString()}` 
      : 'undisclosed amount'
    
    await this.addSignal(leadId, {
      signal_type: 'government_contract',
      signal_description: `Awarded ${contract.agency_type} contract for ${amountStr}: ${contract.contract_description?.slice(0, 100)}`,
      signal_data: {
        contract_number: contract.contract_number,
        award_amount: contract.award_amount,
        awarding_agency: contract.awarding_agency,
        agency_type: contract.agency_type,
        contract_type: contract.contract_type,
      },
      source_url: contract.source_url,
    })
  }

  private classifyContractType(description: string): string | undefined {
    const lowered = description.toLowerCase()
    
    for (const type of HIGH_VALUE_CONTRACT_TYPES) {
      if (lowered.includes(type)) {
        return type
      }
    }
    
    return undefined
  }

  private detectIndustryFromNAICS(naicsCode?: string): ReturnType<typeof this.detectIndustry> {
    if (!naicsCode) return undefined
    
    const prefix = naicsCode.slice(0, 3)
    
    const naicsToIndustry: Record<string, ReturnType<typeof this.detectIndustry>> = {
      '236': 'construction',
      '237': 'construction',
      '238': 'construction',
      '484': 'trucking',
      '492': 'logistics',
      '562': 'waste_management',
      '811': 'auto_repair',
    }
    
    return naicsToIndustry[prefix]
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }
}

// Utility to import contract data from CSV
export async function importContractsFromCSV(contracts: ContractAward[]): Promise<void> {
  const scraper = new GovernmentContractScraper()
  
  for (const contract of contracts) {
    await (scraper as unknown as { processContractAward: (c: ContractAward) => Promise<void> }).processContractAward(contract)
  }
}
