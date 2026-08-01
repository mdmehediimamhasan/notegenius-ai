'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'

/* SVG Icons */
const Icons = {
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  mic: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  trash: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  calendar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  audio: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  video: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  recording: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  file: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  checkSquare: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  x: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  more: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
}

function MiniSparkline({ color }: { color: string }) {
  return (
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" className="opacity-80">
      <path
        d="M2 14 C 10 18, 15 4, 25 10 C 35 16, 45 2, 58 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function cleanTitle(title: string): string {
  return title.replace(/^[#*\s]+/, '').replace(/[*#]/g, '').trim()
}

export default function NotesPage() {
  type NoteItem = {
    id: string
    title: string
    summary?: string | null
    sourceType: 'audio' | 'video' | 'recording' | string
    createdAt: string
    status?: string | null
    duration?: number | null
    generatedBy?: string | null
  }

  const [notes, setNotes] = useState<NoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [notesRes, analyticsRes] = await Promise.all([
          fetch('/api/notes'),
          fetch('/api/analytics')
        ])
        const notesData = await notesRes.json()
        const analyticsData = await analyticsRes.json()
        setNotes(notesData.notes || [])
        if (analyticsData.analytics) {
          setAnalytics(analyticsData.analytics)
        }
      } catch (err) {
        console.error('Failed to fetch notes or analytics', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => filter === 'all' || note.sourceType === filter)
      .filter(note => note.title.toLowerCase().includes(search.toLowerCase()) || note.summary?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        return a.title.localeCompare(b.title)
      })
  }, [notes, filter, search, sort])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete note')
      }

      setNotes(prev => prev.filter(n => n.id !== id))
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setActiveMenuId(null)

      // Refresh analytics after deletion
      fetch('/api/analytics').then(r => r.json()).then(d => {
        if (d.analytics) setAnalytics(d.analytics)
      }).catch(() => {})
    } catch (error) {
      console.error('Delete note failed', error)
      alert(error instanceof Error ? error.message : 'Failed to delete note')
    }
  }

  // Bulk selection handlers
  const toggleSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }, [selectedIds])

  const selectAll = useCallback(() => {
    if (selectedIds.size === filteredNotes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredNotes.map(n => n.id)))
    }
  }, [filteredNotes, selectedIds])

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} selected note(s)?`)) return
    ;(async () => {
      try {
        const results = await Promise.all(Array.from(selectedIds).map(async (id) => {
          const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || `Failed to delete note ${id}`)
          }
          return id
        }))

        setNotes(prev => prev.filter(n => !results.includes(n.id)))
        setSelectedIds(new Set())
        setIsSelectMode(false)

        fetch('/api/analytics').then(r => r.json()).then(d => {
          if (d.analytics) setAnalytics(d.analytics)
        }).catch(() => {})
      } catch (error) {
        console.error('Bulk delete failed', error)
        alert(error instanceof Error ? error.message : 'Failed to delete selected notes')
      }
    })()
  }, [selectedIds])

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false)
    setSelectedIds(new Set())
  }, [])

  // Live Stats calculation fallback
  const totalNotesCount = analytics?.totalNotes?.count ?? notes.length
  const audioNotesCount = analytics?.audioNotes?.count ?? notes.filter(n => n.sourceType === 'audio').length
  const recordingsCount = analytics?.recordings?.count ?? notes.filter(n => n.sourceType === 'recording').length
  const summariesCount = analytics?.summaries?.count ?? notes.filter(n => n.summary).length
  const storageUsed = analytics?.storage?.usedGB ?? '0.15'
  const storagePercentage = analytics?.storage?.percentage ?? 5

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      
      {/* ── 1. Header Row ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Your <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Notes</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage and review your generated knowledge base.</p>
        </div>

        <div className="flex items-center gap-3">
          {!isSelectMode ? (
            <>
              <button
                onClick={() => setIsSelectMode(true)}
                className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-2xl transition-all flex items-center gap-2 shadow-sm"
              >
                {Icons.checkSquare} Select
              </button>
              <Link 
                href="/upload" 
                className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-2xl transition-all flex items-center gap-2 shadow-sm"
              >
                {Icons.upload} Upload
              </Link>
              <Link 
                href="/record" 
                className="btn-primary px-5 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-500/25"
              >
                {Icons.mic} Record
              </Link>
            </>
          ) : (
            <>
              <button onClick={selectAll} className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.04] border border-white/[0.08] rounded-2xl transition-all">
                {selectedIds.size === filteredNotes.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0}
                className="px-4 py-2.5 text-xs font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {Icons.trash} Delete ({selectedIds.size})
              </button>
              <button onClick={exitSelectMode} className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08] rounded-2xl transition-all flex items-center gap-1.5">
                {Icons.x} Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 2. Controls & Search Bar ── */}
      <div className="p-4 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        {/* Search Field */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search notes, summaries, keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {Icons.search}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
          <div className="flex bg-white/[0.04] rounded-2xl p-1 border border-white/[0.08]">
            {['all', 'audio', 'video', 'recording'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filter === f 
                    ? 'bg-violet-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <select 
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none focus:border-violet-500/40 cursor-pointer"
          >
            <option value="newest" className="bg-[#111827]">Newest First</option>
            <option value="oldest" className="bg-[#111827]">Oldest First</option>
            <option value="az" className="bg-[#111827]">A-Z</option>
          </select>
        </div>
      </div>

      {/* ── 3. Top 4 Analytics Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Notes */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-violet-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Total Notes</span>
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-sm">
              {Icons.file}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : totalNotesCount}</span>
            <MiniSparkline color="#8B5CF6" />
          </div>
          <span className="text-[11px] text-violet-300 font-medium block">{analytics?.totalNotes?.growth || '+0 this week'}</span>
        </div>

        {/* Card 2: Audio Notes */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-cyan-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Audio Notes</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-sm">
              {Icons.audio}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : audioNotesCount}</span>
            <MiniSparkline color="#38BDF8" />
          </div>
          <span className="text-[11px] text-cyan-300 font-medium block">{analytics?.audioNotes?.growth || '+0 this week'}</span>
        </div>

        {/* Card 3: Recordings */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-emerald-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Recordings</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
              {Icons.recording}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : recordingsCount}</span>
            <MiniSparkline color="#22C55E" />
          </div>
          <span className="text-[11px] text-emerald-300 font-medium block">{analytics?.recordings?.growth || '+0 this week'}</span>
        </div>

        {/* Card 4: Summaries */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-amber-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Summaries</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-sm">
              {Icons.file}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : summariesCount}</span>
            <MiniSparkline color="#F59E0B" />
          </div>
          <span className="text-[11px] text-amber-300 font-medium block">{analytics?.summaries?.growth || '+0 this week'}</span>
        </div>
      </div>

      {/* ── 4. Main 2-Column Grid Layout (Notes Cards + Sidebar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left 8-Column Block: Result Counter & Notes Cards List */}
        <div className="lg:col-span-8 space-y-6">

          {/* Results count label */}
          {!loading && (
            <p className="text-xs text-slate-400 font-medium">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} found
              {filter !== 'all' && <span> · filtered by <span className="text-violet-400 font-bold">{filter}</span></span>}
            </p>
          )}

          {/* Cards Grid */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 rounded-3xl animate-pulse bg-white/[0.03] border border-white/[0.06]" />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="border border-dashed border-white/[0.08] rounded-3xl p-16 text-center flex flex-col items-center justify-center bg-[#0a0a1e]/80 backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 text-2xl">
                📜
              </div>
              <h3 className="text-base font-bold text-white mb-2">No notes found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                {search || filter !== 'all' ? "Try adjusting your search query or filter chips." : "You don't have any generated notes yet. Create your first one!"}
              </p>
              {!search && filter === 'all' && (
                <div className="flex gap-3">
                  <Link href="/upload" className="btn-primary py-2.5 px-5 text-xs font-bold"><span>Upload File</span></Link>
                  <Link href="/record" className="px-5 py-2.5 text-xs font-bold bg-white/[0.06] text-white hover:bg-white/10 rounded-xl border border-white/10 transition-colors"><span>Record Audio</span></Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map(note => {
                const isRecording = note.sourceType === 'recording'
                const isVideo = note.sourceType === 'video'

                return (
                  <div key={note.id} className="relative group">
                    {/* Selection checkbox */}
                    {isSelectMode && (
                      <button
                        onClick={(e) => toggleSelect(note.id, e)}
                        className={`absolute top-5 left-5 z-20 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedIds.has(note.id)
                            ? 'bg-violet-500 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                            : 'border-white/20 bg-black/40 backdrop-blur-sm hover:border-violet-400'
                        }`}
                      >
                        {selectedIds.has(note.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </button>
                    )}

                    {/* Knowledge Card Container */}
                    <div 
                      className={`p-6 rounded-3xl border transition-all duration-300 bg-[#0a0a1e]/80 backdrop-blur-xl relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${
                        selectedIds.has(note.id)
                          ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                          : 'border-white/[0.06] hover:border-violet-500/30 hover:shadow-[0_12px_40px_rgba(139,92,246,0.10)]'
                      }`}
                    >
                      {/* Top Header Row: Icon Badge, Status Chips, Three-Dot Menu */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                            isRecording ? 'bg-pink-500/12 border-pink-500/20 text-pink-400' :
                            isVideo ? 'bg-cyan-500/12 border-cyan-500/20 text-cyan-400' :
                            'bg-violet-500/12 border-violet-500/20 text-violet-400'
                          }`}>
                            {isRecording ? Icons.recording : isVideo ? Icons.video : Icons.audio}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/15 border border-violet-500/30 text-violet-300">
                              AI Generated
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                              {note.status || 'Completed'}
                            </span>
                          </div>
                        </div>

                        {/* Actions menu */}
                        {!isSelectMode && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setActiveMenuId(activeMenuId === note.id ? null : note.id)
                              }}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                              {Icons.more}
                            </button>

                            {activeMenuId === note.id && (
                              <div className="absolute right-0 top-10 w-36 bg-[#111827] border border-white/10 rounded-2xl shadow-xl z-30 py-1.5 text-left animate-fade-in">
                                <Link href={`/notes/${note.id}`} className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                                  Open Note
                                </Link>
                                <button
                                  onClick={(e) => handleDelete(note.id, e)}
                                  className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                >
                                  {Icons.trash} Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Note Title & Summary */}
                      <Link href={isSelectMode ? '#' : `/notes/${note.id}`} onClick={isSelectMode ? (e) => toggleSelect(note.id, e) : undefined} className="block group">
                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug">
                          {cleanTitle(note.title)}
                        </h3>
                        
                        <p className="text-xs text-slate-400 mb-5 line-clamp-3 leading-relaxed">
                          {note.summary || "A comprehensive overview of key insights, research methodologies, and best practices generated by NoteGenius AI."}
                        </p>

                        {/* Footer Metadata Row */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-400 pt-4 border-t border-white/[0.06]">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            {Icons.calendar} {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>

                          <span className="flex items-center gap-1.5 text-slate-400">
                            {Icons.clock} {note.duration ? Math.floor(note.duration / 60) : 13}:{note.duration ? (Math.floor(note.duration % 60)).toString().padStart(2, '0') : '16'}s
                          </span>

                          <span className="flex items-center gap-1 text-slate-300 font-semibold">
                            🎙️ {isRecording ? 'Audio Recording' : 'Audio Note'}
                          </span>

                          <span className="flex items-center gap-1 text-violet-300 font-semibold ml-auto">
                            ✨ {note.generatedBy || 'Mistral AI'}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer message */}
          {filteredNotes.length > 0 && (
            <div className="pt-8 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
              <span>💜</span>
              <span>That&apos;s all for now! Create more notes to see them here.</span>
              <span>✨</span>
            </div>
          )}
        </div>

        {/* Right 4-Column Sidebar: Storage Usage, Quick Actions & Recent Tags */}
        <div className="lg:col-span-4 space-y-6">




          {/* Card 2: Quick Actions */}
          <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h2>

            <div className="space-y-2 text-xs font-bold">
              <Link href="/upload" className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-all group">
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">📄</span>
                  New Note
                </span>
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">+</span>
              </Link>

              <Link href="/upload" className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-all group">
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">⬆</span>
                  Import File
                </span>
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">⇡</span>
              </Link>

              <Link href="/record" className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-all group">
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">🎙</span>
                  Record Audio
                </span>
                <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs">🎙</span>
              </Link>

              <Link href="/notes" className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-all group">
                <span className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">❓</span>
                  Practice Quiz
                </span>
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">?</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Recent Tags */}
          <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>🏷️</span> Recent Tags
            </h2>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 font-bold flex items-center gap-2">
                Research <span className="text-slate-400 font-normal">12</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-2">
                Academic <span className="text-slate-400 font-normal">8</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2">
                AI Generated <span className="text-slate-400 font-normal">24</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-2">
                Lecture <span className="text-slate-400 font-normal">6</span>
              </span>
            </div>

            <Link href="/notes" className="text-xs text-violet-400 hover:text-violet-300 font-bold block pt-1">
              View all tags &rarr;
            </Link>
          </div>

        </div>

      </div>

    </div>
  )
}
