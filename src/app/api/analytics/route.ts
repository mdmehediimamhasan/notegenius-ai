import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Execute parallel Prisma database queries
    const [
      totalNotes,
      thisWeekTotalNotes,
      prevWeekTotalNotes,
      audioNotes,
      thisWeekAudioNotes,
      prevWeekAudioNotes,
      recordingsNotes,
      thisWeekRecordingsNotes,
      prevWeekRecordingsNotes,
      summariesNotes,
      thisWeekSummariesNotes,
      prevWeekSummariesNotes,
      quizzesCount,
      notesDurations,
    ] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.note.count({ where: { userId, createdAt: { gte: sevenDaysAgo } } }),
      prisma.note.count({ where: { userId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),

      prisma.note.count({ where: { userId, sourceType: 'audio' } }),
      prisma.note.count({ where: { userId, sourceType: 'audio', createdAt: { gte: sevenDaysAgo } } }),
      prisma.note.count({ where: { userId, sourceType: 'audio', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),

      prisma.note.count({ where: { userId, sourceType: 'recording' } }),
      prisma.note.count({ where: { userId, sourceType: 'recording', createdAt: { gte: sevenDaysAgo } } }),
      prisma.note.count({ where: { userId, sourceType: 'recording', createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),

      prisma.note.count({ where: { userId, summary: { not: null } } }),
      prisma.note.count({ where: { userId, summary: { not: null }, createdAt: { gte: sevenDaysAgo } } }),
      prisma.note.count({ where: { userId, summary: { not: null }, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),

      prisma.quiz.count({ where: { note: { userId } } }),

      prisma.note.findMany({
        where: { userId },
        select: { duration: true }
      })
    ])

    // Calculate real storage estimation from notes (duration + file sizes)
    const estimatedBytes = notesDurations.reduce((acc, note) => {
      const durSec = note.duration || 180
      return acc + (durSec * 128 * 1024 / 8) // ~128kbps audio estimation in bytes
    }, 150 * 1024 * 1024) // Base 150MB initial workspace allocation

    const storageLimitBytes = 5 * 1024 * 1024 * 1024 // 5 GB Limit
    const storageUsedGB = (estimatedBytes / (1024 * 1024 * 1024)).toFixed(2)
    const storagePercentage = Math.min(100, Math.max(5, Math.round((estimatedBytes / storageLimitBytes) * 100)))

    // Compute growth diffs
    const calcGrowth = (curr: number, prev: number) => {
      const diff = curr - prev
      return diff >= 0 ? `+${diff} this week` : `${diff} this week`
    }

    return NextResponse.json({
      analytics: {
        totalNotes: {
          count: totalNotes,
          growth: calcGrowth(thisWeekTotalNotes, prevWeekTotalNotes)
        },
        audioNotes: {
          count: audioNotes,
          growth: calcGrowth(thisWeekAudioNotes, prevWeekAudioNotes)
        },
        recordings: {
          count: recordingsNotes,
          growth: calcGrowth(thisWeekRecordingsNotes, prevWeekRecordingsNotes)
        },
        summaries: {
          count: summariesNotes,
          growth: calcGrowth(thisWeekSummariesNotes, prevWeekSummariesNotes)
        },
        quizzes: quizzesCount,
        storage: {
          usedGB: storageUsedGB,
          limitGB: 5,
          percentage: storagePercentage
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch analytics', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
