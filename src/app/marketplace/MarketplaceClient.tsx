'use client'

import { useEffect, useMemo, useState } from 'react'
import { createFinancingClient } from '@/lib/supabase/financing-client'
import Link from 'next/link'

// Score-based pricing tiers
const SCORE_PRICING = {
  hot: { min: 80, price: 75, label: 'Hot Lead' },
  warm: { min: 60, price: 50, label: 'Warm Lead' },
  standard: { min: 0, price: 25, label: 'Standard Lead' },
}

function getLeadPrice(score: number): number {
  if (score >= SCORE_PRICING.hot.min) return SCORE_PRICING.hot.price
  if (score >= SCORE_PRICING.warm.min) return SCORE_PRICING.warm.price
  return SCORE_PRICING.standard.price
}

function getLeadTier(score: number): string {
  if (score >= SCORE_PRICING.hot.min) return 'hot'
  if (score >= SCORE_PRICING.warm.min) return 'warm'
  return 'standard'
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

interface Lead {
  id: string
  company_name: string
  owner_name: string | null
  phone: string | null
  email: string | null
  state: string | null
  city: string | null
  industry: string | null
  lead_score: number
  loan_amount_requested: number | null
  loan_purpose: string | null
  time_in_business: string | null
  monthly_revenue: string | null
  credit_score_range: string | null
  urgency: string | null
  created_at: string
  contact_status: string
}

interface Filters {
  state: string
  industry: string
  minScore: number
  loanPurposeFilter: string
  minLoanAmount: number
  maxLoanAmount: number
}

export default function MarketplaceClient() {
  const supabase = useMemo(() => createFinancingClient(), [])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<Filters>({
    state: '',
    industry: '',
    minScore: 0,
    loanPurposeFilter: '',
    minLoanAmount: 0,
    maxLoanAmount: 0,
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('financing_leads')
      .select('*')
      .eq('contact_status', 'new') // Only show new/available leads
      .order('lead_score', { ascending: false })
      .limit(100)

    if (!error && data) {
      setLeads(data as Lead[])
    }
    setLoading(false)
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filters.state && lead.state !== filters.state) return false
      if (filters.industry && lead.industry !== filters.industry) return false
      if (filters.minScore && (lead.lead_score || 0) < filters.minScore) return false
      if (filters.loanPurposeFilter && lead.loan_purpose !== filters.loanPurposeFilter) return false
      if (filters.minLoanAmount && (lead.loan_amount_requested || 0) < filters.minLoanAmount) return false
      if (filters.maxLoanAmount && (lead.loan_amount_requested || 0) > filters.maxLoanAmount) return false
      return true
    })
  }, [leads, filters])

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    if (selected.size === filteredLeads.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredLeads.map(l => l.id)))
    }
  }

  const selectedLeads = filteredLeads.filter(l => selected.has(l.id))
  
  const cartTotal = useMemo(() => {
    return selectedLeads.reduce((sum, lead) => sum + getLeadPrice(lead.lead_score || 0), 0)
  }, [selectedLeads])

  const bulkDiscount = useMemo(() => {
    const count = selectedLeads.length
    if (count >= 20) return 0.20
    if (count >= 10) return 0.15
    if (count >= 5) return 0.10
    return 0
  }, [selectedLeads.length])

  const finalTotal = cartTotal * (1 - bulkDiscount)

  // Get unique values for filter dropdowns
  const states = [...new Set(leads.map(l => l.state).filter(Boolean))]
  const industries = [...new Set(leads.map(l => l.industry).filter(Boolean))]
  const purposes = [...new Set(leads.map(l => l.loan_purpose).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Lead Marketplace</h1>
          <p className="text-blue-100 mt-2">Browse and purchase qualified business financing leads</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Pricing Tiers Info */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Lead Pricing</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-sm">Hot (80+ score): <strong>$75</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-sm">Warm (60-79): <strong>$50</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              <span className="text-sm">Standard (&lt;60): <strong>$25</strong></span>
            </div>
            <div className="ml-auto text-sm text-gray-600">
              Bulk discounts: 5+ leads (10% off) | 10+ (15% off) | 20+ (20% off)
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State</label>
                  <select
                    value={filters.state}
                    onChange={e => setFilters({ ...filters, state: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state} value={state!}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Industry</label>
                  <select
                    value={filters.industry}
                    onChange={e => setFilters({ ...filters, industry: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Industries</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind!}>{ind!.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Loan Purpose</label>
                  <select
                    value={filters.loanPurposeFilter}
                    onChange={e => setFilters({ ...filters, loanPurposeFilter: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">All Purposes</option>
                    {purposes.map(p => (
                      <option key={p} value={p!}>{p!.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Min Lead Score</label>
                  <select
                    value={filters.minScore}
                    onChange={e => setFilters({ ...filters, minScore: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value={0}>Any Score</option>
                    <option value={60}>60+ (Warm)</option>
                    <option value={80}>80+ (Hot)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Loan Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minLoanAmount || ''}
                      onChange={e => setFilters({ ...filters, minLoanAmount: Number(e.target.value) || 0 })}
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxLoanAmount || ''}
                      onChange={e => setFilters({ ...filters, maxLoanAmount: Number(e.target.value) || 0 })}
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setFilters({ state: '', industry: '', minScore: 0, loanPurposeFilter: '', minLoanAmount: 0, maxLoanAmount: 0 })}
                  className="w-full text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selected.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">
                  {filteredLeads.length} leads available
                  {selected.size > 0 && ` • ${selected.size} selected`}
                </span>
              </div>
              <button onClick={fetchLeads} className="text-sm text-blue-600 hover:text-blue-800">
                Refresh
              </button>
            </div>

            {/* Leads Grid */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                Loading leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                No leads match your filters
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map(lead => {
                  const tier = getLeadTier(lead.lead_score || 0)
                  const price = getLeadPrice(lead.lead_score || 0)
                  const isSelected = selected.has(lead.id)

                  return (
                    <div
                      key={lead.id}
                      className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
                        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(lead.id)}
                          className="mt-1 rounded border-gray-300"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{lead.company_name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              tier === 'hot' ? 'bg-red-100 text-red-700' :
                              tier === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {lead.lead_score || 0} pts
                            </span>
                            {lead.loan_amount_requested && (
                              <span className="text-sm text-green-600 font-medium">
                                ${Number(lead.loan_amount_requested).toLocaleString()} requested
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Location:</span>{' '}
                              <span className="text-gray-900">{lead.city && `${lead.city}, `}{lead.state || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Industry:</span>{' '}
                              <span className="text-gray-900 capitalize">{lead.industry?.replace(/_/g, ' ') || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Purpose:</span>{' '}
                              <span className="text-gray-900 capitalize">{lead.loan_purpose?.replace(/_/g, ' ') || '-'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Revenue:</span>{' '}
                              <span className="text-gray-900">{lead.monthly_revenue?.replace(/_/g, ' ') || '-'}</span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span>Contact: {maskEmail(lead.email)} • {maskPhone(lead.phone)}</span>
                            <span>Time in Business: {lead.time_in_business?.replace(/_/g, ' ') || '-'}</span>
                            <span>Credit: {lead.credit_score_range || '-'}</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-gray-900">${price}</div>
                          <Link 
                            href={`/marketplace/lead/${lead.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart Footer */}
        {selected.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  {selected.size} lead{selected.size > 1 ? 's' : ''} selected
                </div>
                <div className="text-sm text-gray-600">
                  Subtotal: ${cartTotal.toFixed(2)}
                  {bulkDiscount > 0 && (
                    <span className="text-green-600 ml-2">
                      ({Math.round(bulkDiscount * 100)}% bulk discount applied)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-gray-900">${finalTotal.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => {
                    // TODO: Implement checkout
                    alert('Checkout coming soon! Selected leads: ' + selected.size)
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Purchase Leads
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
