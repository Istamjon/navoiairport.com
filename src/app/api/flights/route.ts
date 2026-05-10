import { NextRequest, NextResponse } from 'next/server'

/**
 * Flight Data API — FlightRadar24 Airport JSON API (Schedule & Status)
 *
 * Bu endpoint orqali aeroportning to'liq jadvali (Bugun va Ertaga) olinadi.
 * Radar ma'lumotlariga qaraganda ancha kengroq (Reys raqami, Status, Aviakompaniya).
 */

// ─── In-memory cache ──────────────────────────────────────────────────────────
interface CachedData {
  departures: any[]
  arrivals: any[]
  timestamp: number
}

let flightsCache: Record<string, CachedData> = {}
const CACHE_TTL_MS = 60_000 // 60 seconds

// ─────────────────────────────────────────────
// Map FR24 JSON to our internal format
// ─────────────────────────────────────────────
function mapFR24JsonFlight(f: any, isDeparture: boolean) {
  const flight = f.flight || {}
  const airport = flight.airport || {}
  const time = flight.time || {}
  const airline = flight.airline || {}
  const status = flight.status || {}

  const origin = airport.origin || {}
  const destination = airport.destination || {}

  const scheduledTime = isDeparture ? time.scheduled?.departure : time.scheduled?.arrival
  const actualTime = isDeparture ? (time.real?.departure || time.estimated?.departure) : (time.real?.arrival || time.estimated?.arrival)

  return {
    fr24_id: flight.identification?.row || Math.random().toString(),
    flight: flight.identification?.number?.default || 'N/A',
    callsign: flight.identification?.callsign || null,
    type: flight.aircraft?.model?.code || null,
    reg: flight.aircraft?.registration || null,

    orig_iata: origin.code?.iata || null,
    orig_name: origin.name || null,
    orig_lat: origin.position?.latitude || null,
    orig_lon: origin.position?.longitude || null,

    dest_iata: destination.code?.iata || null,
    dest_name: destination.name || null,
    dest_lat: destination.position?.latitude || null,
    dest_lon: destination.position?.longitude || null,

    scheduled_departure: time.scheduled?.departure || null,
    scheduled_arrival: time.scheduled?.arrival || null,
    actual_departure: time.real?.departure || time.estimated?.departure || null,
    actual_arrival: time.real?.arrival || time.estimated?.arrival || null,

    airline_name: airline.name || null,
    airline_iata: airline.code?.iata || null,

    status_text: status.text || 'Scheduled',
    status_color: status.generic?.status?.color || null,
    terminal: (isDeparture ? origin.info?.terminal : destination.info?.terminal) || null,
    gate: (isDeparture ? origin.info?.gate : destination.info?.gate) || null,
    baggage: destination.info?.baggage || null,

    // Coordinates for the map (if available in JSON)
    latitude: flight.aircraft?.position?.latitude || null,
    longitude: flight.aircraft?.position?.longitude || null,
    
    timestamp: scheduledTime || Math.floor(Date.now() / 1000),
    source: 'airport-json-api',
  }
}

// ─── Fetch flights from FlightRadar24 API ─────────────────────────────────────
async function fetchAirportSchedules(airportIata: string): Promise<CachedData> {
  const airport = airportIata.toUpperCase()
  
  // Check cache
  if (flightsCache[airport] && Date.now() - flightsCache[airport].timestamp < CACHE_TTL_MS) {
    return flightsCache[airport]
  }

  const timestamp = Math.floor(Date.now() / 1000)
  // IMPORTANT: Must use raw bracket syntax in URL (not URL-encoded) - Cloudflare checks this
  // Also: Node.js TLS fingerprint is flagged by Cloudflare, so we use curl as a child process
  const rawUrl = `https://api.flightradar24.com/common/v1/airport.json?code=${airport}&plugin[]=&plugin-setting[schedule][mode]=&plugin-setting[schedule][timestamp]=${timestamp}&page=1&limit=100&fleet=&token=`

  const { execFile } = await import('child_process')
  const { promisify } = await import('util')
  const execFileAsync = promisify(execFile)

  const curlArgs = [
    '-g',           // disable globbing (allows [] in URLs)
    '-s',           // silent
    '--max-time', '15',
    '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    '-H', 'Accept: application/json, text/plain, */*',
    '-H', 'Accept-Language: en-US,en;q=0.9',
    '-H', 'Referer: https://www.flightradar24.com/',
    '-H', 'Origin: https://www.flightradar24.com',
    rawUrl,
  ]

  const { stdout } = await execFileAsync('curl', curlArgs, { maxBuffer: 10 * 1024 * 1024 })
  const json = JSON.parse(stdout)
  const scheduleData = json?.result?.response?.airport?.pluginData?.schedule || {}
  
  const rawDepartures = scheduleData.departures?.data || []
  const rawArrivals = scheduleData.arrivals?.data || []

  const result: CachedData = {
    departures: rawDepartures.map((f: any) => mapFR24JsonFlight(f, true)),
    arrivals: rawArrivals.map((f: any) => mapFR24JsonFlight(f, false)),
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
  } catch (err: any) {
    console.error('[Flights API] Error:', err.message || err)

    return NextResponse.json(
      {
        flights: [],
        count: 0,
        source: 'airport-json-api',
        error: `Ma'lumotlarni yuklashda xatolik yuz berdi: ${err.message || 'Unknown error'}`,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-cache' },
      },
    )
  }
}
