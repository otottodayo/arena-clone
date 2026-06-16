'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Block = {
  id: string
  type: 'link' | 'image' | 'text'
  title: string | null
  content: string | null
  image_url: string | null
}

export default function BlockGrid({ blocks, isOwner }: { blocks: Block[]; isOwner: boolean }) {
  const router = useRouter()

  async function deleteBlock(id: string) {
    if (!confirm('このブロックを削除しますか？')) return
    const supabase = createClient()
    await supabase.from('blocks').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {blocks.map(block => (
        <BlockCard key={block.id} block={block} isOwner={isOwner} onDelete={deleteBlock} />
      ))}
    </div>
  )
}

function BlockCard({ block, isOwner, onDelete }: {
  block: Block
  isOwner: boolean
  onDelete: (id: string) => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className="relative border border-gray-200 rounded-xl overflow-hidden group"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {block.type === 'image' && block.image_url && (
        <div className="aspect-square">
          <img
            src={block.image_url}
            alt={block.title ?? ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {block.type === 'link' && (
        <a
          href={block.content ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-square bg-gray-50 flex flex-col items-center justify-center p-4 hover:bg-gray-100 transition-colors"
        >
          <ExternalLink size={24} className="text-gray-300 mb-2" />
          <span className="text-xs text-gray-400 text-center break-all line-clamp-3">
            {block.content}
          </span>
        </a>
      )}

      {block.type === 'text' && (
        <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
          <p className="text-sm text-gray-700 line-clamp-6 leading-relaxed">
            {block.content}
          </p>
        </div>
      )}

      {block.title && (
        <div className="px-2 py-1.5 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">{block.title}</p>
        </div>
      )}

      {isOwner && hover && (
        <button
          onClick={() => onDelete(block.id)}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
