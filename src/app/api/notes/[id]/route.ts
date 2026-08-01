import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as { id?: string }).id

    const note = await prisma.note.findFirst({
      where: { id, userId },
      include: {
        chatMessages: { orderBy: { createdAt: 'asc' } },
        quizzes: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Get note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as { id?: string }).id
    const body = await request.json()

    const existing = await prisma.note.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const note = await prisma.note.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Update note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as { id?: string }).id

    const existing = await prisma.note.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    if (existing.audioUrl && existing.audioUrl.startsWith('/uploads/')) {
      const relativePath = existing.audioUrl.replace(/^\//, '')
      const absolutePath = path.join(process.cwd(), 'public', relativePath)
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath)
      }
    }

    await prisma.note.delete({ where: { id } })

    return NextResponse.json({ message: 'Note deleted' })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
