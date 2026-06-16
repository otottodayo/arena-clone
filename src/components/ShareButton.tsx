'use client'

import { useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:border-gray-400 transition-colors"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <LinkIcon size={14} />}
      {copied ? 'コピーしました' : 'URLをコピー'}
    </button>
  )
}
