import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/contact
 * Server-side proxy for FormSubmit.co — avoids CORS issues from the browser.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const res = await fetch('https://formsubmit.co/ajax/aniketsupermails2005@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `Portfolio Contact from ${name}`,
        _captcha: 'false',
        _template: 'table',
      }),
    })

    const data = await res.json()

    if (res.ok && data.success !== 'false') {
      return NextResponse.json({ success: true })
    }

    console.error('FormSubmit error:', data)
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
