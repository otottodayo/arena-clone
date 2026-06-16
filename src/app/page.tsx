import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Arena</h1>
          <p className="mt-3 text-lg text-gray-500">
            アイデアを収集し、整理し、共有する
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/signup"
            className="w-full py-3 px-4 bg-black text-white rounded-lg text-center font-medium hover:bg-gray-800 transition-colors"
          >
            無料で始める
          </Link>
          <Link
            href="/auth/login"
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  )
}
