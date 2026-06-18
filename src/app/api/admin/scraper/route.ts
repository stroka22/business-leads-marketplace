import { createFinancingServerClient } from '@/lib/supabase/financing-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createFinancingServerClient()
  
  // Check admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { type } = await request.json()

    // Log the scraper job request
    await supabase.from('scraper_jobs').insert({
      scraper_type: type,
      status: 'queued',
      started_at: new Date().toISOString(),
    })

    // In production, this would trigger the VPS scraper via SSH or a webhook
    // For now, we just log the request
    console.log(`Scraper ${type} triggered by admin`)

    return NextResponse.json({ success: true, message: `${type} scraper queued` })
  } catch (error) {
    console.error('Scraper trigger error:', error)
    return NextResponse.json({ error: 'Failed to trigger scraper' }, { status: 500 })
  }
}
