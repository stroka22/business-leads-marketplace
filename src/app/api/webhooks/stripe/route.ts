import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !webhookSecret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  // Initialize Stripe with default (latest) API version
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const leadIds = JSON.parse(session.metadata?.lead_ids || '[]') as string[]

    const supabase = createClient()
    // Temporary usage to satisfy linter until full implementation is added
    console.log(
      `Stripe checkout completed. Leads purchased: ${leadIds.length}. Session: ${session.id}`,
    )
    void supabase // suppress unused variable lint until logic is implemented
    // TODO: map auth user via session if available; for MVP, store order with provider_ref
    // Create order and order_items, mark leads as sold
    // This will require associating session to a user via state; to be implemented after auth wiring
  }

  return NextResponse.json({ received: true })
}
