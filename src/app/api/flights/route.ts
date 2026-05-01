import { NextRequest, NextResponse } from 'next/server'

/**
 * Flight Data Proxy — FR24 Web API (primary) + AirLabs (fallback)
 *
 * 1. Avval Flightradar24 internal API ga urinib ko'radi (FR24_API_TOKEN bilan)
 * 2. FR24 403/Cloudflare qaytarsa → AirLabs Schedules API ga o'tadi
 * 3. Har ikkalasi ham bo'lmasa → bo'sh ma'lumot bilan aniq xato qaytaradi
 */

// ─── FR24 Internal Web API ───────────────────────────────────────────────────

async function fetchFR24(airport: string, type: 'departures' | 'arrivals', fr24Token?: string) {
  const timestamp = Math.floor(Date.now() / 1000 / 300) * 300

  const url = new URL('https://api.flightradar24.com/common/v1/airport.json')
  url.searchParams.append('code', airport.toLowerCase())
  url.searchParams.append('plugin[]', 'schedule')
  url.searchParams.append('plugin-setting[schedule][mode]', type)
  url.searchParams.append('plugin-setting[schedule][timestamp]', timestamp.toString())
  url.searchParams.append('limit', '40')
  url.searchParams.append('page', '1')

  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept: 'application/json, text/javascript, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    Origin: 'https://www.flightradar24.com',
    Referer: `https://www.flightradar24.com/data/airports/${airport.toLowerCase()}`,
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    // _frPl=1 → FR24 platform cookie, Cloudflare challenge'ni bypass qiladi
    Cookie: '_frPl=1',
  }

  if (fr24Token) {
    headers['Authorization'] = `Bearer ${fr24Token}`
  }


  const res = await fetch(url.toString(), {
    headers,
    cache: 'no-store', // FR24 blok bo'lsa fresh request bilan qayta urinish
  })

  if (!res.ok) {
    throw new Error(`FR24 HTTP ${res.status}`)
  }

  const data = await res.json()
  const schedule = data?.result?.response?.airport?.pluginData?.schedule || {}
  const typeData = schedule[type] || {}
  const rawFlights: any[] = typeData.data || []

  return rawFlights.map((item: any) => {
    const fl = item.flight || {}
    const ident = fl.identification || {}
    const airline = fl.airline || {}
    const owner = fl.owner || airline
    const apt = fl.airport || {}
    const time = fl.time || {}
    const status = fl.status || {}
    const destination = apt.destination || {}
    const origin = apt.origin || {}

    return {
      fr24_id: ident.id,
      flight: ident.number?.default,
      callsign: ident.callsign,
      painted_as: owner.code?.icao || airline.code?.icao || null,
      type: fl.aircraft?.model?.code,
      reg: fl.aircraft?.registration,

      orig_iata: type === 'departures' ? airport.toUpperCase() : origin.code?.iata,
      orig_icao: type === 'departures' ? '' : origin.code?.icao,
      orig_name: type === 'departures' ? '' : origin.name,

      dest_iata: type === 'arrivals' ? airport.toUpperCase() : destination.code?.iata,
      dest_icao: type === 'arrivals' ? '' : destination.code?.icao,
      dest_name: type === 'arrivals' ? '' : destination.name,

      scheduled_departure: time.scheduled?.departure,
      scheduled_arrival: time.scheduled?.arrival,
      actual_departure: time.real?.departure || time.estimated?.departure,
      actual_arrival: time.real?.arrival || time.estimated?.arrival,

      airline_name: owner.name || airline.name || null,
      airline_iata: owner.code?.iata || airline.code?.iata || null,

      status_text: status.text,
      status_color:
        status.generic?.status?.color || (status.icon === 'green' ? 'green' : null),
      terminal:
        type === 'departures'
          ? apt.origin?.info?.terminal
          : apt.destination?.info?.terminal,
      gate:
        type === 'departures' ? apt.origin?.info?.gate : apt.destination?.info?.gate,
      baggage: apt.destination?.info?.baggage,
      delayed: null,
      source: 'fr24-web',
    }
  })
}

// ─── AirLabs Schedules API ───────────────────────────────────────────────────

function mapAirlabsStatus(status?: string, delayed?: number): string {
  if (!status) return 'scheduled'
  const s = status.toLowerCase()
  if (s === 'cancelled' || s === 'cancel') return 'cancelled'
  if (s === 'diverted') return 'diverted'
  if (s === 'landed' || s === 'arrived') return 'arrived'
  if (s === 'boarding') return 'boarding'
  if (s === 'active' || s === 'en-route' || s === 'departed') return 'departed'
  if (delayed && delayed > 0) return 'delayed'
  return 'scheduled'
}

async function fetchAirlabs(airport: string, type: 'departures' | 'arrivals', apiKey: string) {
  const iataParam = type === 'departures' ? 'dep_iata' : 'arr_iata'
  const url = new URL('https://airlabs.co/api/v9/schedules')
  url.searchParams.set(iataParam, airport.toUpperCase())
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`AirLabs HTTP ${res.status}`)

  const data = await res.json()
  if (data?.error) throw new Error(data.error?.message || 'AirLabs API error')

  const rawFlights: any[] = data?.response || []

  return rawFlights.map((fl: any) => {
    const delayed = fl.delayed || fl.dep_delayed || fl.arr_delayed || 0
    const statusMapped = mapAirlabsStatus(fl.status, delayed)
    const isLive = statusMapped === 'boarding' || statusMapped === 'departed'
    const schedDepTs = fl.dep_time_ts ?? null
    const schedArrTs = fl.arr_time_ts ?? null
    const actualDepTs = fl.dep_actual_ts ?? fl.dep_estimated_ts ?? schedDepTs
    const actualArrTs = fl.arr_actual_ts ?? fl.arr_estimated_ts ?? schedArrTs

    return {
      fr24_id: fl.flight_iata || fl.flight_icao || null,
      flight: fl.flight_iata || fl.flight_icao || '',
      callsign: fl.flight_icao || null,
      painted_as: fl.airline_icao || null,
      type: null,
      reg: null,

      orig_iata: fl.dep_iata || '',
      orig_icao: fl.dep_icao || '',
      orig_name: null,

      dest_iata: fl.arr_iata || '',
      dest_icao: fl.arr_icao || '',
      dest_name: null,

      scheduled_departure: schedDepTs,
      scheduled_arrival: schedArrTs,
      actual_departure: actualDepTs,
      actual_arrival: actualArrTs,

      airline_name: null,
      airline_iata: fl.airline_iata || '',

      status_text: fl.status || null,
      status_color: isLive ? 'green' : null,
      terminal: type === 'departures' ? fl.dep_terminal || null : fl.arr_terminal || null,
      gate: type === 'departures' ? fl.dep_gate || null : fl.arr_gate || null,
      baggage: fl.arr_baggage || null,
      delayed: delayed || null,
      source: 'airlabs',
    }
  })
}

// ─── Main Route Handler ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'departures') as 'departures' | 'arrivals'
  const airport = searchParams.get('airport') || 'NVI'

  const fr24Token = process.env.FR24_API_TOKEN
  const airlabsKey =
    process.env.AIRLABS_API_KEY || process.env.NEXT_PUBLIC_AIRLABS_API_KEY

  let flights: any[] = []
  let source = 'unknown'
  let lastError = ''

  // ── 1. FR24 Internal API (primary) ──────────────────────────────────────
  try {
    flights = await fetchFR24(airport, type, fr24Token)
    source = 'fr24-web'
  } catch (err: any) {
    lastError = err.message || 'FR24 error'
    console.warn(`[Flights] FR24 failed (${lastError}), trying AirLabs...`)

    // ── 2. AirLabs Schedules API (fallback) ─────────────────────────────
    if (airlabsKey) {
      try {
        flights = await fetchAirlabs(airport, type, airlabsKey)
        source = 'airlabs'
        lastError = ''
      } catch (err2: any) {
        lastError = err2.message || 'AirLabs error'
        console.error(`[Flights] AirLabs also failed: ${lastError}`)
      }
    }
  }

  // ── 3. Har ikki API ham muvaffaqiyatsiz ─────────────────────────────────
  if (lastError && flights.length === 0) {
    return NextResponse.json(
      { error: `Parvoz ma'lumotlari yuklanmadi: ${lastError}` },
      { status: 503 },
    )
  }

  return NextResponse.json(
    {
      flights,
      count: flights.length,
      source,
      type,
      airport: airport.toUpperCase(),
      timestamp: new Date().toISOString(),
    },
    {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
    },
  )
}
