import { NextRequest, NextResponse } from 'next/server'

/**
 * Flight Data API — FlightRadar24 Airport JSON API (Schedule & Status)
 *
 * Bu endpoint orqali aeroportning to'liq jadvali (Bugun va Ertaga) olinadi.
 * Radar ma'lumotlariga qaraganda ancha kengroq (Reys raqami, Status, Aviakompaniya).
 *
 * Muhim texnik eslatma:
 * - Node.js TLS fingerprinti Cloudflare tomonidan bot deb topiladi (403 qaytaradi)
 * - curl.exe/curl ning TLS imzosi Cloudflare qabul qiladi
 * - Shuning uchun so'rovni child_process orqali curl bilan yuboramiz
 * - URL dagi [] belgilari URL-encode qilinmasligi kerak (Cloudflare bot sezgichi)
 */

// ─── In-memory cache ──────────────────────────────────────────────────────────
interface CachedData {
  departures: ReturnType<typeof mapFR24JsonFlight>[]
  arrivals: ReturnType<typeof mapFR24JsonFlight>[]
  timestamp: number
}

const flightsCache: Record<string, CachedData> = {}
const CACHE_TTL_MS = 60_000 // 60 seconds

// ─── FR24 JSON types ──────────────────────────────────────────────────────────
interface FR24AirportInfo {
  code?: { iata?: string; icao?: string }
  name?: string
  position?: { latitude?: number; longitude?: number }
  info?: { terminal?: string | null; gate?: string | null; baggage?: string | null }
}

interface FR24Flight {
  identification?: { row?: number; number?: { default?: string }; callsign?: string | null }
  aircraft?: { model?: { code?: string }; registration?: string }
  airline?: { name?: string; code?: { iata?: string } }
  status?: { text?: string; generic?: { status?: { color?: string } } }
  airport?: { origin?: FR24AirportInfo; destination?: FR24AirportInfo }
  time?: {
    scheduled?: { departure?: number | null; arrival?: number | null }
    real?: { departure?: number | null; arrival?: number | null }
    estimated?: { departure?: number | null; arrival?: number | null }
  }
}

interface FR24ScheduleItem {
  flight?: FR24Flight
}

// ─────────────────────────────────────────────
// Map FR24 JSON to our internal format
// ─────────────────────────────────────────────
function mapFR24JsonFlight(f: FR24ScheduleItem, isDeparture: boolean) {
  const flight = f.flight || {}
  const airport = flight.airport || {}
  const time = flight.time || {}
  const airline = flight.airline || {}
  const status = flight.status || {}

  const origin: FR24AirportInfo = airport.origin || {}
  const destination: FR24AirportInfo = airport.destination || {}

  const scheduledTime = isDeparture ? time.scheduled?.departure : time.scheduled?.arrival

  return {
    fr24_id: flight.identification?.row ?? Math.floor(Math.random() * 1e9),
    flight: flight.identification?.number?.default || 'N/A',
    callsign: flight.identification?.callsign ?? null,
    type: flight.aircraft?.model?.code ?? null,
    reg: flight.aircraft?.registration ?? null,

    orig_iata: origin.code?.iata ?? null,
    orig_name: origin.name ?? null,
    orig_lat: origin.position?.latitude ?? null,
    orig_lon: origin.position?.longitude ?? null,

    dest_iata: destination.code?.iata ?? null,
    dest_name: destination.name ?? null,
    dest_lat: destination.position?.latitude ?? null,
    dest_lon: destination.position?.longitude ?? null,

    scheduled_departure: time.scheduled?.departure ?? null,
    scheduled_arrival: time.scheduled?.arrival ?? null,
    actual_departure: time.real?.departure ?? time.estimated?.departure ?? null,
    actual_arrival: time.real?.arrival ?? time.estimated?.arrival ?? null,

    airline_name: airline.name ?? null,
    airline_iata: airline.code?.iata ?? null,

    status_text: status.text || 'Scheduled',
    status_color: status.generic?.status?.color ?? null,
    terminal: (isDeparture ? origin.info?.terminal : destination.info?.terminal) ?? null,
    gate: (isDeparture ? origin.info?.gate : destination.info?.gate) ?? null,
    baggage: destination.info?.baggage ?? null,

    timestamp: scheduledTime ?? Math.floor(Date.now() / 1000),
    source: 'airport-json-api',
  }
}

// ─── Fetch via curl (bypasses Cloudflare TLS fingerprinting) ──────────────────
async function fetchViaCurl(url: string): Promise<string> {
  const { execFile } = await import('child_process')
  const { promisify } = await import('util')
  const execFileAsync = promisify(execFile)

  // Try 'curl' (Linux/Mac/Docker) then 'curl.exe' (Windows)
  const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl'

  const curlArgs = [
    '-g',             // disable globbing (allows [] in URLs)
    '-s',             // silent — no progress meter
    '--max-time', '15',
    '--compressed',   // accept gzip
    '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    '-H', 'Accept: application/json, text/plain, */*',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-H', 'Referer: https://www.flightradar24.com/',
    '-H', 'Origin: https://www.flightradar24.com',
    url,
  ]

  const { stdout } = await execFileAsync(curlBin, curlArgs, { maxBuffer: 10 * 1024 * 1024 })
  return stdout
}

// ─── Fetch flights from FlightRadar24 API ─────────────────────────────────────
async function fetchAirportSchedules(airportIata: string): Promise<CachedData> {
  const airport = airportIata.toUpperCase()

  // Return from cache if still fresh
  if (flightsCache[airport] && Date.now() - flightsCache[airport].timestamp < CACHE_TTL_MS) {
    return flightsCache[airport]
  }

  const timestamp = Math.floor(Date.now() / 1000)

  // IMPORTANT:
  //  1. Use raw bracket syntax [] — URL-encoded %5B%5D triggers Cloudflare Managed Challenge
  //  2. Use curl as subprocess — Node.js TLS fingerprint (JA3/JA4) is flagged by Cloudflare
  const rawUrl = `https://api.flightradar224.com/common/v1/airport.json?code=${airport}&plugin[]=&plugin-setting[schedule][mode]=&plugin-setting[schedule][timestamp]=${timestamp}&page=1&limit=100&fleet=&token=`

  const stdout = await fetchViaCurl(rawUrl)
  const json = JSON.parse(stdout) as {
    result?: {
      response?: {
        airport?: {
          pluginData?: {
            schedule?: {
              departures?: { data?: FR24ScheduleItem[] }
              arrivals?: { data?: FR24ScheduleItem[] }
            }
          }
        }
      }
    }
  }

  const scheduleData = json?.result?.response?.airport?.pluginData?.schedule ?? {}
  const rawDepartures = scheduleData.departures?.data ?? []
  const rawArrivals = scheduleData.arrivals?.data ?? []

  const result: CachedData = {
    departures: rawDepartures.map((f) => mapFR24JsonFlight(f, true)),
    arrivals: rawArrivals.map((f) => mapFR24JsonFlight(f, false)),
    timestamp: Date.now(),
  }

  flightsCache[airport] = result
  return result
}

// ─── Main Route Handler ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'departures') as 'departures' | 'arrivals'
  const airport = searchParams.get('airport') || 'NVI'

  try {
    const data = await fetchAirportSchedules(airport)
    const flights = type === 'departures' ? data.departures : data.arrivals

    return NextResponse.json(
      {
        flights,
        count: flights.length,
        source: 'airport-json-api',
        type,
        airport: airport.toUpperCase(),
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Flights API] Error:', message)

    return NextResponse.json(
      {
        flights: [],
        count: 0,
        source: 'airport-json-api',
        error: `Ma'lumotlarni yuklashda xatolik yuz berdi: ${message}`,
      },
      {
        status: 200, // Return 200 so frontend shows "no flights" gracefully
        headers: { 'Cache-Control': 'no-cache' },
      },
    )
  }
}
