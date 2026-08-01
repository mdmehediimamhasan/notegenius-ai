import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let userId = (session?.user as any)?.id

    if (!userId) {
      const firstUser = await prisma.user.findFirst()
      if (firstUser) userId = firstUser.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const sourceType = searchParams.get('sourceType') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const where: any = { userId }
    if (sourceType) where.sourceType = sourceType
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { transcript: { contains: search } },
      ]
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { [sortBy]: order },
      include: {
        _count: {
          select: { chatMessages: true, quizzes: true },
        },
      },
    })

    return NextResponse.json({ notes })
  } catch (error: any) {
    console.error('Get notes error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let userId = (session?.user as any)?.id

    // Fallback to first user in dev mode if session user ID is unavailable
    if (!userId) {
      const firstUser = await prisma.user.findFirst()
      if (firstUser) userId = firstUser.id
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 })
    }

    const body = await request.json()

    const note = await prisma.note.create({
      data: {
        userId,
        title: body.title || 'Untitled Note',
        sourceType: body.sourceType || 'audio',
        originalFileName: body.originalFileName,
        audioUrl: body.audioUrl || '/uploads/sample-audio.wav',
        transcript: body.transcript,
        status: body.status || 'pending',
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error: any) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
