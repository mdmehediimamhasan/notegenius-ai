import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateQuiz } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const geminiApiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY
    const mistralApiKey = user?.mistralApiKey || process.env.MISTRAL_API_KEY
    const groqApiKey = user?.groqApiKey || process.env.GROQ_API_KEY

    if (!geminiApiKey && !mistralApiKey && !groqApiKey) {
      return NextResponse.json(
        { error: 'Please configure at least one active API key in Settings' },
        { status: 400 }
      )
    }

    const { noteId, type = 'mcq' } = await request.json()

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Get note
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const noteContent = note.generatedNotes || note.transcript || ''

    // Generate quiz with Mistral (or Gemini/Groq fallback)
    const questions = await generateQuiz(
      geminiApiKey || 'dummy_key',
      noteContent,
      type,
      groqApiKey,
      mistralApiKey
    )

    // Save quiz
    const quiz = await prisma.quiz.create({
      data: {
        noteId,
        quizType: type,
        questions: JSON.stringify(questions),
        totalQ: questions.length,
      },
    })

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        quizType: type,
        questions,
        totalQ: questions.length,
      },
    })
  } catch (error: any) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Quiz generation failed' },
      { status: 500 }
    )
  }
}
