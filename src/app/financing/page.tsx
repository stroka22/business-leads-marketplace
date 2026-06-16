import { createFinancingServerClient } from '@/lib/supabase/financing-server'
import FinancingDashboard from './FinancingDashboard'

export const dynamic = 'force-dynamic'

export default async function FinancingPage() {
  const supabase = createFinancingServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
        <p className="text-gray-600">Please log in to access the Financing Lead Intelligence Engine.</p>
        <a href="/login" className="mt-4 inline-block px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
          Log In
        </a>
      </div>
    )
  }

  return <FinancingDashboard />
}
