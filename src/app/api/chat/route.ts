import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { chatWithNotes } from '@/lib/gemini'

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

    const { noteId, message } = await request.json()

    if (!noteId || !message) {
      return NextResponse.json(
        { error: 'Note ID and message are required' },
        { status: 400 }
      )
    }

    // Get note
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId },
      include: { chatMessages: { orderBy: { createdAt: 'asc' }, take: 20 } },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const noteContent = note.generatedNotes || note.transcript || ''
    const chatHistory = note.chatMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // Save user message
    await prisma.chatMessage.create({
      data: { noteId, role: 'user', content: message },
    })

    // Generate AI response with Mistral (or Gemini/Groq fallback)
    const aiResponse = await chatWithNotes(
      geminiApiKey || 'dummy_key',
      noteContent,
      chatHistory,
      message,
      groqApiKey,
      mistralApiKey
    )

    // Save AI response
    const savedMessage = await prisma.chatMessage.create({
      data: { noteId, role: 'assistant', content: aiResponse },
    })

    return NextResponse.json({
      message: {
        id: savedMessage.id,
        role: 'assistant',
        content: aiResponse,
        createdAt: savedMessage.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Chat failed' },
      { status: 500 }
    )
  }
}
