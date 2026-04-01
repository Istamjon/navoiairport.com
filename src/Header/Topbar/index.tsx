'use client'
import React, { useEffect, useState } from 'react'
import {
  Mail,
  PhoneCall,
  Wind,
  Thermometer,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

// ─── Real-time Toshkent clock ─────────────────────────────────────────────────

const Clock: React.FC = () => {
  const [time, setTime] = useState('')

  useEffect(() => {
    const fmt = () =>
      setTime(
        new Intl.DateTimeFormat('uz-UZ', {
          timeZone: 'Asia/Tashkent',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      )
    fmt()
    const id = setInterval(fmt, 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null
  return (
    <span className="tabular-nums text-blue-300 text-sm font-mono tracking-wide hidden xl:inline">
      {time}
    </span>
  )
}

// ─── Social icons with brand colors ──────────────────────────────────────────

const socials = [
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    color: 'hover:text-[#FF0000]',
    icon: (
      // YouTube SVG path
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    color: 'hover:text-[#E1306C]',
    icon: (
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    color: 'hover:text-[#1877F2]',
    icon: (
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Telegram',
    href: 'https://t.me',
    color: 'hover:text-[#229ED9]',
    icon: (
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0zm3.882 8.027L13.5 16.5c-.1.363-.5.5-.763.3l-2.137-1.65-1.025 1a.368.368 0 0 1-.56-.037l.227-2.412 4.462-4.025c.2-.175-.037-.275-.3-.1L5.9 13.5l-2.212-.687c-.475-.15-.488-.463.1-.688l8.65-3.337c.4-.15.762.1.644.737-.012 0-.012 0 0 0z" />
      </svg>
    ),
  },
]

// ─── Weather ──────────────────────────────────────────────────────────────────

interface WeatherData {
  temp: number
  description: string
  windSpeed: number
  icon: string
}

function getWeatherIcon(icon: string) {
  if (icon.startsWith('01')) return <Sun className="size-3.5 text-yellow-400" />
  if (icon.startsWith('09') || icon.startsWith('10'))
    return <CloudRain className="size-3.5 text-blue-300" />
  if (icon.startsWith('13')) return <CloudSnow className="size-3.5 text-blue-200" />
  return <Cloud className="size-3.5 text-blue-300" />
}

const WeatherInline: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    const fetchWeather = async () => {
      try {
        if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
          // Use fallback data if no valid API key
          setWeather({ temp: 22, description: 'Qisman bulutli', windSpeed: 4, icon: '02d' })
          return
        }
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=40.0998&lon=65.3792&appid=${API_KEY}&units=metric&lang=uz`,
        )
        if (!res.ok) throw new Error('bad response')
        const data = await res.json()
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          windSpeed: Math.round(data.wind.speed),
          icon: data.weather[0].icon,
        })
      } catch {
        setWeather({ temp: 22, description: 'Qisman bulutli', windSpeed: 4, icon: '02d' })
      }
    }
    fetchWeather()
    const id = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  if (!weather)
    return (
      <span className="flex items-center gap-1 text-blue-300 animate-pulse">
        <Thermometer className="size-3.5" />
        <span className="text-sm">...</span>
      </span>
    )

  return (
    <span
      className="flex items-center gap-1.5 text-blue-300 text-sm"
      title={`Navoiy: ${weather.description}`}
    >
      {getWeatherIcon(weather.icon)}
      <span className="font-semibold text-blue-300 ">{weather.temp}°</span>

      <span className="hidden lg:flex items-center gap-1 text-blue-300">
        <Wind className="size-3" />
        {weather.windSpeed}m/s
      </span>
    </span>
  )
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check localStorage and system preference on mount
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = stored || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="text-blue-300 hover:text-white transition-colors duration-200"
    >
      {theme === 'light' ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
    </button>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

interface TopbarProps {
  hidden: boolean
}

export const Topbar: React.FC<TopbarProps> = ({ hidden }) => {
  return (
    <div
      className={cn(
        'w-full bg-primary border-b border-blue-300 ',
        'transition-all duration-300 ease-in-out overflow-hidden',
        hidden ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100',
      )}
      aria-hidden={hidden}
    >
      <div className="container mx-auto flex items-center justify-between h-10 px-4 gap-3">
        {/* LEFT: weather + contacts */}
        <div className="flex items-center gap-3 min-w-0">
          <WeatherInline />

          <span aria-hidden="true" className="h-3 w-px bg-blue-300 shrink-0" />

          <a
            href="mailto:info@navoiairport.uz"
            className="hidden md:flex items-center gap-1.5 text-sm text-blue-300 hover:text-blue-300 transition-colors"
          >
            <Mail className="size-3 shrink-0" />
            <span>info@navoiairport.uz</span>
          </a>
          <span aria-hidden="true" className="h-3 w-px bg-blue-300 shrink-0" />
          <a
            href="tel:+998795393862"
            className="flex items-center gap-1.5 text-sm text-blue-300 hover:text-blue-300 transition-colors"
          >
            <PhoneCall className="size-3 shrink-0" />
            <span className="hidden sm:inline">+998 79 539‑38‑62</span>
            <span className="sm:hidden">Qo&apos;ng&apos;iroq</span>
          </a>
          <span aria-hidden="true" className="h-3 w-px bg-blue-300 shrink-0" />
          <a
            href="tel:+998795393876"
            className="hidden xl:flex items-center gap-1.5 text-sm text-blue-300 hover:text-blue-300 transition-colors"
          >
            <PhoneCall className="size-3 shrink-0" />
            <span>+998 79 539‑38‑76</span>
          </a>
        </div>

        {/* RIGHT: clock + socials */}
        <div className="flex items-center gap-3 shrink-0">
          <Clock />
          <span aria-hidden="true" className="h-3 w-px bg-white hidden xl:block" />

          <nav className="flex items-center gap-2.5" aria-label="Social media links">
            {socials.map(({ label, href, color, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn('text-blue-300 transition-colors duration-200', color)}
              >
                {icon}
              </a>
            ))}
          </nav>

          <span aria-hidden="true" className="h-3 w-px bg-blue-300 shrink-0" />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
