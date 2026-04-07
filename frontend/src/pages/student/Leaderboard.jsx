import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { Star, Medal, Crown, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentLeaderboard() {
  const { user } = useAuth()
  const [board, setBoard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/leaderboard', { params: { year: yearFilter || undefined } }),
      api.get('/leaderboard/my-rank')
    ]).then(([b, r]) => {
      setBoard(b.data.data)
      setMyRank(r.data.data)
    }).catch(() => toast.error('Failed to load leaderboard'))
    .finally(() => setLoading(false))
  }, [yearFilter])

  const RankIcon = ({ rank }) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />
    return <span className="text-sm font-bold text-slate-400 w-5 text-center">#{rank}</span>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Department Leaderboard</h1>
          <p className="text-slate-500 text-sm mt-1">{user?.department}</p>
        </div>
        <select className="input w-40" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {/* My rank card */}
      {myRank && (
        <div className="card p-5 bg-gradient-to-r from-brand-50 to-purple-50 border-brand-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-brand-700 font-semibold">Your Position</p>
              <p className="text-3xl font-bold text-brand-900">#{myRank.rank}</p>
              <p className="text-sm text-brand-600">{myRank.totalScore} pts in department · #{myRank.globalRank} globally</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="section-title">Rankings</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {board.map(s => {
              const isMe = s._id === user?._id
              return (
                <div key={s._id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${isMe ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    <RankIcon rank={s.rank} />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                    {s.name?.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isMe ? 'text-brand-800' : 'text-slate-800'}`}>
                      {s.name} {isMe && <span className="text-xs text-brand-500 font-medium">(You)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{s.rollNumber} · Year {s.year}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {s.placementReady && (
                      <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" /> Ready
                      </span>
                    )}
                    <span className={`font-bold text-sm ${isMe ? 'text-brand-700' : 'text-slate-700'}`}>{s.totalScore} pts</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
