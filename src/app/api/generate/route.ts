import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateNotes } from '@/lib/gemini'

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

    const { noteId, transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    // Update status to generating
    let noteTitle: string | undefined = undefined
    if (noteId) {
      const existing = await prisma.note.findUnique({ where: { id: noteId } })
      noteTitle = existing?.title || existing?.originalFileName || undefined
      await prisma.note.update({
        where: { id: noteId },
        data: { status: 'generating' },
      })
    }

    const groqApiKey = user?.groqApiKey || process.env.GROQ_API_KEY
    const openrouterApiKey = user?.openrouterApiKey || process.env.OPENROUTER_API_KEY

    // Generate notes with Mistral (or Groq/OpenRouter/Gemini fallback)
    const notes = await generateNotes(
      geminiApiKey || 'dummy_key',
      transcript,
      groqApiKey,
      noteTitle,
      mistralApiKey,
      openrouterApiKey
    )

    // Update note with generated content
    if (noteId) {
      await prisma.note.update({
        where: { id: noteId },
        data: {
          title: notes.title || noteTitle || 'Audio Note',
          generatedNotes: notes.markdownContent, // Store raw Markdown string
          summary: '', // We can omit this or keep it blank for Markdown notes
          keyPoints: '[]',
          status: 'completed',
          generatedBy: notes.generatedBy || 'Mistral AI (Mistral Large)',
        },
      })
    }

    return NextResponse.json({ notes })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Note generation failed' },
      { status: 500 }
    )
  }
}
