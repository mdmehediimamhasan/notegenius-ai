import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'
import { toFile } from 'groq-sdk'
import { v2 as cloudinary } from 'cloudinary'

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

// Upload buffer to Cloudinary — returns secure URL or null on failure
async function uploadToCloudinary(buffer: Buffer, noteId: string): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return null

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

  return new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'notegenius-audio',
        public_id: `audio-${noteId}`,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          console.warn('Cloudinary upload failed:', error?.message)
          resolve(null)
        } else {
          resolve(result.secure_url)
        }
      }
    )
    uploadStream.end(buffer)
  })
}

// Max file size: 25MB — keeps Render free tier (512MB RAM) safe
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

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

    // ✅ Early size check — reject before loading into RAM
    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is 25MB. Your file is ${(audioFile.size / (1024 * 1024)).toFixed(1)}MB.` },
        { status: 413 }
      )
    }

    if (!isSupportedTranscriptionFormat(audioFile.name || '', audioFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format. Please upload MP3, WAV, M4A, MP4, OGG, AAC, FLAC, or AMR.' },
        { status: 400 }
      )
    }

    const fileName = audioFile.name || 'audio.mp3'
    const standardMime = getStandardMimeType(fileName, audioFile.type)

    let transcription: TranscriptionResult | null = null
    const providerErrors: string[] = []

    // Use client-side transcript if provided (no buffer needed for transcription)
    if (clientTranscript && clientTranscript.trim().length > 3) {
      transcription = {
        text: clientTranscript.trim(),
        language: 'auto',
        duration: 30,
      }
    }

    // Load buffer once — reused for Groq + Cloudinary upload
    const arrayBuffer = await audioFile.arrayBuffer()
    let buffer: Buffer | null = Buffer.from(arrayBuffer)

    // Groq Whisper transcription
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
      providerErrors.push('Groq: No API key configured. Add your Groq API key in Settings.')
    }

    if (!transcription || !transcription.text || transcription.text.trim().length === 0) {
      buffer = null
      const details = providerErrors.length > 0
        ? ` ${providerErrors.join(' | ')}`
        : ' No transcription provider API key configured.'
      return NextResponse.json(
        {
          error: 'API_LIMIT_REACHED',
          message: 'Transcription failed. Please check your Groq API key in Settings.',
          details: details,
        },
        { status: 429 }
      )
    }

    // ✅ Upload audio to Cloudinary (persistent — survives Render restarts)
    let savedAudioUrl: string | null = null
    if (noteId && buffer) {
      savedAudioUrl = await uploadToCloudinary(buffer, noteId)
    }

    // ✅ Free buffer from memory after use
    buffer = null

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
