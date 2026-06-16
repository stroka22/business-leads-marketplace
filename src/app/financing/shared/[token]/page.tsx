import { createFinancingServerClient } from '@/lib/supabase/financing-server'
import SharedLeadsView from './SharedLeadsView'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params
  const supabase = createFinancingServerClient()
  
  // Get the shared filter
  const { data: sharedFilter, error } = await supabase
    .from('shared_filters')
    .select('*')
    .eq('share_token', token)
    .eq('is_active', true)
    .single()

  if (error || !sharedFilter) {
    notFound()
  }

  // Check expiration
  if (sharedFilter.expires_at && new Date(sharedFilter.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Link Expired</h1>
          <p className="text-gray-600">This shared view has expired. Please contact the owner for a new link.</p>
        </div>
      </div>
    )
  }

  // Update view count
  await supabase
    .from('shared_filters')
    .update({
      view_count: (sharedFilter.view_count || 0) + 1,
      last_viewed_at: new Date().toISOString(),
    })
    .eq('id', sharedFilter.id)

  return (
    <SharedLeadsView
      name={sharedFilter.name}
      description={sharedFilter.description}
      filters={sharedFilter.filters}
    />
  )
}
