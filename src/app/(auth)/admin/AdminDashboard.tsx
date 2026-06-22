'use client'

import { useEffect, useState } from 'react'
import { createFinancingClient } from '@/lib/supabase/financing-client'

interface DashboardStats {
  totalLeads: number
  newLeadsToday: number
  newLeadsWeek: number
  hotLeads: number
  contactedLeads: number
  fundedLeads: number
  totalUsers: number
  leadsByIndustry: { industry: string; count: number }[]
  leadsByState: { state: string; count: number }[]
  recentLeads: {
    id: string
    company_name: string
    industry: string
    state: string
    lead_score: number
    created_at: string
  }[]
  scraperJobs: {
    id: string
    scraper_type: string
    status: string
    started_at: string
    completed_at: string
    leads_found: number
    errors: number
  }[]
}

type TabType = 'overview' | 'leads' | 'users' | 'scrapers' | 'import' | 'settings'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createFinancingClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    
    // Fetch total leads
    const { count: totalLeads } = await supabase
      .from('financing_leads')
      .select('*', { count: 'exact', head: true })

    // New leads today
    const today = new Date().toISOString().split('T')[0]
    const { count: newLeadsToday } = await supabase
      .from('financing_leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today)

    // New leads this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: newLeadsWeek } = await supabase
      .from('financing_leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo)

    // Hot leads (score >= 80)
    const { count: hotLeads } = await supabase
      .from('financing_leads')
      .select('*', { count: 'exact', head: true })
      .gte('lead_score', 80)

    // Contacted leads
    const { count: contactedLeads } = await supabase
      .from('financing_leads')
      .select('*', { count: 'exact', head: true })
      .eq('contact_status', 'contacted')

    // Funded leads
    const { count: fundedLeads } = await supabase
      .from('financing_leads')
      .select('*', { count: 'exact', head: true })
      .eq('contact_status', 'funded')

    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Leads by industry
    const { data: industryData } = await supabase
      .from('financing_leads')
      .select('industry')
    
    const industryMap: Record<string, number> = {}
    industryData?.forEach(l => {
      if (l.industry) {
        industryMap[l.industry] = (industryMap[l.industry] || 0) + 1
      }
    })
    const leadsByIndustry = Object.entries(industryMap)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Leads by state
    const { data: stateData } = await supabase
      .from('financing_leads')
      .select('state')
    
    const stateMap: Record<string, number> = {}
    stateData?.forEach(l => {
      if (l.state) {
        stateMap[l.state] = (stateMap[l.state] || 0) + 1
      }
    })
    const leadsByState = Object.entries(stateMap)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Recent leads
    const { data: recentLeads } = await supabase
      .from('financing_leads')
      .select('id, company_name, industry, state, lead_score, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // Scraper jobs
    const { data: scraperJobs } = await supabase
      .from('scraper_jobs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10)

    setStats({
      totalLeads: totalLeads || 0,
      newLeadsToday: newLeadsToday || 0,
      newLeadsWeek: newLeadsWeek || 0,
      hotLeads: hotLeads || 0,
      contactedLeads: contactedLeads || 0,
      fundedLeads: fundedLeads || 0,
      totalUsers: totalUsers || 0,
      leadsByIndustry,
      leadsByState,
      recentLeads: recentLeads || [],
      scraperJobs: scraperJobs || [],
    })
    setLoading(false)
  }

  const runScraper = async (type: string) => {
    const res = await fetch('/api/admin/scraper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    if (res.ok) {
      alert(`${type} scraper triggered. Check back in a few minutes.`)
      fetchStats()
    } else {
      alert('Failed to trigger scraper')
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'leads', label: 'Lead Management' },
    { id: 'users', label: 'Users' },
    { id: 'scrapers', label: 'Data Sources' },
    { id: 'import', label: 'Import Data' },
    { id: 'settings', label: 'Settings' },
  ]

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BizOps Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Manage leads, users, and system settings</p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/admin/email-templates" 
            className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Templates
          </a>
          <a 
            href="/admin/platform-features" 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Platform Docs
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex gap-1 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab stats={stats!} />}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'users' && <UsersTab stats={stats!} />}
        {activeTab === 'scrapers' && <ScrapersTab stats={stats!} onRunScraper={runScraper} />}
        {activeTab === 'import' && <ImportTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

function MetricCard({ label, value, subtext, color = 'blue' }: { 
  label: string
  value: number | string
  subtext?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }

  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {subtext && <div className="text-xs mt-1 opacity-70">{subtext}</div>}
    </div>
  )
}

function OverviewTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MetricCard label="Total Leads" value={stats.totalLeads} color="blue" />
        <MetricCard label="New Today" value={stats.newLeadsToday} color="green" />
        <MetricCard label="This Week" value={stats.newLeadsWeek} color="green" />
        <MetricCard label="Hot Leads" value={stats.hotLeads} subtext="Score ≥ 80" color="red" />
        <MetricCard label="Contacted" value={stats.contactedLeads} color="yellow" />
        <MetricCard label="Funded" value={stats.fundedLeads} color="purple" />
        <MetricCard label="Users" value={stats.totalUsers} color="blue" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Leads by Industry */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Leads by Industry</h3>
          {stats.leadsByIndustry.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.leadsByIndustry.map(item => (
                <div key={item.industry} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{item.industry.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / stats.totalLeads) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leads by State */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Leads by State</h3>
          {stats.leadsByState.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.leadsByState.map(item => (
                <div key={item.state} className="flex items-center justify-between">
                  <span className="text-sm">{item.state}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(item.count / stats.totalLeads) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Leads</h3>
        {stats.recentLeads.length === 0 ? (
          <p className="text-gray-500 text-sm">No leads yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Company</th>
                <th className="pb-2">Industry</th>
                <th className="pb-2">State</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Added</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLeads.map(lead => (
                <tr key={lead.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{lead.company_name}</td>
                  <td className="py-2 capitalize">{lead.industry?.replace(/_/g, ' ') || '-'}</td>
                  <td className="py-2">{lead.state || '-'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      (lead.lead_score || 0) >= 80 ? 'bg-red-100 text-red-700' :
                      (lead.lead_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {lead.lead_score || 0}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function LeadsTab() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', industry: '', minScore: 0 })
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const supabase = createFinancingClient()

  useEffect(() => {
    fetchLeads()
  }, [filter])

  const fetchLeads = async () => {
    setLoading(true)
    let query = supabase
      .from('financing_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (filter.status) query = query.eq('contact_status', filter.status)
    if (filter.industry) query = query.eq('industry', filter.industry)
    if (filter.minScore > 0) query = query.gte('lead_score', filter.minScore)

    const { data } = await query
    setLeads(data || [])
    setLoading(false)
  }

  const updateLeadStatus = async (id: string, status: string) => {
    await supabase.from('financing_leads').update({ contact_status: status }).eq('id', id)
    fetchLeads()
  }

  const deleteLead = async (id: string) => {
    if (confirm('Delete this lead?')) {
      await supabase.from('financing_leads').delete().eq('id', id)
      fetchLeads()
    }
  }

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedLeads(newSelected)
  }

  const selectAllLeads = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)))
    }
  }

  const getSelectedLeads = () => leads.filter(l => selectedLeads.has(l.id))

  const exportToCSV = () => {
    const leadsToExport = selectedLeads.size > 0 ? getSelectedLeads() : leads
    const headers = [
      'Company Name', 'Contact Name', 'Email', 'Phone', 'State', 'City',
      'Industry', 'Lead Score', 'Status', 'Loan Amount', 'Loan Purpose',
      'Time in Business', 'Monthly Revenue', 'Credit Score', 'Urgency',
      'Has Collateral', 'Lead Source', 'Calculator Type', 'Qualified Products',
      'Notes', 'Created At'
    ]
    const rows = leadsToExport.map(lead => [
      lead.company_name || '',
      lead.owner_name || '',
      lead.email || '',
      lead.phone || '',
      lead.state || '',
      lead.city || '',
      lead.industry || '',
      lead.lead_score || '',
      lead.contact_status || '',
      lead.loan_amount_requested || '',
      lead.loan_purpose || '',
      lead.time_in_business || '',
      lead.monthly_revenue || '',
      lead.credit_score_range || '',
      lead.urgency || '',
      lead.has_collateral ? 'Yes' : 'No',
      lead.lead_source || '',
      lead.calculator_type || '',
      Array.isArray(lead.qualified_products) ? lead.qualified_products.join('; ') : '',
      (lead.notes || '').replace(/\n/g, ' | '),
      lead.created_at || ''
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const sendToEmail = async (email: string) => {
    const leadsToSend = selectedLeads.size > 0 ? getSelectedLeads() : leads
    try {
      const response = await fetch('/api/admin/leads/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToSend, recipientEmail: email }),
      })
      if (response.ok) {
        alert('Leads sent successfully!')
        setShowEmailModal(false)
      } else {
        alert('Failed to send leads')
      }
    } catch (error) {
      alert('Error sending leads')
    }
  }

  const sendToWebhook = async (webhookUrl: string) => {
    const leadsToSend = selectedLeads.size > 0 ? getSelectedLeads() : leads
    try {
      const response = await fetch('/api/admin/leads/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToSend, webhookUrl }),
      })
      if (response.ok) {
        alert('Leads sent to webhook successfully!')
        setShowWebhookModal(false)
      } else {
        alert('Failed to send to webhook')
      }
    } catch (error) {
      alert('Error sending to webhook')
    }
  }

  const generateShareLink = async () => {
    const leadsToShare = selectedLeads.size > 0 ? getSelectedLeads() : leads
    const leadIds = leadsToShare.map(l => l.id)
    try {
      const response = await fetch('/api/admin/leads/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds }),
      })
      if (response.ok) {
        const data = await response.json()
        setShareUrl(`${window.location.origin}/leads/shared/${data.token}`)
        setShowShareModal(true)
      } else {
        alert('Failed to generate share link')
      }
    } catch (error) {
      alert('Error generating share link')
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="bg-white rounded-lg border p-4 flex gap-3 flex-wrap items-center">
        <span className="text-sm text-gray-600">
          {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : `${leads.length} leads`}
        </span>
        <div className="h-6 w-px bg-gray-200" />
        <button
          onClick={exportToCSV}
          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
        <button
          onClick={() => setShowEmailModal(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email to Buyer
        </button>
        <button
          onClick={() => setShowWebhookModal(true)}
          className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Send to Webhook
        </button>
        <button
          onClick={generateShareLink}
          className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Link
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 flex gap-4 flex-wrap">
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="funded">Funded</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={filter.industry}
          onChange={e => setFilter({ ...filter, industry: e.target.value })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Industries</option>
          <option value="construction">Construction</option>
          <option value="trucking">Trucking</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="hvac">HVAC</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
        </select>

        <select
          value={filter.minScore}
          onChange={e => setFilter({ ...filter, minScore: Number(e.target.value) })}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value={0}>Any Score</option>
          <option value={60}>60+</option>
          <option value={70}>70+</option>
          <option value={80}>80+ (Hot)</option>
          <option value={90}>90+</option>
        </select>

        <button onClick={fetchLeads} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
          Refresh
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No leads found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === leads.length && leads.length > 0}
                    onChange={selectAllLeads}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <>
                  <tr 
                    key={lead.id} 
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`transform transition-transform ${expandedLead === lead.id ? 'rotate-90' : ''}`}>▶</span>
                        <div>
                          <div className="font-medium">{lead.company_name}</div>
                          {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.city && `${lead.city}, `}{lead.state}
                    </td>
                    <td className="px-4 py-3 capitalize">{lead.industry?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (lead.lead_score || 0) >= 80 ? 'bg-red-100 text-red-700' :
                        (lead.lead_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lead.lead_score || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={lead.contact_status || 'new'}
                        onChange={e => updateLeadStatus(lead.id, e.target.value)}
                        className="border rounded px-2 py-1 text-xs"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="funded">Funded</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedLead === lead.id && (
                    <tr key={`${lead.id}-details`} className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Contact Name</div>
                            <div className="font-medium">{lead.owner_name || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Email</div>
                            <div className="font-medium">{lead.email ? <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a> : '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Phone</div>
                            <div className="font-medium">{lead.phone ? <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a> : '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Loan Amount</div>
                            <div className="font-medium">{lead.loan_amount_requested ? `$${Number(lead.loan_amount_requested).toLocaleString()}` : '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Loan Purpose</div>
                            <div className="font-medium capitalize">{lead.loan_purpose?.replace(/_/g, ' ') || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Time in Business</div>
                            <div className="font-medium">{lead.time_in_business?.replace(/_/g, ' ') || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Monthly Revenue</div>
                            <div className="font-medium">{lead.monthly_revenue?.replace(/_/g, ' ') || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Credit Score</div>
                            <div className="font-medium capitalize">{lead.credit_score_range || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Urgency</div>
                            <div className="font-medium">{lead.urgency?.replace(/_/g, ' ') || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Has Collateral</div>
                            <div className="font-medium">{lead.has_collateral === true ? 'Yes' : lead.has_collateral === false ? 'No' : '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Lead Source</div>
                            <div className="font-medium">{lead.lead_source || lead.source_type || '-'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Calculator Type</div>
                            <div className="font-medium capitalize">{lead.calculator_type?.replace(/-/g, ' ') || '-'}</div>
                          </div>
                        </div>
                        {lead.notes && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-gray-500 text-xs mb-1">Notes</div>
                            <div className="text-sm whitespace-pre-wrap">{lead.notes}</div>
                          </div>
                        )}
                        <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                          Created: {new Date(lead.created_at).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Email Leads to Buyer</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const email = (form.elements.namedItem('email') as HTMLInputElement).value
              sendToEmail(email)
            }}>
              <input
                name="email"
                type="email"
                placeholder="buyer@example.com"
                className="w-full border rounded px-3 py-2 mb-4"
                required
              />
              <p className="text-sm text-gray-500 mb-4">
                {selectedLeads.size > 0 ? `${selectedLeads.size} leads selected` : `All ${leads.length} leads`} will be sent
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send to Webhook/CRM</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const url = (form.elements.namedItem('webhookUrl') as HTMLInputElement).value
              sendToWebhook(url)
            }}>
              <input
                name="webhookUrl"
                type="url"
                placeholder="https://your-crm.com/webhook/leads"
                className="w-full border rounded px-3 py-2 mb-4"
                required
              />
              <p className="text-sm text-gray-500 mb-4">
                {selectedLeads.size > 0 ? `${selectedLeads.size} leads selected` : `All ${leads.length} leads`} will be sent as JSON
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Send to Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share Link Generated</h3>
            <div className="bg-gray-100 p-3 rounded mb-4 break-all text-sm">
              {shareUrl}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  alert('Link copied to clipboard!')
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsersTab({ stats }: { stats: DashboardStats }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createFinancingClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const toggleAdmin = async (id: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ is_admin: !currentStatus }).eq('id', id)
    fetchUsers()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4">User Management</h3>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Email</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Admin</th>
                <th className="pb-2">Joined</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.display_name || '-'}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      user.is_admin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.is_admin ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleAdmin(user.id, user.is_admin)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ScrapersTab({ stats, onRunScraper }: { stats: DashboardStats; onRunScraper: (type: string) => void }) {
  const scrapers = [
    { 
      id: 'contracts', 
      name: 'SAM.gov Government Contracts', 
      description: 'Federal contract awards to small businesses',
      status: 'active',
      cost: 'Free',
      schedule: 'Daily at 6 AM UTC'
    },
    { 
      id: 'ucc', 
      name: 'UCC Filings', 
      description: 'Equipment-secured loan filings from state databases',
      status: 'manual',
      cost: 'CSV Import Only',
      schedule: 'Manual upload'
    },
    { 
      id: 'hiring', 
      name: 'Job Postings', 
      description: 'Equipment operator and driver job postings',
      status: 'disabled',
      cost: 'Requires SerpAPI ($50/mo)',
      schedule: 'Disabled'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Data Sources */}
      <div className="grid md:grid-cols-3 gap-4">
        {scrapers.map(scraper => (
          <div key={scraper.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold">{scraper.name}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${
                scraper.status === 'active' ? 'bg-green-100 text-green-700' :
                scraper.status === 'manual' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {scraper.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{scraper.description}</p>
            <div className="text-xs text-gray-500 space-y-1">
              <div><strong>Cost:</strong> {scraper.cost}</div>
              <div><strong>Schedule:</strong> {scraper.schedule}</div>
            </div>
            {scraper.status === 'active' && (
              <button
                onClick={() => onRunScraper(scraper.id)}
                className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Run Now
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Recent Scraper Jobs</h3>
        {stats.scraperJobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No jobs recorded yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Type</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Leads Found</th>
                <th className="pb-2">Errors</th>
                <th className="pb-2">Started</th>
                <th className="pb-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {stats.scraperJobs.map(job => (
                <tr key={job.id} className="border-b last:border-0">
                  <td className="py-2 capitalize">{job.scraper_type}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-2">{job.leads_found}</td>
                  <td className="py-2">{job.errors}</td>
                  <td className="py-2 text-gray-500">
                    {new Date(job.started_at).toLocaleString()}
                  </td>
                  <td className="py-2 text-gray-500">
                    {job.completed_at ? 
                      `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s` : 
                      '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ImportTab() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault()
    setUploading(true)
    setResult(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append('type', type)

    const res = await fetch('/api/admin/import', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (res.ok) {
      setResult({ success: `Imported ${data.count} records` })
    } else {
      setResult({ error: data.error || 'Import failed' })
    }
    setUploading(false)
  }

  const importTypes = [
    {
      id: 'financing_leads',
      name: 'Financing Leads',
      description: 'Import leads directly into the financing leads table',
      columns: 'company_name, state, city, industry, phone, email, website'
    },
    {
      id: 'ucc',
      name: 'UCC Filings',
      description: 'Import UCC filing data to generate leads',
      columns: 'debtor_name, secured_party, filing_number, filing_date, state, collateral_description'
    },
    {
      id: 'contracts',
      name: 'Government Contracts',
      description: 'Import contract award data',
      columns: 'awardee_name, contract_number, award_amount, award_date, description, state'
    },
    {
      id: 'marketplace',
      name: 'Marketplace Leads',
      description: 'Import leads for the /browse marketplace',
      columns: 'Company Name, Owner Name, Phone, Email, State, Zip Code, Industry, Time in Business, Monthly Revenue, Loan Purpose, Loan Amount Requested, Lead Source, Date Acquired'
    },
  ]

  return (
    <div className="space-y-6">
      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.success || result.error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {importTypes.map(type => (
          <div key={type.id} className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-2">{type.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{type.description}</p>
            <div className="text-xs text-gray-500 mb-4">
              <strong>Required columns:</strong><br />
              <code className="bg-gray-100 px-1 rounded">{type.columns}</code>
            </div>
            <form onSubmit={e => handleUpload(e, type.id)}>
              <input 
                type="file" 
                name="file" 
                accept=".csv" 
                required 
                className="block w-full text-sm mb-3"
              />
              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsTab() {
  const [settings, setSettings] = useState({
    companyName: 'BizOps',
    supportEmail: '',
    scraperEnabled: true,
    emailNotifications: false,
    slackWebhook: '',
  })

  const handleSave = async () => {
    // Save to database or localStorage
    localStorage.setItem('bizops_settings', JSON.stringify(settings))
    alert('Settings saved')
  }

  useEffect(() => {
    const saved = localStorage.getItem('bizops_settings')
    if (saved) setSettings(JSON.parse(saved))
  }, [])

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">General Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={e => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="support@yourcompany.com"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Notifications</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Email notifications for hot leads (score ≥ 80)</span>
          </label>

          <div>
            <label className="block text-sm font-medium mb-1">Slack Webhook URL</label>
            <input
              type="url"
              value={settings.slackWebhook}
              onChange={e => setSettings({ ...settings, slackWebhook: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="https://hooks.slack.com/services/..."
            />
            <p className="text-xs text-gray-500 mt-1">Get notified in Slack when new leads are found</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Data Sources</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.scraperEnabled}
              onChange={e => setSettings({ ...settings, scraperEnabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Enable automated scrapers (SAM.gov daily)</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Settings
      </button>
    </div>
  )
}
