'use client'

import { useEffect, useState, useCallback } from 'react'
import { createFinancingClient } from '@/lib/supabase/financing-client'
import {
  type FinancingLead,
  type LeadFilters,
  INDUSTRY_LABELS,
  FINANCING_CATEGORY_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '@/types/financing'
import { Download } from 'lucide-react'
import Papa from 'papaparse'

interface Props {
  name: string
  description: string | null
  filters: LeadFilters
}

export default function SharedLeadsView({ name, description, filters }: Props) {
  const supabase = createFinancingClient()
  
  const [leads, setLeads] = useState<FinancingLead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    
    let query = supabase
      .from('financing_leads')
      .select('*')
      .order('lead_score', { ascending: false })
      .limit(200)

    // Apply filters from shared config
    if (filters.industry?.length) {
      query = query.in('industry', filters.industry)
    }
    if (filters.state?.length) {
      query = query.in('state', filters.state)
    }
    if (filters.financing_category?.length) {
      query = query.in('financing_category', filters.financing_category)
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

    const { data, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
    } else {
      setLeads(data as FinancingLead[] || [])
    }

    setLoading(false)
  }, [supabase, filters])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const exportToCSV = () => {
    const csvData = leads.map(lead => ({
      'Company Name': lead.company_name,
      'Industry': lead.industry ? INDUSTRY_LABELS[lead.industry] : '',
      'City': lead.city || '',
      'State': lead.state || '',
      'Lead Score': lead.lead_score,
      'Lead Priority': PRIORITY_LABELS[lead.lead_priority],
      'Financing Type': lead.financing_category ? FINANCING_CATEGORY_LABELS[lead.financing_category] : '',
      'Likely Reason': lead.likely_reason || '',
      'Suggested Outreach': lead.suggested_outreach || '',
      'Date Found': lead.date_found,
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads-${name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Shared View
            </span>
            <span>SBAC Funding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {name}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-gray-500 text-sm">Total: </span>
            <span className="font-semibold text-gray-900 dark:text-white">{leads.length}</span>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Leads Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Industry</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Financing Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Outreach Angle</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Loading leads...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No leads match the current filters.
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr 
                      key={lead.id}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{lead.company_name}</div>
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
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-md">
                        {lead.suggested_outreach ? (
                          <span className="italic text-sm">&ldquo;{lead.suggested_outreach}&rdquo;</span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by SBAC Funding Lead Intelligence Engine</p>
        </div>
      </div>
    </div>
  )
}
