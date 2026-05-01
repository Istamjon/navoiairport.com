
async function testFetch(airport, type) {
  const timestamp = Math.floor(Date.now() / 1000 / 300) * 300;
  const targetUrl = `https://api.flightradar24.com/common/v1/airport.json?code=${airport}&plugin[]=schedule&plugin-setting[schedule][mode]=${type}&plugin-setting[schedule][timestamp]=${timestamp}&limit=40&page=1`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.flightradar24.com',
        'Referer': `https://www.flightradar24.com/data/airports/${airport}`
      }
    });

    const data = await res.json();
    const schedule = data?.result?.response?.airport?.pluginData?.schedule || {};
    const typeData = schedule[type] || {};
    const rawFlights = typeData.data || [];

    console.log(`\n--- ${airport.toUpperCase()} ${type.toUpperCase()} (${rawFlights.length} flights) ---`);
    
    rawFlights.slice(0, 10).forEach((item, i) => {
      const fl = item.flight || {};
      const ident = fl.identification || {};
      const status = fl.status || {};
      console.log(`[${i}] Reys: ${ident.number?.default || '???'}, Status: "${status.text}", Color: ${status.generic?.status?.color}`);
    });

  } catch (err) {
    console.error('Error:', err);
  }
}

async function run() {
  await testFetch('nvi', 'departures');
  await testFetch('nvi', 'arrivals');
  await testFetch('tas', 'arrivals');
}

run();
