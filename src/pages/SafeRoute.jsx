import { useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import supabase from '../supabase'
import Navbar from '../components/Navbar'
import 'leaflet/dist/leaflet.css'
import './GlassUI.css'

async function geocode(place) {
  const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`)
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

async function getRoute(from, to) {
  const url  = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
  const res  = await fetch(url)
  const data = await res.json()
  if (data.code !== 'Ok') return null
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
}

function dangerScore(routePoints, hazards) {
  let score = 0
  hazards.forEach(h => {
    routePoints.forEach(([lat, lng]) => {
      const dist = Math.sqrt(Math.pow(lat - h.lat, 2) + Math.pow(lng - h.lng, 2))
      if (dist < 0.005) score += h.hazard_class === 'pothole' ? 3 : 1
    })
  })
  return Math.min(score, 100)
}

export default function SafeRoute() {
  const [from,    setFrom]    = useState('')
  const [to,      setTo]      = useState('')
  const [route,   setRoute]   = useState(null)
  const [score,   setScore]   = useState(null)
  const [fromPt,  setFromPt]  = useState(null)
  const [toPt,    setToPt]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function calculate() {
    setLoading(true)
    setError('')
    setRoute(null)
    setScore(null)

    const f = await geocode(from)
    const t = await geocode(to)
    if (!f || !t) { setError('Could not find locations. Try adding city name.'); setLoading(false); return }

    const points = await getRoute(f, t)
    if (!points) { setError('Could not calculate route.'); setLoading(false); return }

    const { data: hazards } = await supabase.from('hazards').select('lat, lng, hazard_class')
    const danger = dangerScore(points, hazards || [])

    setFromPt(f)
    setToPt(t)
    setRoute(points)
    setScore(danger)
    setLoading(false)
  }

  const safetyLabel = score === null ? '' : score < 20 ? '🟢 OPTIMAL ROUTE' : score < 50 ? '🟡 MODERATE RISK' : '🔴 HIGH RISK ADVISORY'
  const routeColor  = score === null ? '#FAFAF8' : score < 20 ? '#44ff44' : score < 50 ? '#ffff44' : '#ED1C24'
  const center      = fromPt ? [fromPt.lat, fromPt.lng] : [19.076, 72.877]

  return (
    <div className="page-bg-overlay pt-24 px-4 md:px-8">
      <Navbar />
      <div className="max-w-5xl mx-auto">
        <div className="liquid-glass glass-card shimmer mb-8">
          <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '3px' }}>SafeRoute AI</h2>
          <p style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '5px' }}>Neural routing powered by crowd-sourced hazard telemetry.</p>

          <div style={{ display: 'flex', gap: '15px', marginTop: '25px', flexWrap: 'wrap' }}>
            <input 
              className="glass-input"
              value={from} 
              onChange={e => setFrom(e.target.value)}
              placeholder="Origin (e.g. Panvel, Mumbai)"
              style={{ flex: 2, minWidth: '250px' }} 
            />
            <input 
              className="glass-input"
              value={to} 
              onChange={e => setTo(e.target.value)}
              placeholder="Destination (e.g. Thane, Mumbai)"
              style={{ flex: 2, minWidth: '250px' }} 
            />
            <button 
              className="glass-button"
              onClick={calculate} 
              disabled={loading || !from || !to}
              style={{ flex: 1, minWidth: '180px' }}
            >
              {loading ? 'ANALYZING...' : 'COMPUTE SAFE ROUTE'}
            </button>
          </div>
          
          {error && <p style={{ color: 'var(--racing-red)', fontSize: '0.85rem', marginTop: '15px', fontWeight: 'bold' }}>⚠️ {error}</p>}
        </div>


        {score !== null && (
          <div className="liquid-glass glass-card border-l-[6px] mb-8" style={{ borderLeftColor: routeColor }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-[0.7rem] uppercase opacity-60 tracking-wider">Safety Assessment</div>
                <b className="text-xl md:text-2xl font-headline">DANGER SCORE: {score}/100</b>
              </div>
              <div className="sm:text-right">
                <b className="text-lg md:text-xl block mb-1" style={{ color: routeColor }}>{safetyLabel}</b>
                <div className="text-[0.7rem] opacity-60">Based on live device detections</div>
              </div>
            </div>
          </div>
        )}

        <div className="liquid-glass rounded-[20px] overflow-hidden border border-floral-white/10" style={{ height: '550px', width: '100%' }}>
          <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {route   && <Polyline positions={route} color={routeColor} weight={6} opacity={0.9} />}
            {fromPt  && <Marker position={[fromPt.lat, fromPt.lng]}><Popup>Start: {from}</Popup></Marker>}
            {toPt    && <Marker position={[toPt.lat,  toPt.lng]}  ><Popup>End: {to}</Popup></Marker>}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
