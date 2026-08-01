export interface GeneratedNotes {
  title: string
  summary: string
  keyPoints: string[]
  detailedNotes: {
    heading: string
    content: string
  }[]
  actionItems: string[]
  glossary: { term: string; definition: string }[]
}

export interface MCQQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface Flashcard {
  front: string
  back: string
}

export interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type NoteStatus = 'pending' | 'transcribing' | 'generating' | 'completed' | 'error'
export type SourceType = 'audio' | 'video' | 'recording'
export type QuizType = 'mcq' | 'flashcard'
