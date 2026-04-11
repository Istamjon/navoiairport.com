'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utilities/ui'
import { getLocaleFromCookie } from '@/components/FlightMap/getLocale'
import {
  Plane,
  Clock,
  MapPin,
  Building2,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Package,
  Users,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

interface FlightsTableBlockProps {
  headline?: string
  title?: string
  subtitle?: string
  departuresLabel?: string
  arrivalsLabel?: string
  tableHeaders?: {
    time?: string
    destination?: string
    flight?: string
    airline?: string
    terminal?: string
    gate?: string
    status?: string
  }
  airportIata?: string
  refreshInterval?: number
  locale?: 'uz' | 'en' | 'ru' | 'zh'
}

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & FlightsTableBlockProps

// ─────────────────────────────────────────────
// FR24 Web API Response Type
// (matches the format returned by /api/flights route directly from the FR24 Website API)
// ─────────────────────────────────────────────
interface FR24WebFlight {
  fr24_id: string
  flight: string | null            // e.g. "HY101"
  callsign: string | null
  painted_as: string | null        // ICAO
  type: string | null              // Aircraft code
  reg: string | null
  
  orig_iata: string | null
  orig_icao: string | null
  orig_name: string | null
  
  dest_iata: string | null
  dest_icao: string | null
  dest_name: string | null
  
  scheduled_departure: number | null // Unix timestamp in seconds
  scheduled_arrival: number | null
  actual_departure: number | null 
  actual_arrival: number | null
  
  airline_name: string | null
  airline_iata: string | null
  
  status_text: string | null
  status_color: string | null
  
  terminal: string | null
  gate: string | null
  baggage: string | null
  
  source: string
}

// ─────────────────────────────────────────────
// Normalized internal flight type
// ─────────────────────────────────────────────
interface Flight {
  id: string
  time: string
  scheduledTime: string
  destination: string
  destinationCity?: string
  origin?: string
  originCity?: string
  flight: string
  airline: string
  airlineName?: string
  terminal: string
  gate: string
  baggage?: string
  status: 'on-time' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'arrived' | 'scheduled' | 'diverted'
  delay?: number
  timestamp: number
  isTomorrow: boolean
  isYesterday: boolean
  aircraftType?: string
  registration?: string
  isCargo?: boolean
  isLive?: boolean
}

// ─────────────────────────────────────────────
// Reference data
// ─────────────────────────────────────────────
const AIRLINE_NAMES: Record<string, string> = {
  HY: "O'zbekiston Havo Yo'llari",
  HYH: "O'zbekiston Havo Yo'llari",
  SU: 'Aeroflot',
  AFL: 'Aeroflot',
  S7: 'S7 Airlines',
  SBI: 'S7 Airlines',
  FV: 'Rossiya Airlines',
  SDM: 'Rossiya Airlines',
  TK: 'Turkish Airlines',
  THY: 'Turkish Airlines',
  PC: 'Pegasus Airlines',
  PGT: 'Pegasus Airlines',
  EK: 'Emirates',
  UAE: 'Emirates',
  FZ: 'flydubai',
  FDB: 'flydubai',
  EY: 'Etihad Airways',
  ETD: 'Etihad Airways',
  QR: 'Qatar Airways',
  QTR: 'Qatar Airways',
  SV: 'Saudia',
  SVA: 'Saudia',
  CA: 'Air China',
  CCA: 'Air China',
  CZ: 'China Southern',
  CSN: 'China Southern',
  MU: 'China Eastern',
  CES: 'China Eastern',
  KE: 'Korean Air',
  KAL: 'Korean Air',
  OZ: 'Asiana Airlines',
  AAR: 'Asiana Airlines',
  AI: 'Air India',
  AIC: 'Air India',
  '6E': 'IndiGo',
  IGO: 'IndiGo',
  LH: 'Lufthansa',
  DLH: 'Lufthansa',
  AF: 'Air France',
  AFR: 'Air France',
  BA: 'British Airways',
  BAW: 'British Airways',
  KL: 'KLM',
  KLM: 'KLM Royal Dutch',
  FX: 'FedEx',
  FDX: 'FedEx',
  '5X': 'UPS Airlines',
  UPS: 'UPS Airlines',
  W6: 'Wizz Air',
  WZZ: 'Wizz Air',
  FR: 'Ryanair',
  RYR: 'Ryanair',
  '9W': 'Jet Airways',
  JAI: 'Jet Airways',
  WY: 'Oman Air',
  OMA: 'Oman Air',
  GF: 'Gulf Air',
  GFA: 'Gulf Air',
}

const AIRPORT_CITIES: Record<string, string> = {
  // Uzbekistan
  NVI: 'Navoiy',
  TAS: 'Toshkent',
  SKD: 'Samarqand',
  BHK: 'Buxoro',
  UGC: 'Urganch',
  FEG: "Farg'ona",
  TMJ: 'Termiz',
  AZN: 'Andijon',
  NCU: 'Nukus',
  KSQ: 'Qarshi',
  // Russia
  SVO: 'Moskva (Sheremetyevo)',
  DME: 'Moskva (Domodedovo)',
  VKO: 'Moskva (Vnukovo)',
  LED: 'Sankt-Peterburg',
  KZN: 'Kazan',
  UFA: 'Ufa',
  KRR: 'Krasnodar',
  // Turkey
  IST: 'Istanbul',
  SAW: 'Istanbul (Sabiha)',
  AYT: 'Antalya',
  ESB: 'Ankara',
  ADB: 'Izmir',
  // UAE
  DXB: 'Dubai',
  DWC: 'Dubai (Al Maktoum)',
  AUH: 'Abu Dabi',
  SHJ: 'Sharjah',
  // Qatar
  DOH: 'Doha',
  // Saudi Arabia
  JED: 'Jeddah',
  RUH: 'Riyadh',
  DMM: 'Dammam',
  // China
  PEK: 'Beijing (Capital)',
  PKX: 'Beijing (Daxing)',
  PVG: 'Shanghai (Pudong)',
  SHA: "Shanghai (Hongqiao)",
  CAN: 'Guangzhou',
  CTU: 'Chengdu',
  XIY: "Xi'an",
  URC: 'Urumqi',
  // Korea
  ICN: 'Seul (Incheon)',
  GMP: 'Seul (Gimpo)',
  PUS: 'Busan',
  // India
  DEL: 'Dehli',
  BOM: 'Mumbay',
  BLR: 'Bengaluru',
  HYD: 'Haydarobod',
  // Europe
  FRA: 'Frankfurt',
  MUC: 'Myunxen',
  CDG: 'Parij (CDG)',
  LHR: 'London (Heathrow)',
  AMS: 'Amsterdam',
  FCO: 'Rim',
  MAD: 'Madrid',
  BCN: 'Barselona',
  // Cargo hubs
  CGN: 'Cologne (Cargo)',
  ATL: 'Atlanta',
  ORD: 'Chikago',
  LAX: 'Los-Anjeles',
  JFK: 'Nyu-York (JFK)',
}

const CARGO_AIRLINES_ICAO = new Set([
  'FDX', 'UPS', 'CLX', 'DHK', 'CKS', 'NCA', 'MSR', 'MAS', 'GTI', 'POC', 'KMF', 'NKS', 'ATN',
])

const CARGO_AIRLINES_IATA = new Set([
  'FX', '5X', 'CV', 'D0', 'CK', 'KZ', 'QY', 'M6', 'M4',
])

function isCargoAirline(iata?: string, icao?: string): boolean {
  if (iata && CARGO_AIRLINES_IATA.has(iata)) return true
  if (icao && CARGO_AIRLINES_ICAO.has(icao)) return true
  return false
}

function parseFR24StatusText(statusText?: string | null, color?: string | null): Flight['status'] {
  if (!statusText) return 'scheduled'
  const s = statusText.toLowerCase()
  
  if (s.includes('cancel')) return 'cancelled'
  if (s.includes('divert')) return 'diverted'
  if (s.includes('land') || s.includes('arrived') || s.includes('qo\'ndi')) return 'arrived'
  if (s.includes('board') || s.includes('posadka')) return 'boarding'
  if (s.includes('depart') || s.includes('airborne') || s.includes('en route') || s.includes('uchdi')) return 'departed'
  if (s.includes('delay') || s.includes('kechik')) return 'delayed'
  if (s.includes('estimated') || s.includes('on time') || color === 'green') return 'on-time'
  
  return 'scheduled'
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return '--:--'
  try {
    const d = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'))
    if (isNaN(d.getTime())) return '--:--'
    return d.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tashkent',
    })
  } catch {
    return '--:--'
  }
}

function parseUnixTime(ts?: number | null): string | undefined {
  if (!ts) return undefined;
  return new Date(ts * 1000).toISOString();
}

// Utility to get today date at midnight
function getMidnightStr(date: Date) {
  return new Date(date).setHours(0, 0, 0, 0);
}

function mapFR24WebFlight(flight: FR24WebFlight, isDeparture: boolean): Flight {
  const airlineIcao = flight.painted_as || ''
  const airlineIata = flight.airline_iata || ''
  
  // Best attempt at obtaining the correct IATA/ICAO string:
  let flightIataCode = airlineIata;
  if (!flightIataCode && flight.flight) {
    // Some flight strings combine code and digits, e.g. "S73200". We extract the first 2-3 alphanumeric chars.
    const match = flight.flight.match(/^[A-Z0-9]{2,3}(?=\d|\s|$)/i);
    if (match) {
      flightIataCode = match[0].toUpperCase();
    } else {
      flightIataCode = flight.flight.replace(/[0-9\s]/g, '').trim().substring(0, 3);
    }
  }

  const destination = isDeparture ? (flight.dest_iata || '') : (flight.orig_iata || '')
  const destCity = isDeparture ? (flight.dest_name || AIRPORT_CITIES[destination] || '') : (flight.orig_name || AIRPORT_CITIES[destination] || '')

  const schedUnix = isDeparture ? flight.scheduled_departure : flight.scheduled_arrival
  const actualUnix = isDeparture ? flight.actual_departure : flight.actual_arrival

  const timeUnix = actualUnix || schedUnix || 0
  const displayTime = formatTime(parseUnixTime(timeUnix))
  const schedTime = formatTime(parseUnixTime(schedUnix))
  
  // Calculate if flight is tomorrow or yesterday
  const now = new Date()
  const flightDate = new Date(timeUnix * 1000)
  
  const todayAtMidnight = getMidnightStr(now)
  const flightAtMidnight = getMidnightStr(flightDate)
  
  const isTomorrow = flightAtMidnight > todayAtMidnight
  const isYesterday = flightAtMidnight < todayAtMidnight

  const derivedStatus = parseFR24StatusText(flight.status_text, flight.status_color)
  const isLive = derivedStatus === 'boarding' || derivedStatus === 'departed' || flight.status_color === 'green'

  const isCargo = isCargoAirline(flightIataCode, airlineIcao)

  return {
    id: flight.fr24_id || flight.flight || `${flight.orig_iata}-${flight.dest_iata}-${schedUnix}`,
    time: displayTime,
    scheduledTime: schedTime,
    timestamp: timeUnix,
    isTomorrow,
    isYesterday,
    destination,
    destinationCity: destCity,
    origin: flight.orig_iata || undefined,
    originCity: flight.orig_name || AIRPORT_CITIES[flight.orig_iata || ''] || '',
    flight: flight.flight || flight.callsign || '',
    airline: flightIataCode || airlineIcao,
    airlineName: flight.airline_name || AIRLINE_NAMES[flightIataCode] || AIRLINE_NAMES[airlineIcao] || '',
    terminal: flight.terminal || '-',
    gate: flight.gate || '-',
    baggage: flight.baggage || undefined,
    status: derivedStatus,
    delay: undefined, // internal Web API rarely expresses exact integer delays here
    aircraftType: flight.type || undefined,
    registration: flight.reg || undefined,
    isCargo: isCargo ?? false,
    isLive,
  }
}

// ─────────────────────────────────────────────
// Translations & Status Maps
// ─────────────────────────────────────────────
type LocaleCode = 'uz' | 'en' | 'ru' | 'zh'

const DICT: Record<LocaleCode, any> = {
  uz: {
    'on-time': "O'z vaqtida",
    scheduled: 'Rejalashtirilgan',
    boarding: 'Posadka',
    delayed: 'Kechikish',
    cancelled: 'Bekor qilindi',
    departed: 'Uchdi',
    arrived: "Qo'ndi",
    diverted: "Yo'naltirildi",
    live: 'JONLI',
    tomorrow: 'Ertaga',
    yesterday: 'Kecha',
    updated: 'Yangilandi: ',
    refreshing: 'Yangilanmoqda...',
    unknown_error: "Noma'lum xatolik",
    mins: 'daqiqa',
    footer_flights: 'parvoz',
    footer_data: "ma'lumotlari",
  },
  ru: {
    'on-time': 'Вовремя',
    scheduled: 'По расписанию',
    boarding: 'Посадка',
    delayed: 'Задерживается',
    cancelled: 'Отменен',
    departed: 'Вылетел',
    arrived: 'Прибыл',
    diverted: 'Перенаправлен',
    live: 'ОНЛАЙН',
    tomorrow: 'Завтра',
    yesterday: 'Вчера',
    updated: 'Обновлено: ',
    refreshing: 'Обновление...',
    unknown_error: 'Неизвестная ошибка',
    mins: 'минут',
    footer_flights: 'рейса',
    footer_data: 'данные',
  },
  en: {
    'on-time': 'On-time',
    scheduled: 'Scheduled',
    boarding: 'Boarding',
    delayed: 'Delayed',
    cancelled: 'Cancelled',
    departed: 'Departed',
    arrived: 'Arrived',
    diverted: 'Diverted',
    live: 'LIVE',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    updated: 'Updated: ',
    refreshing: 'Refreshing...',
    unknown_error: 'Unknown error',
    mins: 'mins',
    footer_flights: 'flights',
    footer_data: 'data',
  },
  zh: {
    'on-time': '准点',
    scheduled: '计划',
    boarding: '登机',
    delayed: '延误',
    cancelled: '取消',
    departed: '起飞',
    arrived: '到达',
    diverted: '备降',
    live: '实时',
    tomorrow: '明天',
    yesterday: '昨天',
    updated: '更新于: ',
    refreshing: '刷新中...',
    unknown_error: '未知错误',
    mins: '分钟',
    footer_flights: '航班',
    footer_data: '数据',
  },
}

const getStatusConfig = (locale: LocaleCode) => ({
  'on-time': {
    icon: <CheckCircle2 className="size-4 text-emerald-500" />,
    text: DICT[locale]['on-time'],
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  scheduled: {
    icon: <Clock className="size-4 text-sky-400" />,
    text: DICT[locale]['scheduled'],
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
  },
  boarding: {
    icon: <DoorOpen className="size-4 text-violet-500" />,
    text: DICT[locale]['boarding'],
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  delayed: {
    icon: <AlertCircle className="size-4 text-amber-500" />,
    text: DICT[locale]['delayed'],
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  cancelled: {
    icon: <XCircle className="size-4 text-rose-500" />,
    text: DICT[locale]['cancelled'],
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  departed: {
    icon: <Plane className="size-4 text-slate-400" />,
    text: DICT[locale]['departed'],
    color: 'text-slate-400',
    bg: 'bg-slate-400/10 border-slate-400/20',
  },
  arrived: {
    icon: <CheckCircle2 className="size-4 text-teal-500" />,
    text: DICT[locale]['arrived'],
    color: 'text-teal-500',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
  diverted: {
    icon: <AlertCircle className="size-4 text-orange-500" />,
    text: DICT[locale]['diverted'],
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
})

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function StatusBadge({ status, delay, locale }: { status: Flight['status']; delay?: number; locale: LocaleCode }) {
  const configs = getStatusConfig(locale)
  const cfg = configs[status] || configs['scheduled']
  const lang = DICT[locale]
  return (
    <div className="flex flex-col gap-1">
      <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold', cfg.bg)}>
        {cfg.icon}
        <span className={cfg.color}>{cfg.text}</span>
      </div>
      {delay && delay > 0 && (
        <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
          <Clock className="size-3" />
          <span>+{delay} {lang.mins}</span>
        </div>
      )}
    </div>
  )
}

function LiveBadge({ locale }: { locale: LocaleCode }) {
  const lang = DICT[locale]
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-full text-xs font-bold whitespace-nowrap">
      <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
      {lang.live}
    </span>
  )
}

function AirlineLogo({ airline, isCargo }: { airline: string; isCargo?: boolean }) {
  const [imageError, setImageError] = useState(false)

  // Airline IATA (2) or ICAO (3) code length sanity check
  const isValidCode = airline && airline.length >= 2

  if (isCargo) {
    if (!isValidCode || imageError) {
      return (
        <div className="w-20 h-10 flex items-center justify-center shrink-0">
          <Package className="size-6 text-amber-500 opacity-80" />
        </div>
      )
    }
  } else {
    if (!isValidCode || imageError) {
      return (
        <div className="w-20 h-10 flex items-center justify-center shrink-0">
          <Users className="size-6 text-sky-400 opacity-80" />
        </div>
      )
    }
  }

  return (
    <div className="w-[110px] h-[40px] flex items-center justify-center bg-white rounded-md px-1 flex-shrink-0 border border-border/20">
      <img
        src={`https://pics.avs.io/250/80/${airline}.png`}
        className="w-full h-full object-contain"
        alt={airline}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export const FlightsTableBlock: React.FC<Props> = ({
  className,
  headline,
  title,
  subtitle,
  departuresLabel = 'Uchish',
  arrivalsLabel = "Qo'nish",
  tableHeaders,
  airportIata = 'NVI',
  refreshInterval = 120,
  locale = 'uz',
}) => {
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>(locale as LocaleCode)

  useEffect(() => {
    setCurrentLocale((getLocaleFromCookie() as LocaleCode) || (locale as LocaleCode))
    const interval = setInterval(() => {
      const newLocale = getLocaleFromCookie() as LocaleCode
      if (newLocale && newLocale !== currentLocale) {
        setCurrentLocale(newLocale)
      }
    }, 800)
    return () => clearInterval(interval)
  }, [currentLocale, locale])

  const lang = DICT[currentLocale] || DICT['uz']
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures')
  const [flights, setFlights] = useState<{ departures: Flight[]; arrivals: Flight[] }>({
    departures: [],
    arrivals: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchFlights = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setIsRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        const [depRes, arrRes] = await Promise.all([
          fetch(`/api/flights?type=departures&airport=${airportIata}`),
          fetch(`/api/flights?type=arrivals&airport=${airportIata}`),
        ])

        const [depData, arrData] = await Promise.all([
          depRes.json(),
          arrRes.json(),
        ])

        if (!depRes.ok) throw new Error(depData.error || `Uchish: API xatosi ${depRes.status}`)
        if (!arrRes.ok) throw new Error(arrData.error || `Qo'nish: API xatosi ${arrRes.status}`)

        const depsRaw: FR24WebFlight[] = depData.flights || []
        const arrsRaw: FR24WebFlight[] = arrData.flights || []

        const departures: Flight[] = depsRaw
          .map((f: FR24WebFlight) => mapFR24WebFlight(f, true))
          .sort((a: Flight, b: Flight) => a.timestamp - b.timestamp)

        const arrivals: Flight[] = arrsRaw
          .map((f: FR24WebFlight) => mapFR24WebFlight(f, false))
          .sort((a: Flight, b: Flight) => a.timestamp - b.timestamp)

        setFlights({ departures, arrivals })
        setLastUpdated(new Date())
      } catch (err) {
        console.error('Failed to fetch flights:', err)
        const msg = err instanceof Error ? err.message : lang.unknown_error
        setError(msg)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [airportIata],
  )

  useEffect(() => {
    fetchFlights()
    const interval = setInterval(() => fetchFlights(true), refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [fetchFlights, refreshInterval])

  const currentFlights = activeTab === 'departures' ? flights.departures : flights.arrivals

  const headers = {
    time: tableHeaders?.time || 'Vaqt',
    destination: tableHeaders?.destination || (activeTab === 'departures' ? "Yo'nalish" : 'Qayerdan'),
    flight: tableHeaders?.flight || 'Reys',
    airline: tableHeaders?.airline || 'Aviakompaniya',
    terminal: tableHeaders?.terminal || 'Terminal',
    gate: tableHeaders?.gate || (activeTab === 'arrivals' ? 'Bagaj' : 'Eshik'),
    status: tableHeaders?.status || 'Holat',
  }

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* ── Animated background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${80 + i * 30}px`,
              height: `${80 + i * 30}px`,
              background: `radial-gradient(circle, hsl(var(--primary) / ${0.04 - i * 0.004}), transparent 70%)`,
              filter: 'blur(24px)',
              left: `${(i * 12.5) % 100}%`,
              top: `${(i * 17) % 100}%`,
            }}
            animate={{ y: [0, -80, 0], x: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 18 + i * 2, delay: i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {[...Array(4)].map((_, i) => (
          <motion.svg
            key={`swoosh-${i}`}
            className="absolute"
            style={{ width: '100%', height: '100%', left: 0, top: 0 }}
          >
            <motion.path
              d={`M ${-200 + i * 80} ${200 + i * 120} Q ${600 + i * 100} ${60 + i * 60}, ${1400 + i * 80} ${350 + i * 40}`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              opacity="0.06"
              strokeDasharray="8 16"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.06 }}
              transition={{ pathLength: { duration: 4, delay: i * 0.5, ease: 'easeInOut' }, opacity: { duration: 1, delay: i * 0.5 } }}
            />
          </motion.svg>
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/20 to-background/80" />
      </div>

      <div className="container py-10 lg:py-20 relative px-4 lg:px-0 z-10">
        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            {headline && (
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                {headline}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl">{subtitle}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 items-end"
          >
            {/* Last updated info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {error ? (
                <WifiOff className="size-3.5 text-rose-500" />
              ) : (
                <Wifi className="size-3.5 text-emerald-500" />
              )}
              {lastUpdated && !error && (
                <span>
                  {lang.updated}{lastUpdated.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' })}
                </span>
              )}
              <button
                onClick={() => fetchFlights(true)}
                disabled={isRefreshing || loading}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted/60 transition-colors disabled:opacity-50"
                title={lang.refreshing}
              >
                <RefreshCw className={cn('size-3.5', (isRefreshing || loading) && 'animate-spin')} />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex w-full lg:w-auto items-center gap-1 bg-muted/50 border border-border/50 p-1 rounded-xl">
              {(['departures', 'arrivals'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'relative flex-1 lg:flex-none px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary outline-none',
                    activeTab === tab
                      ? 'text-white'
                      : 'text-foreground/60 hover:text-foreground hover:bg-muted/70',
                  )}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeFlightTab"
                      className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Plane className={cn('size-4', tab === 'arrivals' && 'rotate-180')} />
                    {tab === 'departures' ? departuresLabel : arrivalsLabel}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Table card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full overflow-hidden border border-border/40 rounded-xl"
        >
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-5">
                <div className="relative size-14">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                  <Plane className="absolute inset-0 m-auto size-5 text-primary" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  Parvoz ma&apos;lumotlari yuklanmoqda...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                <div className="size-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <WifiOff className="size-6 text-rose-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Ma&apos;lumot yuklanmadi</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
                <button
                  onClick={() => fetchFlights()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="size-4" />
                  Qayta urinish
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && currentFlights.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                  <Plane className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Parvozlar topilmadi</p>
                  <p className="text-sm text-muted-foreground">
                    Hozirda {activeTab === 'departures' ? 'uchish' : "qo'nish"} rejalashtirilgan
                    parvozlar mavjud emas
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Table */}
          {!loading && !error && currentFlights.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {headers.time}
                      </div>
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {headers.destination}
                      </div>
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Plane className="size-3.5" />
                        {headers.flight}
                      </div>
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        {headers.airline}
                      </div>
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        {headers.status}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {currentFlights.map((flight, index) => (
                      <motion.tr
                        key={flight.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        className="border-b border-border/20 last:border-0 transition-colors duration-150"
                      >
                        {/* Time */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xl text-foreground tabular-nums">
                                {flight.time}
                              </span>
                              {(flight.isTomorrow || flight.isYesterday) && (
                                <span className="text-[10px] bg-orange-500 text-white border border-orange-600 shadow-[0_0_8px_rgba(249,115,22,0.6)] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                                  {flight.isTomorrow ? lang.tomorrow : lang.yesterday}
                                </span>
                              )}
                            </div>
                            {flight.scheduledTime !== flight.time && (
                              <span className="text-xs text-muted-foreground line-through">
                                {flight.scheduledTime}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Destination */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-base text-foreground">
                                {flight.destination}
                              </div>
                              {flight.destinationCity && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {flight.destinationCity}
                                </div>
                              )}
                            </div>
                            {flight.isLive && <LiveBadge locale={currentLocale} />}
                          </div>
                        </td>

                        {/* Flight No. */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-bold text-foreground tracking-wide">
                              {flight.flight}
                            </span>
                            {flight.aircraftType && (
                              <span className="text-xs text-muted-foreground">
                                {flight.aircraftType}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Airline */}
                        <td className="px-5 py-4">
                          <div className="flex items-center">
                            <AirlineLogo airline={flight.airline} isCargo={flight.isCargo} />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-right">
                          <StatusBadge status={flight.status} delay={flight.delay} locale={currentLocale} />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && !error && currentFlights.length > 0 && (
            <div className="md:hidden divide-y divide-border/40">
              <AnimatePresence mode="popLayout">
                {currentFlights.map((flight, index) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="p-4 transition-colors"
                  >
                    {/* Mobile card top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                            {flight.time}
                          </span>
                          {flight.scheduledTime !== flight.time && (
                            <span className="text-sm text-muted-foreground line-through tabular-nums">
                              {flight.scheduledTime}
                            </span>
                          )}
                          {(flight.isTomorrow || flight.isYesterday) && (
                            <span className="text-[10px] bg-orange-500 text-white border border-orange-600 shadow-[0_0_8px_rgba(249,115,22,0.6)] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                              {flight.isTomorrow ? lang.tomorrow : lang.yesterday}
                            </span>
                          )}
                          {flight.isLive && <LiveBadge locale={currentLocale} />}
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {flight.destinationCity || flight.destination}
                        </div>
                        {flight.destinationCity && (
                          <div className="text-sm text-muted-foreground">{flight.destination}</div>
                        )}
                      </div>
                      <div className="ml-3 shrink-0">
                        <StatusBadge status={flight.status} delay={flight.delay} locale={currentLocale} />
                      </div>
                    </div>

                    {/* Mobile card grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">{headers.flight}</div>
                        <div className="font-mono font-semibold text-foreground">{flight.flight}</div>
                        {flight.aircraftType && (
                          <div className="text-xs text-muted-foreground">{flight.aircraftType}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{headers.airline}</div>
                        <div>
                          <AirlineLogo airline={flight.airline} isCargo={flight.isCargo} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Footer - flight count & refresh status */}
          {!loading && !error && (
            <div className="px-5 py-3 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {currentFlights.length} {lang.footer_flights} &middot; FlightRadar24 {lang.footer_data}
              </span>
              {isRefreshing && (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="size-3 animate-spin" />
                  {lang.refreshing}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
