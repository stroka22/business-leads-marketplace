'use client'

import { useState } from 'react'
import { createFinancingClient } from '@/lib/supabase/financing-client'
import {
  type LeadFilters,
  type Industry,
  type FinancingCategory,
  type LeadPriority,
  INDUSTRY_LABELS,
  FINANCING_CATEGORY_LABELS,
  PRIORITY_LABELS,
} from '@/types/financing'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function ShareFilterForm() {
  const supabase = createFinancingClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [filters, setFilters] = useState<LeadFilters>({})
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Please enter a name for this shared view')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create shared views')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      const { data: sharedFilter, error: insertError } = await supabase
        .from('shared_filters')
        .insert({
          created_by: profile?.id || null,
          name: name.trim(),
          description: description.trim() || null,
          filters,
        })
        .select('share_token')
        .single()

      if (insertError) {
        throw insertError
      }

      const url = `${window.location.origin}/financing/shared/${sharedFilter.share_token}`
      setShareUrl(url)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shared view')
    } finally {
      setLoading(false)
    }
  }

  if (shareUrl) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Shared View Created!
        </h3>
        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
          Share this link with your partners:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 py-2 border rounded bg-white dark:bg-gray-800"
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Copy
          </button>
        </div>
        <button
          onClick={() => {
            setShareUrl(null)
            setName('')
            setDescription('')
            setFilters({})
          }}
          className="mt-4 text-sm text-green-600 hover:underline"
        >
          Create another shared view
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            View Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Texas Construction Hot Leads"
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional description for this shared view..."
            rows={2}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Filter Criteria</h4>
          <p className="text-sm text-gray-500 mb-4">
            Partners will only see leads matching these filters.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* States */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">States</label>
              <select
                multiple
                value={filters.state || []}
                onChange={e => setFilters(f => ({
                  ...f,
                  state: Array.from(e.target.selectedOptions, o => o.value)
                }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-24"
              >
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Industries</label>
              <select
                multiple
                value={filters.industry || []}
                onChange={e => setFilters(f => ({
                  ...f,
                  industry: Array.from(e.target.selectedOptions, o => o.value as Industry)
                }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-24"
              >
                {Object.entries(INDUSTRY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Financing Categories */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Financing Types</label>
              <select
                multiple
                value={filters.financing_category || []}
                onChange={e => setFilters(f => ({
                  ...f,
                  financing_category: Array.from(e.target.selectedOptions, o => o.value as FinancingCategory)
                }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-24"
              >
                {Object.entries(FINANCING_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Lead Priorities */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Lead Priorities</label>
              <select
                multiple
                value={filters.lead_priority || []}
                onChange={e => setFilters(f => ({
                  ...f,
                  lead_priority: Array.from(e.target.selectedOptions, o => o.value as LeadPriority)
                }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-24"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Min Score */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={filters.min_score ?? ''}
                onChange={e => setFilters(f => ({
                  ...f,
                  min_score: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                placeholder="0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Max Score */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Maximum Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={filters.max_score ?? ''}
                onChange={e => setFilters(f => ({
                  ...f,
                  max_score: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                placeholder="100"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Shareable Link'}
        </button>
      </div>
    </form>
  )
}
