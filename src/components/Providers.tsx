'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SessionProvider } from 'next-auth/react'

type ThemeMode = 'day' | 'night'

type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useThemeMode() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within Providers')
  }
  return context
}

function ThemeToggleButton() {
  const { theme, toggleTheme } = useThemeMode()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}
      className="fixed bottom-4 right-4 z-[60] rounded-full border border-white/10 bg-[var(--surface-1)] px-4 py-3 text-xs font-semibold text-[var(--foreground)] shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-violet-500/30"
    >
      <span className="flex items-center gap-2">
        <span className="text-sm">{theme === 'night' ? '☀' : '☾'}</span>
        <span>{theme === 'night' ? 'Day mode' : 'Night mode'}</span>
      </span>
    </button>
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'night'

    const storedTheme = window.localStorage.getItem('notegenius-theme')
    if (storedTheme === 'day' || storedTheme === 'night') return storedTheme

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('notegenius-theme', theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: setThemeState,
    toggleTheme: () => setThemeState((current) => (current === 'night' ? 'day' : 'night')),
  }), [theme])

  return (
    <SessionProvider>
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    </SessionProvider>
  )
}
