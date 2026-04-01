"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { applyTheme, getResolvedTheme, ThemeMode } from "@/lib/theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark")
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setTheme(getResolvedTheme())
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 opacity-0">
        <div className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all duration-300 group"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        <Sun 
            className={`h-5 w-5 transition-all duration-500 absolute ${
                theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100 text-amber-500"
            }`} 
        />
        <Moon 
            className={`h-5 w-5 transition-all duration-500 absolute ${
                theme === "light" ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100 text-primary"
            }`} 
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
