'use client'

import { useState, useEffect } from 'react'

/* SVG Icons */
const Icons = {
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  key: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-1.5 1.5l-3 3m-5 5l-2.5 2.5a2.5 2.5 0 1 1-3.5-3.5L6 11.5m6.5-6.5l3 3"/></svg>,
  warning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  sparkles: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
}

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [openrouterKey, setOpenrouterKey] = useState('')
  const [mistralKey, setMistralKey] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [savingKeys, setSavingKeys] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to load settings')
      const data = await res.json()
      if (data.user) {
        setName(data.user.name || '')
        setEmail(data.user.email || '')
        setGeminiKey(data.user.geminiApiKey || '')
        setGroqKey(data.user.groqApiKey || '')
        setOpenrouterKey(data.user.openrouterApiKey || '')
        setMistralKey(data.user.mistralApiKey || '')
      }
    } catch (e) {
      console.error(e)
      showToast('Error loading settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingKeys(true)
    try {
      const payload: any = {}
      if (!geminiKey.includes('••••')) payload.geminiApiKey = geminiKey
      if (!groqKey.includes('••••')) payload.groqApiKey = groqKey
      if (!openrouterKey.includes('••••')) payload.openrouterApiKey = openrouterKey
      if (!mistralKey.includes('••••')) payload.mistralApiKey = mistralKey

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save API keys')
      showToast('API keys saved successfully!')
      fetchSettings()
    } catch (err: any) {
      showToast(err.message || 'Error saving keys', 'error')
    } finally {
      setSavingKeys(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error('Failed to update profile')
      showToast('Profile updated successfully!')
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse p-4">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="h-48 bg-white/5 rounded-3xl" />
        <div className="h-64 bg-white/5 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative pb-16" suppressHydrationWarning>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-xl z-50 flex items-center gap-2.5 text-xs font-medium animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' : 'bg-red-500/20 border-red-500/30 text-red-200'
        }`}>
          <span className="text-sm">{toast.type === 'success' ? '✓' : '✗'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div suppressHydrationWarning>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account preferences, billing, and API integrations.</p>
      </div>

      {/* Subscription & Billing Hero Banner */}
      <section className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 p-6 md:p-8 overflow-hidden shadow-[0_10px_35px_rgba(109,94,249,0.12)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6" suppressHydrationWarning>
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm">
            ⚡ Pro Subscription
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Current Plan: Starter Free</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upgrade to Pro for unlimited AI notes, recordings, bKash/Nagad payments & faster speeds.
          </p>
        </div>

        {/* 3D Glass Graphic Decorative Placeholder */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block opacity-40 pointer-events-none">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-violet-500/30 to-cyan-400/30 rotate-12 blur-xl" />
        </div>

        <a href="/pricing" className="btn-primary py-3 px-8 text-xs font-bold shrink-0 rounded-2xl shadow-lg relative z-10 hover:scale-105 transition-all">
          <span>Manage / Upgrade Plan →</span>
        </a>
      </section>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" suppressHydrationWarning>
        
        {/* Left Column: Profile Settings */}
        <section className="lg:col-span-5 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)]" suppressHydrationWarning>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-violet-400">{Icons.user}</span> Profile Settings
          </h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                {name.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block truncate">{name || 'User'}</span>
                <p className="text-xs text-slate-400 truncate mt-0.5">{email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full bg-white/[0.02] border border-white/[0.04] rounded-2xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingProfile} className="btn-primary py-3 px-8 text-xs font-bold rounded-2xl disabled:opacity-50 shadow-md">
                <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: API Keys & AI Providers */}
        <section className="lg:col-span-7 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)]" suppressHydrationWarning>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">{Icons.key}</span> API Keys & AI Providers
            </h2>
            <p className="text-xs text-slate-400 mt-1">Bring your own API keys for free unlimited note generation.</p>
          </div>

          <form onSubmit={handleSaveApiKeys} className="space-y-4">
            {/* Mistral AI API Key */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px] font-extrabold border border-purple-500/20">M</span> Mistral AI API Key
                </label>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  mistralKey ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}>
                  {mistralKey ? 'Active' : 'Optional'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Powers high-volume premium note generation and AI study assistant.</p>
              <input 
                type="password" 
                value={mistralKey}
                onChange={(e) => setMistralKey(e.target.value)}
                placeholder="Mistral API Key..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 font-mono transition-all"
              />
            </div>

            {/* Google Gemini API Key */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-extrabold border border-blue-500/20">G</span> Google Gemini API Key
                </label>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  geminiKey ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}>
                  {geminiKey ? 'Active' : 'Optional'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Powers multimodal notes analysis and chat helper.</p>
              <input 
                type="password" 
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono transition-all"
              />
            </div>

            {/* OpenRouter API Key */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-extrabold border border-cyan-500/20">C</span> OpenRouter API Key
                </label>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  openrouterKey ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}>
                  {openrouterKey ? 'Active' : 'Optional'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Powers DeepSeek R1, LLaMA 3.3, and 25+ free AI models.</p>
              <input 
                type="password" 
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono transition-all"
              />
            </div>

            {/* Groq API Key */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-extrabold border border-amber-500/20">g</span> Groq API Key
                </label>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  groqKey ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                }`}>
                  {groqKey ? 'Active' : 'Optional'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-400">Required for audio transcription (Whisper speech-to-text).</p>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0 transition-colors"
                >
                  Get free key →
                </a>
              </div>
              <input 
                type="password" 
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={savingKeys} className="btn-secondary py-3 px-8 text-xs font-bold rounded-2xl disabled:opacity-50">
                <span>{savingKeys ? 'Saving...' : 'Save Integrations'}</span>
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  )
}
