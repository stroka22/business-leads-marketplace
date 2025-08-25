import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeCartTotals, LeadAgeTier, getUnitPrice } from '@/lib/utils/pricing'

export async function POST(req: NextRequest) {
  const { leadIds } = await req.json()
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
  }
  
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  
  // Initialize Stripe with default (latest) API version to avoid type-mismatch errors
  const stripe = new Stripe(stripeSecret)

  // Get authenticated user
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Fetch or ensure profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Stable reference for the profile UUID
  const profileId = (profile as unknown as { id: string }).id

  // Fetch leads and compute totals
  interface LeadWithAge {
    id: string;
    lead_age_tag: LeadAgeTier;
  }

  const { data, error } = await supabase
    .from('leads_with_age')
    .select('id, lead_age_tag')
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
  const items = Object.entries(qtyByAge)
    .filter(([,q]) => q > 0)
    .map(([ageTag, quantity]) => ({ ageTag: ageTag as LeadAgeTier, quantity }))
  
  const totals = computeCartTotals(items)

  // Create pending order with admin client (to bypass RLS)
  const adminClient = createAdminClient()
  
  // Create order
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    // @ts-expect-error – Supabase generated types not yet available for 'orders' insert
    .insert({
      user_id: profileId,
      status: 'pending',
      subtotal_cents: Math.round(totals.subtotal * 100),
      discount_rate: totals.discountRate,
      discount_cents: Math.round(totals.discountAmount * 100),
      total_cents: Math.round(totals.total * 100),
      provider: 'stripe'
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Cast once and re-use a stable orderId everywhere below
  const orderId = (order as unknown as { id: string }).id

  // Create order items
  const orderItems = leads.map(lead => ({
    order_id: orderId,
    lead_id: lead.id,
    unit_price_cents: Math.round(getUnitPrice(lead.lead_age_tag) * 100),
    age_tag: lead.lead_age_tag
  }))

  const { error: itemsError } = await adminClient
    .from('order_items')
    // @ts-expect-error – Supabase generated types not yet available for 'order_items' insert
    .insert(orderItems)

  if (itemsError) {
    // Rollback order if items fail
    await adminClient.from('orders').delete().eq('id', orderId)
    return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
  }

  // Create Stripe Checkout Session with metadata
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: { 
            name: 'Business Loan Leads', 
            description: `${leads.length} leads - ${Object.entries(qtyByAge)
              .filter(([,q]) => q > 0)
              .map(([age, qty]) => `${qty}x ${age}`)
              .join(', ')}`
          },
          unit_amount: Math.round(totals.total * 100),
        },
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=success&order=${orderId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/browse?status=canceled&order=${orderId}`,
    metadata: {
      order_id: orderId,
      profile_id: profileId,
      lead_ids: JSON.stringify(leadIds),
      type: 'lead_purchase'
    },
  })

  // Update order with provider reference
  await adminClient
    .from('orders')
    // @ts-expect-error – Supabase generated types not yet available for 'orders' update
    .update({ provider_ref: session.id })
    .eq('id', orderId)

  return NextResponse.json({ id: session.id, url: session.url })
}
