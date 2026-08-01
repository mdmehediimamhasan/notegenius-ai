export async function transcribeWithGroq(apiKey: string, formData: FormData) {
  const response = await fetch(
    'https://api.groq.com/openai/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Groq API error: ${response.status} - ${errorData?.error?.message || response.statusText}`
    )
  }

  return response.json()
}
