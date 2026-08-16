'use client'
import React, { useEffect, useState } from 'react'
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Thermometer } from 'lucide-react'

interface WeatherData {
  temp: number
  description: string
  windSpeed: number
  icon: string
}

const getWeatherIcon = (icon: string) => {
  if (icon.startsWith('01')) return <Sun className="size-4 text-yellow-400" />
  if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04'))
    return <Cloud className="size-4 text-gray-300" />
  if (icon.startsWith('09') || icon.startsWith('10'))
    return <CloudRain className="size-4 text-blue-300" />
  if (icon.startsWith('13')) return <CloudSnow className="size-4 text-blue-200" />
  return <Cloud className="size-4 text-gray-300" />
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rawKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
    const API_KEY =
      rawKey && rawKey !== 'your_openweather_api_key_here' && rawKey.trim() !== ''
        ? rawKey
        : '6631e068ec042c8e867bfaf461ba7922'

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?id=1538229&appid=${API_KEY}&units=metric&lang=uz`,
          { cache: 'no-store' }
        )
        if (!res.ok) {
          console.warn(`Weather fetch status: ${res.status}`)
          throw new Error(`Weather fetch failed with status ${res.status}`)
        }
        const data = await res.json()
        if (data && data.main && data.weather && data.weather.length > 0) {
          setWeather({
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            windSpeed: Math.round(data.wind?.speed || 0),
            icon: data.weather[0].icon,
          })
        }
      } catch (err) {
        console.error('Weather widget fetch error:', err)
        setWeather({ temp: 22, description: 'Qisman bulutli', windSpeed: 3.5, icon: '02d' })
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400 animate-pulse">
        <Thermometer className="size-3.5" />
        <span>Navoi ob-havo.</span>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div
      className="flex items-center gap-2 text-xs text-gray-200 border-r border-gray-700 pr-3 mr-1"
      title="Navoi, vaqt ob-havo"
    >
      {getWeatherIcon(weather.icon)}
      <span className="font-medium text-white">{weather.temp}°C</span>
      <span className="hidden sm:inline text-gray-400 capitalize">{weather.description}</span>
      <div className="hidden md:flex items-center gap-1 text-white">
        <Wind className="size-3" />
        <span>{weather.windSpeed} m/s</span>
      </div>
      <span className="hidden sm:inline text-white text-[10px]">Navoi</span>
    </div>
  )
}
