import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        geminiApiKey: true,
        groqApiKey: true,
        mistralApiKey: true,
        openrouterApiKey: true,
      },
    })

    return NextResponse.json({
      user: {
        ...user,
        geminiApiKey: user?.geminiApiKey ? '••••••••' + user.geminiApiKey.slice(-4) : '',
        groqApiKey: user?.groqApiKey ? '••••••••' + user.groqApiKey.slice(-4) : '',
        mistralApiKey: user?.mistralApiKey ? '••••••••' + user.mistralApiKey.slice(-4) : '',
        openrouterApiKey: user?.openrouterApiKey ? '••••••••' + user.openrouterApiKey.slice(-4) : '',
        hasGeminiKey: !!user?.geminiApiKey,
        hasGroqKey: !!user?.groqApiKey,
        hasMistralKey: !!user?.mistralApiKey,
        hasOpenRouterKey: !!user?.openrouterApiKey,
      },
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.geminiApiKey !== undefined) updateData.geminiApiKey = body.geminiApiKey
    if (body.groqApiKey !== undefined) updateData.groqApiKey = body.groqApiKey
    if (body.mistralApiKey !== undefined) updateData.mistralApiKey = body.mistralApiKey
    if (body.openrouterApiKey !== undefined) updateData.openrouterApiKey = body.openrouterApiKey

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
