import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use service role key for API endpoints (bypasses RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase credentials')
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

const ALLOWED_ORIGINS = [
  'https://getmybizloan.com',
  'https://www.getmybizloan.com',
  'http://localhost:3000',
  'http://localhost:3001',
]

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  
  return headers
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  try {
    const data = await request.json()
    const supabase = getSupabaseAdmin()

    // Map common fields to actual table columns
    const lead = {
      company_name: data.company_name || data.companyName,
      owner_name: data.contact_name || data.contactName || data.owner_name,
      email: data.email,
      phone: data.phone,
      state: data.state,
      city: data.city,
      industry: detectIndustry(data.loan_purpose || data.purpose),
      source_type: data.source || 'web_capture',
      lead_score: calculateInitialScore(data),
      contact_status: 'new',
      // New structured fields
      loan_amount_requested: parseLoanAmount(data.loan_amount),
      loan_purpose: data.loan_purpose || data.purpose,
      time_in_business: data.time_in_business,
      monthly_revenue: data.monthly_revenue,
      credit_score_range: data.credit_score,
      urgency: data.urgency,
      has_collateral: data.has_collateral === 'yes' || data.has_collateral === true,
      lead_source: data.source,
      calculator_type: data.calculator_data?.type || data.calculatorType,
      qualified_products: data.qualified_products,
      notes: buildNotes(data),
    }

    // Insert the lead
    const { data: newLead, error } = await supabase
      .from('financing_leads')
      .insert(lead)
      .select()
      .single()

    if (error) {
      console.error('Lead capture error:', error)
      return NextResponse.json(
        { error: 'Failed to capture lead' },
        { status: 500, headers: getCorsHeaders(origin) }
      )
    }

    // Add a signal for web capture
    await supabase.from('lead_signals').insert({
      lead_id: newLead.id,
      signal_type: 'contact_found',
      found_at: new Date().toISOString(),
      score_contribution: 70,
      signal_data: data,
    })

    return NextResponse.json(
      { success: true, lead_id: newLead.id },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}

function parseLoanAmount(amount: unknown): number | null {
  if (!amount) return null
  if (typeof amount === 'number') return amount
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^0-9.]/g, '')
    return cleaned ? parseFloat(cleaned) : null
  }
  return null
}

function detectIndustry(purpose: string): string {
  if (!purpose) return 'other'
  const p = purpose.toLowerCase()
  if (p.includes('equipment') || p.includes('machinery')) return 'manufacturing'
  if (p.includes('vehicle') || p.includes('truck') || p.includes('fleet')) return 'trucking'
  if (p.includes('real_estate') || p.includes('property')) return 'construction'
  if (p.includes('restaurant') || p.includes('food')) return 'restaurant'
  return 'other'
}

function calculateInitialScore(data: Record<string, string>): number {
  let score = 50 // Base score for web leads

  // Time in business
  if (data.time_in_business === '5yr_plus') score += 20
  else if (data.time_in_business === '2yr_5yr') score += 15
  else if (data.time_in_business === '1yr_2yr') score += 10
  else if (data.time_in_business === '6mo_1yr') score += 5

  // Revenue
  if (data.monthly_revenue === '500k_plus') score += 15
  else if (data.monthly_revenue === '250k_500k') score += 12
  else if (data.monthly_revenue === '100k_250k') score += 10
  else if (data.monthly_revenue === '50k_100k') score += 7
  else if (data.monthly_revenue === '25k_50k') score += 5

  // Credit
  if (data.credit_score === 'excellent') score += 10
  else if (data.credit_score === 'good') score += 7
  else if (data.credit_score === 'fair') score += 3

  // Urgency (higher urgency = more motivated)
  if (data.urgency === 'asap') score += 5
  else if (data.urgency === '1_week') score += 3

  return Math.min(100, score)
}

function buildNotes(data: Record<string, string>): string {
  const notes: string[] = []
  
  if (data.source) notes.push(`Source: ${data.source}`)
  if (data.loan_purpose || data.purpose) notes.push(`Purpose: ${data.loan_purpose || data.purpose}`)
  if (data.loan_amount || data.amount) notes.push(`Amount requested: $${parseInt(data.loan_amount || data.amount || '0').toLocaleString()}`)
  if (data.time_in_business) notes.push(`Time in business: ${data.time_in_business}`)
  if (data.monthly_revenue) notes.push(`Monthly revenue: ${data.monthly_revenue}`)
  if (data.credit_score) notes.push(`Credit score: ${data.credit_score}`)
  if (data.urgency) notes.push(`Urgency: ${data.urgency}`)
  if (data.has_collateral) notes.push(`Has collateral: ${data.has_collateral}`)
  if (data.qualified_products) notes.push(`Qualified products: ${Array.isArray(data.qualified_products) ? data.qualified_products.join(', ') : data.qualified_products}`)
  
  return notes.join('\n')
}
