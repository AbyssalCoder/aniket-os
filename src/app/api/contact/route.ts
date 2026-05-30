import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/contact
 * Sends contact form data via Web3Forms (free, no activation needed)
 * and also formats a WhatsApp link as fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Try Web3Forms first (free tier, instant, no activation needed)
    // Access key from https://web3forms.com — this is a public submission key, not a secret
    const web3formsKey = process.env.WEB3FORMS_KEY || 'YOUR_WEB3FORMS_KEY'

    let sent = false

    if (web3formsKey && web3formsKey !== 'YOUR_WEB3FORMS_KEY') {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: web3formsKey,
            name,
            email,
            message,
            subject: `Portfolio Contact from ${name}`,
            from_name: 'Aniket OS Portfolio',
          }),
        })
        const data = await res.json()
        if (data.success) sent = true
      } catch {
        // Web3Forms failed, try FormSubmit fallback
      }
    }

    // Fallback: FormSubmit.co
    if (!sent) {
      try {
        const res = await fetch('https://formsubmit.co/ajax/aniketsupermails2005@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
          body: JSON.stringify({
            name, email, message,
            _subject: `Portfolio Contact from ${name}`,
            _captcha: 'false',
            _template: 'table',
          }),
        })
        const data = await res.json()
        if (data.success === 'true' || data.success === true) sent = true
      } catch {
        // FormSubmit also failed
      }
    }

    if (sent) {
      return NextResponse.json({ success: true })
    }

    // Both failed — return WhatsApp link for client-side fallback
    const waText = encodeURIComponent(`Portfolio Contact from ${name} (${email}):\n${message}`)
    return NextResponse.json({
      error: 'Email services unavailable',
      whatsappFallback: `https://wa.me/917980458591?text=${waText}`,
    }, { status: 502 })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
