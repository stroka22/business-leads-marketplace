'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Premium header for consumer pages */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/apply" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-slate-900">GetMyBizLoan</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <Link href="/apply/qualify" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">
                Do I Qualify?
              </Link>
            </li>
            <li>
              <Link href="/apply/calculator" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">
                Calculator
              </Link>
            </li>
            <li>
              <Link href="/apply/compare" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">
                Compare Options
              </Link>
            </li>
            <li>
              <Link 
                href="/apply/qualify" 
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                Get Started
              </Link>
            </li>
          </ul>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-4">
            <Link 
              href="/apply/qualify" 
              className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Do I Qualify?
            </Link>
            <Link 
              href="/apply/calculator" 
              className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Calculator
            </Link>
            <Link 
              href="/apply/compare" 
              className="block px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Compare Options
            </Link>
            <Link 
              href="/apply/qualify" 
              className="block px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* Add padding for fixed header */}
      <div className="pt-[72px]">
        {children}
      </div>
    </>
  )
}
