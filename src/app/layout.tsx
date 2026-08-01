import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'NoteGenius AI — Transform Audio into Intelligent Notes',
  description:
    'AI-powered note generation platform. Upload audio, record lectures, and get structured notes, quizzes, flashcards, and AI chat — all powered by advanced AI.',
  keywords: [
    'AI notes',
    'speech to text',
    'lecture notes',
    'study tool',
    'note generation',
    'AI education',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const theme = localStorage.getItem('notegenius-theme'); const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches; document.documentElement.dataset.theme = theme === 'day' || theme === 'night' ? theme : (prefersLight ? 'day' : 'night'); } catch (e) { document.documentElement.dataset.theme = 'night'; } })();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
