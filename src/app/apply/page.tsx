import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1 bg-blue-700/50 rounded-full text-sm mb-6">
                🚀 Fast Business Funding Solutions
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Get the Capital Your Business Needs to Grow
              </h1>
              <p className="mt-6 text-xl text-blue-100">
                From $5,000 to $5 million. Equipment financing, working capital, SBA loans, and more. 
                See what you qualify for in 2 minutes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/apply/qualify"
                  className="px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition text-center text-lg"
                >
                  Check If I Qualify →
                </Link>
                <Link
                  href="/apply/calculator"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition text-center text-lg border border-white/30"
                >
                  Calculate Payments
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                <span className="flex items-center gap-2">✓ No obligation</span>
                <span className="flex items-center gap-2">✓ No credit impact</span>
                <span className="flex items-center gap-2">✓ 2-minute application</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-semibold mb-6">Quick Funding Calculator</h3>
                <QuickCalculator />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-400">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">$50M+</div>
              <div className="text-sm">Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">10,000+</div>
              <div className="text-sm">Businesses Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">4.9/5</div>
              <div className="text-sm">Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">24hrs</div>
              <div className="text-sm">Avg. Funding Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Options */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Financing Solutions for Every Business Need
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you need equipment, working capital, or growth funding, we have options that fit your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🔧',
                title: 'Equipment Financing',
                desc: 'Purchase machinery, vehicles, and technology with the equipment as collateral.',
                amount: 'Up to $2M',
                speed: '3-5 days',
              },
              {
                icon: '💰',
                title: 'Working Capital',
                desc: 'Cover payroll, inventory, and daily operations with flexible funding.',
                amount: 'Up to $500K',
                speed: '1-3 days',
              },
              {
                icon: '🏛️',
                title: 'SBA Loans',
                desc: 'Government-backed loans with the lowest rates and longest terms.',
                amount: 'Up to $5M',
                speed: '30-90 days',
              },
              {
                icon: '💳',
                title: 'Business Line of Credit',
                desc: 'Draw funds when you need them. Only pay interest on what you use.',
                amount: 'Up to $250K',
                speed: '3-7 days',
              },
              {
                icon: '🚛',
                title: 'Commercial Vehicle',
                desc: 'Finance trucks, trailers, and fleet vehicles for your business.',
                amount: 'Up to $500K',
                speed: '3-5 days',
              },
              {
                icon: '📄',
                title: 'Invoice Factoring',
                desc: 'Turn unpaid invoices into immediate cash without taking on debt.',
                amount: 'Up to $5M',
                speed: '24-48 hours',
              },
              {
                icon: '🏢',
                title: 'Commercial Real Estate',
                desc: 'Purchase or refinance office, retail, warehouse, or multi-family property.',
                amount: 'Up to $10M',
                speed: '30-60 days',
              },
              {
                icon: '⚡',
                title: 'Merchant Cash Advance',
                desc: 'Fast funding based on future sales. No minimum credit score.',
                amount: 'Up to $500K',
                speed: '24-48 hours',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
                <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                  <span className="text-green-600 font-medium">{item.amount}</span>
                  <span className="text-gray-500">{item.speed}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/apply/qualify"
              className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Find My Best Option →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get funded in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Tell Us About Your Business',
                desc: 'Answer a few quick questions about your business needs. Takes just 2 minutes and won\'t affect your credit.',
                icon: '📝',
              },
              {
                step: '2',
                title: 'Get Matched with Options',
                desc: 'Our system instantly matches you with financing options you\'re likely to qualify for.',
                icon: '🎯',
              },
              {
                step: '3',
                title: 'Get Funded Fast',
                desc: 'Choose your best option, complete a simple application, and receive funding as fast as 24 hours.',
                icon: '🚀',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-sm text-blue-600 font-semibold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualification Criteria */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Do I Qualify?
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Most businesses can qualify for at least one of our financing options. Here are the general requirements:
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  { label: 'Time in Business', value: '6+ months (some options available for startups)' },
                  { label: 'Monthly Revenue', value: '$10,000+ (varies by product)' },
                  { label: 'Credit Score', value: '500+ (some options have no minimum)' },
                  { label: 'Industry', value: 'Most industries accepted' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm flex-shrink-0">✓</span>
                    <div>
                      <span className="font-medium text-gray-900">{item.label}:</span>
                      <span className="text-gray-600 ml-1">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/apply/qualify"
                className="inline-block mt-8 px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
              >
                Check My Eligibility →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Industries We Serve</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  '🔧 Construction',
                  '🚛 Trucking',
                  '🏭 Manufacturing',
                  '🏥 Healthcare',
                  '🍽️ Restaurants',
                  '🛒 Retail',
                  '💼 Professional Services',
                  '🌾 Agriculture',
                  '🔌 HVAC/Electrical',
                  '🏠 Real Estate',
                  '🚗 Auto Services',
                  '📦 Logistics',
                ].map((industry, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    {industry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Got $150K in equipment financing approved in 3 days. The process was incredibly smooth.",
                name: "Mike R.",
                title: "Construction Company Owner",
                rating: 5,
              },
              {
                quote: "After being turned down by my bank, BizOps found me a $75K line of credit. Lifesaver!",
                name: "Sarah T.",
                title: "Restaurant Owner",
                rating: 5,
              },
              {
                quote: "The qualification tool showed me exactly what I could get. No surprises, no hidden fees.",
                name: "James L.",
                title: "Trucking Fleet Manager",
                rating: 5,
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-blue-100 italic">"{item.quote}"</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-blue-200">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
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
              <details key={i} className="bg-white border rounded-xl p-4 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Grow Your Business?
          </h2>
          <p className="mt-4 text-xl text-green-100">
            Join thousands of business owners who've found the right financing with BizOps.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply/qualify"
              className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition text-lg"
            >
              Check If I Qualify →
            </Link>
            <Link
              href="/apply/calculator"
              className="px-8 py-4 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition text-lg"
            >
              Calculate My Payments
            </Link>
          </div>
          <p className="mt-6 text-sm text-green-200">
            No credit check to see your options • No obligation • 100% free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold text-white mb-4">BizOps</div>
              <p className="text-sm">
                Powered by PipelineAI. Helping businesses find the right financing since 2024.
              </p>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Products</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/apply/calculator" className="hover:text-white">Loan Calculator</Link></li>
                <li><Link href="/apply/qualify" className="hover:text-white">Qualification Check</Link></li>
                <li><Link href="/financing" className="hover:text-white">Lead Engine</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Company</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white mb-4">Contact</div>
              <ul className="space-y-2 text-sm">
                <li>1-800-XXX-XXXX</li>
                <li>support@bizops.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © {new Date().getFullYear()} BizOps. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuickCalculator() {
  return (
    <div className="space-y-4 text-white">
      <div>
        <label className="block text-sm mb-2">Loan Amount</label>
        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
          <option value="50000">$50,000</option>
          <option value="100000" selected>$100,000</option>
          <option value="250000">$250,000</option>
          <option value="500000">$500,000</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-2">Loan Type</label>
        <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
          <option>Equipment Financing</option>
          <option>Working Capital</option>
          <option>Business Term Loan</option>
          <option>Line of Credit</option>
        </select>
      </div>
      <div className="bg-white/10 rounded-lg p-4 text-center">
        <div className="text-sm opacity-80">Estimated Monthly Payment</div>
        <div className="text-3xl font-bold">$2,861</div>
        <div className="text-xs opacity-70 mt-1">Based on 36 months at 12% APR</div>
      </div>
      <Link
        href="/apply/calculator"
        className="block text-center py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
      >
        Get Exact Quote →
      </Link>
    </div>
  )
}
