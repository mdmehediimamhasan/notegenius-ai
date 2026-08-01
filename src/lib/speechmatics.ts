function getSpeechmaticsBaseUrl() {
  const configuredUrl = process.env.SPEECHMATICS_API_BASE_URL?.trim().replace(/\/$/, '')
  if (configuredUrl) return configuredUrl

  const region = (process.env.SPEECHMATICS_REGION || 'eu1').trim().toLowerCase()
  const allowedRegions = new Set(['eu1', 'us1', 'eu2', 'us2', 'au1'])
  const safeRegion = allowedRegions.has(region) ? region : 'eu1'
  return `https://${safeRegion}.asr.api.speechmatics.com`
}

async function readErrorBody(response: Response) {
  const text = await response.text().catch(() => '')
  if (!text) return ''

  try {
    const parsed = JSON.parse(text)
    return parsed?.detail || parsed?.message || text
  } catch {
    return text
  }
}

export async function transcribeWithSpeechmatics(apiKey: string, audioBuffer: Buffer, fileName: string, mimeType: string) {
  const baseUrl = getSpeechmaticsBaseUrl()
  const formData = new FormData()
  const config = {
    type: 'transcription',
    transcription_config: {
      language: 'auto', // Auto-detect language
    },
  }

  formData.append('config', JSON.stringify(config))
  formData.append('data_file', new Blob([new Uint8Array(audioBuffer)], { type: mimeType || 'audio/mpeg' }), fileName || 'audio.mp3')

  console.log(`[Speechmatics] Submitting transcription job for ${fileName}...`)
  const jobRes = await fetch(`${baseUrl}/v2/jobs/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!jobRes.ok) {
    const errDetail = await readErrorBody(jobRes)
    throw new Error(errDetail || `Speechmatics submission failed (${jobRes.status})`)
  }

  const jobData = await jobRes.json()
  const jobId = jobData.id
  console.log(`[Speechmatics] Job submitted successfully. ID: ${jobId}. Polling for completion...`)

  // Poll for completion (up to 180s / 3 minutes)
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const statusRes = await fetch(`${baseUrl}/v2/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!statusRes.ok) {
      const errDetail = await readErrorBody(statusRes)
      throw new Error(errDetail || `Speechmatics status check failed (${statusRes.status})`)
    }

    const statusData = await statusRes.json()
    const jobStatus = statusData.job?.status
    console.log(`[Speechmatics] Job status check ${i + 1}: ${jobStatus}`)

    if (jobStatus === 'done') {
      const transcriptRes = await fetch(`${baseUrl}/v2/jobs/${jobId}/transcript?format=txt`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })

      if (!transcriptRes.ok) {
        const errDetail = await readErrorBody(transcriptRes)
        throw new Error(errDetail || `Speechmatics transcript retrieval failed (${transcriptRes.status})`)
      }

      const text = await transcriptRes.text()
      const detectedLang = statusData.job?.config?.transcription_config?.language || 'auto'
      console.log(`[Speechmatics] Transcription complete! Detected language: ${detectedLang}`)
      return { text: text.trim(), language: detectedLang, duration: statusData.job?.duration || 0 }
    }

    if (jobStatus === 'rejected') {
      const rejectionMessage = statusData.job?.errors?.[0]?.message || 'Speechmatics transcription job was rejected by the server'
      throw new Error(rejectionMessage)
    }
  }

  throw new Error('Speechmatics transcription timed out')
}
