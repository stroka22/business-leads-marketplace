export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PlatformFeaturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Log In</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-sm">← Back to Dashboard</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Platform Features & Documentation</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Overview</h2>
          <p className="text-gray-700 mb-4">
            The BizOps Lead Intelligence Platform consists of two interconnected systems:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">BizOps (bizops.getpipelineai.com)</h3>
              <p className="text-blue-800 text-sm">
                Internal platform for financing advisors and brokers. Manage leads, view analytics, 
                purchase pre-qualified business financing leads, and track deal flow.
              </p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="font-bold text-emerald-900 mb-2">GetMyBizLoan.com</h3>
              <p className="text-emerald-800 text-sm">
                Consumer-facing lead generation website. Business owners use calculators, 
                get pre-qualified, and submit applications. Leads flow into BizOps CRM.
              </p>
            </div>
          </div>
        </section>

        {/* GetMyBizLoan Features */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">GetMyBizLoan.com Features</h2>
          
          <div className="space-y-8">
            {/* Calculator Network */}
            <div className="border-b border-gray-100 pb-8">
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">1</span>
                National Calculator Network (454 Pages)
              </h3>
              <p className="text-gray-600 mb-4">
                SEO-optimized calculator pages targeting high-intent business financing searches. Each page captures leads before showing full results.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">39 National Calculators</p>
                  <p className="text-gray-600">Equipment, truck, SBA, working capital, acquisition, CRE, LOC, and industry-specific calculators</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">400 State Calculators</p>
                  <p className="text-gray-600">50 states × 8 calculator types with localized content, FAQs, and statistics</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">9 Industry Pages</p>
                  <p className="text-gray-600">Trucking, construction, healthcare, restaurant, manufacturing, retail, and more</p>
                </div>
              </div>
            </div>

            {/* Lead Capture */}
            <div className="border-b border-gray-100 pb-8">
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">2</span>
                Lead Capture System
              </h3>
              <p className="text-gray-600 mb-4">
                Multi-point lead capture throughout the site. All leads are stored in Supabase and available in the BizOps admin dashboard.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Calculator Lead Gate</p>
                  <p className="text-gray-600">Users must enter contact info before seeing full payment calculations and AI scoring results</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Qualification Wizard</p>
                  <p className="text-gray-600">6-step guided assessment that pre-qualifies leads and generates PDF pre-approval letters</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Data Captured</p>
                  <p className="text-gray-600">Business name, contact info, industry, revenue, time in business, credit score, funding amount, urgency</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Source Tracking</p>
                  <p className="text-gray-600">Every lead tagged with source page (e.g., "texas-equipment-financing-calculator")</p>
                </div>
              </div>
            </div>

            {/* AI Lead Scoring */}
            <div className="border-b border-gray-100 pb-8">
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">3</span>
                AI Lead Scoring (OpenAI GPT-4)
              </h3>
              <p className="text-gray-600 mb-4">
                Instant AI-powered lead analysis when users submit the calculator form. Provides qualification insights to both the user and the CRM.
              </p>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Lead Score</p>
                  <p className="text-gray-600">0-100 score based on business profile</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Approval Probability</p>
                  <p className="text-gray-600">Estimated % chance of approval</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Classification</p>
                  <p className="text-gray-600">Hot, Warm, or Cold lead status</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Product Matching</p>
                  <p className="text-gray-600">Recommended financing products</p>
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="border-b border-gray-100 pb-8">
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">4</span>
                Document Upload Portal
              </h3>
              <p className="text-gray-600 mb-4">
                Secure document collection for application processing. Accepts bank statements, tax returns, and other required documents.
              </p>
              <p className="text-sm text-gray-500">Route: /documents</p>
            </div>

            {/* Comparison Tool */}
            <div className="border-b border-gray-100 pb-8">
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">5</span>
                Financing Comparison Tool
              </h3>
              <p className="text-gray-600 mb-4">
                Side-by-side comparison of different loan types to help business owners understand their options.
              </p>
              <p className="text-sm text-gray-500">Route: /compare</p>
            </div>

            {/* PDF Generation */}
            <div className="border-b border-gray-100 pb-8">
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">6</span>
                PDF Pre-Qualification Letters
              </h3>
              <p className="text-gray-600 mb-4">
                Automatically generated PDF letters after completing the qualification wizard. Provides users with a professional document showing their pre-approved amount.
              </p>
              <p className="text-sm text-gray-500">API: /api/pdf/prequal</p>
            </div>

            {/* Analytics */}
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">7</span>
                Google Tag Manager Integration
              </h3>
              <p className="text-gray-600 mb-4">
                Full GTM implementation for tracking conversions and user behavior. Events pushed to dataLayer for flexible tag configuration.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">calculator_start</p>
                  <p className="text-gray-600">User clicks calculate button</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">generate_lead</p>
                  <p className="text-gray-600">Lead form submitted (conversion)</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">pdf_download</p>
                  <p className="text-gray-600">Pre-qual letter downloaded</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">GTM Container: GTM-K3V5ZWW6</p>
            </div>
          </div>
        </section>

        {/* BizOps Features */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">BizOps Admin Features</h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Lead Management Dashboard</p>
              <p className="text-gray-600 text-sm">View, filter, and manage all captured leads. See lead scores, contact status, and source tracking.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Lead Signals</p>
              <p className="text-gray-600 text-sm">Track engagement signals for each lead - web captures, contact attempts, and more.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">SAM.gov Integration</p>
              <p className="text-gray-600 text-sm">Scrape and import government contract leads from SAM.gov for B2G opportunities.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Authentication</p>
              <p className="text-gray-600 text-sm">Supabase magic link authentication with Resend SMTP for email delivery.</p>
            </div>
          </div>
        </section>

        {/* Technical Stack */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Technical Stack</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Framework</p>
              <p className="text-gray-600">Next.js 16 (App Router)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Database</p>
              <p className="text-gray-600">Supabase (PostgreSQL)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">AI</p>
              <p className="text-gray-600">OpenAI GPT-4</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Hosting</p>
              <p className="text-gray-600">Vercel</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Styling</p>
              <p className="text-gray-600">Tailwind CSS</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">PDF Generation</p>
              <p className="text-gray-600">@react-pdf/renderer</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Analytics</p>
              <p className="text-gray-600">Google Tag Manager</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-gray-600">Resend SMTP</p>
            </div>
          </div>
        </section>

        {/* Page Inventory */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">GetMyBizLoan.com Page Inventory</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Page Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Example Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 text-gray-700">Homepage</td>
                  <td className="py-3 px-4 text-gray-700">1</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">National Calculators</td>
                  <td className="py-3 px-4 text-gray-700">39</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/equipment-financing-calculator</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">State Calculators</td>
                  <td className="py-3 px-4 text-gray-700">400</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/texas-equipment-financing-calculator</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Industry Pages</td>
                  <td className="py-3 px-4 text-gray-700">9</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/industry/trucking</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Qualification Wizard</td>
                  <td className="py-3 px-4 text-gray-700">1</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/qualify</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Comparison Tool</td>
                  <td className="py-3 px-4 text-gray-700">1</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/compare</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Document Upload</td>
                  <td className="py-3 px-4 text-gray-700">1</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/documents</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">States Index</td>
                  <td className="py-3 px-4 text-gray-700">1</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/states</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Calculators Index</td>
                  <td className="py-3 px-4 text-gray-700">1</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/calculators</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Industries Index</td>
                  <td className="py-3 px-4 text-gray-700">1</td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-xs">/industry</td>
                </tr>
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-3 px-4 text-gray-900">Total Pages</td>
                  <td className="py-3 px-4 text-gray-900">454+</td>
                  <td className="py-3 px-4 text-gray-500"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
