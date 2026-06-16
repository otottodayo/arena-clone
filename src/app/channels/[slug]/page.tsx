import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AddBlockButton from '@/components/AddBlockButton'
import BlockGrid from '@/components/BlockGrid'
import { ArrowLeft } from 'lucide-react'

export default async function ChannelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!channel) notFound()
  if (!channel.is_public && channel.owner_id !== user?.id) redirect('/auth/login')

  const { data: blocks } = await supabase
    .from('blocks')
    .select('*')
    .eq('channel_id', channel.id)
    .order('created_at', { ascending: false })

  const isOwner = user?.id === channel.owner_id

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900">{channel.title}</h1>
              {channel.description && (
                <p className="text-xs text-gray-400">{channel.description}</p>
              )}
            </div>
          </div>
          {isOwner && (
            <AddBlockButton channelId={channel.id} userId={user!.id} />
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {(!blocks || blocks.length === 0) ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">まだ何も追加されていません</p>
            {isOwner && <p className="text-sm">右上の「追加」ボタンからコンテンツを追加してください</p>}
          </div>
        ) : (
          <BlockGrid blocks={blocks} isOwner={isOwner} />
        )}
      </main>
    </div>
  )
}
