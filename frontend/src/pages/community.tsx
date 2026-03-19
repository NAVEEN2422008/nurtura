import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

type Group = 'first_trimester' | 'second_trimester' | 'third_trimester' | 'postpartum'

export default function CommunityPage() {
  const router = useRouter()
  const { status, data: session } = useSession()
  const [group, setGroup] = useState<Group>('first_trimester')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [composer, setComposer] = useState({ title: '', body: '', anonymous: false })
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const groupLabel = useMemo(() => {
    const map: Record<Group, string> = {
      first_trimester: 'First Trimester',
      second_trimester: 'Second Trimester',
      third_trimester: 'Third Trimester',
      postpartum: 'Postpartum',
    }
    return map[group]
  }, [group])

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`/api/community-feed?group=${group}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load feed')
      setPosts(data.data ?? [])
    } catch (e: any) {
      setError(e.message || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status !== 'authenticated') return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, group])

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setPosting(true)
      setError('')
      const res = await fetch('/api/community-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, title: composer.title || undefined, body: composer.body, anonymous: composer.anonymous }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to post')
      setComposer({ title: '', body: '', anonymous: false })
      await load()
    } catch (e: any) {
      setError(e.message || 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Community – NURTURA</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-soft-lavender to-soft-mint">
        <nav className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
            <button onClick={() => router.push('/dashboard')} className="text-primary font-bold">
              NURTURA
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-white rounded-rounded shadow-card p-6">
            <h1 className="text-2xl font-bold text-primary">Mother Community</h1>
            <p className="text-gray-600 mt-1">A supportive, moderated space for shared experiences.</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(['first_trimester', 'second_trimester', 'third_trimester', 'postpartum'] as Group[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                    g === group ? 'bg-soft-lavender border-primary text-primary' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {g.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-rounded shadow-card p-6">
            <h2 className="text-lg font-bold text-primary mb-3">Post to {groupLabel}</h2>
            <form onSubmit={createPost} className="space-y-3">
              <input
                value={composer.title}
                onChange={(e) => setComposer((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                value={composer.body}
                onChange={(e) => setComposer((p) => ({ ...p, body: e.target.value }))}
                placeholder="Share your experience, question, or support message…"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={composer.anonymous}
                  onChange={(e) => setComposer((p) => ({ ...p, anonymous: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Post anonymously
              </label>
              <button
                disabled={posting}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
              <p className="text-xs text-gray-500">
                Posts may be moderated to reduce misinformation. If you have urgent symptoms, contact a clinician or emergency services.
              </p>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="text-gray-600">Loading…</div>
            ) : posts.length === 0 ? (
              <div className="text-gray-600">No posts yet. Be the first to share.</div>
            ) : (
              posts.map((p) => (
                <div key={p.id} className="bg-white rounded-rounded shadow-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">
                        {p.anonymous ? 'Anonymous' : 'Member'} • {new Date(p.created_at).toLocaleString()}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">{p.title || 'Post'}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-600">
                      {p.moderation_status}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-wrap">{p.body}</p>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  )
}

