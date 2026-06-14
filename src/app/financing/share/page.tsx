import { createFinancingServerClient } from '@/lib/supabase/financing-server'
import ShareFilterForm from './ShareFilterForm'

export const dynamic = 'force-dynamic'

export default async function SharePage() {
  const supabase = createFinancingServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
        <p className="text-gray-600">Please log in to create shared views.</p>
        <a href="/login" className="mt-4 inline-block px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
          Log In
        </a>
      </div>
    )
  }

  // Get existing shared filters
  const { data: sharedFilters } = await supabase
    .from('shared_filters')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Shareable Lead View</h1>
      
      <ShareFilterForm />

      {sharedFilters && sharedFilters.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Existing Shared Views</h2>
          <div className="space-y-4">
            {sharedFilters.map(filter => (
              <div key={filter.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{filter.name}</h3>
                    {filter.description && (
                      <p className="text-sm text-gray-500 mt-1">{filter.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Views: {filter.view_count} | Created: {new Date(filter.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/financing/shared/${filter.share_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/financing/shared/${filter.share_token}`
                        )
                      }}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
