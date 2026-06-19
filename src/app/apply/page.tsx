'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function GetMyBizLoanHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium gradient with glassmorphism */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900" />
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-emerald-400 text-sm font-medium mb-8">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Trusted by 10,000+ Business Owners
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Get Your
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Business Loan
                </span>
                <span className="block">Today</span>
              </h1>
              
              <p className="mt-8 text-lg sm:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                From $5,000 to $5 million in funding. Equipment financing, working capital, SBA loans, and more. 
                <span className="text-white font-medium"> See what you qualify for in 60 seconds.</span>
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/apply/qualify"
                  className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-2xl text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="relative z-10">See If I Qualify</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link
                  href="/apply/calculator"
                  className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-2xl text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  Calculate Payments
                </Link>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>60-second application</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Funding in 24 hours</span>
                </div>
              </div>
            </div>
            
            {/* Hero Calculator Card */}
            <div className="hidden lg:block">
              <HeroCalculator />
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '$50M+', label: 'Funded to Date' },
              { value: '10,000+', label: 'Businesses Helped' },
              { value: '4.9★', label: 'Customer Rating' },
              { value: '24hrs', label: 'Average Funding' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Products - Modern cards */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              Financing Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              The Right Funding for{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Every Need
              </span>
            </h2>
            <p className="mt-6 text-lg text-slate-600">
              Whether you're purchasing equipment, managing cash flow, or expanding operations, 
              we have financing options designed for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Equipment Financing',
                desc: 'Purchase machinery, vehicles, and technology with the equipment as collateral.',
                amount: 'Up to $2M',
                speed: '3-5 days',
                color: 'emerald',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Working Capital',
                desc: 'Cover payroll, inventory, and daily operations with flexible funding.',
                amount: 'Up to $500K',
                speed: '1-3 days',
                color: 'cyan',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'SBA Loans',
                desc: 'Government-backed loans with the lowest rates and longest terms available.',
                amount: 'Up to $5M',
                speed: '30-90 days',
                color: 'blue',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                title: 'Line of Credit',
                desc: 'Draw funds when you need them. Only pay interest on what you use.',
                amount: 'Up to $250K',
                speed: '3-7 days',
                color: 'violet',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                ),
                title: 'Commercial Vehicle',
                desc: 'Finance trucks, trailers, and fleet vehicles to keep your business moving.',
                amount: 'Up to $500K',
                speed: '3-5 days',
                color: 'amber',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Invoice Factoring',
                desc: 'Turn unpaid invoices into immediate cash without taking on new debt.',
                amount: 'Up to $5M',
                speed: '24-48 hrs',
                color: 'rose',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'Commercial Real Estate',
                desc: 'Purchase or refinance office, retail, warehouse, or industrial property.',
                amount: 'Up to $10M',
                speed: '30-60 days',
                color: 'slate',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Merchant Cash Advance',
                desc: 'Fast funding based on future sales. Flexible repayment options.',
                amount: 'Up to $500K',
                speed: '24-48 hrs',
                color: 'orange',
              },
            ].map((product, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-${product.color}-50 text-${product.color}-600 flex items-center justify-center mb-5`}>
                  {product.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{product.title}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{product.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-emerald-600">{product.amount}</span>
                  <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">{product.speed}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/apply/qualify"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-colors"
            >
              Find Your Best Option
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Timeline style */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Funding in{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                3 Easy Steps
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Tell Us About Your Business',
                desc: 'Answer a few quick questions about your business and funding needs. Takes just 60 seconds.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Get Matched Instantly',
                desc: 'Our system analyzes your profile and matches you with financing options you\'re likely to qualify for.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Get Funded Fast',
                desc: 'Choose your best option, complete a simple application, and receive funds as fast as 24 hours.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent" />
                )}
                <div className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      {item.icon}
                    </div>
                    <span className="text-5xl font-bold text-slate-100">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualification Criteria */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                Requirements
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Do I Qualify?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Most businesses can qualify for at least one of our financing options. Here's what you'll typically need:
              </p>
              
              <div className="space-y-4">
                {[
                  { label: 'Time in Business', value: '6+ months (startup options available)', icon: '🗓️' },
                  { label: 'Monthly Revenue', value: '$10,000+ (varies by product)', icon: '📈' },
                  { label: 'Credit Score', value: '500+ (some have no minimum)', icon: '✨' },
                  { label: 'Industry', value: 'Most industries accepted', icon: '🏢' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-900">{item.label}</div>
                      <div className="text-slate-600 text-sm">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/apply/qualify"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              >
                Check My Eligibility
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Industries Grid */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-10">
              <h3 className="text-2xl font-bold text-white mb-8">Industries We Serve</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: '🔧', name: 'Construction' },
                  { icon: '🚛', name: 'Trucking' },
                  { icon: '🏭', name: 'Manufacturing' },
                  { icon: '🏥', name: 'Healthcare' },
                  { icon: '🍽️', name: 'Restaurants' },
                  { icon: '🛒', name: 'Retail' },
                  { icon: '💼', name: 'Professional' },
                  { icon: '🌾', name: 'Agriculture' },
                  { icon: '🔌', name: 'HVAC' },
                  { icon: '🏠', name: 'Real Estate' },
                  { icon: '🚗', name: 'Auto Services' },
                  { icon: '📦', name: 'Logistics' },
                ].map((industry, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <span className="text-xl">{industry.icon}</span>
                    <span className="text-white text-sm font-medium">{industry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Trusted by Business Owners{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Like You
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Got $150K in equipment financing approved in just 3 days. The process was incredibly smooth and the team was responsive every step of the way.",
                name: "Mike Rodriguez",
                title: "Rodriguez Construction LLC",
                image: "MR",
                rating: 5,
              },
              {
                quote: "After being turned down by my bank, GetMyBizLoan found me a $75K line of credit. They literally saved my business during a tough season.",
                name: "Sarah Thompson",
                title: "Thompson's Kitchen & Bar",
                image: "ST",
                rating: 5,
              },
              {
                quote: "The qualification tool showed me exactly what I could get before I even applied. No surprises, no hidden fees. Highly recommend!",
                name: "James Liu",
                title: "Pacific Fleet Services",
                image: "JL",
                rating: 5,
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-6">
                  {[...Array(item.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">"{item.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                    {item.image}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Will checking if I qualify affect my credit score?",
                a: "No! Our initial qualification check is a soft inquiry that doesn't impact your credit score. Only when you formally apply for a specific product will a hard inquiry occur.",
              },
              {
                q: "How fast can I get funded?",
                a: "Depending on the product, funding can happen in as little as 24 hours. SBA loans take longer (30-90 days), but most other options fund within 3-7 days.",
              },
              {
                q: "What documents do I need to apply?",
                a: "For most products, you'll need 3-6 months of bank statements, a government ID, and basic business information. Some products may require tax returns or financial statements.",
              },
              {
                q: "Can I qualify with bad credit?",
                a: "Yes! We have options for all credit profiles. Merchant cash advances and some working capital products have no minimum credit score requirement.",
              },
              {
                q: "Are there any upfront fees?",
                a: "We never charge upfront fees to check your options or apply. Any fees are clearly disclosed before you accept any offer.",
              },
            ].map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-12 lg:p-16">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-[80px]" />
            
            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Grow Your Business?
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                Join thousands of business owners who've found the right financing. 
                Check your eligibility in 60 seconds - no credit impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/apply/qualify"
                  className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-2xl text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
                >
                  Check If I Qualify
                </Link>
                <Link
                  href="/apply/calculator"
                  className="px-10 py-5 bg-white/10 backdrop-blur text-white font-semibold rounded-2xl text-lg border border-white/20 hover:bg-white/20 transition-all"
                >
                  Calculate Payments
                </Link>
              </div>
              <p className="mt-8 text-sm text-slate-400">
                No credit check to see options • No obligation • 100% free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-white mb-4">
                GetMyBizLoan
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed">
                Helping business owners find the right financing since 2024. 
                We connect you with lenders who want to help your business grow.
              </p>
              <div className="flex gap-4 mt-6">
                {/* Social icons placeholder */}
              </div>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Products</div>
              <ul className="space-y-3 text-sm">
                <li><Link href="/apply/calculator" className="hover:text-white transition-colors">Loan Calculator</Link></li>
                <li><Link href="/apply/qualify" className="hover:text-white transition-colors">Pre-Qualification</Link></li>
                <li><Link href="/apply/compare" className="hover:text-white transition-colors">Compare Options</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Company</div>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © {new Date().getFullYear()} GetMyBizLoan. All rights reserved.
            </div>
            <div className="text-sm text-slate-500">
              A PipelineAI Company
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function HeroCalculator() {
  const [amount, setAmount] = useState(100000)
  const [term, setTerm] = useState(36)
  
  const rate = 0.12
  const monthlyPayment = (amount * (rate/12) * Math.pow(1 + rate/12, term)) / (Math.pow(1 + rate/12, term) - 1)

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">Quick Estimate</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Loan Amount</span>
            <span className="text-white font-semibold">${amount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="10000"
            max="500000"
            step="5000"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Term</span>
            <span className="text-white font-semibold">{term} months</span>
          </div>
          <input
            type="range"
            min="12"
            max="84"
            step="6"
            value={term}
            onChange={(e) => setTerm(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl p-6 text-center border border-emerald-500/20">
          <div className="text-sm text-slate-300 mb-1">Estimated Monthly Payment</div>
          <div className="text-4xl font-bold text-white">${Math.round(monthlyPayment).toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-2">Based on 12% APR</div>
        </div>
        
        <Link
          href="/apply/qualify"
          className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl text-center hover:from-emerald-600 hover:to-cyan-600 transition-all"
        >
          Get My Exact Rate
        </Link>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900 pr-4">{question}</span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}
