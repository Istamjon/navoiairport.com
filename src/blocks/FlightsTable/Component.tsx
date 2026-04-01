'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utilities/ui'
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
}

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & FlightsTableBlockProps

interface Flight {
  id: string
  time: string
  destination: string
  destinationCity?: string
  flight: string
  airline: string
  airlineName?: string
  terminal: string
  gate: string
  status: 'on-time' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'scheduled'
  delay?: number
  aircraftType?: string
  isCargo?: boolean
  isLive?: boolean
  progress?: number
}

interface AirlabsScheduleResponse {
  response?: AirlabsFlight[]
  request?: {
    lang: string
    currency: string
    time: number
    id: string
    server: string
    host: string
    pid: number
    key: {
      id: number
      api_key: string
      type: string
      expired: string
      registered: string
      upgraded: string
      limit_by_hour: number
      limit_by_minute: number
      limit_by_month: number
      limit_total: number
    }
    params: Record<string, unknown>
    version: number
    method: string
    client: {
      ip: string
      geo: {
        country_code: string
        country: string
        continent: string
        city: string
        lat: number
        lng: number
        timezone: string
      }
      connection: {
        type: string
        isp_code: number
        isp_name: string
      }
      device: Record<string, unknown>
      agent: Record<string, unknown>
      karma: {
        is_blocked: boolean
        is_crawler: boolean
        is_bot: boolean
        is_friend: boolean
        is_regular: boolean
      }
    }
  }
  terms: string
}

interface AirlabsFlight {
  airline_iata?: string
  airline_icao?: string
  flight_iata?: string
  flight_icao?: string
  flight_number?: string
  dep_iata?: string
  dep_icao?: string
  dep_terminal?: string
  dep_gate?: string
  dep_time?: string
  dep_time_ts?: number
  dep_time_utc?: string
  dep_estimated?: string
  dep_estimated_ts?: number
  dep_estimated_utc?: string
  dep_actual?: string
  dep_actual_ts?: number
  dep_actual_utc?: string
  arr_iata?: string
  arr_icao?: string
  arr_terminal?: string
  arr_gate?: string
  arr_baggage?: string
  arr_time?: string
  arr_time_ts?: number
  arr_time_utc?: string
  arr_estimated?: string
  arr_estimated_ts?: number
  arr_estimated_utc?: string
  arr_actual?: string
  arr_actual_ts?: number
  arr_actual_utc?: string
  status?: string
  duration?: number
  delayed?: number
  dep_delayed?: number
  arr_delayed?: number
  cs_airline_iata?: string
  cs_flight_number?: string
  cs_flight_iata?: string
}

// Common airline names mapping
const AIRLINE_NAMES: Record<string, string> = {
  // Uzbekistan
  HY: 'Uzbekistan Airways',
  UK: 'Uzbekistan Airways',
  // Russia
  SU: 'Aeroflot',
  AFL: 'Aeroflot',
  S7: 'S7 Airlines',
  FV: 'Rossiya Airlines',
  // Turkey
  TK: 'Turkish Airlines',
  THY: 'Turkish Airlines',
  PC: 'Pegasus Airlines',
  // UAE
  EK: 'Emirates',
  UAE: 'Emirates',
  FZ: 'flydubai',
  EY: 'Etihad Airways',
  ETD: 'Etihad Airways',
  // Qatar
  QR: 'Qatar Airways',
  QTR: 'Qatar Airways',
  // Saudi Arabia
  SV: 'Saudia',
  SVA: 'Saudia',
  // China
  CA: 'Air China',
  CCA: 'Air China',
  CZ: 'China Southern',
  CSN: 'China Southern',
  MU: 'China Eastern',
  CES: 'China Eastern',
  // Korea
  KE: 'Korean Air',
  KAL: 'Korean Air',
  OZ: 'Asiana Airlines',
  AAR: 'Asiana Airlines',
  // India
  AI: 'Air India',
  AIC: 'Air India',
  '6E': 'IndiGo',
  IGO: 'IndiGo',
  // Cargo Airlines
  FX: 'FedEx',
  FDX: 'FedEx',
  '5X': 'UPS',
  UPS: 'UPS Airlines',
  CV: 'Cargolux',
  CLX: 'Cargolux',
  D0: 'DHL',
  DHK: 'DHL Aviation',
  // Europe
  LH: 'Lufthansa',
  DLH: 'Lufthansa',
  AF: 'Air France',
  AFR: 'Air France',
  BA: 'British Airways',
  BAW: 'British Airways',
  KL: 'KLM',
  KLM: 'KLM Royal Dutch',
}

// Major airport cities mapping
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
  SVO: 'Moskva',
  DME: 'Moskva',
  VKO: 'Moskva',
  LED: 'Sankt-Peterburg',
  KZN: 'Kazan',
  UFA: 'Ufa',
  KRR: 'Krasnodar',
  // Turkey
  IST: 'Istanbul',
  SAW: 'Istanbul',
  AYT: 'Antalya',
  ESB: 'Ankara',
  ADB: 'Izmir',
  // UAE
  DXB: 'Dubai',
  DWC: 'Dubai',
  AUH: 'Abu Dhabi',
  SHJ: 'Sharjah',
  // Qatar
  DOH: 'Doha',
  // Saudi Arabia
  JED: 'Jeddah',
  RUH: 'Riyadh',
  DMM: 'Dammam',
  // China
  PEK: 'Beijing',
  PKX: 'Beijing',
  PVG: 'Shanghai',
  SHA: 'Shanghai',
  CAN: 'Guangzhou',
  CTU: 'Chengdu',
  XIY: "Xi'an",
  URC: 'Urumqi',
  // Korea
  ICN: 'Seoul',
  GMP: 'Seoul',
  PUS: 'Busan',
  // India
  DEL: 'Delhi',
  BOM: 'Mumbai',
  BLR: 'Bangalore',
  HYD: 'Hyderabad',
  // Europe
  FRA: 'Frankfurt',
  MUC: 'Munich',
  CDG: 'Paris',
  ORY: 'Paris',
  LHR: 'London',
  LGW: 'London',
  AMS: 'Amsterdam',
  FCO: 'Rome',
  MAD: 'Madrid',
  BCN: 'Barcelona',
  // USA
  JFK: 'New York',
  EWR: 'New York',
  LGA: 'New York',
  LAX: 'Los Angeles',
  ORD: 'Chicago',
  DFW: 'Dallas',
  ATL: 'Atlanta',
  MIA: 'Miami',
  SFO: 'San Francisco',
}

// Cargo airline codes
const CARGO_AIRLINES = new Set([
  'FX',
  'FDX', // FedEx
  '5X',
  'UPS', // UPS
  'CV',
  'CLX', // Cargolux
  'D0',
  'DHK', // DHL
  'CK',
  'CKS', // Cargo Jet
  'KZ',
  'NCA', // Nippon Cargo
  'MK',
  'MAA', // Air Mauritius Cargo
  'QY',
  'BCS', // European Air Transport
])

const getStatusIcon = (status: Flight['status']) => {
  switch (status) {
    case 'on-time':
    case 'scheduled':
      return <CheckCircle2 className="size-4 text-green-500" />
    case 'boarding':
      return <DoorOpen className="size-4 text-blue-500" />
    case 'delayed':
      return <AlertCircle className="size-4 text-yellow-500" />
    case 'cancelled':
      return <XCircle className="size-4 text-red-500" />
    case 'departed':
      return <Plane className="size-4 text-gray-500" />
  }
}

const getStatusText = (status: Flight['status']) => {
  switch (status) {
    case 'on-time':
      return 'Vaqtida'
    case 'scheduled':
      return 'Rejalashtirilgan'
    case 'boarding':
      return 'Chiqish'
    case 'delayed':
      return 'Kechikish'
    case 'cancelled':
      return 'Bekor qilindi'
    case 'departed':
      return 'Uchdi'
  }
}

const getStatusColor = (status: Flight['status']) => {
  switch (status) {
    case 'on-time':
    case 'scheduled':
      return 'text-green-500'
    case 'boarding':
      return 'text-blue-500'
    case 'delayed':
      return 'text-yellow-500'
    case 'cancelled':
      return 'text-red-500'
    case 'departed':
      return 'text-gray-500'
  }
}

function formatTime(timeString?: string): string {
  if (!timeString) return '--:--'
  try {
    // Airlabs returns time in format "2021-07-14 19:53"
    const date = new Date(timeString)
    if (isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

function getDisplayTime(flight: AirlabsFlight, isDeparture: boolean): string {
  if (isDeparture) {
    // Priority: actual > estimated > scheduled
    return formatTime(flight.dep_actual || flight.dep_estimated || flight.dep_time)
  } else {
    return formatTime(flight.arr_actual || flight.arr_estimated || flight.arr_time)
  }
}

function mapAirlabsStatus(status: string): Flight['status'] {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('cancel')) return 'cancelled'
  if (statusLower.includes('delay')) return 'delayed'
  if (statusLower.includes('board')) return 'boarding'
  if (statusLower.includes('departed') || statusLower.includes('airborne')) return 'departed'
  if (statusLower.includes('scheduled')) return 'scheduled'
  return 'on-time'
}

export const FlightsTableBlock: React.FC<Props> = ({
  className,
  headline,
  title,
  subtitle,
  departuresLabel = 'Uchish',
  arrivalsLabel = "Qo'nish",
  tableHeaders,
  airportIata = 'NVI',
  refreshInterval = 60,
}) => {
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures')
  const [flights, setFlights] = useState<{ departures: Flight[]; arrivals: Flight[] }>({
    departures: [],
    arrivals: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true)
      setError(null)

      try {
        const API_KEY =
          process.env.NEXT_PUBLIC_AIRLABS_API_KEY || '074fa8d7-b846-40f7-afd3-7ab1eb4eb330'

        // Fetch departures with limit parameter
        const depRes = await fetch(
          `https://airlabs.co/api/v9/schedules?dep_iata=${airportIata}&limit=10&api_key=${API_KEY}`,
        )

        // Fetch arrivals with limit parameter
        const arrRes = await fetch(
          `https://airlabs.co/api/v9/schedules?arr_iata=${airportIata}&limit=10&api_key=${API_KEY}`,
        )

        if (!depRes.ok || !arrRes.ok) {
          throw new Error('Failed to fetch flight data')
        }

        const depData: AirlabsScheduleResponse = await depRes.json()
        const arrData: AirlabsScheduleResponse = await arrRes.json()

        // Map Airlabs data to our Flight interface
        const mapFlight = (flight: AirlabsFlight, isDeparture: boolean): Flight | null => {
          // Validate required fields
          if (!flight.flight_iata && !flight.flight_icao) return null
          if (!flight.airline_iata && !flight.airline_icao) return null

          const flightId = flight.flight_iata || flight.flight_icao || 'unknown'
          const destination = isDeparture ? flight.arr_iata : flight.dep_iata

          if (!destination) return null

          const airlineCode = flight.airline_iata || flight.airline_icao || ''
          const isCargo = CARGO_AIRLINES.has(airlineCode)
          const status = mapAirlabsStatus(flight.status || 'scheduled')

          // Determine if flight is live (boarding or departed)
          const isLive = status === 'boarding' || status === 'departed'

          // Calculate progress (simple estimation based on status)
          let progress = 0
          if (status === 'scheduled' || status === 'on-time') progress = 0
          else if (status === 'boarding') progress = 25
          else if (status === 'departed') progress = 75
          else if (status === 'delayed') progress = 10

          return {
            id: flightId,
            time: getDisplayTime(flight, isDeparture),
            destination: destination,
            destinationCity: AIRPORT_CITIES[destination],
            flight: flight.flight_iata || flight.flight_icao || '',
            airline: airlineCode,
            airlineName: AIRLINE_NAMES[airlineCode],
            terminal: (isDeparture ? flight.dep_terminal : flight.arr_terminal) || '-',
            gate: (isDeparture ? flight.dep_gate : flight.arr_gate) || '-',
            status: status,
            delay: isDeparture ? flight.dep_delayed : flight.arr_delayed,
            isCargo: isCargo,
            isLive: isLive,
            progress: progress,
          }
        }

        const departures = (depData.response || [])
          .map((f: AirlabsFlight) => mapFlight(f, true))
          .filter((f): f is Flight => f !== null)
          .slice(0, 10)

        const arrivals = (arrData.response || [])
          .map((f: AirlabsFlight) => mapFlight(f, false))
          .filter((f): f is Flight => f !== null)
          .slice(0, 10)

        setFlights({
          departures: departures,
          arrivals: arrivals,
        })
      } catch (err) {
        console.error('Failed to fetch flights:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(`Ma'lumotlarni yuklashda xatolik: ${errorMessage}`)
        setFlights({
          departures: [],
          arrivals: [],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFlights()
    const interval = setInterval(fetchFlights, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [airportIata, refreshInterval])

  // Get current flights
  const currentFlights = React.useMemo(() => {
    // Mock departures data
    const mockDepartures: Flight[] = [
      {
        id: 'HY101',
        time: '08:30',
        destination: 'DXB',
        destinationCity: 'Dubai',
        flight: 'HY 101',
        airline: 'HY',
        airlineName: 'Uzbekistan Airways',
        terminal: 'A',
        gate: '12',
        status: 'on-time',
        isCargo: false,
        isLive: false,
        progress: 0,
      },
      {
        id: 'TK442',
        time: '10:15',
        destination: 'IST',
        destinationCity: 'Istanbul',
        flight: 'TK 442',
        airline: 'TK',
        airlineName: 'Turkish Airlines',
        terminal: 'A',
        gate: '8',
        status: 'boarding',
        delay: 15,
        isCargo: false,
        isLive: true,
        progress: 25,
      },
      {
        id: 'FX5432',
        time: '12:00',
        destination: 'SVO',
        destinationCity: 'Moskva',
        flight: 'FX 5432',
        airline: 'FDX',
        airlineName: 'FedEx',
        terminal: 'B',
        gate: '5',
        status: 'departed',
        isCargo: true,
        isLive: true,
        progress: 75,
      },
    ]

    // Mock arrivals data
    const mockArrivals: Flight[] = [
      {
        id: 'SU1845',
        time: '09:15',
        destination: 'SVO',
        destinationCity: 'Moskva',
        flight: 'SU 1845',
        airline: 'SU',
        airlineName: 'Aeroflot',
        terminal: 'A',
        gate: '5',
        status: 'on-time',
        isCargo: false,
        isLive: false,
        progress: 0,
      },
      {
        id: 'EK4393',
        time: '11:30',
        destination: 'DXB',
        destinationCity: 'Dubai',
        flight: 'EK 4393',
        airline: 'EK',
        airlineName: 'Emirates',
        terminal: 'A',
        gate: '18',
        status: 'boarding',
        isCargo: false,
        isLive: true,
        progress: 25,
      },
      {
        id: 'QR8924',
        time: '13:45',
        destination: 'DOH',
        destinationCity: 'Doha',
        flight: 'QR 8924',
        airline: 'QR',
        airlineName: 'Qatar Airways',
        terminal: 'A',
        gate: '22',
        status: 'delayed',
        delay: 20,
        isCargo: false,
        isLive: false,
        progress: 10,
      },
      {
        id: 'HY102',
        time: '15:20',
        destination: 'TAS',
        destinationCity: 'Toshkent',
        flight: 'HY 102',
        airline: 'HY',
        airlineName: 'Uzbekistan Airways',
        terminal: 'A',
        gate: '10',
        status: 'on-time',
        isCargo: false,
        isLive: false,
        progress: 0,
      },
    ]

    // Return actual flight data based on active tab, or mock data if no real flights
    if (activeTab === 'departures') {
      return flights.departures.length > 0 ? flights.departures : mockDepartures
    } else {
      return flights.arrivals.length > 0 ? flights.arrivals : mockArrivals
    }
  }, [activeTab, flights])

  return (
    <section className={cn('  relative overflow-hidden', className)}>
      {/* Creative Aviation Background - New Design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Orbs with Glow */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              background: `radial-gradient(circle at 30% 30%, hsl(var(--foreground) / ${0.05 - i * 0.003}), transparent 70%)`,
              filter: 'blur(20px)',
              left: `${(i * 8.33) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, 50, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 15 + i * 2,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Dynamic Wave Lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute left-0 right-0"
            style={{
              top: `${15 + i * 18}%`,
              height: '2px',
            }}
          >
            <motion.div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.1), transparent)`,
              }}
              animate={{
                x: ['-100%', '200%'],
                scaleX: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 10 + i * 2,
                delay: i * 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        ))}

        {/* Curved Swoosh Lines */}
        {[...Array(4)].map((_, i) => (
          <motion.svg
            key={`swoosh-${i}`}
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
            }}
          >
            <motion.path
              d={`M ${-200 + i * 100} ${300 + i * 100} Q ${500 + i * 150} ${50 + i * 80}, ${1200 + i * 100} ${400 + i * 50}`}
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              fill="none"
              opacity="0.08"
              strokeDasharray="10 20"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.08 }}
              transition={{
                pathLength: {
                  duration: 3,
                  delay: i * 0.4,
                  ease: 'easeInOut',
                },
                opacity: {
                  duration: 1,
                  delay: i * 0.4,
                },
              }}
            />
          </motion.svg>
        ))}

        {/* Rotating Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border border-foreground/5"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              left: '50%',
              top: '50%',
              marginLeft: `${-(150 + i * 100)}px`,
              marginTop: `${-(150 + i * 100)}px`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 30 + i * 10,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        ))}

        {/* Atmospheric Gradient Layers */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, hsl(var(--foreground) / 0.02), transparent 50%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 80% 70%, hsl(var(--foreground) / 0.015), transparent 50%)',
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 12,
            delay: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Depth Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/30 to-background/80" />
      </div>

      <div className="container py-10  lg:py-30  relative px-4 lg:px-0  z-10">
        {/* Header - Left Aligned */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            {headline && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-sm font-semibold text-primary dark:text-white uppercase tracking-wider mb-3"
              >
                {headline}
              </motion.p>
            )}
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-4xl font-bold text-foreground mb-4"
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg text-muted-foreground max-w-2xl"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>

          {/* Tabs - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex w-full lg:w-auto items-center gap-1 bg-muted/50 p-1 rounded-md"
          >
            <button
              onClick={() => setActiveTab('departures')}
              className={cn(
                'relative flex-1 lg:flex-none px-4 lg:px-6 py-3 lg:py-2.5 rounded-md font-semibold text-sm transition-all duration-300 button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none',
                activeTab === 'departures'
                  ? 'text-white'
                  : 'text-foreground/60 hover:text-foreground hover:bg-primary/10',
              )}
            >
              {activeTab === 'departures' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-md shadow-sm"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Plane className="size-4" />
                {departuresLabel}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('arrivals')}
              className={cn(
                'relative flex-1 lg:flex-none px-4 lg:px-6 py-3 lg:py-2.5 rounded-md font-semibold text-sm transition-all duration-300 button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none',
                activeTab === 'arrivals'
                  ? 'text-white'
                  : 'text-foreground/60 hover:text-foreground hover:bg-primary/10',
              )}
            >
              {activeTab === 'arrivals' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-md shadow-sm"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Plane className="size-4 rotate-180" />
                {arrivalsLabel}
              </span>
            </button>
          </motion.div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground">Ma&apos;lumotlar yuklanmoqda...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <AlertCircle className="size-12 text-red-500" />
                <div>
                  <p className="text-foreground font-semibold mb-2">Xatolik yuz berdi</p>
                  <p className="text-muted-foreground text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && currentFlights.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <Plane className="size-12 text-muted-foreground" />
                <div>
                  <p className="text-foreground font-semibold mb-2">Parvozlar topilmadi</p>
                  <p className="text-muted-foreground text-sm">
                    Hozirda {activeTab === 'departures' ? 'uchish' : 'qo&apos;nish'}{' '}
                    rejalashtirilgan parvozlar yo&apos;q
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Table */}
          {!loading && !error && currentFlights.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/60 to-muted/40 border-b-2 border-primary/20">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-bold text-foreground uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-foreground" />
                        {tableHeaders?.time || 'Время вылета'}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-foreground uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-foreground" />
                        {tableHeaders?.destination || 'Направление'}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-foreground uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <Plane className="size-4 text-foreground" />
                        {tableHeaders?.flight || 'Рейс'}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-foreground uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-foreground" />
                        {tableHeaders?.airline || 'Авиакомпания'}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-bold text-foreground uppercase tracking-wide">
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="size-4 text-foreground" />
                        {tableHeaders?.terminal || 'Терм.'}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-bold text-foreground uppercase tracking-wide">
                      <div className="flex items-center justify-center gap-2">
                        <DoorOpen className="size-4 text-foreground" />
                        {tableHeaders?.gate || 'Выход'}
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold text-foreground uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-foreground" />
                        {tableHeaders?.status || 'Статус'}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {currentFlights.map((flight, index) => (
                      <motion.tr
                        key={flight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-all duration-200 even:bg-muted/30"
                      >
                        <td className="px-6 py-5 text-sm">
                          <span className="font-mono font-bold text-lg text-foreground">
                            {flight.time}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="font-bold text-base text-foreground">
                                {flight.destination}
                              </div>
                              {flight.destinationCity && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {flight.destinationCity}
                                </div>
                              )}
                              {flight.isLive && flight.progress !== undefined && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <MapPin className="size-3 text-foreground/60 shrink-0" />
                                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary transition-all duration-500"
                                      style={{ width: `${flight.progress}%` }}
                                    />
                                  </div>
                                  <Plane className="size-3 text-foreground shrink-0" />
                                </div>
                              )}
                            </div>
                            {flight.isLive && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 rounded-full text-xs font-bold whitespace-nowrap border border-green-500/30">
                                <span className="size-2 bg-green-500 rounded-full animate-pulse" />
                                JONLI
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <span className="font-mono font-semibold text-foreground">
                            {flight.flight}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center gap-2.5">
                            {flight.isCargo ? (
                              <Package className="size-5 text-orange-500 shrink-0" />
                            ) : (
                              <Users className="size-5 text-blue-500 shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-foreground">
                                {flight.airlineName || flight.airline}
                              </div>
                              {flight.airlineName && (
                                <div className="text-xs text-muted-foreground">
                                  {flight.airline}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-center">
                          <div className="inline-flex items-center justify-center size-10 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <span className="font-bold text-blue-600">{flight.terminal}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-center">
                          <div className="inline-flex items-center justify-center size-10 rounded-md bg-purple-500/10 border border-purple-500/20">
                            <span className="font-bold text-purple-600">{flight.gate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(flight.status)}
                            <div>
                              <div
                                className={cn('font-bold text-sm', getStatusColor(flight.status))}
                              >
                                {getStatusText(flight.status)}
                              </div>
                              {flight.delay && flight.delay > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded-md">
                                  <Clock className="size-3" />+{flight.delay} daqiqa
                                </div>
                              )}
                            </div>
                          </div>
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
            <div className="md:hidden divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {currentFlights.map((flight, index) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 hover:bg-muted/30 transition-colors shine-effect"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-2xl font-mono font-bold text-foreground">
                            {flight.time}
                          </div>
                          {flight.isLive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold">
                              <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                              JONLI
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {flight.destinationCity || flight.destination}
                        </div>
                        {flight.destinationCity && (
                          <div className="text-xs text-muted-foreground">{flight.destination}</div>
                        )}
                        {flight.isLive && flight.progress !== undefined && (
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="size-3 text-muted-foreground shrink-0" />
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${flight.progress}%` }}
                              />
                            </div>
                            <Plane className="size-3 text-primary shrink-0" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(flight.status)}
                        <span
                          className={cn(
                            'text-base sm:text-sm font-bold',
                            getStatusColor(flight.status),
                          )}
                        >
                          {getStatusText(flight.status)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">
                          {tableHeaders?.flight || 'Рейс'}
                        </div>
                        <div className="font-mono font-semibold text-foreground">
                          {flight.flight}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1 flex items-center gap-1">
                          {flight.isCargo ? (
                            <Package className="size-3 text-orange-500" />
                          ) : (
                            <Users className="size-3 text-blue-500" />
                          )}
                          {tableHeaders?.airline || 'Авиакомпания'}
                        </div>
                        <div className="font-medium text-foreground">
                          {flight.airlineName || flight.airline}
                        </div>
                        {flight.airlineName && (
                          <div className="text-xs text-muted-foreground">{flight.airline}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">
                          {tableHeaders?.terminal || 'Терм.'}
                        </div>
                        <div className="font-semibold text-foreground">{flight.terminal}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">
                          {tableHeaders?.gate || 'Выход'}
                        </div>
                        <div className="font-semibold text-foreground">{flight.gate}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
