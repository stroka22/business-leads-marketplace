import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { computeCartTotals, LeadAgeTier } from '@/lib/utils/pricing'

export async function POST(req: NextRequest) {
  const { leadIds } = await req.json()
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
  }
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  // Initialise Stripe with default (latest) API version to avoid type-mismatch errors
  const stripe = new Stripe(stripeSecret)

  const supabase = createClient()

  // Fetch leads and compute totals
  interface LeadWithAge {
    lead_age_tag: LeadAgeTier
  }

  const { data, error } = await supabase
    .from('leads_with_age')
    .select('lead_age_tag')
    .in('id', leadIds)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }

  const leads = (data ?? []) as LeadWithAge[]
  if (leads.length === 0) {
    return NextResponse.json({ error: 'No valid leads' }, { status: 400 })
  }

  // Aggregate by age tier
  const qtyByAge: Record<LeadAgeTier, number> = { '0-24h': 0, '2-3d': 0, '4-7d': 0, '8-14d': 0, '15+d': 0 }
  for (const l of leads) {
    qtyByAge[l.lead_age_tag]++
  }
  const items = Object.entries(qtyByAge).filter(([,q]) => q>0).map(([ageTag, quantity]) => ({ ageTag: ageTag as LeadAgeTier, quantity }))
  const totals = computeCartTotals(items)

  // Create Stripe Checkout Session with a single consolidated line item
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: { name: 'Lead Purchase', description: 'Business loan lead purchase' },
          unit_amount: Math.round(totals.total * 100),
        },
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/browse?status=canceled`,
    metadata: {
      lead_ids: JSON.stringify(leadIds),
    },
  })

  return NextResponse.json({ id: session.id, url: session.url })
}
