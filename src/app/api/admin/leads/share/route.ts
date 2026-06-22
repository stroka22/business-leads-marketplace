import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase credentials')
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function POST(request: Request) {
  try {
    const { leadIds } = await request.json()

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json({ error: 'No leads selected' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const token = crypto.randomBytes(32).toString('hex')

    // Create shared lead link in database
    const { error } = await supabase.from('shared_lead_links').insert({
      token,
      lead_ids: leadIds,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Table might not exist, create it
      if (error.code === '42P01') {
        await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS shared_lead_links (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              token TEXT UNIQUE NOT NULL,
              lead_ids UUID[] NOT NULL,
              expires_at TIMESTAMPTZ NOT NULL,
              view_count INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        })
        // Retry insert
        const { error: retryError } = await supabase.from('shared_lead_links').insert({
          token,
          lead_ids: leadIds,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        })
        if (retryError) {
          console.error('Share link error:', retryError)
          return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
        }
      } else {
        console.error('Share link error:', error)
        return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Share link error:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}
