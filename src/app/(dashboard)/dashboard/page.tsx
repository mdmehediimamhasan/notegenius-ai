'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

/* ─────────────────────────────────────────────
   Synchronized count-up hook
   All instances share the same duration so every
   number starts and finishes animating together.
───────────────────────────────────────────────*/
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(target)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

/* SVG Icons */
const Icons = {
  notes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  clock: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  academic: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  globe: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  upload: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  mic: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  library: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  sparkles: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  audio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  video: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
}

/* ─────────────────────────────────────────────
   Stat Card — height locked to prevent layout
   shift; all four share the same animation timing
───────────────────────────────────────────────*/
/* Sparkline SVG curves for stat cards */
const Sparklines = {
  purple: (
    <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
      <path d="M2 22 Q 15 10, 25 18 T 45 8 T 68 14" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  blue: (
    <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
      <path d="M2 20 Q 15 24, 25 14 T 45 18 T 68 6" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  green: (
    <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
      <path d="M2 18 Q 15 6, 25 16 T 45 10 T 68 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  pink: (
    <svg width="70" height="28" viewBox="0 0 70 28" fill="none" className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
      <path d="M2 14 Q 15 22, 25 8 T 45 20 T 68 10" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
}

/* ─────────────────────────────────────────────
   Stat Card — height locked to prevent layout
   shift; with mini sparkline graph
───────────────────────────────────────────────*/
interface StatCardProps {
  icon: React.ReactNode
  label: string
  rawValue: number
  format: (n: number) => string
  iconBg: string
  iconText: string
  iconBorder: string
  sparkline: React.ReactNode
}

function StatCard({ icon, label, rawValue, format, iconBg, iconText, iconBorder, sparkline }: StatCardProps) {
  const animated = useCountUp(rawValue)
  return (
    <div className="stat-card group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all duration-300 flex items-center justify-between gap-3 min-h-[5.5rem] cursor-pointer shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${iconBg} ${iconText} ${iconBorder} shadow-sm group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="stat-label text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-2 truncate">
            {label}
          </p>
          <p className="stat-value text-2xl font-extrabold text-white leading-none tabular-nums tracking-tight">
            {format(animated)}
          </p>
        </div>
      </div>
      <div className="hidden sm:block">
        {sparkline}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────────*/
export default function DashboardPage() {
  const { data: session } = useSession()
  const rawName = session?.user?.name || 'User'
  const firstName = rawName.trim().split(' ')[0] || 'User'

  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch('/api/notes')
        const data = await res.json()
        setNotes(data.notes || [])
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  /* ── Single source of truth from API ── */
  const totalNotes = notes.length

  const rawHoursSeconds = notes.reduce((acc, note) => {
    if (note.duration && Number(note.duration) > 0) {
      return acc + Number(note.duration)
    }
    const text = note.transcript || note.generatedNotes || ''
    if (text.trim().length > 0) {
      const words = text.trim().split(/\s+/).filter(Boolean).length
      return acc + Math.max(120, Math.round(words / 2.33))
    }
    return acc
  }, 0)

  const quizzesCompleted = notes.reduce((acc, note) => acc + (note._count?.quizzes || 0), 0)

  const userLanguages = new Set(
    notes
      .map((n) => (n.language && n.language !== 'auto' ? n.language.toUpperCase() : null))
      .filter(Boolean)
  )
  const uniqueLangCount = userLanguages.size || (totalNotes > 0 ? 1 : 0)

  const statCards: StatCardProps[] = [
    {
      label: 'Total Notes',
      rawValue: totalNotes,
      format: (n) => String(n),
      icon: Icons.notes,
      iconBg: 'bg-violet-500/[0.14]',
      iconText: 'text-violet-400',
      iconBorder: 'border-violet-500/20',
      sparkline: Sparklines.purple,
    },
    {
      label: 'Hours Transcribed',
      rawValue: Math.max(rawHoursSeconds > 0 ? 1 : 0, Math.round((rawHoursSeconds / 3600) * 10)),
      format: (n) => `${(n / 10).toFixed(1)}h`,
      icon: Icons.clock,
      iconBg: 'bg-cyan-500/[0.14]',
      iconText: 'text-cyan-400',
      iconBorder: 'border-cyan-500/20',
      sparkline: Sparklines.blue,
    },
    {
      label: 'Quizzes Completed',
      rawValue: quizzesCompleted,
      format: (n) => String(n),
      icon: Icons.academic,
      iconBg: 'bg-emerald-500/[0.14]',
      iconText: 'text-emerald-400',
      iconBorder: 'border-emerald-500/20',
      sparkline: Sparklines.green,
    },
    {
      label: 'Languages',
      rawValue: uniqueLangCount > 0 ? uniqueLangCount : 50,
      format: (n) => (uniqueLangCount > 0 ? String(n) : `${n}+`),
      icon: Icons.globe,
      iconBg: 'bg-pink-500/[0.14]',
      iconText: 'text-pink-400',
      iconBorder: 'border-pink-500/20',
      sparkline: Sparklines.pink,
    },
  ]

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
        <div className="h-8 bg-white/5 rounded-lg w-1/4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/[0.06]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white/5 rounded-2xl border border-white/[0.06]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12 relative">

      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-r from-indigo-950/60 via-[#100b2a]/80 to-slate-950/60 p-8 md:p-10 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.35)] dashboard-welcome-banner flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/20 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Workspace Ready
          </div>
          <h1 className="welcome-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight flex flex-wrap items-center gap-x-2">
            <span>Welcome back,</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="welcome-name bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                {firstName}!
              </span>
              <span>👋</span>
            </span>
          </h1>
          <p className="welcome-desc text-slate-400 text-sm mt-3 leading-relaxed font-normal">
            Transform your lectures, meetings, and audio files into intelligent structured notes with AI.
          </p>
        </div>

        {/* 3D Glass Note Illustration Graphic */}
        <div className="relative z-10 shrink-0 hidden md:flex items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Glowing ring under graphic */}
            <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-violet-500/30 to-cyan-400/30 blur-xl animate-pulse-slow" />
            {/* Glass panel sheet icon graphic */}
            <div className="w-32 h-36 rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 flex flex-col justify-between p-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-8 h-2 rounded-full bg-violet-400/80" />
                <div className="w-2 h-2 rounded-full bg-cyan-300" />
              </div>
              <div className="space-y-2 my-auto">
                <div className="w-full h-2 rounded-full bg-white/40" />
                <div className="w-3/4 h-2 rounded-full bg-white/30" />
                <div className="w-5/6 h-2 rounded-full bg-white/20" />
              </div>
              <div className="flex justify-end">
                <div className="w-6 h-6 rounded-lg bg-violet-500/40 border border-violet-400/30 flex items-center justify-center text-white text-xs">✨</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/upload"
            className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all duration-300 group relative overflow-hidden shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 text-violet-300 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              {Icons.upload}
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">Upload Media</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Extract notes from your existing MP3, MP4, WAV, or WebM files.</p>
            <div className="mt-5 text-xs font-bold text-violet-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Start Upload</span>
              {Icons.arrowRight}
            </div>
          </Link>

          <Link
            href="/record"
            className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] transition-all duration-300 group relative overflow-hidden shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              {Icons.mic}
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">Record Audio</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Record live lectures or meetings directly from your browser.</p>
            <div className="mt-5 text-xs font-bold text-cyan-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Start Recording</span>
              {Icons.arrowRight}
            </div>
          </Link>

          <Link
            href="/notes"
            className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all duration-300 group relative overflow-hidden shadow-sm"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              {Icons.library}
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">View Library</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Browse, search, export, and review your generated notes.</p>
            <div className="mt-5 text-xs font-bold text-emerald-400 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Browse Notes</span>
              {Icons.arrowRight}
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Notes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Notes</h2>
          {notes.length > 0 && (
            <Link href="/notes" className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              <span>View All</span>
              {Icons.arrowRight}
            </Link>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center bg-white/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-3">
              {Icons.sparkles}
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Your Knowledge Base is Empty</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Upload a recording or start a live audio session to generate your first AI note.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/upload" className="btn-primary py-2 px-5 text-xs"><span>Upload File</span></Link>
              <Link href="/record" className="btn-secondary py-2 px-5 text-xs"><span>Record Audio</span></Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.slice(0, 6).map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all duration-300 hover:border-violet-500/30 group block shadow-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3.5">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/15">
                    {note.sourceType === 'video' ? Icons.video : Icons.audio}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {note.status || 'Completed'}
                    </span>
                    <button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/5 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-sm text-white mb-1.5 truncate group-hover:text-violet-300 transition-colors leading-snug">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-normal">
                  {note.summary || 'AI-generated structured notes.'}
                </p>
                <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 pt-3 border-t border-white/[0.04]">
                  <span>{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>{Math.round((note.duration || 0) / 60)} min</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Right Floating Action Sparkles Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(109,94,249,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20"
          title="Scroll to Top"
        >
          {Icons.sparkles}
        </button>
      </div>
    </div>
  )
}

