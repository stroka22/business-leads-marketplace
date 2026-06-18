import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1 bg-green-500/20 text-green-400 rounded-full text-sm mb-6 border border-green-500/30">
                🎯 For Business Financing Professionals
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Buy Pre-Qualified Business Financing Leads
              </h1>
              <p className="mt-6 text-xl text-slate-300">
                Access real-time leads from businesses actively seeking equipment financing, working capital, 
                SBA loans, and more. AI-scored and ready to close.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/financing"
                  className="px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition text-center text-lg"
                >
                  View Lead Dashboard →
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition text-center text-lg border border-white/30"
                >
                  Login to Account
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">✓ Real-time leads</span>
                <span className="flex items-center gap-2">✓ AI-scored quality</span>
                <span className="flex items-center gap-2">✓ Exclusive territories</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 text-slate-200">Today's Lead Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">47</div>
                    <div className="text-sm text-slate-400">New Leads Today</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">82</div>
                    <div className="text-sm text-slate-400">Avg. Lead Score</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">$2.4M</div>
                    <div className="text-sm text-slate-400">Funding Requested</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">12</div>
                    <div className="text-sm text-slate-400">Hot Leads (90+)</div>
                  </div>
                </div>
                <Link
                  href="/financing"
                  className="block mt-4 text-center py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                >
                  Access Leads →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-8 bg-slate-50 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">10+</div>
              <div className="text-sm text-slate-500">Signal Types Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">SAM.gov</div>
              <div className="text-sm text-slate-500">Contract Data</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">AI</div>
              <div className="text-sm text-slate-500">Lead Scoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-700">Real-Time</div>
              <div className="text-sm text-slate-500">Data Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Sources */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Multi-Signal Lead Intelligence
            </h2>
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
              We aggregate data from multiple sources to identify businesses with high financing intent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🏛️',
                title: 'Government Contracts',
                desc: 'Businesses winning federal contracts often need working capital or equipment to fulfill them.',
                source: 'SAM.gov',
                status: 'Active',
              },
              {
                icon: '📋',
                title: 'UCC Filings',
                desc: 'Equipment-secured loans indicate businesses that already use financing and may need more.',
                source: 'State Records',
                status: 'CSV Import',
              },
              {
                icon: '👥',
                title: 'Hiring Signals',
                desc: 'Companies hiring equipment operators, drivers, and technicians are growing and need capital.',
                source: 'Job Boards',
                status: 'Coming Soon',
              },
              {
                icon: '🏗️',
                title: 'Permit Activity',
                desc: 'Building permits and expansion filings indicate growth that requires financing.',
                source: 'Municipal Records',
                status: 'Coming Soon',
              },
              {
                icon: '🤝',
                title: 'Dealer Referrals',
                desc: 'Equipment dealers refer customers who need financing for purchases.',
                source: 'Partner Network',
                status: 'Active',
              },
              {
                icon: '🌐',
                title: 'Web Applications',
                desc: 'Business owners who apply through our qualification tool are high-intent leads.',
                source: 'BizOps.com',
                status: 'Active',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'Active' ? 'bg-green-100 text-green-700' :
                    item.status === 'CSV Import' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{item.desc}</p>
                <div className="mt-4 pt-4 border-t text-xs text-slate-500">
                  Source: {item.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Scoring */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                AI-Powered Lead Scoring
              </h2>
              <p className="mt-4 text-xl text-slate-600">
                Every lead is automatically scored 0-100 based on multiple signals. Focus your time on the highest-potential opportunities.
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  { score: '90-100', label: 'Hot', desc: 'Multiple strong signals, high close probability', color: 'red' },
                  { score: '70-89', label: 'Warm', desc: 'Good indicators, worth immediate outreach', color: 'orange' },
                  { score: '50-69', label: 'Moderate', desc: 'Some signals, may need nurturing', color: 'yellow' },
                  { score: '0-49', label: 'Cool', desc: 'Early stage, monitor for changes', color: 'blue' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      item.color === 'red' ? 'bg-red-500' :
                      item.color === 'orange' ? 'bg-orange-500' :
                      item.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {item.score.split('-')[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{item.label} ({item.score})</div>
                      <div className="text-sm text-slate-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Sample Lead Card</h3>
              <div className="border rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-lg">Precision Contractors LLC</div>
                    <div className="text-sm text-slate-500">Construction • Houston, TX</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-500">92</div>
                    <div className="text-xs text-slate-500">Lead Score</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">✓</span>
                    <span>Won $890K federal contract (SAM.gov)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">✓</span>
                    <span>UCC filing with CAT Financial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">✓</span>
                    <span>Hiring 3 equipment operators</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs text-slate-500 mb-2">AI Recommendation</div>
                  <div className="text-sm text-slate-700">
                    "Strong candidate for equipment financing ($150K-$300K range). Recent contract win indicates growth and ability to repay."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Industries We Cover
            </h2>
            <p className="mt-4 text-xl text-slate-600">
              Leads across high-financing-need industries
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: '🔧', name: 'Construction' },
              { icon: '🚛', name: 'Trucking' },
              { icon: '🏭', name: 'Manufacturing' },
              { icon: '❄️', name: 'HVAC' },
              { icon: '🔌', name: 'Electrical' },
              { icon: '🚿', name: 'Plumbing' },
              { icon: '🏠', name: 'Roofing' },
              { icon: '🌳', name: 'Landscaping' },
              { icon: '🚗', name: 'Auto Services' },
              { icon: '🍽️', name: 'Restaurants' },
              { icon: '🏥', name: 'Healthcare' },
              { icon: '🚜', name: 'Agriculture' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-slate-700">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Grow Your Pipeline?
          </h2>
          <p className="mt-4 text-xl text-green-100">
            Get access to pre-qualified business financing leads. Start closing more deals today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/financing"
              className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-slate-100 transition text-lg"
            >
              View Lead Dashboard →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-green-800 text-white font-semibold rounded-xl hover:bg-green-900 transition text-lg border border-green-500"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold text-white mb-4">BizOps</div>
              <p className="text-sm">
                Lead intelligence platform for business financing professionals. Powered by PipelineAI.
              </p>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Platform</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/financing" className="hover:text-white">Lead Dashboard</Link></li>
                <li><Link href="/admin" className="hover:text-white">Admin Tools</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">For Business Owners</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/apply" className="hover:text-white">Apply for Financing</Link></li>
                <li><Link href="/apply/calculator" className="hover:text-white">Loan Calculator</Link></li>
                <li><Link href="/apply/qualify" className="hover:text-white">Check Eligibility</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Contact</div>
              <ul className="space-y-2 text-sm">
                <li>support@getpipelineai.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
            © {new Date().getFullYear()} BizOps by PipelineAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
