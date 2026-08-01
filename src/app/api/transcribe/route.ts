import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'
import { toFile } from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

type TranscriptionResult = {
  text: string
  language?: string
  duration?: number
  transcribedBy?: string
}

type GroqTranscriptionResult = {
  text?: string
  language?: string
  duration?: number
}

function getStandardMimeType(fileName: string, rawMime?: string): string {
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || ''
  if (ext === 'm4a' || ext === 'mp4' || rawMime?.includes('m4a') || rawMime?.includes('mp4')) return 'audio/mp4'
  if (ext === 'mp3' || rawMime?.includes('mpeg') || rawMime?.includes('mp3')) return 'audio/mp3'
  if (ext === 'wav' || rawMime?.includes('wav')) return 'audio/wav'
  if (ext === 'ogg' || rawMime?.includes('ogg')) return 'audio/ogg'
  if (ext === 'webm' || rawMime?.includes('webm')) return 'audio/webm'
  if (ext === 'aac' || rawMime?.includes('aac')) return 'audio/aac'
  if (ext === 'flac' || rawMime?.includes('flac')) return 'audio/flac'
  return rawMime || 'audio/mp3'
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim().length > 0) return error
  return fallback
}

function isSupportedTranscriptionFormat(fileName: string, rawMime?: string): boolean {
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || ''
  const mime = (rawMime || '').toLowerCase()
  return [
    ext === 'wav' || mime.includes('wav'),
    ext === 'mp3' || mime.includes('mpeg') || mime.includes('mp3'),
    ext === 'aac' || mime.includes('aac'),
    ext === 'ogg' || mime.includes('ogg'),
    ext === 'm4a' || ext === 'mp4' || mime.includes('m4a') || mime.includes('mp4'),
    ext === 'flac' || mime.includes('flac'),
    ext === 'amr' || mime.includes('amr'),
    ext === 'webm' || mime.includes('webm'),
  ].some(Boolean)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    const user = await prisma.user.findUnique({ where: { id: userId } })

    const groqApiKey = user?.groqApiKey || process.env.GROQ_API_KEY

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const noteId = formData.get('noteId') as string
    const clientTranscript = formData.get('clientTranscript') as string

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let transcription: TranscriptionResult | null = null
    const providerErrors: string[] = []

    const fileName = audioFile.name || 'audio.mp3'
    const standardMime = getStandardMimeType(fileName, audioFile.type)

    if (!isSupportedTranscriptionFormat(fileName, audioFile.type)) {
      return NextResponse.json(
        {
          error: 'Unsupported audio format. Please upload MP3, WAV, M4A, MP4, OGG, AAC, FLAC, or AMR. WebM recordings must be converted before transcription.',
        },
        { status: 400 }
      )
    }

    let savedAudioUrl: string | null = null
    if (noteId && buffer.length > 0) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        const originalExt = fileName.split('.').pop() || 'mp3'
        const ext = ['mp3', 'wav', 'm4a', 'ogg', 'webm', 'mp4'].includes(originalExt.toLowerCase()) ? originalExt.toLowerCase() : 'mp3'
        const savedFileName = `${noteId}.${ext}`
        const filePath = path.join(uploadDir, savedFileName)
        fs.writeFileSync(filePath, buffer)
        savedAudioUrl = `/api/audio/${savedFileName}`
      } catch (error: unknown) {
        console.warn('Failed to save audio file locally:', getErrorMessage(error, 'unknown file save error'))
      }
    }

    if (clientTranscript && clientTranscript.trim().length > 3) {
      transcription = {
        text: clientTranscript.trim(),
        language: 'auto',
        duration: 30,
      }
    }

    // Groq Whisper transcription (primary and only provider)
    if ((!transcription || !transcription.text) && groqApiKey) {
      const groqModels = ['whisper-large-v3-turbo', 'whisper-large-v3']
      for (const groqModel of groqModels) {
        if (transcription?.text) break
        try {
          const groq = new Groq({ apiKey: groqApiKey })
          let fileForGroq
          try {
            fileForGroq = await Groq.toFile(buffer, fileName, { type: standardMime })
          } catch {
            fileForGroq = await toFile(buffer, fileName, { type: standardMime })
          }
          const groqRes = (await groq.audio.transcriptions.create({
            file: fileForGroq,
            model: groqModel,
            response_format: 'json',
          })) as GroqTranscriptionResult

          if (groqRes.text && groqRes.text.trim().length > 0) {
            transcription = {
              text: groqRes.text.trim(),
              language: groqRes.language || 'auto',
              duration: groqRes.duration || 0,
              transcribedBy: `Groq (${groqModel})`,
            }
          }
        } catch (error: unknown) {
          const msg = getErrorMessage(error, 'unknown Groq error')
          console.warn(`Groq ${groqModel} transcription failed:`, msg)
          providerErrors.push(`Groq (${groqModel}): ${msg}`)
        }
      }
    } else if (!groqApiKey) {
      providerErrors.push('Groq: No API key configured. Add GROQ_API_KEY to your .env file.')
    }

    // Gemini Audio Transcription Fallback
    const geminiApiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY
    if ((!transcription || !transcription.text) && geminiApiKey) {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro']
      const genAI = new GoogleGenerativeAI(geminiApiKey)

      for (const geminiModelName of geminiModels) {
        if (transcription?.text) break
        try {
          const model = genAI.getGenerativeModel({ model: geminiModelName })
          const result = await model.generateContent([
            {
              inlineData: {
                data: buffer.toString('base64'),
                mimeType: standardMime,
              },
            },
            'Provide a complete, accurate, verbatim transcription of this audio content. Do not include introductory text, headers, or explanations. Output ONLY the transcribed text.',
          ])
          const responseText = result.response.text()
          if (responseText && responseText.trim().length > 0) {
            transcription = {
              text: responseText.trim(),
              language: 'auto',
              duration: Math.max(10, Math.round(buffer.length / 16000)),
              transcribedBy: `Google Gemini (${geminiModelName})`,
            }
          }
        } catch (geminiErr: unknown) {
          const msg = getErrorMessage(geminiErr, 'Gemini audio transcription error')
          console.warn(`Gemini (${geminiModelName}) audio transcription fallback failed:`, msg)
          providerErrors.push(`Gemini (${geminiModelName}): ${msg}`)
        }
      }
    }

    if (!transcription || !transcription.text || transcription.text.trim().length === 0) {
      const details = providerErrors.length > 0
        ? ` ${providerErrors.join(' | ')}`
        : ' No transcription provider API key configured.'
      return NextResponse.json(
        {
          error: 'API_LIMIT_REACHED',
          message: 'Daily free AI quota exhausted. Please add a new API key in Settings.',
          details: details,
        },
        { status: 429 }
      )
    }

    if (noteId) {
      const existingNote = await prisma.note.findFirst({
        where: { id: noteId, userId },
      })

      if (existingNote) {
        await prisma.note.update({
          where: { id: noteId },
          data: {
            transcript: transcription.text,
            language: transcription.language || 'auto',
            duration: transcription.duration || 0,
            status: 'transcribing',
            transcribedBy: transcription.transcribedBy || 'AI Speech Model',
            ...(savedAudioUrl ? { audioUrl: savedAudioUrl } : {}),
          },
        })
      }
    }

    return NextResponse.json({
      text: transcription.text,
      language: transcription.language || 'auto',
      duration: transcription.duration || 0,
      transcribedBy: transcription.transcribedBy || 'AI Speech Model',
      audioUrl: savedAudioUrl,
    })
  } catch (error: unknown) {
    console.error('Transcription route error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Transcription failed') },
      { status: 500 }
    )
  }
}
