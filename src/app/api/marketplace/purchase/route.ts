import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key, { apiVersion: '2025-08-27.basil' })
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing Supabase credentials')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

function getLeadPrice(score: number): number {
  if (score >= 80) return 75
  if (score >= 60) return 50
  return 25
}

function getBulkDiscount(count: number): number {
  if (count >= 20) return 0.20
  if (count >= 10) return 0.15
  if (count >= 5) return 0.10
  return 0
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ requiresAuth: true, error: 'Please log in to purchase leads' })
    }

    const { leadIds } = await request.json()

    if (!leadIds || !leadIds.length) {
      return NextResponse.json({ error: 'No leads selected' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Get leads and calculate price
    const { data: leads, error: leadsError } = await supabase
      .from('financing_leads')
      .select('id, lead_score, company_name')
      .in('id', leadIds)

    if (leadsError || !leads) {
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Calculate totals
    const subtotal = leads.reduce((sum, lead) => sum + getLeadPrice(lead.lead_score || 0), 0)
    const discount = getBulkDiscount(leads.length)
    const total = Math.round(subtotal * (1 - discount) * 100) // in cents

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ auth_user_id: user.id, email: user.email })
        .select('id')
        .single()
      profile = newProfile
    }

    if (!profile) {
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    // Create pending order
    const { data: order, error: orderError } = await supabase
      .from('lead_orders')
      .insert({
        buyer_id: profile.id,
        lead_ids: leadIds,
        subtotal_cents: Math.round(subtotal * 100),
        discount_rate: discount,
        total_cents: total,
        status: 'pending',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('Order error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${leads.length} Business Lead${leads.length > 1 ? 's' : ''}`,
              description: leads.map(l => l.company_name).join(', ').slice(0, 200),
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bizops.getpipelineai.com'}/dashboard/leads?success=true&order=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bizops.getpipelineai.com'}/marketplace?cancelled=true`,
      metadata: {
        order_id: order.id,
        buyer_id: profile.id,
        lead_ids: leadIds.join(','),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
