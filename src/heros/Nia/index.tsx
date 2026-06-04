'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { PlaneLanding, PlaneTakeoff, Search, Calendar, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── YouTube Video Helper ─────────────────────────────────────────────────────
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null

  // If it's already just an ID (11 characters)
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url
  }

  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// ─── Flight Search Labels Dictionary ──────────────────────────────────────────
const FLIGHT_DICT: Record<string, FlightSearchLabels> = {
  uz: {
    departureTab: 'UCHIB KETISH',
    arrivalTab: "QO'NIB KELISH",
    destinationLabel: 'Qayerga',
    originLabel: 'Qayerdan',
    destinationPlaceholder: 'Shahar yoki aeroport',
    dateLabel: 'Sana',
    searchButton: 'QIDIRISH',
  },
  ru: {
    departureTab: 'ВЫЛЕТ',
    arrivalTab: 'ПРИЛЁТ',
    destinationLabel: 'Куда',
    originLabel: 'Откуда',
    destinationPlaceholder: 'Город или аэропорт',
    dateLabel: 'Дата',
    searchButton: 'ПОИСК',
  },
  en: {
    departureTab: 'DEPARTURE',
    arrivalTab: 'ARRIVAL',
    destinationLabel: 'Where to',
    originLabel: 'Where from',
    destinationPlaceholder: 'City or airport',
    dateLabel: 'Date',
    searchButton: 'SEARCH',
  },
  zh: {
    departureTab: '出发',
    arrivalTab: '到达',
    destinationLabel: '目的地',
    originLabel: '出发地',
    destinationPlaceholder: '城市或机场',
    dateLabel: '日期',
    searchButton: '搜索',
  },
}

const getFlightLabels = (lang: string): FlightSearchLabels => FLIGHT_DICT[lang] || FLIGHT_DICT.uz

// ─── Locale-aware Custom Date Picker ───────────────────────────────────────────
const DATE_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  uz: { day: 'numeric', month: 'long', year: 'numeric' },
  ru: { day: 'numeric', month: 'long', year: 'numeric' },
  en: { day: 'numeric', month: 'long', year: 'numeric' },
  zh: { year: 'numeric', month: 'long', day: 'numeric' },
}

const DATE_PLACEHOLDERS: Record<string, string> = {
  uz: 'Sanani tanlang',
  ru: 'Выберите дату',
  en: 'Select date',
  zh: '选择日期',
}

const WEEKDAY_LABELS: Record<string, string[]> = {
  uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  zh: ['一', '二', '三', '四', '五', '六', '日'],
}

const NAV_LABELS: Record<string, { prev: string; next: string; months: string[] }> = {
  uz: {
    prev: 'Oldingi oy',
    next: 'Keyingi oy',
    months: [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
    ],
  },
  ru: {
    prev: 'Предыдущий месяц',
    next: 'Следующий месяц',
    months: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
  },
  en: {
    prev: 'Previous month',
    next: 'Next month',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
  zh: {
    prev: '上个月',
    next: '下个月',
    months: [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月',
    ],
  },
}

const formatYMD = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseYMD = (s: string): Date | null => {
  if (!s) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return isNaN(d.getTime()) ? null : d
}

const DatePicker: React.FC<{
  lang: string
  date: string
  onChange: (val: string) => void
}> = ({ lang, date, onChange }) => {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const onChangeMq = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', onChangeMq)
    return () => mq.removeEventListener('change', onChangeMq)
  }, [])

  const selected = parseYMD(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const initialView = selected || today
  const [viewYear, setViewYear] = useState(initialView.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialView.getMonth())

  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear())
      setViewMonth(selected.getMonth())
    }
  }, [date])

  // Calculate popover position based on trigger's bounding rect
  useLayoutEffect(() => {
    if (!open || isMobile) {
      setPopoverPos(null)
      return
    }
    const updatePos = () => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setPopoverPos({ top: rect.bottom + 8, left: rect.left })
    }
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open, isMobile])

  useEffect(() => {
    if (!open) return
    if (isMobile) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, isMobile])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const nav = NAV_LABELS[lang] || NAV_LABELS.uz
  const weekdays = WEEKDAY_LABELS[lang] || WEEKDAY_LABELS.uz

  const displayDate = date
    ? new Intl.DateTimeFormat(lang, DATE_FORMATS[lang] || DATE_FORMATS.uz).format(new Date(date + 'T00:00:00'))
    : ''

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }
  const goToday = () => {
    const t = new Date()
    setViewYear(t.getFullYear())
    setViewMonth(t.getMonth())
  }

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d))
    while (cells.length % 7 !== 0) cells.push(null)

  const handleSelect = (d: Date) => {
    onChange(formatYMD(d))
    setOpen(false)
  }

  const isSelected = (d: Date | null) =>
    !!d && !!selected && d.getFullYear() === selected.getFullYear() && d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate()

  const isToday = (d: Date | null) =>
    !!d && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()

  const calendarNode = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={DATE_PLACEHOLDERS[lang] || DATE_PLACEHOLDERS.uz}
      style={
        isMobile
          ? undefined
          : popoverPos
            ? { top: popoverPos.top, left: popoverPos.left }
            : { top: -9999, left: -9999, visibility: 'hidden' }
      }
      className={
        isMobile
          ? 'fixed inset-0 z-[2147483647] bg-white flex flex-col'
          : 'fixed z-[2147483647] bg-white rounded-md shadow-lg border border-gray-200 p-3 w-[18rem]'
      }
    >
      <div className={`flex items-center justify-between ${isMobile ? 'p-3 border-b border-gray-200' : 'mb-2'}`}>
        <button
          type="button"
          onClick={goPrev}
          aria-label={nav.prev}
          className="p-2 sm:p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-700 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
        >
          <svg className="size-5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="text-base sm:text-sm font-semibold text-primary" lang={lang}>
          {nav.months[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={goNext}
          aria-label={nav.next}
          className="p-2 sm:p-1.5 rounded hover:bg-gray-100 active:bg-gray-200 text-gray-700 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
        >
          <svg className="size-5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'px-3' : 'mb-1'}`}>
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="text-center text-[10px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-1"
            lang={lang}
          >
            {wd}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'px-3 pb-3 flex-1 content-start' : ''}`}>
        {cells.map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={!d}
            onClick={() => d && handleSelect(d)}
            className={`
              ${isMobile ? 'h-12 w-12' : 'h-8 w-8'} text-sm rounded-full flex items-center justify-center transition-colors mx-auto
              ${!d ? 'invisible' : ''}
              ${isSelected(d) ? 'bg-primary text-white font-bold' : ''}
              ${!isSelected(d) && isToday(d) ? 'border-2 border-primary text-primary font-semibold' : ''}
              ${!isSelected(d) && !isToday(d) ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200' : ''}
            `}
          >
            {d?.getDate()}
          </button>
        ))}
      </div>

      {isMobile && (
        <div className="border-t border-gray-200 p-3 flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 h-11 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 active:bg-gray-100"
          >
            {lang === 'uz' ? 'Bekor qilish' : lang === 'ru' ? 'Отмена' : lang === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={goToday}
            className="flex-1 h-11 rounded-md border border-primary text-sm font-semibold text-primary active:bg-primary/10"
          >
            {lang === 'uz' ? 'Bugun' : lang === 'ru' ? 'Сегодня' : lang === 'zh' ? '今天' : 'Today'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none z-10" />
      <div
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={DATE_PLACEHOLDERS[lang] || DATE_PLACEHOLDERS.uz}
        lang={lang}
        className={`
          rounded-md w-full h-11 pl-9 pr-3 text-sm flex items-center
          transition-colors cursor-pointer select-none outline-none
          ${displayDate ? 'text-primary' : 'text-gray-400'}
          ${focused || open ? 'border-[#0a1628] ring-1 ring-[#0a1628]' : 'border-gray-400'}
          border bg-white
        `}
      >
        {displayDate || DATE_PLACEHOLDERS[lang] || DATE_PLACEHOLDERS.uz}
      </div>

      {open && mounted && createPortal(calendarNode, document.body)}
    </div>
  )
}

// ─── Flight Search Block ──────────────────────────────────────────────────────
interface FlightSearchLabels {
  departureTab: string
  arrivalTab: string
  destinationLabel: string
  originLabel: string
  destinationPlaceholder: string
  dateLabel: string
  searchButton: string
}

const FlightSearchBlock: React.FC = () => {
  const [tab, setTab] = useState<'departure' | 'arrival'>('departure')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [lang, setLang] = useState('uz')

  useEffect(() => {
    const match = document.cookie.match(/(^| )payload-locale=([^;]+)/)
    if (match?.[2]) setLang(match[2])
  }, [])

  // Mapping city names to IATA codes for booking URL
  const CITY_MAP: Record<string, string> = {
    tashkent: 'TAS',
    toshkent: 'TAS',
    tas: 'TAS',
    moscow: 'VKO',
    moskva: 'VKO',
    vko: 'VKO',
    'st. petersburg': 'LED',
    piter: 'LED',
    led: 'LED',
    navoi: 'NVI',
    navoiy: 'NVI',
    nvi: 'NVI',
  }

  const handleSearch = () => {
    const fromCode = tab === 'departure' ? 'NVI' : CITY_MAP[destination.toLowerCase()] || ''
    const toCode = tab === 'arrival' ? 'NVI' : CITY_MAP[destination.toLowerCase()] || ''

    if (fromCode && toCode) {
      // If we have both codes, we can deep link
      const url = `https://book.uzairways.com/uz/booking/search?from=${fromCode}&to=${toCode}&date=${date}`
      window.open(url, '_blank')
    } else {
      // Fallback to main booking page if mapping fails
      window.open('https://booking.uzairways.com/uz/index.html', '_blank')
    }
  }

  const t = getFlightLabels(lang)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="flex rounded-t-md overflow-hidden mb-0 relative">
        {/* Active tab indicator */}
        <motion.div
          className="absolute bottom-0 h-1 bg-white"
          initial={false}
          animate={{
            left: tab === 'departure' ? '0%' : '50%',
            width: '50%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        <motion.button
          type="button"
          onClick={() => setTab('departure')}
          whileTap={{ y: 1 }}
          className={cn(
            'flex-1 flex items-center justify-start gap-2 px-6 py-3.5 text-sm font-semibold transition-colors duration-300 button-shine',
            tab === 'departure'
              ? 'bg-white/90 text-primary hover:bg-white'
              : 'bg-primary text-white hover:bg-primary/90',
          )}
        >
          <PlaneTakeoff className="size-4" />
          {t.departureTab}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setTab('arrival')}
          whileTap={{ y: 1 }}
          className={cn(
            'flex-1 flex items-center justify-start gap-2 px-5 py-3.5 text-sm font-semibold transition-colors duration-300 button-shine',
            tab === 'arrival'
              ? 'bg-white/90 text-primary hover:bg-white'
              : 'bg-primary text-white hover:bg-primary/90',
          )}
        >
          <PlaneLanding className="size-4" />
          {t.arrivalTab}
        </motion.button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-white/80 backdrop-blur-sm p-5 rounded-b-md flex flex-col sm:flex-row gap-3 items-end"
      >
        {/* Destination / Origin */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full"
        >
          <label className="block text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">
            {tab === 'departure' ? t.destinationLabel : t.originLabel}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <motion.input
              type="text"
              list="destinations"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t.destinationPlaceholder}
              whileFocus={{ borderColor: '#000827' }}
              className="rounded-md w-full h-11 pl-9 pr-3 text-sm text-gray-800 border border-gray-400 focus:border-primary focus:outline-none placeholder:text-gray-400 transition-colors"
            />
            <datalist id="destinations">
              <option value="Toshkent" />
              <option value="Moskva" />
              <option value="St. Petersburg" />
            </datalist>
          </div>
        </motion.div>

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 w-full"
        >
          <label className="block text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">
            {t.dateLabel}
          </label>
          <DatePicker lang={lang} date={date} onChange={setDate} />
        </motion.div>

        {/* Submit */}
        <motion.button
          type="button"
          onClick={handleSearch}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileTap={{ y: 1 }}
          className={cn(
            'h-11 px-6 flex items-center gap-2 text-sm font-bold tracking-wide rounded-md',
            'bg-primary text-white hover:bg-primary/90',
            'transition-all duration-200 whitespace-nowrap shrink-0 button-shine',
          )}
        >
          <Search className="size-4" />
          {t.searchButton}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main NiaHero ─────────────────────────────────────────────────────────────

export const NiaHero: React.FC<{
  media?: MediaType
  richText?: any
  backgroundType?: 'images' | 'video'
  slideshowImages?: MediaType[]
  youtubeVideoUrl?: string | null
}> = ({
  media,
  richText,
  backgroundType = 'images',
  slideshowImages,
  youtubeVideoUrl,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [mounted, setMounted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [firstSlideLoaded, setFirstSlideLoaded] = useState(false)
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Determine background type and content
  const isVideoBackground = backgroundType === 'video' && youtubeVideoUrl
  const videoId = isVideoBackground ? extractYouTubeVideoId(youtubeVideoUrl || '') : null

  // Use slideshow images if available, otherwise fallback to single media
  const images =
    slideshowImages && slideshowImages.length > 0 ? slideshowImages : media ? [media] : []
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    setHeaderTheme('dark')
    // Trigger entrance animation
    const id = setTimeout(() => setMounted(true), 100)
    // Trigger first slide fade-in
    const slideId = setTimeout(() => setFirstSlideLoaded(true), 300)
    return () => {
      clearTimeout(id)
      clearTimeout(slideId)
    }
  }, [setHeaderTheme])

  // Slideshow effect (only for image backgrounds)
  useEffect(() => {
    if (isVideoBackground || !hasMultipleImages) return

    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 10000) // Change slide every 10 seconds to match Ken Burns animation duration

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current)
      }
    }
  }, [isVideoBackground, hasMultipleImages, images.length])

  return (
    <>
      <div
        className="relative flex flex-col items-left justify-center text-white min-h-[65vh]   overflow-hidden"
        data-theme="dark"
      >
        <div className="absolute inset-0 z-0">
          {isVideoBackground && videoId ? (
            // YouTube Video Background
            <>
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <iframe
                  className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title="Background video"
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            // Image Slideshow Background with Framer Motion
            <AnimatePresence initial={false} mode="sync">
              {images.map((img, index) => {
                const isActive = index === currentSlide
                const isSingleImage = images.length === 1

                // Ken Burns variants with framer-motion
                const kenBurnsVariants = [
                  { scale: [1, 1.08], x: [0, 0], y: [0, 0] }, // zoom-in
                  { scale: [1, 1.08], x: [0, -30], y: [0, 0] }, // zoom-pan-right
                  { scale: [1, 1.08], x: [0, 30], y: [0, 0] }, // zoom-pan-left
                  { scale: [1.03, 1.08], x: [0, 0], y: [0, -20] }, // pan-up
                ]
                const kenBurnsAnimation = kenBurnsVariants[index % kenBurnsVariants.length]

                if (!isActive && !isSingleImage) return null

                return (
                  <motion.div
                    key={`slide-${index}`}
                    initial={{ opacity: index === 0 && !firstSlideLoaded ? 0 : isActive ? 0 : 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 2.5, ease: [0.45, 0, 0.55, 1] },
                    }}
                    className="absolute inset-0 z-10"
                    style={{ position: 'absolute' }}
                  >
                    {img && typeof img === 'object' && (
                      <motion.div
                        initial={{
                          scale: kenBurnsAnimation.scale[0],
                          x: kenBurnsAnimation.x[0],
                          y: kenBurnsAnimation.y[0],
                        }}
                        animate={{
                          scale: kenBurnsAnimation.scale[1],
                          x: kenBurnsAnimation.x[1],
                          y: kenBurnsAnimation.y[1],
                        }}
                        transition={{
                          duration: 10,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="relative w-full h-full overflow-hidden"
                      >
                        <Media
                          fill
                          imgClassName="object-cover object-center"
                          priority={index === 0}
                          resource={img}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {/* Overlay Gradients - Above images */}
          <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/40 via-black/30 to-black/70 pointer-events-none" />

          <div
            className="absolute inset-0 z-11 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
            }}
          />
        </div>

        <div className="container relative z-10 flex flex-col items-left text-left gap-8 pt-4 pb-16">
          <div
            className={cn(
              'max-w-4xl transition-all duration-700 bg-black/50 border-l-10 border-white/50  pl-10  py-4   delay-100',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
          >
            {richText ? (
              <RichText
                className="[&_h1]:text-md [&_h1]:md:text-md [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:text-white [&_p]:text-lg [&_p]:text-white/70 [&_p]:mt-4 px-4 lg:px-0 "
                data={richText}
                enableGutter={false}
              />
            ) : (
              <div></div>
            )}
          </div>

          {/* Flight Search */}
          <div
            className={cn(
              'w-full max-w-2xl transition-all px-4 lg:px-0   duration-700 delay-200',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
            )}
          >
            <FlightSearchBlock />
          </div>
        </div>
      </div>
    </>
  )
}
