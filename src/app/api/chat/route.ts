import { NextRequest, NextResponse } from 'next/server'
import { personalInfo, skillCategories, projects, experiences, certifications, education } from '@/data/resume'

/**
 * POST /api/chat
 * Server-side proxy to the Gemini API.
 * Keeps the API key secure — never exposed to the browser.
 */

function buildSystemPrompt(): string {
  const eduStr = education.map(e => e.degree + ' at ' + e.institution + ' (' + e.date + ')').join('; ')
  const skillStr = skillCategories.map(c => c.label + ': ' + c.items.join(', ')).join(' | ')
  const projStr = projects.filter(p => p.featured).map(p => p.title + ': ' + p.description.slice(0, 100) + '...').join(' | ')
  const expStr = experiences.map(e => e.title + ' at ' + e.company).join(', ')
  const certStr = certifications.slice(0, 3).join(', ')

  return [
    'You are Aniket\'s AI assistant embedded in his portfolio website. Your name is "NeuralBot".',
    'You help visitors learn about Aniket Chowdhury — an AI/ML Engineer based in ' + personalInfo.location + '.',
    '',
    'PERSONALITY: Friendly, concise, professional. Use a slightly futuristic tone matching the website\'s aesthetic.',
    'Keep answers brief (2-4 sentences) unless the visitor asks for detail.',
    '',
    'ANIKET\'S INFO:',
    '- Name: ' + personalInfo.name,
    '- Title: ' + personalInfo.title,
    '- Email: ' + personalInfo.email,
    '- Summary: ' + personalInfo.summary,
    '- Education: ' + eduStr,
    '- Skills: ' + skillStr,
    '- Featured Projects: ' + projStr,
    '- Total Projects: ' + projects.length + '+',
    '- Experience: ' + expStr,
    '- Certifications: ' + certifications.length + ' certifications including ' + certStr,
    '- Links: GitHub: ' + personalInfo.links.github + ' | LinkedIn: ' + personalInfo.links.linkedin,
    '',
    'If asked about hiring/collaboration, encourage the visitor to use the contact form on the site or email ' + personalInfo.email + '.',
    'If asked something unrelated to Aniket, politely redirect to portfolio topics.',
  ].join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Build conversation contents for Gemini
    const contents = [
      ...history.map((msg: { role: string; text: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey
    const response = await fetch(url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
          contents,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', errText)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    const data = await response.json()
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm having trouble processing that. Try asking something about Aniket's projects or skills!"

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
