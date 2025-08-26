import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const orderId = session.metadata?.order_id as string | undefined
    const profileId = session.metadata?.profile_id as string | undefined

    // Safety-check metadata
    if (!orderId || !profileId) {
      console.warn('Stripe webhook missing metadata', { orderId, profileId, sessionId: session.id })
      return NextResponse.json({ received: true })
    }

    // Use admin client (service role) to bypass RLS
    const admin = createAdminClient()

    // Fetch the order; we only act if still pending
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('status,total_cents')
      .eq('id', orderId)
      .maybeSingle()

    if (orderErr) {
      console.error('Failed fetching order in webhook', orderErr)
      return NextResponse.json({ received: true })
    }

    if (!order) {
      console.warn('Order not found for webhook', orderId)
      return NextResponse.json({ received: true })
    }

    // Narrow unknown columns to typed object for safer access
    const ord = order as unknown as { status: string; total_cents: number }

    if (ord.status === 'paid') {
      // Idempotent: already processed
      return NextResponse.json({ received: true })
    }

    // 1) Mark order paid
    const { error: updErr } = await admin
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)

    if (updErr) {
      console.error('Failed updating order status', updErr)
      return NextResponse.json({ received: true })
    }

    // 2) Credit wallet via SQL helper (handles idempotency)
    // @ts-expect-error – RPC function types not generated
    const { error: creditErr } = await admin.rpc('credit_wallet_by_profile', {
      p_profile_id: profileId,
      p_amount_cents: ord.total_cents,
      p_reference: orderId,
    })

    if (creditErr) {
      console.error('Failed crediting wallet', creditErr)
      // do not fail webhook; we might retry later
    }
  }

  return NextResponse.json({ received: true })
}
