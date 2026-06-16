'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2, Link as LinkIcon, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Channel = {
  id: string
  title: string
  slug: string
  is_public: boolean
}

export default function ChannelCard({ channel }: { channel: Channel }) {
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm(`「${channel.title}」を削除しますか？`)) return
    const supabase = createClient()
    await supabase.from('channels').delete().eq('id', channel.id)
    router.refresh()
  }

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    const url = `${window.location.origin}/channels/${channel.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href={`/channels/${channel.slug}`}
        className="block border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors group"
      >
        <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
          <span className="text-2xl text-gray-300">□</span>
        </div>
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-black">
          {channel.title}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {channel.is_public ? '公開' : '非公開'}
        </p>
      </Link>
      {hover && (
        <div className="absolute top-2 right-2 flex gap-1">
          {channel.is_public && (
            <button
              onClick={handleCopy}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-400 hover:text-blue-500 transition-colors shadow-sm"
              title="URLをコピー"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <LinkIcon size={14} />}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-400 hover:text-red-500 transition-colors shadow-sm"
            title="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
