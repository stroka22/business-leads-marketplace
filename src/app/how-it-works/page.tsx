export default function HowItWorksPage() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>How It Works</h1>
      <ol>
        <li><strong>Browse:</strong> Filter leads by age, state, industry, revenue, loan amount, and more.</li>
        <li><strong>Select:</strong> Add individual leads or bulk selections to your cart.</li>
        <li><strong>Pricing:</strong> Age-based pricing with automatic bulk discounts.</li>
        <li><strong>Checkout:</strong> Pay with card (Stripe) or PayPal; or top-up credits to your wallet.</li>
        <li><strong>Download:</strong> Instantly export purchased leads as CSV with full contact details.</li>
      </ol>
      <h2>Lead Age Tiers</h2>
      <p>0–24h, 2–3d, 4–7d, 8–14d, 15+d — newer leads cost more; older leads cost less.</p>
      <h2>Compliance</h2>
      <ul>
        <li>We are not a lender or loan broker; we sell access to business data only.</li>
        <li>Leads are sold as-is, non-exclusive unless specified, no refunds for valid leads.</li>
        <li>Follow FTC, TCPA, and CAN-SPAM. Do not autodial or email without opt-in permission.</li>
      </ul>
    </div>
  )
}
