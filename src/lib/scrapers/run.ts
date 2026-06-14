#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { UCCScraper } from './ucc'
import { HiringScraper } from './hiring'
import { GovernmentContractScraper } from './contracts'

const scrapers = {
  ucc: UCCScraper,
  hiring: HiringScraper,
  contracts: GovernmentContractScraper,
}

type ScraperType = keyof typeof scrapers | 'all'

async function main() {
  const args = process.argv.slice(2)
  const scraperType = args[0] as ScraperType | undefined
  const state = args[1]

  console.log('='.repeat(60))
  console.log('Business Financing Lead Intelligence Engine')
  console.log('Scraper Runner')
  console.log('='.repeat(60))
  console.log('')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing required environment variables.')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    console.error('')
    console.error('Create a .env.local file with these values.')
    process.exit(1)
  }

  const params: Record<string, unknown> = {}
  if (state) {
    params.state = state.toUpperCase()
  }

  if (scraperType && scraperType !== 'all' && scrapers[scraperType]) {
    // Run specific scraper
    console.log(`Running ${scraperType} scraper...`)
    if (state) console.log(`Target state: ${state.toUpperCase()}`)
    console.log('')

    const ScraperClass = scrapers[scraperType]
    const scraper = new ScraperClass()
    const result = await scraper.run(params)

    console.log('')
    console.log('-'.repeat(40))
    console.log('Results:')
    console.log(`  Leads found: ${result.leadsFound}`)
    console.log(`  Signals found: ${result.signalsFound}`)
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`)
      result.errors.forEach(e => console.log(`    - ${e}`))
    }
  } else if (scraperType === 'all' || !scraperType) {
    // Run all scrapers
    console.log('Running all scrapers...')
    if (state) console.log(`Target state: ${state.toUpperCase()}`)
    console.log('')

    const results: Record<string, { leadsFound: number; signalsFound: number; errors: string[] }> = {}

    for (const [type, ScraperClass] of Object.entries(scrapers)) {
      console.log(`\n--- ${type.toUpperCase()} ---`)
      const scraper = new ScraperClass()
      results[type] = await scraper.run(params)
    }

    console.log('')
    console.log('='.repeat(60))
    console.log('Summary:')
    console.log('-'.repeat(40))

    let totalLeads = 0
    let totalSignals = 0
    let totalErrors = 0

    for (const [type, result] of Object.entries(results)) {
      console.log(`${type}:`)
      console.log(`  Leads: ${result.leadsFound}, Signals: ${result.signalsFound}, Errors: ${result.errors.length}`)
      totalLeads += result.leadsFound
      totalSignals += result.signalsFound
      totalErrors += result.errors.length
    }

    console.log('-'.repeat(40))
    console.log(`Total: ${totalLeads} leads, ${totalSignals} signals, ${totalErrors} errors`)
  } else {
    console.log('Usage: npm run scrape [scraper_type] [state]')
    console.log('')
    console.log('Available scrapers:')
    console.log('  ucc       - UCC filing scraper')
    console.log('  hiring    - Job posting scraper (Indeed, etc.)')
    console.log('  contracts - Government contract scraper (SAM.gov, etc.)')
    console.log('  all       - Run all scrapers (default)')
    console.log('')
    console.log('Examples:')
    console.log('  npm run scrape                # Run all scrapers')
    console.log('  npm run scrape ucc            # Run UCC scraper for all states')
    console.log('  npm run scrape ucc TX         # Run UCC scraper for Texas only')
    console.log('  npm run scrape hiring CA      # Run hiring scraper for California')
    console.log('')
    console.log('Environment variables needed:')
    console.log('  NEXT_PUBLIC_SUPABASE_URL      - Supabase project URL')
    console.log('  SUPABASE_SERVICE_ROLE_KEY     - Supabase service role key')
    console.log('  OPENAI_API_KEY                - OpenAI API key (for classification)')
    console.log('  SAM_GOV_API_KEY               - SAM.gov API key (for contracts)')
    process.exit(1)
  }

  console.log('')
  console.log('Done!')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
