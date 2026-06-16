#!/usr/bin/env npx tsx
/**
 * CSV Import Script for Lead Data
 * 
 * Usage:
 *   npx tsx src/lib/scrapers/import-csv.ts <type> <file.csv>
 * 
 * Types:
 *   ucc       - UCC filings (debtor_name, secured_party, filing_number, filing_date, collateral_description, state)
 *   contracts - Government contracts (awardee_name, contract_number, award_amount, award_date, description, state)
 *   hiring    - Job postings (company_name, job_title, location, posted_date, job_url)
 * 
 * Example:
 *   npx tsx src/lib/scrapers/import-csv.ts ucc texas-ucc-filings.csv
 */

import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import { getSupabaseAdmin } from './base'
import type { Industry } from '@/types/financing'

const EQUIPMENT_KEYWORDS = [
  'equipment', 'machinery', 'vehicle', 'truck', 'trailer', 'tractor',
  'excavator', 'loader', 'forklift', 'crane', 'hvac', 'generator',
  'compressor', 'welder', 'pump', 'motor', 'engine', 'fleet'
]

const EQUIPMENT_LENDERS = [
  'caterpillar', 'deere', 'kubota', 'case', 'komatsu', 'volvo',
  'paccar', 'daimler', 'navistar', 'terex', 'jcb', 'bobcat',
  'wells fargo equipment', 'de lage landen', 'cit', 'tcf equipment',
  'balboa capital', 'currency capital', 'taycor', 'beacon funding'
]

function detectIndustry(text: string): Industry {
  const lower = text.toLowerCase()
  if (/roofing/i.test(lower)) return 'roofing'
  if (/hvac|heating|cooling|air\s*condition/i.test(lower)) return 'hvac'
  if (/plumb/i.test(lower)) return 'plumbing'
  if (/electric/i.test(lower)) return 'electrical'
  if (/construct|build|contract/i.test(lower)) return 'construction'
  if (/truck|cdl|driver|freight/i.test(lower)) return 'trucking'
  if (/logistic|transport|fleet/i.test(lower)) return 'logistics'
  if (/manufact|machine|industrial|fabricat/i.test(lower)) return 'manufacturing'
  if (/weld/i.test(lower)) return 'welding_fabrication'
  if (/medical|health|clinic|hospital/i.test(lower)) return 'medical_practice'
  if (/dental/i.test(lower)) return 'dental_practice'
  if (/restaurant|food|catering|kitchen/i.test(lower)) return 'restaurant'
  if (/farm|agricult|ranch|crop/i.test(lower)) return 'agriculture'
  if (/retail|store|shop|merchant/i.test(lower)) return 'retail'
  if (/auto\s*repair|mechanic/i.test(lower)) return 'auto_repair'
  if (/landscap/i.test(lower)) return 'landscaping'
  if (/tree\s*service/i.test(lower)) return 'tree_service'
  if (/excavat/i.test(lower)) return 'excavation'
  if (/concrete/i.test(lower)) return 'concrete'
  return 'other'
}

function isEquipmentRelated(text: string): boolean {
  const lower = text.toLowerCase()
  return EQUIPMENT_KEYWORDS.some(kw => lower.includes(kw))
}

function isEquipmentLender(name: string): boolean {
  const lower = name.toLowerCase()
  return EQUIPMENT_LENDERS.some(lender => lower.includes(lender))
}

interface UCCRecord {
  debtor_name: string
  secured_party: string
  filing_number: string
  filing_date: string
  collateral_description?: string
  state: string
  debtor_address?: string
  debtor_city?: string
}

interface ContractRecord {
  awardee_name: string
  contract_number: string
  award_amount: string
  award_date: string
  description: string
  state: string
  agency?: string
  naics_code?: string
}

interface HiringRecord {
  company_name: string
  job_title: string
  location: string
  posted_date: string
  job_url?: string
  salary_min?: string
  salary_max?: string
}

async function importUCC(filePath: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const records: UCCRecord[] = []
  
  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, trim: true })
  )
  
  for await (const record of parser) {
    records.push(record as UCCRecord)
  }
  
  console.log(`Parsed ${records.length} UCC records`)
  
  let imported = 0
  let skipped = 0
  
  for (const record of records) {
    // Check if equipment-related
    const collateral = record.collateral_description || ''
    const isEquipment = isEquipmentRelated(collateral) || isEquipmentLender(record.secured_party)
    
    if (!isEquipment) {
      skipped++
      continue
    }
    
    // Find or create lead
    const { data: existingLead } = await supabase
      .from('financing_leads')
      .select('id')
      .eq('company_name', record.debtor_name)
      .eq('state', record.state)
      .single()
    
    let leadId: string
    
    if (existingLead) {
      leadId = existingLead.id
    } else {
      const { data: newLead, error } = await supabase
        .from('financing_leads')
        .insert({
          company_name: record.debtor_name,
          state: record.state,
          city: record.debtor_city,
          address: record.debtor_address,
          industry: detectIndustry(collateral),
          source: 'csv_import',
          status: 'new',
        })
        .select('id')
        .single()
      
      if (error || !newLead) {
        console.error(`Failed to create lead for ${record.debtor_name}:`, error)
        continue
      }
      leadId = newLead.id
    }
    
    // Insert UCC filing
    const { error: uccError } = await supabase
      .from('ucc_filings')
      .upsert({
        lead_id: leadId,
        filing_number: record.filing_number,
        filing_date: record.filing_date,
        filing_state: record.state,
        debtor_name: record.debtor_name,
        secured_party: record.secured_party,
        collateral_description: collateral,
        is_equipment_related: true,
        is_equipment_lender: isEquipmentLender(record.secured_party),
      }, { onConflict: 'filing_number' })
    
    if (uccError) {
      console.error(`Failed to insert UCC filing ${record.filing_number}:`, uccError)
      continue
    }
    
    // Add signal
    await supabase.from('lead_signals').insert({
      lead_id: leadId,
      signal_type: 'ucc_filing',
      signal_date: record.filing_date,
      signal_strength: isEquipmentLender(record.secured_party) ? 85 : 70,
      source_type: 'csv_import',
      raw_data: record,
    })
    
    imported++
    if (imported % 100 === 0) {
      console.log(`Imported ${imported} UCC filings...`)
    }
  }
  
  console.log(`\nUCC Import Complete:`)
  console.log(`  Imported: ${imported}`)
  console.log(`  Skipped (non-equipment): ${skipped}`)
}

async function importContracts(filePath: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const records: ContractRecord[] = []
  
  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, trim: true })
  )
  
  for await (const record of parser) {
    records.push(record as ContractRecord)
  }
  
  console.log(`Parsed ${records.length} contract records`)
  
  let imported = 0
  
  for (const record of records) {
    // Find or create lead
    const { data: existingLead } = await supabase
      .from('financing_leads')
      .select('id')
      .eq('company_name', record.awardee_name)
      .single()
    
    let leadId: string
    
    if (existingLead) {
      leadId = existingLead.id
    } else {
      const { data: newLead, error } = await supabase
        .from('financing_leads')
        .insert({
          company_name: record.awardee_name,
          state: record.state,
          industry: detectIndustry(record.description),
          source: 'csv_import',
          status: 'new',
        })
        .select('id')
        .single()
      
      if (error || !newLead) {
        console.error(`Failed to create lead for ${record.awardee_name}:`, error)
        continue
      }
      leadId = newLead.id
    }
    
    // Insert contract
    const amount = parseFloat(record.award_amount.replace(/[^0-9.]/g, '')) || 0
    
    const { error: contractError } = await supabase
      .from('government_contracts')
      .upsert({
        lead_id: leadId,
        contract_number: record.contract_number,
        award_date: record.award_date,
        award_amount: amount,
        contract_description: record.description,
        awarding_agency: record.agency,
        agency_type: 'federal',
        naics_code: record.naics_code,
        source_type: 'csv_import',
      }, { onConflict: 'contract_number' })
    
    if (contractError) {
      console.error(`Failed to insert contract ${record.contract_number}:`, contractError)
      continue
    }
    
    // Add signal
    const signalStrength = amount > 1000000 ? 90 : amount > 500000 ? 80 : amount > 100000 ? 70 : 60
    
    await supabase.from('lead_signals').insert({
      lead_id: leadId,
      signal_type: 'government_contract',
      signal_date: record.award_date,
      signal_strength: signalStrength,
      source_type: 'csv_import',
      raw_data: record,
    })
    
    imported++
    if (imported % 100 === 0) {
      console.log(`Imported ${imported} contracts...`)
    }
  }
  
  console.log(`\nContract Import Complete: ${imported} records`)
}

async function importHiring(filePath: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const records: HiringRecord[] = []
  
  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, trim: true })
  )
  
  for await (const record of parser) {
    records.push(record as HiringRecord)
  }
  
  console.log(`Parsed ${records.length} hiring records`)
  
  // Filter for equipment-related jobs
  const equipmentJobs = records.filter(r => isEquipmentRelated(r.job_title))
  console.log(`Found ${equipmentJobs.length} equipment-related jobs`)
  
  let imported = 0
  
  for (const record of equipmentJobs) {
    // Parse location
    const [city, state] = record.location.split(',').map(s => s.trim())
    
    // Find or create lead
    const { data: existingLead } = await supabase
      .from('financing_leads')
      .select('id')
      .eq('company_name', record.company_name)
      .single()
    
    let leadId: string
    
    if (existingLead) {
      leadId = existingLead.id
    } else {
      const { data: newLead, error } = await supabase
        .from('financing_leads')
        .insert({
          company_name: record.company_name,
          state: state,
          city: city,
          industry: detectIndustry(record.job_title),
          source: 'csv_import',
          status: 'new',
        })
        .select('id')
        .single()
      
      if (error || !newLead) {
        console.error(`Failed to create lead for ${record.company_name}:`, error)
        continue
      }
      leadId = newLead.id
    }
    
    // Insert hiring signal
    const { error: hiringError } = await supabase
      .from('hiring_signals')
      .insert({
        lead_id: leadId,
        job_title: record.job_title,
        job_url: record.job_url,
        posted_date: record.posted_date,
        location: record.location,
        salary_min: record.salary_min ? parseFloat(record.salary_min) : null,
        salary_max: record.salary_max ? parseFloat(record.salary_max) : null,
        is_equipment_role: true,
        source_type: 'csv_import',
      })
    
    if (hiringError) {
      console.error(`Failed to insert hiring signal:`, hiringError)
      continue
    }
    
    // Add signal
    await supabase.from('lead_signals').insert({
      lead_id: leadId,
      signal_type: 'hiring',
      signal_date: record.posted_date,
      signal_strength: 75,
      source_type: 'csv_import',
      raw_data: record,
    })
    
    imported++
  }
  
  console.log(`\nHiring Import Complete: ${imported} records`)
}

async function main() {
  const [, , type, filePath] = process.argv
  
  if (!type || !filePath) {
    console.log(`
CSV Import Tool for Business Financing Lead Intelligence Engine

Usage:
  npx tsx src/lib/scrapers/import-csv.ts <type> <file.csv>

Types:
  ucc       - UCC filings
  contracts - Government contracts  
  hiring    - Job postings

Required CSV columns by type:

UCC:
  debtor_name, secured_party, filing_number, filing_date, state
  Optional: collateral_description, debtor_address, debtor_city

Contracts:
  awardee_name, contract_number, award_amount, award_date, description, state
  Optional: agency, naics_code

Hiring:
  company_name, job_title, location, posted_date
  Optional: job_url, salary_min, salary_max
`)
    process.exit(1)
  }
  
  console.log(`\nImporting ${type} data from ${filePath}...\n`)
  
  switch (type) {
    case 'ucc':
      await importUCC(filePath)
      break
    case 'contracts':
      await importContracts(filePath)
      break
    case 'hiring':
      await importHiring(filePath)
      break
    default:
      console.error(`Unknown type: ${type}`)
      process.exit(1)
  }
}

main().catch(console.error)
