import { createFinancingServerClient } from '@/lib/supabase/financing-server'
import { NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'

export async function POST(request: Request) {
  const supabase = await createFinancingServerClient()
  
  // Check admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const records = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[]

    let count = 0

    switch (type) {
      case 'financing_leads': {
        const leads = records.map(r => ({
          company_name: r.company_name || r['Company Name'],
          state: r.state || r['State'],
          city: r.city || r['City'],
          industry: r.industry || r['Industry'],
          phone: r.phone || r['Phone'],
          email: r.email || r['Email'],
          website: r.website || r['Website'],
        })).filter(l => l.company_name)

        const { data, error } = await supabase.from('financing_leads').insert(leads).select()
        if (error) throw error
        count = data?.length || 0
        break
      }

      case 'ucc': {
        for (const r of records) {
          const debtorName = r.debtor_name || r['Debtor Name']
          const state = r.state || r['State']
          
          if (!debtorName) continue

          // Create or find lead
          let leadId: string
          const { data: existing } = await supabase
            .from('financing_leads')
            .select('id')
            .eq('company_name', debtorName)
            .eq('state', state)
            .single()

          if (existing) {
            leadId = existing.id
          } else {
            const { data: newLead, error } = await supabase
              .from('financing_leads')
              .insert({
                company_name: debtorName,
                state: state,
                city: r.city || r['City'],
                industry: 'other',
              })
              .select('id')
              .single()
            
            if (error || !newLead) continue
            leadId = newLead.id
          }

          // Insert UCC filing
          await supabase.from('ucc_filings').upsert({
            lead_id: leadId,
            filing_number: r.filing_number || r['Filing Number'],
            filing_date: r.filing_date || r['Filing Date'],
            filing_state: state,
            debtor_name: debtorName,
            secured_party: r.secured_party || r['Secured Party'],
            collateral_description: r.collateral_description || r['Collateral Description'],
          }, { onConflict: 'filing_number' })

          count++
        }
        break
      }

      case 'contracts': {
        for (const r of records) {
          const awardeeName = r.awardee_name || r['Awardee Name']
          const state = r.state || r['State']
          
          if (!awardeeName) continue

          // Create or find lead
          let leadId: string
          const { data: existing } = await supabase
            .from('financing_leads')
            .select('id')
            .eq('company_name', awardeeName)
            .single()

          if (existing) {
            leadId = existing.id
          } else {
            const { data: newLead, error } = await supabase
              .from('financing_leads')
              .insert({
                company_name: awardeeName,
                state: state,
                industry: 'construction',
              })
              .select('id')
              .single()
            
            if (error || !newLead) continue
            leadId = newLead.id
          }

          // Insert contract
          await supabase.from('government_contracts').upsert({
            lead_id: leadId,
            contract_number: r.contract_number || r['Contract Number'],
            award_date: r.award_date || r['Award Date'],
            award_amount: parseFloat((r.award_amount || r['Award Amount'] || '0').replace(/[^0-9.]/g, '')),
            contract_description: r.description || r['Description'],
            awarding_agency: r.agency || r['Agency'],
            agency_type: 'federal',
          }, { onConflict: 'contract_number' })

          count++
        }
        break
      }

      case 'marketplace': {
        const leads = records.map(r => ({
          company_name: r['Company Name'] || r.company_name,
          owner_name: r['Owner Name'] || r.owner_name || '',
          phone: r['Phone'] || r.phone || '',
          email: r['Email'] || r.email || '',
          state: r['State'] || r.state || '',
          zip_code: r['Zip Code'] || r.zip_code || '',
          industry: r['Industry'] || r.industry || '',
          time_in_business: r['Time in Business'] || r.time_in_business || '',
          monthly_revenue: parseFloat((r['Monthly Revenue'] || r.monthly_revenue || '0').replace(/[^0-9.]/g, '')) || 0,
          loan_purpose: r['Loan Purpose'] || r.loan_purpose || '',
          loan_amount_requested: parseFloat((r['Loan Amount Requested'] || r.loan_amount_requested || '0').replace(/[^0-9.]/g, '')) || 0,
          lead_source: r['Lead Source'] || r.lead_source || 'csv_import',
          date_acquired: r['Date Acquired'] || r.date_acquired || new Date().toISOString().split('T')[0],
        })).filter(l => l.company_name)

        const { data, error } = await supabase.from('leads').insert(leads).select()
        if (error) throw error
        count = data?.length || 0
        break
      }

      default:
        return NextResponse.json({ error: 'Unknown import type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
