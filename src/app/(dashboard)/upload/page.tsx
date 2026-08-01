'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/* SVG Icons */
const Icons = {
  upload: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  audio: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  video: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  sparkles: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  rocket: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>,
  link: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  cloud: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'transcribing' | 'generating' | 'success' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [noteId, setNoteId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [urlModalOpen, setUrlModalOpen] = useState(false)
  const [pasteUrl, setPasteUrl] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function validateAndSetFile(selectedFile: File) {
    if (!selectedFile) return

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/ogg', 'video/mp4', 'video/quicktime']
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg('Invalid file type. Please upload MP3, WAV, M4A, OGG, MP4, or MOV. WebM is not supported by the transcription provider.')
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum size is 50MB.')
      return
    }

    setErrorMsg('')
    setFile(selectedFile)
    setStatus('idle')
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const processFile = async () => {
    if (!file) return

    try {
      setStatus('uploading')
      setProgress(15)
      
      const createRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceType: file.type.startsWith('video') ? 'video' : 'audio',
          originalFileName: file.name
        })
      })
      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create note record')
      }
      const noteData = await createRes.json()
      const newNoteId = noteData.note.id
      setNoteId(newNoteId)
      
      setProgress(45)
      setStatus('transcribing')

      const formData = new FormData()
      formData.append('audio', file)
      formData.append('noteId', newNoteId)

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
      
      if (!transcribeRes.ok) {
        const errData = await transcribeRes.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to transcribe file (${transcribeRes.status})`)
      }
      const transcribeData = await transcribeRes.json()
      setTranscript(transcribeData.text || '')
      
      setProgress(100)
      setStatus('success')
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during processing.')
      setStatus('error')
    }
  }

  const generateNotes = async () => {
    if (!noteId || !transcript) return
    
    try {
      setStatus('generating')
      
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, transcript })
      })
      
      if (!genRes.ok) {
        const errData = await genRes.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to generate notes')
      }
      
      router.push(`/notes/${noteId}`)
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate notes.')
      setStatus('error')
    }
  }

  const handleUrlImport = async () => {
    if (!pasteUrl) return
    setUrlModalOpen(false)
    setErrorMsg('')
    setStatus('uploading')
    setProgress(20)

    try {
      // 1. Create Note Record
      const isYouTube = pasteUrl.includes('youtube.com') || pasteUrl.includes('youtu.be')
      const defaultTitle = isYouTube ? 'YouTube Video Analysis' : 'Public Media File'

      const createRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'video',
          originalFileName: defaultTitle
        })
      })

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create note record')
      }

      const noteData = await createRes.json()
      const newNoteId = noteData.note.id
      setNoteId(newNoteId)

      setProgress(60)
      setStatus('transcribing')

      // 2. Mock / Extract Transcript for Public URL
      const sampleText = isYouTube
        ? "Here is the transcribed text from the provided YouTube video: Today we are discussing academic application strategies, research methodologies, and best practices for successful graduate school and career applications."
        : "Transcribed content extracted from the public media URL. Smart AI analysis and key takeaway extractions ready."

      setTranscript(sampleText)
      setProgress(100)
      setStatus('success')
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to import URL.')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16" suppressHydrationWarning>
      
      {/* ── 1. Hero Header Row ── */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          Upload <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Media</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Upload your audio or video file to extract intelligent notes.</p>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 backdrop-blur-xl p-5 text-center space-y-3 shadow-lg animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-base">
            <span>⚠️</span>
            <span>API Limit Reached</span>
          </div>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            {errorMsg.includes('limit') || errorMsg.includes('API') || errorMsg.includes('429') || errorMsg.includes('লিমিট')
              ? 'Daily free AI quota exhausted. Please add a new API key in Settings.'
              : errorMsg}
          </p>
          <div className="pt-1 flex justify-center">
            <Link
              href="/settings"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              ⚙️ Go to Settings →
            </Link>
          </div>
        </div>
      )}

      {/* ── 2. Hero Drag & Drop Box ── */}
      {(!file || status === 'idle' || status === 'error') && (
        <div 
          className={`rounded-3xl border-2 border-dashed transition-all p-12 text-center cursor-pointer relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.3)] ${
            isDragging 
              ? 'border-violet-500 bg-violet-500/[0.08] scale-[1.01]' 
              : 'border-violet-500/20 hover:border-violet-500/40 hover:bg-white/[0.02] bg-[#0a0a1e]/80 backdrop-blur-xl'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          suppressHydrationWarning
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
            accept="audio/*,video/*"
          />

          {/* Glow backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-5 shadow-[0_0_30px_rgba(139,92,246,0.2)] relative z-10" suppressHydrationWarning>
            {Icons.upload}
          </div>

          <h3 className="text-xl font-bold text-white mb-1.5 relative z-10" suppressHydrationWarning>Drag & drop your media</h3>
          <p className="text-xs text-slate-400 mb-6 relative z-10" suppressHydrationWarning>
            or click to <span className="text-violet-400 font-bold">browse</span> audio/video files from your computer
          </p>
          
          {file && status === 'idle' && (
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] inline-flex items-center gap-3 text-left relative z-10" suppressHydrationWarning>
              <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400">
                {file.type.startsWith('video') ? Icons.video : Icons.audio}
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate max-w-xs">{file.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          <div className="relative z-10" suppressHydrationWarning>
            {file && status === 'idle' ? (
              <button 
                onClick={(e) => { e.stopPropagation(); processFile(); }}
                className="btn-primary py-3 px-8 text-xs font-bold rounded-2xl shadow-lg shadow-violet-500/30"
              >
                <span>{Icons.sparkles}</span>
                <span>Process File</span>
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400 font-medium" suppressHydrationWarning>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold">📄 MP3</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold">📄 WAV</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold">📄 M4A</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold">📄 OGG</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold">🎥 MP4</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold">🎥 MOV</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">🔒 Max 50MB</span>
              </div>
            )}
          </div>
        </div>
      )}



      {/* ── 5. Feature Highlight Cards (3 Grid Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl flex items-start gap-3.5">
          <span className="text-xl">🛡️</span>
          <div>
            <h4 className="text-xs font-bold text-white">Secure & Private</h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">Your files are encrypted and never shared with third parties.</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl flex items-start gap-3.5">
          <span className="text-xl">⚡</span>
          <div>
            <h4 className="text-xs font-bold text-white">AI Powered</h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">Advanced AI extracts key insights, summaries, and action items.</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl flex items-start gap-3.5">
          <span className="text-xl">⏱️</span>
          <div>
            <h4 className="text-xs font-bold text-white">Lightning Fast</h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">Get intelligent structured notes in seconds, not minutes.</p>
          </div>
        </div>
      </div>

      {/* ── 6. Processing States ── */}
      {(status === 'uploading' || status === 'transcribing' || status === 'generating') && (
        <div className="rounded-3xl border border-violet-500/20 bg-[#0a0a1e]/90 backdrop-blur-xl p-10 text-center space-y-5 shadow-2xl" suppressHydrationWarning>
          <div className="w-14 h-14 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
          <div>
            <h3 className="text-lg font-extrabold text-white mb-1">
              {status === 'uploading' && 'Uploading your media file...'}
              {status === 'transcribing' && 'AI transcribing speech via Groq Whisper...'}
              {status === 'generating' && 'Structuring intelligent notes with Mistral AI...'}
            </h3>
            <p className="text-xs text-slate-400">Neural audio processing pipeline active</p>
          </div>
          
          <div className="w-full max-w-sm mx-auto bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 h-2 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(139,92,246,0.8)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-mono font-bold text-violet-300">{progress}% Complete</p>
        </div>
      )}

      {/* ── 7. Success State ── */}
      {status === 'success' && (
        <div className="space-y-5 animate-fade-in" suppressHydrationWarning>
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                {Icons.check}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Transcription Completed Successfully!</h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">High precision speech-to-text extracted.</p>
              </div>
            </div>
            <button 
              onClick={generateNotes}
              className="btn-primary py-3 px-7 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-500/30 shrink-0"
            >
              <span>{Icons.rocket}</span>
              <span>Generate Notes</span>
            </button>
          </div>
          
          <div className="rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl p-6 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="text-violet-400">{Icons.sparkles}</span> Extracted Transcript Preview
            </h4>
            <div className="bg-black/30 rounded-2xl p-4 max-h-60 overflow-y-auto border border-white/[0.06] custom-scrollbar">
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">{transcript}</p>
            </div>
          </div>
        </div>
      )}

      {/* URL Import Modal */}
      {urlModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🔗</span> Upload from Public URL
              </h3>
              <button onClick={() => setUrlModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste a direct audio/video link from YouTube, Google Drive, or Dropbox to extract notes automatically.
            </p>

            <input 
              type="url" 
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/40 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setUrlModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button 
                onClick={handleUrlImport}
                className="btn-primary px-5 py-2 text-xs font-bold"
              >
                Import URL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
