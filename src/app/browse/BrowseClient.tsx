'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { maskEmail, maskPhone } from '@/lib/utils/mask'
import { computeCartTotals, formatPrice, getUnitPrice, LeadAgeTier } from '@/lib/utils/pricing'
import { FilterSchema, type FilterParams } from '@/lib/utils/validators'

interface Lead {
  id: string
  company_name: string
  owner_name: string
  phone: string
  email: string
  state: string
  zip_code: string
  industry: string
  time_in_business: string
  monthly_revenue: number
  loan_purpose: string
  loan_amount_requested: number
  lead_source: string
  date_acquired: string
  date_added: string
  tags: string[]
  is_sold: boolean
  lead_age_tag: LeadAgeTier
}

export default function BrowseClient() {
  const supabase = useMemo(() => createClient(), [])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Record<string, Lead>>({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterParams>({})

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('leads_with_age').select('*').limit(200)
      if (!error && data) {
        let list = data as unknown as Lead[]
        if (filters.ageTags && filters.ageTags.length) {
          list = list.filter(l => filters.ageTags?.includes(l.lead_age_tag))
        }
        if (filters.state) list = list.filter(l => l.state === filters.state)
        if (filters.industry) list = list.filter(l => l.industry === filters.industry)
        if (filters.loanPurpose) list = list.filter(l => l.loan_purpose === filters.loanPurpose)
        if (filters.timeInBusiness) list = list.filter(l => l.time_in_business === filters.timeInBusiness)
        if (filters.monthlyRevenueMin) list = list.filter(l => l.monthly_revenue >= (filters.monthlyRevenueMin as number))
        if (filters.monthlyRevenueMax) list = list.filter(l => l.monthly_revenue <= (filters.monthlyRevenueMax as number))
        if (filters.loanAmountMin) list = list.filter(l => l.loan_amount_requested >= (filters.loanAmountMin as number))
        if (filters.loanAmountMax) list = list.filter(l => l.loan_amount_requested <= (filters.loanAmountMax as number))
        setLeads(list)
      }
      setLoading(false)
    }
    fetchLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, JSON.stringify(filters)])

  const onToggle = (lead: Lead) => {
    setSelected(prev => {
      const next = { ...prev }
      if (next[lead.id]) delete next[lead.id]
      else next[lead.id] = lead
      return next
    })
  }

  const cartItems = useMemo(() => {
    const ageMap: Record<LeadAgeTier, number> = { '0-24h': 0, '2-3d': 0, '4-7d': 0, '8-14d': 0, '15+d': 0 }
    Object.values(selected).forEach(l => { ageMap[l.lead_age_tag]++ })
    return Object.entries(ageMap).filter(([, q]) => q > 0).map(([ageTag, quantity]) => ({ ageTag: ageTag as LeadAgeTier, quantity }))
  }, [selected])

  const totals = useMemo(() => computeCartTotals(cartItems), [cartItems])

  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    const next: Partial<FilterParams> = { ...filters }

    switch (name) {
      case 'monthlyRevenueMin':
      case 'monthlyRevenueMax':
      case 'loanAmountMin':
      case 'loanAmountMax': {
        const numericVal = value ? Number(value) : undefined
        next[
          name as
            | 'monthlyRevenueMin'
            | 'monthlyRevenueMax'
            | 'loanAmountMin'
            | 'loanAmountMax'
        ] = numericVal
        break
      }
      case 'state':
      case 'industry':
      case 'loanPurpose':
      case 'timeInBusiness': {
        next[
          name as
            | 'state'
            | 'industry'
            | 'loanPurpose'
            | 'timeInBusiness'
        ] = (value || undefined) as string | undefined
        break
      }
      default:
        break
    }

    const parsed = FilterSchema.safeParse(next)
    if (parsed.success) setFilters(parsed.data)
  }

  const toggleAge = (tag: LeadAgeTier) => {
    const current = new Set(filters.ageTags || [])
    if (current.has(tag)) current.delete(tag)
    else current.add(tag)
    const parsed = FilterSchema.safeParse({ ...filters, ageTags: Array.from(current) })
    if (parsed.success) setFilters(parsed.data)
  }

  const handleCheckout = async () => {
    if (!Object.keys(selected).length) return
    try {
      setCheckoutLoading(true)
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: Object.keys(selected) }),
      })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert(data?.error || 'Checkout failed')
      }
    } catch (_) {
      alert('Checkout error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Browse Leads</h1>
      <div className="border rounded-lg p-4 mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="font-medium mb-2">Lead Age</div>
          <div className="flex flex-wrap gap-2">
            {(['0-24h','2-3d','4-7d','8-14d','15+d'] as LeadAgeTier[]).map(tag => (
              <button key={tag} onClick={() => toggleAge(tag)} className={`px-3 py-1 rounded border text-sm ${filters.ageTags?.includes(tag) ? 'bg-black text-white dark:bg-white dark:text-black' : ''}`}>
                {tag} (${getUnitPrice(tag)})
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">State</label>
          <input name="state" onChange={handleFilterChange} placeholder="e.g., CA" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Industry</label>
          <input name="industry" onChange={handleFilterChange} placeholder="e.g., Retail" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Loan Purpose</label>
          <input name="loanPurpose" onChange={handleFilterChange} placeholder="e.g., Working Capital" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Time in Business</label>
          <input name="timeInBusiness" onChange={handleFilterChange} placeholder="e.g., 2+ years" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Monthly Revenue Range</label>
          <div className="flex gap-2">
            <input type="number" name="monthlyRevenueMin" onChange={handleFilterChange} placeholder="Min" className="w-full border rounded px-3 py-2" />
            <input type="number" name="monthlyRevenueMax" onChange={handleFilterChange} placeholder="Max" className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Loan Amount Range</label>
          <div className="flex gap-2">
            <input type="number" name="loanAmountMin" onChange={handleFilterChange} placeholder="Min" className="w-full border rounded px-3 py-2" />
            <input type="number" name="loanAmountMax" onChange={handleFilterChange} placeholder="Max" className="w-full border rounded px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/30">
            <tr>
              <th className="px-3 py-2 text-left">Select</th>
              <th className="px-3 py-2 text-left">Company</th>
              <th className="px-3 py-2 text-left">Owner</th>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">State</th>
              <th className="px-3 py-2 text-left">Industry</th>
              <th className="px-3 py-2 text-left">Revenue</th>
              <th className="px-3 py-2 text-left">Loan</th>
              <th className="px-3 py-2 text-left">Age</th>
              <th className="px-3 py-2 text-left">Price</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-6" colSpan={10}>Loading...</td></tr>
            ) : (
              leads.map(lead => {
                const checked = !!selected[lead.id]
                return (
                  <tr key={lead.id} className="border-t">
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={checked} onChange={() => onToggle(lead)} />
                    </td>
                    <td className="px-3 py-2">{lead.company_name}</td>
                    <td className="px-3 py-2">{lead.owner_name}</td>
                    <td className="px-3 py-2">
                      <div className="text-gray-700 dark:text-gray-200">{maskEmail(lead.email)}</div>
                      <div className="text-gray-500 text-xs">{maskPhone(lead.phone)}</div>
                    </td>
                    <td className="px-3 py-2">{lead.state}</td>
                    <td className="px-3 py-2">{lead.industry}</td>
                    <td className="px-3 py-2">${'{'}lead.monthly_revenue.toLocaleString(){'}'}</td>
                    <td className="px-3 py-2">${'{'}lead.loan_amount_requested.toLocaleString(){'}'} ({'{'}lead.loan_purpose{'}'})</td>
                    <td className="px-3 py-2">{lead.lead_age_tag}</td>
                    <td className="px-3 py-2">{formatPrice(getUnitPrice(lead.lead_age_tag))}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-medium">Selected: {Object.keys(selected).length} leads</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Discount: {Math.round(totals.discountRate * 100)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-300">Subtotal: {formatPrice(totals.subtotal)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Discount: -{formatPrice(totals.discountAmount)}</div>
          <div className="text-lg font-semibold">Total: {formatPrice(totals.total)}</div>
        </div>
        <div className="flex gap-2">
          <button disabled={!Object.keys(selected).length} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">Add to Cart</button>
          <button disabled={!Object.keys(selected).length || checkoutLoading} onClick={handleCheckout} className="px-4 py-2 rounded border disabled:opacity-50">{checkoutLoading ? 'Processing...' : 'Checkout'}</button>
        </div>
      </div>
    </div>
  )
}
