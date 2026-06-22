import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { leads, webhookUrl } = await request.json()

    if (!leads || !webhookUrl) {
      return NextResponse.json({ error: 'Missing leads or webhook URL' }, { status: 400 })
    }

    // Format leads for webhook delivery
    const payload = {
      event: 'leads_export',
      timestamp: new Date().toISOString(),
      count: leads.length,
      leads: leads.map((lead: any) => ({
        id: lead.id,
        company_name: lead.company_name,
        contact_name: lead.owner_name,
        email: lead.email,
        phone: lead.phone,
        city: lead.city,
        state: lead.state,
        industry: lead.industry,
        lead_score: lead.lead_score,
        status: lead.contact_status,
        loan_amount_requested: lead.loan_amount_requested,
        loan_purpose: lead.loan_purpose,
        time_in_business: lead.time_in_business,
        monthly_revenue: lead.monthly_revenue,
        credit_score: lead.credit_score_range,
        urgency: lead.urgency,
        has_collateral: lead.has_collateral,
        lead_source: lead.lead_source || lead.source_type,
        calculator_type: lead.calculator_type,
        qualified_products: lead.qualified_products,
        notes: lead.notes,
        created_at: lead.created_at,
      })),
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Webhook error:', response.status, errorText)
      return NextResponse.json({ error: 'Webhook request failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook send error:', error)
    return NextResponse.json({ error: 'Failed to send to webhook' }, { status: 500 })
  }
}
