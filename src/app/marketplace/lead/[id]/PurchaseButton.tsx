'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PurchaseButton({ leadId, price }: { leadId: string; price: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: [leadId] }),
      })
      
      const data = await res.json()
      
      if (data.requiresAuth) {
        router.push('/login?redirect=/marketplace/lead/' + leadId)
        return
      }
      
      if (data.url) {
        window.location.href = data.url
      } else if (data.success) {
        router.push('/dashboard/leads')
      } else {
        alert(data.error || 'Purchase failed')
      }
    } catch (error) {
      alert('Error processing purchase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Purchase Lead - $${price}`}
    </button>
  )
}
