import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/AppShell'

type Group = 'first_trimester' | 'second_trimester' | 'third_trimester' | 'postpartum'

export default function CommunityPage() {
  const router = useRouter()
  const { status } = useSession()
  const [group, setGroup] = useState<Group>('first_trimester')
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [composer, setComposer] = useState({ title: '', body: '', anonymous: false })
  const [posting, setPosting] = useState(false)

  const tApp = useTranslations('app')
  const tCommunity = useTranslations('community')
  const tCommon = useTranslations('common')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const groupLabel = useMemo(() => {
    const groups = tCommunity.raw('groups') as Record<string, string> || {}
    return groups[group] || group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }, [group, tCommunity])

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`/api/community-feed?group=${group}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || tCommunity('failedLoad'))
      setPosts(data.data ?? [])
    } catch (e: any) {
      setError(tCommunity('failedLoad') || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status !== 'authenticated') return
    load()
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
      if (!res.ok) throw new Error(data?.error || tCommunity('failedPost'))
      setComposer({ title: '', body: '', anonymous: false })
      await load()
    } catch (e: any) {
      setError(tCommunity('failedPost') || e.message)
    } finally {
      setPosting(false)
    }
  }

  const groupsList = ['first_trimester', 'second_trimester', 'third_trimester', 'postpartum'] as Group[]

  return (
    <>
      <Head>
        <title>{tApp('pages.community')}</title>
      </Head>

      <AppShell
        title={tCommunity('title')}
        subtitle={tCommunity('subtitle')}
        actions={
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn-ghost text-sm"
          >
            {tCommon('signOut')}
          </button>
        }
      >

        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-surface p-6"
          >
            <div className="flex flex-wrap gap-2">
              {groupsList.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`px-3 py-2 rounded-2xl text-xs font-semibold border transition ${
                    g === group
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-white/80 border-white/70 text-slate-700 hover:bg-white'
                  }`}
                >
                  {groupLabel}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="card-surface p-6"
          >
            <h2 className="text-lg font-display text-slate-900 mb-3">{tCommunity('postTo', { groupLabel })}</h2>
            <form onSubmit={createPost} className="space-y-3">
              <input
                value={composer.title}
                onChange={(e) => setComposer((p) => ({ ...p, title: e.target.value }))}
                placeholder={tCommunity('titleOptional')}
                className="input-surface w-full"
              />

              <textarea
                value={composer.body}
                onChange={(e) => setComposer((p) => ({ ...p, body: e.target.value }))}
                placeholder={tCommunity('shareExperience')}
                rows={4}
                className="input-surface w-full"
                required
              />

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={composer.anonymous}
                  onChange={(e) => setComposer((p) => ({ ...p, anonymous: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                {tCommunity('postAnonymously')}
              </label>

              <button
                disabled={posting}
                className="w-full btn-primary disabled:opacity-50"
              >
                {posting ? tCommunity('posting') : tCommunity('post')}
              </button>
              <p className="text-xs text-slate-500">
                {tCommunity('moderationNote')}
              </p>
            </form>
          </motion.div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">{error}</div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="text-gray-600">{tCommunity('loading')}</div>
            ) : posts.length === 0 ? (
              <div className="text-gray-600">{tCommunity('noPosts')}</div>
            ) : (
              posts.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card-surface p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">
                        {p.anonymous ? tCommunity('anonymous') : tCommunity('member')} • {new Date(p.created_at).toLocaleString()}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">{p.title || tCommunity('post')}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-600">
                      {p.moderation_status}
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-wrap">{p.body}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </AppShell>
    </>
  )
}

