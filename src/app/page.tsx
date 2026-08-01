'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/* ============================================
   DATA
   ============================================ */
const heroWords = ["AI-Powered Notes", "Intelligent Summaries", "Study Flashcards", "Practice Quizzes", "AI Conversations"];

const trustedBy = [
  "Stanford University", "MIT OpenCourseWare", "Harvard Extension",
  "Oxford Learning", "Cambridge AI Lab", "Yale Research",
  "Princeton Study", "Columbia EdTech", "Berkeley AI",
  "ETH Zürich", "Toronto AI", "Imperial College"
];

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
    ),
    title: 'Audio & Video Upload',
    desc: 'Upload lectures, meetings, podcasts or record directly in-browser. Support for MP3, MP4, WAV, WebM and 20+ formats.',
    color: 'from-violet-500/20 to-violet-600/5',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    ),
    title: '50+ Languages',
    desc: 'Transcribe and translate content across 50+ languages with Whisper AI. Auto-detect language for seamless workflows.',
    color: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    ),
    title: 'AI Note Generation',
    desc: 'Beautifully structured notes with key points, summaries, action items, and hierarchical outlines — powered by advanced LLMs.',
    color: 'from-emerald-500/20 to-emerald-600/5',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
    title: 'AI Chat Assistant',
    desc: 'Ask questions about your recordings and get instant, context-aware answers. Your personal AI study companion.',
    color: 'from-pink-500/20 to-pink-600/5',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
    ),
    title: 'Quizzes & Flashcards',
    desc: 'Auto-generated quizzes and spaced-repetition flashcards. Track your mastery with built-in progress analytics.',
    color: 'from-amber-500/20 to-amber-600/5',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    ),
    title: 'Export Anywhere',
    desc: 'Export notes to Notion, Markdown, PDF, or share with a simple link. Integrate with your existing workflow seamlessly.',
    color: 'from-blue-500/20 to-blue-600/5',
  },
];

const steps = [
  { step: '01', title: 'Upload or Record', desc: 'Drag & drop your audio/video file or record directly in the browser with one click.', icon: '🎙️' },
  { step: '02', title: 'AI Transcribes', desc: 'Whisper AI creates a perfectly accurate transcript in seconds, supporting 50+ languages.', icon: '⚡' },
  { step: '03', title: 'Generate Notes', desc: 'Advanced LLMs transform the transcript into structured, comprehensive study notes.', icon: '📝' },
  { step: '04', title: 'Study & Export', desc: 'Review your notes, quiz yourself with flashcards, chat with AI, and export everywhere.', icon: '🚀' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Medical Student, Johns Hopkins',
    text: 'NoteGenius cut my lecture review time in half. The AI-generated notes capture details I would have missed, and the flashcards are a game-changer for exam prep.',
    avatar: '👩‍⚕️',
    rating: 5,
  },
  {
    name: 'James Okafor',
    role: 'CS Graduate, Stanford',
    text: 'As a grad student juggling research and classes, NoteGenius is indispensable. Upload a 2-hour lecture and get perfectly structured notes in minutes.',
    avatar: '👨‍💻',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    role: 'Language Teacher, São Paulo',
    text: 'The multi-language support is incredible. I use it to transcribe lessons in Portuguese and English simultaneously. My students love the auto-generated quizzes.',
    avatar: '👩‍🏫',
    rating: 5,
  },
];

const integrations = [
  { name: 'Notion', icon: '📓' },
  { name: 'Google Drive', icon: '📁' },
  { name: 'Markdown', icon: '📋' },
  { name: 'PDF Export', icon: '📄' },
  { name: 'Obsidian', icon: '💎' },
  { name: 'Share Link', icon: '🔗' },
];

const faqs = [
  {
    q: 'How does NoteGenius transcribe audio?',
    a: 'We use OpenAI\'s Whisper model for highly accurate speech-to-text transcription. It supports 50+ languages and handles accents, background noise, and technical jargon remarkably well.',
  },
  {
    q: 'What audio/video formats are supported?',
    a: 'NoteGenius supports MP3, MP4, WAV, WebM, M4A, OGG, FLAC, and 20+ other formats. You can also record directly in the browser — no plugins needed.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. Your files are encrypted in transit and at rest. We use your own API keys, so your data never passes through third-party servers. You maintain full ownership.',
  },
  {
    q: 'Do I need to bring my own API keys?',
    a: 'Yes — NoteGenius uses a BYOK (Bring Your Own Key) model. You provide your OpenAI or Gemini API key, and the platform is 100% free to use. This ensures maximum privacy and cost transparency.',
  },
  {
    q: 'Can I use NoteGenius for languages other than English?',
    a: 'Yes! We support 50+ languages for transcription, and our AI can generate notes in the same language as the source audio. Translation features are also available.',
  },
  {
    q: 'How accurate is the AI note generation?',
    a: 'Our notes are generated using advanced LLMs (GPT-4 / Gemini Pro) that understand context deeply. The output includes key points, summaries, action items, and well-organized hierarchies with typically 95%+ accuracy.',
  },
];

const stats = [
  { value: '10K+', label: 'Notes Generated' },
  { value: '50+', label: 'Languages Supported' },
  { value: '99.2%', label: 'Transcription Accuracy' },
  { value: '100%', label: 'Free with Your API Key' },
];

/* ============================================
   COMPONENTS
   ============================================ */

function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  
  const match = value.match(/^([^0-9.-]*)([0-9.]+)(.*)$/);
  const prefix = match ? match[1] : '';
  const numericValue = match ? parseFloat(match[2]) : parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const suffix = match ? match[3] : '';
  const isDecimal = match ? match[2].includes('.') : value.includes('.');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let startTime: number;
        const duration = 2000;
        
        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const percentage = Math.min(progress / duration, 1);
          
          const easePercentage = 1 - Math.pow(1 - percentage, 4);
          setCount(numericValue * easePercentage);
          
          if (percentage < 1) {
            requestAnimationFrame(animate);
          } else {
            setCount(numericValue); // Ensure exact final value
          }
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.1 });

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasAnimated, numericValue]);

  return (
    <span ref={elementRef} className="text-4xl sm:text-5xl font-extrabold gradient-text-hero">
      {prefix}{isDecimal ? count.toFixed(1) : Math.floor(count)}{suffix}
    </span>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ============================================
   MAIN PAGE
   ============================================ */
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Word cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll listener for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const toggleFaq = useCallback((idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <div className="min-h-screen bg-[#060611] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="particle-grid" />

      {/* ====================================
          NAVBAR
          ==================================== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-white/5 shadow-lg shadow-violet-900/5' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">NoteGenius</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium">How It Works</a>
              <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium">Testimonials</a>
              <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium">Pricing</a>
              <a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-300 hover:text-white font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
                Log In
              </Link>
              <Link href="/register" className="btn-primary py-2.5 px-5 text-sm">
                <span>Get Started Free</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass border-t border-white/5 animate-slide-down">
            <div className="px-4 pt-3 pb-4 space-y-1">
              {['Features', 'How It Works', 'Testimonials', 'Pricing', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="block px-4 py-2.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-3 border-t border-white/5 mt-2 flex flex-col gap-2">
                <Link href="/login" className="block px-4 py-2.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                <Link href="/register" className="btn-primary py-2.5 text-sm text-center" onClick={() => setIsMenuOpen(false)}><span>Get Started Free</span></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ====================================
          HERO SECTION
          ==================================== */}
      <main className="pt-32 sm:pt-40 pb-12 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 section-badge mb-8 animate-fade-slide-up">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Powered by Advanced AI
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="block text-white mb-2">Transform Any Audio Into</span>
            <span className="block gradient-text-hero">
              AI-Powered Notes
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed text-balance">
            The AI-powered study platform that automatically transcribes lectures, generates structured notes, creates flashcards, and quizzes you — all in one beautiful workspace.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex justify-center gap-4 flex-col sm:flex-row items-center">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              <span>Start Free — No Card Required</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <button className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Stats Strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 max-w-3xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-item py-3">
                <AnimatedCounter value={stat.value} />
                <div className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Dashboard Image */}
        <div
          className="mt-16 sm:mt-20 max-w-5xl mx-auto opacity-0 translate-y-8 transition-all duration-1000"
          data-animate="true"
        >
          <div className="hero-image-container animate-float-rotate rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/30 border border-white/10">
            <Image
              src="/hero-dashboard-new-4k.jpg"
              alt="NoteGenius AI Dashboard"
              width={3840}
              height={2913}
              quality={100}
              unoptimized
              className="w-full h-auto rounded-2xl"
              priority
            />
            <div className="hero-image-glow" />
          </div>
        </div>
      </main>

      {/* ====================================
          TRUSTED BY / MARQUEE
          ==================================== */}
      <section className="py-12 relative z-10">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600 font-semibold">Trusted by students & educators worldwide</p>
        </div>
        <div className="marquee-container">
          <div className="marquee-track">
            {[...trustedBy, ...trustedBy].map((name, idx) => (
              <span key={idx} className="marquee-item">
                <span className="text-violet-500/40">●</span>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ====================================
          FEATURES SECTION
          ==================================== */}
      <section id="features" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="section-badge mb-4 inline-flex">⚡ Core Features</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Everything You Need to <span className="gradient-text">Learn Smarter</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Supercharge your study workflow with AI tools designed to save you hours every week.
            </p>
          </div>

          <div className="bento-grid">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`glass-card bento-card p-7 rounded-2xl opacity-0 translate-y-8 transition-all duration-700`}
                data-animate="true"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 text-violet-300 ring-glow`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2.5">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ====================================
          HOW IT WORKS
          ==================================== */}
      <section id="how-it-works" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="section-badge mb-4 inline-flex">🔄 Simple Workflow</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              From Audio to Notes in <span className="gradient-text">4 Steps</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Upload your audio, and let our AI transform it into complete study materials in minutes.
            </p>
          </div>

          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block step-connector left-[12%] right-[12%]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center opacity-0 translate-y-8 transition-all duration-700"
                  data-animate="true"
                  style={{ transitionDelay: `${idx * 120}ms` }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/25 text-violet-300 flex items-center justify-center text-lg font-bold mb-5 shadow-[0_0_25px_rgba(139,92,246,0.2)] animate-border-glow">
                    {item.icon}
                  </div>
                  <span className="text-xs text-violet-500/60 font-mono font-bold tracking-wider mb-2">STEP {item.step}</span>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm max-w-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ====================================
          TESTIMONIALS
          ==================================== */}
      <section id="testimonials" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="section-badge mb-4 inline-flex">💬 Testimonials</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Loved by <span className="gradient-text">Students Worldwide</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              See what students and educators are saying about NoteGenius.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="testimonial-card opacity-0 translate-y-8 transition-all duration-700"
                data-animate="true"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <StarRating count={t.rating} />
                <p className="text-slate-300 text-sm leading-relaxed mt-4 mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/20 flex items-center justify-center text-xl border border-violet-500/15">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ====================================
          INTEGRATIONS
          ==================================== */}
      <section className="py-20 sm:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="section-badge mb-4 inline-flex">🔗 Integrations</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Export <span className="gradient-text">Everywhere</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Seamlessly integrate NoteGenius into your existing workflow and tools.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
            {integrations.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-3 opacity-0 translate-y-8 transition-all duration-700"
                data-animate="true"
                style={{ transitionDelay: `${idx * 70}ms` }}
              >
                <div className="integration-icon">
                  {item.icon}
                </div>
                <span className="text-sm text-slate-400 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================
          CTA BANNER
          ==================================== */}
      <section className="py-12 sm:py-16 relative z-10 px-4">
        <div className="cta-section max-w-5xl mx-auto p-8 sm:p-12 md:p-16 text-center opacity-0 translate-y-8 transition-all duration-700" data-animate="true">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to Transform Your <span className="gradient-text">Study Experience?</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
            Join thousands of students who are saving hours every week with AI-powered notes, flashcards, and quizzes.
          </p>
          <div className="flex justify-center gap-4 flex-col sm:flex-row items-center">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              <span>Get Started Free</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <span className="text-sm text-slate-500">No credit card required · Free forever with BYOK</span>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ====================================
          PRICING
          ==================================== */}
      <section id="pricing" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="section-badge mb-4 inline-flex">💰 Pricing</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Bring your own API keys and use NoteGenius completely free. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div
              className="pricing-card opacity-0 translate-y-8 transition-all duration-700"
              data-animate="true"
            >
              <div className="text-sm font-semibold text-violet-400 mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-slate-500 text-sm">/forever</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">Bring your own API keys and get full access.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited recordings',
                  'BYOK — your OpenAI/Gemini key',
                  'All note generation features',
                  'Quizzes & Flashcards',
                  'PDF & Markdown export',
                  'Community support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full py-3 text-center text-sm">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div
              className="pricing-card popular opacity-0 translate-y-8 transition-all duration-700"
              data-animate="true"
              style={{ transitionDelay: '100ms' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-violet-400">Pro</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-500/15 px-2.5 py-1 rounded-full border border-violet-500/20">Most Popular</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-extrabold text-white">$9</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">No API key needed. Premium features included.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'No API key required — we cover it',
                  'Priority AI processing',
                  'Notion & Obsidian sync',
                  'Team collaboration',
                  'Priority email support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-primary w-full py-3 text-center text-sm">
                <span>Start 14-Day Free Trial</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-7xl mx-auto" />

      {/* ====================================
          FAQ SECTION
          ==================================== */}
      <section id="faq" className="py-20 sm:py-28 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-badge mb-4 inline-flex">❓ FAQ</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Everything you need to know about NoteGenius.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaqIndex === idx ? 'active' : ''} opacity-0 translate-y-8 transition-all duration-700`}
                data-animate="true"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="faq-header" onClick={() => toggleFaq(idx)}>
                  <span className="text-sm sm:text-base font-medium text-white">{faq.q}</span>
                  <span className="faq-icon text-violet-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </div>
                <div className="faq-content">
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================
          FOOTER
          ==================================== */}
      <footer className="border-t border-white/5 relative z-10 bg-[#050510]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <span className="text-xl font-bold gradient-text-primary">NoteGenius</span>
              </Link>
              <p className="text-sm text-slate-500 leading-relaxed mb-4 max-w-xs">
                AI-powered study platform that transforms audio into intelligent notes, flashcards, and quizzes.
              </p>
              <div className="flex gap-3">
                {['Twitter', 'GitHub', 'Discord'].map((social) => (
                  <a key={social} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-violet-400 hover:border-violet-500/20 transition-all text-xs font-bold">
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5">
                {['Features', 'Pricing', 'Changelog', 'Documentation'].map((link) => (
                  <li key={link}><a href="#" className="footer-link">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                  <li key={link}><a href="#" className="footer-link">{link}</a></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'].map((link) => (
                  <li key={link}><a href="#" className="footer-link">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} NoteGenius AI. Built with ❤️ and AI.
            </p>
            <p className="text-xs text-slate-600">
              Designed for students who want to learn smarter, not harder.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
