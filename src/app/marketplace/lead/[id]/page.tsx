import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PurchaseButton from './PurchaseButton'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase credentials')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

function getLeadPrice(score: number): number {
  if (score >= 80) return 75
  if (score >= 60) return 50
  return 25
}

function getLeadTier(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Hot Lead', color: 'bg-red-100 text-red-700' }
  if (score >= 60) return { label: 'Warm Lead', color: 'bg-yellow-100 text-yellow-700' }
  return { label: 'Standard Lead', color: 'bg-gray-100 text-gray-700' }
}

function maskEmail(email: string | null): string {
  if (!email) return '***@***.com'
  const [local, domain] = email.split('@')
  if (!domain) return '***@***.com'
  return `${local.slice(0, 2)}***@${domain}`
}

function maskPhone(phone: string | null): string {
  if (!phone) return '(***) ***-****'
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) {
    return `(${digits.slice(0, 3)}) ***-${digits.slice(-4)}`
  }
  return '(***) ***-****'
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const { data: lead, error } = await supabase
    .from('financing_leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) {
    notFound()
  }

  const score = lead.lead_score || 0
  const price = getLeadPrice(score)
  const tier = getLeadTier(score)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/marketplace" className="text-blue-200 hover:text-white text-sm mb-2 inline-block">
            ← Back to Marketplace
          </Link>
          <h1 className="text-2xl font-bold">{lead.company_name}</h1>
          <p className="text-blue-100">
            {lead.city && `${lead.city}, `}{lead.state}
            {lead.industry && ` • ${lead.industry.replace(/_/g, ' ')}`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Lead Score Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Lead Quality</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${tier.color}`}>
                  {tier.label}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-gray-900">{score}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        score >= 80 ? 'bg-red-500' : score >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Company Name</div>
                  <div className="font-medium">{lead.company_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Industry</div>
                  <div className="font-medium capitalize">{lead.industry?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{lead.city && `${lead.city}, `}{lead.state || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Time in Business</div>
                  <div className="font-medium">{lead.time_in_business?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Monthly Revenue</div>
                  <div className="font-medium">{lead.monthly_revenue?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Credit Score Range</div>
                  <div className="font-medium capitalize">{lead.credit_score_range || '-'}</div>
                </div>
              </div>
            </div>

            {/* Financing Request */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financing Request</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Loan Amount Requested</div>
                  <div className="text-2xl font-bold text-green-600">
                    {lead.loan_amount_requested 
                      ? `$${Number(lead.loan_amount_requested).toLocaleString()}`
                      : '-'
                    }
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Loan Purpose</div>
                  <div className="font-medium capitalize">{lead.loan_purpose?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Urgency</div>
                  <div className="font-medium capitalize">{lead.urgency?.replace(/_/g, ' ') || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Has Collateral</div>
                  <div className="font-medium">{lead.has_collateral === true ? 'Yes' : lead.has_collateral === false ? 'No' : '-'}</div>
                </div>
              </div>
              {lead.qualified_products && lead.qualified_products.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">Qualified Products</div>
                  <div className="flex flex-wrap gap-2">
                    {lead.qualified_products.map((product: string) => (
                      <span key={product} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Preview (Masked) */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-gray-500 mb-2">Contact details hidden until purchase</div>
                <div className="space-y-1 text-gray-400">
                  <div>Contact: {lead.owner_name ? `${lead.owner_name.slice(0, 2)}***` : '***'}</div>
                  <div>Email: {maskEmail(lead.email)}</div>
                  <div>Phone: {maskPhone(lead.phone)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-1">Lead Price</div>
                <div className="text-4xl font-bold text-gray-900">${price}</div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${tier.color}`}>
                  {tier.label}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full contact information
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete business details
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Financing requirements
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Exclusive access for 30 days
                </div>
              </div>

              <PurchaseButton leadId={lead.id} price={price} />

              <p className="text-xs text-gray-500 text-center mt-4">
                By purchasing, you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
