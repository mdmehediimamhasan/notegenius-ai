'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

/* SVG Icons */
const Icons = {
  notes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  mic: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  quiz: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  export: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  more: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="19" cy="12" r="1"/>
      <circle cx="5" cy="12" r="1"/>
    </svg>
  ),
  trash: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  sparkles: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  calendar: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
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

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSec < 60) return 'Just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}

export default function HistoryPage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin === true
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedSource, setSelectedSource] = useState('All Sources')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Open action dropdown index
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/notes?sortBy=createdAt&order=desc')
        const data = await res.json()
        const entries = (data.notes || []).map((note: any) => ({
          id: note.id,
          action: note.status === 'completed' 
            ? 'Generated Notes' 
            : note.sourceType === 'recording' ? 'Recorded audio' : 'Uploaded file',
          target: note.title,
          date: note.createdAt,
          type: note.sourceType === 'recording' 
            ? 'Recording' 
            : note.sourceType === 'upload' ? 'Upload' : 'AI Note',
          status: note.status || 'completed',
          provider: note.generatedBy || note.transcribedBy || (note.sourceType === 'recording' ? 'Browser' : 'Local File'),
          quizzesCount: note._count?.quizzes || 0,
        }))
        setHistory(entries)
      } catch (err) {
        console.error('Failed to fetch history', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleDeleteEntry = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id))
    setActiveMenuId(null)
  }

  // Filtered entries
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.target.toLowerCase().includes(searchQuery.toLowerCase()) || item.action.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'All Types' || item.type === selectedType
      const matchesSource = selectedSource === 'All Sources' || item.provider.toLowerCase().includes(selectedSource.toLowerCase())
      return matchesSearch && matchesType && matchesSource
    })
  }, [history, searchQuery, selectedType, selectedSource])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / itemsPerPage))
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredHistory.slice(start, start + itemsPerPage)
  }, [filteredHistory, currentPage])

  // Stats calculation
  const totalCount = history.length
  const notesCount = history.filter(h => h.type === 'AI Note' || h.type === 'Note').length
  const recordingsCount = history.filter(h => h.type === 'Recording').length
  const uploadsCount = history.filter(h => h.type === 'Upload').length

  // CSV Export Handler
  const handleExportCSV = () => {
    if (history.length === 0) return
    const headers = ['ID', 'Action', 'Target', 'Type', 'Provider', 'Date']
    const rows = history.map(h => [
      h.id,
      `"${h.action.replace(/"/g, '""')}"`,
      `"${h.target.replace(/"/g, '""')}"`,
      h.type,
      h.provider,
      new Date(h.date).toISOString()
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `activity_history_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* ── 1. Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Activity <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Track every action you&apos;ve performed inside NoteGenius.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-5 py-2.5 text-xs bg-white/[0.04] text-slate-200 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] rounded-2xl transition-all font-bold flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95"
          >
            {Icons.export} Export Activity CSV
          </button>
        </div>
      </div>

      {/* ── 2. Summary Analytics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: All Activities */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-violet-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">All Activities</span>
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center shadow-sm">
              {Icons.sparkles}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : totalCount}</span>
            <MiniSparkline color="#8B5CF6" />
          </div>
        </div>

        {/* Card 2: Notes Generated */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-cyan-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Notes Generated</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-sm">
              {Icons.notes}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : (notesCount || totalCount)}</span>
            <MiniSparkline color="#38BDF8" />
          </div>
        </div>

        {/* Card 3: Recordings */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-pink-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Recordings</span>
            <div className="w-10 h-10 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-sm">
              {Icons.mic}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : recordingsCount}</span>
            <MiniSparkline color="#EC4899" />
          </div>
        </div>

        {/* Card 4: Uploads */}
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-emerald-500/30 transition-all group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400">Uploads</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
              {Icons.upload}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : uploadsCount}</span>
            <MiniSparkline color="#22C55E" />
          </div>
        </div>
      </div>

      {/* ── 3. Main Grid Layout (Table + Insights Sidebar) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8-Column Block: Toolbar & Activity Table */}
        <div className="lg:col-span-8 space-y-6">

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl flex flex-wrap items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search activity..."
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                {Icons.search}
              </div>
            </div>

            {/* Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-semibold rounded-2xl px-3.5 py-2.5 outline-none focus:border-violet-500/40 cursor-pointer"
            >
              <option value="All Types" className="bg-[#111827]">All Types</option>
              <option value="AI Note" className="bg-[#111827]">AI Note</option>
              <option value="Recording" className="bg-[#111827]">Recording</option>
              <option value="Upload" className="bg-[#111827]">Upload</option>
            </select>

            {/* Source Dropdown — Admin only */}
            {isAdmin && (
              <select
                value={selectedSource}
                onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
                className="bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs font-semibold rounded-2xl px-3.5 py-2.5 outline-none focus:border-violet-500/40 cursor-pointer"
              >
                <option value="All Sources" className="bg-[#111827]">All Sources</option>
                <option value="Mistral AI" className="bg-[#111827]">Mistral AI</option>
                <option value="Gemini" className="bg-[#111827]">Google Gemini</option>
                <option value="Groq" className="bg-[#111827]">Groq Whisper</option>
                <option value="Browser" className="bg-[#111827]">Browser</option>
                <option value="Local File" className="bg-[#111827]">Local File</option>
              </select>
            )}

            {/* Date Range Button */}
            <button className="px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 transition-all">
              {Icons.calendar} Jul 25, 2026 - Aug 1, 2026
            </button>

            {/* Clear Filters */}
            {(searchQuery || selectedType !== 'All Types' || selectedSource !== 'All Sources') && (
              <button 
                onClick={() => { setSearchQuery(''); setSelectedType('All Types'); setSelectedSource('All Sources'); setCurrentPage(1); }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-violet-300 font-semibold transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Activity Table Container */}
          <div className="rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            {loading ? (
              <div className="p-16 text-center text-slate-500 text-sm animate-pulse">Loading activity log...</div>
            ) : paginatedEntries.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto text-xl">
                  📜
                </div>
                <h3 className="text-sm font-bold text-white">No Activity Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Create your first note or upload an audio file to see activities here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-6">ACTIVITY</th>
                      <th className="py-4 px-4">TYPE</th>
                      {isAdmin && <th className="py-4 px-4">SOURCE</th>}
                      <th className="py-4 px-4">TIME</th>
                      <th className="py-4 px-6 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {paginatedEntries.map((item) => {
                      const isRecording = item.type === 'Recording'
                      const isUpload = item.type === 'Upload'
                      const isQuiz = item.action.includes('Quiz')

                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Activity Name & Description */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                                isRecording ? 'bg-pink-500/12 border-pink-500/20 text-pink-400' :
                                isUpload ? 'bg-emerald-500/12 border-emerald-500/20 text-emerald-400' :
                                isQuiz ? 'bg-amber-500/12 border-amber-500/20 text-amber-400' :
                                'bg-violet-500/12 border-violet-500/20 text-violet-400'
                              }`}>
                                {isRecording ? Icons.mic : isUpload ? Icons.upload : isQuiz ? Icons.quiz : Icons.notes}
                              </div>
                              <div className="min-w-0 max-w-xs sm:max-w-md">
                                <Link href={`/notes/${item.id}`} className="font-bold text-white hover:text-violet-300 transition-colors block truncate">
                                  {item.action} for &ldquo;{item.target}&rdquo;
                                </Link>
                                <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                  {isRecording ? 'Audio recording' : isUpload ? 'Uploaded document' : 'AI generated notes'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Type Pill */}
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              isRecording ? 'bg-pink-500/15 border-pink-500/30 text-pink-300' :
                              isUpload ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
                              isQuiz ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
                              'bg-violet-500/15 border-violet-500/30 text-violet-300'
                            }`}>
                              {item.type}
                            </span>
                          </td>

                          {/* Source Provider — Admin only */}
                          {isAdmin && (
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
                                <span className="text-violet-400">✨</span>
                                <span>{item.provider}</span>
                              </div>
                            </td>
                          )}

                          {/* Time */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="block text-[10px] text-slate-500">{new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>

                          {/* Actions Three-Dot Menu */}
                          <td className="py-4 px-6 text-right relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                              {Icons.more}
                            </button>

                            {activeMenuId === item.id && (
                              <div className="absolute right-6 top-12 w-36 bg-[#111827] border border-white/10 rounded-2xl shadow-xl z-30 py-1.5 text-left animate-fade-in">
                                <Link href={`/notes/${item.id}`} className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                                  View Details
                                </Link>
                                <button
                                  onClick={() => handleDeleteEntry(item.id)}
                                  className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                >
                                  {Icons.trash} Delete Log
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {filteredHistory.length > 0 && (
              <div className="p-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <span>
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredHistory.length)} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} activities
                </span>

                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="px-2.5 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &laquo;
                  </button>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                        currentPage === page
                          ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-violet-500'
                          : 'border border-white/[0.08] text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &gt;
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-2.5 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4-Column Sidebar: Activity Insights & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">

          {/* Activity Insights Card */}
          <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-violet-400">📊</span> Activity Insights
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                <span className="text-slate-400">Most Active Day</span>
                <span className="font-bold text-violet-300">Friday</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                <span className="text-slate-400">Total Time Saved</span>
                <span className="font-bold text-white">12h 42m</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">AI Usage</span>
                  <span className="font-bold text-cyan-300">78%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Productivity Score</span>
                  <span className="font-bold text-emerald-400">94/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="p-6 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">🕒</span> Recent Activity
            </h2>

            <div className="space-y-3.5">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-slate-300 truncate font-medium">{item.action}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">{getRelativeTime(item.date)}</span>
                </div>
              ))}

              {history.length === 0 && (
                <p className="text-xs text-slate-500 italic">No recent activity.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
