'use client'

import { useState } from 'react'

interface QualificationResult {
  loanType: string
  name: string
  matchScore: number
  maxAmount: string
  rate: string
  term: string
  speed: string
  likelihood: 'High' | 'Medium' | 'Low'
  description: string
}

type Step = 'purpose' | 'amount' | 'business' | 'revenue' | 'credit' | 'contact' | 'results'

export default function QualificationWizard() {
  const [step, setStep] = useState<Step>('purpose')
  const [answers, setAnswers] = useState({
    purpose: '',
    amount: '',
    businessType: '',
    timeInBusiness: '',
    monthlyRevenue: '',
    creditScore: '',
    hasCollateral: '',
    urgency: '',
    // Contact
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    state: '',
  })
  const [results, setResults] = useState<QualificationResult[]>([])
  const [submitted, setSubmitted] = useState(false)

  const updateAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const calculateResults = (): QualificationResult[] => {
    const results: QualificationResult[] = []
    
    const timeScore = answers.timeInBusiness === '5yr_plus' ? 100 :
                      answers.timeInBusiness === '2yr_5yr' ? 80 :
                      answers.timeInBusiness === '1yr_2yr' ? 60 :
                      answers.timeInBusiness === '6mo_1yr' ? 40 : 20
    
    const revenueScore = answers.monthlyRevenue === '500k_plus' ? 100 :
                         answers.monthlyRevenue === '250k_500k' ? 90 :
                         answers.monthlyRevenue === '100k_250k' ? 80 :
                         answers.monthlyRevenue === '50k_100k' ? 70 :
                         answers.monthlyRevenue === '25k_50k' ? 60 :
                         answers.monthlyRevenue === '10k_25k' ? 40 : 20
    
    const creditScore = answers.creditScore === 'excellent' ? 100 :
                        answers.creditScore === 'good' ? 80 :
                        answers.creditScore === 'fair' ? 60 :
                        answers.creditScore === 'poor' ? 40 : 20
    
    const amountNum = parseInt(answers.amount) || 50000

    // SBA Loan - strict requirements
    if (timeScore >= 80 && creditScore >= 80 && revenueScore >= 60) {
      results.push({
        loanType: 'sba_loan',
        name: 'SBA Loan',
        matchScore: Math.round((timeScore + creditScore + revenueScore) / 3),
        maxAmount: '$5,000,000',
        rate: '5.5% - 11%',
        term: 'Up to 25 years',
        speed: '30-90 days',
        likelihood: 'High',
        description: 'Best rates available. Government-backed with longer terms.',
      })
    }

    // Term Loan
    if (timeScore >= 60 && creditScore >= 60 && revenueScore >= 50) {
      const score = Math.round((timeScore + creditScore + revenueScore) / 3)
      results.push({
        loanType: 'term_loan',
        name: 'Business Term Loan',
        matchScore: score,
        maxAmount: '$500,000',
        rate: '7% - 25%',
        term: '1-5 years',
        speed: '3-7 days',
        likelihood: score >= 75 ? 'High' : 'Medium',
        description: 'Fixed monthly payments. Great for planned expenses.',
      })
    }

    // Equipment Financing - if purpose matches
    if ((answers.purpose === 'equipment' || answers.purpose === 'vehicle') && 
        timeScore >= 40 && creditScore >= 50) {
      results.push({
        loanType: 'equipment_financing',
        name: 'Equipment Financing',
        matchScore: Math.round((timeScore + creditScore + 80) / 3),
        maxAmount: '$2,000,000',
        rate: '6% - 20%',
        term: '2-7 years',
        speed: '3-5 days',
        likelihood: 'High',
        description: 'Equipment serves as collateral. Higher approval rates.',
      })
    }

    // Business Line of Credit
    if (timeScore >= 40 && creditScore >= 50 && revenueScore >= 40) {
      results.push({
        loanType: 'business_loc',
        name: 'Business Line of Credit',
        matchScore: Math.round((timeScore + creditScore + revenueScore) / 3),
        maxAmount: '$250,000',
        rate: '8% - 30%',
        term: 'Revolving',
        speed: '3-7 days',
        likelihood: creditScore >= 70 ? 'High' : 'Medium',
        description: 'Draw funds as needed. Only pay interest on what you use.',
      })
    }

    // Invoice Factoring - if B2B
    if (answers.businessType === 'b2b' && revenueScore >= 40) {
      results.push({
        loanType: 'invoice_factoring',
        name: 'Invoice Factoring',
        matchScore: Math.round((revenueScore + 80) / 2),
        maxAmount: '$5,000,000',
        rate: '1% - 5% per month',
        term: 'Ongoing',
        speed: '24-48 hours',
        likelihood: 'High',
        description: 'Convert invoices to cash immediately. No debt on books.',
      })
    }

    // Working Capital - easier qualification
    if (timeScore >= 20 && revenueScore >= 30) {
      const score = Math.round((timeScore + revenueScore + 60) / 3)
      results.push({
        loanType: 'working_capital',
        name: 'Working Capital Loan',
        matchScore: score,
        maxAmount: '$500,000',
        rate: '10% - 40%',
        term: '3-36 months',
        speed: '1-3 days',
        likelihood: score >= 60 ? 'High' : 'Medium',
        description: 'Fast funding for operational needs. Flexible requirements.',
      })
    }

    // Merchant Cash Advance - easiest qualification
    if (revenueScore >= 20) {
      results.push({
        loanType: 'merchant_cash',
        name: 'Merchant Cash Advance',
        matchScore: Math.round((revenueScore + 70) / 2),
        maxAmount: '$500,000',
        rate: '20% - 50% factor',
        term: '3-18 months',
        speed: '24-48 hours',
        likelihood: 'High',
        description: 'No credit score minimum. Repay from daily sales.',
      })
    }

    // Commercial Real Estate
    if (answers.purpose === 'real_estate' && timeScore >= 60 && creditScore >= 70) {
      results.push({
        loanType: 'commercial_real_estate',
        name: 'Commercial Real Estate Loan',
        matchScore: Math.round((timeScore + creditScore + 70) / 3),
        maxAmount: '$10,000,000',
        rate: '5% - 12%',
        term: 'Up to 25 years',
        speed: '30-60 days',
        likelihood: creditScore >= 80 ? 'High' : 'Medium',
        description: 'Finance property purchase or refinance existing.',
      })
    }

    // Sort by match score
    return results.sort((a, b) => b.matchScore - a.matchScore)
  }

  const handleSubmit = async () => {
    const qualificationResults = calculateResults()
    setResults(qualificationResults)
    
    // Submit lead
    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'qualification_wizard',
          company_name: answers.companyName,
          contact_name: answers.contactName,
          email: answers.email,
          phone: answers.phone,
          state: answers.state,
          loan_purpose: answers.purpose,
          loan_amount: answers.amount,
          time_in_business: answers.timeInBusiness,
          monthly_revenue: answers.monthlyRevenue,
          credit_score: answers.creditScore,
          has_collateral: answers.hasCollateral,
          urgency: answers.urgency,
          qualified_products: qualificationResults.map(r => r.loanType),
        }),
      })
      setSubmitted(true)
    } catch (e) {
      console.error(e)
    }
    
    setStep('results')
  }

  const steps: { id: Step; label: string }[] = [
    { id: 'purpose', label: 'Purpose' },
    { id: 'amount', label: 'Amount' },
    { id: 'business', label: 'Business' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'credit', label: 'Credit' },
    { id: 'contact', label: 'Contact' },
    { id: 'results', label: 'Results' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold mb-4 border border-emerald-500/30">
            No Credit Impact
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            See What You Qualify For
          </h1>
          <p className="text-slate-300 text-center mt-3 text-lg">
            Answer a few questions to see your personalized financing options in 60 seconds
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {step !== 'results' && (
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            {steps.slice(0, -1).map((s, i) => (
              <span key={s.id} className={i <= currentStepIndex ? 'text-green-600 font-medium' : ''}>
                {s.label}
              </span>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 'purpose' && (
          <StepCard
            title="What do you need financing for?"
            subtitle="Select the primary purpose for your funding"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'working_capital', label: '💰 Working Capital', desc: 'Cash flow, payroll, operations' },
                { value: 'equipment', label: '🔧 Equipment', desc: 'Machinery, tools, technology' },
                { value: 'vehicle', label: '🚛 Vehicles', desc: 'Trucks, fleet, commercial vehicles' },
                { value: 'expansion', label: '📈 Expansion', desc: 'Growth, new locations, hiring' },
                { value: 'inventory', label: '📦 Inventory', desc: 'Stock, materials, supplies' },
                { value: 'real_estate', label: '🏢 Real Estate', desc: 'Purchase or refinance property' },
                { value: 'debt_consolidation', label: '💳 Debt Payoff', desc: 'Consolidate existing debt' },
                { value: 'startup', label: '🚀 Startup', desc: 'Launch a new business' },
                { value: 'other', label: '❓ Other', desc: 'Something else' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateAnswer('purpose', opt.value)
                    setStep('amount')
                  }}
                  className={`p-4 text-left rounded-xl border-2 hover:border-green-500 transition-all ${
                    answers.purpose === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-lg">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </StepCard>
        )}

        {step === 'amount' && (
          <StepCard
            title="How much funding do you need?"
            subtitle="Select your desired funding amount"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: '10000', label: '$5K - $25K' },
                { value: '50000', label: '$25K - $75K' },
                { value: '100000', label: '$75K - $150K' },
                { value: '250000', label: '$150K - $350K' },
                { value: '500000', label: '$350K - $750K' },
                { value: '1000000', label: '$750K - $2M' },
                { value: '3000000', label: '$2M - $5M' },
                { value: '5000000', label: '$5M+' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateAnswer('amount', opt.value)
                    setStep('business')
                  }}
                  className={`p-4 text-center rounded-xl border-2 hover:border-green-500 transition-all ${
                    answers.amount === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-lg font-semibold">{opt.label}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('purpose')} className="mt-4 text-gray-500 hover:text-gray-700">
              ← Back
            </button>
          </StepCard>
        )}

        {step === 'business' && (
          <StepCard
            title="Tell us about your business"
            subtitle="This helps us find the right financing options"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of business do you have?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'b2b', label: 'B2B', desc: 'Sell to other businesses' },
                    { value: 'b2c', label: 'B2C', desc: 'Sell to consumers' },
                    { value: 'both', label: 'Both', desc: 'B2B and B2C' },
                    { value: 'other', label: 'Other', desc: 'Service, nonprofit, etc.' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateAnswer('businessType', opt.value)}
                      className={`p-4 text-left rounded-xl border-2 hover:border-green-500 transition-all ${
                        answers.businessType === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How long have you been in business?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { value: 'under_6mo', label: '< 6 months' },
                    { value: '6mo_1yr', label: '6-12 months' },
                    { value: '1yr_2yr', label: '1-2 years' },
                    { value: '2yr_5yr', label: '2-5 years' },
                    { value: '5yr_plus', label: '5+ years' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateAnswer('timeInBusiness', opt.value)}
                      className={`p-3 text-center rounded-xl border-2 hover:border-green-500 transition-all ${
                        answers.timeInBusiness === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('amount')} className="text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <button
                onClick={() => setStep('revenue')}
                disabled={!answers.businessType || !answers.timeInBusiness}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </StepCard>
        )}

        {step === 'revenue' && (
          <StepCard
            title="What's your monthly revenue?"
            subtitle="This determines your funding capacity"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'under_10k', label: 'Under $10K' },
                { value: '10k_25k', label: '$10K - $25K' },
                { value: '25k_50k', label: '$25K - $50K' },
                { value: '50k_100k', label: '$50K - $100K' },
                { value: '100k_250k', label: '$100K - $250K' },
                { value: '250k_500k', label: '$250K - $500K' },
                { value: '500k_plus', label: '$500K+' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateAnswer('monthlyRevenue', opt.value)
                    setStep('credit')
                  }}
                  className={`p-4 text-center rounded-xl border-2 hover:border-green-500 transition-all ${
                    answers.monthlyRevenue === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-semibold">{opt.label}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('business')} className="mt-4 text-gray-500 hover:text-gray-700">
              ← Back
            </button>
          </StepCard>
        )}

        {step === 'credit' && (
          <StepCard
            title="What's your estimated credit score?"
            subtitle="Don't worry - this won't affect your credit"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'excellent', label: 'Excellent', range: '720+', color: 'green' },
                  { value: 'good', label: 'Good', range: '680-719', color: 'blue' },
                  { value: 'fair', label: 'Fair', range: '620-679', color: 'yellow' },
                  { value: 'poor', label: 'Poor', range: '580-619', color: 'orange' },
                  { value: 'bad', label: 'Challenged', range: 'Below 580', color: 'red' },
                  { value: 'unknown', label: "I don't know", range: '', color: 'gray' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('creditScore', opt.value)}
                    className={`p-4 text-center rounded-xl border-2 hover:border-green-500 transition-all ${
                      answers.creditScore === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    {opt.range && <div className="text-xs text-gray-500">{opt.range}</div>}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you have collateral available? (equipment, property, inventory)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                    { value: 'maybe', label: 'Maybe' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateAnswer('hasCollateral', opt.value)}
                      className={`p-3 text-center rounded-xl border-2 hover:border-green-500 transition-all ${
                        answers.hasCollateral === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How soon do you need funding?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'asap', label: 'ASAP' },
                    { value: '1_week', label: 'Within a week' },
                    { value: '2_weeks', label: '1-2 weeks' },
                    { value: '1_month', label: '1 month+' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateAnswer('urgency', opt.value)}
                      className={`p-3 text-center rounded-xl border-2 hover:border-green-500 transition-all ${
                        answers.urgency === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('revenue')} className="text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <button
                onClick={() => setStep('contact')}
                disabled={!answers.creditScore}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                See My Options →
              </button>
            </div>
          </StepCard>
        )}

        {step === 'contact' && (
          <StepCard
            title="Almost there! Where should we send your results?"
            subtitle="Get your personalized financing options instantly"
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={answers.companyName}
                    onChange={(e) => updateAnswer('companyName', e.target.value)}
                    className="w-full border-2 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="Your Company LLC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={answers.contactName}
                    onChange={(e) => updateAnswer('contactName', e.target.value)}
                    className="w-full border-2 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={answers.email}
                    onChange={(e) => updateAnswer('email', e.target.value)}
                    className="w-full border-2 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={answers.phone}
                    onChange={(e) => updateAnswer('phone', e.target.value)}
                    className="w-full border-2 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select
                  required
                  value={answers.state}
                  onChange={(e) => updateAnswer('state', e.target.value)}
                  className="w-full border-2 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select your state...</option>
                  {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <label className="flex items-start gap-3">
                  <input type="checkbox" required className="mt-1" />
                  <span className="text-sm text-gray-600">
                    I agree to receive my financing options and be contacted by a financing specialist. 
                    Message and data rates may apply. Reply STOP to opt out.
                  </span>
                </label>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep('credit')} className="text-gray-500 hover:text-gray-700">
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-lg"
                >
                  See My Results →
                </button>
              </div>
            </form>
          </StepCard>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold">Great News, {answers.contactName.split(' ')[0]}!</h2>
              <p className="mt-2 opacity-90">
                Based on your profile, you may qualify for {results.length} financing options.
              </p>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {results.map((result, i) => (
                <div 
                  key={result.loanType}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
                    i === 0 ? 'border-green-500' : 'border-emerald-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {i === 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded mb-2 inline-block">
                          BEST MATCH
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{result.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{result.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">{result.matchScore}%</div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500">Max Amount</div>
                      <div className="font-semibold">{result.maxAmount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rate</div>
                      <div className="font-semibold">{result.rate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Term</div>
                      <div className="font-semibold">{result.term}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Funding Speed</div>
                      <div className="font-semibold">{result.speed}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.likelihood === 'High' ? 'bg-green-100 text-green-700' :
                      result.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {result.likelihood} Approval Likelihood
                    </span>
                    <a 
                      href={`/calculator?type=${result.loanType}&amount=${answers.amount}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                      Calculate Payments →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="bg-emerald-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">📞 What Happens Next?</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                  <span>A financing specialist will call you within 24 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                  <span>We'll review your options and answer any questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                  <span>Submit your application in minutes - most approvals same day</span>
                </li>
              </ol>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">Questions? Call us directly:</p>
              <a href="tel:1-800-XXX-XXXX" className="text-2xl font-bold text-emerald-600 hover:text-emerald-700">
                1-800-XXX-XXXX
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{subtitle}</p>
      {children}
    </div>
  )
}
