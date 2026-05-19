/**
 * Local BoW (Bag-of-Words) + Cosine Similarity engine.
 * Fallback when Gemini API is rate-limited.
 * Zero external dependencies — runs pure TypeScript on the server.
 */

import { personalInfo, skillCategories, projects, experiences, certifications, education, stats } from '@/data/resume'

/* ── Stop words to ignore ── */
const STOP_WORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'in','on','at','to','for','of','with','by','from','up','about','into','through',
  'during','before','after','above','below','between','out','off','over','under',
  'again','further','then','once','here','there','when','where','why','how','all',
  'both','each','few','more','most','other','some','such','no','nor','not','only',
  'own','same','so','than','too','very','and','but','or','if','while','as','that',
  'this','it','its','i','me','my','we','you','your','he','she','they','them','what',
  'which','who','whom','hi','hello','hey','tell','show','give','please','thanks',
  'thank','know','want','need','like','get','got','make','just',
])

/* ── Tokenizer ── */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

/* ── Build TF vector ── */
function tfVector(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1)
  }
  // Normalize
  let max = 1
  tf.forEach(v => { if (v > max) max = v })
  tf.forEach((v, k) => tf.set(k, v / max))
  return tf
}

/* ── Cosine similarity ── */
function cosineSim(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, magA = 0, magB = 0
  a.forEach((v, k) => {
    magA += v * v
    if (b.has(k)) dot += v * b.get(k)!
  })
  b.forEach(v => { magB += v * v })
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

/* ── Knowledge base entry ── */
interface KBEntry {
  keywords: string
  answer: string
}

/* ── Build knowledge base from resume data ── */
function buildKB(): KBEntry[] {
  const kb: KBEntry[] = []

  // Identity
  kb.push({
    keywords: 'who aniket name about introduction yourself bio summary background',
    answer: `${personalInfo.name} is an ${personalInfo.title} based in ${personalInfo.location}. ${personalInfo.summary}`,
  })

  // Contact
  kb.push({
    keywords: 'contact email phone number reach hire call message connect',
    answer: `You can reach Aniket at ${personalInfo.email} or call ${personalInfo.phone}. He's based in ${personalInfo.location}. You can also use the contact form on this site!`,
  })

  // Social / links
  kb.push({
    keywords: 'github linkedin social profile portfolio website link',
    answer: `GitHub: ${personalInfo.links.github} | LinkedIn: ${personalInfo.links.linkedin}`,
  })

  // Education
  for (const edu of education) {
    kb.push({
      keywords: `education degree university college school study ${edu.degree} ${edu.institution} gpa academic`,
      answer: `${edu.degree} from ${edu.institution} (${edu.date}) — ${edu.gpa}`,
    })
  }

  // Skills (per category)
  for (const cat of skillCategories) {
    kb.push({
      keywords: `skills ${cat.label} technology tech stack tools ${cat.items.join(' ')}`,
      answer: `${cat.label}: ${cat.items.join(', ')}`,
    })
  }

  // All skills combined
  kb.push({
    keywords: 'skills technologies tech stack tools programming languages frameworks',
    answer: skillCategories.map(c => `${c.label}: ${c.items.join(', ')}`).join(' | '),
  })

  // Stats
  for (const stat of stats) {
    kb.push({
      keywords: `${stat.label} count number how many stats`,
      answer: `${stat.label}: ${stat.value}`,
    })
  }

  // Projects (each)
  for (const p of projects) {
    const links = p.links
      ? Object.entries(p.links).map(([k, v]) => `${k}: ${v}`).join(', ')
      : ''
    kb.push({
      keywords: `project ${p.title} ${p.tech.join(' ')} ${p.featured ? 'featured' : ''}`,
      answer: `**${p.title}** — ${p.description} [Tech: ${p.tech.join(', ')}]${links ? ` | Links: ${links}` : ''}`,
    })
  }

  // Featured projects summary
  kb.push({
    keywords: 'featured projects best top main important highlight',
    answer: projects.filter(p => p.featured).map(p => `• ${p.title}: ${p.description.slice(0, 80)}...`).join('\n'),
  })

  // All projects summary
  kb.push({
    keywords: 'all projects list every project built portfolio work',
    answer: `Aniket has built ${stats.find(s => s.label === 'Projects Built')?.value || '25+'} projects including: ${projects.map(p => p.title).join(', ')}`,
  })

  // Experience (each)
  for (const exp of experiences) {
    kb.push({
      keywords: `experience work ${exp.title} ${exp.company} ${exp.type} job role internship`,
      answer: `**${exp.title}** at ${exp.company} (${exp.date}) — ${exp.bullets[0]}`,
    })
  }

  // Internship specific
  kb.push({
    keywords: 'internship intern atos work professional enterprise',
    answer: experiences.filter(e => e.type === 'internship').map(e =>
      `${e.title} at ${e.company}: ${e.bullets.join(' ')}`
    ).join('\n'),
  })

  // Certifications
  kb.push({
    keywords: 'certification certified aws databricks guvi course training credential',
    answer: `Aniket holds ${certifications.length} certifications: ${certifications.slice(0, 5).join('; ')}...`,
  })

  // AI Agents
  kb.push({
    keywords: 'agent agents ai built how many autonomous multi-agent system',
    answer: `Aniket has built ${stats.find(s => s.label === 'AI Agents Built')?.value || '195+'} AI agents, including work on multi-agent systems at Atos and various autonomous coding agents.`,
  })

  // Hackathon
  kb.push({
    keywords: 'hackathon competition won winner prize compete event',
    answer: 'Aniket has participated in 10+ national and inter-college hackathons focusing on AI, IoT, and automation. He won 3rd prize at the Rekhi Happithon for developing a Happibooster using NLP and reinforcement learning.',
  })

  // Hiring / collaboration
  kb.push({
    keywords: 'hire hiring collaborate work together freelance job opportunity available',
    answer: `Aniket is open to opportunities! Reach out via the contact form on this site or email ${personalInfo.email}.`,
  })

  // Greeting
  kb.push({
    keywords: 'hi hello hey sup greet welcome',
    answer: "Hey there! I'm NeuralBot — Aniket's AI assistant. Ask me about his projects, skills, experience, or how to get in touch!",
  })

  return kb
}

/* ── Cached KB + vectors ── */
let cachedKB: { entries: KBEntry[]; vectors: Map<string, number>[] } | null = null

function getKB() {
  if (!cachedKB) {
    const entries = buildKB()
    const vectors = entries.map(e => tfVector(tokenize(e.keywords)))
    cachedKB = { entries, vectors }
  }
  return cachedKB
}

/* ── Main query function ── */
export function localBowQuery(userMessage: string): string {
  const { entries, vectors } = getKB()
  const queryVec = tfVector(tokenize(userMessage))

  // Score each KB entry
  const scored = vectors
    .map((vec, i) => ({ score: cosineSim(queryVec, vec), index: i }))
    .sort((a, b) => b.score - a.score)

  // If best match is too low, give a generic response
  if (scored[0].score < 0.05) {
    return "I'm not sure about that, but I can tell you about Aniket's projects, skills, experience, or contact info. Try asking about one of those!"
  }

  // Return top match, or combine top 2 if close
  const best = entries[scored[0].index].answer
  if (scored.length > 1 && scored[1].score > scored[0].score * 0.7) {
    return best + '\n\n' + entries[scored[1].index].answer
  }

  return best
}
