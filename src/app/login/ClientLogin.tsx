'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ClientLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    // Create Supabase client lazily to avoid accessing env vars during build
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {sent ? (
        <div className="p-4 border rounded bg-green-50 text-green-800">Check your email for a magic link.</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border rounded px-3 py-2" required />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="px-4 py-2 rounded bg-black text-white">Send Magic Link</button>
        </form>
      )}
    </div>
  )
}
