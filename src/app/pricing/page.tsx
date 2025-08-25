import { AGE_TIERS, BULK_DISCOUNT_TIERS, formatPrice } from '@/lib/utils/pricing'

export default function PricingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Pricing</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">By Lead Age</h2>
          <ul className="space-y-2">
            {Object.entries(AGE_TIERS).map(([tier, price]) => (
              <li key={tier} className="flex justify-between">
                <span>{tier}</span>
                <span className="font-semibold">{formatPrice(price)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Bulk Discounts</h2>
          <ul className="space-y-2">
            {BULK_DISCOUNT_TIERS.filter(t => t.min > 0).map((t) => (
              <li key={t.min} className="flex justify-between">
                <span>{t.min}{t.min === 100 ? '+ ' : '–' + (t.min === 25 ? '49' : t.min === 50 ? '99' : '24')} leads</span>
                <span className="font-semibold">{Math.round(t.rate * 100)}% off</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 border rounded-lg p-4">
        <h2 className="font-medium mb-2">Notes</h2>
        <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li>Bulk discounts apply to the entire cart quantity across mixed age tiers.</li>
          <li>Leads are non-exclusive unless specified and sold as-is; no refunds for valid leads.</li>
          <li>Contact details are masked until purchase; instant CSV download after checkout.</li>
        </ul>
      </div>
    </div>
  )
}
