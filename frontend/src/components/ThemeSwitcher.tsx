import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export const ThemeSwitcher: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(true)

  useEffect(() => {
    const saved = localStorage.getItem('chaiui-theme')
    const darkActive = saved ? saved === 'dark' : document.documentElement.classList.contains('dark')
    setIsDark(darkActive)
    if (darkActive) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('chaiui-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('chaiui-theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle colour theme"
      className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
