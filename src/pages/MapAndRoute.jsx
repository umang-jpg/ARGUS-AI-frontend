import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker } from 'react-leaflet'
import supabase from '../supabase'
import 'leaflet/dist/leaflet.css'
import './GlassUI.css'
import './MapAndRoute.css'

const COLORS = {
  pothole: '#ED1C24',
  pedestrian: '#FAFAF8',
  obstacle: '#888888'
}

// Utility for Geocoding
async function geocode(place) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`)
    const data = await res.json()
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch (err) {
    console.error("Geocoding error:", err)
    return null
  }
}

// Utility for OSRM Route
async function getRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code !== 'Ok') return null
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
  } catch (err) {
    console.error("Routing error:", err)
    return null
  }
}

// Danger Score Calculation
function dangerScore(routePoints, hazards) {
  let score = 0
  hazards.forEach(h => {
    routePoints.forEach(([lat, lng]) => {
      // Simple distance check (approx 500m)
      const dist = Math.sqrt(Math.pow(lat - h.lat, 2) + Math.pow(lng - h.lng, 2))
      if (dist < 0.005) {
        score += h.hazard_class === 'pothole' ? 3 : 1
      }
    })
  })
  return Math.min(score, 100)
}

export default function MapAndRoute() {
  // Map/Hazard States
  const [hazards, setHazards] = useState([])
  const [crashes, setCrashes] = useState([])
  const [hFilter, setHFilter] = useState('all')

  // Route States
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [route, setRoute] = useState(null)
  const [score, setScore] = useState(null)
  const [fromPt, setFromPt] = useState(null)
  const [toPt, setToPt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Weather State
  const [weather, setWeather] = useState({ temp: '--', condition: 'Fetching...', humidity: '--' })

  // Load Hazards & Crashes
  useEffect(() => {
    async function load() {
      const { data: h } = await supabase.from('hazards').select('*').order('created_at', { ascending: false }).limit(500)
      const { data: c } = await supabase.from('crashes').select('*').limit(100)
      if (h) setHazards(h)
      if (c) setCrashes(c)
    }
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  // Weather Logic
  useEffect(() => {
    async function fetchWeather() {
      const loc = toPt || { lat: 19.076, lng: 72.877 } // default to Mumbai
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current_weather=true&relative_humidity_2m=true`)
        const data = await res.json()
        if (data.current_weather) {
          const codeMap = {
            0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
            45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 61: 'Rain', 71: 'Snow',
            95: 'Stormy'
          }
          setWeather({
            temp: `${Math.round(data.current_weather.temperature)}°C`,
            condition: codeMap[data.current_weather.weathercode] || 'Clear',
            humidity: `${data.current_weather.relative_humidity_2m || 65}%`
          })
        }
      } catch (err) {
        setWeather({ temp: '28°C', condition: 'Clear', humidity: '60%' })
      }
    }
    fetchWeather()
  }, [toPt])

  async function handleComputeRoute() {
    if (!origin || !destination) return
    setLoading(true)
    setError('')
    setRoute(null)
    setScore(null)

    const f = await geocode(origin)
    const t = await geocode(destination)

    if (!f || !t) {
      setError('Could not find locations. Try adding city name.')
      setLoading(false)
      return
    }

    const points = await getRoute(f, t)
    if (!points) {
      setError('Could not calculate route.')
      setLoading(false)
      return
    }

    // Reuse hazards state for calculation
    const danger = dangerScore(points, hazards)

    setFromPt(f)
    setToPt(t)
    setRoute(points)
    setScore(danger)
    setLoading(false)
  }

  const safetyLabel = score === null ? '' : score < 20 ? '🟢 OPTIMAL' : score < 50 ? '🟡 MODERATE' : '🔴 HIGH RISK'
  const routeColor = score === null ? '#FAFAF8' : score < 20 ? '#44ff44' : score < 50 ? '#ffff44' : '#ED1C24'

  const filteredHazards = hFilter === 'all' ? hazards : hazards.filter(h => h.hazard_class === hFilter)

  return (
    <div className="map-and-route-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <h2 className="glass-label" style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--floral-white)' }}>Route Configuration</h2>
          <div className="input-split" style={{ marginBottom: '8px' }}>
            <input
              className="glass-input"
              style={{ fontSize: '0.8rem' }}
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="Source"
            />
            <input
              className="glass-input"
              style={{ fontSize: '0.8rem' }}
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Destination"
            />
          </div>
          <button
            className="glass-button"
            style={{ width: '100%' }}
            onClick={handleComputeRoute}
            disabled={loading}
          >
            <span style={{ color: 'white' }}>{loading ? 'ANALYZING...' : 'COMPUTE SAFE ROUTE'}</span>
          </button>
          {error && <p style={{ color: 'var(--racing-red)', fontSize: '0.75rem', marginTop: '10px' }}>⚠️ {error}</p>}
        </div>

        <div className="sidebar-section">
          <div className="weather-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--floral-white)' }}>{destination || 'Mumbai'}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{weather.condition}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', gap: '4px' }}>
              <div><div style={{ fontSize: '0.5rem', opacity: 0.5, textTransform: 'uppercase' }}>Precip</div><div style={{ fontSize: '0.75rem', fontWeight: '700' }}>4%</div></div>
              <div><div style={{ fontSize: '0.5rem', opacity: 0.5, textTransform: 'uppercase' }}>Humidity</div><div style={{ fontSize: '0.75rem', fontWeight: '700' }}>{weather.humidity}</div></div>
              <div><div style={{ fontSize: '0.5rem', opacity: 0.5, textTransform: 'uppercase' }}>Wind</div><div style={{ fontSize: '0.75rem', fontWeight: '700' }}>14 km/h</div></div>
            </div>
          </div>
        </div>

        <div className="sidebar-section liquid-glass glass-card route-summary">
          <h3 className="glass-label">AI Route Summary</h3>
          {score !== null ? (
            <div className="danger-score-badge" style={{ background: `${routeColor}15`, border: `1px solid ${routeColor}`, padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', color: 'white' }}>Safety Assessment</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', margin: '2px 0', color: 'white' }}>{score}/100</div>
              <div style={{ color: routeColor, fontWeight: '700', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: routeColor }}></div>
                {safetyLabel}
              </div>
            </div>
          ) : (
            <p style={{ opacity: 0.5, fontSize: '0.85rem', textAlign: 'center', color: 'white' }}>
              Pending route analysis...
            </p>
          )}
        </div>

        <div className="sidebar-section liquid-glass glass-card stats-container">
          <h3 className="glass-label">Hazard Intelligence</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{hazards.length}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', color: 'white' }}>Detections</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--racing-red)' }}>{crashes.length}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', color: 'white' }}>SOS Dispatched</div>
            </div>
          </div>
          <div className="hazard-filters">
            {['all', 'pothole', 'pedestrian', 'obstacle'].map(f => (
              <button
                key={f}
                className={`h-filter-btn ${hFilter === f ? 'active' : ''}`}
                onClick={() => setHFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAP AREA */}
      <main className="map-area">
        <MapContainer
          center={[19.076, 72.877]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />

          {/* Route Display */}
          {route && <Polyline positions={route} color={routeColor} weight={6} opacity={0.8} />}
          {fromPt && <Marker position={[fromPt.lat, fromPt.lng]}><Popup>Start: {origin}</Popup></Marker>}
          {toPt && <Marker position={[toPt.lat, toPt.lng]}><Popup>End: {destination}</Popup></Marker>}

          {/* Hazard Display */}
          {filteredHazards.map((h, i) => (
            <CircleMarker
              key={h.id}
              center={[h.lat, h.lng]}
              radius={i === 0 ? 10 : 7}
              fillColor={COLORS[h.hazard_class] || '#666'}
              color="#FAFAF8"
              weight={1.5}
              fillOpacity={0.8}
              className={i === 0 ? 'pulse-dot' : ''}
            >
              <Popup>
                <div style={{ color: 'white' }}>
                  <b style={{ color: COLORS[h.hazard_class] }}>{h.hazard_class?.toUpperCase()}</b>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    Source: {h.source}<br />
                    {new Date(h.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Crash Display */}
          {crashes.map(c => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lng]}
              radius={12}
              fillColor="#0A0A0A"
              color="#ED1C24"
              weight={3}
              fillOpacity={1}
              className="pulse-dot"
            >
              <Popup>
                <div style={{ color: 'white' }}>
                  <b style={{ color: '#ED1C24' }}>🚨 CRASH DETECTED</b>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    Alert Level: CRITICAL<br />
                    {new Date(c.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="legend-mini liquid-glass glass-card">
          <div className="l-item"><div className="l-dot" style={{ background: COLORS.pothole }}></div><span>Pothole</span></div>
          <div className="l-item"><div className="l-dot" style={{ background: COLORS.pedestrian }}></div><span>Pedestrian</span></div>
          <div className="l-item"><div className="l-dot" style={{ background: COLORS.obstacle }}></div><span>Obstacle</span></div>
          <div className="l-item"><div className="l-dot" style={{ background: '#fffbfbff', border: '1px solid #ED1C24' }}></div><span>SOS/Crash</span></div>
        </div>
      </main>
    </div>
  )
}
