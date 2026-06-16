import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NewChannelButton from '@/components/NewChannelButton'
import LogoutButton from '@/components/LogoutButton'
import ChannelCard from '@/components/ChannelCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: channels } = await supabase
    .from('channels')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">Arena</Link>
          <div className="flex items-center gap-2">
            <NewChannelButton userId={user.id} />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-lg font-semibold text-gray-900 mb-6">マイチャンネル</h1>

        {(!channels || channels.length === 0) ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-4">チャンネルがありません</p>
            <p className="text-sm">右上の「+」ボタンからチャンネルを作成してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {channels.map(channel => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
