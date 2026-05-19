/* ============================================================
   RESUME DATA — Single source of truth for all portfolio content
   ============================================================ */

export const personalInfo = {
  name: 'Aniket Chowdhury',
  firstName: 'Aniket',
  lastName: 'Chowdhury',
  title: 'AI / ML Engineer',
  location: 'Kolkata, West Bengal, India',
  phone: '+91 7980458591',
  email: 'aniketsupermails2005@gmail.com',
  summary:
    'Innovative professional in AI and automation with expertise in deep learning, generative AI, and multi-agent systems. Led workshops, won hackathons, and built production-grade AI solutions — from real-time intrusion detection to autonomous cloud IDEs. Passionate about building intelligent systems that push boundaries.',
  links: {
    boldProfile: 'https://bold.pro/my/aniketchowdhury10-260316213043/292r',
    linkedin: 'https://linkedin.com/in/aniket-chowdhury-7261b42b0',
    github: 'https://github.com/AbyssalCoder',
  },
  profileImage: 'https://avatars.githubusercontent.com/u/218095895?v=4',
}

export interface Skill {
  name: string
  category: 'ai' | 'framework' | 'tool' | 'database' | 'devops'
}

export const skillCategories = [
  {
    id: 'ai',
    label: 'AI / ML',
    icon: '🧠',
    color: '#00f0ff',
    items: [
      'Deep Learning', 'Computer Vision', 'NLP', 'Neural Networks',
      'Generative AI', 'Transfer Learning', 'Model Optimization',
      'Data Analysis', 'Scikit-learn', 'Multi-Agent Systems',
    ],
  },
  {
    id: 'framework',
    label: 'Frameworks',
    icon: '⚡',
    color: '#8b5cf6',
    items: [
      'TensorFlow', 'PyTorch', 'OpenCV', 'FastAPI', 'Flask',
      'React', 'Next.js', 'Node.js', 'LangChain', 'Llamaindex',
    ],
  },
  {
    id: 'tool',
    label: 'Tools & APIs',
    icon: '🔧',
    color: '#ff006e',
    items: [
      'RAG Pipelines', 'Google Gemini API', 'LLAMA 3', 'Ollama',
      'Custom GPTs', 'Vector Databases', 'Whisper STT',
      'Tree-sitter', 'Monaco Editor', 'WebSockets', 'Scapy',
    ],
  },
  {
    id: 'database',
    label: 'Databases',
    icon: '🗄️',
    color: '#0066ff',
    items: [
      'MongoDB', 'PostgreSQL', 'MySQL', 'Neo4j', 'Chroma', 'Firebase',
    ],
  },
  {
    id: 'devops',
    label: 'DevOps & Cloud',
    icon: '☁️',
    color: '#00ff88',
    items: [
      'Docker', 'Git', 'AWS Cloud', 'Network Security', 'Tailwind CSS',
    ],
  },
]

export interface Project {
  title: string
  description: string
  tech: string[]
  featured?: boolean
  video?: string
  links?: {
    live?: string
    github?: string
    backend?: string
  }
}

export const projects: Project[] = [
  {
    title: 'AI-Based Intrusion Detection System',
    description:
      'Real-time IDS using Random Forest (99.97% accuracy) with Scapy for live packet capture, automated IP blocking via iptables/netsh, and a Flask dashboard. Trained on a custom 1.8M-record dataset from a VirtualBox testbed. Detects SYN/ICMP/UDP/HTTP floods, port scans, and null scans in <1 second.',
    tech: ['Python', 'Scikit-learn', 'Scapy', 'Flask', 'Random Forest', 'VirtualBox'],
    featured: true,
  },
  {
    title: 'CodeAbyss — AI Cloud IDE',
    description:
      'AI-powered browser IDE with autonomous coding agent capabilities. Live code editor, terminal, AI chat, real-time preview, and multi-language execution. Integrated Gemini/OpenRouter/Ollama APIs with Next.js, Node.js, WebSockets, Monaco Editor, and TailwindCSS.',
    tech: ['Next.js', 'Node.js', 'WebSockets', 'Monaco Editor', 'Gemini API', 'TailwindCSS'],
    featured: true,
    links: {
      live: 'https://codeabyss.vercel.app',
      github: 'https://github.com/AbyssalCoder/CodeAbyss_AI_IDE',
      backend: 'https://novaforge-api-lf6u.onrender.com',
    },
  },
  {
    title: 'MedMate — AI Healthcare Assistant',
    description:
      'Conversational copilot with symptom triage, skin & lab analysis, smart referrals, and Gemini 1.5 Flash integration.',
    tech: ['Gemini 1.5 Flash', 'Python', 'NLP', 'Computer Vision'],
    featured: true,    links: {
      live: 'https://abyssalcoder.github.io/MedMate/',
    },  },
  {
    title: 'Codebase Archaeologist',
    description:
      'Legacy code intelligence using FastAPI, React, tree-sitter, Neo4j, Chroma, LangChain & LlamaIndex for deep codebase understanding.',
    tech: ['FastAPI', 'React', 'Neo4j', 'Chroma', 'LangChain', 'LlamaIndex', 'tree-sitter'],
    featured: true,
  },
  {
    title: 'Live Waste Classifier (YOLOv8)',
    description:
      '30 FPS computer vision pipeline with custom YOLOv8 model achieving 95%+ accurate waste categorization.',
    tech: ['YOLOv8', 'OpenCV', 'Python', 'Deep Learning'],
    video: '/videos/waste_classifier.mp4',
  },
  {
    title: 'HydroScan — Sonar Aquatic Drone',
    description:
      'Autonomous sonar mapping boat for construction & fisheries using Raspberry Pi and live navigation.',
    tech: ['Raspberry Pi', 'Python', 'IoT', 'Sonar'],
  },
  {
    title: 'Location-Verified Attendance System',
    description:
      'GPS + Haversine geofencing with Firebase, production-ready admin workflows, and mobile-first UI.',
    tech: ['Firebase', 'GPS', 'JavaScript', 'Mobile-first'],
    video: '/videos/attendance.mp4',
  },
  {
    title: 'SmartCane — Sugarcane Health Detection',
    description:
      'Custom deep-learning pipeline with stability locking & frame smoothing for reliable crop health assessments.',
    tech: ['Deep Learning', 'OpenCV', 'Python', 'IoT'],
    video: '/videos/smartcane.mp4',
  },
  {
    title: 'Chatbot cum Voice Assistant',
    description:
      'Offline LLAMA 3 + Ollama assistant with Whisper STT, web browsing, and contextual memory.',
    tech: ['LLAMA 3', 'Ollama', 'Whisper STT', 'Python'],
  },
  {
    title: 'Phoenix AI Assistant UI',
    description:
      'Glassmorphism dashboard with live system stats, weather, and AI persona interactions.',
    tech: ['React', 'CSS', 'APIs', 'Glassmorphism'],
    links: {
      live: 'https://abyssalcoder.github.io/phoenix/',
    },
  },
  {
    title: 'Face Recognition System',
    description:
      'Real-time OpenCV interface with futuristic UI for secure access control and authentication.',
    tech: ['OpenCV', 'Python', 'Deep Learning'],
  },
  {
    title: 'Railway Vendor Portal (v1)',
    description:
      'Secure onboarding & session flows for vendors managing track fitting data.',
    tech: ['HTML', 'CSS', 'JavaScript', 'Backend'],
    video: '/videos/railway.mp4',
  },
  {
    title: 'Word Ladder Visualizer (A*)',
    description:
      'Interactive Python tool showcasing heuristic-driven transformations via A* search.',
    tech: ['Python', 'A* Algorithm', 'Visualization'],
  },
]

export interface Experience {
  title: string
  company: string
  date: string
  type: 'internship' | 'experience'
  bullets: string[]
}

export const experiences: Experience[] = [
  {
    title: 'AI/ML Intern',
    company: 'Atos',
    date: 'Internship',
    type: 'internship',
    bullets: [
      'Contributed to enterprise AI and automation solutions focused on multi-agent systems, CloudOps, and intelligent workflow orchestration.',
      'Built and managed AI agents for PIR review, CMDB comparison/report generation, and automated network fault analysis.',
      'Worked on OpenClaw-based agent ecosystems, reusable agent template libraries, and orchestration of 10+ agents to automate and optimize L1/L2 operational tasks.',
    ],
  },
  {
    title: 'Hackathon Innovator',
    company: 'National & Inter-College',
    date: '01/2022 — Present',
    type: 'experience',
    bullets: [
      'Engaged in 10+ national and inter-college hackathons focusing on AI, IoT, and automation.',
      'Developed innovative program proposals for student engagement and collaboration.',
      'Facilitated brainstorming sessions to generate creative ideas among diverse groups.',
    ],
  },
  {
    title: 'Workshop Conductor',
    company: 'Adamas Robotics Club',
    date: 'Active Member',
    type: 'experience',
    bullets: [
      'Conducted hands-on sessions on slicing, printer operations, and material science.',
      'Operated robotic systems during club demonstrations and competitions.',
      'Collaborated with team members to design and build innovative robotics projects.',
    ],
  },
  {
    title: 'Workshop Leader',
    company: 'Purulia Science Centre',
    date: 'Workshop',
    type: 'experience',
    bullets: [
      'Facilitated hands-on workshops for participants to build Bluetooth RC cars using Arduino and HC-05 modules.',
      'Designed and facilitated engaging science workshops for diverse audiences.',
    ],
  },
  {
    title: 'Happithon Winner — 3rd Prize',
    company: 'Rekhi Happithon',
    date: 'Award',
    type: 'experience',
    bullets: [
      'Achieved 3rd prize for developing a Happibooster using NLP and a reinforcement learning model.',
    ],
  },
]

export const certifications = [
  'AWS Academy — Generative AI Foundations',
  'Databricks Generative AI Fundamentals',
  'GUVI (HCL) — Data Science: MAANG Professional',
  'AWS Academy — Machine Learning Foundations',
  'AWS Academy — Machine Learning for NLP',
  'AWS Academy Lab — Cloud Web Application Builder',
  'AWS Academy Lab — Cloud Data Pipeline Builder',
  'AWS Academy Lab — Microservices & CI/CD Pipeline Builder',
  'Generative AI Mastermind — Outskill',
  'Firstbitsolutions Professional Certifications',
  'DGCA Licensed Drone Pilot',
]

export const education = [
  {
    degree: 'B.Tech: CS (AI & ML)',
    institution: 'Adamas University',
    gpa: 'CGPA 7.8 | SGPA (Sem 5) 8.77',
    date: 'Expected 01/2027',
  },
  {
    degree: 'Class XII',
    institution: 'Indira Gandhi Memorial High School',
    gpa: '80.03%',
    date: '01/2023',
  },
]

export const languages = [
  { name: 'English', level: 'Fluent' },
  { name: 'Bengali', level: 'Native' },
  { name: 'Hindi', level: 'Fluent' },
  { name: 'Japanese', level: 'JLPT N5' },
]

/* Quick stats for the About section */
export const stats = [
  { label: 'Projects Built', value: '15+' },
  { label: 'Hackathons', value: '10+' },
  { label: 'Certifications', value: '11' },
  { label: 'AI Agents Built', value: '10+' },
]
