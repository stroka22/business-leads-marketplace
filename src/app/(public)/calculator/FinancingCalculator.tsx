'use client'

import { useState } from 'react'

type LoanType = 
  | 'term_loan'
  | 'sba_loan'
  | 'equipment_financing'
  | 'business_loc'
  | 'invoice_factoring'
  | 'merchant_cash'
  | 'commercial_real_estate'
  | 'working_capital'

interface LoanTypeInfo {
  name: string
  description: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  minRate: number
  maxRate: number
  requirements: string[]
  bestFor: string[]
}

const LOAN_TYPES: Record<LoanType, LoanTypeInfo> = {
  term_loan: {
    name: 'Business Term Loan',
    description: 'Traditional fixed-rate loan with predictable monthly payments',
    minAmount: 25000,
    maxAmount: 500000,
    minTerm: 12,
    maxTerm: 60,
    minRate: 7,
    maxRate: 25,
    requirements: ['2+ years in business', '600+ credit score', '$100K+ annual revenue'],
    bestFor: ['Expansion', 'Large purchases', 'Refinancing debt'],
  },
  sba_loan: {
    name: 'SBA Loan',
    description: 'Government-backed loans with competitive rates and longer terms',
    minAmount: 50000,
    maxAmount: 5000000,
    minTerm: 60,
    maxTerm: 300,
    minRate: 5.5,
    maxRate: 11,
    requirements: ['2+ years in business', '680+ credit score', 'Strong financials', 'Collateral often required'],
    bestFor: ['Real estate', 'Major expansion', 'Business acquisition'],
  },
  equipment_financing: {
    name: 'Equipment Financing',
    description: 'Loans specifically for purchasing business equipment',
    minAmount: 5000,
    maxAmount: 2000000,
    minTerm: 12,
    maxTerm: 84,
    minRate: 6,
    maxRate: 20,
    requirements: ['1+ year in business', '600+ credit score', 'Equipment as collateral'],
    bestFor: ['Machinery', 'Vehicles', 'Technology', 'Manufacturing equipment'],
  },
  business_loc: {
    name: 'Business Line of Credit',
    description: 'Revolving credit you can draw from as needed',
    minAmount: 10000,
    maxAmount: 250000,
    minTerm: 6,
    maxTerm: 24,
    minRate: 8,
    maxRate: 30,
    requirements: ['1+ year in business', '600+ credit score', '$50K+ annual revenue'],
    bestFor: ['Cash flow gaps', 'Seasonal businesses', 'Emergency funds'],
  },
  invoice_factoring: {
    name: 'Invoice Factoring',
    description: 'Sell your unpaid invoices for immediate cash',
    minAmount: 10000,
    maxAmount: 5000000,
    minTerm: 1,
    maxTerm: 3,
    minRate: 1,
    maxRate: 5,
    requirements: ['B2B business', 'Creditworthy customers', 'Outstanding invoices'],
    bestFor: ['B2B companies', 'Slow-paying customers', 'Rapid growth'],
  },
  merchant_cash: {
    name: 'Merchant Cash Advance',
    description: 'Advance on future credit card sales',
    minAmount: 5000,
    maxAmount: 500000,
    minTerm: 3,
    maxTerm: 18,
    minRate: 20,
    maxRate: 50,
    requirements: ['6+ months in business', '$5K+ monthly card sales', 'No minimum credit score'],
    bestFor: ['Retail/restaurants', 'Quick funding needed', 'Lower credit scores'],
  },
  commercial_real_estate: {
    name: 'Commercial Real Estate Loan',
    description: 'Financing for purchasing or refinancing commercial property',
    minAmount: 100000,
    maxAmount: 10000000,
    minTerm: 60,
    maxTerm: 300,
    minRate: 5,
    maxRate: 12,
    requirements: ['Strong credit', '25%+ down payment', 'Property appraisal', 'Business financials'],
    bestFor: ['Office buildings', 'Warehouses', 'Retail spaces', 'Multi-family'],
  },
  working_capital: {
    name: 'Working Capital Loan',
    description: 'Short-term financing for day-to-day operations',
    minAmount: 5000,
    maxAmount: 500000,
    minTerm: 3,
    maxTerm: 36,
    minRate: 10,
    maxRate: 40,
    requirements: ['6+ months in business', '500+ credit score', 'Bank statements'],
    bestFor: ['Payroll', 'Inventory', 'Operating expenses', 'Seasonal needs'],
  },
}

export default function FinancingCalculator() {
  const [loanType, setLoanType] = useState<LoanType>('term_loan')
  const [amount, setAmount] = useState(100000)
  const [term, setTerm] = useState(36)
  const [rate, setRate] = useState(12)
  const [showResults, setShowResults] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)

  const loanInfo = LOAN_TYPES[loanType]

  // Calculate monthly payment (standard amortization)
  const calculatePayment = () => {
    const monthlyRate = rate / 100 / 12
    const numPayments = term
    if (monthlyRate === 0) return amount / numPayments
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1)
  }

  const monthlyPayment = calculatePayment()
  const totalPayment = monthlyPayment * term
  const totalInterest = totalPayment - amount

  // For invoice factoring, calculate differently
  const factoringFee = loanType === 'invoice_factoring' ? amount * (rate / 100) : 0
  const factoringAdvance = loanType === 'invoice_factoring' ? amount * 0.85 : 0

  // For MCA, show factor rate
  const mcaFactorRate = loanType === 'merchant_cash' ? 1 + (rate / 100) : 0
  const mcaPayback = loanType === 'merchant_cash' ? amount * mcaFactorRate : 0

  const handleCalculate = () => {
    setShowResults(true)
  }

  const handleGetQuote = () => {
    setShowLeadForm(true)
  }

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const leadData = {
      company_name: formData.get('company_name'),
      contact_name: formData.get('contact_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      loan_type: loanType,
      loan_amount: amount,
      loan_term: term,
      monthly_revenue: formData.get('monthly_revenue'),
      time_in_business: formData.get('time_in_business'),
      credit_score: formData.get('credit_score'),
    }

    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      })
      setLeadSubmitted(true)
    } catch {
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <section className="py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Business Financing Calculator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Calculate your monthly payments, compare loan types, and see what you qualify for—all in one place.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              {/* Loan Type Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Financing Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(Object.keys(LOAN_TYPES) as LoanType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setLoanType(type)
                        setAmount(LOAN_TYPES[type].minAmount)
                        setTerm(LOAN_TYPES[type].minTerm)
                        setRate((LOAN_TYPES[type].minRate + LOAN_TYPES[type].maxRate) / 2)
                        setShowResults(false)
                      }}
                      className={`p-3 text-xs md:text-sm rounded-lg border-2 transition-all ${
                        loanType === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {LOAN_TYPES[type].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-8">
                <h3 className="font-semibold text-blue-900">{loanInfo.name}</h3>
                <p className="text-sm text-blue-700 mt-1">{loanInfo.description}</p>
              </div>

              {/* Sliders */}
              <div className="space-y-8">
                {/* Amount */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      {loanType === 'invoice_factoring' ? 'Invoice Amount' : 'Loan Amount'}
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={loanInfo.minAmount}
                    max={loanInfo.maxAmount}
                    step={loanInfo.minAmount < 10000 ? 1000 : 5000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${loanInfo.minAmount.toLocaleString()}</span>
                    <span>${loanInfo.maxAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Term */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      {loanType === 'invoice_factoring' ? 'Collection Period' : 'Loan Term'}
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      {term} {loanType === 'invoice_factoring' ? 'weeks' : 'months'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={loanInfo.minTerm}
                    max={loanInfo.maxTerm}
                    step={loanInfo.maxTerm > 60 ? 12 : 1}
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{loanInfo.minTerm} {loanType === 'invoice_factoring' ? 'weeks' : 'months'}</span>
                    <span>{loanInfo.maxTerm} {loanType === 'invoice_factoring' ? 'weeks' : 'months'}</span>
                  </div>
                </div>

                {/* Rate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      {loanType === 'invoice_factoring' ? 'Factoring Fee' : 
                       loanType === 'merchant_cash' ? 'Factor Rate' : 'Interest Rate (APR)'}
                    </label>
                    <span className="text-lg font-bold text-blue-600">
                      {rate.toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={loanInfo.minRate}
                    max={loanInfo.maxRate}
                    step={0.5}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{loanInfo.minRate}%</span>
                    <span>{loanInfo.maxRate}%</span>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                className="w-full mt-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
              >
                Calculate My Payment
              </button>

              {/* Results */}
              {showResults && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Estimated Costs</h3>
                  
                  {loanType === 'invoice_factoring' ? (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Advance Amount (85%)</div>
                        <div className="text-2xl font-bold text-green-600">${factoringAdvance.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Factoring Fee</div>
                        <div className="text-2xl font-bold text-blue-600">${factoringFee.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">You Receive</div>
                        <div className="text-2xl font-bold text-gray-900">${(factoringAdvance - factoringFee).toLocaleString()}</div>
                      </div>
                    </div>
                  ) : loanType === 'merchant_cash' ? (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Advance Amount</div>
                        <div className="text-2xl font-bold text-green-600">${amount.toLocaleString()}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Factor Rate</div>
                        <div className="text-2xl font-bold text-blue-600">{mcaFactorRate.toFixed(2)}x</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Total Payback</div>
                        <div className="text-2xl font-bold text-gray-900">${mcaPayback.toLocaleString()}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Monthly Payment</div>
                        <div className="text-2xl font-bold text-green-600">${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Total Interest</div>
                        <div className="text-2xl font-bold text-blue-600">${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-sm text-gray-500">Total Repayment</div>
                        <div className="text-2xl font-bold text-gray-900">${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGetQuote}
                    className="w-full mt-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-lg"
                  >
                    Get My Personalized Quote →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span> Typical Requirements
              </h3>
              <ul className="space-y-2">
                {loanInfo.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Best For */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🎯</span> Best For
              </h3>
              <div className="flex flex-wrap gap-2">
                {loanInfo.bestFor.map((use, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {use}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Funding Speed</span>
                  <span className="font-semibold">
                    {loanType === 'sba_loan' ? '30-90 days' :
                     loanType === 'commercial_real_estate' ? '30-60 days' :
                     loanType === 'merchant_cash' ? '24-48 hours' :
                     loanType === 'invoice_factoring' ? '24-48 hours' :
                     '3-7 days'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Approval Rate</span>
                  <span className="font-semibold">
                    {loanType === 'merchant_cash' ? '85%+' :
                     loanType === 'sba_loan' ? '50%' :
                     '70%+'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Min Credit Score</span>
                  <span className="font-semibold">
                    {loanType === 'merchant_cash' ? 'None' :
                     loanType === 'working_capital' ? '500+' :
                     loanType === 'sba_loan' ? '680+' :
                     '600+'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Not Sure Which Loan?</h3>
              <p className="text-sm text-yellow-700 mb-4">
                Take our 2-minute qualification quiz to see which financing options you qualify for.
              </p>
              <a
                href="/qualify"
                className="block text-center py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Check My Options →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLeadForm && !leadSubmitted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Get Your Personalized Quote</h2>
                <p className="text-gray-600 mt-1">Fill out this form and we'll match you with the best lenders.</p>
              </div>
              <button onClick={() => setShowLeadForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input
                    name="company_name"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="ABC Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input
                    name="contact_name"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="John Smith"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Revenue *</label>
                  <select name="monthly_revenue" required className="w-full border rounded-lg px-4 py-2">
                    <option value="">Select...</option>
                    <option value="under_10k">Under $10,000</option>
                    <option value="10k_25k">$10,000 - $25,000</option>
                    <option value="25k_50k">$25,000 - $50,000</option>
                    <option value="50k_100k">$50,000 - $100,000</option>
                    <option value="100k_250k">$100,000 - $250,000</option>
                    <option value="250k_500k">$250,000 - $500,000</option>
                    <option value="500k_plus">$500,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time in Business *</label>
                  <select name="time_in_business" required className="w-full border rounded-lg px-4 py-2">
                    <option value="">Select...</option>
                    <option value="under_6mo">Under 6 months</option>
                    <option value="6mo_1yr">6 months - 1 year</option>
                    <option value="1yr_2yr">1 - 2 years</option>
                    <option value="2yr_5yr">2 - 5 years</option>
                    <option value="5yr_plus">5+ years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Credit Score *</label>
                <select name="credit_score" required className="w-full border rounded-lg px-4 py-2">
                  <option value="">Select...</option>
                  <option value="excellent">Excellent (720+)</option>
                  <option value="good">Good (680-719)</option>
                  <option value="fair">Fair (620-679)</option>
                  <option value="poor">Poor (580-619)</option>
                  <option value="bad">Bad (Below 580)</option>
                  <option value="unknown">I don't know</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>Your calculated loan details:</strong>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <span>Loan Type:</span>
                    <span className="font-medium">{LOAN_TYPES[loanType].name}</span>
                    <span>Amount:</span>
                    <span className="font-medium">${amount.toLocaleString()}</span>
                    <span>Term:</span>
                    <span className="font-medium">{term} months</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-lg"
              >
                Get My Free Quote →
              </button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to our Terms of Service and Privacy Policy.
                Your information is secure and will never be sold.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {leadSubmitted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              One of our financing specialists will contact you within 24 hours with personalized offers.
            </p>
            <button
              onClick={() => {
                setShowLeadForm(false)
                setLeadSubmitted(false)
              }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
