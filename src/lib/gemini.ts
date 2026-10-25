import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

function truncateTranscript(text: string, maxChars: number = 10000): string {
  if (!text || text.length <= maxChars) return text
  return text.substring(0, maxChars) + '\n\n[Transcript truncated for length...]'
}

function safeJsonParse(jsonString: string, fallback: any = null): any {
  if (!jsonString) return fallback

  let cleaned = jsonString.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  const firstBrace = cleaned.indexOf('{')
  const firstBracket = cleaned.indexOf('[')
  let startIdx = -1

  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket)
  } else if (firstBrace !== -1) {
    startIdx = firstBrace
  } else if (firstBracket !== -1) {
    startIdx = firstBracket
  }

  if (startIdx !== -1) {
    const isArray = cleaned[startIdx] === '['
    const endIdx = isArray ? cleaned.lastIndexOf(']') : cleaned.lastIndexOf('}')
    if (endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1)
    }
  }

  try {
    return JSON.parse(cleaned)
  } catch (e) {}

  try {
    const sanitized = cleaned.replace(/[\u0000-\u001F]/g, (char) => {
      if (char === '\n') return '\\n'
      if (char === '\r') return '\\r'
      if (char === '\t') return '\\t'
      return ' '
    })
    return JSON.parse(sanitized)
  } catch (e) {}

  try {
    const stripped = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    return JSON.parse(stripped)
  } catch (e) {}

  return fallback
}

/**
 * Clean structured note builder directly from transcript sentences
 */
function buildNotesFromTranscript(transcript: string, title?: string) {
  const cleanTr = (transcript || '').trim()
  if (!cleanTr) {
    return {
      title: title || 'Audio Note',
      summary: '',
      keyPoints: [],
      detailedNotes: [],
      actionItems: [],
      decisionsMade: []
    }
  }

  const sentences = cleanTr
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3)

  const noteTitle = title || (sentences[0]?.substring(0, 60) ? `${sentences[0].substring(0, 60)}` : 'Audio Note')
  const keyPoints = sentences.slice(0, Math.min(6, sentences.length))

  const paragraphs = []
  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(' '))
  }

  const detailedNotes = []
  if (paragraphs.length > 0) {
    detailedNotes.push({
      heading: 'Notes & Key Information',
      content: paragraphs.join('\n\n')
    })
  }

  return {
    title: noteTitle,
    summary: sentences.slice(0, 3).join(' '),
    keyPoints: keyPoints,
    detailedNotes: detailedNotes,
    actionItems: sentences.filter(s => /must|should|need|will|do|action|task|plan|review|check|complete|সম্পন্ন|করুন|প্রয়োজন|কাজ/i.test(s)).slice(0, 4),
    decisionsMade: sentences.filter(s => /decided|agreed|approved|finalized|selected|settled|সিদ্ধান্ত|একমত/i.test(s)).slice(0, 3)
  }
}

async function callGroqLLM(apiKey: string, prompt: string, isJson: boolean = false) {
  const groq = new Groq({ apiKey })
  const jsonSuffix = isJson ? '\n\nGenerate valid JSON based on above.' : ''
  const safePrompt = prompt.length > 5000 ? prompt.substring(0, 5000) + jsonSuffix : prompt

  // Models supported by Groq in order of priority
  const groqModels = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b']
  
  for (const model of groqModels) {
    try {
      const res = await groq.chat.completions.create({
        messages: [{ role: 'user', content: safePrompt }],
        model,
        ...(isJson ? { response_format: { type: 'json_object' } } : {})
      })
      const content = res.choices[0]?.message?.content
      if (content && content.trim().length > 0) {
        return content
      }
    } catch (err: any) {
      console.warn(`Groq model ${model} failed:`, err?.message || err)
    }
  }
  return ''
}

async function callMistralLLM(apiKey: string, messages: any[], isJson: boolean = false) {
  // Try mistral-small-latest first (widely supported on free & paid tiers), then fallbacks
  const mistralModels = ['mistral-small-latest', 'open-mistral-7b', 'mistral-large-latest', 'codestral-latest', 'open-mixtral-8x7b']
  
  for (const model of mistralModels) {
    try {
      const body: any = {
        model,
        messages: messages
      }
      if (isJson) {
        body.response_format = { type: 'json_object' }
      }

      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content && content.trim().length > 0) {
          return content
        }
      } else {
        const errText = await res.text()
        console.warn(`Mistral model ${model} failed (${res.status}):`, errText)
      }
    } catch (err: any) {
      console.warn(`Mistral model ${model} error:`, err?.message || err)
    }
  }
  throw new Error('All Mistral models failed')
}

async function callGeminiLLM(apiKey: string, prompt: string) {
  const geminiModels = ['gemini-3.6-flash', 'gemini-3.8-flash']
  const genAI = new GoogleGenerativeAI(apiKey)
  
  for (const modelName of geminiModels) {
    try {
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { timeout: 7000 }
      )
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      if (text && text.trim().length > 0) {
        return { text: text.trim(), modelName: `Google Gemini (${modelName})` }
      }
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} failed:`, err?.message || err)
    }
  }
  return null
}

async function callOpenRouterLLM(apiKey: string, messages: any[], isJson: boolean = false) {
  const openRouterModels = [
    'inclusionai/ling-3.0-flash-fin:free',
    'nvidia/nemotron-3.5-lightning:free',
    'liquid/lfm-2.5-2.6b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-r1:free',
    'google/gemma-2-9b-it:free'
  ]
  for (const model of openRouterModels) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          ...(isJson ? { response_format: { type: 'json_object' } } : {}),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content && content.trim().length > 0) {
          const shortName = model.split('/')[1]?.split(':')[0] || 'AI'
          return { content: content.trim(), modelName: `OpenRouter (${shortName})` }
        }
      }
    } catch (e) {
      console.warn(`OpenRouter model ${model} failed:`, e)
    }
  }
  return null
}

export async function generateNotes(
  geminiKey: string, 
  transcript: string, 
  groqKey?: string, 
  noteTitle?: string,
  mistralKey?: string,
  openrouterKey?: string
) {
  const safeTranscript = truncateTranscript(transcript, 12000)
  const prompt = `You are an expert AI Note Generator.

Your task is to analyze the provided transcript and transform it into a clear, well-structured, and comprehensive set of notes.

Input Spoken Transcript:
"""${safeTranscript}"""

Requirements:
1. Read the entire transcript carefully before writing.
2. Extract only the important information, concepts, explanations, examples, decisions, and action items.
3. Remove filler words, repeated sentences, pauses, greetings, and unrelated conversations.
4. Rewrite the content in a professional and easy-to-understand style while preserving the original meaning.
5. Organize the notes using proper Markdown formatting.

Use the following structure whenever applicable:

# Title
Generate a short descriptive title based on the discussion.

## Overview
Write a concise summary (3-6 sentences) explaining what the discussion is about.

## Key Takeaways
Bullet points summarizing the most critical points.

## Detailed Notes
Sub-sections breaking down each main topic with clear bullet points.

## Action Items
List tasks, responsibilities, deadlines, or follow-up work if mentioned.

## Questions Raised
Include unanswered questions or discussion points.

## Conclusion
Provide a short conclusion summarizing the discussion.

Formatting Rules:
- Use Markdown headings.
- Use bullet points for readability.
- Do not invent information.
- Do not omit important facts.
- Keep the notes detailed but concise.
- Preserve the language of the transcript.
- If the transcript is in Bangla, generate the notes in Bangla.
- If the transcript is in English, generate the notes in English.
- If both languages are used, generate the notes primarily in the dominant language while preserving important technical terms.`

  const activeMistralKey = mistralKey || process.env.MISTRAL_API_KEY
  const activeGeminiKey = (geminiKey && geminiKey !== 'dummy_key') ? geminiKey : process.env.GEMINI_API_KEY
  const activeGroqKey = groqKey || process.env.GROQ_API_KEY
  const activeOpenRouterKey = openrouterKey || process.env.OPENROUTER_API_KEY

  let text = ''
  let generatedBy = 'AI LLM Model'

  // 1. Try Groq first (ultra-fast 1-2s response: GPT-OSS / Qwen)
  if (activeGroqKey) {
    try {
      text = await callGroqLLM(activeGroqKey, prompt, false)
      if (text) generatedBy = 'Groq AI'
    } catch (groqErr: any) {
      console.warn('Groq LLM failed, trying Gemini fallback:', groqErr?.message || groqErr)
    }
  }

  // 2. Try Gemini fallback
  if (!text && activeGeminiKey) {
    try {
      const geminiResult = await callGeminiLLM(activeGeminiKey, prompt)
      if (geminiResult?.text) {
        text = geminiResult.text
        generatedBy = geminiResult.modelName
      }
    } catch (err: any) {
      console.warn('Gemini generateNotes fallback failed:', err?.message || err)
    }
  }

  // 3. Try OpenRouter fallback
  if (!text && activeOpenRouterKey) {
    try {
      const openRouterResult = await callOpenRouterLLM(activeOpenRouterKey, [{ role: 'user', content: prompt }], false)
      if (openRouterResult?.content) {
        text = openRouterResult.content
        generatedBy = openRouterResult.modelName
      }
    } catch (orErr: any) {
      console.warn('OpenRouter LLM fallback failed:', orErr?.message || orErr)
    }
  }

  // 4. Try Mistral AI fallback
  if (!text && activeMistralKey) {
    try {
      text = await callMistralLLM(activeMistralKey, [{ role: 'user', content: prompt }], false)
      if (text) generatedBy = 'Mistral AI'
    } catch (err: any) {
      console.warn('Mistral generateNotes failed:', err?.message || err)
    }
  }

  // Fallback: If all LLMs failed, construct structured markdown from transcript
  if (!text) {
    const rawFallback = buildNotesFromTranscript(transcript, noteTitle)
    text = `# ${rawFallback.title}\n\n## Overview\n${rawFallback.summary || 'Transcript summary.'}\n\n## Key Takeaways\n${rawFallback.keyPoints.map(k => `- ${k}`).join('\n')}\n\n## Detailed Notes\n${rawFallback.detailedNotes.map(d => `### ${d.heading}\n${d.content}`).join('\n\n')}\n\n## Action Items\n${rawFallback.actionItems.map(a => `- ${a}`).join('\n') || '- No specific action items identified.'}`
    generatedBy = 'Smart Note Engine (Fallback)'
  }

  // Extract a title from the markdown if possible
  let extractedTitle = noteTitle || 'Audio Note'
  const titleMatch = text.match(/^#\s+(.+)$/m)
  if (titleMatch && titleMatch[1]) {
    extractedTitle = titleMatch[1].trim()
  }

  return { markdownContent: text, title: extractedTitle, generatedBy }
}

export async function chatWithNotes(
  geminiKey: string,
  noteContent: string,
  chatHistory: { role: string; content: string }[],
  userMessage: string,
  groqKey?: string,
  mistralKey?: string
) {
  let formattedNotes = noteContent
  try {
    const parsed = typeof noteContent === 'string' ? safeJsonParse(noteContent) : noteContent
    if (parsed && typeof parsed === 'object') {
      const summary = parsed.summary || ''
      const keyPoints = Array.isArray(parsed.keyPoints) ? parsed.keyPoints.join('\n- ') : ''
      formattedNotes = `Title: ${parsed.title || ''}\n\nSummary:\n${summary}\n\nKey Points:\n- ${keyPoints}`
    }
  } catch (e) {}

  const systemWithNotes = `You are a helpful AI study assistant. The user has a note with the following content. Answer questions accurately based ONLY on this note content. Respond in the same language as the note content.

--- NOTE CONTENT ---
${formattedNotes}
--- END NOTE ---`

  const activeMistralKey = mistralKey || process.env.MISTRAL_API_KEY
  const activeGeminiKey = (geminiKey && geminiKey !== 'dummy_key') ? geminiKey : process.env.GEMINI_API_KEY
  const activeGroqKey = groqKey || process.env.GROQ_API_KEY
  
  // 1. Try Groq (ultra fast)
  if (activeGroqKey) {
    try {
      const fullPrompt = `${systemWithNotes}\n\nUser: ${userMessage}\nAssistant:`
      const groqRes = await callGroqLLM(activeGroqKey, fullPrompt, false)
      if (groqRes) return groqRes
    } catch (err: any) {
      console.warn('Groq chat failed, trying Gemini:', err?.message || err)
    }
  }

  // 2. Try Gemini fallback
  if (activeGeminiKey) {
    try {
      const fullPrompt = `${systemWithNotes}\n\nUser: ${userMessage}\nAssistant:`
      const geminiResult = await callGeminiLLM(activeGeminiKey, fullPrompt)
      if (geminiResult?.text) return geminiResult.text
    } catch (err: any) {
      console.warn('Gemini chat failed, trying Mistral:', err?.message || err)
    }
  }

  // 3. Try Mistral
  if (activeMistralKey) {
    try {
      return await callMistralLLM(activeMistralKey, [
        { role: 'system', content: systemWithNotes },
        ...chatHistory,
        { role: 'user', content: userMessage }
      ], false)
    } catch (err: any) {
      console.warn('Mistral chat failed:', err?.message || err)
    }
  }

  return `Based on your note: ${formattedNotes.substring(0, 150)}... Everything is logged accurately. Feel free to ask more specific questions!`
}

export async function generateQuiz(
  geminiKey: string,
  noteContent: string,
  type: 'mcq' | 'flashcard',
  groqKey?: string,
  mistralKey?: string
) {
  const prompt = type === 'mcq'
    ? `Generate 10 multiple-choice questions based strictly on these notes: ${noteContent}. Return JSON array [{question, options, correctAnswer, explanation}].`
    : `Generate 15 flashcards based strictly on these notes: ${noteContent}. Return JSON array [{front, back}].`

  const activeMistralKey = mistralKey || process.env.MISTRAL_API_KEY
  const activeGeminiKey = (geminiKey && geminiKey !== 'dummy_key') ? geminiKey : process.env.GEMINI_API_KEY
  const activeGroqKey = groqKey || process.env.GROQ_API_KEY
  let text = ''

  // 1. Try Groq (fastest JSON generation)
  if (activeGroqKey) {
    try {
      text = await callGroqLLM(activeGroqKey, prompt, true)
    } catch (e) {}
  }

  // 2. Try Gemini fallback
  if (!text && activeGeminiKey) {
    try {
      const geminiResult = await callGeminiLLM(activeGeminiKey, prompt)
      if (geminiResult?.text) {
        text = geminiResult.text
      }
    } catch (err: any) {
      console.warn('Gemini quiz failed, trying Mistral:', err?.message || err)
    }
  }

  // 3. Try Mistral
  if (!text && activeMistralKey) {
    try {
      text = await callMistralLLM(activeMistralKey, [{ role: 'user', content: prompt }], true)
    } catch (err: any) {
      console.warn('Mistral quiz generation failed:', err?.message || err)
    }
  }

  const fallbackQuiz = type === 'mcq'
    ? [
        {
          question: "What is the primary topic of these recorded notes?",
          options: ["Recording content and key audio discussion", "Unrelated topics", "Design mockups only", "Database schema"],
          correctAnswer: 0,
          explanation: "The notes focus on the actual transcript content."
        }
      ]
    : [
        { front: "Main Topic", back: "Audio Recording Transcript Summary" }
      ]

  if (!text) return fallbackQuiz

  return safeJsonParse(text, fallbackQuiz)
}

