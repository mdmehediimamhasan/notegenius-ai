'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jsPDF } from 'jspdf'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import CollapsibleSection from '@/components/CollapsibleSection'

interface GeneratedNotes {
  summary?: string
  keyPoints?: string[]
  detailedNotes?: { heading: string; content: string }[]
  actionItems?: string[]
  decisionsMade?: string[]
  glossary?: { term: string; definition: string }[]
}

interface MCQQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Flashcard {
  front: string
  back: string
}

function cleanText(str: string): string {
  if (!str) return ''
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function getCorrectIndex(q: MCQQuestion): number {
  let correct = q.correctAnswer as any
  if (typeof correct === 'number') return correct
  if (typeof correct === 'string') {
    const trimmed = correct.trim()
    // 1. Try A/B/C/D
    const upper = trimmed.toUpperCase()
    if (upper === 'A' || upper.startsWith('A.') || upper.startsWith('A)')) return 0
    if (upper === 'B' || upper.startsWith('B.') || upper.startsWith('B)')) return 1
    if (upper === 'C' || upper.startsWith('C.') || upper.startsWith('C)')) return 2
    if (upper === 'D' || upper.startsWith('D.') || upper.startsWith('D)')) return 3
    // 2. Try exact text match (case insensitive)
    const textMatch = q.options.findIndex(opt => opt.trim().toLowerCase() === trimmed.toLowerCase())
    if (textMatch !== -1) return textMatch
    // 3. Try parsing as integer
    const parsed = parseInt(trimmed, 10)
    if (!isNaN(parsed) && parsed >= 0 && parsed < q.options.length) return parsed
  }
  return -1
}

/* SVG Icons */
const Icons = {
  play: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  download: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  waveform: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h2l3-9 4 18 4-12 3 6h4"/></svg>,
  sparkles: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  paperclip: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  smile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  more: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  bot: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/></svg>,
  pdf: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  markdown: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15V9l3 3 3-3v6"/><path d="M17 15v-6l-2 2"/></svg>,
  quiz: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  fileText: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
}

export default function SingleNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.isAdmin === true
  const chatEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  // View mode: 'note' | 'quiz'
  const [viewMode, setViewMode] = useState<'note' | 'quiz'>('note')

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Quiz State
  const [quizMode, setQuizMode] = useState<'selection' | 'mcq' | 'flashcard'>('selection')
  const [quizLoading, setQuizLoading] = useState(false)
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [mcqScore, setMcqScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
  const [quizEndTime, setQuizEndTime] = useState<number | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)

  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchNote()
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  async function fetchNote() {
    try {
      const res = await fetch(`/api/notes/${id}`)
      if (!res.ok) throw new Error('Note not found')
      const data = await res.json()
      setNote(data.note)
      if (data.note.duration) setDuration(data.note.duration)
      if (data.note.chatMessages) {
        setChatMessages(data.note.chatMessages.map((m: any) => ({ role: m.role, content: cleanText(m.content) })))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Play/Pause original audio file
  const togglePlayAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.error('Original audio playback error:', err)
        setIsPlaying(false)
      })
    }
  }

  const togglePlaybackRate = () => {
    const newRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1
    setPlaybackRate(newRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration)
      }
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // For backward compatibility: check if generatedNotes is JSON or Markdown
  const isMarkdownNote = typeof note?.generatedNotes === 'string' && !note.generatedNotes.trim().startsWith('{')
  
  const parsedNotes: GeneratedNotes | null = note?.generatedNotes && !isMarkdownNote
    ? (typeof note.generatedNotes === 'string' ? JSON.parse(note.generatedNotes) : note.generatedNotes)
    : null

  async function handleGenerateNotes() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: id, transcript: note.transcript }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate notes')
      }
      await fetchNote()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function sendChatMessage(e?: React.FormEvent, customMsg?: string) {
    if (e) e.preventDefault()
    const msgToSend = customMsg || chatInput
    if (!msgToSend.trim() || chatLoading) return

    const userMsg = cleanText(msgToSend.trim())
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    if (!customMsg) setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: id, message: userMsg }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Chat failed')
      setChatMessages((prev) => [...prev, { role: 'assistant', content: cleanText(data.message.content) }])
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setChatLoading(false)
    }
  }

  async function handleGenerateQuiz(type: 'mcq' | 'flashcard') {
    setQuizLoading(true)
    setQuizMode(type)
    setViewMode('quiz')
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: id, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Quiz generation failed')

      if (type === 'mcq') {
        setMcqQuestions(data.quiz.questions)
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setMcqScore(0)
        setQuizComplete(false)
        setUserAnswers(new Array(data.quiz.questions.length).fill(null))
        setQuizStartTime(Date.now())
        setIsReviewing(false)
      } else {
        setFlashcards(data.quiz.questions)
        setCurrentCardIndex(0)
      }
    } catch (err: any) {
      setError(err.message)
      setQuizMode('selection')
    } finally {
      setQuizLoading(false)
    }
  }

  function handleExportPDF() {
    if (!parsedNotes) return
    const doc = new jsPDF()
    let y = 20

    doc.setFontSize(20)
    doc.text(cleanText(note.title || 'Notes'), 20, y)
    y += 15

    if (parsedNotes.summary) {
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text('Summary', 20, y)
      y += 8
      doc.setTextColor(0)
      doc.setFontSize(10)
      const summaryLines = doc.splitTextToSize(cleanText(parsedNotes.summary), 170)
      doc.text(summaryLines, 20, y)
      y += summaryLines.length * 5 + 10
    }

    if (parsedNotes.keyPoints) {
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text('Key Points', 20, y)
      y += 8
      doc.setTextColor(0)
      doc.setFontSize(10)
      parsedNotes.keyPoints.forEach((point) => {
        if (y > 270) { doc.addPage(); y = 20 }
        const lines = doc.splitTextToSize(`• ${cleanText(point)}`, 170)
        doc.text(lines, 20, y)
        y += lines.length * 5 + 3
      })
      y += 5
    }

    doc.save(`${cleanText(note.title || 'notes')}.pdf`)
  }

  function handleExportMD() {
    if (!parsedNotes) return
    let md = `# ${cleanText(note.title || 'Notes')}\n\n`
    
    if (isMarkdownNote) {
      md += note.generatedNotes
    } else if (parsedNotes) {
      if (parsedNotes.summary) {
        md += `## Summary\n${cleanText(parsedNotes.summary)}\n\n`
      }
      if (parsedNotes.keyPoints) {
        md += `## Key Points\n${parsedNotes.keyPoints.map((p) => `- ${cleanText(p)}`).join('\n')}\n\n`
      }
      if (parsedNotes.actionItems && parsedNotes.actionItems.length > 0) {
        md += `## Action Items\n${parsedNotes.actionItems.map((a) => `- [ ] ${cleanText(a)}`).join('\n')}\n\n`
      }
    }

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cleanText(note.title || 'notes')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }
  const renderFinalNote = () => (
    <div className="w-full">
      {/* 3. FINAL CLEAN WELL-STRUCTURED NOTE SECTION (Generated ONLY from transcribed text) */}
      <CollapsibleSection
        title="Final Structured Note"
        icon={Icons.fileText}
        defaultExpanded={true}
        badge="AI Generated"
        className="shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
      >
        <div className="pt-2">
          {(parsedNotes || isMarkdownNote) ? (
            <div className="space-y-4">
              {isMarkdownNote ? (
                <div className="bg-white/[0.01] p-2 sm:p-4 rounded-2xl">
                  <MarkdownRenderer content={note.generatedNotes} />
                </div>
              ) : (
                <div className="space-y-8 mt-2">
                  {/* Overview Paragraph */}
                  {parsedNotes?.summary && (
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-white tracking-tight">Overview</h2>
                      <div className="text-[15px] text-slate-300 leading-relaxed font-light bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04]">
                        {cleanText(parsedNotes.summary)}
                      </div>
                    </div>
                  )}

                  {/* Key Takeaways & Points */}
                  {parsedNotes?.keyPoints && parsedNotes.keyPoints.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-white tracking-tight">Key Discussion Points</h2>
                      <ul className="space-y-3">
                        {parsedNotes.keyPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-3 text-[15px] text-slate-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                            <span>{cleanText(point)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detailed Headings & Paragraphs */}
                  {parsedNotes?.detailedNotes && parsedNotes.detailedNotes.length > 0 && (
                    <div className="space-y-6 pt-2">
                      {parsedNotes.detailedNotes.map((sec, i) => (
                        <div key={i} className="space-y-2.5">
                          <h2 className="text-xl font-bold text-white tracking-tight">{cleanText(sec.heading)}</h2>
                          <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-wrap">{cleanText(sec.content)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Items if applicable */}
                  {parsedNotes?.actionItems && parsedNotes.actionItems.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">Action Items</h2>
                      <ul className="space-y-3">
                        {parsedNotes.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-[15px] text-slate-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                            <span>{cleanText(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Decisions Made if applicable */}
                  {parsedNotes?.decisionsMade && parsedNotes.decisionsMade.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">Decisions Made</h2>
                      <ul className="space-y-3">
                        {parsedNotes.decisionsMade.map((decision, i) => (
                          <li key={i} className="flex items-start gap-3 text-[15px] text-slate-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                            <span>{cleanText(decision)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-white/[0.08] rounded-2xl p-8 mt-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-3">
                {Icons.sparkles}
              </div>
              <h3 className="text-base font-bold text-white mb-1">Generate Clean Note</h3>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                Click below to generate a clean, structured note from the transcribed text.
              </p>
              <button 
                onClick={handleGenerateNotes} 
                disabled={generating} 
                className="btn-primary py-2.5 px-6 text-sm disabled:opacity-50"
              >
                <span>{generating ? 'Generating Note...' : '✨ Generate Note'}</span>
              </button>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  )

  const renderTranscript = () => (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. AUDIO PLAYER TOP CARD */}
            <div className="note-audio-card rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1a123a] via-[#100b2a] to-[#0d091e] backdrop-blur-2xl p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Card Header Row */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2 py-1 -ml-2 rounded-lg transition-colors">
                  <span className="text-base font-semibold text-white tracking-tight">{cleanText(note.title)}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={audioUrlToPlay} 
                    download 
                    className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-sm"
                    title="Download Original Audio"
                  >
                    {Icons.download}
                  </a>
                  
                  <button className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  </button>

                  <button 
                    onClick={togglePlaybackRate}
                    className="w-10 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors font-medium text-[11px] shadow-sm"
                    title="Playback Speed"
                  >
                    {playbackRate}x
                  </button>

                  <button 
                    onClick={handleGenerateNotes}
                    disabled={generating}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-cyan-950 font-bold text-[13px] shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 disabled:opacity-50 ml-1"
                  >
                    <span>{generating ? 'Generating Note...' : 'Regenerate Note'}</span>
                  </button>
                </div>
              </div>

              {/* Hidden Audio Element for Playback */}
              <audio
                ref={audioRef}
                src={audioUrlToPlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
                onLoadedMetadata={(e) => {
                  const audioDur = e.currentTarget.duration
                  if (audioDur && !isNaN(audioDur) && audioDur > 0) {
                    setDuration(audioDur)
                    if (!note?.duration || note.duration === 0) {
                      fetch(`/api/notes/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ duration: audioDur }),
                      }).catch(() => {})
                    }
                  }
                }}
                className="hidden"
              />

              {/* Waveform Player Section */}
              <div className="relative z-10 w-full mb-6">
                {/* Interactive Waveform Seeking Bar */}
                <div 
                  className="w-full flex items-center justify-center gap-[3px] h-24 sm:h-32 px-1 cursor-pointer group"
                  onClick={(e) => {
                    if (!audioRef.current || !duration) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const newTime = (clickX / rect.width) * duration
                    audioRef.current.currentTime = newTime
                    setCurrentTime(newTime)
                  }}
                >
                  {[
                    12, 18, 28, 45, 30, 15, 25, 40, 60, 75, 90, 65, 50, 80, 95, 70, 40, 30, 55, 85, 100, 75, 50, 35, 60, 80, 45, 25, 15, 30, 50, 70, 40, 20, 10, 25, 45, 65, 30, 15, 8,
                    20, 35, 55, 75, 90, 60, 40, 25, 10, 30, 50, 80, 95, 70, 45, 20, 15, 35, 55, 85, 100, 75, 60, 40, 25, 15, 30, 50, 70, 85, 65, 45, 25, 15, 30, 50, 70, 85, 65, 45
                  ].map((h, i, arr) => {
                    const barRatio = i / arr.length
                    const isPlayed = barRatio <= progressRatio
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${
                          isPlayed 
                            ? 'bg-gradient-to-t from-blue-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(99,102,241,0.6)]' 
                            : 'bg-white/10 group-hover:bg-white/20'
                        }`}
                        style={{ height: `${Math.max(10, h)}%` }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Bottom Controls Row */}
              <div className="flex justify-between items-center relative z-10 px-1">
                <span className="text-[13px] font-mono text-slate-400 font-medium">{formatTime(currentTime)}</span>
                
                <div className="flex items-center gap-6">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
                  </button>
                  <button 
                    onClick={togglePlayAudio}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </button>
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                  </button>
                </div>

                <span className="text-[13px] font-mono text-slate-400 font-medium">{formatTime(duration)}</span>
              </div>
            </div>

            {/* 2. TRANSCRIBED TEXT ACCORDION SECTION */}
            <CollapsibleSection
              title="Transcribed Text (Speech-to-Text)"
              icon={Icons.waveform}
              defaultExpanded={false}
            >
              <div className="flex justify-end mb-3">
                <button 
                  onClick={() => navigator.clipboard.writeText(cleanText(note.transcript || ''))}
                  className="px-3 py-1 text-xs bg-white/[0.06] hover:bg-white/10 text-slate-300 rounded-lg transition-all border border-white/[0.08] flex items-center gap-1.5"
                >
                  📋 Copy Transcribed Text
                </button>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.06] max-h-72 overflow-y-auto leading-relaxed text-xs text-slate-300 whitespace-pre-wrap font-sans">
                {cleanText(note.transcript || 'No transcribed speech text available.')}
              </div>
            </CollapsibleSection>
    </div>
  )

  const renderChatAssistant = () => (
    <div className="h-full flex flex-col relative sticky top-6">
      <div className="ai-chat-panel w-full h-full flex flex-col bg-gradient-to-b from-[#1a123a] via-[#100b2a] to-[#0d091e] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="ai-chat-header flex justify-between items-center px-6 py-5 border-b border-white/[0.08] relative z-10">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            AI Chat Assistant
          </h2>
          <button className="text-slate-400 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10 pt-2">
          
          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto space-y-4 px-5 scroll-smooth custom-scrollbar">
            {chatMessages.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  {Icons.sparkles}
                </div>
                <p className="font-bold text-slate-300 text-sm">Ask anything about this recording</p>
                <p className="text-xs mt-1 text-slate-400">Get instant summary, action items or key insights</p>
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-[11px] shrink-0 mt-1 shadow-sm">
                    {Icons.bot}
                  </div>
                )}
                
                <div
                  className={`ai-chat-msg-${msg.role} max-w-[85%] p-4 leading-relaxed text-[13px] ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)] rounded-[20px] rounded-tr-[4px]'
                      : 'bg-white/[0.04] text-slate-300 border border-white/[0.06] rounded-[20px] rounded-tl-[4px] shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    cleanText(msg.content)
                  ) : (
                    <MarkdownRenderer content={msg.content} compact={true} />
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-[11px] shrink-0 mt-1 shadow-sm">
                  {Icons.bot}
                </div>
                <div className="p-4 rounded-[20px] bg-white/[0.04] border border-white/[0.06] rounded-tl-[4px] shadow-sm">
                  <div className="flex gap-1.5 px-1 py-0.5">
                    <span className="w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          <div className="px-5 pt-3 pb-2 space-y-1.5">
            {['What was the main topic?', 'Summarize', 'List the action items.', 'Quiz me', 'Explain simply'].map((promptText, i) => (
              <button
                key={i}
                onClick={() => sendChatMessage(undefined, promptText)}
                disabled={chatLoading}
                className="ai-chat-prompt-pill block w-full text-left px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl text-[12px] text-slate-400 hover:text-slate-200 transition-all font-medium disabled:opacity-50"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <div className="px-5 pb-5 pt-1">
            <form onSubmit={(e) => sendChatMessage(e)} className="relative group">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={chatLoading}
                className="ai-chat-input-bar w-full bg-white/[0.04] border border-white/[0.08] focus:border-violet-500/40 focus:bg-white/[0.06] rounded-2xl pl-12 pr-12 py-3.5 text-[13px] text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </div>
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="ai-chat-send-btn absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
              >
                {Icons.send}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse p-4">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="h-44 w-full bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-3xl" />
          <div className="h-96 bg-white/5 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (error && !note) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl text-center shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Failed to load note</h3>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!note) return null

  // Ensure progressRatio is safe
  const progressRatio = duration > 0 ? currentTime / duration : 0
  const audioUrlToPlay = note.audioUrl ? (note.audioUrl.startsWith('http') ? note.audioUrl : (note.audioUrl.startsWith('/') ? note.audioUrl : `/${note.audioUrl}`)) : ''

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <div className="flex items-center justify-between bg-gradient-to-r from-white/[0.01] to-white/[0.03] backdrop-blur-xl border border-white/[0.05] p-3.5 rounded-[20px] relative z-50 mb-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            ←
          </button>
          
          <div className="flex items-center p-1 bg-black/40 rounded-2xl border border-white/[0.05]">
            <button
              onClick={() => setViewMode('note')}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                viewMode === 'note' 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Note Details
            </button>
            <button
              onClick={() => {
                if (!quizComplete && mcqQuestions.length === 0 && flashcards.length === 0) {
                  handleGenerateQuiz('mcq')
                } else {
                  setViewMode('quiz')
                }
              }}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                viewMode === 'quiz' 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Interactive Quiz
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {viewMode === 'quiz' ? (
            <button 
              onClick={() => setViewMode('note')}
              className="px-4 py-2 text-xs bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all font-medium"
            >
              ← Back to Notes
            </button>
          ) : (
            <button 
              onClick={() => handleGenerateQuiz('mcq')}
              className="px-3 py-1.5 text-xs bg-cyan-500/12 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl transition-all font-medium flex items-center gap-1.5"
            >
              {Icons.quiz} Practice Quiz
            </button>
          )}

          {(parsedNotes || isMarkdownNote) && (
            <>
              <button 
                onClick={handleExportPDF} 
                className="px-3 py-1.5 text-xs bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all font-medium flex items-center gap-1.5"
              >
                {Icons.pdf} PDF
              </button>
              <button 
                onClick={handleExportMD} 
                className="px-3 py-1.5 text-xs bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all font-medium flex items-center gap-1.5"
              >
                {Icons.markdown} MD
              </button>
            </>
          )}
        </div>
      </div>

      {/* Model Origin Badges — Admin only */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2.5 px-1 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-violet-500/15 text-violet-300 border border-violet-500/25 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            🎙️ Transcribed by: {note.transcribedBy || 'Groq (Whisper Large v3)'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            ✨ Generated by: {note.generatedBy || 'Mistral AI (Mistral Large)'}
          </span>
        </div>
      )}

      {/* VIEW MODE: QUIZ */}
      {viewMode === 'quiz' && (
        <div className="rounded-3xl border border-white/[0.06] bg-[#0a0a1e]/80 backdrop-blur-xl p-8 animate-fade-in">
          {quizLoading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-violet-300 text-sm font-medium animate-pulse">Generating interactive quiz...</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {quizComplete ? (
                isReviewing ? (
                  <div className="space-y-8 animate-fade-in text-left">
                    <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-cyan-400">{Icons.quiz}</span> Review Answers
                      </h3>
                      <button 
                        onClick={() => setIsReviewing(false)} 
                        className="btn-secondary py-1.5 px-4 text-xs"
                      >
                        Back to Results
                      </button>
                    </div>

                    <div className="space-y-10">
                      {mcqQuestions.map((q, qIndex) => {
                        const correctIdx = getCorrectIndex(q)

                        const userAns = userAnswers[qIndex]
                        
                        return (
                          <div key={qIndex} className="space-y-3">
                            <h4 className="text-sm font-semibold text-white">
                              <span className="text-slate-500 mr-2">{qIndex + 1}.</span> 
                              {cleanText(q.question)}
                            </h4>
                            <div className="space-y-2 pl-6">
                              {q.options.map((opt, i) => {
                                const isCorrect = i === correctIdx
                                const isUserChoice = userAns === i
                                
                                let cardStyle = "bg-white/[0.01] border-white/[0.03] opacity-60"
                                if (isCorrect) {
                                  cardStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-100 opacity-100"
                                } else if (isUserChoice) {
                                  cardStyle = "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-100 opacity-100"
                                }

                                return (
                                  <div key={i} className={`w-full text-left p-3 rounded-xl border text-sm font-medium flex items-center justify-between ${cardStyle}`}>
                                    <span>{['A', 'B', 'C', 'D'][i]}. {cleanText(opt)}</span>
                                    {isCorrect && <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">Right Answer ✓</span>}
                                    {isUserChoice && !isCorrect && <span className="text-red-600 dark:text-red-400 text-xs font-bold">Wrong ✗</span>}
                                  </div>
                                )
                              })}
                            </div>
                            <p className="text-xs text-slate-400 italic pl-6 pt-2">{cleanText(q.explanation)}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-500/10 mb-6 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-violet-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h3>
                    
                    {(() => {
                      const percentage = Math.round((mcqScore / mcqQuestions.length) * 100)
                      const isPass = percentage >= 60
                      const timeTakenMs = quizEndTime && quizStartTime ? (quizEndTime - quizStartTime) : 0
                      const minutes = Math.floor(timeTakenMs / 60000)
                      const seconds = Math.floor((timeTakenMs % 60000) / 1000)
                      
                      return (
                        <>
                          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-8 ${isPass ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {isPass ? 'PASSED' : 'NEEDS REVIEW'} • {percentage}%
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-left">
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                              <p className="text-slate-500 text-xs mb-1 font-medium">Total</p>
                              <p className="text-white text-xl font-bold">{mcqQuestions.length}</p>
                            </div>
                            <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-4">
                              <p className="text-emerald-500/70 text-xs mb-1 font-medium">Correct</p>
                              <p className="text-emerald-400 text-xl font-bold">{mcqScore}</p>
                            </div>
                            <div className="bg-red-500/[0.02] border border-red-500/10 rounded-2xl p-4">
                              <p className="text-red-500/70 text-xs mb-1 font-medium">Wrong</p>
                              <p className="text-red-400 text-xl font-bold">{mcqQuestions.length - mcqScore}</p>
                            </div>
                            <div className="bg-cyan-500/[0.02] border border-cyan-500/10 rounded-2xl p-4">
                              <p className="text-cyan-500/70 text-xs mb-1 font-medium">Time Taken</p>
                              <p className="text-cyan-400 text-xl font-bold">{minutes}m {seconds}s</p>
                            </div>
                          </div>
                        </>
                      )
                    })()}

                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => setIsReviewing(true)} 
                        className="btn-secondary py-2.5 px-6 text-sm flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        Review Answers
                      </button>
                      <button 
                        onClick={() => { 
                          setCurrentQuestionIndex(0); 
                          setSelectedAnswer(null); 
                          setMcqScore(0); 
                          setQuizComplete(false); 
                          setUserAnswers(new Array(mcqQuestions.length).fill(null));
                          setQuizStartTime(Date.now());
                        }} 
                        className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        Retry Quiz
                      </button>
                    </div>
                  </div>
                )
              ) : mcqQuestions.length > 0 ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">{Icons.quiz}</span>
                      Question {currentQuestionIndex + 1} <span className="text-slate-500 text-sm font-normal">of {mcqQuestions.length}</span>
                    </h3>
                    <div className="text-sm font-medium text-violet-300 bg-violet-500/10 px-3 py-1 rounded-lg">
                      Score: {mcqScore}
                    </div>
                  </div>

                  <p className="text-lg text-white leading-relaxed">
                    {cleanText(mcqQuestions[currentQuestionIndex].question)}
                  </p>

                  <div className="space-y-3">
                    {mcqQuestions[currentQuestionIndex].options.map((opt, i) => {
                      const correctIdx = getCorrectIndex(mcqQuestions[currentQuestionIndex])
                      
                      const isSelected = selectedAnswer === i
                      const isCorrect = i === correctIdx
                      
                      let cardStyle = "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-violet-500/30"
                      
                      if (selectedAnswer !== null) {
                        if (isCorrect) {
                          cardStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-100"
                        } else if (isSelected) {
                          cardStyle = "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-100"
                        } else {
                          cardStyle = "bg-white/[0.01] border-white/[0.03] opacity-50"
                        }
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (selectedAnswer !== null) return
                            setSelectedAnswer(i)
                            setUserAnswers(prev => {
                              const newArr = [...prev]
                              newArr[currentQuestionIndex] = i
                              return newArr
                            })
                            if (i === correctIdx) setMcqScore(prev => prev + 1)
                          }}
                          disabled={selectedAnswer !== null}
                          className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium flex items-center justify-between ${cardStyle}`}
                        >
                          <span>{['A', 'B', 'C', 'D'][i]}. {cleanText(opt)}</span>
                          {selectedAnswer !== null && isCorrect && <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">Right Answer ✓</span>}
                          {selectedAnswer !== null && isSelected && !isCorrect && <span className="text-red-600 dark:text-red-400 text-xs font-bold">Wrong ✗</span>}
                        </button>
                      )
                    })}
                  </div>

                  {selectedAnswer !== null && (
                    <div className="pt-4 border-t border-white/[0.06] flex justify-between items-center">
                      <p className="text-xs text-slate-400 italic max-w-md">{cleanText(mcqQuestions[currentQuestionIndex].explanation)}</p>
                      <button 
                        onClick={() => {
                          if (currentQuestionIndex < mcqQuestions.length - 1) {
                            setCurrentQuestionIndex(prev => prev + 1)
                            setSelectedAnswer(null)
                          } else {
                            setQuizEndTime(Date.now())
                            setQuizComplete(true)
                          }
                        }} 
                        className="btn-primary py-2 px-5 text-xs"
                      >
                        <span>{currentQuestionIndex < mcqQuestions.length - 1 ? 'Next Question →' : 'See Results'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE: MAIN NOTE & AI CHAT SIDE-BY-SIDE */}
      {viewMode === 'note' && (
        <div className="w-full animate-fade-in relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Player, Transcript, Note */}
            <div className="lg:col-span-8 space-y-6">
              {renderTranscript()}
              {renderFinalNote()}
            </div>
            
            {/* Right Column: AI Chat */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 lg:h-[calc(100vh-140px)] min-h-[600px] max-h-[900px]">
              {renderChatAssistant()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
