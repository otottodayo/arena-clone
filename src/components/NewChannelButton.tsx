'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NewChannelButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    const supabase = createClient()
    const slug = 'ch-' + Date.now()

    const { error } = await supabase.from('channels').insert({
      owner_id: userId,
      title: title.trim(),
      slug,
      is_public: isPublic,
    })

    if (!error) {
      setOpen(false)
      setTitle('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Plus size={16} />
        新規
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">新しいチャンネル</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例: インスピレーション"
                  autoFocus
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">公開設定</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${isPublic ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600'}`}
                  >
                    公開
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${!isPublic ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600'}`}
                  >
                    非公開
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? '作成中...' : '作成'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
