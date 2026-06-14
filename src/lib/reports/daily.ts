#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { classifyLeadWithSignals } from '../ai/classify'
import type { FinancingLead, LeadSignal } from '@/types/financing'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface DailyReportLead {
  id: string
  company_name: string
  industry: string | null
  state: string | null
  lead_score: number
  lead_priority: string
  financing_category: string | null
  likely_reason: string | null
  suggested_outreach: string | null
  phone: string | null
  email: string | null
  website: string | null
  source_url: string | null
  signals: Array<{
    type: string
    description: string | null
  }>
}

async function generateDailyReport(): Promise<void> {
  console.log('='.repeat(60))
  console.log('Business Financing Lead Intelligence Engine')
  console.log('Daily Report Generator')
  console.log('='.repeat(60))
  console.log('')

  const today = new Date().toISOString().split('T')[0]
  console.log(`Generating report for: ${today}`)
  console.log('')

  // Get top 25 leads by score
  const { data: topLeads, error: leadsError } = await supabase
    .from('financing_leads')
    .select('*')
    .order('lead_score', { ascending: false })
    .limit(25)

  if (leadsError) {
    console.error('Error fetching leads:', leadsError)
    return
  }

  console.log(`Found ${topLeads?.length || 0} top leads`)

  // Get signals for each lead
  const reportLeads: DailyReportLead[] = []

  for (const lead of topLeads || []) {
    const { data: signals } = await supabase
      .from('lead_signals')
      .select('*')
      .eq('lead_id', lead.id)

    reportLeads.push({
      id: lead.id,
      company_name: lead.company_name,
      industry: lead.industry,
      state: lead.state,
      lead_score: lead.lead_score,
      lead_priority: lead.lead_priority,
      financing_category: lead.financing_category,
      likely_reason: lead.likely_reason,
      suggested_outreach: lead.suggested_outreach,
      phone: lead.phone,
      email: lead.email,
      website: lead.website,
      source_url: lead.source_url,
      signals: (signals || []).map(s => ({
        type: s.signal_type,
        description: s.signal_description,
      })),
    })
  }

  // Calculate stats
  const { data: statsData } = await supabase
    .from('financing_leads')
    .select('lead_priority')

  const stats = {
    total: statsData?.length || 0,
    hot: statsData?.filter(l => l.lead_priority === 'hot').length || 0,
    strong: statsData?.filter(l => l.lead_priority === 'strong').length || 0,
    possible: statsData?.filter(l => l.lead_priority === 'possible').length || 0,
  }

  // Save daily report
  const { error: reportError } = await supabase
    .from('daily_reports')
    .upsert({
      report_date: today,
      total_leads_found: stats.total,
      hot_leads: stats.hot,
      strong_leads: stats.strong,
      top_25_leads: reportLeads,
      generated_at: new Date().toISOString(),
    }, {
      onConflict: 'report_date',
    })

  if (reportError) {
    console.error('Error saving report:', reportError)
  }

  // Print report
  console.log('')
  console.log('='.repeat(60))
  console.log('DAILY FINANCING LEAD REPORT')
  console.log(`Date: ${today}`)
  console.log('='.repeat(60))
  console.log('')
  console.log('SUMMARY')
  console.log('-'.repeat(40))
  console.log(`Total Leads: ${stats.total}`)
  console.log(`Hot Leads (85+): ${stats.hot}`)
  console.log(`Strong Leads (70-84): ${stats.strong}`)
  console.log(`Possible Leads (50-69): ${stats.possible}`)
  console.log('')
  console.log('TOP 25 LEADS')
  console.log('-'.repeat(40))
  console.log('')

  for (let i = 0; i < reportLeads.length; i++) {
    const lead = reportLeads[i]
    console.log(`${i + 1}. ${lead.company_name}`)
    console.log(`   Score: ${lead.lead_score} (${lead.lead_priority.toUpperCase()})`)
    console.log(`   Location: ${lead.state || 'Unknown'}`)
    console.log(`   Industry: ${lead.industry || 'Unknown'}`)
    console.log(`   Financing Type: ${lead.financing_category || 'Unknown'}`)
    
    if (lead.likely_reason) {
      console.log(`   Why: ${lead.likely_reason}`)
    }
    
    if (lead.suggested_outreach) {
      console.log(`   Outreach: "${lead.suggested_outreach}"`)
    }
    
    console.log(`   Signals: ${lead.signals.map(s => s.type).join(', ')}`)
    
    const contact = [lead.phone, lead.email, lead.website].filter(Boolean).join(' | ')
    if (contact) {
      console.log(`   Contact: ${contact}`)
    }
    
    if (lead.source_url) {
      console.log(`   Source: ${lead.source_url}`)
    }
    
    console.log('')
  }

  console.log('='.repeat(60))
  console.log('Report saved to database.')
  console.log('View at: /financing')
  console.log('')
}

async function classifyUnclassifiedLeads(): Promise<void> {
  console.log('Checking for leads that need AI classification...')

  // Find leads without AI classification
  const { data: unclassified } = await supabase
    .from('financing_leads')
    .select('*')
    .is('financing_category', null)
    .gt('lead_score', 30) // Only classify leads with some signals
    .limit(20)

  if (!unclassified || unclassified.length === 0) {
    console.log('No leads need classification.')
    return
  }

  console.log(`Found ${unclassified.length} leads to classify...`)

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    console.log('OPENAI_API_KEY not set. Skipping AI classification.')
    return
  }

  for (const lead of unclassified) {
    try {
      // Get signals for this lead
      const { data: signals } = await supabase
        .from('lead_signals')
        .select('*')
        .eq('lead_id', lead.id)

      const classification = await classifyLeadWithSignals(
        lead as FinancingLead,
        (signals || []) as LeadSignal[]
      )

      await supabase
        .from('financing_leads')
        .update({
          financing_category: classification.financing_category,
          likely_reason: classification.likely_reason,
          suggested_outreach: classification.suggested_outreach,
          ai_summary: classification.ai_summary,
          estimated_capital_need: classification.estimated_capital_need,
        })
        .eq('id', lead.id)

      console.log(`  Classified: ${lead.company_name} -> ${classification.financing_category}`)
    } catch (error) {
      console.error(`  Failed to classify ${lead.company_name}:`, error)
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--classify')) {
    await classifyUnclassifiedLeads()
    console.log('')
  }

  await generateDailyReport()
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
