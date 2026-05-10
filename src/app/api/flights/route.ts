import { NextRequest, NextResponse } from 'next/server'

/**
 * Flight Data API — FlightRadarAPI SDK (real-time radar)
 *
 * `data-cloud.flightradar24.com` endpoint orqali ishlaydi.
 * Bu endpoint Cloudflare tomonidan bloklanmagan — 100% tekin va ishonchli.
 *
 * Yondashuv:
 * 1. NVI aeroport atrofida (150km radius) hozirda radar orqali ko'rinayotgan
 *    barcha parvozlarni oladi
 * 2. Origin/Destination IATA kodlari bo'yicha departures/arrivals ga ajratadi
 * 3. Frontendga FR24WebFlight formatida qaytaradi
 */

// NVI Airport coordinates
const NVI_LAT = 40.1183
const NVI_LON = 65.1708
const RADAR_RADIUS_METERS = 150_000 // 150km radius

// ─── In-memory cache ──────────────────────────────────────────────────────────
interface CachedData {
  departures: any[]
  arrivals: any[]
  timestamp: number
}

let flightsCache: CachedData | null = null
const CACHE_TTL_MS = 30_000 // 30 seconds

const AIRPORT_NAMES: Record<string, string> = {
  NVI: 'Navoiy',
  TAS: 'Toshkent',
  SVO: 'Moskva (Sheremetyevo)',
  DME: 'Moskva (Domodedovo)',
  VKO: 'Moskva (Vnukovo)',
  IST: 'Istanbul',
  SAW: 'Istanbul (Sabiha)',
  DXB: 'Dubai',
  DWC: 'Dubai (Al Maktoum)',
  HGH: 'Hangzhou',
  CGO: 'Zhengzhou',
  ICN: 'Seul (Incheon)',
  PEK: 'Beijing',
  PVG: 'Shanghai',
  FRA: 'Frankfurt',
  AMS: 'Amsterdam',
  CDG: 'Parij',
  DEL: 'Dehli',
  ANC: 'Anchorage',
  ORD: 'Chikago',
  JFK: 'Nyu-York',
  SZX: 'Shenzhen',
  CAN: 'Guangzhou',
  SKD: 'Samarqand',
  BHK: 'Buxoro',
  FEG: "Farg'ona",
  UGC: 'Urganch',
}

const AIRPORT_COORDS: Record<string, { lat: number; lon: number }> = {
  NVI: { lat: 40.1178, lon: 65.1750 },
  TAS: { lat: 41.2579, lon: 69.2812 },
  SVO: { lat: 55.9726, lon: 37.4146 },
  DME: { lat: 55.4088, lon: 37.9063 },
  VKO: { lat: 55.5915, lon: 37.2615 },
  IST: { lat: 41.2753, lon: 28.7519 },
  SAW: { lat: 40.8986, lon: 29.3092 },
  DXB: { lat: 25.2532, lon: 55.3657 },
  DWC: { lat: 24.8961, lon: 55.1713 },
  HGH: { lat: 30.2295, lon: 120.4344 },
  CGO: { lat: 34.5197, lon: 113.8409 },
  ICN: { lat: 37.4602, lon: 126.4407 },
  PEK: { lat: 40.0799, lon: 116.6031 },
  PVG: { lat: 31.1443, lon: 121.8083 },
  FRA: { lat: 50.0379, lon: 8.5622 },
  AMS: { lat: 52.3105, lon: 4.7683 },
  CDG: { lat: 49.0097, lon: 2.5479 },
  DEL: { lat: 28.5562, lon: 77.1000 },
  ANC: { lat: 61.1743, lon: -149.9964 },
  ORD: { lat: 41.9742, lon: -87.9073 },
  JFK: { lat: 40.6413, lon: -73.7781 },
  SZX: { lat: 22.6393, lon: 113.8107 },
  CAN: { lat: 23.3924, lon: 113.2988 },
  SKD: { lat: 39.7005, lon: 66.9847 },
  BHK: { lat: 39.7747, lon: 64.4842 },
  FEG: { lat: 40.3553, lon: 71.7481 },
  UGC: { lat: 41.5842, lon: 60.6403 },
}

// ─── Airline name lookup ──────────────────────────────────────────────────────
const AIRLINE_NAMES: Record<string, string> = {
  HY: "O'zbekiston Havo Yo'llari",
  SU: 'Aeroflot',
  S7: 'S7 Airlines',
  FV: 'Rossiya Airlines',
  TK: 'Turkish Airlines',
  PC: 'Pegasus Airlines',
  EK: 'Emirates',
  FZ: 'flydubai',
  EY: 'Etihad Airways',
  QR: 'Qatar Airways',
  SV: 'Saudia',
  CA: 'Air China',
  CZ: 'China Southern',
  MU: 'China Eastern',
  KE: 'Korean Air',
  AI: 'Air India',
  LH: 'Lufthansa',
  DJ: 'Star East Airlines',
  FX: 'FedEx',
  '5X': 'UPS Airlines',
  '3U': 'Sichuan Airlines',
  XQ: 'SunExpress',
  UT: 'UTair',
}

const CARGO_AIRLINES = new Set([
  'FX', '5X', 'CV', 'D0', 'CK', 'KZ', 'QY', 'M6', 'M4',
  'FDX', 'UPS', 'CLX', 'DHK', 'CKS', 'NCA', 'MSR', 'MAS', 'GTI', 'POC', 'KMF', 'NKS', 'ATN', 'SRR',
])

// ─── Status derivation from radar data ────────────────────────────────────────
function deriveStatus(
  flight: any,
  isDeparture: boolean,
  airportIata: string,
): { status: string; statusColor: string | null } {
  const onGround = flight.onGround === 1
  const altitude = flight.altitude || 0
  const speed = flight.groundSpeed || 0
  const originIata = flight.originAirportIata || ''
  const destIata = flight.destinationAirportIata || ''

  if (isDeparture) {
    // Departure from NVI
    if (onGround && originIata === airportIata && speed < 30) {
      return { status: 'Boarding / Ready', statusColor: 'yellow' }
    }
    if (onGround && originIata === airportIata && speed >= 30) {
      return { status: 'Departing', statusColor: 'green' }
    }
    if (!onGround && altitude > 0) {
      return { status: 'Departed', statusColor: 'green' }
    }
    if (onGround && destIata === flight.destinationAirportIata && originIata !== airportIata) {
      return { status: 'Arrived at destination', statusColor: null }
    }
    return { status: 'En Route', statusColor: 'green' }
  } else {
    // Arrival to NVI
    if (onGround && destIata === airportIata && speed < 30) {
      return { status: 'Landed', statusColor: 'green' }
    }
    if (onGround && destIata === airportIata && speed >= 30) {
      return { status: 'Landing', statusColor: 'green' }
    }
    if (!onGround && altitude < 3000) {
      return { status: 'Approaching', statusColor: 'green' }
    }
    if (!onGround) {
      return { status: 'En Route', statusColor: 'green' }
    }
    return { status: 'Scheduled', statusColor: null }
  }
}

// ─── Fetch flights from FlightRadarAPI ────────────────────────────────────────
async function fetchRadarFlights(airportIata: string): Promise<CachedData> {
  // Check cache
  if (flightsCache && Date.now() - flightsCache.timestamp < CACHE_TTL_MS) {
    return flightsCache
  }

  // Dynamic import for CommonJS module
  const { FlightRadar24API } = await import('flightradarapi')
  const frApi = new FlightRadar24API()

  // Get bounds around the airport
  const bounds = frApi.getBoundsByPoint(NVI_LAT, NVI_LON, RADAR_RADIUS_METERS)

  // Fetch all flights in the area
  const radarFlights = await frApi.getFlights(null, bounds)

  const departures: any[] = []
  const arrivals: any[] = []

  for (const f of radarFlights) {
    const flightNumber = f.number || f.callsign || ''
    const airlineIata = f.airlineIata || flightNumber.slice(0, 2) || ''
    const airlineIcao = f.airlineIcao || ''
    const originIata = f.originAirportIata || ''
    const destIata = f.destinationAirportIata || ''

    const isDeparture = originIata.toUpperCase() === airportIata.toUpperCase()
    const isArrival = destIata.toUpperCase() === airportIata.toUpperCase()

    // Skip flights not related to our airport
    if (!isDeparture && !isArrival) continue

    const { status, statusColor } = deriveStatus(f, isDeparture, airportIata.toUpperCase())
    const isLive = (f.altitude > 0 || f.groundSpeed > 30)
    const isCargo = CARGO_AIRLINES.has(airlineIata) || CARGO_AIRLINES.has(airlineIcao)

    const now = Math.floor(Date.now() / 1000)

    const mapped = {
      fr24_id: f.id || flightNumber,
      flight: flightNumber,
      callsign: f.callsign || null,
      painted_as: airlineIcao || null,
      type: f.aircraftCode || null,
      reg: f.registration || null,

      orig_iata: originIata,
      orig_icao: null,
      orig_name: AIRPORT_NAMES[originIata] || null,
      orig_lat: AIRPORT_COORDS[originIata]?.lat || null,
      orig_lon: AIRPORT_COORDS[originIata]?.lon || null,

      dest_iata: destIata,
      dest_icao: null,
      dest_name: AIRPORT_NAMES[destIata] || null,
      dest_lat: AIRPORT_COORDS[destIata]?.lat || null,
      dest_lon: AIRPORT_COORDS[destIata]?.lon || null,

      // Use current time as estimated, since radar gives live position, not schedule
      scheduled_departure: isDeparture ? now : null,
      scheduled_arrival: isArrival ? now : null,
      actual_departure: isDeparture ? now : null,
      actual_arrival: isArrival && f.onGround === 1 ? now : null,

      airline_name: AIRLINE_NAMES[airlineIata] || null,
      airline_iata: airlineIata,

      status_text: status,
      status_color: statusColor,
      terminal: null,
      gate: null,
      baggage: null,
      delayed: null,

      // Extra radar data
      altitude: f.altitude,
      speed: f.groundSpeed,
      heading: f.heading,
      latitude: f.latitude,
      longitude: f.longitude,
      on_ground: f.onGround === 1,
      is_cargo: isCargo,
      is_live: isLive,

      source: 'flightradarapi',
    }

    if (isDeparture) {
      departures.push(mapped)
    }
    if (isArrival) {
      arrivals.push(mapped)
    }
  }

  const result: CachedData = {
    departures,
    arrivals,
    timestamp: Date.now(),
  }

  flightsCache = result
  return result
}

// ─── Main Route Handler ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'departures') as 'departures' | 'arrivals'
  const airport = searchParams.get('airport') || 'NVI'

  try {
    const data = await fetchRadarFlights(airport)
    const flights = type === 'departures' ? data.departures : data.arrivals

    return NextResponse.json(
      {
        flights,
        count: flights.length,
        source: 'flightradarapi',
        type,
        airport: airport.toUpperCase(),
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
      },
    )
  } catch (err: any) {
    console.error('[Flights] FlightRadarAPI error:', err.message || err)

    return NextResponse.json(
      {
        flights: [],
        count: 0,
        source: 'flightradarapi',
        type,
        airport: airport.toUpperCase(),
        timestamp: new Date().toISOString(),
        error: `Radar ma'lumotlari yuklanmadi: ${err.message || 'Unknown error'}`,
      },
      {
        status: 200, // Return 200 with empty flights instead of 503, so UI shows "no flights" gracefully
        headers: { 'Cache-Control': 'no-cache' },
      },
    )
  }
}
