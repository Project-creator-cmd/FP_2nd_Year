import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Star, Medal, Crown, TrendingUp, Trophy, Sparkles, ArrowUpRight, Search, Download } from 'lucide-react'
import toast from 'react-hot-toast'

function PodiumCard({ student, rank, isMe }) {
  const configs = {
    1: { height: 'h-28', bg: 'from-amber-400 to-yellow-500', glow: 'rgba(245,158,11,0.4)', badge: 'bg-amber-400', size: 'w-16 h-16 text-lg', order: 'order-2' },
    2: { height: 'h-20', bg: 'from-slate-300 to-slate-400',  glow: 'rgba(148,163,184,0.3)', badge: 'bg-slate-400', size: 'w-14 h-14 text-base', order: 'order-1' },
    3: { height: 'h-16', bg: 'from-amber-600 to-amber-700',  glow: 'rgba(180,83,9,0.3)',   badge: 'bg-amber-600', size: 'w-14 h-14 text-base', order: 'order-3' },
  }
  const c = configs[rank]
  if (!student) return <div className={c.order + ' flex-1'} />
  return (
    <div className={c.order + ' flex-1 flex flex-col items-center gap-2'}>
      <div className="relative">
        <div className={c.size + ' rounded-2xl bg-gradient-to-br ' + c.bg + ' flex items-center justify-center text-white font-extrabold shadow-lg ' + (isMe ? 'ring-4 ring-brand-400 ring-offset-2' : '')}
          style={{ boxShadow: '0 8px 24px ' + c.glow }}>
          {student.name?.slice(0, 2).toUpperCase()}
        </div>
        <div className={'absolute -top-2 -right-2 w-7 h-7 ' + c.badge + ' rounded-full flex items-center justify-center shadow-md'}>
          {rank === 1 ? <Crown className="w-4 h-4 text-white" /> : <Medal className="w-4 h-4 text-white" />}
        </div>
      </div>
      <div className="text-center">
        <p className={'text-sm font-bold truncate max-w-[90px] ' + (isMe ? 'text-brand-700' : 'text-slate-800')}>
          {student.name?.split(' ')[0]}{isMe && <span className="text-brand-500 ml-1">*</span>}
        </p>
        <p className="text-xs text-slate-500 font-semibold">{student.totalScore} pts</p>
      </div>
      <div className={'w-full ' + c.height + ' rounded-t-xl bg-gradient-to-b ' + c.bg + ' opacity-80 flex items-center justify-center'}>
        <span className="text-white font-extrabold text-xl">#{rank}</span>
      </div>
    </div>
  )
}

export default function StudentLeaderboard() {
  const { user } = useAuth()
  const [board,      setBoard]      = useState([])
  const [myRank,     setMyRank]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [yearFilter, setYearFilter] = useState('')
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [exporting,  setExporting]  = useState(false)
  const LIMIT = 20

  const fetchBoard = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (yearFilter) params.year   = yearFilter
      if (search)     params.search = search
      const [b, r] = await Promise.all([
        api.get('/leaderboard', { params }),
        page === 1 ? api.get('/leaderboard/my-rank') : Promise.resolve(null),
      ])
      setBoard(b.data.data || [])
      setTotal(b.data.total || 0)
      setTotalPages(b.data.pages || 1)
      if (r) setMyRank(r.data.data)
    } catch { toast.error('Failed to load leaderboard') }
    finally { setLoading(false) }
  }, [page, yearFilter, search])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [yearFilter, search])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (yearFilter) params.year = yearFilter
      const res = await api.get('/leaderboard/export', { params, responseType: 'blob' })
      const url  = URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.download = 'leaderboard.csv'
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Leaderboard exported!')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const top3 = page === 1 ? [board[1], board[0], board[2]] : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Leaderboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user?.department} - {total} students</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input w-36 text-sm" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            <option value="">All Years</option>
            {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <button onClick={handleExport} disabled={exporting} className="btn-secondary gap-2 text-sm">
            <Download className="w-4 h-4" /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input pl-9" placeholder="Search by name or roll number..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {myRank && page === 1 && (
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Your Position</p>
              <div className="flex items-end gap-3">
                <p className="text-4xl font-extrabold text-white">#{myRank.rank}</p>
                <div className="mb-1">
                  <p className="text-sm font-semibold text-slate-300">{myRank.totalScore} pts</p>
                  <p className="text-xs text-slate-500">#{myRank.globalRank} globally</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">Top {Math.round(myRank.rank / total * 100) || 5}%</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        </div>
      ) : (
        <>
          {top3.length >= 3 && !search && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="section-title">Top Performers</h2>
              </div>
              <div className="flex items-end justify-center gap-4 px-4">
                {top3.map((s, i) => {
                  const rank = i === 0 ? 2 : i === 1 ? 1 : 3
                  return <PodiumCard key={s?._id || i} student={s} rank={rank} isMe={s?._id === user?._id} />
                })}
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="section-title">Rankings</h2>
              <span className="text-xs text-slate-400 font-medium">{total} students</span>
            </div>
            <div className="divide-y divide-slate-50">
              {board.map(s => {
                const isMe = s._id === user?._id
                return (
                  <div key={s._id} className={'flex items-center gap-4 px-5 py-3.5 transition-all duration-200 ' + (isMe ? 'bg-brand-50/60 border-l-2 border-brand-500' : 'hover:bg-slate-50/80 border-l-2 border-transparent')}>
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      {s.rank === 1 ? <Crown className="w-5 h-5 text-amber-500" />
                        : s.rank === 2 ? <Medal className="w-5 h-5 text-slate-400" />
                        : s.rank === 3 ? <Medal className="w-5 h-5 text-amber-700" />
                        : <span className="text-sm font-bold text-slate-400">#{s.rank}</span>}
                    </div>
                    <div className={'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ' + (isMe ? 'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600')}>
                      {s.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={'font-semibold text-sm truncate ' + (isMe ? 'text-brand-800' : 'text-slate-800')}>
                        {s.name}
                        {isMe && <span className="text-xs text-brand-500 font-bold ml-2 bg-brand-100 px-1.5 py-0.5 rounded-md">You</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.rollNumber} - Year {s.year}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {s.placementReady && (
                        <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <TrendingUp className="w-3 h-3" /> Ready
                        </span>
                      )}
                      <p className={'font-extrabold text-sm ' + (isMe ? 'text-brand-700' : 'text-slate-700')}>{s.totalScore} pts</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary text-sm disabled:opacity-40">Previous</button>
                <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary text-sm disabled:opacity-40">Next</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}