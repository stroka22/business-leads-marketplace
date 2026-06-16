'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createFinancingClient } from '@/lib/supabase/financing-client'
import {
  type FinancingLead,
  type LeadSignal,
  type LeadFilters,
  type Industry,
  type FinancingCategory,
  type ContactStatus,
  type LeadPriority,
  INDUSTRY_LABELS,
  FINANCING_CATEGORY_LABELS,
  CONTACT_STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '@/types/financing'
import { Download, Filter, RefreshCw, Share2, X, ChevronDown, ChevronUp } from 'lucide-react'
import Papa from 'papaparse'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

interface LeadWithSignals extends FinancingLead {
  signals?: LeadSignal[]
}

export default function FinancingDashboard() {
  const supabase = useMemo(() => createFinancingClient(), [])
  
  const [leads, setLeads] = useState<LeadWithSignals[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LeadFilters>({})
  const [showFilters, setShowFilters] = useState(true)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, hot: 0, strong: 0, possible: 0 })

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    
    let query = supabase
      .from('financing_leads')
      .select('*')
      .order('lead_score', { ascending: false })
      .limit(500)

    // Apply filters
    if (filters.industry?.length) {
      query = query.in('industry', filters.industry)
    }
    if (filters.state?.length) {
      query = query.in('state', filters.state)
    }
    if (filters.financing_category?.length) {
      query = query.in('financing_category', filters.financing_category)
    }
    if (filters.contact_status?.length) {
      query = query.in('contact_status', filters.contact_status)
    }
    if (filters.lead_priority?.length) {
      query = query.in('lead_priority', filters.lead_priority)
    }
    if (filters.min_score !== undefined) {
      query = query.gte('lead_score', filters.min_score)
    }
    if (filters.max_score !== undefined) {
      query = query.lte('lead_score', filters.max_score)
    }
    if (filters.date_from) {
      query = query.gte('date_found', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('date_found', filters.date_to)
    }
    if (filters.search) {
      query = query.or(`company_name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data as LeadWithSignals[] || [])
      
      // Calculate stats
      const total = data?.length || 0
      const hot = data?.filter(l => l.lead_priority === 'hot').length || 0
      const strong = data?.filter(l => l.lead_priority === 'strong').length || 0
      const possible = data?.filter(l => l.lead_priority === 'possible').length || 0
      setStats({ total, hot, strong, possible })
    }

    setLoading(false)
  }, [supabase, filters])

  const fetchSignals = useCallback(async (leadId: string) => {
    const { data: signals } = await supabase
      .from('lead_signals')
      .select('*')
      .eq('lead_id', leadId)
      .order('found_at', { ascending: false })

    if (signals) {
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, signals: signals as LeadSignal[] } : l
      ))
    }
  }, [supabase])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const toggleLeadExpand = async (leadId: string) => {
    if (expandedLead === leadId) {
      setExpandedLead(null)
    } else {
      setExpandedLead(leadId)
      const lead = leads.find(l => l.id === leadId)
      if (lead && !lead.signals) {
        await fetchSignals(leadId)
      }
    }
  }

  const updateLeadStatus = async (leadId: string, status: ContactStatus) => {
    const { error } = await supabase
      .from('financing_leads')
      .update({ contact_status: status })
      .eq('id', leadId)

    if (!error) {
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, contact_status: status } : l
      ))
    }
  }

  const exportToCSV = () => {
    const csvData = leads.map(lead => ({
      'Company Name': lead.company_name,
      'Industry': lead.industry ? INDUSTRY_LABELS[lead.industry] : '',
      'Website': lead.website || '',
      'Phone': lead.phone || '',
      'Email': lead.email || '',
      'Address': lead.business_address || '',
      'City': lead.city || '',
      'State': lead.state || '',
      'ZIP': lead.zip_code || '',
      'Owner Name': lead.owner_name || '',
      'Owner Title': lead.owner_title || '',
      'Owner Email': lead.owner_email || '',
      'Owner Phone': lead.owner_phone || '',
      'Source URL': lead.source_url || '',
      'Date Found': lead.date_found,
      'Lead Score': lead.lead_score,
      'Lead Priority': PRIORITY_LABELS[lead.lead_priority],
      'Financing Category': lead.financing_category ? FINANCING_CATEGORY_LABELS[lead.financing_category] : '',
      'Likely Reason': lead.likely_reason || '',
      'Suggested Outreach': lead.suggested_outreach || '',
      'AI Summary': lead.ai_summary || '',
      'Estimated Capital Need': lead.estimated_capital_need || '',
      'Contact Status': CONTACT_STATUS_LABELS[lead.contact_status],
      'Notes': lead.notes || '',
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `financing-leads-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some(v => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Business Financing Lead Intelligence Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            SBAC Funding Lead Generation System
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Leads</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-red-500">
            <div className="text-sm text-gray-500 dark:text-gray-400">Hot Leads</div>
            <div className="text-2xl font-bold text-red-600">{stats.hot}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
            <div className="text-sm text-gray-500 dark:text-gray-400">Strong Leads</div>
            <div className="text-2xl font-bold text-orange-600">{stats.strong}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="text-sm text-gray-500 dark:text-gray-400">Possible Leads</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.possible}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter size={18} />
            {showFilters ? 'Hide' : 'Show'} Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
          </button>
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download size={18} />
            Export CSV
          </button>
          <a
            href="/financing/share"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Share2 size={18} />
            Share View
          </a>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <X size={14} /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Company or owner name..."
                  value={filters.search || ''}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">State</label>
                <select
                  multiple
                  value={filters.state || []}
                  onChange={e => setFilters(f => ({ 
                    ...f, 
                    state: Array.from(e.target.selectedOptions, o => o.value)
                  }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-[42px]"
                >
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Industry</label>
                <select
                  value={filters.industry?.[0] || ''}
                  onChange={e => setFilters(f => ({ 
                    ...f, 
                    industry: e.target.value ? [e.target.value as Industry] : undefined 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All Industries</option>
                  {Object.entries(INDUSTRY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Financing Category */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Financing Type</label>
                <select
                  value={filters.financing_category?.[0] || ''}
                  onChange={e => setFilters(f => ({ 
                    ...f, 
                    financing_category: e.target.value ? [e.target.value as FinancingCategory] : undefined 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All Types</option>
                  {Object.entries(FINANCING_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Priority</label>
                <select
                  value={filters.lead_priority?.[0] || ''}
                  onChange={e => setFilters(f => ({ 
                    ...f, 
                    lead_priority: e.target.value ? [e.target.value as LeadPriority] : undefined 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All Priorities</option>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Contact Status */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Status</label>
                <select
                  value={filters.contact_status?.[0] || ''}
                  onChange={e => setFilters(f => ({ 
                    ...f, 
                    contact_status: e.target.value ? [e.target.value as ContactStatus] : undefined 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(CONTACT_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Min Score */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Min Score</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={filters.min_score ?? ''}
                  onChange={e => setFilters(f => ({ 
                    ...f, 
                    min_score: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={e => setFilters(f => ({ ...f, date_from: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 w-8"></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Industry</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Financing Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Date Found</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No leads found. Run the scrapers to populate data.
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <>
                      <tr 
                        key={lead.id}
                        className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => toggleLeadExpand(lead.id)}
                      >
                        <td className="px-4 py-3">
                          {expandedLead === lead.id ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{lead.company_name}</div>
                          {lead.owner_name && (
                            <div className="text-xs text-gray-500">{lead.owner_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {lead.industry ? INDUSTRY_LABELS[lead.industry] : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {[lead.city, lead.state].filter(Boolean).join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[lead.lead_priority]}`}>
                            {lead.lead_score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {lead.financing_category ? FINANCING_CATEGORY_LABELS[lead.financing_category] : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.contact_status}
                            onChange={e => {
                              e.stopPropagation()
                              updateLeadStatus(lead.id, e.target.value as ContactStatus)
                            }}
                            onClick={e => e.stopPropagation()}
                            className="text-xs px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                          >
                            {Object.entries(CONTACT_STATUS_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(lead.date_found).toLocaleDateString()}
                        </td>
                      </tr>
                      {expandedLead === lead.id && (
                        <tr key={`${lead.id}-expanded`} className="bg-gray-50 dark:bg-gray-700/30">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Contact Info */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h4>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                  {lead.phone && <div><span className="text-gray-500">Phone:</span> {lead.phone}</div>}
                                  {lead.email && <div><span className="text-gray-500">Email:</span> {lead.email}</div>}
                                  {lead.website && (
                                    <div>
                                      <span className="text-gray-500">Website:</span>{' '}
                                      <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {lead.website}
                                      </a>
                                    </div>
                                  )}
                                  {lead.business_address && <div><span className="text-gray-500">Address:</span> {lead.business_address}</div>}
                                  {lead.owner_email && <div><span className="text-gray-500">Owner Email:</span> {lead.owner_email}</div>}
                                  {lead.owner_phone && <div><span className="text-gray-500">Owner Phone:</span> {lead.owner_phone}</div>}
                                </div>
                              </div>

                              {/* AI Analysis */}
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Analysis</h4>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                  {lead.likely_reason && (
                                    <div>
                                      <span className="text-gray-500">Likely Reason:</span>
                                      <p className="mt-1">{lead.likely_reason}</p>
                                    </div>
                                  )}
                                  {lead.suggested_outreach && (
                                    <div>
                                      <span className="text-gray-500">Suggested Outreach:</span>
                                      <p className="mt-1 italic">&ldquo;{lead.suggested_outreach}&rdquo;</p>
                                    </div>
                                  )}
                                  {lead.estimated_capital_need && (
                                    <div>
                                      <span className="text-gray-500">Est. Capital Need:</span> {lead.estimated_capital_need}
                                    </div>
                                  )}
                                  {lead.ai_summary && (
                                    <div>
                                      <span className="text-gray-500">Summary:</span>
                                      <p className="mt-1">{lead.ai_summary}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Signals */}
                              <div className="lg:col-span-2">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Signals Detected</h4>
                                {lead.signals ? (
                                  <div className="flex flex-wrap gap-2">
                                    {lead.signals.map(signal => (
                                      <div 
                                        key={signal.id}
                                        className="px-3 py-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-600"
                                      >
                                        <div className="font-medium text-xs text-gray-900 dark:text-white">
                                          {signal.signal_type.replace(/_/g, ' ').toUpperCase()} (+{signal.score_contribution})
                                        </div>
                                        {signal.signal_description && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {signal.signal_description.slice(0, 100)}
                                            {signal.signal_description.length > 100 && '...'}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">Loading signals...</div>
                                )}
                              </div>

                              {/* Source */}
                              {lead.source_url && (
                                <div className="lg:col-span-2">
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Source</h4>
                                  <a 
                                    href={lead.source_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {lead.source_url}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
