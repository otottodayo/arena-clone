'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Link as LinkIcon, Image as ImageIcon, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type BlockType = 'link' | 'image' | 'text'

export default function AddBlockButton({ channelId, userId }: { channelId: string; userId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<BlockType>('link')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    if (type === 'image' && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        setProgress(`${i + 1} / ${imageFiles.length} 枚アップロード中...`)
        const ext = file.name.split('.').pop()
        const path = `${userId}/${Date.now()}-${i}.${ext}`
        const { error: uploadError } = await supabase.storage.from('blocks').upload(path, file)
        if (!uploadError) {
          const { data } = supabase.storage.from('blocks').getPublicUrl(path)
          await supabase.from('blocks').insert({
            channel_id: channelId,
            created_by: userId,
            type: 'image',
            title: title.trim() || null,
            image_url: data.publicUrl,
          })
        }
      }
    } else {
      await supabase.from('blocks').insert({
        channel_id: channelId,
        created_by: userId,
        type,
        title: title.trim() || null,
        content: content.trim(),
      })
    }

    setOpen(false)
    setTitle('')
    setContent('')
    setImageFiles([])
    setProgress('')
    setLoading(false)
    router.refresh()
  }

  const tabs: { type: BlockType; label: string; icon: React.ReactNode }[] = [
    { type: 'link', label: 'リンク', icon: <LinkIcon size={16} /> },
    { type: 'image', label: '画像', icon: <ImageIcon size={16} /> },
    { type: 'text', label: 'テキスト', icon: <FileText size={16} /> },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Plus size={16} />
        追加
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">コンテンツを追加</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setType(tab.type)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md transition-colors ${type === tab.type ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              {type !== 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル（任意）</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="タイトル"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 text-sm"
                  />
                </div>
              )}

              {type === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="url"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 text-sm"
                  />
                </div>
              )}

              {type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    画像（複数選択OK）
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setImageFiles(Array.from(e.target.files ?? []))}
                    required
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-sm file:font-medium"
                  />
                  {imageFiles.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{imageFiles.length}枚選択中</p>
                  )}
                </div>
              )}

              {type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">テキスト</label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="メモやアイデアを書く..."
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900 text-sm resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? (progress || '追加中...') : '追加する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
