import { NextRequest, NextResponse } from 'next/server'

/**
 * FR24 Website Internal API Proxy
 * Base URL: https://api.flightradar24.com/common/v1/airport.json
 * 
 * Bu API Flightradar24 ning o'zining web-saytida ishlatiladi 
 * Parvozlar jadvalini saytdagi bilan bir xil ko'rsatish uchun ishonchli (Free token muammosi yo'q)
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = (searchParams.get('type') || 'departures') as 'departures' | 'arrivals'
  let airport = searchParams.get('airport') || 'NVI'
  airport = airport.toLowerCase() // FR24 uses lowercase 'nvi'
  
  // Qat'iyroq kesh: URL har soniyada o'zgarib keshni buzuq qilmasligi uchn 5 daqiqaga yaxlitlaymiz
  const timestamp = Math.floor(Date.now() / 1000 / 300) * 300
  
  const targetUrl = new URL('https://api.flightradar24.com/common/v1/airport.json')
  targetUrl.searchParams.append('code', airport)
  targetUrl.searchParams.append('plugin[]', 'schedule')
  targetUrl.searchParams.append('plugin-setting[schedule][mode]', type)
  targetUrl.searchParams.append('plugin-setting[schedule][timestamp]', timestamp.toString())
  targetUrl.searchParams.append('limit', '40')
  targetUrl.searchParams.append('page', '1')

  try {
    const res = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.flightradar24.com',
        'Referer': `https://www.flightradar24.com/data/airports/${airport}`
      },
      next: { revalidate: 300, tags: ['flights'] } // Next.js strict 5-min server-side caching
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[FR24 Proxy] Error:', res.status, errText)
      return NextResponse.json({ error: 'Flightradar24 dan ma\'lumot olishda xato' }, { status: res.status })
    }

    const data = await res.json()
    
    // Safely extract schedule data
    const schedule = data?.result?.response?.airport?.pluginData?.schedule || {}
    const typeData = schedule[type] || {}
    const rawFlights = typeData.data || []

    const flights = rawFlights.map((item: any) => {
      const fl = item.flight || {}
      const ident = fl.identification || {}
      const airline = fl.airline || {}
      const apt = fl.airport || {}
      const time = fl.time || {}
      const status = fl.status || {}
      
      const destination = apt.destination || {}
      const origin = apt.origin || {}

      return {
        fr24_id: ident.id,
        flight: ident.number?.default,
        callsign: ident.callsign,
        operated_as: null, // Internal API sets this in airline
        painted_as: airline.code?.icao,
        type: fl.aircraft?.model?.code,
        reg: fl.aircraft?.registration,
        
        // IATA resolving
        orig_iata: type === 'departures' ? airport.toUpperCase() : origin.code?.iata,
        orig_icao: type === 'departures' ? '' : origin.code?.icao,
        orig_name: type === 'departures' ? '' : origin.name,
        
        dest_iata: type === 'arrivals' ? airport.toUpperCase() : destination.code?.iata,
        dest_icao: type === 'arrivals' ? '' : destination.code?.icao,
        dest_name: type === 'arrivals' ? '' : destination.name,
        
        // Web API returns timestamp in seconds
        scheduled_departure: time.scheduled?.departure,
        scheduled_arrival: time.scheduled?.arrival,
        actual_departure: time.real?.departure || time.estimated?.departure,
        actual_arrival: time.real?.arrival || time.estimated?.arrival,
        
        airline_name: airline.name,
        airline_iata: airline.code?.iata,
        
        status_text: status.text,
        status_color: status.generic?.status?.color,
        terminal: type === 'departures' ? apt.origin?.info?.terminal : apt.destination?.info?.terminal,
        gate: type === 'departures' ? apt.origin?.info?.gate : apt.destination?.info?.gate,
        baggage: apt.destination?.info?.baggage,
        
        source: 'fr24-web'
      }
    })

    return NextResponse.json({
      flights,
      count: flights.length,
      source: 'fr24-web',
      type,
      airport,
      timestamp: new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
    })

  } catch (err: any) {
    console.error('[FR24 Proxy] Network exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
