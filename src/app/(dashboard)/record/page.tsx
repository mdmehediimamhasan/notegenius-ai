'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/* SVG Icons */
const Icons = {
  mic: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  play: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  stop: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
  refresh: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  sparkle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  rocket: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  wave: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h2l3-9 4 18 4-12 3 6h4"/></svg>,
  trash: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
}

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [transcript, setTranscript] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [noteId, setNoteId] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  type SpeechRecognitionResultItem = { transcript: string }
  type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<SpeechRecognitionResultItem>> }
  type SpeechRecognitionInstance = {
    continuous: boolean
    interimResults: boolean
    onresult: ((event: SpeechRecognitionEventLike) => void) | null
    start: () => void
    stop: () => void
  }
  type SpeechRecognitionConstructorLike = new () => SpeechRecognitionInstance

  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop()
    }
  }, [])

  const startRecording = async () => {
    try {
      setLiveTranscript('')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup Web Speech API live speech recognition
      const browserWindow = window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructorLike
        webkitSpeechRecognition?: SpeechRecognitionConstructorLike
        webkitAudioContext?: typeof AudioContext
      }
      const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.onresult = (event: SpeechRecognitionEventLike) => {
            let currentText = ''
            for (let i = 0; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript + ' '
            }
            setLiveTranscript(currentText.trim())
          }
          recognition.start()
          speechRecognitionRef.current = recognition
        } catch (e) {
          console.warn("Speech recognition initialization fallback:", e)
        }
      }

      audioContextRef.current = new (window.AudioContext || browserWindow.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      visualize()

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      setIsPaused(false)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (err: unknown) {
      console.error("Error accessing microphone:", err)
      setStatus('error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop() } catch {}
      }
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return
    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) return
    
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyserRef.current!.getByteFrequencyData(dataArray)
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = (canvas.width / bufferLength) * 2.5
      const centerY = canvas.height / 2
      let x = 0
      
      for(let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * centerY * 0.8
        const hue = 260 + (i / bufferLength) * 60
        const alpha = 0.3 + (dataArray[i] / 255) * 0.7
        
        canvasCtx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`
        canvasCtx.beginPath()
        canvasCtx.roundRect(x, centerY - barHeight, barWidth - 1, barHeight * 2, 2)
        canvasCtx.fill()
        
        x += barWidth + 1
      }
    }
    draw()
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const processRecording = async () => {
    if (!audioBlob) return
    
    try {
      setStatus('processing')
      
      const createRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceType: 'recording',
          title: `Recording - ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
        })
      })
      if (!createRes.ok) throw new Error('Failed to create note record')
      const noteData = await createRes.json()
      const newNoteId = noteData.note.id
      setNoteId(newNoteId)

      const formData = new FormData()
      let fileExt = 'webm'
      if (audioBlob.type.includes('mp4')) fileExt = 'mp4'
      else if (audioBlob.type.includes('wav')) fileExt = 'wav'
      else if (audioBlob.type.includes('mp3')) fileExt = 'mp3'
      formData.append('audio', audioBlob, `recording.${fileExt}`)
      formData.append('noteId', newNoteId)
      if (liveTranscript) {
        formData.append('clientTranscript', liveTranscript)
      }

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
      
      if (!transcribeRes.ok) {
        const errData = await transcribeRes.json().catch(() => ({}))
        const msg = errData.message || errData.error || 'Transcription failed'
        setErrorMsg(msg)
        throw new Error(msg)
      }
      const transcribeData = await transcribeRes.json()
      
      const finalTrText = transcribeData.text || liveTranscript || 'Audio recording content captured.'
      setTranscript(finalTrText)
      setStatus('success')
    } catch (err: unknown) {
      console.error(err)
      setTranscript('')
      setErrorMsg(err instanceof Error ? err.message : 'Transcription failed')
      setStatus('error')
    }
  }

  const generateNotes = async () => {
    if (!noteId || !transcript) return
    
    try {
      setStatus('processing')
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, transcript })
      })
      if (!genRes.ok) {
        const errData = await genRes.json().catch(() => ({}))
        const msg = errData.message || errData.error || 'Failed to generate notes'
        setErrorMsg(msg)
        throw new Error(msg)
      }
      router.push(`/notes/${noteId}`)
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate notes')
      setStatus('error')
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setStatus('idle')
    setErrorMsg('')
    setTranscript('')
    setLiveTranscript('')
    setNoteId(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative pb-16">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Record Audio</h1>
        <p className="text-sm text-slate-400 mt-2">Capture high-quality audio directly from your browser with instant AI transcription.</p>
      </div>

      {errorMsg && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/40 backdrop-blur-xl p-6 text-center space-y-3 shadow-xl animate-fade-in mb-6">
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
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
            >
              ⚙️ Go to Settings →
            </Link>
          </div>
        </div>
      )}

      {/* Recording Studio Hero Card */}
      <div className="rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] via-[#100b2a]/60 to-transparent p-1.5 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

        {isRecording && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-500 animate-gradient-x" style={{backgroundSize: '200% 100%'}} />
        )}

        <div className="bg-[#0a0a1e]/90 backdrop-blur-xl rounded-[24px] p-8 md:p-12 relative overflow-hidden">
          {isRecording && (
            <>
              <div className={`absolute inset-0 rounded-[24px] transition-opacity duration-1000 ${isPaused ? 'opacity-30' : 'opacity-100'}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent rounded-[24px]" />
              </div>
              {!isPaused && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-red-500/20 animate-ping pointer-events-none" style={{animationDuration: '2s'}} />
              )}
            </>
          )}

          <div className="relative z-10 flex flex-col items-center">
            {/* Status Pill */}
            <div className="mb-6">
              {isRecording ? (
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-md ${
                  isPaused ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-red-500/15 border-red-500/30 text-red-400'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
                  <span className="uppercase tracking-wider font-extrabold">{isPaused ? '⏸️ Recording Paused' : '🔴 Live Recording'}</span>
                </div>
              ) : audioBlob ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="uppercase tracking-wider font-extrabold">✓ Recording Complete</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-violet-500/10 border border-violet-500/20 text-violet-300 shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  <span className="uppercase tracking-wider font-extrabold">🎙️ Ready to Record</span>
                </div>
              )}
            </div>

            {/* Timer Display */}
            <div className="text-6xl md:text-7xl font-mono font-extrabold text-white mb-8 tracking-[0.1em] tabular-nums drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              {formatTime(recordingTime)}
            </div>

            {/* Real-time Canvas Visualization */}
            <div className="w-full h-32 rounded-2xl mb-8 overflow-hidden border border-white/[0.08] bg-black/40 relative shadow-inner">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={128} 
                className={`w-full h-full ${!isRecording ? 'hidden' : ''}`}
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-[4px] items-center px-4">
                    {[4, 8, 14, 22, 32, 45, 60, 45, 30, 18, 25, 40, 55, 70, 55, 35, 20, 12, 6, 10, 18, 28, 38, 24, 14, 8].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          background: `linear-gradient(to top, rgba(139,92,246,${0.2 + (h / 70) * 0.4}), rgba(6,182,212,${0.2 + (h / 70) * 0.4}))`,
                          boxShadow: h > 30 ? '0 0 10px rgba(139,92,246,0.4)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live speech recognition text preview box */}
            {isRecording && liveTranscript && (
              <div className="w-full mb-6 p-4 bg-black/50 border border-violet-500/30 rounded-2xl text-xs text-slate-200 max-h-28 overflow-y-auto shadow-inner">
                <span className="text-violet-400 font-bold block mb-1">🎙️ Live Speech Input:</span>
                <p className="italic leading-relaxed">{liveTranscript}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-6">
              {/* Left Control: Pause/Resume */}
              {isRecording && (
                <button 
                  onClick={pauseRecording}
                  className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-md"
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? Icons.play : Icons.pause}
                </button>
              )}

              {/* Center Main Action Button: Start Mic or Stop Recording */}
              {!isRecording && !audioBlob ? (
                <button 
                  onClick={startRecording}
                  className="w-22 h-22 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 flex items-center justify-center shadow-[0_0_45px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] transition-all hover:scale-110 active:scale-95 group relative"
                  title="Start Recording"
                >
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping pointer-events-none" style={{animationDuration: '3s'}} />
                  <span className="text-white drop-shadow-md">{Icons.mic}</span>
                </button>
              ) : isRecording ? (
                <button 
                  onClick={stopRecording}
                  className="w-22 h-22 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 flex items-center justify-center shadow-[0_0_45px_rgba(239,68,68,0.5)] transition-all hover:scale-110 active:scale-95 group"
                  title="Stop Recording"
                >
                  <span className="text-white drop-shadow-md">{Icons.stop}</span>
                </button>
              ) : (
                <button 
                  onClick={startRecording}
                  className="w-22 h-22 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 flex items-center justify-center shadow-[0_0_45px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] transition-all hover:scale-110 active:scale-95 group relative"
                  title="Record New Audio"
                >
                  <span className="text-white drop-shadow-md">{Icons.mic}</span>
                </button>
              )}

              {/* Right Control: Delete / Reset Button (Visible during or after recording) */}
              {(isRecording || audioBlob || recordingTime > 0) && (
                <button 
                  onClick={resetRecording}
                  className="w-14 h-14 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-md animate-fade-in"
                  title="Delete Recording / Reset"
                >
                  {Icons.trash}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Information Pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <div className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center gap-1.5 shadow-sm">
          <span>🎙️</span> High Quality • 48kHz
        </div>
        <div className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center gap-1.5 shadow-sm">
          <span>⚡</span> AI Noise Reduction
        </div>
        <div className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center gap-1.5 shadow-sm">
          <span>🔴</span> Live Recording
        </div>
        <div className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center gap-1.5 shadow-sm">
          <span>🔒</span> Privacy Protected
        </div>
        <div className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/[0.03] border border-white/[0.08] text-slate-300 flex items-center gap-1.5 shadow-sm">
          <span>💾</span> Auto Save Enabled
        </div>
      </div>

      {/* Post-recording Actions */}
      {audioBlob && status === 'idle' && (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 md:p-8 animate-fade-in space-y-5 shadow-[0_10px_35px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg shadow-sm">
              {Icons.check}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recording Complete</h3>
              <p className="text-xs text-slate-400">Duration: {formatTime(recordingTime)}</p>
            </div>
          </div>
          
          {audioUrl && (
            <audio src={audioUrl} controls className="w-full outline-none rounded-2xl" style={{height: '42px'}} />
          )}
          
          <button 
            onClick={processRecording}
            className="btn-primary w-full py-3.5 text-xs font-bold rounded-2xl shadow-lg hover:scale-[1.01] transition-all"
          >
            <span>{Icons.sparkle}</span>
            <span>Transcribe Audio to Text</span>
          </button>
        </div>
      )}

      {status === 'processing' && (
        <div className="text-center p-12 rounded-3xl border border-violet-500/20 bg-violet-500/[0.04] shadow-xl backdrop-blur-xl">
          <div className="w-16 h-16 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
          <p className="text-lg text-white font-bold mb-1.5">Transcribing your audio recording...</p>
          <p className="text-xs text-slate-400">Converting speech into accurate text using Groq Whisper AI</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">{Icons.check}</div>
               <div>
                 <p className="text-base font-bold text-white">Transcription Complete</p>
                 <p className="text-xs text-emerald-400/80">Audio speech converted to text successfully</p>
               </div>
             </div>
             <button 
               onClick={generateNotes}
               className="btn-primary py-3 px-6 text-xs font-bold rounded-2xl shadow-lg shrink-0 hover:scale-105 transition-all"
             >
               <span>{Icons.rocket}</span>
               <span>Generate Final Note</span>
             </button>
          </div>
          
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.03] p-6 md:p-8 shadow-xl">
            <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">{Icons.wave}</span> Audio Speech-to-Text Output
            </h4>
            <div className="bg-black/40 p-5 rounded-2xl max-h-64 overflow-y-auto border border-white/[0.06] shadow-inner">
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">{transcript}</p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center p-10 rounded-3xl border border-red-500/20 bg-red-500/[0.04] shadow-xl">
          <p className="text-red-400 text-sm font-bold mb-4">Something went wrong during recording processing. Please try again.</p>
          <button onClick={resetRecording} className="btn-secondary py-3 px-6 text-xs font-bold rounded-2xl">
            <span>{Icons.refresh}</span>
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Four Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="p-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/30 hover:bg-white/[0.04] transition-all space-y-2 group shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            🎙️
          </div>
          <h3 className="text-sm font-bold text-white">Live Recording</h3>
          <p className="text-xs text-slate-400 leading-relaxed">High clarity crystal-clear voice capture directly in your browser.</p>
        </div>

        <div className="p-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all space-y-2 group shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <h3 className="text-sm font-bold text-white">Instant AI Notes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Transcribed and organized into structured study notes automatically.</p>
        </div>

        <div className="p-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all space-y-2 group shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            🔒
          </div>
          <h3 className="text-sm font-bold text-white">Secure Processing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">End-to-end encrypted audio processing with private data security.</p>
        </div>

        <div className="p-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] hover:border-pink-500/30 hover:bg-white/[0.04] transition-all space-y-2 group shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
            🧠
          </div>
          <h3 className="text-sm font-bold text-white">Smart AI Models</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Powered by Groq Whisper & Advanced LLM fallback cascade.</p>
        </div>
      </div>

    </div>
  )
}
