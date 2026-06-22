import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase credentials')
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export default async function SharedLeadsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = getSupabaseAdmin()

  // Get share link
  const { data: shareLink, error: linkError } = await supabase
    .from('shared_lead_links')
    .select('*')
    .eq('token', token)
    .single()

  if (linkError || !shareLink) {
    notFound()
  }

  // Check if expired
  if (new Date(shareLink.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600">This share link has expired. Please request a new link.</p>
        </div>
      </div>
    )
  }

  // Increment view count
  await supabase
    .from('shared_lead_links')
    .update({ view_count: (shareLink.view_count || 0) + 1 })
    .eq('token', token)

  // Get leads
  const { data: leads, error: leadsError } = await supabase
    .from('financing_leads')
    .select('*')
    .in('id', shareLink.lead_ids)
    .order('lead_score', { ascending: false })

  if (leadsError || !leads) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">Unable to load leads. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Financing Leads</h1>
              <p className="text-gray-600 mt-1">{leads.length} qualified leads</p>
            </div>
            <div className="text-sm text-gray-500">
              Expires: {new Date(shareLink.expires_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{lead.company_name}</h2>
                  <p className="text-gray-600">
                    {lead.city && `${lead.city}, `}{lead.state}
                    {lead.industry && ` • ${lead.industry.replace(/_/g, ' ')}`}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  (lead.lead_score || 0) >= 80 ? 'bg-red-100 text-red-700' :
                  (lead.lead_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  Score: {lead.lead_score || 0}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Contact Name</div>
                  <div className="font-medium">{lead.owner_name || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Email</div>
                  <div className="font-medium">
                    {lead.email ? <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a> : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Phone</div>
                  <div className="font-medium">
                    {lead.phone ? <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a> : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Loan Amount</div>
                  <div className="font-medium text-green-600">
                    {lead.loan_amount_requested ? `$${Number(lead.loan_amount_requested).toLocaleString()}` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Loan Purpose</div>
                  <div className="font-medium capitalize">{lead.loan_purpose?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Time in Business</div>
                  <div className="font-medium">{lead.time_in_business?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Monthly Revenue</div>
                  <div className="font-medium">{lead.monthly_revenue?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Credit Score</div>
                  <div className="font-medium capitalize">{lead.credit_score_range || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Urgency</div>
                  <div className="font-medium">{lead.urgency?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Has Collateral</div>
                  <div className="font-medium">{lead.has_collateral === true ? 'Yes' : lead.has_collateral === false ? 'No' : '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Lead Source</div>
                  <div className="font-medium">{lead.lead_source || lead.source_type || '-'}</div>
                </div>
                {lead.qualified_products && lead.qualified_products.length > 0 && (
                  <div>
                    <div className="text-gray-500 mb-1">Qualified Products</div>
                    <div className="font-medium">{lead.qualified_products.join(', ')}</div>
                  </div>
                )}
              </div>

              {lead.notes && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-gray-500 text-sm mb-1">Notes</div>
                  <div className="text-sm whitespace-pre-wrap">{lead.notes}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center text-gray-500 text-sm mt-8">
          Powered by BizOps Lead Intelligence
        </div>
      </div>
    </div>
  )
}
