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

  return (
    <div className="space-y-4">
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
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.company_name}</div>
                    {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
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
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
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
