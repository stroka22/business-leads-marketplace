import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function MyLeadsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login?redirect=/dashboard/leads')
  }

  const supabase = getSupabaseAdmin()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h1>
          <p className="text-gray-600">Please complete your profile setup.</p>
        </div>
      </div>
    )
  }

  // Get purchased leads with full details
  const { data: purchases } = await supabase
    .from('purchased_leads')
    .select(`
      id,
      price_cents,
      purchased_at,
      expires_at,
      lead_id,
      order_id
    `)
    .eq('buyer_id', profile.id)
    .order('purchased_at', { ascending: false })

  // Get full lead details for purchased leads
  const leadIds = purchases?.map(p => p.lead_id).filter(Boolean) || []
  
  let leads: any[] = []
  if (leadIds.length > 0) {
    const { data: leadData } = await supabase
      .from('financing_leads')
      .select('*')
      .in('id', leadIds)
    leads = leadData || []
  }

  // Map purchases to leads
  const purchasedLeads = purchases?.map(purchase => {
    const lead = leads.find(l => l.id === purchase.lead_id)
    return { ...purchase, lead }
  }).filter(p => p.lead) || []

  // Get recent orders
  const { data: orders } = await supabase
    .from('lead_orders')
    .select('*')
    .eq('buyer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
              <p className="text-gray-600">View and manage your purchased leads</p>
            </div>
            <Link
              href="/marketplace"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse More Leads
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-gray-900">{purchasedLeads.length}</div>
            <div className="text-sm text-gray-500">Total Leads Purchased</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-gray-900">
              ${((purchases?.reduce((sum, p) => sum + (p.price_cents || 0), 0) || 0) / 100).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-gray-900">{orders?.filter(o => o.status === 'paid').length || 0}</div>
            <div className="text-sm text-gray-500">Completed Orders</div>
          </div>
        </div>

        {/* Purchased Leads */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Purchased Leads</h2>
          </div>
          
          {purchasedLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">You haven&apos;t purchased any leads yet.</p>
              <Link href="/marketplace" className="text-blue-600 hover:text-blue-800">
                Browse the marketplace →
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {purchasedLeads.map(({ id, lead, price_cents, purchased_at }) => (
                <div key={id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{lead.company_name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          (lead.lead_score || 0) >= 80 ? 'bg-red-100 text-red-700' :
                          (lead.lead_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          Score: {lead.lead_score || 0}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Contact:</span>{' '}
                          <span className="font-medium">{lead.owner_name || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>{' '}
                          <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email || '-'}</a>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone:</span>{' '}
                          <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone || '-'}</a>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>{' '}
                          <span>{lead.city && `${lead.city}, `}{lead.state || '-'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Industry:</span>{' '}
                          <span className="capitalize">{lead.industry?.replace(/_/g, ' ') || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Loan Amount:</span>{' '}
                          <span className="font-medium text-green-600">
                            {lead.loan_amount_requested ? `$${Number(lead.loan_amount_requested).toLocaleString()}` : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Purpose:</span>{' '}
                          <span className="capitalize">{lead.loan_purpose?.replace(/_/g, ' ') || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Credit:</span>{' '}
                          <span className="capitalize">{lead.credit_score_range || '-'}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          Time in Business: {lead.time_in_business?.replace(/_/g, ' ') || '-'}
                        </span>
                        <span className="text-gray-500">
                          Revenue: {lead.monthly_revenue?.replace(/_/g, ' ') || '-'}
                        </span>
                        <span className="text-gray-500">
                          Urgency: {lead.urgency?.replace(/_/g, ' ') || '-'}
                        </span>
                      </div>

                      {lead.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {lead.notes}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4 flex-shrink-0">
                      <div className="text-lg font-bold text-gray-900">${(price_cents / 100).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(purchased_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {orders && orders.length > 0 && (
          <div className="bg-white rounded-lg border mt-6">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Order History</h2>
            </div>
            <div className="divide-y">
              {orders.map(order => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {order.lead_ids?.length || 0} lead{(order.lead_ids?.length || 0) > 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${(order.total_cents / 100).toFixed(2)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
