import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')
  return new Resend(apiKey)
}

export async function POST(request: Request) {
  try {
    const { leads, recipientEmail } = await request.json()

    if (!leads || !recipientEmail) {
      return NextResponse.json({ error: 'Missing leads or recipient email' }, { status: 400 })
    }

    const leadsHtml = leads.map((lead: any) => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: #fff;">
        <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 18px;">${lead.company_name}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 150px;">Contact Name</td>
            <td style="padding: 6px 0; color: #111827;">${lead.owner_name || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Email</td>
            <td style="padding: 6px 0; color: #111827;"><a href="mailto:${lead.email}">${lead.email || '-'}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Phone</td>
            <td style="padding: 6px 0; color: #111827;"><a href="tel:${lead.phone}">${lead.phone || '-'}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Location</td>
            <td style="padding: 6px 0; color: #111827;">${lead.city ? `${lead.city}, ` : ''}${lead.state || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Industry</td>
            <td style="padding: 6px 0; color: #111827;">${(lead.industry || '-').replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Lead Score</td>
            <td style="padding: 6px 0; color: #111827;"><strong>${lead.lead_score || 0}</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Loan Amount</td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${lead.loan_amount_requested ? `$${Number(lead.loan_amount_requested).toLocaleString()}` : '-'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Loan Purpose</td>
            <td style="padding: 6px 0; color: #111827;">${(lead.loan_purpose || '-').replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Time in Business</td>
            <td style="padding: 6px 0; color: #111827;">${(lead.time_in_business || '-').replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Monthly Revenue</td>
            <td style="padding: 6px 0; color: #111827;">${(lead.monthly_revenue || '-').replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Credit Score</td>
            <td style="padding: 6px 0; color: #111827;">${lead.credit_score_range || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Urgency</td>
            <td style="padding: 6px 0; color: #111827;">${(lead.urgency || '-').replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Has Collateral</td>
            <td style="padding: 6px 0; color: #111827;">${lead.has_collateral ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Lead Source</td>
            <td style="padding: 6px 0; color: #111827;">${lead.lead_source || lead.source_type || '-'}</td>
          </tr>
          ${lead.qualified_products && lead.qualified_products.length > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">Qualified Products</td>
            <td style="padding: 6px 0; color: #111827;">${lead.qualified_products.join(', ')}</td>
          </tr>
          ` : ''}
          ${lead.notes ? `
          <tr>
            <td style="padding: 6px 0; color: #6b7280; vertical-align: top;">Notes</td>
            <td style="padding: 6px 0; color: #111827; white-space: pre-wrap;">${lead.notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>
    `).join('')

    const resend = getResend()
    await resend.emails.send({
      from: `BizOps Leads <${process.env.FROM_EMAIL || 'leads@getpipelineai.com'}>`,
      to: recipientEmail,
      subject: `${leads.length} Business Financing Lead${leads.length > 1 ? 's' : ''}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${leads.length} Business Financing Lead${leads.length > 1 ? 's' : ''}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Sent from BizOps Lead Intelligence</p>
          </div>
          <div style="padding: 24px; background: #f9fafb;">
            ${leadsHtml}
          </div>
          <div style="text-align: center; padding: 16px; color: #6b7280; font-size: 12px;">
            Sent via BizOps Lead Intelligence Platform
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
