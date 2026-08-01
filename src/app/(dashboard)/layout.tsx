'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

/* ===== SVG ICON COMPONENTS ===== */
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  record: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  notes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  history: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  signout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  menu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),
}

const navItems = [
  { href: '/dashboard', icon: icons.dashboard, label: 'Dashboard' },
  { href: '/upload', icon: icons.upload, label: 'Upload' },
  { href: '/record', icon: icons.record, label: 'Record' },
  { href: '/notes', icon: icons.notes, label: 'Notes' },
  { href: '/history', icon: icons.history, label: 'History' },
  { href: '/settings', icon: icons.settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'day'>('dark')
  const pathname = usePathname()
  const { data: session } = useSession()

  // Interactive Control States
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [dateMenuOpen, setDateMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [selectedDateFilter, setSelectedDateFilter] = useState('Today')
  const [showUsageModal, setShowUsageModal] = useState(false)

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Upload Completed', desc: 'Lecture_notes.pdf processed', time: '2m ago', read: false, icon: '📄', link: '/notes' },
    { id: '2', title: 'Audio Transcribed', desc: 'Research meeting transcribed via Groq Whisper', time: '26m ago', read: false, icon: '🎙️', link: '/notes' },
    { id: '3', title: 'AI Note Generated', desc: 'Structured summary ready with Mistral Large', time: '1h ago', read: false, icon: '✨', link: '/notes' },
    { id: '4', title: 'API Quota Active', desc: 'Unlimited AI generation available', time: '1d ago', read: true, icon: '⚡', link: '/settings' },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  // Refs for click outside detection
  const bellRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedTheme = (localStorage.getItem('notegenius-theme') || localStorage.getItem('theme')) as 'dark' | 'day' | null
    if (savedTheme === 'day' || savedTheme === 'dark') {
      setTheme(savedTheme)
      document.documentElement.dataset.theme = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateMenuOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setNotificationsOpen(false)
        setDateMenuOpen(false)
        setAccountMenuOpen(false)
        setShowUsageModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'day' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('notegenius-theme', newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.dataset.theme = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 relative" suppressHydrationWarning>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 border-r border-white/[0.06] transform transition-all duration-300 ease-out bg-[var(--surface-1)] backdrop-blur-2xl flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          desktopSidebarOpen ? 'lg:translate-x-0 w-[260px] lg:w-[260px]' : 'lg:-translate-x-full w-[260px] lg:w-0 lg:border-none'
        } overflow-hidden`}
        suppressHydrationWarning
      >
        <div className="flex flex-col h-full bg-[var(--surface-1)] backdrop-blur-2xl relative">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NoteGenius</span>
            </Link>
            <button 
              onClick={() => {
                setSidebarOpen(false)
                setDesktopSidebarOpen(false)
              }}
              className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Close Sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20 shadow-[0_2px_12px_rgba(139,92,246,0.12)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span className={`transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold tracking-tight">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Upgrade Banner in Sidebar */}
          <div className="mx-3 my-2 p-4 rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 via-violet-500/5 to-transparent relative overflow-hidden group">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-2.5 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h4 className="text-xs font-bold text-white mb-1 tracking-tight">Upgrade to Pro</h4>
            <p className="text-[11px] text-slate-400 leading-tight mb-3">Unlock unlimited notes, longer recordings, and more.</p>
            <Link href="/pricing" className="btn-primary w-full py-2 px-3 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 shadow-md">
              <span>Upgrade Now</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>

          {/* User Profile Footer in Sidebar with Interactive Account Menu */}
          <div className="px-3 py-3 border-t border-white/[0.06] mt-auto relative" ref={accountRef}>
            <div 
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                  {session?.user?.name?.[0]?.toUpperCase() || 'D'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-snug">
                    {session?.user?.name || 'Demo User'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate leading-tight">
                    {session?.user?.email || 'demo@notegenius.ai'}
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); signOut({ callbackUrl: '/' }); }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                title="Sign Out"
              >
                {icons.signout}
              </button>
            </div>

            {/* Account Menu Dropdown */}
            {accountMenuOpen && (
              <div className="absolute bottom-16 left-3 right-3 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-1 animate-fade-in backdrop-blur-2xl">
                <Link 
                  href="/settings" 
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span>👤</span> View Profile & Settings
                </Link>
                <Link 
                  href="/pricing" 
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span>💳</span> Subscription & Billing
                </Link>
                <button 
                  onClick={() => { setShowUsageModal(true); setAccountMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span>📊</span> Usage & Quota Limits
                </button>
                <button 
                  onClick={() => { toggleTheme(); setAccountMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span>🎨</span> Theme: {theme === 'dark' ? 'Night (Dark)' : 'Day (Light)'}
                </button>
                <div className="border-t border-white/10 my-1" />
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-bold"
                >
                  <span>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]" suppressHydrationWarning>
        {/* Top Header Bar */}
        <header className="border-b border-white/[0.06] px-6 py-3 flex items-center justify-between bg-[var(--surface-1)] backdrop-blur-xl relative z-30" suppressHydrationWarning>
          <div className="flex items-center gap-4" suppressHydrationWarning>
            <button
              className={`text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 ${desktopSidebarOpen ? 'lg:hidden' : 'lg:block'}`}
              onClick={() => {
                setSidebarOpen(true)
                setDesktopSidebarOpen(true)
              }}
            >
              {icons.menu}
            </button>
            {/* Search bar */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white/[0.04] rounded-xl px-3.5 py-1.5 border border-white/[0.06] w-80 transition-all focus-within:border-violet-500/40 focus-within:bg-white/[0.06] shadow-sm" suppressHydrationWarning>
              <span className="text-slate-500">{icons.search}</span>
              <input
                type="text"
                placeholder="Search notes, recordings..."
                className="bg-transparent text-xs font-medium text-white placeholder-slate-500 outline-none flex-1"
                suppressHydrationWarning
              />
              <kbd className="hidden md:inline text-[10px] text-slate-500 bg-white/[0.06] px-1.5 py-0.5 rounded font-mono border border-white/[0.06]">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/[0.06]"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? icons.sun : icons.moon}
            </button>
            
            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={bellRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/[0.06]"
                aria-label="Notifications"
              >
                {icons.bell}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.9)] animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#111827] border border-white/10 rounded-3xl shadow-2xl z-50 p-4 space-y-3 animate-fade-in backdrop-blur-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🔔</span> Notifications ({unreadCount} new)
                    </h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-6">No new notifications.</p>
                    ) : (
                      notifications.map(n => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))
                            setNotificationsOpen(false)
                          }}
                          className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                            n.read ? 'bg-white/[0.02] border-white/[0.04] text-slate-400' : 'bg-violet-500/10 border-violet-500/20 text-white shadow-sm'
                          }`}
                        >
                          <span className="text-base">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold truncate">{n.title}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{n.desc}</p>
                            <span className="text-[10px] text-slate-500 font-mono block mt-1">{n.time}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 text-center">
                    <Link href="/history" onClick={() => setNotificationsOpen(false)} className="text-xs text-violet-400 hover:text-violet-300 font-bold">
                      View Activity Log →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Date & Activity Filter Pill with Dropdown */}
            <div className="relative hidden md:block" ref={dateRef}>
              <div 
                onClick={() => setDateMenuOpen(!dateMenuOpen)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3.5 py-2 rounded-xl cursor-pointer transition-all shadow-sm"
                suppressHydrationWarning
              >
                <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-[11px]">
                  {session?.user?.name?.[0]?.toUpperCase() || 'D'}
                </div>
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${dateMenuOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
              </div>

              {/* Date & Today Activity Dropdown */}
              {dateMenuOpen && (
                <div className="absolute right-0 top-12 w-80 bg-[#111827] border border-white/10 rounded-3xl shadow-2xl z-50 p-5 space-y-4 animate-fade-in backdrop-blur-2xl">
                  <div>
                    <h3 className="text-xs font-bold text-white mb-2">Today&apos;s Activity Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-slate-400 text-[11px]">Notes Created</span>
                        <p className="text-lg font-bold text-white">3</p>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-slate-400 text-[11px]">Recordings</span>
                        <p className="text-lg font-bold text-white">1</p>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-slate-400 text-[11px]">Quizzes</span>
                        <p className="text-lg font-bold text-white">2</p>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                        <span className="text-slate-400 text-[11px]">Hours Saved</span>
                        <p className="text-lg font-bold text-white">1h 20m</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Filter Dashboard Date</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'All Time'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => { setSelectedDateFilter(filter); setDateMenuOpen(false); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedDateFilter === filter ? 'bg-violet-600 text-white shadow-md' : 'bg-white/[0.04] text-slate-400 hover:text-white'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" suppressHydrationWarning>
          {children}
        </div>
      </main>

      {/* Usage Quota Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📊</span> Usage & Quota Limits
              </h3>
              <button onClick={() => setShowUsageModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">AI Notes Generation</span>
                  <span className="font-bold text-violet-400">Unlimited (Active API Keys)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Audio Transcription</span>
                  <span className="font-bold text-cyan-400">Unlimited (Groq Whisper)</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setShowUsageModal(false)} className="btn-primary py-2 px-5 text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
