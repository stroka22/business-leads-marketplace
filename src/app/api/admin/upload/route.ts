import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'
import { LeadCsvSchema } from '@/lib/utils/validators'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // strict-typed admin check
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  const isAdmin = Boolean((profileRow as unknown as { is_admin: boolean } | null)?.is_admin)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Read file text
  const csvText = await file.text()

  // Parse CSV
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
  if (parsed.errors.length) {
    return NextResponse.json({ error: 'CSV parse error', details: parsed.errors }, { status: 400 })
  }

  // Map common header variations to schema keys
  const headerMap: Record<string, string> = {
    'Company Name': 'companyName',
    'Owner Name': 'ownerName',
    'Phone': 'phone',
    'Email': 'email',
    'State': 'state',
    'Zip Code': 'zipCode',
    'Industry': 'industry',
    'Time in Business': 'timeInBusiness',
    'Monthly Revenue': 'monthlyRevenue',
    'Loan Purpose': 'loanPurpose',
    'Loan Amount Requested': 'loanAmountRequested',
    'Lead Source': 'leadSource',
    'Date Acquired': 'dateAcquired',
  }

  type RawRow = Record<string, string>
  interface InvalidRow {
    row: RawRow
    error: unknown
  }

  const rows: RawRow[] = Array.isArray(parsed.data) ? (parsed.data as RawRow[]) : []

  // prepared insert payload to match DB column names
  const toInsert: Record<string, unknown>[] = []
  const invalids: InvalidRow[] = []

  for (const raw of rows) {
    const normalized: Record<string, string> = {}
    for (const [k, v] of Object.entries(raw)) {
      const key = headerMap[k.trim()] || k.trim()
      normalized[key] = v
    }

    const result = LeadCsvSchema.safeParse(normalized)
    if (!result.success) {
      invalids.push({ row: raw, error: result.error.flatten() })
      continue
    }

    const r = result.data
    toInsert.push({
      company_name: r.companyName,
      owner_name: r.ownerName,
      phone: r.phone,
      email: r.email,
      state: r.state,
      zip_code: r.zipCode,
      industry: r.industry,
      time_in_business: r.timeInBusiness,
      monthly_revenue: r.monthlyRevenue as number,
      loan_purpose: r.loanPurpose,
      loan_amount_requested: r.loanAmountRequested as number,
      lead_source: r.leadSource,
      date_acquired: new Date(r.dateAcquired).toISOString().slice(0,10),
      date_added: new Date().toISOString(),
      tags: [],
      is_sold: false,
    })
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ error: 'No valid rows', invalids }, { status: 400 })
  }

  // @ts-expect-error Supabase Database types not generated yet; payload matches schema
  const { error: insertError } = await supabase.from('leads').insert(toInsert)
  if (insertError) {
    return NextResponse.json({ error: 'Insert failed', details: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: toInsert.length, invalidsCount: invalids.length })
}
